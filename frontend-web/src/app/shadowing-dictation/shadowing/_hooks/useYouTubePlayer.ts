import { useEffect, useRef, useState } from 'react';

export interface UseYouTubePlayerOptions {
  videoId: string | null;
  containerRef: React.RefObject<HTMLDivElement>;
}

export interface UseYouTubePlayerReturn {
  playerRef: React.MutableRefObject<any>;
  isReady: boolean;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

export function useYouTubePlayer({ videoId, containerRef }: UseYouTubePlayerOptions): UseYouTubePlayerReturn {
  const playerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!videoId) return;

    let isMounted = true;
    const initPlayer = () => {
      if (!containerRef.current || !window.YT || !window.YT.Player) return;
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          fs: 0,
          playsinline: 1,
          disablekb: 1,
        },
        events: {
          onReady: () => {
            if (isMounted) setIsReady(true);
          },
        },
      });
    };

    if (!document.getElementById('youtube-iframe-script')) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const checkYT = setInterval(() => {
      if (window.YT && window.YT.Player) {
        clearInterval(checkYT);
        initPlayer();
      }
    }, 100);

    return () => {
      isMounted = false;
      clearInterval(checkYT);
      if (playerRef.current?.destroy) {
        playerRef.current.destroy();
      }
    };
  }, [videoId, containerRef]);

  return { playerRef, isReady };
}
