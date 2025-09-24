import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const items = await prisma.news.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const created = await prisma.news.create({
      data: {
        id: body.id ? String(body.id) : undefined,
        title: body.title || '',
        content: body.content || '',
        excerpt: body.excerpt || '',
        author: body.author || '',
        source: body.source || '',
        category: body.category || '',
        importance: body.importance || 'low',
        published: Boolean(body.published),
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
        image: body.image || null,
        tags: Array.isArray(body.tags) ? body.tags : [],
        link: body.link || null,
      },
    });
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create news' },
      { status: 500 }
    );
  }
}