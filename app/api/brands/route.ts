import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (id) {
            const result = await query('SELECT * FROM brands WHERE id = $1', [id]);
            return NextResponse.json(result.rows[0]);
        }

        const result = await query('SELECT * FROM brands ORDER BY created_at DESC');
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching brands:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { name, logo_url, brand_voice, meta_access_token, instagram_business_id } = await request.json();

        const result = await query(
            `INSERT INTO brands (name, logo_url, brand_voice, meta_access_token, instagram_business_id)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [name, logo_url, brand_voice, meta_access_token, instagram_business_id]
        );

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Error creating brand:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, name, logo_url, brand_voice, meta_access_token, instagram_business_id } = body;

        const updates = [];
        const values = [];
        let counter = 1;

        if (name !== undefined) { updates.push(`name = $${counter++}`); values.push(name); }
        if (logo_url !== undefined) { updates.push(`logo_url = $${counter++}`); values.push(logo_url); }
        if (brand_voice !== undefined) { updates.push(`brand_voice = $${counter++}`); values.push(brand_voice); }
        if (meta_access_token !== undefined) { updates.push(`meta_access_token = $${counter++}`); values.push(meta_access_token); }
        if (instagram_business_id !== undefined) { updates.push(`instagram_business_id = $${counter++}`); values.push(instagram_business_id); }

        if (updates.length === 0) return NextResponse.json({ error: 'No fields' }, { status: 400 });

        values.push(id);
        const result = await query(
            `UPDATE brands SET ${updates.join(', ')} WHERE id = $${counter} RETURNING *`,
            values
        );

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating brand:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await query('DELETE FROM brands WHERE id = $1', [id]);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting brand:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
