import { useState, useRef, useCallback, useEffect } from 'react';

export interface UseAudioPlayerOptions {
  isYouTube: boolean;
  ytPlayerRef: React.MutableRefObject<any>;
  ytReady: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
  playbackSpeed: number;
}

export interface UseAudioPlayerReturn {
  isPlaying: boolean;
  playSentence: (sentence: { audioStart: number; audioEnd: number }) => void;
  stopPlayback: () => void;
}

export function useAudioPlayer({
  isYouTube,
  ytPlayerRef,
  ytReady,
  audioRef,
  playbackSpeed,
}: UseAudioPlayerOptions): UseAudioPlayerReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);

    if (isYouTube && ytReady && ytPlayerRef.current) {
      try {
        ytPlayerRef.current.pauseVideo();
      } catch (e) {}
    } else if (!isYouTube && audioRef.current) {
      audioRef.current.pause();
    }
  }, [isYouTube, ytReady, ytPlayerRef, audioRef]);

  const playSentence = useCallback(
    (sentence: { audioStart: number; audioEnd: number }) => {
      if (!sentence) return;
      stopPlayback();

      if (isYouTube && ytReady && ytPlayerRef.current) {
        try {
          ytPlayerRef.current.setPlaybackRate(playbackSpeed);
          ytPlayerRef.current.seekTo(sentence.audioStart, true);
          ytPlayerRef.current.playVideo();
          setIsPlaying(true);

          timerRef.current = setInterval(() => {
            if (ytPlayerRef.current?.getCurrentTime() >= sentence.audioEnd) {
              ytPlayerRef.current.pauseVideo();
              setIsPlaying(false);
              if (timerRef.current) clearInterval(timerRef.current);
            }
          }, 50);
        } catch (e) {}
      } else if (!isYouTube && audioRef.current) {
        audioRef.current.playbackRate = playbackSpeed;
        audioRef.current.currentTime = sentence.audioStart;
        
        // Handle play promise rejection silently (e.g., auto-play policy)
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);

        timerRef.current = setInterval(() => {
          if (audioRef.current && audioRef.current.currentTime >= sentence.audioEnd) {
            audioRef.current.pause();
            setIsPlaying(false);
            if (timerRef.current) clearInterval(timerRef.current);
          }
        }, 50);
      }
    },
    [isYouTube, ytReady, ytPlayerRef, audioRef, playbackSpeed, stopPlayback]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return { isPlaying, playSentence, stopPlayback };
}
