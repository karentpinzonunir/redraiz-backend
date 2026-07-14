import { supabase } from "@/lib/supabase";
import { idParamSchema } from "@/lib/schemas/common";
import { comentarioSchema } from "@/lib/schemas/comentarios";
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
        .from("comentarios")
        .select("id, nombre, comentario, estado, id_historia")
        .eq("id_historia", validation.data.id)
        .eq("estado", true)
        .order("id", { ascending: false });

    if (error) {
        return NextResponse.json(
            { ok: false, error: error.message },
            { status: 500 }
        );
    }

    return NextResponse.json({ ok: true, data });
}

export async function POST(req, { params }) {
    const { id } = await params;

    const paramValidation = idParamSchema.safeParse({ id });

    if (!paramValidation.success) {
        return NextResponse.json(
            { ok: false, error: paramValidation.error.issues[0].message },
            { status: 400 }
        );
    }

    const body = await req.json().catch(() => null);

    if (!body) {
        return NextResponse.json(
            { ok: false, error: "Body inválido" },
            { status: 400 }
        );
    }

    const validation = comentarioSchema.safeParse(body);

    if (!validation.success) {
        return NextResponse.json(
            {
                ok: false,
                error: validation.error.issues[0].message,
                errors: validation.error.flatten(),
            },
            { status: 400 }
        );
    }

    const { nombre, comentario } = validation.data;

    const { data, error } = await supabase
        .from("comentarios")
        .insert({
            id_historia: paramValidation.data.id,
            nombre,
            comentario,
            estado: false,
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json(
            { ok: false, error: error.message },
            { status: 500 }
        );
    }

    return NextResponse.json({ ok: true, data }, { status: 201 });
}