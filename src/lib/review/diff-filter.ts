import { minimatch } from 'minimatch';

/**
 * Filters a unified diff to exclude files matching ignore patterns.
 * Preserves the diff header and only removes individual file diffs.
 */
export function filterDiff(diff: string, ignorePatterns: readonly string[]): string {
  if (!diff || ignorePatterns.length === 0) return diff;

  const lines = diff.split('\n');
  const filteredChunks: string[] = [];
  let currentFileLines: string[] = [];
  let currentFilePath: string | null = null;

  function flushCurrentFile() {
    if (currentFilePath === null) return;
    const isIgnored = ignorePatterns.some((pattern) =>
      minimatch(currentFilePath!, pattern, { matchBase: true })
    );
    if (!isIgnored) {
      filteredChunks.push(...currentFileLines);
    }
    currentFileLines = [];
    currentFilePath = null;
  }

  for (const line of lines) {
    if (line.startsWith('diff --git ')) {
      flushCurrentFile();
      const match = /diff --git a\/.+ b\/(.+)/.exec(line);
      currentFilePath = match ? match[1] : null;
      currentFileLines = [line];
    } else {
      currentFileLines.push(line);
    }
  }
  flushCurrentFile();

  return filteredChunks.join('\n');
}
