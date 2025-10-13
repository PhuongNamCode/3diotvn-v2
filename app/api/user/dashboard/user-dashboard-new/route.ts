import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('email');

    if (!userEmail) {
      return NextResponse.json({
        success: false,
        error: 'Email is required'
      }, { status: 400 });
    }

    console.log('🔍 NEW API - Fetching dashboard data for:', userEmail);

    // Fetch enrolled courses (confirmed and paid)
    const enrollments = await prisma.courseEnrollment.findMany({
      where: {
        email: userEmail,
        status: 'confirmed',
        paymentStatus: 'paid'
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
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Fetch registered events (confirmed and paid)
    const registrations = await prisma.registration.findMany({
      where: {
        email: userEmail,
        status: 'confirmed',
        paymentStatus: 'paid'
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
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate stats
    const stats = {
      totalCourses: enrollments.length,
      totalEvents: registrations.length,
      totalSpent: enrollments.reduce((sum, e) => sum + (e.amount || 0), 0),
      completedCourses: enrollments.filter(e => e.status === 'completed').length,
      upcomingEvents: registrations.filter(r => {
        const eventDate = new Date(r.event.date);
        return eventDate > new Date() && r.event.status === 'active';
      }).length
    };

    console.log('📊 NEW API - Dashboard stats:', {
      enrollments: enrollments.length,
      registrations: registrations.length,
      totalSpent: stats.totalSpent
    });

    return NextResponse.json({
      success: true,
      data: {
        enrollments,
        registrations,
        stats
      },
      debug: {
        userEmail,
        enrollmentsCount: enrollments.length,
        registrationsCount: registrations.length,
        apiVersion: 'NEW_API_V1'
      }
    });

  } catch (error) {
    console.error('❌ NEW API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch user dashboard'
    }, { status: 500 });
  }
}
