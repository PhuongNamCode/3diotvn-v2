import { NextRequest, NextResponse } from 'next/server';
import { getDataManager } from '@/lib/data-manager';

export async function GET() {
  try {
    const dataManager = getDataManager();
    const registrations = dataManager.getRegistrations();
    return NextResponse.json({ success: true, data: registrations });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Creating registration with data:', body);
    const dataManager = getDataManager();
    const registration = dataManager.createRegistration(body);
    return NextResponse.json({ success: true, data: registration }, { status: 201 });
  } catch (error) {
    console.error('Error creating registration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create registration' },
      { status: 500 }
    );
  }
}