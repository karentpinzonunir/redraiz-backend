import { createClient } from '@/utils/supabase/server'; // Ajusta según donde tengas tu cliente de supabase
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('productores')
      .select(`
        id,
        nombre,
        descripcion,
        historia,
        imagen,
        latitud,
        longitud,
        estado,
        carpeta,
        region:id_region (
          id,
          nombre
        ),
        categoria:id_categoria (
          id,
          nombre
        )
      `)
      .eq('estado', true) // Solo traer los activos
      .order('id', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Opcional: Aplanar el objeto si prefieres region.nombre en lugar de region: { nombre: '...' }
    const formattedData = data.map(productor => ({
      ...productor,
      region: productor.region?.nombre || 'Sin región',
      categoria: productor.categoria?.nombre || 'Sin categoría'
    }));

    return NextResponse.json(formattedData);
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}