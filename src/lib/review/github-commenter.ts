import type { Octokit } from '@octokit/rest';
import type { ReviewResult } from './types';
import type { PullRequestInfo } from '@/lib/github/pr-diff';

/**
 * Parses a unified diff and returns a Set of "filePath:lineNumber" strings
 * representing added/changed lines on the RIGHT side of the diff.
 * Only these lines are valid targets for GitHub inline review comments.
 */
export function extractAddedLines(diff: string): ReadonlySet<string> {
  const validLines = new Set<string>();
  const lines = diff.split('\n');
  let currentFile: string | null = null;
  let newLineNum = 0;

  let inHunk = false;

  for (const line of lines) {
    if (line.startsWith('diff --git ')) {
      const match = /diff --git a\/.+ b\/(.+)/.exec(line);
      currentFile = match ? match[1] : null;
      newLineNum = 0;
      inHunk = false;
    } else if (line.startsWith('@@')) {
      // Parse @@ -old_start[,old_count] +new_start[,new_count] @@
      const match = /@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(line);
      if (match) {
        newLineNum = parseInt(match[1], 10) - 1; // incremented before use below
        inHunk = true;
      }
    } else if (currentFile !== null && inHunk) {
      if (line.startsWith('+')) {
        newLineNum++;
        validLines.add(`${currentFile}:${newLineNum}`);
      } else if (!line.startsWith('-')) {
        // Context line: advance the new-side counter
        newLineNum++;
      }
      // Deleted lines (starting with '-') don't advance new-side counter
    }
  }

  return validLines;
}

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
 * Filters comments to only those targeting valid diff lines to avoid
 * GitHub API rejections.
 */
export async function postReviewToPullRequest(
  octokit: Octokit,
  pr: PullRequestInfo,
  review: ReviewResult
): Promise<void> {
  const { owner, repo, pullNumber, headSha } = pr;

  // Only comment on lines that are actually part of this diff
  const validLines = extractAddedLines(pr.diff);
  const validComments = review.comments.filter((c) =>
    validLines.has(`${c.filePath}:${c.line}`)
  );

  const skipped = review.comments.length - validComments.length;
  if (skipped > 0) {
    console.log(
      `[github-commenter] Skipped ${skipped} comment(s) targeting lines not in diff for ${owner}/${repo}#${pullNumber}`
    );
  }

  const inlineComments = validComments.map((comment) => ({
    path: comment.filePath,
    line: comment.line,
    side: 'RIGHT' as const,
    body: formatInlineComment(comment),
  }));

  const reviewBody = formatReviewSummary({ ...review, comments: validComments });

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
