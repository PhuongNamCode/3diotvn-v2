import { NextRequest, NextResponse } from 'next/server';
import { getDataManager } from '@/lib/data-manager';

export async function GET() {
  try {
    const dataManager = getDataManager();
    const users = dataManager.getUsers();
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const dataManager = getDataManager();
    const user = dataManager.createUser(body);
    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
