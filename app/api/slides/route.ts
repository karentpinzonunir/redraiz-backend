import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
    const { data, error } = await supabase
        .from('slides')
        .select('*')
        .eq('estado', true)
        .order('orden', { ascending: true });

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, data });
}