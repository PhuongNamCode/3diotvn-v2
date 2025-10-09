import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sanitizeAdminCredentials } from '@/lib/sanitize';

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
    
    return setting.json as AdminCredentials;
  } catch (error) {
    console.error('Error getting admin credentials:', error);
    return null;
  }
}

// Initialize default admin credentials if not exists
async function initializeDefaultCredentials(): Promise<AdminCredentials> {
  const defaultCredentials: AdminCredentials = {
    username: 'admin',
    password: await bcrypt.hash('admin123', 10) // Hash the default password
  };
  
  try {
    await prisma.setting.upsert({
      where: { key: 'admin_credentials' },
      update: {
        json: defaultCredentials,
        updatedAt: new Date()
      },
      create: {
        key: 'admin_credentials',
        json: defaultCredentials,
        updatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error initializing default credentials:', error);
  }
  
  return defaultCredentials;
}

// POST - Authenticate admin
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập username và password' },
        { status: 400 }
      );
    }

    // Sanitize input data
    let sanitizedCredentials;
    try {
      sanitizedCredentials = sanitizeAdminCredentials({
        username: username,
        password: password
      });
    } catch (error) {
      return NextResponse.json(
        { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 400 }
      );
    }

    // Get credentials from database
    let credentials = await getAdminCredentials();
    
    // If no credentials exist, initialize with defaults
    if (!credentials) {
      credentials = await initializeDefaultCredentials();
    }

    // Verify credentials
    const isUsernameValid = credentials.username === sanitizedCredentials.username;
    const isPasswordValid = await bcrypt.compare(sanitizedCredentials.password, credentials.password);
    
    if (!isUsernameValid || !isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Username hoặc password không chính xác' },
        { status: 401 }
      );
    }

    // Log successful login (optional - for audit trail)
    try {
      await prisma.setting.upsert({
        where: { key: 'admin_login_log' },
        update: {
          json: {
            ...((await prisma.setting.findUnique({ where: { key: 'admin_login_log' } }))?.json as any || {}),
            [new Date().toISOString()]: {
              action: 'login_success',
              username: sanitizedCredentials.username,
              timestamp: new Date().toISOString(),
              ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
            }
          },
          updatedAt: new Date()
        },
        create: {
          key: 'admin_login_log',
          json: {
            [new Date().toISOString()]: {
              action: 'login_success',
              username: sanitizedCredentials.username,
              timestamp: new Date().toISOString(),
              ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
            }
          },
          updatedAt: new Date()
        }
      });
    } catch (logError) {
      console.error('Error logging admin login:', logError);
      // Don't fail the main operation if logging fails
    }

    return NextResponse.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        name: "Admin User",
        email: "admin@3diot.vn",
        role: "Super Admin",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
      }
    });

  } catch (error) {
    console.error('Error authenticating admin:', error);
    return NextResponse.json(
      { success: false, error: 'Có lỗi xảy ra khi xác thực' },
      { status: 500 }
    );
  }
}
