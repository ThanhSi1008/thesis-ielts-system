import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES } from '@/constants';

export const markdownStyles = StyleSheet.create({
  body: { fontSize: FONT_SIZES.md, color: COLORS.text, lineHeight: 24 },
  paragraph: { marginBottom: 12 },
  strong: { fontWeight: '700', color: COLORS.text },
  em: { fontStyle: 'italic' },
  heading1: { fontSize: 20, fontWeight: '800', marginBottom: 12, color: COLORS.text },
  heading2: { fontSize: 18, fontWeight: '700', marginBottom: 10, color: COLORS.text },
  list_item: { marginBottom: 4 },
  bullet_list: { marginBottom: 12 },
  ordered_list: { marginBottom: 12 },
  table: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    marginBottom: 12,
  },
  tr: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
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
