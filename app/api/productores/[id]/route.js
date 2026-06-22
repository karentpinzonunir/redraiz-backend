import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    const { id } = params;

    // Validar que el ID sea un número
    if (!id || isNaN(id)) {
        return NextResponse.json(
            { ok: false, error: 'ID de productor inválido' },
            { status: 400 }
        );
    }

    const { data, error } = await supabase
        .from('productores')
        .select(`
      *,
      region:regiones (
        id,
        nombre
      ),
      categoria:categorias (
        id,
        nombre
      )
    `)
        .eq('id', id)
        .eq('estado', true)
        .single(); // Usamos .single() porque esperamos solo un resultado

    if (error) {
        return NextResponse.json(
            { ok: false, error: error.message },
            { status: 500 }
        );
    }

    if (!data) {
        return NextResponse.json(
            { ok: false, error: 'Productor no encontrado' },
            { status: 404 }
        );
    }

    return NextResponse.json({ ok: true, data });
}