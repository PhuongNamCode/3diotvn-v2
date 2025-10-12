import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';
import { newsletterWelcomeTemplate } from '@/lib/email/templates/newsletterWelcome';

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

async function sendWelcomeEmail(email: string, subscriptionId: string) {
  try {
    console.log(`📧 Attempting to send welcome email to: ${email}`);
    console.log(`🔧 SMTP Config: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
    console.log(`👤 From: ${process.env.SMTP_USERNAME}`);
    
    const websiteUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const unsubscribeUrl = `${websiteUrl}/unsubscribe?token=${subscriptionId}`;
    
    const html = newsletterWelcomeTemplate.html
      .replace(/\{\{email\}\}/g, email)
      .replace(/\{\{websiteUrl\}\}/g, websiteUrl)
      .replace(/\{\{unsubscribeUrl\}\}/g, unsubscribeUrl);
    
    const text = newsletterWelcomeTemplate.text
      .replace(/\{\{email\}\}/g, email)
      .replace(/\{\{websiteUrl\}\}/g, websiteUrl)
      .replace(/\{\{unsubscribeUrl\}\}/g, unsubscribeUrl);

    const mailOptions = {
      from: `"3DIoT" <${process.env.SMTP_USERNAME}>`,
      to: email,
      subject: newsletterWelcomeTemplate.subject,
      html,
      text,
    };

    console.log(`📤 Sending email with options:`, {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    const result = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Welcome email sent successfully to ${email}`);
    console.log(`📧 Message ID: ${result.messageId}`);
    console.log(`📨 Response: ${result.response}`);
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    console.error('❌ Full error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: error instanceof Error && 'code' in error ? (error as any).code : undefined,
      stack: error instanceof Error ? error.stack : undefined
    });
    // Don't throw error - subscription should still succeed even if email fails
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ 
        success: false, 
        error: 'Email is required' 
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid email format' 
      }, { status: 400 });
    }

    // Check if email already exists
    const existingSubscription = await prisma.newsletterSubscription.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingSubscription) {
      if (existingSubscription.status === 'active') {
        return NextResponse.json({ 
          success: false, 
          error: 'Email already subscribed' 
        }, { status: 409 });
      } else {
        // If status is inactive, reactivate it
        const updatedSubscription = await prisma.newsletterSubscription.update({
          where: { email: email.toLowerCase() },
          data: { 
            status: 'active',
            subscribedAt: new Date(),
            updatedAt: new Date()
          }
        });
        
        // Send welcome email
        sendWelcomeEmail(email.toLowerCase(), updatedSubscription.id);
        
        return NextResponse.json({ 
          success: true, 
          message: 'Successfully re-subscribed to newsletter',
          data: {
            id: updatedSubscription.id,
            email: updatedSubscription.email,
            subscribedAt: updatedSubscription.subscribedAt
          }
        }, { status: 200 });
      }
    }

    // Create new subscription
    const subscription = await prisma.newsletterSubscription.create({
      data: {
        email: email.toLowerCase(),
        status: 'active',
        subscribedAt: new Date(),
        source: 'website_popup'
      }
    });

    // Send welcome email (async, don't wait for it)
    sendWelcomeEmail(email.toLowerCase(), subscription.id);

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully subscribed to newsletter',
      data: {
        id: subscription.id,
        email: subscription.email,
        subscribedAt: subscription.subscribedAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to subscribe to newsletter' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const status = searchParams.get('status') || 'active';
    const search = searchParams.get('search') || '';
    
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (status !== 'all') {
      where.status = status;
    }
    
    if (search) {
      where.email = {
        contains: search.toLowerCase(),
        mode: 'insensitive'
      };
    }

    const [subscriptions, total] = await Promise.all([
      prisma.newsletterSubscription.findMany({
        where,
        select: {
          id: true,
          email: true,
          status: true,
          subscribedAt: true,
          source: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { subscribedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.newsletterSubscription.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: subscriptions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching newsletter subscriptions:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch newsletter subscriptions' 
    }, { status: 500 });
  }
}
