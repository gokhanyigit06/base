import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { publishToInstagram } from '@/lib/instagram';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    // 1. Güvenlik Kontrolü
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        if (process.env.NODE_ENV !== 'development') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    try {
        // 2. Yayınlanmaya hazır gönderileri bul (scheduled durumunda ve zamanı gelmiş)
        const now = new Date().toISOString();

        const result = await query(`
            SELECT p.*, b.instagram_business_id, b.meta_access_token 
            FROM scheduled_posts p
            JOIN brands b ON p.brand_id = b.id
            WHERE p.status = 'scheduled' AND p.scheduled_at <= $1
        `, [now]);

        const posts = result.rows;

        if (!posts || posts.length === 0) {
            return NextResponse.json({ message: 'No posts to publish' });
        }

        const results = [];

        // 3. Gönderileri Yayınla
        for (const post of posts) {
            if (!post.instagram_business_id || !post.meta_access_token) {
                results.push({ id: post.id, status: 'skipped_no_credentials' });
                continue;
            }

            const publishResult = await publishToInstagram(
                post.media_url,
                post.content_text || '',
                post.instagram_business_id,
                post.meta_access_token
            );

            if (publishResult.success) {
                await query('UPDATE scheduled_posts SET status = $1 WHERE id = $2', ['published', post.id]);
                results.push({ id: post.id, status: 'published', ig_id: publishResult.id });
            } else {
                console.error(`Failed to publish post ${post.id}:`, publishResult.error);
                results.push({ id: post.id, status: 'failed', error: publishResult.error });
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
