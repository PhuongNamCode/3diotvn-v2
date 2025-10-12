import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      total,
      active,
      inactive,
      todaySubscriptions,
      weekSubscriptions,
    ] = await Promise.all([
      prisma.newsletterSubscription.count(),
      prisma.newsletterSubscription.count({ where: { status: 'active' } }),
      prisma.newsletterSubscription.count({ where: { status: 'inactive' } }),
      prisma.newsletterSubscription.count({
        where: {
          subscribedAt: { gte: today }
        }
      }),
      prisma.newsletterSubscription.count({
        where: {
          subscribedAt: { gte: weekAgo }
        }
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        total,
        active,
        inactive,
        todaySubscriptions,
        weekSubscriptions,
      }
    });

  } catch (error) {
    console.error('Error fetching newsletter stats:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch newsletter statistics'
    }, { status: 500 });
  }
}
