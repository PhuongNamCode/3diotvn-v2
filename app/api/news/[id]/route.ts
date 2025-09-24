import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const news = await prisma.news.findUnique({ where: { id } });
    if (!news) {
      return NextResponse.json(
        { success: false, error: 'News not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: news });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const news = await prisma.news.update({
      where: { id },
      data: {
        title: body.title,
        content: body.content,
        excerpt: body.excerpt,
        author: body.author,
        source: body.source,
        category: body.category,
        importance: body.importance,
        published: body.published,
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
        image: body.image,
        tags: Array.isArray(body.tags) ? body.tags : undefined,
        link: body.link,
      },
    });
    if (!news) {
      return NextResponse.json(
        { success: false, error: 'News not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: news });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update news' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.news.delete({ where: { id } });
    const success = true;
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'News not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete news' },
      { status: 500 }
    );
  }
}