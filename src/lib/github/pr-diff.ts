import type { Octokit } from '@octokit/rest';

export type PullRequestInfo = {
  readonly owner: string;
  readonly repo: string;
  readonly pullNumber: number;
  readonly title: string;
  readonly body: string | null;
  readonly headSha: string;
  readonly baseSha: string;
  readonly diff: string;
};

/**
 * Fetches the PR diff and metadata from the GitHub API.
 * Returns a structured PullRequestInfo object.
 */
export async function fetchPullRequestDiff(
  octokit: Octokit,
  owner: string,
  repo: string,
  pullNumber: number
): Promise<PullRequestInfo> {
  // Fetch PR metadata and diff in parallel
  const [prResponse, diffResponse] = await Promise.all([
    octokit.pulls.get({ owner, repo, pull_number: pullNumber }),
    octokit.pulls.get({
      owner,
      repo,
      pull_number: pullNumber,
      mediaType: { format: 'diff' },
    }),
  ]);

  const pr = prResponse.data;
  // The diff response data is a string when mediaType.format is "diff"
  const diff = diffResponse.data as unknown as string;

  return {
    owner,
    repo,
    pullNumber,
    title: pr.title,
    body: pr.body,
    headSha: pr.head.sha,
    baseSha: pr.base.sha,
    diff,
  };
}
