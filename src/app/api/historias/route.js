import { supabase } from "@/lib/supabase";
import { historiasQuerySchema } from "@/lib/schemas/historias";
import { NextResponse } from "next/server";

export async function GET(req) {
    const { searchParams } = new URL(req.url);

    const validation = historiasQuerySchema.safeParse({
        limit: searchParams.get("limit") ?? undefined,
    });

    if (!validation.success) {
        return NextResponse.json(
            { ok: false, error: validation.error.issues[0].message },
            { status: 400 }
        );
    }

    const { limit } = validation.data;

    let query = supabase
        .from("historias")
        .select(`
      id,
      titulo,
      fecha,
      autor,
      imagen,
      resumen,
      contenido,
      id_categoria,
      categorias (
        nombre
      )
    `)
        .order("fecha", { ascending: false });

    if (limit) {
        query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json(
            { ok: false, error: error.message },
            { status: 500 }
        );
    }

    const historiasFormateadas = data.map((historia) => ({
        ...historia,
        categoria_nombre: historia.categorias?.nombre || "Sin categoría",
    }));

    return NextResponse.json({ ok: true, data: historiasFormateadas });
}