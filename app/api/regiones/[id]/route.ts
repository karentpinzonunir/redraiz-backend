import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;

    const { data, error } = await supabase
        .from('region')
        .select('id, nombre')
        .eq('id', id)
        .single(); // Trae solo un objeto en lugar de un array

    if (error) {
        return NextResponse.json(
            { ok: false, error: "Región no encontrada" },
            { status: 404 }
        );
    }

    return NextResponse.json({ ok: true, data });
}