import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Admin client just for this route
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
    try {
        // 1. Get Totals
        const { count: totalResellers, error: errResellers } = await supabase
            .from('resellers')
            .select('*', { count: 'exact', head: true });

        const { count: totalKeys, error: errKeys } = await supabase
            .from('licenses')
            .select('*', { count: 'exact', head: true });

        const { count: activeKeys, error: errActive } = await supabase
            .from('licenses')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active');

        if (errResellers || errKeys || errActive) {
            console.error(errResellers, errKeys, errActive);
            throw new Error('Failed to fetch stats');
        }

        // 2. Get Chart Data (Last 7 Days)
        // Harder in raw SQL via Supabase client without stored procedure, 
        // so we'll fetch created_at of last 1000 keys and process in JS (simple for now)
        const { data: recentKeys } = await supabase
            .from('licenses')
            .select('created_at')
            .order('created_at', { ascending: false })
            .limit(500);

        const last7Days = Array(7).fill(0);
        const today = new Date();
        const dates = [];

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            dates.push(d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
        }

        if (recentKeys) {
            recentKeys.forEach((key: any) => {
                const keyDate = new Date(key.created_at);
                const diffTime = Math.abs(today.getTime() - keyDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays <= 7 && diffDays > 0) {
                    // index 6 is today, 0 is 7 days ago
                    // Approximate logic for chart
                    const idx = 7 - diffDays;
                    if (idx >= 0 && idx < 7) last7Days[idx]++;
                } else if (diffDays <= 1) { // occurred today
                    last7Days[6]++;
                }
            });
        }

        return NextResponse.json({
            stats: {
                totalResellers: totalResellers || 0,
                totalKeys: totalKeys || 0,
                activeKeys: activeKeys || 0,
                chartData: last7Days,
                chartLabels: dates
            }
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
