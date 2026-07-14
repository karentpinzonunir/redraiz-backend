import { supabase } from "@/lib/supabase";
import { idParamSchema } from "@/lib/schemas/common";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    const { id } = await params;

    const validation = idParamSchema.safeParse({ id });

    if (!validation.success) {
        return NextResponse.json(
            { ok: false, error: validation.error.issues[0].message },
            { status: 400 }
        );
    }

    const { id: productorId } = validation.data;

    const { data: productor, error: errorProductor } = await supabase
        .from("productores")
        .select(`
      *,
      region:regiones (id, nombre),
      categoria:categorias (id, nombre)
    `)
        .eq("id", productorId)
        .eq("estado", true)
        .single();

    if (errorProductor) {
        return NextResponse.json(
            { ok: false, error: errorProductor.message },
            { status: 500 }
        );
    }

    if (!productor) {
        return NextResponse.json(
            { ok: false, error: "Productor no encontrado" },
            { status: 404 }
        );
    }

    const { data: relaciones, error: errorRelaciones } = await supabase
        .from("productor_productos")
        .select(`
      id_producto,
      precio,
      region:regiones (id, nombre)
    `)
        .eq("id_productor", productorId)
        .eq("estado", true);

    if (errorRelaciones) {
        return NextResponse.json(
            { ok: false, error: errorRelaciones.message },
            { status: 500 }
        );
    }

    const productoIds = relaciones.map((rel) => rel.id_producto);

    let productos = [];

    if (productoIds.length > 0) {
        const { data, error: errorProductos } = await supabase
            .from("productos")
            .select(`
        *,
        categoria:categorias (id, nombre)
      `)
            .in("id", productoIds)
            .eq("estado", true);

        if (errorProductos) {
            return NextResponse.json(
                { ok: false, error: errorProductos.message },
                { status: 500 }
            );
        }

        productos = data.map((producto) => {
            const relacion = relaciones.find((r) => r.id_producto === producto.id);
            return {
                ...producto,
                precio: relacion?.precio || null,
                region: relacion?.region || null,
                categoria: producto.categoria,
            };
        });
    }

    const { data: galeria, error: errorGaleria } = await supabase
        .from("galerias_productor")
        .select("imagen")
        .eq("id_productor", productorId)
        .eq("estado", true);

    if (errorGaleria) {
        return NextResponse.json(
            { ok: false, error: errorGaleria.message },
            { status: 500 }
        );
    }

    return NextResponse.json({
        ok: true,
        data: {
            ...productor,
            productos,
            galeria: galeria.map((item) => item.imagen),
        },
    });
}