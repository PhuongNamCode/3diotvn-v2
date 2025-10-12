import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest) {
  try {
    const { ids, action } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid subscription IDs'
      }, { status: 400 });
    }

    if (!action || !['activate', 'unsubscribe', 'delete'].includes(action)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid action'
      }, { status: 400 });
    }

    let result;

    switch (action) {
      case 'activate':
        result = await prisma.newsletterSubscription.updateMany({
          where: { id: { in: ids } },
          data: { 
            status: 'active',
            updatedAt: new Date()
          }
        });
        break;
      
      case 'unsubscribe':
        result = await prisma.newsletterSubscription.updateMany({
          where: { id: { in: ids } },
          data: { 
            status: 'unsubscribed',
            updatedAt: new Date()
          }
        });
        break;
      
      case 'delete':
        result = await prisma.newsletterSubscription.deleteMany({
          where: { id: { in: ids } }
        });
        break;
      
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully ${action}d ${result.count} subscription(s)`,
      data: result
    });

  } catch (error) {
    console.error('Error performing bulk action:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to perform bulk action'
    }, { status: 500 });
  }
}
