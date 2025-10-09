/**
 * Simple in-memory cache implementation for API responses
 * Optimized for 3DIoT Web project
 */

interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class MemoryCache {
  private cache = new Map<string, CacheItem>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired items every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Get item from cache
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  /**
   * Set item in cache
   */
  set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }

  /**
   * Delete item from cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  getStats() {
    const now = Date.now();
    let validItems = 0;
    let expiredItems = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        expiredItems++;
      } else {
        validItems++;
      }
    }

    return {
      total: this.cache.size,
      valid: validItems,
      expired: expiredItems,
      hitRate: 0 // Will be calculated by usage
    };
  }

  /**
   * Clean up expired items
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
    
    if (keysToDelete.length > 0) {
      console.log(`🧹 Cache cleanup: removed ${keysToDelete.length} expired items`);
    }
  }

  /**
   * Generate cache key from request parameters
   */
  static generateKey(prefix: string, params: Record<string, any> = {}): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    
    return sortedParams ? `${prefix}:${sortedParams}` : prefix;
  }
}

// Global cache instance
export const cache = new MemoryCache();

/**
 * Cache decorator for API functions
 */
export function withCache<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  keyGenerator: (...args: T) => string,
  ttlMs: number = 5 * 60 * 1000 // 5 minutes default
) {
  return async (...args: T): Promise<R> => {
    const key = keyGenerator(...args);
    
    // Try to get from cache first
    const cached = cache.get<R>(key);
    if (cached !== null) {
      console.log(`🎯 Cache HIT: ${key}`);
      return cached;
    }

    // Execute function and cache result
    console.log(`💾 Cache MISS: ${key}`);
    const result = await fn(...args);
    cache.set(key, result, ttlMs);
    
    return result;
  };
}

/**
 * Predefined cache keys for common APIs
 */
export const CACHE_KEYS = {
  CONTACTS: (page: number, limit: number, type?: string, status?: string) => 
    MemoryCache.generateKey('contacts', { page, limit, type, status }),
  
  COURSES: (page: number, limit: number, category?: string, level?: string, search?: string) => 
    MemoryCache.generateKey('courses', { page, limit, category, level, search }),
  
  EVENTS: (page: number, limit: number, category?: string, status?: string) => 
    MemoryCache.generateKey('events', { page, limit, category, status }),
  
  NEWS: (page: number, limit: number, category?: string, search?: string) => 
    MemoryCache.generateKey('news', { page, limit, category, search }),
  
  REGISTRATIONS: (page: number, limit: number) => 
    MemoryCache.generateKey('registrations', { page, limit }),
  
  COURSE_ENROLLMENTS: (page: number, limit: number) => 
    MemoryCache.generateKey('course-enrollments', { page, limit }),
  
  STATS: () => MemoryCache.generateKey('stats'),
  
  ADMIN_CREDENTIALS: () => MemoryCache.generateKey('admin-credentials'),
} as const;

/**
 * Cache TTL configurations (in milliseconds)
 */
export const CACHE_TTL = {
  CONTACTS: 2 * 60 * 1000,      // 2 minutes
  COURSES: 5 * 60 * 1000,       // 5 minutes  
  EVENTS: 5 * 60 * 1000,        // 5 minutes
  NEWS: 10 * 60 * 1000,         // 10 minutes
  REGISTRATIONS: 1 * 60 * 1000, // 1 minute
  COURSE_ENROLLMENTS: 1 * 60 * 1000, // 1 minute
  STATS: 30 * 1000,             // 30 seconds
  ADMIN_CREDENTIALS: 60 * 1000, // 1 minute
} as const;

/**
 * Cache invalidation helpers
 */
export const cacheInvalidation = {
  // Invalidate all contact-related cache
  invalidateContacts: () => {
    cache.clear(); // Simple approach - clear all cache
    console.log('🗑️ Cache invalidated: contacts');
  },
  
  // Invalidate all course-related cache
  invalidateCourses: () => {
    cache.clear();
    console.log('🗑️ Cache invalidated: courses');
  },
  
  // Invalidate all event-related cache
  invalidateEvents: () => {
    cache.clear();
    console.log('🗑️ Cache invalidated: events');
  },
  
  // Invalidate all news-related cache
  invalidateNews: () => {
    cache.clear();
    console.log('🗑️ Cache invalidated: news');
  },
  
  // Invalidate all cache
  invalidateAll: () => {
    cache.clear();
    console.log('🗑️ Cache invalidated: all');
  }
};
