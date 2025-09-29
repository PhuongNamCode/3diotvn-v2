import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, author, email, content, parentId } = body;

    // Basic validation
    if (!postId || !author || !email || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if post exists
    const post = await prisma.blogPost.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Create comment
    const comment = await prisma.blogComment.create({
      data: {
        postId,
        author,
        email,
        content,
        parentId: parentId || null,
        approved: false // Comments need approval by default
      }
    });

    return NextResponse.json({
      success: true,
      data: comment,
      message: 'Comment submitted for approval'
    });
  } catch (error) {
    console.error('Create comment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const approved = searchParams.get('approved') !== 'false';

    const where: any = {};
    if (postId) where.postId = postId;
    if (approved) where.approved = true;

    const comments = await prisma.blogComment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        post: {
          select: { title: true, slug: true }
        },
        replies: {
          where: { approved: true },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: comments
    });
  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}
