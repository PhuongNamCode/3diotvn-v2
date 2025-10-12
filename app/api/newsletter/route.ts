import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ 
        success: false, 
        error: 'Email is required' 
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid email format' 
      }, { status: 400 });
    }

    // Check if email already exists
    const existingSubscription = await prisma.newsletterSubscription.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingSubscription) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email already subscribed' 
      }, { status: 409 });
    }

    // Create new subscription
    const subscription = await prisma.newsletterSubscription.create({
      data: {
        email: email.toLowerCase(),
        status: 'active',
        subscribedAt: new Date(),
        source: 'website_popup'
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully subscribed to newsletter',
      data: {
        id: subscription.id,
        email: subscription.email,
        subscribedAt: subscription.subscribedAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to subscribe to newsletter' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const status = searchParams.get('status') || 'active';
    
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (status !== 'all') {
      where.status = status;
    }

    const [subscriptions, total] = await Promise.all([
      prisma.newsletterSubscription.findMany({
        where,
        select: {
          id: true,
          email: true,
          status: true,
          subscribedAt: true,
          source: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { subscribedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.newsletterSubscription.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: subscriptions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching newsletter subscriptions:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch newsletter subscriptions' 
    }, { status: 500 });
  }
}
