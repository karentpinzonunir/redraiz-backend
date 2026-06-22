import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  console.log("ID recibido:", id);

  // Primero obtenemos al productor con región y categoría
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

  // Luego obtenemos los productos relacionados con el productor
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

  // Extraemos los IDs de los productos
  const productoIds = relaciones.map(rel => rel.id_producto);

  if (productoIds.length === 0) {
    return NextResponse.json({
      ok: true,
      data: {
        ...productor,
        productos: []
      }
    });
  }

  // Finalmente traemos los productos completos
  const { data: productos, error: errorProductos } = await supabase
    .from('productos')
    .select('*')
    .in('id', productoIds)
    .eq('estado', true);

  if (errorProductos) {
    console.error("Error al obtener detalles de productos:", errorProductos);
    return NextResponse.json(
      { ok: false, error: errorProductos.message },
      { status: 500 }
    );
  }

  // Combinamos precios con productos
  const productosConPrecio = productos.map(producto => {
    const relacion = relaciones.find(r => r.id_producto === producto.id);
    return {
      ...producto,
      precio: relacion ? relacion.precio : null
    };
  });

  return NextResponse.json({
    ok: true,
    data: {
      ...productor,
      productos: productosConPrecio
    }
  });
}