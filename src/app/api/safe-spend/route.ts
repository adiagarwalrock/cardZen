import { NextResponse } from 'next/server';
import { getSafeSpend, saveSafeSpend } from '@/lib/database';

export async function GET() {
    try {
        const percentage = await getSafeSpend();
        return NextResponse.json({ percentage });
    } catch (error) {
        console.error('Error in GET /api/safe-spend:', error);
        return NextResponse.json({ error: 'Failed to retrieve safe spend percentage' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { percentage } = await request.json();
        await saveSafeSpend(percentage);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in POST /api/safe-spend:', error);
        return NextResponse.json({ error: 'Failed to save safe spend percentage' }, { status: 500 });
    }
}
