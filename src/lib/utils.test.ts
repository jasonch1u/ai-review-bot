import { describe, it, expect } from 'vitest';
import { isValidWebhookSignature } from './utils';

describe('isValidWebhookSignature', () => {
  it('returns false for missing sha256= prefix', () => {
    expect(isValidWebhookSignature('payload', 'abc123', 'secret')).toBe(false);
  });

  it('returns true for well-formed inputs with sha256= prefix', () => {
    expect(isValidWebhookSignature('payload', 'sha256=abc123', 'secret')).toBe(true);
  });

  it('returns false for empty secret', () => {
    expect(isValidWebhookSignature('payload', 'sha256=abc', '')).toBe(false);
  });
});
