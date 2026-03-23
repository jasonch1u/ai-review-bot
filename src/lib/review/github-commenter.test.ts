import { describe, it, expect } from 'vitest';
import { extractAddedLines } from './github-commenter';

describe('extractAddedLines', () => {
  it('returns empty set for empty diff', () => {
    expect(extractAddedLines('')).toEqual(new Set());
  });

  it('extracts added lines from a simple diff', () => {
    const diff = [
      'diff --git a/src/foo.ts b/src/foo.ts',
      '--- a/src/foo.ts',
      '+++ b/src/foo.ts',
      '@@ -1,3 +1,4 @@',
      ' const a = 1;',
      '+const b = 2;',
      ' const c = 3;',
      '+const d = 4;',
    ].join('\n');

    const result = extractAddedLines(diff);

    expect(result.has('src/foo.ts:2')).toBe(true); // +const b = 2;
    expect(result.has('src/foo.ts:4')).toBe(true); // +const d = 4;
    // context lines should not be included
    expect(result.has('src/foo.ts:1')).toBe(false);
    expect(result.has('src/foo.ts:3')).toBe(false);
  });

  it('does not include deleted lines', () => {
    const diff = [
      'diff --git a/src/bar.ts b/src/bar.ts',
      '--- a/src/bar.ts',
      '+++ b/src/bar.ts',
      '@@ -1,2 +1,2 @@',
      '-const old = 1;',
      '+const newVal = 1;',
    ].join('\n');

    const result = extractAddedLines(diff);
    expect(result.has('src/bar.ts:1')).toBe(true); // + line
    expect(result.size).toBe(1);
  });

  it('handles multiple files in a diff', () => {
    const diff = [
      'diff --git a/a.ts b/a.ts',
      '--- a/a.ts',
      '+++ b/a.ts',
      '@@ -1,1 +1,2 @@',
      ' existing',
      '+added in a',
      'diff --git a/b.ts b/b.ts',
      '--- a/b.ts',
      '+++ b/b.ts',
      '@@ -5,1 +5,2 @@',
      ' context',
      '+added in b',
    ].join('\n');

    const result = extractAddedLines(diff);
    expect(result.has('a.ts:2')).toBe(true);
    expect(result.has('b.ts:6')).toBe(true);
    // should not bleed across files
    expect(result.has('a.ts:6')).toBe(false);
    expect(result.has('b.ts:2')).toBe(false);
  });

  it('handles multiple hunks in a single file', () => {
    const diff = [
      'diff --git a/utils.ts b/utils.ts',
      '--- a/utils.ts',
      '+++ b/utils.ts',
      '@@ -1,3 +1,4 @@',
      ' line1',
      '+line2new',
      ' line3',
      ' line4',
      '@@ -10,2 +11,3 @@',
      ' line10',
      '+line11new',
      ' line12',
    ].join('\n');

    const result = extractAddedLines(diff);
    expect(result.has('utils.ts:2')).toBe(true);  // +line2new
    expect(result.has('utils.ts:12')).toBe(true); // +line11new (new side: 11+1=12)
  });

  it('handles new file (starts at line 1)', () => {
    const diff = [
      'diff --git a/new-file.ts b/new-file.ts',
      '--- /dev/null',
      '+++ b/new-file.ts',
      '@@ -0,0 +1,3 @@',
      '+line one',
      '+line two',
      '+line three',
    ].join('\n');

    const result = extractAddedLines(diff);
    expect(result.has('new-file.ts:1')).toBe(true);
    expect(result.has('new-file.ts:2')).toBe(true);
    expect(result.has('new-file.ts:3')).toBe(true);
    expect(result.size).toBe(3);
  });
});
