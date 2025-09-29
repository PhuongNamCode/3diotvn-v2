import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured') === 'true';
    const publishedParam = searchParams.get('published');
    const published = publishedParam === null ? undefined : publishedParam === 'true';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (published !== undefined) {
      where.published = published;
    }
    
    if (category) {
      where.category = category;
    }
    
    if (featured) {
      where.featured = true;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (tag) {
      where.tags = {
        array_contains: [tag]
      };
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: [
          { featured: 'desc' },
          { publishedAt: 'desc' }
        ],
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          author: true,
          category: true,
          tags: true,
          featured: true,
          published: true,
          publishedAt: true,
          image: true,
          views: true,
          likes: true,
          readingTime: true,
          createdAt: true,
          _count: {
            select: { comments: true }
          }
        }
      }),
      prisma.blogPost.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Blog API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      content,
      excerpt,
      author,
      category,
      tags,
      featured = false,
      published = false,
      image,
      seoTitle,
      seoDescription
    } = body;

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Calculate reading time (average 200 words per minute)
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        author,
        category,
        tags: tags || [],
        featured,
        published,
        publishedAt: published ? new Date() : null,
        image,
        readingTime,
        seoTitle,
        seoDescription
      }
    });

    return NextResponse.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Create blog post error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create blog post' },
      { status: 500 }
    );
  }
}
