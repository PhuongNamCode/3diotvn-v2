import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({ success: true, message: 'API is working' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed' },
      { status: 500 }
    );
  }
}
