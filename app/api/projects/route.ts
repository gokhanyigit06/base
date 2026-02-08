import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const slug = searchParams.get('slug');

        let queryText = 'SELECT * FROM projects';
        const params: any[] = [];
        const conditions: string[] = [];

        if (id) {
            params.push(id);
            conditions.push(`id = $${params.length}`);
        }
        if (slug) {
            params.push(slug);
            conditions.push(`slug = $${params.length}`);
        }

        if (conditions.length > 0) {
            queryText += ' WHERE ' + conditions.join(' AND ');
        } else {
            queryText += ' ORDER BY display_order ASC';
        }

        const result = await query(queryText, params);
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, category, description, is_featured, cover_image, slug, video_url } = body;

        // Auto-generate slug if not provided? Or assume provided.
        // For now, simple insert
        const result = await query(
            `INSERT INTO projects (title, category, description, is_featured, cover_image, slug, video_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
            [title, category, description, is_featured || false, cover_image, slug, video_url]
        );

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Error creating project:', error);
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, is_featured, display_order, title, category, description, cover_image, slug, video_url } = body;

        // Build dynamic update query
        const updates = [];
        const values = [];
        let counter = 1;

        if (title !== undefined) { updates.push(`title = $${counter++}`); values.push(title); }
        if (category !== undefined) { updates.push(`category = $${counter++}`); values.push(category); }
        if (description !== undefined) { updates.push(`description = $${counter++}`); values.push(description); }
        if (is_featured !== undefined) { updates.push(`is_featured = $${counter++}`); values.push(is_featured); }
        if (display_order !== undefined) { updates.push(`display_order = $${counter++}`); values.push(display_order); }
        if (cover_image !== undefined) { updates.push(`cover_image = $${counter++}`); values.push(cover_image); }
        if (slug !== undefined) { updates.push(`slug = $${counter++}`); values.push(slug); }
        if (video_url !== undefined) { updates.push(`video_url = $${counter++}`); values.push(video_url); }

        if (updates.length === 0) return NextResponse.json({ error: 'No fields to update' }, { status: 400 });

        values.push(id);
        const queryText = `UPDATE projects SET ${updates.join(', ')} WHERE id = $${counter} RETURNING *`;

        const result = await query(queryText, values);

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating project:', error);
        return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
    }
}
