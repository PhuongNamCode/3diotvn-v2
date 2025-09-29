import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/news - Get all news articles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const where: any = {};
    if (category && category !== 'all') {
      where.category = category;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { source: { contains: search, mode: 'insensitive' } },
      ];
    }

    const totalNews = await prisma.news.count({ where });
    const totalPages = Math.ceil(totalNews / limit);

    const news = await prisma.news.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { publishedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: news,
      pagination: {
        page,
        limit,
        total: totalNews,
        pages: totalPages,
      },
    });
  } catch (error: any) {
    console.error('Error fetching news:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/news - Delete news articles
export async function DELETE(request: NextRequest) {
  try {
    // For now, allow deletion without auth check (admin panel only)
    // In production, implement proper authentication

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const deleteAll = searchParams.get('deleteAll') === 'true';

    if (deleteAll) {
      // Delete all news articles
      const result = await prisma.news.deleteMany({});
      return NextResponse.json({ 
        success: true, 
        message: `Đã xóa ${result.count} bài tin tức`,
        deletedCount: result.count 
      });
    } else if (id) {
      // Delete specific news article
      await prisma.news.delete({ where: { id } });
      return NextResponse.json({ success: true, message: 'Đã xóa bài tin tức' });
    } else {
      return NextResponse.json({ success: false, error: 'Missing id parameter' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error deleting news:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}