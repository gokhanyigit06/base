import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const result = await query('SELECT key, value FROM site_settings');
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const updates = await request.json(); // Array of { key, value }

        if (!Array.isArray(updates)) {
            // Handle single update object if needed, or enforce array
            return NextResponse.json({ error: 'Expected array of updates' }, { status: 400 });
        }

        // Process updates
        // In a real app, use a transaction. Here we'll just loop.
        for (const update of updates) {
            if (!update.key) continue;
            await query(
                `INSERT INTO site_settings (key, value) VALUES ($1, $2)
              ON CONFLICT (key) DO UPDATE SET value = $2`,
                [update.key, update.value]
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving settings:', error);
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }
}
