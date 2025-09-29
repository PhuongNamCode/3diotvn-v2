import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/news/cleanup - Clean up old news articles
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const daysOld = parseInt(searchParams.get('days') || '7'); // Default 7 days
    
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    
    // Count articles to be deleted
    const countToDelete = await (prisma as any).news.count({
      where: {
        publishedAt: {
          lt: cutoffDate
        }
      }
    });

    // Delete old articles
    const result = await (prisma as any).news.deleteMany({
      where: {
        publishedAt: {
          lt: cutoffDate
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${result.count} news articles older than ${daysOld} days`,
      data: {
        deletedCount: result.count,
        cutoffDate: cutoffDate.toISOString(),
        daysOld
      }
    });

  } catch (error: any) {
    console.error('Cleanup error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// GET /api/news/cleanup - Check how many articles would be deleted
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const daysOld = parseInt(searchParams.get('days') || '7');
    
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    
    const countToDelete = await (prisma as any).news.count({
      where: {
        publishedAt: {
          lt: cutoffDate
        }
      }
    });

    const totalNews = await (prisma as any).news.count();

    return NextResponse.json({
      success: true,
      data: {
        totalNews,
        oldNewsCount: countToDelete,
        cutoffDate: cutoffDate.toISOString(),
        daysOld,
        willKeep: totalNews - countToDelete
      }
    });

  } catch (error: any) {
    console.error('Cleanup check error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
