import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const incrementViews = searchParams.get('increment') === 'true';

    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        comments: {
          where: { approved: true },
          orderBy: { createdAt: 'asc' },
          include: {
            replies: {
              where: { approved: true },
              orderBy: { createdAt: 'asc' }
            }
          }
        }
      }
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Increment view count if requested
    if (incrementViews) {
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { views: { increment: 1 } }
      });
    }

    return NextResponse.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Blog post API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await request.json();
    const {
      title,
      content,
      excerpt,
      author,
      category,
      tags,
      featured,
      published,
      publishedAt,
      image,
      seoTitle,
      seoDescription
    } = body;

    // Check if slug is actually an ID (for admin operations)
    const isId = slug.length === 25; // CUID length
    const whereClause = isId ? { id: slug } : { slug };

    // Generate new slug if title changed
    let newSlug = slug;
    if (title) {
      newSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }

    // Calculate reading time if content changed
    let readingTime;
    if (content) {
      const wordCount = content.split(/\s+/).length;
      readingTime = Math.max(1, Math.ceil(wordCount / 200));
    }

    const updateData: any = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (excerpt) updateData.excerpt = excerpt;
    if (author) updateData.author = author;
    if (category) updateData.category = category;
    if (tags) updateData.tags = tags;
    if (featured !== undefined) updateData.featured = featured;
    if (published !== undefined) {
      updateData.published = published;
      if (published) {
        updateData.publishedAt = publishedAt ? new Date(publishedAt) : new Date();
      }
    }
    if (image !== undefined) updateData.image = image;
    if (seoTitle) updateData.seoTitle = seoTitle;
    if (seoDescription) updateData.seoDescription = seoDescription;
    if (readingTime) updateData.readingTime = readingTime;
    if (newSlug !== slug && !isId) updateData.slug = newSlug;

    const post = await prisma.blogPost.update({
      where: whereClause,
      data: updateData
    });

    return NextResponse.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Update blog post error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Check if slug is actually an ID (for admin operations)
    const isId = slug.length === 25; // CUID length
    const whereClause = isId ? { id: slug } : { slug };

    await prisma.blogPost.delete({
      where: whereClause
    });

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete blog post error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}
