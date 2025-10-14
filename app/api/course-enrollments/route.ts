import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emailService } from '@/lib/email/emailService';
import { generateCourseEnrollmentConfirmEmail } from '@/lib/email/templates/courseEnrollmentConfirm';
import { generateCourseEnrollmentPendingEmail } from '@/lib/email/templates/courseEnrollmentPending';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    const whereClause = courseId ? { courseId: String(courseId) } : {};
    const enrollments = await prisma.courseEnrollment.findMany({ 
      where: whereClause, 
      include: {
        course: true
      },
      orderBy: { createdAt: 'desc' } 
    });
    return NextResponse.json({ success: true, data: enrollments });
  } catch (error) {
    console.error('Error fetching course enrollments:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch course enrollments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const courseId = String(body.courseId);
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return NextResponse.json({ success: false, error: 'Course not found' }, { status: 400 });
    }

    // Determine payment status and enrollment status based on course price
    let paymentStatus = 'pending';
    let enrollmentStatus = 'pending';
    
    if (course.price && course.price > 0) {
      if (body.transactionId) {
        paymentStatus = 'pending_verification'; // Cần admin xác thực
        enrollmentStatus = 'pending';
      } else {
        paymentStatus = 'pending'; // Chưa thanh toán
        enrollmentStatus = 'pending';
      }
    } else {
      paymentStatus = 'paid'; // Khóa học miễn phí
      enrollmentStatus = 'confirmed'; // Tự động xác nhận cho khóa học miễn phí
    }

    const created = await prisma.courseEnrollment.create({
      data: {
        id: body.id ? String(body.id) : undefined,
        courseId,
        fullName: body.fullName || '',
        email: body.email || '',
        phone: body.phone || null,
        status: body.status || enrollmentStatus,
        paymentStatus: paymentStatus,
        paymentMethod: body.paymentMethod || null,
        transactionId: body.transactionId || null,
        amount: body.amount || null,
      },
    });

    // Update denormalized count for the course
    const count = await prisma.courseEnrollment.count({ where: { courseId: created.courseId, NOT: { status: 'cancelled' } } });
    await prisma.course.update({ where: { id: created.courseId }, data: { enrolledCount: count } });

    // Send appropriate email based on payment status
    try {
      let emailSubject = '';
      let emailData;

      if (paymentStatus === 'pending_verification') {
        emailSubject = `⏳ Đang xử lý đăng ký: ${course.title}`;
        emailData = generateCourseEnrollmentPendingEmail({
          userName: created.fullName,
          userEmail: created.email,
          courseTitle: course.title,
          coursePrice: course.price,
          transactionId: created.transactionId || ''
        });
      } else {
        emailSubject = `🎉 Xác nhận đăng ký khóa học: ${course.title}`;
        emailData = generateCourseEnrollmentConfirmEmail({
          userName: created.fullName,
          userEmail: created.email,
          courseTitle: course.title,
          coursePrice: course.price
        });
      }

      const emailSent = await emailService.sendEmail({
        to: created.email,
        subject: emailSubject,
        html: emailData.html,
        text: emailData.text
      });

      if (!emailSent) {
        console.warn(`Failed to send ${paymentStatus === 'pending_verification' ? 'pending' : 'confirmation'} email to ${created.email}`);
      } else {
        console.log(`${paymentStatus === 'pending_verification' ? 'Pending' : 'Confirmation'} email sent successfully to ${created.email}`);
      }
    } catch (emailError) {
      console.error('Error sending email:', emailError);
    }

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error('Error creating course enrollment:', error);
    return NextResponse.json({ success: false, error: 'Failed to create course enrollment' }, { status: 500 });
  }
}


