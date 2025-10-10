import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emailService } from '@/lib/email/emailService';
import { generateRegistrationConfirmEmail } from '@/lib/email/templates/registrationConfirm';
import { generateRegistrationPendingEmail } from '@/lib/email/templates/registrationPending';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    
    const whereClause = eventId ? { eventId: String(eventId) } : {};
    
    const registrations = await prisma.registration.findMany({ 
      where: whereClause,
      include: {
        event: true
      },
      orderBy: { createdAt: 'desc' } 
    });
    
    return NextResponse.json({ success: true, data: registrations });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Validate event exists
    const eventId = String(body.eventId);
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 400 });
    }

    // Determine payment status based on event price and transaction ID
    let paymentStatus = 'pending';
    if (event.price && event.price > 0) {
      if (body.transactionId) {
        paymentStatus = 'pending_verification'; // Cần admin xác thực
      } else {
        paymentStatus = 'pending'; // Chưa thanh toán
      }
    } else {
      paymentStatus = 'paid'; // Sự kiện miễn phí
    }

    const created = await prisma.registration.create({
      data: {
        id: body.id ? String(body.id) : undefined,
        eventId,
        fullName: body.fullName || '',
        email: body.email || '',
        phone: body.phone || null,
        organization: body.organization || null,
        experience: body.experience || null,
        expectation: body.expectation || null,
        status: body.status || 'pending',
        paymentStatus: paymentStatus,
        paymentMethod: body.paymentMethod || null,
        transactionId: body.transactionId || null,
        amount: body.amount || null,
      },
    });

    // Update denormalized count for the event
    const count = await prisma.registration.count({ where: { eventId: created.eventId, NOT: { status: 'cancelled' } } });
    await prisma.event.update({ where: { id: created.eventId }, data: { registrationsCount: count } });

    // Send appropriate email based on payment status
    try {
      let emailSubject = '';
      let emailData;

      if (paymentStatus === 'pending_verification') {
        emailSubject = `⏳ Đang xử lý đăng ký: ${event.title}`;
        emailData = generateRegistrationPendingEmail({
          userName: created.fullName,
          userEmail: created.email,
          eventTitle: event.title,
          eventDate: event.date.toISOString(),
          eventTime: event.time,
          eventLocation: event.location,
          eventPrice: event.price,
          transactionId: created.transactionId || '',
          onlineLink: event.onlineLink || undefined
        });
      } else {
        emailSubject = `🎉 Xác nhận đăng ký: ${event.title}`;
        emailData = generateRegistrationConfirmEmail({
          userName: created.fullName,
          userEmail: created.email,
          eventTitle: event.title,
          eventDate: event.date.toISOString(),
          eventTime: event.time,
          eventLocation: event.location,
          eventPrice: event.price,
          onlineLink: event.onlineLink || undefined
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
      // Don't fail the registration if email fails
    }

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error('Error creating registration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create registration' },
      { status: 500 }
    );
  }
}