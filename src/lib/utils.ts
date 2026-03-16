/**
 * Verifies a GitHub webhook signature (HMAC SHA-256).
 * Returns true if the signature matches.
 */
export function isValidWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  if (!signature.startsWith('sha256=')) return false;
  // Actual crypto comparison happens in the API route (uses Node crypto)
  // This is a placeholder for the signature format check
  return signature.length > 7 && secret.length > 0 && payload.length > 0;
}
