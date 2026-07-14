import { supabase } from "@/lib/supabase";
import { productorProductosQuerySchema } from "@/lib/schemas/productor_productos";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);

        const validation = productorProductosQuerySchema.safeParse({
            limit: searchParams.get("limit") ?? undefined,
            offset: searchParams.get("offset") ?? undefined,
            region: searchParams.get("region") ?? undefined,
            productor: searchParams.get("productor") ?? undefined,
            producto: searchParams.get("producto") ?? undefined,
            categoria: searchParams.get("categoria") ?? undefined,
        });

        if (!validation.success) {
            return NextResponse.json(
                { ok: false, error: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const { limit, offset, region, productor, producto, categoria } = validation.data;

        let query = supabase
            .from("productor_productos")
            .select("*")
            .eq("estado", true);

        if (region) query = query.eq("id_region", region);
        if (productor) query = query.eq("id_productor", productor);
        if (producto) query = query.eq("id_producto", producto);

        const { data: rows, error: rowsError } = await query.range(offset, offset + limit - 1);

        if (rowsError) {
            return NextResponse.json(
                { ok: false, error: rowsError.message },
                { status: 500 }
            );
        }

        if (!rows || rows.length === 0) {
            return NextResponse.json({ ok: true, data: [], count: 0, limit, offset });
        }

        const productoIds = [...new Set(rows.map((r) => r.id_producto))].filter(Boolean);
        const productorIds = [...new Set(rows.map((r) => r.id_productor))].filter(Boolean);
        const regionIds = [...new Set(rows.map((r) => r.id_region))].filter(Boolean);

        const [productosRes, productoresRes, regionesRes] = await Promise.all([
            supabase.from("productos").select("id, nombre, descripcion, id_categoria, imagen, estado").in("id", productoIds),
            supabase.from("productores").select("id, nombre, descripcion, historia, imagen, latitud, longitud, estado, carpeta, telefono, id_region, id_categoria").in("id", productorIds),
            supabase.from("regiones").select("id, nombre").in("id", regionIds)
        ]);

        const productosMap = new Map();
        (productosRes.data || []).forEach((p) => productosMap.set(Number(p.id), p));

        const productoresMap = new Map();
        (productoresRes.data || []).forEach((p) => productoresMap.set(Number(p.id), p));

        const regionesMap = new Map();
        (regionesRes.data || []).forEach((r) => regionesMap.set(Number(r.id), r));

        const catIds = [...new Set((productosRes.data || []).map((p) => p.id_categoria))].filter(Boolean);
        const { data: categoriasData } = await supabase.from("categorias").select("id, nombre").in("id", catIds);

        const categoriasMap = new Map();
        (categoriasData || []).forEach((c) => categoriasMap.set(Number(c.id), c));

        const result = rows
            .map((row) => {
                const prod = productosMap.get(Number(row.id_producto)) || null;
                const cat = prod ? categoriasMap.get(Number(prod.id_categoria)) || null : null;
                const prtr = productoresMap.get(Number(row.id_productor)) || null;

                return {
                    id: row.id,
                    precio: row.precio,
                    estado: row.estado,
                    id_producto: row.id_producto,
                    id_productor: row.id_productor,
                    id_region: row.id_region,
                    producto: prod,
                    categoria: cat,
                    region: regionesMap.get(Number(row.id_region)) || null,
                    productor: prtr ? { ...prtr } : null,
                };
            })
            .filter((item) => {
                if (!item.producto) return false;
                if (categoria) {
                    if (!item.categoria || item.categoria.id !== categoria) return false;
                }
                return true;
            });

        return NextResponse.json({ ok: true, data: result, count: result.length, limit, offset });

    } catch (err) {
        return NextResponse.json(
            { ok: false, error: err.message || String(err) },
            { status: 500 }
        );
    }
}