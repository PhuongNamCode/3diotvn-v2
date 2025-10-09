import { NextResponse } from 'next/server';

// GET - Get current reset code (for display purposes)
export async function GET() {
  try {
    const resetCode = process.env.ADMIN_RESET_CODE || '3DIOT2025';
    
    return NextResponse.json({
      success: true,
      data: {
        resetCode: resetCode,
        hasCustomCode: !!process.env.ADMIN_RESET_CODE
      }
    });
  } catch (error) {
    console.error('Error getting reset code:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get reset code' },
      { status: 500 }
    );
  }
}
