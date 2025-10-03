import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emailService } from '@/lib/email/emailService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    const whereClause = courseId ? { courseId: String(courseId) } : {};
    const enrollments = await prisma.courseEnrollment.findMany({ where: whereClause, orderBy: { createdAt: 'desc' } });
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

    const created = await prisma.courseEnrollment.create({
      data: {
        id: body.id ? String(body.id) : undefined,
        courseId,
        fullName: body.fullName || '',
        email: body.email || '',
        phone: body.phone || null,
        status: body.status || 'pending',
      },
    });

    // Update denormalized count for the course
    const count = await prisma.courseEnrollment.count({ where: { courseId: created.courseId, NOT: { status: 'cancelled' } } });
    await prisma.course.update({ where: { id: created.courseId }, data: { enrolledCount: count } });

    // Send confirmation email (best effort)
    try {
      const html = `
        <div style="font-family:system-ui,sans-serif;line-height:1.6">
          <h2>🎉 Xác nhận đăng ký khóa học</h2>
          <p>Xin chào ${created.fullName},</p>
          <p>Bạn đã đăng ký thành công khóa học: <strong>${course.title}</strong>.</p>
          <ul>
            <li>Cấp độ: ${course.level}</li>
            <li>Thời lượng dự kiến: ${course.durationMinutes} phút</li>
          </ul>
          <p>Chúng tôi sẽ sớm gửi thêm thông tin chi tiết cho bạn.</p>
          <p>— 3DIoT Community</p>
        </div>
      `;
      await emailService.sendEmail({ to: created.email, subject: `Xác nhận đăng ký: ${course.title}`, html, text: `Ban da dang ky khoa hoc: ${course.title}` });
    } catch (emailError) {
      console.error('Error sending enrollment email:', emailError);
    }

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error('Error creating course enrollment:', error);
    return NextResponse.json({ success: false, error: 'Failed to create course enrollment' }, { status: 500 });
  }
}


