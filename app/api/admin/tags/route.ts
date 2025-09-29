import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Lấy danh sách tags
export async function GET() {
  try {
    // Lấy tất cả tags từ database
    const posts = await prisma.blogPost.findMany({
      select: {
        tags: true
      }
    });

    // Đếm tần suất xuất hiện của mỗi tag
    const tagCounts: Record<string, number> = {};
    posts.forEach(post => {
      if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    // Sắp xếp theo tần suất giảm dần
    const popularTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      success: true,
      data: popularTags
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}

// POST - Thêm tag mới
export async function POST(request: NextRequest) {
  try {
    const { tag } = await request.json();

    if (!tag || typeof tag !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Tag is required and must be a string' },
        { status: 400 }
      );
    }

    // Kiểm tra tag đã tồn tại chưa
    const existingPosts = await prisma.blogPost.findMany({
      where: {
        tags: {
          array_contains: [tag]
        }
      }
    });

    if (existingPosts.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Tag already exists' },
        { status: 400 }
      );
    }

    // Tạo một bài viết tạm để lưu tag (hoặc có thể lưu vào bảng riêng)
    // Ở đây tôi sẽ tạo một bài viết tạm với tag này
    const tempPost = await prisma.blogPost.create({
      data: {
        title: `Temp post for tag: ${tag}`,
        slug: `temp-tag-${tag.toLowerCase().replace(/\s+/g, '-')}`,
        content: 'This is a temporary post to store the tag.',
        excerpt: 'Temporary post for tag storage.',
        author: 'System',
        category: 'System',
        tags: [tag],
        published: false
      }
    });

    return NextResponse.json({
      success: true,
      data: { tag, count: 1 },
      message: 'Tag added successfully'
    });
  } catch (error) {
    console.error('Error adding tag:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add tag' },
      { status: 500 }
    );
  }
}

// DELETE - Xóa tag
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag');

    if (!tag) {
      return NextResponse.json(
        { success: false, error: 'Tag parameter is required' },
        { status: 400 }
      );
    }

    // Tìm tất cả bài viết có tag này
    const postsWithTag = await prisma.blogPost.findMany({
      where: {
        tags: {
          array_contains: [tag]
        }
      }
    });

    // Xóa tag khỏi tất cả bài viết
    for (const post of postsWithTag) {
      const updatedTags = Array.isArray(post.tags) 
        ? post.tags.filter((t: string) => t !== tag)
        : [];
      
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { tags: updatedTags }
      });
    }

    return NextResponse.json({
      success: true,
      message: `Tag "${tag}" removed from ${postsWithTag.length} posts`
    });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete tag' },
      { status: 500 }
    );
  }
}
