import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Lấy thông tin dashboard của user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('email');

    console.log('🔍 Dashboard API called with email:', userEmail);

    if (!userEmail) {
      return NextResponse.json({
        success: false,
        error: 'Email is required'
      }, { status: 400 });
    }

    // Lấy thông tin khóa học đã đăng ký
    console.log('🔍 Querying enrollments for email:', userEmail);
    
    // First, try simple query without include
    const simpleEnrollments = await prisma.courseEnrollment.findMany({
      where: { 
        email: userEmail,
        status: 'confirmed'
      }
    });
    
    console.log('🔍 Simple query found:', simpleEnrollments.length);
    
    // Then try with include
    const enrollments = await prisma.courseEnrollment.findMany({
      where: { 
        email: userEmail,
        status: 'confirmed' // Chỉ lấy những khóa học đã đăng ký thành công
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            image: true,
            level: true,
            price: true,
            category: true,
            lessonsCount: true,
            durationMinutes: true,
            instructorName: true,
            instructorImage: true,
            status: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('🔍 Found enrollments with include:', enrollments.length);

    // Lấy thông tin sự kiện đã đăng ký
    const registrations = await prisma.registration.findMany({
      where: { 
        email: userEmail,
        status: 'confirmed' // Chỉ lấy những sự kiện đã xác nhận
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            description: true,
            date: true,
            time: true,
            location: true,
            image: true,
            category: true,
            price: true,
            status: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Thống kê tổng quan
    const stats = {
      totalCourses: enrollments.length,
      totalEvents: registrations.length,
      totalSpent: enrollments.reduce((sum, enrollment) => {
        return sum + (enrollment.amount || 0);
      }, 0),
      completedCourses: enrollments.filter(e => e.status === 'completed').length,
      upcomingEvents: registrations.filter(r => {
        const eventDate = new Date(r.event.date);
        return eventDate > new Date() && r.event.status === 'active';
      }).length
    };

    return NextResponse.json({
      success: true,
      data: {
        enrollments,
        registrations,
        stats
      }
    });

  } catch (error) {
    console.error('Error fetching user dashboard:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch user dashboard'
    }, { status: 500 });
  }
}
