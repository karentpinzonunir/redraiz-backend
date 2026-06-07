import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { data, error } = await supabase
        .from('slides')
        .select('*')
        .eq('id', id)
        .single();

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 404 });
    return NextResponse.json({ ok: true, data });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await req.json();
    const { data, error } = await supabase
        .from('slides')
        .update(body)
        .eq('id', id)
        .select();

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, data });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { error } = await supabase
        .from('slides')
        .delete()
        .eq('id', id);

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, message: 'Slide eliminado correctamente' });
}