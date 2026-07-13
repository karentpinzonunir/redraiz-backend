import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get('limit');

    let query = supabase
        .from('historias')
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
        .order('fecha', { ascending: false });

    if (limit) {
        query = query.limit(Number(limit));
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json(
            { ok: false, error: error.message },
            { status: 500 }
        );
    }

    const historiasFormateadas = data.map((historia: any) => ({
        ...historia,
        categoria_nombre: historia.categorias?.nombre || 'Sin categoría'
    }));

    return NextResponse.json({
        ok: true,
        data: historiasFormateadas
    });
}