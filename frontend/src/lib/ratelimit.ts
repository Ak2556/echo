/**
 * Rate limiting utilities
 */

export class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  check(key: string, limit: number, window: number): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];
    const validTimestamps = timestamps.filter((t) => now - t < window);

    if (validTimestamps.length >= limit) {
      return false;
    }

    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);
    return true;
  }

  async limit(key: string): Promise<{
    success: boolean;
    limit: number;
    reset: number;
    remaining: number;
  }> {
    const limitCount = 10;
    const windowMs = 60000;
    const success = this.check(key, limitCount, windowMs);
    const timestamps = this.requests.get(key) || [];
    return {
      success,
      limit: limitCount,
      reset: Date.now() + windowMs,
      remaining: Math.max(0, limitCount - timestamps.length),
    };
  }

  reset(key: string): void {
    this.requests.delete(key);
  }
}

export const rateLimiter = new RateLimiter();
export const ratelimit = rateLimiter;
