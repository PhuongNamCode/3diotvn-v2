import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sanitizeAdminCredentials } from '@/lib/sanitize';

// Interface for admin credentials
interface AdminCredentials {
  username: string;
  password: string;
}

// Get current admin credentials from database
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

// Initialize default admin credentials if not exists
async function initializeDefaultCredentials(): Promise<AdminCredentials> {
  // Get credentials from environment variables (SECURE)
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminUsername || !adminPassword) {
    throw new Error('ADMIN_USERNAME and ADMIN_PASSWORD environment variables must be set');
  }
  
  const defaultCredentials: AdminCredentials = {
    username: adminUsername,
    password: await bcrypt.hash(adminPassword, 10) // Hash the secure password
  };
  
  await saveAdminCredentials(defaultCredentials);
  return defaultCredentials;
}

// GET - Get current admin credentials info (without password)
export async function GET() {
  try {
    let credentials = await getAdminCredentials();
    
    // If no credentials exist, initialize with defaults
    if (!credentials) {
      credentials = await initializeDefaultCredentials();
    }
    
    return NextResponse.json({
      success: true,
      data: {
        username: credentials.username,
        hasPassword: !!credentials.password
      }
    });
  } catch (error) {
    console.error('Error getting admin credentials:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get admin credentials' },
      { status: 500 }
    );
  }
}

// POST - Change admin credentials
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { currentUsername, currentPassword, newUsername, newPassword } = body;

    // Validate input
    if (!currentUsername || !currentPassword || !newUsername || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      );
    }

    // Sanitize input data
    let sanitizedNewCredentials;
    try {
      sanitizedNewCredentials = sanitizeAdminCredentials({
        username: newUsername,
        password: newPassword
      });
    } catch (error) {
      return NextResponse.json(
        { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 400 }
      );
    }

    // Sanitize current username for comparison
    const sanitizedCurrentUsername = sanitizedNewCredentials.username !== newUsername ? 
      newUsername.trim() : currentUsername.trim();

    // Get current credentials
    let credentials = await getAdminCredentials();
    
    // If no credentials exist, initialize with defaults
    if (!credentials) {
      credentials = await initializeDefaultCredentials();
    }

    // Verify current credentials
    const isUsernameValid = credentials.username === sanitizedCurrentUsername;
    const isPasswordValid = await bcrypt.compare(currentPassword, credentials.password);
    
    if (!isUsernameValid || !isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Username hoặc password hiện tại không chính xác' },
        { status: 401 }
      );
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(sanitizedNewCredentials.password, 10);

    // Save new credentials
    const newCredentials: AdminCredentials = {
      username: sanitizedNewCredentials.username,
      password: hashedNewPassword
    };

    const saved = await saveAdminCredentials(newCredentials);
    
    if (!saved) {
      return NextResponse.json(
        { success: false, error: 'Không thể lưu thông tin mới' },
        { status: 500 }
      );
    }

    // Log the credential change (optional - for audit trail)
    try {
      await prisma.setting.upsert({
        where: { key: 'admin_credentials_log' },
        update: {
          json: {
            ...((await prisma.setting.findUnique({ where: { key: 'admin_credentials_log' } }))?.json as any || {}),
            [new Date().toISOString()]: {
              action: 'credentials_changed',
              oldUsername: sanitizedCurrentUsername,
              newUsername: sanitizedNewCredentials.username,
              timestamp: new Date().toISOString()
            }
          },
          updatedAt: new Date()
        },
        create: {
          key: 'admin_credentials_log',
          json: {
            [new Date().toISOString()]: {
              action: 'credentials_changed',
              oldUsername: sanitizedCurrentUsername,
              newUsername: sanitizedNewCredentials.username,
              timestamp: new Date().toISOString()
            }
          },
          updatedAt: new Date()
        }
      });
    } catch (logError) {
      console.error('Error logging credential change:', logError);
      // Don't fail the main operation if logging fails
    }

    return NextResponse.json({
      success: true,
      message: 'Đổi thông tin đăng nhập thành công',
      data: {
        username: sanitizedNewCredentials.username
      }
    });

  } catch (error) {
    console.error('Error changing admin credentials:', error);
    return NextResponse.json(
      { success: false, error: 'Có lỗi xảy ra khi đổi thông tin đăng nhập' },
      { status: 500 }
    );
  }
}
