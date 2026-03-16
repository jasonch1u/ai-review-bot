import { createHmac } from 'crypto';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { verifyWebhookSignature } from './verify-webhook';

const SECRET = 'test-secret';
const PAYLOAD = '{"action":"opened"}';

function makeSignature(payload: string, secret: string): string {
  return `sha256=${createHmac('sha256', secret).update(payload, 'utf8').digest('hex')}`;
}

describe('verifyWebhookSignature', () => {
  beforeEach(() => {
    vi.stubEnv('GITHUB_WEBHOOK_SECRET', SECRET);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('passes with a valid signature', () => {
    const sig = makeSignature(PAYLOAD, SECRET);
    expect(() => verifyWebhookSignature(PAYLOAD, sig)).not.toThrow();
  });

  it('throws when signature header is missing', () => {
    expect(() => verifyWebhookSignature(PAYLOAD, null)).toThrow(
      'Missing x-hub-signature-256 header'
    );
  });

  it('throws when signature has wrong prefix', () => {
    expect(() => verifyWebhookSignature(PAYLOAD, 'sha1=abc')).toThrow('Invalid signature format');
  });

  it('throws when signature is tampered', () => {
    const sig = makeSignature(PAYLOAD, 'wrong-secret');
    expect(() => verifyWebhookSignature(PAYLOAD, sig)).toThrow('Webhook signature mismatch');
  });

  it('throws when payload is modified', () => {
    const sig = makeSignature(PAYLOAD, SECRET);
    expect(() => verifyWebhookSignature('{"action":"deleted"}', sig)).toThrow(
      'Webhook signature mismatch'
    );
  });

  it('throws when GITHUB_WEBHOOK_SECRET is not set', () => {
    vi.unstubAllEnvs();
    expect(() => verifyWebhookSignature(PAYLOAD, makeSignature(PAYLOAD, SECRET))).toThrow(
      'GITHUB_WEBHOOK_SECRET is not configured'
    );
  });
});
