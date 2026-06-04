export const SPEED_PRESETS = [0.25, 0.5, 0.75, 1.0, 2.0] as const;
export const WAVEFORM_HEIGHTS = [30, 50, 80, 100, 70, 40, 20];

export const normalizeWord = (w: string) =>
  w.toLowerCase().replace(/[.,!?'"-\\/]/g, '').trim();

export const getLevenshteinDistance = (a: string, b: string): number => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i += 1) {
    matrix[0][i] = i;
  }

  for (let j = 0; j <= b.length; j += 1) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= b.length; j += 1) {
    for (let i = 1; i <= a.length; i += 1) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  return matrix[b.length][a.length];
};

export const fuzzyMatchWord = (spoken: string, correct: string): boolean => {
  const normSpoken = normalizeWord(spoken);
  const normCorrect = normalizeWord(correct);
  
  if (normSpoken === normCorrect) return true;
  
  // For very short words (1-2 chars), require exact match
  if (normCorrect.length <= 2) return normSpoken === normCorrect;
  
  // For medium words (3-5 chars), allow 1 typo
  if (normCorrect.length <= 5) return getLevenshteinDistance(normSpoken, normCorrect) <= 1;
  
  // For long words, allow 2 typos
  return getLevenshteinDistance(normSpoken, normCorrect) <= 2;
};

export const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};
