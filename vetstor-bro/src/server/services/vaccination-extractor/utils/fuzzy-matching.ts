/**
 * Fuzzy string matching utilities for handling typos and variations
 */

/**
 * Simple fuzzy string matching using edit distance
 */
export function fuzzyMatch(
  text: string,
  target: string,
  threshold: number,
): boolean {
  const words = text.split(/\s+/);
  for (const word of words) {
    const similarity = calculateSimilarity(word, target);
    if (similarity >= threshold) {
      return true;
    }
  }
  return false;
}

/**
 * Calculate string similarity using edit distance (Levenshtein distance)
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;

  if (len1 === 0) return len2 === 0 ? 1 : 0;
  if (len2 === 0) return 0;

  const matrix = Array(len2 + 1)
    .fill(null)
    .map(() => Array(len1 + 1).fill(null));

  for (let i = 0; i <= len1; i++) matrix[0][i] = i;
  for (let j = 0; j <= len2; j++) matrix[j][0] = j;

  for (let j = 1; j <= len2; j++) {
    for (let i = 1; i <= len1; i++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j - 1][i] + 1, // deletion
        matrix[j][i - 1] + 1, // insertion
        matrix[j - 1][i - 1] + cost, // substitution
      );
    }
  }

  const maxLen = Math.max(len1, len2);
  return (maxLen - matrix[len2][len1]) / maxLen;
}

/**
 * Extract context around a vaccine name match
 */
export function extractContextAroundMatch(text: string, match: string): string {
  const index = text.toLowerCase().indexOf(match.toLowerCase());
  if (index === -1) return "";

  const start = Math.max(0, index - 30);
  const end = Math.min(text.length, index + match.length + 30);
  return text.substring(start, end).trim();
}
