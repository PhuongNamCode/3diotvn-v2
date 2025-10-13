import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Dynamic import for XLSX
let XLSX: any;

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Import API called');
    const formData = await request.formData();
    const file = formData.get('file') as File;

    console.log('📁 File received:', file ? file.name : 'No file');

    if (!file) {
      console.log('❌ No file provided');
      return NextResponse.json({ 
        success: false, 
        error: 'Không tìm thấy file' 
      }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Định dạng file không được hỗ trợ. Vui lòng chọn file Excel (.xlsx, .xls) hoặc CSV' 
      }, { status: 400 });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        success: false, 
        error: 'File quá lớn. Vui lòng chọn file nhỏ hơn 5MB' 
      }, { status: 400 });
    }

    // Dynamic import XLSX
    if (!XLSX) {
      XLSX = await import('xlsx');
    }

    // Read file content
    console.log('📖 Reading file content...');
    const buffer = await file.arrayBuffer();
    let workbook: any;

    try {
      console.log('📊 Parsing file with XLSX...');
      workbook = XLSX.read(buffer, { type: 'buffer' });
      console.log('✅ File parsed successfully');
    } catch (error) {
      console.error('❌ Error parsing file:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Không thể đọc file. Vui lòng kiểm tra định dạng file' 
      }, { status: 400 });
    }

    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (data.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'File trống hoặc không có dữ liệu' 
      }, { status: 400 });
    }

    // Extract emails from first column
    const emails: string[] = [];
    const errors: string[] = [];
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i] as any[];
      if (row && row.length > 0) {
        const email = row[0]?.toString().trim();
        
        if (email) {
          // Basic email validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (emailRegex.test(email)) {
            emails.push(email.toLowerCase());
          } else {
            errors.push(`Dòng ${i + 1}: Email không hợp lệ - "${email}"`);
          }
        }
      }
    }

    if (emails.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Không tìm thấy email hợp lệ nào trong file' 
      }, { status: 400 });
    }

    // Remove duplicates
    const uniqueEmails = [...new Set(emails)];

    // Check existing emails
    const existingEmails = await prisma.newsletterSubscription.findMany({
      where: {
        email: {
          in: uniqueEmails
        }
      },
      select: {
        email: true
      }
    });

    const existingEmailSet = new Set(existingEmails.map(e => e.email));
    const newEmails = uniqueEmails.filter(email => !existingEmailSet.has(email));
    const duplicateEmails = uniqueEmails.filter(email => existingEmailSet.has(email));

    // Insert new emails
    let insertedCount = 0;
    if (newEmails.length > 0) {
      const insertData = newEmails.map(email => ({
        email,
        status: 'active',
        source: 'excel_import'
      }));

      await prisma.newsletterSubscription.createMany({
        data: insertData,
        skipDuplicates: true
      });
      
      insertedCount = newEmails.length;
    }

    // Prepare response
    const result = {
      totalRows: data.length,
      validEmails: emails.length,
      uniqueEmails: uniqueEmails.length,
      newEmails: newEmails.length,
      duplicateEmails: duplicateEmails.length,
      insertedCount,
      errors: errors.slice(0, 10), // Limit errors to first 10
      duplicateEmailList: duplicateEmails.slice(0, 10) // Limit to first 10
    };

    return NextResponse.json({
      success: true,
      message: `Import thành công! Đã thêm ${insertedCount} email mới`,
      data: result
    });

  } catch (error) {
    console.error('❌ Error importing Excel file:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Có lỗi xảy ra khi xử lý file' 
    }, { status: 500 });
  }
}

// GET endpoint để lấy thống kê import
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    // Get newsletter subscriptions imported from Excel
    const imports = await prisma.newsletterSubscription.findMany({
      where: {
        source: 'excel_import'
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    const total = await prisma.newsletterSubscription.count({
      where: {
        source: 'excel_import'
      }
    });

    return NextResponse.json({
      success: true,
      data: imports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching import data:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch import data' 
    }, { status: 500 });
  }
}
