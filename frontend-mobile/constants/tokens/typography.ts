export const typography = {
  display: {
    fontSize: 36,
    lineHeight: 44,
    fontFamily: 'Farro-Bold',
  },
  headline: {
    fontSize: 30,
    lineHeight: 38,
    fontFamily: 'Farro-Bold',
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontFamily: 'Farro-Bold',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Farro-Regular',
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Farro-Medium',
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'Farro-Regular',
  },
} as const;

export type Typography = typeof typography;
export type TypographyKey = keyof Typography;
