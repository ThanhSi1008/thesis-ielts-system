/**
 * FlashcardViewer — renders a flashcard with full media support:
 *   - Text fields (plain)
 *   - HTML with <img>  → parsed to native Image
 *   - HTML with mixed content → WebView (minimal, inline)
 *   - Audio URL (fieldType === 'media', no HTML tags) → expo-audio player
 *   - Field styles: fontSize, fontWeight, fontStyle, color, textAlign
 *
 * Props mirror the StudyCard type from [deckId].tsx.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  Dimensions,
  ScrollView,
  Animated,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useAudioPlayer } from 'expo-audio';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';

// ─── Types ────────────────────────────────────────────────────────────────────
interface CardField {
  id: string;
  name: string;
  order: number;
  fieldType: string; // 'text' | 'media' | ...
}

interface CardTemplate {
  frontFields: string[];
  backFields: string[];
  fieldStyles?: Record<string, Record<string, string>>;
  cardStyle?: Record<string, string>;
}

export interface ViewerCard {
  id: string;
  front?: string;
  back?: string;
  tags?: string[];
  fieldValues?: Record<string, string>;
  fieldStyles?: Record<string, Record<string, string>>;
  cardType?: {
    fields: CardField[];
    templates: CardTemplate[];
  } | null;
}

interface FlashcardViewerProps {
  card: ViewerCard;
  side: 'front' | 'back';
  /** If provided, used to determine card width. Defaults to screen width – 2*SPACING.lg */
  width?: number;
  cardStyle?: Record<string, string>;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const SCREEN_W = Dimensions.get('window').width;
const FONT_SIZE_MAP: Record<string, number> = {
  sm: 12,
  md: 14,
  lg: 18,
  xl: 24,
  '2xl': 30,
};

// ─── Field style mapping ──────────────────────────────────────────────────────
function resolveFieldStyle(raw?: Record<string, string>): object {
  if (!raw) return {};
  const style: any = {};
  if (raw.fontSize) style.fontSize = FONT_SIZE_MAP[raw.fontSize] ?? 18;
  if (raw.fontWeight) style.fontWeight = raw.fontWeight;
  if (raw.fontStyle) style.fontStyle = raw.fontStyle;
  if (raw.textDecoration) style.textDecorationLine = raw.textDecoration;
  if (raw.color) style.color = raw.color;
  if (raw.textAlign) style.textAlign = raw.textAlign as any;
  return style;
}

// ─── Parse img src from an <img…> HTML string ─────────────────────────────────
const IMG_SRC_RE = /<img[^>]+src=["']([^"']+)["']/i;
function parseImgSrc(html: string): string | null {
  return IMG_SRC_RE.exec(html)?.[1] ?? null;
}

// ─── Detect content type ──────────────────────────────────────────────────────
type ContentKind = 'text' | 'img-only' | 'html' | 'audio-url';

function detectKind(value: string, fieldType?: string): ContentKind {
  if (fieldType === 'media' && !/^<[a-z]/i.test(value)) return 'audio-url';
  if (/^<img\b/i.test(value.trim())) return 'img-only';
  if (/<[a-z]/i.test(value)) return 'html';
  return 'text';
}

// ─── Audio Player ─────────────────────────────────────────────────────────────
function AudioField({ url }: { url: string }) {
  const player = useAudioPlayer(url);
  const [playing, setPlaying] = useState(false);

  const toggle = useCallback(async () => {
    try {
      if (playing) {
        player.pause();
      } else {
        player.play();
      }
      setPlaying((p) => !p);
    } catch {
      /* silent */
    }
  }, [playing, player]);

  return (
    <View style={af.row}>
      <TouchableOpacity style={af.btn} onPress={toggle} activeOpacity={0.8}>
        <Ionicons name={playing ? 'pause' : 'play'} size={22} color="#fff" />
      </TouchableOpacity>
      <Text style={af.label}>{playing ? 'Playing…' : 'Tap to play audio'}</Text>
    </View>
  );
}
const af = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  btn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, fontWeight: '600' },
});

// ─── Image field ──────────────────────────────────────────────────────────────
function ImageField({ src, maxW }: { src: string; maxW: number }) {
  const [size, setSize] = useState({ w: maxW, h: 200 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Image.getSize(
      src,
      (w, h) => {
        const ratio = h / w;
        const displayW = Math.min(w, maxW);
        setSize({ w: displayW, h: Math.min(displayW * ratio, 280) });
        setLoading(false);
      },
      () => {
        setLoading(false);
        setError(true);
      },
    );
  }, [src, maxW]);

  if (error)
    return (
      <View style={[imgf.placeholder, { width: maxW, height: 120 }]}>
        <Ionicons name="image-outline" size={32} color={COLORS.textMuted} />
        <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZES.xs, marginTop: 4 }}>
          Image unavailable
        </Text>
      </View>
    );

  return (
    <View style={imgf.wrapper}>
      {loading && <ActivityIndicator style={imgf.loader} color={COLORS.primary} />}
      <Image
        source={{ uri: src }}
        style={{ width: size.w, height: size.h, borderRadius: RADIUS.lg, opacity: loading ? 0 : 1 }}
        resizeMode="contain"
        onLoad={() => setLoading(false)}
      />
    </View>
  );
}
const imgf = StyleSheet.create({
  wrapper: { alignItems: 'center' },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  loader: { position: 'absolute' },
});

