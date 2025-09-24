import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [totalEvents, upcomingEvents, totalRegistrations, totalNews, publishedNews, totalContacts, newContacts, totalUsers, activeUsers] = await Promise.all([
      prisma.event.count(),
      prisma.event.count({ where: { status: 'upcoming' } }),
      prisma.registration.count({ where: { status: { not: 'cancelled' } } }),
      prisma.news.count(),
      prisma.news.count({ where: { published: true } }),
      prisma.contact.count(),
      prisma.contact.count({ where: { status: 'new' } }),
      prisma.user.count(),
      prisma.user.count({ where: { status: 'active' } }),
    ]);

    const stats = {
      totalEvents,
      upcomingEvents,
      totalRegistrations,
      totalNews,
      publishedNews,
      totalContacts,
      newContacts,
      totalUsers,
      activeUsers,
    };
    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
