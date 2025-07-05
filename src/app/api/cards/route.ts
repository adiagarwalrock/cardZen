import { NextResponse } from 'next/server';
import { getCards, saveCards } from '@/lib/database';
import { CreditCard } from '@/lib/types';

export async function GET() {
    try {
        const cards = await getCards();
        return NextResponse.json(cards);
    } catch (error) {
        console.error('Error in GET /api/cards:', error);
        return NextResponse.json({ error: 'Failed to retrieve cards' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const cards = await request.json();
        await saveCards(cards);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in POST /api/cards:', error);
        return NextResponse.json({ error: 'Failed to save cards' }, { status: 500 });
    }
}
