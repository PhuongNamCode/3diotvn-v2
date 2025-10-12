import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Newsletter API is working!' });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({ 
      success: true, 
      message: 'Test newsletter API working',
      data: body 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to parse request' 
    }, { status: 500 });
  }
}
