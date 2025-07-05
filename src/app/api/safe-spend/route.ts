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
        if (typeof percentage !== 'number' || percentage < 0 || percentage > 100) {
            return NextResponse.json({ error: 'Invalid percentage value' }, { status: 400 });
        }
        await saveSafeSpend(percentage);
        return NextResponse.json({ success: true, percentage });
    } catch (error) {
        console.error('Error in POST /api/safe-spend:', error);
        return NextResponse.json({ error: 'Failed to save safe spend percentage' }, { status: 500 });
    }
}
