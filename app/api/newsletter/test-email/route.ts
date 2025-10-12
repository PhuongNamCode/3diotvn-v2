import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST() {
  try {
    // Test email configuration
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Verify connection configuration
    await transporter.verify();
    
    console.log('✅ Email configuration is valid');
    
    // Send test email
    const testEmail = {
      from: `"3DIoT Test" <${process.env.SMTP_USERNAME}>`,
      to: process.env.SMTP_USERNAME, // Send to self for testing
      subject: 'Test Newsletter Email - 3DIoT',
      html: `
        <h2>Test Email từ 3DIoT Newsletter System</h2>
        <p>Đây là email test để kiểm tra cấu hình SMTP.</p>
        <p><strong>Thời gian:</strong> ${new Date().toLocaleString('vi-VN')}</p>
        <p><strong>Status:</strong> ✅ Email system hoạt động bình thường</p>
        <hr>
        <p><em>3DIoT - Newsletter System Test</em></p>
      `,
      text: `
        Test Email từ 3DIoT Newsletter System
        
        Đây là email test để kiểm tra cấu hình SMTP.
        Thời gian: ${new Date().toLocaleString('vi-VN')}
        Status: ✅ Email system hoạt động bình thường
        
        3DIoT - Newsletter System Test
      `
    };

    const result = await transporter.sendMail(testEmail);
    
    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      messageId: result.messageId,
      config: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE,
        user: process.env.SMTP_USERNAME,
      }
    });

  } catch (error) {
    console.error('❌ Email test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to send test email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
