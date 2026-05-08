export const SPEED_PRESETS = [0.25, 0.5, 0.75, 1.0, 2.0] as const;
export const WAVEFORM_HEIGHTS = [30, 50, 80, 100, 70, 40, 20];
export const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const;

export const normalizeWord = (w: string) =>
  w.toLowerCase().replace(/[.,!?'"]/g, '').trim();

export const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

// Hint system
/** Maximum hint level per word (0 = no hint, 3 = fully revealed). */
export const MAX_HINT_LEVEL = 3;

/** Score multiplier per hint level, applied per word. */
export const HINT_SCORE_MULTIPLIERS = [1.0, 0.75, 0.5, 0.0] as const;

/**
 * Generate hint text for a word at a given hint level.
 * level 0 = "_", level 1 = "i...", level 2 = "i...n", level 3 = full word.
 */
export const getHintText = (word: string, level: number): string => {
  if (level <= 0 || word.length === 0) return '_';
  if (level >= MAX_HINT_LEVEL) return word;

  const clean = word.replace(/[.,!?'"]/g, '');
  if (level === 1) return `${clean[0]}...`;
  if (level === 2 && clean.length > 1) return `${clean[0]}...${clean[clean.length - 1]}`;

  return '_';
};
