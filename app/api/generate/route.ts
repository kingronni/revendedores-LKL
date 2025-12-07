import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const secretKey = body.secretKey?.trim();
        const { durationType = 'monthly', durationValue = 1, clientName, whatsapp, maxIps = 1 } = body;

        // 1. Validate Input
        if (!secretKey) {
            return NextResponse.json({ error: 'Chave secreta do revendedor obrigatória' }, { status: 400 });
        }

        // 2. Validate Reseller & Get Settings
        const [resellerResult, settingsResult] = await Promise.all([
            supabase.from('resellers').select('id, name, is_active, balance').eq('secret_key', secretKey).single(),
            supabase.from('system_settings').select('*').single()
        ]);

        const reseller = resellerResult.data;
        const settings = settingsResult.data || {
            credit_costs: { daily: 1, weekly: 5, monthly: 15 },
            key_config: { prefix: 'LKL', length: 8 }
        };

        if (resellerResult.error || !reseller) {
            return NextResponse.json({ error: 'Revendedor não encontrado' }, { status: 401 });
        }

        if (!reseller.is_active) {
            return NextResponse.json({ error: 'ACESSO BLOQUEADO PELO ADMINISTRADOR' }, { status: 403 });
        }

        // 3. Calculate Cost
        let cost = 0;
        const costs = settings.credit_costs || { daily: 1, weekly: 5, monthly: 15 };

        if (durationType === 'daily') cost = costs.daily;
        else if (durationType === 'weekly') cost = costs.weekly;
        else if (durationType === 'monthly') cost = costs.monthly;
        else if (durationType === 'permanent') cost = costs.monthly * 10; // Rule of thumb or config
        else if (durationType === 'hours') cost = (costs.daily / 24) * parseInt(durationValue);
        else if (durationType === 'days') cost = costs.daily * parseInt(durationValue);

        // Round cost
        cost = Math.ceil(cost * 100) / 100;

        // Check Balance
        const currentBalance = parseFloat(reseller.balance || '0');
        if (currentBalance < cost) {
            return NextResponse.json({ error: `Saldo insuficiente. Custo: ${cost}, Saldo: ${currentBalance}` }, { status: 402 });
        }

        // 4. Deduct Balance (Optimistic)
        const newBalance = currentBalance - cost;
        const { error: deductError } = await supabase
            .from('resellers')
            .update({ balance: newBalance })
            .eq('id', reseller.id);

        if (deductError) {
            console.error('Balance update error:', deductError);
            return NextResponse.json({ error: 'Erro ao atualizar saldo' }, { status: 500 });
        }

        // 5. Generate License Key
        const prefix = settings.key_config?.prefix || 'LKL';
        const length = settings.key_config?.length || 8;
        const randomStr = Math.random().toString(36).substring(2, 2 + length).toUpperCase();
        const licenseKey = `${prefix}-${randomStr}`;

        // Calculate Expiry
        const now = new Date();
        let expires = new Date();
        const val = Math.max(1, parseInt(durationValue.toString()) || 1);

        if (durationType === 'weekly') expires.setDate(now.getDate() + 7);
        else if (durationType === 'daily') expires.setDate(now.getDate() + 1);
        else if (durationType === 'permanent') expires.setFullYear(now.getFullYear() + 100);
        else if (durationType === 'hours') expires.setHours(now.getHours() + val);
        else if (durationType === 'days') expires.setDate(now.getDate() + val);
        else expires.setDate(now.getDate() + 30); // Monthly default

        // 6. Save to Database
        const { data: license, error: licenseError } = await supabase
            .from('licenses')
            .insert({
                license_key: licenseKey,
                status: 'active',
                duration_type: durationType === 'hours' || durationType === 'days' ? `${val} ${durationType}` : durationType,
                expires_at: expires.toISOString(),
                reseller_id: reseller.id,
                created_at: now.toISOString(),
                max_ips: maxIps,
                used_ips: [],
                client_name: clientName || null,
                whatsapp: whatsapp || null
            })
            .select()
            .single();

        if (licenseError) {
            // Refund if fail
            await supabase.from('resellers').update({ balance: currentBalance }).eq('id', reseller.id);
            console.error('Error creating license:', licenseError);
            return NextResponse.json({ error: 'Erro ao criar licença' }, { status: 500 });
        }

        // 7. Log Transaction
        if (cost > 0) {
            await supabase.from('credit_transactions').insert({
                reseller_id: reseller.id,
                amount: -cost,
                type: 'deduct',
                description: `Created key ${licenseKey} (${durationType})`,
                created_at: now.toISOString()
            });
        }

        return NextResponse.json({
            success: true,
            key: licenseKey,
            expires_at: expires.toISOString(),
            reseller: reseller.name,
            new_balance: newBalance
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
