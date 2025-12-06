import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, secretKey } = body;

        if (!name || !secretKey) {
            return NextResponse.json({ error: 'Nome e Chave Secreta são obrigatórios' }, { status: 400 });
        }

        // Check availability
        const { data: existing } = await supabase
            .from('resellers')
            .select('id')
            .eq('secret_key', secretKey)
            .single();

        if (existing) {
            return NextResponse.json({ error: 'Essa Chave Secreta já está em uso.' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('resellers')
            .insert({
                name,
                secret_key: secretKey,
                is_active: true
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, reseller: data });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
