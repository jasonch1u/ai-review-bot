import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';
import type { PullRequestInfo } from '@/lib/github/pr-diff';
import { filterDiff } from './diff-filter';
import type { ReviewBotConfig } from './config';
import type { ReviewResult } from './types';

const ReviewCommentSchema = z.object({
  filePath: z.string().describe('Path to the file being reviewed'),
  line: z.number().int().positive().describe('Line number in the file'),
  severity: z.enum(['critical', 'warning', 'suggestion']).describe('Severity level of the issue'),
  category: z
    .enum(['bug', 'security', 'performance', 'style', 'suggestion'])
    .describe('Type of issue found'),
  message: z.string().describe('Clear, actionable description of the issue'),
  suggestedFix: z.string().optional().describe('Concrete suggestion for how to fix the issue'),
});

const ReviewResultSchema = z.object({
  comments: z.array(ReviewCommentSchema).describe('List of review comments on specific lines'),
  summary: z.string().describe('High-level summary of the PR and overall review verdict'),
});

function buildSystemPrompt(config: ReviewBotConfig): string {
  const categories = config.enabledCategories.join(', ');
  return `You are an expert code reviewer for a software engineering team. Your job is to review pull request diffs and identify issues.

Review focus areas (${categories}):
- **bug**: Logic errors, null pointer risks, off-by-one errors, incorrect conditionals
- **security**: SQL injection, XSS, unvalidated inputs, hardcoded secrets, CSRF
- **performance**: N+1 queries, unnecessary re-renders, blocking I/O, memory leaks
- **style**: Readability, naming conventions, code duplication, overly complex logic
- **suggestion**: Architectural improvements, better abstractions, missing tests

Rules:
1. Only comment on lines present in the diff (added or changed lines)
2. Each comment must be actionable — say what is wrong AND how to fix it
3. Group related issues; don't repeat the same observation multiple times
4. Skip trivial style nitpicks unless they indicate a larger problem
5. Maximum ${config.maxComments} comments total
6. Focus on the most impactful issues first (critical > warning > suggestion)`;
}

function buildUserPrompt(pr: PullRequestInfo, filteredDiff: string): string {
  return `Review this pull request:

**Title:** ${pr.title}
**Description:** ${pr.body ?? '(no description)'}
**Repository:** ${pr.owner}/${pr.repo}
**PR #${pr.pullNumber}** (${pr.headSha.slice(0, 7)} → ${pr.baseSha.slice(0, 7)})

**Diff:**
\`\`\`diff
${filteredDiff}
\`\`\`

Provide a structured review with specific, actionable comments. Return your review as JSON.`;
}

export async function reviewPullRequest(
  pr: PullRequestInfo,
  config: ReviewBotConfig
): Promise<ReviewResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  const filteredDiff = filterDiff(pr.diff, config.ignorePatterns);

  if (!filteredDiff.trim()) {
    return {
      comments: [],
      summary: 'No reviewable changes after filtering ignored files.',
    };
  }

  const client = new Anthropic({ apiKey });

  const response = await client.messages.parse({
    model: 'claude-opus-4-6',
    max_tokens: 4096,
    thinking: { type: 'adaptive' },
    system: buildSystemPrompt(config),
    messages: [{ role: 'user', content: buildUserPrompt(pr, filteredDiff) }],
    output_config: {
      format: zodOutputFormat(ReviewResultSchema),
    },
  });

  const parsed = response.parsed_output;
  if (!parsed) {
    throw new Error('Claude returned an invalid or empty review response');
  }

  // Enforce max comments cap
  const comments = parsed.comments.slice(0, config.maxComments);

  return { comments, summary: parsed.summary };
}
