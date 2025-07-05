import { NextResponse } from 'next/server';
import { getSecuritySettingsJson, saveSecuritySettingsJson } from '@/lib/json-storage';

export async function GET() {
  try {
    const settings = await getSecuritySettingsJson();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error in GET /api/security-settings:', error);
    return NextResponse.json({ error: 'Failed to retrieve security settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const settings = await request.json();
    await saveSecuritySettingsJson(settings);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/security-settings:', error);
    return NextResponse.json({ error: 'Failed to save security settings' }, { status: 500 });
  }
}
