import { NextResponse } from 'next/server';
import { getAlertSettingsJson, saveAlertSettingsJson } from '@/lib/json-storage';

export async function GET() {
  try {
    const settings = await getAlertSettingsJson();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error in GET /api/alert-settings:', error);
    return NextResponse.json({ error: 'Failed to retrieve alert settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const settings = await request.json();
    await saveAlertSettingsJson(settings);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/alert-settings:', error);
    return NextResponse.json({ error: 'Failed to save alert settings' }, { status: 500 });
  }
}
