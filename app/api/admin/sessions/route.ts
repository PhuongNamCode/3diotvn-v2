import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/sessions - Get all admin sessions
 */
export async function GET() {
  try {
    // Get sessions from database (stored in settings)
    const sessionsSetting = await prisma.setting.findUnique({
      where: { key: 'admin_sessions' }
    });

    const sessions = sessionsSetting ? (sessionsSetting.json as any) : {};
    
    // Convert to array format
    const sessionsArray = Object.entries(sessions).map(([sessionId, sessionData]: [string, any]) => ({
      id: sessionId,
      ...sessionData,
      isCurrent: sessionId === 'current_session_' + Date.now() // Simple current session detection
    }));

    return NextResponse.json({
      success: true,
      data: sessionsArray
    });
  } catch (error) {
    console.error('Error fetching admin sessions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/sessions - Clear all sessions or specific session
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const clearAll = searchParams.get('clearAll') === 'true';

    if (clearAll) {
      // Clear all sessions
      await prisma.setting.upsert({
        where: { key: 'admin_sessions' },
        update: {
          json: {},
          updatedAt: new Date()
        },
        create: {
          key: 'admin_sessions',
          json: {},
          updatedAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Đã đăng xuất tất cả phiên làm việc'
      });
    } else if (sessionId) {
      // Clear specific session
      const sessionsSetting = await prisma.setting.findUnique({
        where: { key: 'admin_sessions' }
      });

      if (sessionsSetting) {
        const sessions = sessionsSetting.json as any;
        delete sessions[sessionId];

        await prisma.setting.update({
          where: { key: 'admin_sessions' },
          data: {
            json: sessions,
            updatedAt: new Date()
          }
        });

        return NextResponse.json({
          success: true,
          message: 'Đã đăng xuất phiên làm việc'
        });
      }
    }

    return NextResponse.json(
      { success: false, error: 'Missing sessionId or clearAll parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error clearing admin sessions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear sessions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/sessions - Create new session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, userAgent, ip } = body;

    const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const sessionData = {
      username,
      userAgent,
      ip,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      isActive: true
    };

    // Get current sessions
    const sessionsSetting = await prisma.setting.findUnique({
      where: { key: 'admin_sessions' }
    });

    const sessions = sessionsSetting ? (sessionsSetting.json as any) : {};
    sessions[sessionId] = sessionData;

    // Save updated sessions
    await prisma.setting.upsert({
      where: { key: 'admin_sessions' },
      update: {
        json: sessions,
        updatedAt: new Date()
      },
      create: {
        key: 'admin_sessions',
        json: sessions,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: { sessionId, ...sessionData }
    });
  } catch (error) {
    console.error('Error creating admin session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
