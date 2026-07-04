// app/api/productos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const limit = Math.max(1, parseInt(searchParams.get('limit') || '10'));
        const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'));
        const regionId = searchParams.get('region');
        const productorId = searchParams.get('productor');
        const productoId = searchParams.get('producto');
        const categoriaId = searchParams.get('categoria');

        // 1) Obtener filas de la tabla correcta: productor_productos
        let query = supabase
            .from('productor_productos')
            .select('*')
            .eq('estado', true);

        if (regionId) query = query.eq('id_region', regionId);
        if (productorId) query = query.eq('id_productor', productorId);
        if (productoId) query = query.eq('id_producto', productoId);

        const { data: rows, error: rowsError } = await query.range(offset, offset + limit - 1);
        if (rowsError) {
            return NextResponse.json({ ok: false, error: rowsError.message }, { status: 500 });
        }

        if (!rows || rows.length === 0) {
            return NextResponse.json({
                ok: true,
                data: [],
                count: 0,
                limit,
                offset
            });
        }

        // 2) Recolectar ids únicos para hacer fetch en lote
        const productoIds = Array.from(new Set(rows.map((r: any) => r.id_producto))).filter(Boolean);
        const productorIds = Array.from(new Set(rows.map((r: any) => r.id_productor))).filter(Boolean);
        const regionIds = Array.from(new Set(rows.map((r: any) => r.id_region))).filter(Boolean);

        // 3) Traer productos en lote
        const { data: productosData } = await supabase
            .from('productos')
            .select('id, nombre, descripcion, id_categoria, imagen, estado')
            .in('id', productoIds);

        // Filtrar productos desactivados si corresponde
        const productosMap = new Map<number, any>();
        (productosData || []).forEach((p: any) => {
            productosMap.set(Number(p.id), p);
        });

        // 4) Recolectar ids de categorías desde los productos encontrados
        const categoriaIdsFromProductos = Array.from(
            new Set((productosData || []).map((p: any) => p.id_categoria))
        ).filter(Boolean);

        // 5) Traer categorías en lote
        const { data: categoriasData } = await supabase
            .from('categorias')
            .select('id, nombre')
            .in('id', categoriaIdsFromProductos);

        const categoriasMap = new Map<number, any>();
        (categoriasData || []).forEach((c: any) => {
            categoriasMap.set(Number(c.id), c);
        });

        // 6) Traer productores y regiones en lote (incluyendo todos los campos necesarios)
        const { data: productoresData } = await supabase
            .from('productores')
            .select('id, nombre, descripcion, historia, imagen, latitud, longitud, estado, carpeta, telefono, id_region, id_categoria')
            .in('id', productorIds);

        const productoresMap = new Map<number, any>();
        (productoresData || []).forEach((p: any) => {
            productoresMap.set(Number(p.id), p);
        });

        const { data: regionesData } = await supabase
            .from('regiones')
            .select('id, nombre')
            .in('id', regionIds);

        const regionesMap = new Map<number, any>();
        (regionesData || []).forEach((r: any) => regionesMap.set(Number(r.id), r));

        // 7) Construir respuesta y aplicar filtro por categoria si se indicó
        const result = rows
            .map((row: any) => {
                const producto = productosMap.get(Number(row.id_producto)) || null;

                // Corrección: Verificar que producto y producto.id_categoria existan
                let categoria = null;
                if (producto && producto.id_categoria) {
                    categoria = categoriasMap.get(Number(producto.id_categoria)) || null;
                }

                const productor = productoresMap.get(Number(row.id_productor)) || null;

                return {
                    id: row.id,
                    precio: row.precio,
                    estado: row.estado,
                    id_producto: row.id_producto,
                    id_productor: row.id_productor,
                    id_region: row.id_region,
                    producto,
                    categoria,
                    region: regionesMap.get(Number(row.id_region)) || null,
                    productor: productor ? {
                        id: productor.id,
                        nombre: productor.nombre,
                        descripcion: productor.descripcion,
                        historia: productor.historia,
                        imagen: productor.imagen,
                        latitud: productor.latitud,
                        longitud: productor.longitud,
                        estado: productor.estado,
                        carpeta: productor.carpeta,
                        telefono: productor.telefono,
                        id_region: productor.id_region,
                        id_categoria: productor.id_categoria
                    } : null
                };
            })
            .filter((item: any) => {
                if (!item.producto) return false; // producto no existe o está desactivado
                if (categoriaId && item.categoria && String(item.categoria.id) !== String(categoriaId)) return false;
                if (categoriaId && !item.categoria) return false;
                return true;
            });

        return NextResponse.json({
            ok: true,
            data: result,
            count: result.length,
            limit,
            offset
        });
    } catch (err: any) {
        return NextResponse.json({ ok: false, error: err.message || String(err) }, { status: 500 });
    }
}