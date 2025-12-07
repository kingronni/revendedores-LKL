import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET Settings
export async function GET() {
    try {
        const { data, error } = await supabase
            .from('system_settings')
            .select('*')
            .single();

        if (error) {
            // If not found, insert default and return
            if (error.code === 'PGRST116') {
                const defaultSettings = {
                    id: 1,
                    theme_config: { primary: "#00ff41", secondary: "#bc13fe", bg: "#050505" },
                    credit_costs: { daily: 1.0, weekly: 5.0, monthly: 15.0 },
                    key_config: { prefix: "LKL", length: 8 }
                };
                await supabase.from('system_settings').insert(defaultSettings);
                return NextResponse.json({ settings: defaultSettings });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ settings: data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// UPDATE Settings
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Ensure ID is 1
        const { error } = await supabase
            .from('system_settings')
            .upsert({ ...body, id: 1 });

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
