export const motion = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 400,
    xSlow: 600,
  },
  easing: {
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
    decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
  },
} as const;

export type Motion = typeof motion;
