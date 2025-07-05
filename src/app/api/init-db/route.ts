import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/database';
import { ensureDataDir } from '@/lib/json-storage';

export async function GET() {
    try {
        await initializeDatabase();
        await ensureDataDir();
        return NextResponse.json({ success: true, message: 'Database and JSON storage initialized successfully' });
    } catch (error) {
        console.error('Error initializing storage:', error);
        return NextResponse.json({ error: 'Failed to initialize storage' }, { status: 500 });
    }
}
