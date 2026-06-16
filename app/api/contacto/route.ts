import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ ok: false, error: 'Body inválido' }, { status: 400 });
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
  } = body;

  // Campos requeridos según el formulario
  if (!nombre || !ciudad || !telefono || !correo || !tipo_producto || !historia) {
    return NextResponse.json(
      { ok: false, error: 'Faltan campos requeridos' },
      { status: 400 }
    );
  }

  // Validación de formato de correo
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(correo)) {
    return NextResponse.json(
      { ok: false, error: 'El correo electrónico no es válido' },
      { status: 400 }
    );
  }

  const tipoProductoAsNumber =
    typeof tipo_producto === 'string' ? Number(tipo_producto) : tipo_producto;

  if (!Number.isFinite(tipoProductoAsNumber)) {
    return NextResponse.json(
      { ok: false, error: '`tipo_producto` debe ser numérico' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('contacto')
    .insert({
      nombre,
      apellido: apellido ?? null,       // opcional
      nombre_finca: nombre_finca ?? null, // opcional
      ciudad,
      telefono,
      correo,
      tipo_producto: tipoProductoAsNumber,
      historia,
    })
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, data }, { status: 201 });
}