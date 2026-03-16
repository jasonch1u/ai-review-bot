import type { Octokit } from '@octokit/rest';
import type { ReviewResult } from './types';
import type { PullRequestInfo } from '@/lib/github/pr-diff';

const SEVERITY_EMOJI: Record<string, string> = {
  critical: '🚨',
  warning: '⚠️',
  suggestion: '💡',
};

const CATEGORY_LABEL: Record<string, string> = {
  bug: 'Bug',
  security: 'Security',
  performance: 'Performance',
  style: 'Style',
  suggestion: 'Suggestion',
};

/**
 * Posts the review result as a GitHub PR review with inline comments.
 */
export async function postReviewToPullRequest(
  octokit: Octokit,
  pr: PullRequestInfo,
  review: ReviewResult
): Promise<void> {
  const { owner, repo, pullNumber, headSha } = pr;

  const inlineComments = review.comments.map((comment) => ({
    path: comment.filePath,
    line: comment.line,
    side: 'RIGHT' as const,
    body: formatInlineComment(comment),
  }));

  const reviewBody = formatReviewSummary(review);

  await octokit.pulls.createReview({
    owner,
    repo,
    pull_number: pullNumber,
    commit_id: headSha,
    event: 'COMMENT',
    body: reviewBody,
    comments: inlineComments,
  });
}

function formatInlineComment(comment: {
  severity: string;
  category: string;
  message: string;
  suggestedFix?: string;
}): string {
  const emoji = SEVERITY_EMOJI[comment.severity] ?? '📝';
  const label = CATEGORY_LABEL[comment.category] ?? comment.category;
  const lines: string[] = [`${emoji} **${label}** (${comment.severity})`, '', comment.message];

  if (comment.suggestedFix) {
    lines.push('', '**Suggested fix:**', comment.suggestedFix);
  }

  return lines.join('\n');
}

function formatReviewSummary(review: ReviewResult): string {
  const criticalCount = review.comments.filter((c) => c.severity === 'critical').length;
  const warningCount = review.comments.filter((c) => c.severity === 'warning').length;
  const suggestionCount = review.comments.filter((c) => c.severity === 'suggestion').length;

  const lines: string[] = [
    '## 🤖 AI Code Review',
    '',
    review.summary,
    '',
    '---',
    '',
    `**${review.comments.length} comment(s):** 🚨 ${criticalCount} critical · ⚠️ ${warningCount} warnings · 💡 ${suggestionCount} suggestions`,
  ];

  return lines.join('\n');
}
