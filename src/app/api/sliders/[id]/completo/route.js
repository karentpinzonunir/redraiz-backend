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

    const { data, error } = await supabase
        .from("sliders")
        .select(`
      *,
      slides!inner (
        *,
        categoria:categorias (id, nombre)
      )
    `)
        .eq("id", validation.data.id)
        .eq("slides.estado", true)
        .order("orden", { referencedTable: "slides", ascending: true })
        .single();

    if (error) {
        return NextResponse.json(
            { ok: false, error: error.message },
            { status: 404 }
        );
    }

    return NextResponse.json({ ok: true, data });
}