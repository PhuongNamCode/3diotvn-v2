import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emailService } from '@/lib/email/emailService';
import { generateCourseEnrollmentConfirmEmail } from '@/lib/email/templates/courseEnrollmentConfirm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { paymentStatus, adminNotes } = body;
    
    if (!paymentStatus || !['paid', 'failed'].includes(paymentStatus)) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment status' },
        { status: 400 }
      );
    }

    const { id } = await params;
    
    // Update enrollment
    const updated = await prisma.courseEnrollment.update({
      where: { id },
      data: {
        paymentStatus,
        status: paymentStatus === 'paid' ? 'confirmed' : 'pending',
        // Có thể thêm trường adminNotes nếu cần
      },
      include: {
        course: true
      }
    });

    // If approved, send confirmation email
    if (paymentStatus === 'paid' && updated.course) {
      try {
        const emailData = generateCourseEnrollmentConfirmEmail({
          userName: updated.fullName,
          userEmail: updated.email,
          courseTitle: updated.course.title,
          coursePrice: updated.course.price
        });

        const emailSent = await emailService.sendEmail({
          to: updated.email,
          subject: `🎉 Xác nhận đăng ký khóa học: ${updated.course.title}`,
          html: emailData.html,
          text: emailData.text
        });

        if (!emailSent) {
          console.warn(`Failed to send confirmation email to ${updated.email}`);
        } else {
          console.log(`Confirmation email sent successfully to ${updated.email}`);
        }
      } catch (emailError) {
        console.error('Error sending confirmation email after approval:', emailError);
      }
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating course enrollment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update course enrollment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const enrollment = await prisma.courseEnrollment.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Course enrollment deleted successfully' });
  } catch (error) {
    console.error('Error deleting course enrollment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete course enrollment' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: { id },
      include: {
        course: true
      }
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: 'Course enrollment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: enrollment });
  } catch (error) {
    console.error('Error fetching course enrollment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch course enrollment' },
      { status: 500 }
    );
  }
}