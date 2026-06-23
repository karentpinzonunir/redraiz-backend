// app/api/productos/route.ts
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Parámetros de paginación
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Parámetros de filtrado
        const regionId = searchParams.get('region');
        const productorId = searchParams.get('productor');
        const productoId = searchParams.get('producto');
        const categoriaId = searchParams.get('categoria');

        // Construimos la consulta base
        let query = supabase
            .from('producto_productor')
            .select('*')
            .eq('estado', true);

        // Agregamos filtros si se proporcionan
        if (regionId) {
            query = query.eq('id_region', regionId);
        }

        if (productorId) {
            query = query.eq('id_productor', productorId);
        }

        if (productoId) {
            query = query.eq('id_producto', productoId);
        }

        // Aplicamos paginación
        const { data, error } = await query
            .range(offset, offset + limit - 1);

        if (error) {
            return NextResponse.json(
                { ok: false, error: error.message },
                { status: 500 }
            );
        }

        // Obtenemos la información adicional para cada registro
        const productosActivos = [];

        for (const item of data) {
            // Obtener información del producto
            const { data: productoData, error: productoError } = await supabase
                .from('productos')
                .select('*')
                .eq('id', item.id_producto)
                .eq('estado', true)
                .single();

            // Si hay error al obtener el producto o no existe, continuar con el siguiente
            if (productoError || !productoData) {
                continue;
            }

            // Verificar filtro de categoría
            if (categoriaId && productoData.id_categoria != categoriaId) {
                continue;
            }

            // Obtener información de la categoría
            const { data: categoriaData, error: categoriaError } = await supabase
                .from('categorias')
                .select('*')
                .eq('id', productoData.id_categoria)
                .single();

            // Obtener información de la región
            const { data: regionData, error: regionError } = await supabase
                .from('regiones')
                .select('*')
                .eq('id', item.id_region)
                .single();

            // Obtener información del productor
            const { data: productorData, error: productorError } = await supabase
                .from('productores')
                .select('*')
                .eq('id', item.id_productor)
                .single();

            // Solo agregar si no hay errores en las consultas relacionadas
            if (!categoriaError && !regionError && !productorError) {
                productosActivos.push({
                    id: item.id,
                    precio: item.precio,
                    estado: item.estado,
                    id_producto: item.id_producto,
                    id_productor: item.id_productor,
                    id_region: item.id_region,
                    producto: productoData,
                    categoria: categoriaData,
                    region: regionData,
                    productor: productorData
                });
            }
        }

        return NextResponse.json({
            ok: true,
            data: productosActivos,
            count: productosActivos.length,
            limit,
            offset
        });

    } catch (error: any) {
        return NextResponse.json(
            { ok: false, error: error.message },
            { status: 500 }
        );
    }
}