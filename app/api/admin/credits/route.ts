import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const { resellerId, amount, type, description } = await request.json();

        if (!resellerId || !amount || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Get current balance
        const { data: reseller, error: fetchError } = await supabase
            .from('resellers')
            .select('balance')
            .eq('id', resellerId)
            .single();

        if (fetchError || !reseller) {
            return NextResponse.json({ error: 'Reseller not found' }, { status: 404 });
        }

        const currentBalance = parseFloat(reseller.balance || '0');
        const changeAmount = parseFloat(amount);
        let newBalance = currentBalance;

        if (type === 'add') {
            newBalance += changeAmount;
        } else if (type === 'deduct') {
            newBalance -= changeAmount;
        } else if (type === 'reset') {
            newBalance = changeAmount; // If reset, amount is the target balance
        }

        // 2. Update Reseller Balance
        const { error: updateError } = await supabase
            .from('resellers')
            .update({ balance: newBalance })
            .eq('id', resellerId);

        if (updateError) throw updateError;

        // 3. Log Transaction
        const { error: logError } = await supabase
            .from('credit_transactions')
            .insert({
                reseller_id: resellerId,
                amount: type === 'deduct' ? -changeAmount : changeAmount,
                type,
                description: description || `Manual ${type}`,
                created_at: new Date().toISOString()
            });

        if (logError) console.error('Error logging transaction:', logError);

        return NextResponse.json({ success: true, newBalance });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
