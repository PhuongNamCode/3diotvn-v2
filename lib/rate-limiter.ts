interface RateLimitConfig {
  windowMs: number; // Thời gian cửa sổ (ms)
  max: number;      // Số requests tối đa
}

// Rate limits cho từng endpoint
const rateLimits: Record<string, RateLimitConfig> = {
  // Public endpoints (cửa sổ 5 phút)
  '/api/contacts': { windowMs: 5 * 60 * 1000, max: 10 }, // 10 requests per 5 minutes
  '/api/events': { windowMs: 5 * 60 * 1000, max: 30 }, // 30 requests per 5 minutes
  '/api/courses': { windowMs: 5 * 60 * 1000, max: 40 }, // 40 requests per 5 minutes
  '/api/news': { windowMs: 5 * 60 * 1000, max: 60 }, // 60 requests per 5 minutes
  '/api/news/refresh': { windowMs: 60 * 60 * 1000, max: 6 }, // 6 requests per hour (giữ nguyên)
  '/api/news/scheduler': { windowMs: 60 * 60 * 1000, max: 10 }, // 10 requests per hour (giữ nguyên)
  '/api/users': { windowMs: 5 * 60 * 1000, max: 20 }, // 20 requests per 5 minutes
  '/api/registrations': { windowMs: 5 * 60 * 1000, max: 30 }, // 30 requests per 5 minutes
  '/api/course-enrollments': { windowMs: 5 * 60 * 1000, max: 30 }, // 30 requests per 5 minutes
  '/api/stats': { windowMs: 5 * 60 * 1000, max: 20 }, // 20 requests per 5 minutes
  '/api/settings': { windowMs: 5 * 60 * 1000, max: 10 }, // 10 requests per 5 minutes
  '/api/upload': { windowMs: 5 * 60 * 1000, max: 20 }, // 20 requests per 5 minutes
  '/api/test': { windowMs: 5 * 60 * 1000, max: 100 }, // 100 requests per 5 minutes
  
  // Dynamic endpoints (cửa sổ 5 phút)
  '/api/courses/[id]': { windowMs: 5 * 60 * 1000, max: 40 }, // 40 requests per 5 minutes
  '/api/users/[id]': { windowMs: 5 * 60 * 1000, max: 30 }, // 30 requests per 5 minutes
  
  // Admin endpoints (cửa sổ 5 phút cho auth/security/reset-code, 1 giờ cho reset-password)
  '/api/admin/auth': { windowMs: 5 * 60 * 1000, max: 20 }, // 20 requests per 5 minutes
  '/api/admin/security': { windowMs: 5 * 60 * 1000, max: 12 }, // 12 requests per 5 minutes
  '/api/admin/reset-password': { windowMs: 60 * 60 * 1000, max: 12 }, // 12 requests per hour (giữ nguyên)
  '/api/admin/reset-code': { windowMs: 5 * 60 * 1000, max: 20 }, // 20 requests per 5 minutes
};

// Map để lưu trữ số lượng requests của từng IP
const requestCounts = new Map<string, { count: number; resetTime: number }>();

/**
 * Kiểm tra rate limit cho một IP và endpoint
 * @param ip - IP address của client
 * @param endpoint - API endpoint
 * @returns true nếu được phép, false nếu bị block
 */
export function checkRateLimit(ip: string, endpoint: string): boolean {
  const config = rateLimits[endpoint];
  if (!config) return true; // Không giới hạn nếu không có config

  const now = Date.now();
  const key = `${ip}:${endpoint}`;
  const current = requestCounts.get(key);

  // Reset nếu hết thời gian cửa sổ
  if (!current || now > current.resetTime) {
    requestCounts.set(key, { count: 1, resetTime: now + config.windowMs });
    return true;
  }

  // Kiểm tra giới hạn
  if (current.count >= config.max) {
    return false; // Vượt quá giới hạn
  }

  // Tăng số lượng requests
  current.count++;
  return true;
}

/**
 * Lấy thông tin rate limit hiện tại của một IP
 * @param ip - IP address
 * @param endpoint - API endpoint
 * @returns Object chứa thông tin rate limit
 */
export function getRateLimitInfo(ip: string, endpoint: string) {
  const config = rateLimits[endpoint];
  if (!config) return null;

  const key = `${ip}:${endpoint}`;
  const current = requestCounts.get(key);
  
  if (!current) {
    return {
      limit: config.max,
      remaining: config.max,
      resetTime: Date.now() + config.windowMs,
      windowMs: config.windowMs
    };
  }

  const now = Date.now();
  const remaining = Math.max(0, config.max - current.count);
  const resetTime = current.resetTime;
  const resetIn = Math.max(0, resetTime - now);

  return {
    limit: config.max,
    remaining,
    resetTime,
    windowMs: config.windowMs,
    resetIn,
    resetInMinutes: Math.ceil(resetIn / (1000 * 60)),
    resetInSeconds: Math.ceil(resetIn / 1000),
    resetAt: new Date(resetTime).toLocaleString('vi-VN')
  };
}

/**
 * Lấy tất cả rate limit configs
 */
export function getAllRateLimits() {
  return rateLimits;
}

/**
 * Cleanup expired entries (có thể gọi định kỳ)
 */
export function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, value] of requestCounts.entries()) {
    if (now > value.resetTime) {
      requestCounts.delete(key);
    }
  }
}

/**
 * Lấy client IP từ request
 */
export function getClientIP(request: Request): string {
  // Try different headers for IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback - in production this should be handled by proxy
  return 'unknown';
}
