/**
 * Ported from web normalizeAnswer / isCorrect utilities.
 * Handles case-insensitive, punctuation-stripped, optional-parenthesis, and slash-alternative answer matching.
 */

function stripParens(s: string): string {
  // Remove content in optional parentheses: "(The) cat" → "cat" or "The cat"
  return s.replace(/\([^)]*\)\s*/g, '').trim();
}

function withoutOptionalParens(s: string): string[] {
  // Returns both the full form and the form with parenthesised words stripped
  const full = s.trim();
  const stripped = stripParens(full);
  return stripped !== full ? [full, stripped] : [full];
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // strip non-alphanumeric except spaces
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeAnswer(s: string): string {
  return normalize(s);
}

/**
 * Check if a user answer is correct against a correct-answer string.
 * Handles:
 *   - Case-insensitive comparison
 *   - Non-alphanumeric stripping
 *   - Optional parentheses: "(The) cat" accepts both "the cat" and "cat"
 *   - Slash-separated alternatives: "Paris/France" accepts either
 */
export function isCorrect(userAnswer: string, correctAnswer: string): boolean {
  if (!userAnswer || !correctAnswer) return false;

  const userNorm = normalize(userAnswer);

  // Slash-separated alternatives in correct answer
  const alternatives = correctAnswer.split('/').map((a) => a.trim());

  for (const alt of alternatives) {
    const forms = withoutOptionalParens(alt);
    for (const form of forms) {
      if (normalize(form) === userNorm) return true;
    }
  }

  return false;
}
