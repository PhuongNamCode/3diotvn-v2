import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { status } = await request.json();
    const { id } = await params;
    
    if (!status || !['active', 'unsubscribed', 'bounced'].includes(status)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid status value'
      }, { status: 400 });
    }

    const subscription = await prisma.newsletterSubscription.update({
      where: { id },
      data: { 
        status,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: subscription
    });

  } catch (error) {
    console.error('Error updating newsletter subscription:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update subscription'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prisma.newsletterSubscription.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting newsletter subscription:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete subscription'
    }, { status: 500 });
  }
}
