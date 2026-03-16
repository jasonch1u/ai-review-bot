export type ReviewSeverity = 'critical' | 'warning' | 'suggestion';
export type ReviewCategory = 'bug' | 'security' | 'performance' | 'style' | 'suggestion';

export type ReviewComment = {
  readonly filePath: string;
  readonly line: number;
  readonly severity: ReviewSeverity;
  readonly category: ReviewCategory;
  readonly message: string;
  readonly suggestedFix?: string;
};

export type ReviewResult = {
  readonly comments: readonly ReviewComment[];
  readonly summary: string;
};