// ─── HTML field (WebView inline) ──────────────────────────────────────────────
const HTML_TEMPLATE = (body: string, textColor: string) => `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, system-ui, sans-serif;
    font-size: 18px;
    color: ${textColor};
    line-height: 1.55;
    padding: 0 4px;
    word-break: break-word;
  }
  img { max-width: 100%; height: auto; border-radius: 8px; display: block; margin: 8px auto; }
  video { max-width: 100%; height: auto; border-radius: 8px; display: block; margin: 8px auto; }
</style>
</head>
<body>${body}</body>
</html>`;

function HtmlField({
  html,
  fieldStyle,
  cardW,
}: {
  html: string;
  fieldStyle?: object;
  cardW: number;
}) {
  // Estimate height based on content length (rough approximation)
  const [height, setHeight] = useState(100);

  return (
    <WebView
      source={{ html: HTML_TEMPLATE(html, (fieldStyle as any)?.color ?? '#212529') }}
      style={{ width: cardW, height, backgroundColor: 'transparent' }}
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
      onMessage={(e) => {
        const h = parseInt(e.nativeEvent.data, 10);
        if (!isNaN(h) && h > 0) setHeight(h + 16);
      }}
      injectedJavaScript="window.ReactNativeWebView.postMessage(document.body.scrollHeight.toString());"
      originWhitelist={['*']}
    />
  );
}

// ─── Single field renderer ────────────────────────────────────────────────────
function FieldRenderer({
  value,
  fieldType,
  fieldStyle,
  cardW,
  isFront,
}: {
  value: string;
  fieldType?: string;
  fieldStyle?: Record<string, string>;
  cardW: number;
  isFront: boolean;
}) {
  const kind = detectKind(value, fieldType);
  const resolvedStyle = resolveFieldStyle(fieldStyle);

  if (kind === 'audio-url') {
    return <AudioField url={value} />;
  }

  if (kind === 'img-only') {
    const src = parseImgSrc(value);
    return src ? <ImageField src={src} maxW={cardW - SPACING.lg * 2} /> : null;
  }

  if (kind === 'html') {
    return <HtmlField html={value} fieldStyle={resolvedStyle} cardW={cardW - SPACING.lg} />;
  }

  // Plain text
  return <Text style={[isFront ? f.frontText : f.backText, resolvedStyle]}>{value}</Text>;
}

// ─── FlashcardViewer ──────────────────────────────────────────────────────────
export const FlashcardViewer = React.memo(function FlashcardViewer({
  card,
  side,
  width,
}: FlashcardViewerProps) {
  const cardW = width ?? SCREEN_W - SPACING.lg * 2;
  const isFront = side === 'front';
  const ct = card.cardType;

  // Determine which fields to show
  const fieldIds: string[] = (() => {
    if (!ct?.templates?.[0]) return [];
    return isFront ? ct.templates[0].frontFields : ct.templates[0].backFields;
  })();

  // Fallback for non-custom cards
  const fallbackValue = isFront ? (card.front ?? '') : (card.back ?? '');

  // If no custom card type, render classic front/back
  if (!ct || fieldIds.length === 0) {
    const kind = detectKind(fallbackValue);
    return (
      <View style={f.container}>
        {kind === 'img-only' ? (
          <ImageField src={parseImgSrc(fallbackValue) ?? ''} maxW={cardW - SPACING.lg * 2} />
        ) : kind === 'html' ? (
          <HtmlField html={fallbackValue} cardW={cardW} />
        ) : (
          <Text style={isFront ? f.frontText : f.backText}>{fallbackValue || '—'}</Text>
        )}
        {!isFront && card.tags && card.tags.length > 0 && <TagsRow tags={card.tags} />}
      </View>
    );
  }

  // Custom card type: dynamic fields
  const fieldsToRender = fieldIds
    .map((fid) => {
      const fieldDef = ct.fields.find((f) => f.id === fid);
      const raw = card.fieldValues?.[fid] ?? '';
      // Fallback for standard Front/Back named fields
      const value =
        raw ||
        (fieldDef?.name === 'Front'
          ? (card.front ?? '')
          : fieldDef?.name === 'Back'
            ? (card.back ?? '')
            : '');
      if (!value) return null;

      const templateFieldStyle = ct.templates[0]?.fieldStyles?.[fid];
      const cardFieldStyle = card.fieldStyles?.[fid];
      const mergedStyle = { ...templateFieldStyle, ...cardFieldStyle };

      return { fid, value, fieldDef, mergedStyle };
    })
    .filter(Boolean) as {
    fid: string;
    value: string;
    fieldDef?: CardField;
    mergedStyle: Record<string, string>;
  }[];

  return (
    <View style={f.container}>
      {fieldsToRender.map(({ fid, value, fieldDef, mergedStyle }) => (
        <View key={fid} style={f.fieldWrap}>
          <FieldRenderer
            value={value}
            fieldType={fieldDef?.fieldType}
            fieldStyle={mergedStyle}
            cardW={cardW}
            isFront={isFront}
          />
        </View>
      ))}
      {!isFront && card.tags && card.tags.length > 0 && <TagsRow tags={card.tags} />}
    </View>
  );
});

// ─── Tags row ─────────────────────────────────────────────────────────────────
function TagsRow({ tags }: { tags: string[] }) {
  return (
    <View style={f.tagsRow}>
      {tags.map((t) => (
        <View key={t} style={f.tagChip}>
          <Text style={f.tagText}>#{t}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const f = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  fieldWrap: {
    width: '100%',
    alignItems: 'center',
  },
  frontText: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 38,
  },
  backText: {
    fontSize: 18,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 28,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  tagChip: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tagText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.textSecondary },
});
