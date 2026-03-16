import yaml from 'js-yaml';
import type { ReviewCategory } from './types';

export type ReviewBotConfig = {
  readonly enabledCategories: readonly ReviewCategory[];
  readonly ignorePatterns: readonly string[];
  readonly maxComments: number;
};

const DEFAULT_CONFIG: ReviewBotConfig = {
  enabledCategories: ['bug', 'security', 'performance', 'style', 'suggestion'],
  ignorePatterns: [
    'node_modules/**',
    'pnpm-lock.yaml',
    'package-lock.json',
    'yarn.lock',
    '*.min.js',
    '*.min.css',
    'dist/**',
    '.next/**',
  ],
  maxComments: 20,
};

const RawConfigSchema = {
  parse(raw: unknown): ReviewBotConfig {
    if (typeof raw !== 'object' || raw === null) return DEFAULT_CONFIG;
    const obj = raw as Record<string, unknown>;

    const validCategories: ReviewCategory[] = [
      'bug',
      'security',
      'performance',
      'style',
      'suggestion',
    ];

    const enabledCategories = Array.isArray(obj.enabledCategories)
      ? (obj.enabledCategories as string[]).filter((c): c is ReviewCategory =>
          validCategories.includes(c as ReviewCategory)
        )
      : DEFAULT_CONFIG.enabledCategories;

    const ignorePatterns = Array.isArray(obj.ignorePatterns)
      ? (obj.ignorePatterns as unknown[]).filter((p): p is string => typeof p === 'string')
      : DEFAULT_CONFIG.ignorePatterns;

    const maxComments =
      typeof obj.maxComments === 'number' && obj.maxComments > 0
        ? obj.maxComments
        : DEFAULT_CONFIG.maxComments;

    return { enabledCategories, ignorePatterns, maxComments };
  },
};

export function parseReviewBotConfig(yamlContent: string): ReviewBotConfig {
  try {
    const raw = yaml.load(yamlContent);
    return RawConfigSchema.parse(raw);
  } catch {
    return DEFAULT_CONFIG;
  }
}

export { DEFAULT_CONFIG };
