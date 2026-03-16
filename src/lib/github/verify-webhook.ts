import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Verifies the GitHub webhook signature (HMAC SHA-256).
 * Fails closed: throws if secret not configured or signature invalid.
 */
export function verifyWebhookSignature(payload: string, signatureHeader: string | null): void {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('GITHUB_WEBHOOK_SECRET is not configured');
  }

  if (!signatureHeader) {
    throw new Error('Missing x-hub-signature-256 header');
  }

  if (!signatureHeader.startsWith('sha256=')) {
    throw new Error('Invalid signature format — expected sha256= prefix');
  }

  const expected = `sha256=${createHmac('sha256', secret).update(payload, 'utf8').digest('hex')}`;
  const actual = signatureHeader;

  // Constant-time comparison to prevent timing attacks
  const expectedBuf = Buffer.from(expected, 'utf8');
  const actualBuf = Buffer.from(actual, 'utf8');

  if (expectedBuf.length !== actualBuf.length || !timingSafeEqual(expectedBuf, actualBuf)) {
    throw new Error('Webhook signature mismatch');
  }
}
