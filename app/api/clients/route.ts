import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const result = await query('SELECT * FROM clients ORDER BY display_order ASC');
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching clients:', error);
        return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, logo_url, description, display_order } = body;

        const result = await query(
            `INSERT INTO clients (name, logo_url, description, display_order) 
             VALUES ($1, $2, $3, $4) 
             RETURNING *`,
            [name, logo_url, description, display_order || 0]
        );

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Error creating client:', error);
        return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, name, logo_url, description, display_order } = body;

        const updates = [];
        const values = [];
        let counter = 1;

        if (name !== undefined) { updates.push(`name = $${counter++}`); values.push(name); }
        if (logo_url !== undefined) { updates.push(`logo_url = $${counter++}`); values.push(logo_url); }
        if (description !== undefined) { updates.push(`description = $${counter++}`); values.push(description); }
        if (display_order !== undefined) { updates.push(`display_order = $${counter++}`); values.push(display_order); }

        if (updates.length === 0) return NextResponse.json({ error: 'No fields to update' }, { status: 400 });

        values.push(id);
        const queryText = `UPDATE clients SET ${updates.join(', ')} WHERE id = $${counter} RETURNING *`;

        const result = await query(queryText, values);

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);

    } catch (error) {
        console.error('Error updating client:', error);
        return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const result = await query('DELETE FROM clients WHERE id = $1 RETURNING *', [id]);

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting client:', error);
        return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
    }
}
