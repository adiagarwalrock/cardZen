import { NextResponse } from 'next/server';
import { getUserProfile, saveUserProfile } from '@/lib/database';

export async function GET() {
  try {
    const profile = await getUserProfile();
    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error in GET /api/user-profile:', error);
    return NextResponse.json({ error: 'Failed to retrieve user profile' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const profile = await request.json();
    const savedProfile = await saveUserProfile(profile);
    return NextResponse.json(savedProfile);
  } catch (error) {
    console.error('Error in POST /api/user-profile:', error);
    return NextResponse.json({ error: 'Failed to save user profile' }, { status: 500 });
  }
}