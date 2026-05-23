import { StyleSheet } from 'react-native';
import { FONT_SIZES } from '@/constants';
import type { ThemeTokens } from '@/constants/theme';

export function createMarkdownStyles(colors: ThemeTokens) {
  return StyleSheet.create({
    body: { fontSize: FONT_SIZES.md, color: colors.text, lineHeight: 24 },
    paragraph: { marginBottom: 12 },
    strong: { fontWeight: '700', color: colors.text },
    em: { fontStyle: 'italic' },
    heading1: { fontSize: 20, fontWeight: '800', marginBottom: 12, color: colors.text },
    heading2: { fontSize: 18, fontWeight: '700', marginBottom: 10, color: colors.text },
    list_item: { marginBottom: 4 },
    bullet_list: { marginBottom: 12 },
    ordered_list: { marginBottom: 12 },
    table: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      marginBottom: 12,
    },
    tr: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    th: {
      flex: 1,
      padding: 10,
      backgroundColor: 'rgba(0,0,0,0.05)',
      fontWeight: '700',
    },
    td: {
      flex: 1,
      padding: 10,
    },
  });
}
