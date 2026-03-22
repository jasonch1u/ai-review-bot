import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('allows requests within the limit', async () => {
    const { checkRateLimit } = await import('./rate-limit');
    for (let i = 0; i < 30; i++) {
      expect(checkRateLimit('key-a')).toBe(true);
    }
  });

  it('rejects the 31st request within the window', async () => {
    const { checkRateLimit } = await import('./rate-limit');
    for (let i = 0; i < 30; i++) {
      checkRateLimit('key-b');
    }
    expect(checkRateLimit('key-b')).toBe(false);
  });

  it('uses separate counters per key', async () => {
    const { checkRateLimit } = await import('./rate-limit');
    for (let i = 0; i < 30; i++) {
      checkRateLimit('key-c');
    }
    // Different key should still be allowed
    expect(checkRateLimit('key-d')).toBe(true);
  });

  it('resets after the time window', async () => {
    vi.useFakeTimers();
    const { checkRateLimit } = await import('./rate-limit');

    for (let i = 0; i < 30; i++) {
      checkRateLimit('key-e');
    }
    expect(checkRateLimit('key-e')).toBe(false);

    // Advance past the 1-minute window
    vi.advanceTimersByTime(61_000);
    expect(checkRateLimit('key-e')).toBe(true);

    vi.useRealTimers();
  });
});
