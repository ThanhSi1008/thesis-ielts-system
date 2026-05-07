import { WAVEFORM_HEIGHTS } from '../_constants';
import { PlayCircle } from 'lucide-react';
import { ShadowingVideo, ShadowingSentence } from '@/services/shadowing.api';

export interface ShadowingVideoPlayerProps {
  foundationVocabLesson: ShadowingVideo;
  isYouTube: boolean;
  ytState: any;
  playerRef: React.RefObject<any>;
  audioRef: React.RefObject<HTMLAudioElement>;
  currentTime: number;
  formatTime: (time: number) => string;
  currentSentence: ShadowingSentence;
}

export default function ShadowingVideoPlayer({
  foundationVocabLesson,
  isYouTube,
  ytState,
  playerRef,
  audioRef,
  currentTime,
  formatTime,
  currentSentence,
}: ShadowingVideoPlayerProps) {
  const isPlaying = isYouTube ? ytState.isPlaying : (audioRef.current && !audioRef.current.paused);
  const onPlay = () => {};
  return (
    <div className="col-span-2 h-full bg-black flex flex-col justify-center items-center overflow-hidden">
      {isYouTube ? (
        <div className="w-full aspect-video bg-black flex justify-center items-center">
          <div ref={playerRef} className="w-full h-full max-h-full" />
        </div>
      ) : (
        <div className="w-full aspect-video bg-gray-50 flex flex-col items-center justify-center p-8 relative overflow-hidden">
          {/* Subtle grid background */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />

          <div className="w-24 h-24 bg-white/50 rounded-full flex items-center justify-center mb-8 shadow-sm backdrop-blur-sm z-10">
            <button
              onClick={onPlay}
              className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-gray-900 hover:scale-105 transition-all shadow-lg active:scale-95"
            >
              <PlayCircle className="w-10 h-10 ml-1" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 h-24 z-10">
            {WAVEFORM_HEIGHTS.map((height, i) => (
              <div
                key={i}
                className="w-1.5 bg-primary rounded-full transition-all duration-300 opacity-60"
                style={{
                  height: `${height}%`,
                  animation: isPlaying
                    ? `waveform 1s ease-in-out infinite ${i * 0.05}s`
                    : 'none',
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Global CSS for audio waveform animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes waveform {
          0%, 100% { transform: scaleY(0.5); opacity: 0.5; }
          50% { transform: scaleY(1); opacity: 1; }
        }
      `}} />
    </div>
  );
}
