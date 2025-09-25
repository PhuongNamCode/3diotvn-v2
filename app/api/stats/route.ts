import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Calculate current month range (most recent month)
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [totalEvents, upcomingEvents, totalRegistrations, totalNews, publishedNews, totalContacts, newContacts, totalUsers, activeUsers] = await Promise.all([
      prisma.event.count({ where: { createdAt: { gte: monthStart, lt: nextMonthStart } } }),
      prisma.event.count({ where: { status: 'upcoming', createdAt: { gte: monthStart, lt: nextMonthStart } } }),
      prisma.registration.count({ where: { status: { not: 'cancelled' }, createdAt: { gte: monthStart, lt: nextMonthStart } } }),
      prisma.news.count({ where: { createdAt: { gte: monthStart, lt: nextMonthStart } } }),
      prisma.news.count({ where: { published: true, createdAt: { gte: monthStart, lt: nextMonthStart } } }),
      prisma.contact.count({ where: { createdAt: { gte: monthStart, lt: nextMonthStart } } }),
      prisma.contact.count({ where: { status: 'new', createdAt: { gte: monthStart, lt: nextMonthStart } } }),
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
      range: { from: monthStart.toISOString(), to: nextMonthStart.toISOString() }
    };
    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
