import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { publishToInstagram } from '@/lib/instagram';

export const dynamic = 'force-dynamic'; // Ensure this route is never cached

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
    // 1. Security Check
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // Allow running without secret only in development for testing convenience
        if (process.env.NODE_ENV !== 'development') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    try {
        // 2. Find posts ready to publish
        // Status is 'scheduled' AND scheduled_at is in the past (or now)
        const now = new Date().toISOString();

        const { data: posts, error } = await supabaseAdmin
            .from('scheduled_posts')
            .select(`
                *,
                brands (
                    instagram_business_id,
                    meta_access_token
                )
            `)
            .eq('status', 'scheduled')
            .lte('scheduled_at', now);

        if (error) {
            console.error('Cron DB Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!posts || posts.length === 0) {
            return NextResponse.json({ message: 'No posts to publish' });
        }

        const results = [];

        // 3. Loop and Publish
        for (const post of posts) {
            const brand = post.brands;

            // Skip if brand has no credentials connected
            if (!brand || !brand.instagram_business_id || !brand.meta_access_token) {
                results.push({ id: post.id, status: 'skipped_no_credentials' });
                continue;
            }

            // Publish
            const result = await publishToInstagram(
                post.media_url,
                post.content_text || '',
                brand.instagram_business_id,
                brand.meta_access_token
            );

            if (result.success) {
                // Update DB to 'published'
                await supabaseAdmin
                    .from('scheduled_posts')
                    .update({ status: 'published' })
                    .eq('id', post.id);

                results.push({ id: post.id, status: 'published', ig_id: result.id });
            } else {
                // Log failure (maybe add a 'failed' status later)
                console.error(`Failed to publish post ${post.id}:`, result.error);
                results.push({ id: post.id, status: 'failed', error: result.error });
            }
        }

        return NextResponse.json({
            success: true,
            processed: results.length,
            details: results
        });

    } catch (error: any) {
        console.error('Cron job error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
