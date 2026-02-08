import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const brandId = searchParams.get('brandId');
        const id = searchParams.get('id');

        if (id) {
            const result = await query('SELECT * FROM scheduled_posts WHERE id = $1', [id]);
            return NextResponse.json(result.rows[0]);
        }

        if (brandId) {
            const result = await query('SELECT * FROM scheduled_posts WHERE brand_id = $1 ORDER BY scheduled_at ASC', [brandId]);
            return NextResponse.json(result.rows);
        }

        const result = await query('SELECT * FROM scheduled_posts ORDER BY scheduled_at ASC');
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching posts:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { brand_id, type, content_text, media_url, scheduled_at, status } = await request.json();

        const result = await query(
            `INSERT INTO scheduled_posts (brand_id, type, content_text, media_url, scheduled_at, status)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [brand_id, type, content_text, media_url, scheduled_at, status || 'draft']
        );

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Error creating post:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, type, content_text, media_url, scheduled_at, status } = body;

        const updates = [];
        const values = [];
        let counter = 1;

        if (type !== undefined) { updates.push(`type = $${counter++}`); values.push(type); }
        if (content_text !== undefined) { updates.push(`content_text = $${counter++}`); values.push(content_text); }
        if (media_url !== undefined) { updates.push(`media_url = $${counter++}`); values.push(media_url); }
        if (scheduled_at !== undefined) { updates.push(`scheduled_at = $${counter++}`); values.push(scheduled_at); }
        if (status !== undefined) { updates.push(`status = $${counter++}`); values.push(status); }

        if (updates.length === 0) return NextResponse.json({ error: 'No fields' }, { status: 400 });

        values.push(id);
        const result = await query(
            `UPDATE scheduled_posts SET ${updates.join(', ')} WHERE id = $${counter} RETURNING *`,
            values
        );

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating post:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const ids = searchParams.get('ids'); // For bulk delete

        if (ids) {
            const idList = ids.split(',');
            await query(`DELETE FROM scheduled_posts WHERE id = ANY($1)`, [idList]);
            return NextResponse.json({ success: true });
        }

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await query('DELETE FROM scheduled_posts WHERE id = $1', [id]);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting post:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
