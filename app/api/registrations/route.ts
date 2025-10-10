import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emailService } from '@/lib/email/emailService';
import { generateRegistrationConfirmEmail } from '@/lib/email/templates/registrationConfirm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    
    const whereClause = eventId ? { eventId: String(eventId) } : {};
    
    const registrations = await prisma.registration.findMany({ 
      where: whereClause,
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
        paymentStatus: body.paymentStatus || 'pending',
        paymentMethod: body.paymentMethod || null,
        transactionId: body.transactionId || null,
        amount: body.amount || null,
      },
    });

    // Update denormalized count for the event
    const count = await prisma.registration.count({ where: { eventId: created.eventId, NOT: { status: 'cancelled' } } });
    await prisma.event.update({ where: { id: created.eventId }, data: { registrationsCount: count } });

    // Send confirmation email
    try {
      const emailData = generateRegistrationConfirmEmail({
        userName: created.fullName,
        userEmail: created.email,
        eventTitle: event.title,
        eventDate: event.date.toISOString(),
        eventTime: event.time,
        eventLocation: event.location,
        eventPrice: event.price,
        onlineLink: event.onlineLink || undefined
      });

      const emailSent = await emailService.sendEmail({
        to: created.email,
        subject: `🎉 Xác nhận đăng ký: ${event.title}`,
        html: emailData.html,
        text: emailData.text
      });

      if (!emailSent) {
        console.warn(`Failed to send confirmation email to ${created.email}`);
      } else {
        console.log(`Confirmation email sent successfully to ${created.email}`);
      }
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
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