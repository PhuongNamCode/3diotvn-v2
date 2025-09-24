import { NextResponse } from 'next/server';
import { getDataManager } from '@/lib/data-manager';

export async function GET() {
  try {
    const dataManager = getDataManager();
    const stats = dataManager.getStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
