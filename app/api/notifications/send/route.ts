import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';
import { generateCourseNotificationTemplate, generateEventNotificationTemplate } from '@/lib/email/templates/notifications';

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

interface NotificationData {
  type: 'course' | 'event';
  courseId?: string;
  eventId?: string;
  title: string;
  description: string;
  date?: string;
  location?: string;
  price?: number;
  instructor?: string;
  category?: string;
}

async function getUniqueEmailList(): Promise<string[]> {
  try {
    // Lấy danh sách email từ bảng Users
    const users = await prisma.user.findMany({
      select: {
        email: true
      }
    });

    // Lấy danh sách email từ bảng Newsletter (chỉ active)
    const newsletterSubscribers = await prisma.newsletterSubscription.findMany({
      where: {
        status: 'active'
      },
      select: {
        email: true
      }
    });

    // Merge và loại bỏ trùng lặp
    const allEmails = [
      ...users.map(u => u.email).filter((email): email is string => email !== null),
      ...newsletterSubscribers.map(n => n.email)
    ];

    // Loại bỏ trùng lặp và email rỗng
    const uniqueEmails = [...new Set(allEmails)].filter(email => 
      email && email.trim() !== '' && email.includes('@')
    );

    console.log(`📧 Total unique emails: ${uniqueEmails.length}`);
    console.log(`👥 Users: ${users.length}, 📬 Newsletter: ${newsletterSubscribers.length}`);

    return uniqueEmails;
  } catch (error) {
    console.error('❌ Error getting email list:', error);
    throw error;
  }
}

async function sendNotificationEmail(
  email: string, 
  notificationData: NotificationData
): Promise<boolean> {
  try {
    const websiteUrl = 'https://3diot.vn';
    
    let emailTemplate;
    let subject;

    if (notificationData.type === 'course') {
      emailTemplate = generateCourseNotificationTemplate({
        courseTitle: notificationData.title,
        courseDescription: notificationData.description,
        coursePrice: notificationData.price || 0,
        courseInstructor: notificationData.instructor || '3DIoT Team',
        courseCategory: notificationData.category || 'IoT',
        websiteUrl
      });
      subject = `🎓 Khóa học mới: ${notificationData.title}`;
    } else {
      emailTemplate = generateEventNotificationTemplate({
        eventTitle: notificationData.title,
        eventDescription: notificationData.description,
        eventDate: notificationData.date || '',
        eventLocation: notificationData.location || 'Online',
        eventPrice: notificationData.price || 0,
        websiteUrl
      });
      subject = `🎉 Sự kiện mới: ${notificationData.title}`;
    }

    const mailOptions = {
      from: `"3DIoT" <${process.env.SMTP_USERNAME}>`,
      to: email,
      subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${email}: ${result.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send email to ${email}:`, error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, courseId, eventId, title, description, date, location, price, instructor, category } = body;

    // Validation
    if (!type || !['course', 'event'].includes(type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid notification type. Must be "course" or "event"' 
      }, { status: 400 });
    }

    if (!title || !description) {
      return NextResponse.json({ 
        success: false, 
        error: 'Title and description are required' 
      }, { status: 400 });
    }

    const notificationData: NotificationData = {
      type,
      courseId,
      eventId,
      title,
      description,
      date,
      location,
      price,
      instructor,
      category
    };

    // Lấy danh sách email duy nhất
    const emailList = await getUniqueEmailList();
    
    if (emailList.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No valid email addresses found' 
      }, { status: 400 });
    }

    console.log(`📤 Starting to send ${type} notifications to ${emailList.length} recipients...`);

    // Gửi email cho từng người dùng
    const results = await Promise.allSettled(
      emailList.map(email => sendNotificationEmail(email, notificationData))
    );

    const successful = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
    const failed = results.length - successful;

    console.log(`📊 Notification results: ${successful} successful, ${failed} failed`);

    // Lưu log vào database
    try {
      await prisma.notificationLog.create({
        data: {
          type,
          title,
          description,
          recipientCount: emailList.length,
          successCount: successful,
          failureCount: failed,
          courseId: courseId || null,
          eventId: eventId || null
        }
      });
    } catch (logError) {
      console.error('❌ Failed to save notification log:', logError);
    }

    return NextResponse.json({
      success: true,
      message: `Notifications sent successfully`,
      data: {
        totalRecipients: emailList.length,
        successful,
        failed,
        type,
        title
      }
    });

  } catch (error) {
    console.error('❌ Error sending notifications:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to send notifications' 
    }, { status: 500 });
  }
}

// GET endpoint để lấy thống kê notifications
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    const notifications = await prisma.notificationLog.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    const total = await prisma.notificationLog.count();

    return NextResponse.json({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch notifications' 
    }, { status: 500 });
  }
}
