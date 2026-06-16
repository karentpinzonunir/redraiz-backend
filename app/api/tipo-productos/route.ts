import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
    const { data, error } = await supabase
        .from('tipo_productos') // <-- cambia este nombre si tu tabla se llama distinto
        .select('id,nombre')
        .order('nombre', { ascending: true });

    if (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, data });
}