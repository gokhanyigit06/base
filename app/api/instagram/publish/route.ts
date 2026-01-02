import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { publishToInstagram } from '@/lib/instagram';

// Server-side Supabase client
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
    try {
        const { imageUrl, caption, brandId } = await request.json();

        if (!imageUrl || !brandId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Fetch Credentials
        const { data: brand, error: dbError } = await supabaseAdmin
            .from('brands')
            .select('instagram_business_id, meta_access_token')
            .eq('id', brandId)
            .single();

        if (dbError || !brand?.instagram_business_id || !brand?.meta_access_token) {
            return NextResponse.json({ error: 'Brand credentials missing' }, { status: 404 });
        }

        // 2. Publish using shared utility
        const result = await publishToInstagram(
            imageUrl,
            caption,
            brand.instagram_business_id,
            brand.meta_access_token
        );

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({ success: true, id: result.id });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
