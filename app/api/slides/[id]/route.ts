import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Validar que el ID sea numérico
    if (!id || isNaN(Number(id))) {
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
        .single();

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