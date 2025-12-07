import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const resellerId = searchParams.get('resellerId');

    try {
        let query = supabase
            .from('credit_transactions')
            .select('*')
            .order('created_at', { ascending: false });

        if (resellerId) {
            query = query.eq('reseller_id', resellerId);
        }

        const { data, error } = await query.limit(50); // Limit to last 50 for now

        if (error) throw error;

        return NextResponse.json({ transactions: data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
