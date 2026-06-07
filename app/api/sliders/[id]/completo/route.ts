import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const { data, error } = await supabase
        .from('sliders')
        .select(`
      *,
      slides!inner (*)
    `)
        .eq('id', id)
        .eq('slides.estado', true)
        .order('orden', { referencedTable: 'slides', ascending: true })
        .single();

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 404 });
    return NextResponse.json({ ok: true, data });
}