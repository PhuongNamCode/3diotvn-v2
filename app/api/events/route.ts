import { NextRequest, NextResponse } from 'next/server';
import { getDataManager } from '@/lib/data-manager';

export async function GET() {
  try {
    // Force refresh all data before returning events
    const dataManager = getDataManager();
    dataManager.forceRefresh();
    const events = dataManager.getEvents();
    return NextResponse.json({ success: true, data: events });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Creating event with data:', body);
    const dataManager = getDataManager();
    const event = dataManager.createEvent(body);
    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create event' },
      { status: 500 }
    );
  }
}