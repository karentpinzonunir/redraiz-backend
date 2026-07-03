import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

const COOLDOWN_MINUTOS = 10;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ ok: false, error: 'Body inválido' }, { status: 400 });
  }

  const { nombre, email } = body;

  // Validar campos requeridos
  if (!nombre?.trim() || !email?.trim()) {
    return NextResponse.json(
      { ok: false, error: 'Por favor completa ambos campos.' },
      { status: 400 }
    );
  }

  // Validar formato de correo
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { ok: false, error: 'Ingresa un correo válido.' },
      { status: 400 }
    );
  }

  const emailNormalizado = email.trim().toLowerCase();
  const nombreNormalizado = nombre.trim();

  // Buscar si el correo ya existe
  const { data: suscriptorExistente, error: errorBusqueda } = await supabase
    .from('suscriptores')
    .select('*')
    .eq('email', emailNormalizado)
    .maybeSingle();

  if (errorBusqueda) {
    return NextResponse.json({ ok: false, error: errorBusqueda.message }, { status: 500 });
  }

  // Si ya existe, validar el cooldown de 10 minutos
  if (suscriptorExistente) {
    const ultimaSuscripcion = suscriptorExistente.ultima_suscripcion
      ? new Date(suscriptorExistente.ultima_suscripcion)
      : null;

    if (ultimaSuscripcion) {
      const ahora = new Date();
      const diferenciaMs = ahora.getTime() - ultimaSuscripcion.getTime();
      const diferenciaMinutos = diferenciaMs / (1000 * 60);

      if (diferenciaMinutos < COOLDOWN_MINUTOS) {
        const minutosRestantes = Math.ceil(COOLDOWN_MINUTOS - diferenciaMinutos);
        return NextResponse.json(
          {
            ok: false,
            codigo: 'espera_requerida',
            error: `Ya estás suscrito. Para volver a intentarlo debes esperar ${minutosRestantes} minuto(s).`,
            minutos_restantes: minutosRestantes,
          },
          { status: 429 }
        );
      }
    }

    // Ya pasaron los 10 minutos, actualizar registro
    const { data, error: errorActualizacion } = await supabase
      .from('suscriptores')
      .update({
        nombre: nombreNormalizado,
        estado: true,
        ultima_suscripcion: new Date().toISOString(),
      })
      .eq('email', emailNormalizado)
      .select('*')
      .single();

    if (errorActualizacion) {
      return NextResponse.json({ ok: false, error: errorActualizacion.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        ok: true,
        codigo: 'actualizado',
        mensaje: '¡Gracias por volver! Tu suscripción ha sido actualizada.',
        data,
      },
      { status: 200 }
    );
  }

  // Si no existe, crear nuevo suscriptor
  const { data, error: errorInsercion } = await supabase
    .from('suscriptores')
    .insert({
      nombre: nombreNormalizado,
      email: emailNormalizado,
      estado: true,
      ultima_suscripcion: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (errorInsercion) {
    return NextResponse.json({ ok: false, error: errorInsercion.message }, { status: 400 });
  }

  return NextResponse.json(
    {
      ok: true,
      codigo: 'creado',
      mensaje: '¡Gracias por unirte a nuestra comunidad!',
      data,
    },
    { status: 201 }
  );
}