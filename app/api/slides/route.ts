import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
    const { data, error } = await supabase
        .from('slides')
        .select('*')
        .order('orden', { ascending: true });

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, data });
}

export async function POST(request: Request) {
    const body = await request.json();
    const { data, error } = await supabase
        .from('slides')
        .insert([body])
        .select();

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, data }, { status: 201 });
}