import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const subscriptions = await prisma.newsletterSubscription.findMany({
      select: {
        id: true,
        email: true,
        status: true,
        subscribedAt: true,
        source: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { subscribedAt: 'desc' }
    });

    // Create CSV content
    const csvHeaders = [
      'ID',
      'Email',
      'Trạng thái',
      'Ngày đăng ký',
      'Nguồn',
      'Ngày tạo',
      'Ngày cập nhật'
    ].join(',');

    const csvRows = subscriptions.map(sub => [
      sub.id,
      sub.email,
      sub.status,
      sub.subscribedAt.toISOString(),
      sub.source || '',
      sub.createdAt.toISOString(),
      sub.updatedAt.toISOString()
    ].map(field => `"${field}"`).join(','));

    const csvContent = [csvHeaders, ...csvRows].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="newsletter-subscriptions-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error) {
    console.error('Error exporting newsletter subscriptions:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to export subscriptions'
    }, { status: 500 });
  }
}
