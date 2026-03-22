import type { PullRequestInfo } from '@/lib/github/pr-diff';
import { createInstallationClient } from '@/lib/github/app-auth';
import type { Octokit } from '@octokit/rest';
import { reviewPullRequest } from './claude-reviewer';
import { postReviewToPullRequest } from './github-commenter';
import { DEFAULT_CONFIG, parseReviewBotConfig } from './config';
import type { ReviewBotConfig } from './config';

export type ReviewJob = {
  readonly installationId: number;
  readonly pr: PullRequestInfo;
};

/**
 * Fetches per-repo config from .reviewbot.yml if it exists, falls back to defaults.
 */
async function loadRepoConfig(
  octokit: Octokit,
  owner: string,
  repo: string,
  ref: string
): Promise<ReviewBotConfig> {
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: '.reviewbot.yml',
      ref,
    });

    if ('content' in data && typeof data.content === 'string') {
      const yaml = Buffer.from(data.content, 'base64').toString('utf8');
      return parseReviewBotConfig(yaml);
    }
  } catch {
    // File doesn't exist or can't be read — use defaults
  }
  return DEFAULT_CONFIG;
}

/**
 * Processes a PR review job end-to-end:
 * 1. Obtain an installation-scoped GitHub token via App JWT auth
 * 2. Load repo config (.reviewbot.yml)
 * 3. Run Claude AI review
 * 4. Post review comments to GitHub
 */
export async function enqueueReviewJob(job: ReviewJob): Promise<void> {
  const { pr, installationId } = job;
  const octokit = await createInstallationClient(installationId);

  const config = await loadRepoConfig(octokit, pr.owner, pr.repo, pr.headSha);

  console.log(`[review-queue] Reviewing ${pr.owner}/${pr.repo}#${pr.pullNumber}`);

  const reviewResult = await reviewPullRequest(pr, config);

  console.log(
    `[review-queue] Review complete: ${reviewResult.comments.length} comments for ${pr.owner}/${pr.repo}#${pr.pullNumber}`
  );

  await postReviewToPullRequest(octokit, pr, reviewResult);

  console.log(`[review-queue] Posted review to GitHub: ${pr.owner}/${pr.repo}#${pr.pullNumber}`);
}
