/** Computes the Levenshtein edit distance between two strings. */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = [];
  for (let i = 0; i <= m; i++) {
    dp[i] = [i];
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

/** Normalized similarity: 1 = identical, 0 = completely different. */
export function similarityScore(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a.toLowerCase(), b.toLowerCase()) / maxLen;
}

/**
 * Scores a query against a single business name.
 *
 * Priority (highest → lowest):
 *   1. Query is an exact word in the name              → 1.0
 *   2. Query is a prefix of a word in the name         → wordScore + 0.15 bonus
 *   3. Query is a substring of a word in the name      → wordScore + 0.08 bonus
 *   4. Best word-level edit-distance score              → wordScore
 *   5. Full-string edit-distance score                  → fullScore
 *
 * The first-word position matters: matching the first word of the name gets
 * a small extra +0.05 because the primary identifier is usually first.
 */
export function scoreFuzzyMatch(query: string, name: string): number {
  const q = query.toLowerCase().trim();
  const n = name.toLowerCase();
  const words = n.split(/\s+/);

  let score = similarityScore(q, n);

  words.forEach((word, idx) => {
    const positionBonus = idx === 0 ? 0.05 : 0;

    if (word === q) {
      // Exact word match
      score = Math.max(score, 1.0);
      return;
    }

    if (word.startsWith(q)) {
      // Query is a prefix of this word (e.g. "anime" → "animek")
      const ws = similarityScore(q, word);
      score = Math.max(score, ws + 0.15 + positionBonus);
      return;
    }

    if (word.includes(q)) {
      // Query appears as substring inside this word
      const ws = similarityScore(q, word);
      score = Math.max(score, ws + 0.08 + positionBonus);
      return;
    }

    // Pure edit-distance at word level
    const ws = similarityScore(q, word);
    score = Math.max(score, ws + positionBonus);
  });

  // Cap at 1.0 (bonuses can push past it)
  return Math.min(score, 1.0);
}

/**
 * Finds the best fuzzy match from a list of items.
 * Uses scoreFuzzyMatch so that prefix/substring matches rank above
 * pure-edit-distance matches of similar Levenshtein distance.
 * Returns the best item above the threshold, or null if none qualifies.
 */
export function findBestFuzzyMatch<T>(
  query: string,
  items: T[],
  getName: (item: T) => string,
  threshold = 0.55,
): T | null {
  let best: T | null = null;
  let bestScore = threshold;

  for (const item of items) {
    const score = scoreFuzzyMatch(query, getName(item));
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }

  return best;
}
