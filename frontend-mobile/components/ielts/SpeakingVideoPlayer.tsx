/**
 * SpeakingVideoPlayer — Smart video player for IELTS Speaking questions.
 *
 * Strategy:
 *  - YouTube URL (contains "youtube.com" or "youtu.be") → WebView embed
 *  - Direct URL (Cloudinary, S3, mp4, etc.) → expo-video VideoView
 *  - Empty URL → Placeholder state
 *
 * Usage:
 *  <SpeakingVideoPlayer
 *    uri="https://..."
 *    onEnded={() => {}}
 *    captionText="Listen to the question"
 *    playing={step === 'PLAYING'}
 *  />
 */

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { useTheme } from '@/contexts/ThemeContext';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtu\.be\/([^?&#]+)/,
    /youtube\.com\/watch\?v=([^&#]+)/,
    /youtube\.com\/embed\/([^?&#]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function isYouTubeUrl(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be');
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SpeakingVideoPlayerProps {
  /** Video URL — YouTube or direct (Cloudinary/S3/mp4). Empty string = no video. */
  uri: string;
  /** Called when the video finishes playing (not called for YouTube — handled separately). */
  onEnded?: () => void;
  /** Optional caption overlay text (e.g. "Listen to the question", "Time to think"). */
  captionText?: string;
  /** Whether the video should be playing. Setting to true starts playback. */
  playing?: boolean;
  /** Height of the video container. Defaults to screen-width * 9/16 (16:9). */
  height?: number;
  /** Called when video is ready to play. */
  onReady?: () => void;
}

// ─── Direct-URL player (expo-video) ─────────────────────────────────────────

function NativeVideoPlayer({
  uri,
  playing,
  onEnded,
  onReady,
  captionText,
  height = DEFAULT_HEIGHT,
}: SpeakingVideoPlayerProps) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
    p.muted = false;
  });

  // Play / pause in sync with `playing` prop
  useEffect(() => {
    if (!uri) return;
    if (playing) {
      player.play();
    } else {
      player.pause();
    }
  }, [playing, uri, player]);

  // Listen for playback finish
  useEffect(() => {
    const sub = player.addListener('playToEnd', () => {
      onEnded?.();
    });
    return () => sub.remove();
  }, [player, onEnded]);

  // Notify ready when component mounts
  useEffect(() => {
    onReady?.();
  }, [onReady]);

  return (
    <View style={[pStyles.videoWrap, { height }]}>
      <VideoView player={player} style={pStyles.video} contentFit="cover" nativeControls={false} />
      {captionText && (
        <View style={pStyles.captionWrap} pointerEvents="none">
          <Text style={pStyles.caption}>{captionText}</Text>
        </View>
      )}
    </View>
  );
}

// ─── YouTube player (WebView) ─────────────────────────────────────────────────

const YT_AUTO_ADVANCE_MS = 300; // brief delay after postMessage ACK

function YouTubePlayer({
  uri,
  playing,
  onEnded,
  captionText,
  height,
}: SpeakingVideoPlayerProps & { height: number }) {
  const webRef = useRef<WebView>(null);
  const [loaded, setLoaded] = useState(false);
  const ytId = extractYouTubeId(uri);

  // Inject JS to play/pause via YouTube IFrame API
  const controlPlayback = useCallback(
    (play: boolean) => {
      if (!loaded || !webRef.current) return;
      const fn = play ? 'playVideo' : 'pauseVideo';
      webRef.current.injectJavaScript(`
      (function() {
        try { document.querySelector('iframe')?.contentWindow?.postMessage('{"event":"command","func":"${fn}","args":""}', '*'); } catch(e) {}
        try { if (window.player && window.player.${fn}) { window.player.${fn}(); } } catch(e) {}
      })();
      true;
    `);
    },
    [loaded],
  );

  useEffect(() => {
    controlPlayback(!!playing);
  }, [playing, controlPlayback]);

  const html = ytId
    ? `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; background: #000; }
        body { background: #000; overflow: hidden; }
        #player { width: 100vw; height: 100vh; }
      </style>
    </head>
    <body>
      <div id="player"></div>
      <script src="https://www.youtube.com/iframe_api"></script>
      <script>
        var player;
        function onYouTubeIframeAPIReady() {
          player = new YT.Player('player', {
            videoId: '${ytId}',
            playerVars: { autoplay: 0, rel: 0, modestbranding: 1, playsinline: 1 },
            events: {
              onStateChange: function(e) {
                if (e.data === YT.PlayerState.ENDED) {
                  window.ReactNativeWebView.postMessage('VIDEO_ENDED');
                }
                if (e.data === YT.PlayerState.PLAYING) {
                  window.ReactNativeWebView.postMessage('VIDEO_PLAYING');
                }
              }
            }
          });
          window.ReactNativeWebView.postMessage('PLAYER_READY');
        }
      </script>
    </body>
    </html>
  `
    : '';

  if (!ytId) {
    return (
      <View style={[pStyles.videoWrap, { height }]}>
        <View style={pStyles.placeholder}>
          <Ionicons name="videocam-off-outline" size={32} color="#94A3B8" />
          <Text style={pStyles.placeholderText}>No video available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[pStyles.videoWrap, { height }]}>
      {!loaded && (
        <View style={pStyles.loading}>
          <ActivityIndicator color={COLORS.primary} />
        </View>
      )}
      <WebView
        ref={webRef}
        source={{ html }}
        style={[pStyles.video, { opacity: loaded ? 1 : 0 }]}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        onLoadEnd={() => setLoaded(true)}
        onMessage={(e) => {
          const msg = e.nativeEvent.data;
          if (msg === 'VIDEO_ENDED') {
            setTimeout(() => onEnded?.(), YT_AUTO_ADVANCE_MS);
          }
        }}
        scrollEnabled={false}
      />
      {captionText && (
        <View style={pStyles.captionWrap} pointerEvents="none">
          <Text style={pStyles.caption}>{captionText}</Text>
        </View>
      )}
    </View>
  );
}

// ─── Empty / Placeholder ─────────────────────────────────────────────────────

function VideoPlaceholder({ height }: { height: number }) {
  const { colors } = useTheme();
  return (
    <View style={[pStyles.videoWrap, { height, backgroundColor: colors.surface }]}>
      <View style={[pStyles.placeholderIcon, { backgroundColor: COLORS.primary + '15' }]}>
        <Ionicons name="mic-outline" size={28} color={COLORS.primary} />
      </View>
      <Text style={[pStyles.placeholderTitle, { color: colors.text }]}>Speaking Test</Text>
      <Text style={[pStyles.placeholderSub, { color: colors.textSecondary }]}>No video for this question</Text>
    </View>
  );
}

// ─── Public Component ─────────────────────────────────────────────────────────

const { width: SCREEN_W } = Dimensions.get('window');
const DEFAULT_HEIGHT = Math.round(SCREEN_W * (9 / 16));

export default function SpeakingVideoPlayer(props: SpeakingVideoPlayerProps) {
  const { uri, height = DEFAULT_HEIGHT } = props;

  if (!uri) {
    return <VideoPlaceholder height={height} />;
  }

  if (isYouTubeUrl(uri)) {
    return <YouTubePlayer {...props} height={height} />;
  }

  // Direct URL (Cloudinary, S3, mp4, etc.)
  return <NativeVideoPlayer {...props} />;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const pStyles = StyleSheet.create({
  videoWrap: {
    width: '100%',
    backgroundColor: '#0a0a0a',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0a0a',
    zIndex: 10,
  },
  captionWrap: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  caption: {
    backgroundColor: 'rgba(0,0,0,0.78)',
    color: '#fff',
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
  },
  placeholder: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: RADIUS.lg,
    gap: SPACING.sm,
  },
  placeholderIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
  },
  placeholderSub: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  placeholderText: {
    fontSize: FONT_SIZES.sm,
    color: '#94A3B8',
    marginTop: SPACING.xs,
  },
});
