import { supabase } from "@/lib/supabase";
import { contactoSchema } from "@/lib/schemas/contacto";
import { NextResponse } from "next/server";

export async function POST(req) {
    const body = await req.json().catch(() => null);

    if (!body) {
        return NextResponse.json(
            { ok: false, error: "Body inválido" },
            { status: 400 }
        );
    }

    const validation = contactoSchema.safeParse(body);

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

    const {
        nombre,
        apellido,
        nombre_finca,
        ciudad,
        telefono,
        correo,
        tipo_producto,
        historia,
    } = validation.data;

    const { data, error } = await supabase
        .from("contacto")
        .insert({
            nombre,
            apellido: apellido ?? null,
            nombre_finca: nombre_finca ?? null,
            ciudad,
            telefono,
            correo,
            tipo_producto,
            historia,
        })
        .select("*")
        .single();

    if (error) {
        return NextResponse.json(
            { ok: false, error: error.message },
            { status: 400 }
        );
    }

    return NextResponse.json({ ok: true, data }, { status: 201 });
}