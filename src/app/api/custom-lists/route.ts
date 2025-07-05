import { NextResponse } from 'next/server';
import { getCustomLists, saveCustomLists } from '@/lib/database';
import { CustomListType } from '@/lib/types';

export async function GET() {
  try {
    // Get all lists using type-specific approach
    const providers = await getCustomLists(CustomListType.Provider, []);
    const networks = await getCustomLists(CustomListType.Network, []);
    const perks = await getCustomLists(CustomListType.Perk, []);

    return NextResponse.json({ providers, networks, perks });
  } catch (error) {
    console.error('Error in GET /api/custom-lists:', error);
    return NextResponse.json({ error: 'Failed to retrieve custom lists' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { type, items } = await request.json();
    const savedList = await saveCustomLists(type, items);
    return NextResponse.json(savedList);
  } catch (error) {
    console.error('Error in POST /api/custom-lists:', error);
    return NextResponse.json({ error: 'Failed to save custom list' }, { status: 500 });
  }
}