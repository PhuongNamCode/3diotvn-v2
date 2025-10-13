import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Simple Import API called');
    const formData = await request.formData();
    const file = formData.get('file') as File;

    console.log('📁 File received:', file ? {
      name: file.name,
      size: file.size,
      type: file.type
    } : 'No file');

    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'Không tìm thấy file' 
      }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'text/csv', 
      'application/octet-stream',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Định dạng file không được hỗ trợ. Vui lòng chọn file CSV hoặc Excel' 
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

    // Read file content
    console.log('📖 Reading file content...');
    
    let lines: string[] = [];
    
    if (file.type.includes('excel') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      // Handle Excel files - for now, just return error with instruction
      return NextResponse.json({ 
        success: false, 
        error: 'File Excel hiện tại chưa được hỗ trợ. Vui lòng chuyển đổi sang file CSV hoặc sử dụng cột đầu tiên chứa email và lưu dưới dạng CSV.' 
      }, { status: 400 });
    } else {
      // Handle CSV files
      const text = await file.text();
      console.log('📄 File content preview:', text.substring(0, 200));
      
      // Parse CSV
      lines = text.split('\n').filter(line => line.trim());
      console.log('📊 Total lines:', lines.length);
    }

    if (lines.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'File trống hoặc không có dữ liệu' 
      }, { status: 400 });
    }

    // Extract emails from first column
    const emails: string[] = [];
    const errors: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        // Split by comma and get first column
        const columns = line.split(',');
        const email = columns[0]?.trim();
        
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

    console.log('📧 Valid emails found:', emails.length);
    console.log('❌ Errors found:', errors.length);

    if (emails.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Không tìm thấy email hợp lệ nào trong file' 
      }, { status: 400 });
    }

    // Remove duplicates
    const uniqueEmails = [...new Set(emails)];
    console.log('📧 Unique emails:', uniqueEmails.length);

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

    console.log('📧 New emails:', newEmails.length);
    console.log('📧 Duplicate emails:', duplicateEmails.length);

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
      console.log('✅ Inserted emails:', insertedCount);
    }

    // Prepare response
    const result = {
      totalRows: lines.length,
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
    console.error('❌ Error importing file:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Có lỗi xảy ra khi xử lý file: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}
