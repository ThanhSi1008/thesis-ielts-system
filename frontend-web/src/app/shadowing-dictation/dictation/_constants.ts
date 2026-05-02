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
