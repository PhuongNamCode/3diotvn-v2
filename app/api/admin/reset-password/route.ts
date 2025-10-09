import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sanitizeAdminCredentials, InputSanitizer } from '@/lib/sanitize';

// Interface for admin credentials
interface AdminCredentials {
  username: string;
  password: string;
}

// Get admin credentials from database
async function getAdminCredentials(): Promise<AdminCredentials | null> {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'admin_credentials' }
    });
    
    if (!setting || !setting.json) {
      return null;
    }
    
    return setting.json as unknown as AdminCredentials;
  } catch (error) {
    console.error('Error getting admin credentials:', error);
    return null;
  }
}

// Save admin credentials to database
async function saveAdminCredentials(credentials: AdminCredentials): Promise<boolean> {
  try {
    await prisma.setting.upsert({
      where: { key: 'admin_credentials' },
      update: {
        json: credentials as any,
        updatedAt: new Date()
      },
      create: {
        key: 'admin_credentials',
        json: credentials as any,
        updatedAt: new Date()
      }
    });
    return true;
  } catch (error) {
    console.error('Error saving admin credentials:', error);
    return false;
  }
}

// POST - Reset admin password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, newPassword, confirmPassword, resetCode } = body;

    // Validate input
    if (!username || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng điền đầy đủ thông tin' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Password xác nhận không khớp' },
        { status: 400 }
      );
    }

    // Sanitize input data
    let sanitizedCredentials;
    try {
      sanitizedCredentials = sanitizeAdminCredentials({
        username: username,
        password: newPassword
      });
    } catch (error) {
      return NextResponse.json(
        { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 400 }
      );
    }

    // Sanitize reset code
    const sanitizedResetCode = InputSanitizer.sanitizeText(resetCode || '');

    // Get current credentials
    const credentials = await getAdminCredentials();
    
    if (!credentials) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy thông tin admin' },
        { status: 404 }
      );
    }

    // Verify username
    if (credentials.username !== sanitizedCredentials.username) {
      return NextResponse.json(
        { success: false, error: 'Username không chính xác' },
        { status: 401 }
      );
    }

    // Verify reset code from environment variable
    const validResetCode = process.env.ADMIN_RESET_CODE || '3DIOT2025'; // Fallback to default if not set
    if (sanitizedResetCode !== validResetCode) {
      return NextResponse.json(
        { success: false, error: 'Mã reset không chính xác' },
        { status: 401 }
      );
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(sanitizedCredentials.password, 10);

    // Save new credentials
    const newCredentials: AdminCredentials = {
      username: credentials.username,
      password: hashedNewPassword
    };

    const saved = await saveAdminCredentials(newCredentials);
    
    if (!saved) {
      return NextResponse.json(
        { success: false, error: 'Không thể lưu password mới' },
        { status: 500 }
      );
    }

    // Log the password reset (optional - for audit trail)
    try {
      await prisma.setting.upsert({
        where: { key: 'admin_password_reset_log' },
        update: {
          json: {
            ...((await prisma.setting.findUnique({ where: { key: 'admin_password_reset_log' } }))?.json as any || {}),
            [new Date().toISOString()]: {
              action: 'password_reset',
              username: username,
              timestamp: new Date().toISOString(),
              ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
            }
          },
          updatedAt: new Date()
        },
        create: {
          key: 'admin_password_reset_log',
          json: {
            [new Date().toISOString()]: {
              action: 'password_reset',
              username: username,
              timestamp: new Date().toISOString(),
              ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
            }
          },
          updatedAt: new Date()
        }
      });
    } catch (logError) {
      console.error('Error logging password reset:', logError);
      // Don't fail the main operation if logging fails
    }

    return NextResponse.json({
      success: true,
      message: 'Reset password thành công! Vui lòng đăng nhập lại với password mới.',
      data: {
        username: username
      }
    });

  } catch (error) {
    console.error('Error resetting admin password:', error);
    return NextResponse.json(
      { success: false, error: 'Có lỗi xảy ra khi reset password' },
      { status: 500 }
    );
  }
}
