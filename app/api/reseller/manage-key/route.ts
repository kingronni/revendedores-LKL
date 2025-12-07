import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const secretKey = body.secretKey?.trim();
        const { action, keyId, clientName, whatsapp } = body;

        if (!secretKey || !action || !keyId) {
            return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
        }

        // 1. Verify Reseller
        const { data: reseller, error: resError } = await supabase
            .from('resellers')
            .select('id')
            .eq('secret_key', secretKey)
            .single();

        if (resError || !reseller) {
            return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
        }

        // 2. Verify Key Ownership
        const { data: license, error: keyError } = await supabase
            .from('licenses')
            .select('id')
            .eq('id', keyId)
            .eq('reseller_id', reseller.id)
            .single();

        if (keyError || !license) {
            return NextResponse.json({ error: 'Licença não encontrada ou sem permissão' }, { status: 404 });
        }

        // 3. Perform Action
        let result;
        if (action === 'delete') {
            result = await supabase.from('licenses').delete().eq('id', keyId);
        } else if (action === 'reset_ip') {
            result = await supabase.from('licenses').update({ used_ips: [] }).eq('id', keyId);
        } else if (action === 'update') {
            result = await supabase.from('licenses').update({ client_name: clientName, whatsapp: whatsapp }).eq('id', keyId);
        } else {
            return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
        }

        if (result.error) {
            throw new Error(result.error.message);
        }

        return NextResponse.json({ success: true, message: 'Ação realizada com sucesso' });

    } catch (error: any) {
        console.error('Manage Error:', error);
        return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
    }
}
