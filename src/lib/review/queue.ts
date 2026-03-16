import type { PullRequestInfo } from '@/lib/github/pr-diff';

export type ReviewJob = {
  readonly installationId: number;
  readonly pr: PullRequestInfo;
};

/**
 * Enqueues a PR review job.
 *
 * Currently synchronous (processes inline). Will be replaced with a proper
 * async queue (e.g. BullMQ) once the AI review engine (CMP-7) is implemented.
 */
export async function enqueueReviewJob(job: ReviewJob): Promise<void> {
  // TODO (CMP-7): replace with actual AI review call
  console.log(
    `[review-queue] Queued review for ${job.pr.owner}/${job.pr.repo}#${job.pr.pullNumber}`
  );
}
