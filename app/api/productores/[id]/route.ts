import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Obtener productor con región y categoría
  const { data: productor, error: errorProductor } = await supabase
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

  if (errorProductor) {
    console.error("Error al obtener productor:", errorProductor);
    return NextResponse.json(
      { ok: false, error: errorProductor.message },
      { status: 500 }
    );
  }

  if (!productor) {
    return NextResponse.json(
      { ok: false, error: 'Productor no encontrado' },
      { status: 404 }
    );
  }

  // Obtener productos del productor
  const { data: relaciones, error: errorRelaciones } = await supabase
    .from('productor_productos')
    .select('id_producto, precio')
    .eq('id_productor', id)
    .eq('estado', true);

  if (errorRelaciones) {
    console.error("Error al obtener productos del productor:", errorRelaciones);
    return NextResponse.json(
      { ok: false, error: errorRelaciones.message },
      { status: 500 }
    );
  }

  const productoIds = relaciones.map(rel => rel.id_producto);

  // ...

  let productos = [];
  if (productoIds.length > 0) {
    const { data, error: errorProductos } = await supabase
      .from('productos')
      .select(`
      *,
      categoria:categorias (id, nombre),
      region:regiones (id, nombre)
    `)
      .in('id', productoIds)
      .eq('estado', true);

    if (errorProductos) {
      console.error("Error al obtener detalles de productos:", errorProductos);
      return NextResponse.json(
        { ok: false, error: errorProductos.message },
        { status: 500 }
      );
    }

    // Combinar precios
    productos = data.map(producto => {
      const relacion = relaciones.find(r => r.id_producto === producto.id);
      return {
        ...producto,
        precio: relacion ? relacion.precio : null
      };
    });
  }

  // Obtener imágenes de galería
  const { data: galeria, error: errorGaleria } = await supabase
    .from('galerias_productor')
    .select('imagen')
    .eq('id_productor', id)
    .eq('estado', true);

  if (errorGaleria) {
    console.error("Error al obtener galería:", errorGaleria);
    return NextResponse.json(
      { ok: false, error: errorGaleria.message },
      { status: 500 }
    );
  }

  // Extraer solo las rutas de las imágenes
  const galeriaImagenes = galeria.map(item => item.imagen);

  // Devolver todo junto
  return NextResponse.json({
    ok: true,
    data: {
      ...productor,
      productos,
      galeria: galeriaImagenes
    }
  });
}