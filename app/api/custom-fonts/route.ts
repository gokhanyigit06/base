import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const result = await query('SELECT * FROM custom_fonts ORDER BY created_at ASC');
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching fonts:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { name, font_url, font_family } = await request.json();

        if (!name || !font_url || !font_family) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const result = await query(
            `INSERT INTO custom_fonts (name, font_url, font_family) 
         VALUES ($1, $2, $3) RETURNING *`,
            [name, font_url, font_family]
        );

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Error adding font:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const result = await query('DELETE FROM custom_fonts WHERE id = $1 RETURNING *', [id]);

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting font:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
