import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emailService } from '@/lib/email/emailService';
import { generateRegistrationConfirmEmail } from '@/lib/email/templates/registrationConfirm';

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
    
    // Update registration
    const updated = await prisma.registration.update({
      where: { id },
      data: {
        paymentStatus,
        status: paymentStatus === 'paid' ? 'confirmed' : 'pending',
        // Có thể thêm trường adminNotes nếu cần
      },
      include: {
        event: true
      }
    });

    // If approved, send confirmation email
    if (paymentStatus === 'paid') {
      try {
        const emailData = generateRegistrationConfirmEmail({
          userName: updated.fullName,
          userEmail: updated.email,
          eventTitle: updated.event.title,
          eventDate: updated.event.date.toISOString(),
          eventTime: updated.event.time,
          eventLocation: updated.event.location,
          eventPrice: updated.event.price,
          onlineLink: updated.event.onlineLink || undefined
        });

        const emailSent = await emailService.sendEmail({
          to: updated.email,
          subject: `🎉 Xác nhận đăng ký: ${updated.event.title}`,
          html: emailData.html,
          text: emailData.text
        });

        if (!emailSent) {
          console.warn(`Failed to send confirmation email to ${updated.email}`);
        } else {
          console.log(`Confirmation email sent successfully to ${updated.email}`);
        }
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
      }
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating registration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update registration' },
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
    
    const registration = await prisma.registration.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Registration deleted successfully' });
  } catch (error) {
    console.error('Error deleting registration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete registration' },
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
    
    const registration = await prisma.registration.findUnique({
      where: { id },
      include: {
        event: true
      }
    });

    if (!registration) {
      return NextResponse.json(
        { success: false, error: 'Registration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: registration });
  } catch (error) {
    console.error('Error fetching registration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch registration' },
      { status: 500 }
    );
  }
}