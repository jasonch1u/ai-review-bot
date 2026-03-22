import { NextRequest, NextResponse, after } from 'next/server';
import { z } from 'zod';
import { verifyWebhookSignature } from '@/lib/github/verify-webhook';
import { createInstallationClient } from '@/lib/github/app-auth';
import { fetchPullRequestDiff } from '@/lib/github/pr-diff';
import { enqueueReviewJob } from '@/lib/review/queue';
import { checkRateLimit } from '@/lib/rate-limit';

// Supported PR events that should trigger a review
const REVIEW_ACTIONS = new Set(['opened', 'synchronize']);

const PullRequestPayloadSchema = z.object({
  action: z.string(),
  installation: z.object({ id: z.number() }),
  pull_request: z.object({
    number: z.number(),
    head: z.object({ sha: z.string() }),
  }),
  repository: z.object({
    name: z.string(),
    owner: z.object({ login: z.string() }),
  }),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Rate limiting keyed by GitHub delivery ID (falls back to IP)
  const deliveryId =
    request.headers.get('x-github-delivery') ??
    (request.headers.get('x-forwarded-for') || 'unknown');

  if (!checkRateLimit(deliveryId)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  // Read raw body for signature verification
  const rawBody = await request.text();

  // Verify signature — fail closed
  try {
    verifyWebhookSignature(rawBody, request.headers.get('x-hub-signature-256'));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Signature error';
    console.warn(`[webhook] Signature verification failed: ${message}`);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const eventType = request.headers.get('x-github-event');

  // Only handle pull_request events
  if (eventType !== 'pull_request') {
    return NextResponse.json({ ok: true, skipped: true });
  }

  // Parse and validate payload
  let parsed: z.infer<typeof PullRequestPayloadSchema>;
  try {
    const json: unknown = JSON.parse(rawBody);
    parsed = PullRequestPayloadSchema.parse(json);
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const { action, installation, pull_request, repository } = parsed;

  // Only handle opened / synchronize
  if (!REVIEW_ACTIONS.has(action)) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  // Respond immediately, process in background after response is sent
  const owner = repository.owner.login;
  const repo = repository.name;
  const pullNumber = pull_request.number;
  const installationId = installation.id;

  // after() ensures background work completes even after response is returned
  after(() => processReview({ owner, repo, pullNumber, installationId }));

  return NextResponse.json({ ok: true });
}

async function processReview({
  owner,
  repo,
  pullNumber,
  installationId,
}: {
  owner: string;
  repo: string;
  pullNumber: number;
  installationId: number;
}): Promise<void> {
  try {
    const octokit = await createInstallationClient(installationId);
    const pr = await fetchPullRequestDiff(octokit, owner, repo, pullNumber);
    await enqueueReviewJob({ installationId, pr });
  } catch (err) {
    console.error(`[webhook] Failed to process review for ${owner}/${repo}#${pullNumber}:`, err);
  }
}
