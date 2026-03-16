import { describe, it, expect } from 'vitest';
import { parseReviewBotConfig, DEFAULT_CONFIG } from './config';

describe('parseReviewBotConfig', () => {
  it('returns defaults for empty input', () => {
    expect(parseReviewBotConfig('')).toEqual(DEFAULT_CONFIG);
  });

  it('returns defaults for invalid yaml', () => {
    expect(parseReviewBotConfig(': invalid: yaml: [')).toEqual(DEFAULT_CONFIG);
  });

  it('parses valid config', () => {
    const yaml = `
enabledCategories:
  - bug
  - security
ignorePatterns:
  - '*.test.ts'
maxComments: 5
`;
    const config = parseReviewBotConfig(yaml);
    expect(config.enabledCategories).toEqual(['bug', 'security']);
    expect(config.ignorePatterns).toEqual(['*.test.ts']);
    expect(config.maxComments).toBe(5);
  });

  it('ignores unknown categories', () => {
    const yaml = `
enabledCategories:
  - bug
  - unknown-category
`;
    const config = parseReviewBotConfig(yaml);
    expect(config.enabledCategories).toEqual(['bug']);
  });

  it('uses default maxComments for invalid value', () => {
    const yaml = `maxComments: -1`;
    const config = parseReviewBotConfig(yaml);
    expect(config.maxComments).toBe(DEFAULT_CONFIG.maxComments);
  });
});
