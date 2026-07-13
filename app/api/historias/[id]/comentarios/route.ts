import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data, error } = await supabase
    .from('comentarios')
    .select('id, nombre, comentario, estado, id_historia')
    .eq('id_historia', id)
    .eq('estado', true)
    .order('id', { ascending: false });

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, data });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const body = await req.json();
  const { nombre, comentario } = body;

  if (!comentario?.trim()) {
    return NextResponse.json(
      { ok: false, error: 'El comentario es requerido.' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('comentarios')
    .insert({
      id_historia: Number(id),
      nombre: nombre?.trim() || 'Anónimo',
      comentario: comentario.trim(),
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