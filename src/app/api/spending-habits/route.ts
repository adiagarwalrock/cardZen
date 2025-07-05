import { NextResponse } from 'next/server';
import { getSpendingHabitsJson, saveSpendingHabitsJson } from '@/lib/json-storage';

export async function GET() {
  try {
    const habits = await getSpendingHabitsJson();
    return NextResponse.json(habits);
  } catch (error) {
    console.error('Error in GET /api/spending-habits:', error);
    return NextResponse.json({ error: 'Failed to retrieve spending habits' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const habits = await request.json();
    await saveSpendingHabitsJson(habits);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/spending-habits:', error);
    return NextResponse.json({ error: 'Failed to save spending habits' }, { status: 500 });
  }
}
