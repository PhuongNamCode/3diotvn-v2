import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cache, CACHE_KEYS, CACHE_TTL, cacheInvalidation } from '@/lib/cache';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    
    // Generate cache key
    const cacheKey = CACHE_KEYS.EVENTS(page, limit, category || undefined, status || undefined);
    
    // Try to get from cache first
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log(`🎯 Cache HIT: ${cacheKey}`);
      return NextResponse.json(cached);
    }
    
    console.log(`💾 Cache MISS: ${cacheKey}`);
    
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: any = {};
    if (category) where.category = category;
    if (status) where.status = status;
    
    // Optimized query with selective loading and aggregation
    const [events, total, registrationCounts] = await Promise.all([
      prisma.event.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          date: true,
          time: true,
          location: true,
          onlineLink: true,
          capacity: true,
          price: true,
          speakers: true,
          requirements: true,
          agenda: true,
          image: true,
          category: true,
          status: true,
          actualParticipants: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.event.count({ where }),
      // Get registration counts in a single query
      prisma.registration.groupBy({
        by: ['eventId'],
        where: { status: { not: 'cancelled' } },
        _count: { id: true },
      })
    ]);

    // Create a map for quick lookup of registration counts
    const registrationMap = new Map(
      registrationCounts.map(item => [item.eventId, item._count.id])
    );

    const mapped = events.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      date: e.date,
      time: e.time,
      location: e.location,
      onlineLink: e.onlineLink || null,
      capacity: e.capacity,
      price: e.price,
      speakers: (e.speakers as any) || [],
      requirements: e.requirements || '',
      agenda: e.agenda || '',
      image: e.image || '',
      category: e.category,
      status: e.status,
      registrations: registrationMap.get(e.id) || 0,
      actualParticipants: e.actualParticipants ?? undefined,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    }));

    const response = { 
      success: true, 
      data: mapped,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
    
    // Cache the response
    cache.set(cacheKey, response, CACHE_TTL.EVENTS);
    
    return NextResponse.json(response);
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
    // Basic validation for required fields
    if (!body?.title || !body?.date || !body?.time || !body?.location) {
      return NextResponse.json({ success: false, error: 'Thiếu trường bắt buộc (title, date, time, location)' }, { status: 400 });
    }
    // Sanitize numeric fields
    const capacityVal = Number.isFinite(Number(body.capacity)) ? Number(body.capacity) : 0;
    const priceVal = Number.isFinite(Number(body.price)) ? Number(body.price) : 0;
    const actualParticipantsVal =
      body.actualParticipants !== undefined && Number.isFinite(Number(body.actualParticipants))
        ? Number(body.actualParticipants)
        : null;

    // Sanitize arrays
    const speakersVal = Array.isArray(body.speakers)
      ? (body.speakers as any[]).map((s) => String(s)).filter((s) => s.trim().length > 0)
      : typeof body.speakers === 'string'
        ? String(body.speakers).split(',').map((s) => s.trim()).filter((s) => s.length > 0)
        : [];

    const created = await prisma.event.create({
      data: {
        // If no id provided, use a timestamp string to remain compatible with legacy numeric parsing
        id: String(body.id || Date.now().toString()),
        title: body.title || '',
        description: body.description || '',
        date: body.date && !isNaN(new Date(body.date).getTime()) ? new Date(body.date) : new Date(),
        time: body.time || '',
        location: body.location || '',
        onlineLink: body.onlineLink || null,
        capacity: capacityVal,
        price: priceVal,
        speakers: speakersVal,
        requirements: body.requirements || null,
        agenda: body.agenda || null,
        image: body.image || null,
        category: body.category || 'workshop',
        status: body.status || 'upcoming',
        actualParticipants: actualParticipantsVal,
      },
    });

    const mapped = {
      id: created.id,
      title: created.title,
      description: created.description,
      date: created.date,
      time: created.time,
      location: created.location,
      onlineLink: created.onlineLink || null,
      capacity: created.capacity,
      price: created.price,
      speakers: (created.speakers as any) || [],
      requirements: created.requirements || '',
      agenda: created.agenda || '',
      image: created.image || '',
      category: created.category,
      status: created.status,
      registrations: 0,
      actualParticipants: created.actualParticipants ?? undefined,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };

    // Invalidate events cache when new event is created
    cacheInvalidation.invalidateEvents();
    
    return NextResponse.json({ success: true, data: mapped }, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create event' },
      { status: 500 }
    );
  }
}