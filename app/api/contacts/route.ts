import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sanitizeContactData } from '@/lib/sanitize';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;
    
    // Optimized query with pagination and selective fields
    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          company: true,
          role: true,
          message: true,
          type: true,
          status: true,
          priority: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.contact.count({ where })
    ]);
    
    const response = { 
      success: true, 
      data: contacts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Contacts fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Sanitize và validate input data
    const sanitizedData = sanitizeContactData(body);
    
    // Validate required fields
    if (!sanitizedData.name || sanitizedData.name.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Tên phải có ít nhất 2 ký tự' },
        { status: 400 }
      );
    }

    if (!sanitizedData.message || sanitizedData.message.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Nội dung tin nhắn phải có ít nhất 10 ký tự' },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ['partnership', 'support', 'general'];
    if (!validTypes.includes(sanitizedData.type)) {
      return NextResponse.json(
        { success: false, error: 'Loại liên hệ không hợp lệ' },
        { status: 400 }
      );
    }

    const created = await prisma.contact.create({
      data: {
        id: body.id ? String(body.id) : undefined,
        name: sanitizedData.name,
        email: sanitizedData.email,
        phone: sanitizedData.phone,
        company: sanitizedData.company,
        role: body.role || 'Contact',
        message: sanitizedData.message,
        type: sanitizedData.type,
        status: body.status || 'new',
        priority: body.priority || 'medium',
        notes: sanitizedData.notes,
      },
    });
    
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error('Contact creation error:', error);
    
    // Return specific error messages for validation errors
    if (error instanceof Error && error.message.includes('Lỗi validate')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Không thể tạo liên hệ. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}
