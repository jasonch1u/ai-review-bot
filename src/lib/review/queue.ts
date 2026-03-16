import type { PullRequestInfo } from '@/lib/github/pr-diff';
import { createOctokitClient } from '@/lib/github/client';
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
  octokit: Awaited<ReturnType<typeof createOctokitClient>>,
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
 * 1. Load repo config (.reviewbot.yml)
 * 2. Run Claude AI review
 * 3. Post review comments to GitHub
 */
export async function enqueueReviewJob(job: ReviewJob): Promise<void> {
  const { pr } = job;
  const token = process.env.GITHUB_INSTALLATION_TOKEN ?? '';
  const octokit = createOctokitClient(token);

  const config = await loadRepoConfig(octokit, pr.owner, pr.repo, pr.headSha);

  console.log(`[review-queue] Reviewing ${pr.owner}/${pr.repo}#${pr.pullNumber}`);

  const reviewResult = await reviewPullRequest(pr, config);

  console.log(
    `[review-queue] Review complete: ${reviewResult.comments.length} comments for ${pr.owner}/${pr.repo}#${pr.pullNumber}`
  );

  await postReviewToPullRequest(octokit, pr, reviewResult);

  console.log(`[review-queue] Posted review to GitHub: ${pr.owner}/${pr.repo}#${pr.pullNumber}`);
}
