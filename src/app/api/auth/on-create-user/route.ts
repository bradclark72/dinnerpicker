import { adminDb } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { uid, email } = await req.json();

    if (!uid) {
      return NextResponse.json({ error: 'Missing uid' }, { status: 400 });
    }

    const userRef = adminDb.collection('users').doc(uid);

    await userRef.set({
      id: uid,
      email: email || '',
      picksUsed: 0,
      isPremium: false,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error in on-create-user:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
