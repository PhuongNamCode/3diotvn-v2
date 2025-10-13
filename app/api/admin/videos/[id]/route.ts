import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Lấy thông tin video
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const video = await prisma.courseVideo.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            category: true
          }
        }
      }
    });

    if (!video) {
      return NextResponse.json({
        success: false,
        error: 'Video không tồn tại'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: video
    });

  } catch (error) {
    console.error('Error fetching video:', error);
    return NextResponse.json({
      success: false,
      error: 'Lỗi khi lấy thông tin video'
    }, { status: 500 });
  }
}

// PUT - Cập nhật video
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { title, description, videoOrder, isPreview, status } = await request.json();

    const video = await prisma.courseVideo.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(videoOrder !== undefined && { videoOrder }),
        ...(isPreview !== undefined && { isPreview }),
        ...(status && { status })
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            category: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: video,
      message: 'Video đã được cập nhật thành công!'
    });

  } catch (error) {
    console.error('Error updating video:', error);
    return NextResponse.json({
      success: false,
      error: 'Lỗi khi cập nhật video'
    }, { status: 500 });
  }
}

// DELETE - Xóa video
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.courseVideo.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Video đã được xóa thành công!'
    });

  } catch (error) {
    console.error('Error deleting video:', error);
    return NextResponse.json({
      success: false,
      error: 'Lỗi khi xóa video'
    }, { status: 500 });
  }
}
