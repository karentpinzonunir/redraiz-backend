import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
    const { data, error } = await supabase
        .from("historias")
        .select(`
      id,
      titulo,
      fecha,
      autor,
      imagen,
      resumen,
      contenido,
      destacada,
      categorias (
        id,
        nombre
      )
    `)
        .eq("destacada", true)
        .limit(1)
        .single();

    if (error) {
        return NextResponse.json(
            {
                ok: false,
                error: "No se encontró una historia destacada.",
            },
            { status: 404 }
        );
    }

    return NextResponse.json({
        ok: true,
        data,
    });
}