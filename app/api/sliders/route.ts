import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
    const { data, error } = await supabase
        .from('sliders')
        .select('*')
        .order('id', { ascending: true });

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, data });
}

export async function POST(request: Request) {
    const body = await request.json();
    const { data, error } = await supabase
        .from('sliders')
        .insert([body])
        .select();

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, data }, { status: 201 });
}