import { describe, it, expect } from 'vitest';
import { filterDiff } from './diff-filter';

const SAMPLE_DIFF = `diff --git a/src/app/page.tsx b/src/app/page.tsx
index abc..def 100644
--- a/src/app/page.tsx
+++ b/src/app/page.tsx
@@ -1,3 +1,4 @@
+import React from 'react';
 export default function Home() {
-  return <div>Hello</div>;
+  return <div>Hello World</div>;
 }
diff --git a/pnpm-lock.yaml b/pnpm-lock.yaml
index 111..222 100644
--- a/pnpm-lock.yaml
+++ b/pnpm-lock.yaml
@@ -1 +1 @@
-lockfileVersion: '6.0'
+lockfileVersion: '7.0'`;

describe('filterDiff', () => {
  it('returns the original diff when no patterns', () => {
    expect(filterDiff(SAMPLE_DIFF, [])).toBe(SAMPLE_DIFF);
  });

  it('returns the original diff when input is empty', () => {
    expect(filterDiff('', ['node_modules/**'])).toBe('');
  });

  it('filters out files matching the pattern', () => {
    const result = filterDiff(SAMPLE_DIFF, ['pnpm-lock.yaml']);
    expect(result).toContain('src/app/page.tsx');
    expect(result).not.toContain('pnpm-lock.yaml');
  });

  it('keeps files that do not match any pattern', () => {
    const result = filterDiff(SAMPLE_DIFF, ['node_modules/**']);
    expect(result).toContain('src/app/page.tsx');
    expect(result).toContain('pnpm-lock.yaml');
  });

  it('filters multiple files', () => {
    const result = filterDiff(SAMPLE_DIFF, ['pnpm-lock.yaml', '*.tsx']);
    expect(result.trim()).toBe('');
  });
});
