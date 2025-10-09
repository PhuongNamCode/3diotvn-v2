import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@/lib/cache';

/**
 * GET /api/cache/stats - Get cache statistics
 */
export async function GET() {
  try {
    const stats = cache.getStats();
    
    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get cache stats' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cache/stats - Clear all cache
 */
export async function DELETE() {
  try {
    cache.clear();
    
    return NextResponse.json({
      success: true,
      message: 'Cache cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}
