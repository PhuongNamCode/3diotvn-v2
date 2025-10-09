import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIP, getRateLimitInfo } from './lib/rate-limiter';

export function middleware(request: NextRequest) {
  // Chỉ áp dụng cho API routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Kiểm tra biến môi trường để bật/tắt rate limiting
  const enableRateLimiting = process.env.ENABLE_RATE_LIMITING === 'true';
  
  if (!enableRateLimiting) {
    // Bỏ qua rate limiting nếu tắt
    return NextResponse.next();
  }

  // Rate limiting logic
  const ip = getClientIP(request);
  const pathname = request.nextUrl.pathname;

  // Normalize pathname để match với config
  let endpoint = pathname;
  
  // Handle dynamic routes
  if (pathname.match(/\/api\/courses\/[^\/]+$/)) {
    endpoint = '/api/courses/[id]';
  } else if (pathname.match(/\/api\/users\/[^\/]+$/)) {
    endpoint = '/api/users/[id]';
  }

  // Kiểm tra rate limit
  const isAllowed = checkRateLimit(ip, endpoint);
  
  if (!isAllowed) {
    // Lấy thông tin rate limit để trả về trong response
    const rateLimitInfo = getRateLimitInfo(ip, endpoint);
    
    const response = NextResponse.json(
      {
        success: false,
        error: 'Quá nhiều requests. Vui lòng thử lại sau.',
        rateLimit: rateLimitInfo
      },
      { status: 429 } // Too Many Requests
    );

    // Thêm rate limit headers
    if (rateLimitInfo) {
      response.headers.set('X-RateLimit-Limit', rateLimitInfo.limit.toString());
      response.headers.set('X-RateLimit-Remaining', rateLimitInfo.remaining.toString());
      response.headers.set('X-RateLimit-Reset', rateLimitInfo.resetTime.toString());
    }

    return response;
  }

  // Nếu được phép, thêm rate limit info vào headers
  const rateLimitInfo = getRateLimitInfo(ip, endpoint);
  const response = NextResponse.next();
  
  if (rateLimitInfo) {
    response.headers.set('X-RateLimit-Limit', rateLimitInfo.limit.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimitInfo.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimitInfo.resetTime.toString());
  }

  return response;
}

// Chỉ áp dụng cho API routes
export const config = {
  matcher: '/api/:path*'
};
