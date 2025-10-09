interface RateLimitConfig {
  windowMs: number; // Thời gian cửa sổ (ms)
  max: number;      // Số requests tối đa
}

// Rate limits cho từng endpoint
const rateLimits: Record<string, RateLimitConfig> = {
  // Public endpoints
  '/api/contacts': { windowMs: 15 * 60 * 1000, max: 5 }, // 5 requests per 15 minutes
  '/api/events': { windowMs: 15 * 60 * 1000, max: 15 },
  '/api/courses': { windowMs: 15 * 60 * 1000, max: 20 },
  '/api/news': { windowMs: 15 * 60 * 1000, max: 30 },
  '/api/news/refresh': { windowMs: 60 * 60 * 1000, max: 3 }, // 3 requests per hour
  '/api/news/scheduler': { windowMs: 60 * 60 * 1000, max: 5 },
  '/api/users': { windowMs: 15 * 60 * 1000, max: 10 },
  '/api/registrations': { windowMs: 15 * 60 * 1000, max: 15 },
  '/api/course-enrollments': { windowMs: 15 * 60 * 1000, max: 15 },
  '/api/stats': { windowMs: 15 * 60 * 1000, max: 10 },
  '/api/settings': { windowMs: 15 * 60 * 1000, max: 5 },
  '/api/upload': { windowMs: 15 * 60 * 1000, max: 10 },
  '/api/test': { windowMs: 15 * 60 * 1000, max: 50 },
  
  // Dynamic endpoints
  '/api/courses/[id]': { windowMs: 15 * 60 * 1000, max: 20 },
  '/api/users/[id]': { windowMs: 15 * 60 * 1000, max: 15 },
  
  // Admin endpoints (x2 như yêu cầu)
  '/api/admin/auth': { windowMs: 15 * 60 * 1000, max: 10 }, // 5 -> 10
  '/api/admin/security': { windowMs: 15 * 60 * 1000, max: 6 }, // 3 -> 6
  '/api/admin/reset-password': { windowMs: 60 * 60 * 1000, max: 6 }, // 3 -> 6
  '/api/admin/reset-code': { windowMs: 15 * 60 * 1000, max: 10 }, // 5 -> 10
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
