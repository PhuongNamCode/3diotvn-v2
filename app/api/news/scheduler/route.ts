import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// This endpoint will be called by a cron job or external scheduler
export async function POST(request: NextRequest) {
  try {
    // Get current news settings
    const settings = await (prisma as any).setting.findMany({
      where: {
        key: {
          in: ['news.updateFrequency', 'news.lastRefreshAt', 'perplexity.apiKey', 'perplexity.model']
        }
      }
    });

    const settingsMap: Record<string, any> = {};
    settings.forEach((s: any) => {
      settingsMap[s.key] = s.json ?? s.value ?? null;
    });

    const updateFrequency = settingsMap['news.updateFrequency'] || 'weekly';
    const lastRefreshAt = settingsMap['news.lastRefreshAt'];
    const apiKey = settingsMap['perplexity.apiKey'];
    const model = settingsMap['perplexity.model'] || 'sonar';

    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'Perplexity API key not configured' 
      }, { status: 400 });
    }

    // Check if we should update based on frequency
    const now = new Date();
    const shouldUpdate = shouldUpdateNews(updateFrequency, lastRefreshAt, now);

    if (!shouldUpdate) {
      return NextResponse.json({ 
        success: true, 
        message: 'No update needed based on frequency',
        nextUpdate: getNextUpdateTime(updateFrequency, now)
      });
    }

    // Call the news refresh API
    const refreshResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/news/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!refreshResponse.ok) {
      throw new Error('Failed to refresh news');
    }

    const refreshData = await refreshResponse.json();

    // Update last refresh timestamp
    await (prisma as any).setting.upsert({
      where: { key: 'news.lastRefreshAt' },
      create: { key: 'news.lastRefreshAt', value: now.toISOString() },
      update: { value: now.toISOString() },
    });

    // Clean up old news (older than 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const deletedOldNews = await (prisma as any).news.deleteMany({
      where: {
        publishedAt: {
          lt: sevenDaysAgo
        }
      }
    });

    console.log(`Cleaned up ${deletedOldNews.count} old news articles`);

    return NextResponse.json({
      success: true,
      message: 'News updated successfully',
      data: {
        ...refreshData,
        cleanedUp: deletedOldNews.count
      },
      nextUpdate: getNextUpdateTime(updateFrequency, now)
    });

  } catch (error: any) {
    console.error('Scheduler error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

function shouldUpdateNews(frequency: string, lastRefreshAt: string | null, now: Date): boolean {
  if (frequency === 'manual') {
    return false;
  }

  if (!lastRefreshAt) {
    return true; // First time, always update
  }

  const lastUpdate = new Date(lastRefreshAt);
  const timeDiff = now.getTime() - lastUpdate.getTime();

  switch (frequency) {
    case 'daily':
      return timeDiff >= 24 * 60 * 60 * 1000; // 24 hours
    case 'weekly':
      // Update on Monday morning (assuming Monday is 1)
      const isMonday = now.getDay() === 1;
      const isMorning = now.getHours() >= 8 && now.getHours() < 12;
      return isMonday && isMorning && timeDiff >= 7 * 24 * 60 * 60 * 1000; // 7 days
    case 'monthly':
      return timeDiff >= 30 * 24 * 60 * 60 * 1000; // 30 days
    default:
      return false;
  }
}

function getNextUpdateTime(frequency: string, now: Date): string {
  const next = new Date(now);

  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      next.setHours(8, 0, 0, 0); // 8 AM next day
      break;
    case 'weekly':
      // Next Monday at 8 AM
      const daysUntilMonday = (1 - now.getDay() + 7) % 7;
      next.setDate(next.getDate() + (daysUntilMonday === 0 ? 7 : daysUntilMonday));
      next.setHours(8, 0, 0, 0);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      next.setDate(1);
      next.setHours(8, 0, 0, 0); // 1st of next month at 8 AM
      break;
    default:
      return 'Manual mode - no automatic updates';
  }

  return next.toISOString();
}

// GET endpoint to check next update time
export async function GET() {
  try {
    const settings = await (prisma as any).setting.findMany({
      where: {
        key: {
          in: ['news.updateFrequency', 'news.lastRefreshAt']
        }
      }
    });

    const settingsMap: Record<string, any> = {};
    settings.forEach((s: any) => {
      settingsMap[s.key] = s.json ?? s.value ?? null;
    });

    const updateFrequency = settingsMap['news.updateFrequency'] || 'weekly';
    const lastRefreshAt = settingsMap['news.lastRefreshAt'];

    return NextResponse.json({
      success: true,
      data: {
        frequency: updateFrequency,
        lastRefreshAt,
        nextUpdate: getNextUpdateTime(updateFrequency, new Date()),
        shouldUpdate: shouldUpdateNews(updateFrequency, lastRefreshAt, new Date())
      }
    });

  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
