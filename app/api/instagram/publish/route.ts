import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { publishToInstagram } from '@/lib/instagram';

export async function POST(request: Request) {
    try {
        const { imageUrl, caption, brandId } = await request.json();

        if (!imageUrl || !brandId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Fetch Credentials from local DB
        const result = await query(
            'SELECT instagram_business_id, meta_access_token FROM brands WHERE id = $1',
            [brandId]
        );
        const brand = result.rows[0];

        if (!brand || !brand.instagram_business_id || !brand.meta_access_token) {
            return NextResponse.json({ error: 'Brand credentials missing' }, { status: 404 });
        }

        // 2. Publish using shared utility
        const publishResult = await publishToInstagram(
            imageUrl,
            caption,
            brand.instagram_business_id,
            brand.meta_access_token
        );

        if (!publishResult.success) {
            return NextResponse.json({ error: publishResult.error }, { status: 400 });
        }

        return NextResponse.json({ success: true, id: publishResult.id });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

