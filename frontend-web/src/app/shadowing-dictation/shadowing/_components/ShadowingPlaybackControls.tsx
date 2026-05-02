import { Repeat } from 'lucide-react';
import { SPEED_PRESETS } from '../_constants';

export interface ShadowingPlaybackControlsProps {
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
  onRepeat: () => void;
  isPlaying: boolean;
}

export default function ShadowingPlaybackControls({
  playbackSpeed,
  onSpeedChange,
  onRepeat,
  isPlaying,
}: ShadowingPlaybackControlsProps) {
  return (
    <div className="p-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between shrink-0 gap-3 overflow-x-auto hide-scrollbar">
      <div className="flex items-center gap-2 shrink-0">
        {/* Speed selector */}
        <select
          value={playbackSpeed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="text-sm border-gray-200 rounded-lg focus:ring-primary focus:border-primary py-1.5 pl-3 pr-8 shadow-sm"
          title="Playback Speed"
        >
          {SPEED_PRESETS.map((speed) => (
            <option key={speed} value={speed}>
              {speed}x
            </option>
          ))}
        </select>

        {/* Repeat button */}
        <button
          onClick={onRepeat}
          disabled={isPlaying}
          className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50 group flex items-center gap-2"
          title="Repeat Sentence (Alt + R)"
        >
          <Repeat className="w-5 h-5" />
          <span className="text-sm font-medium">Repeat</span>
        </button>
      </div>
    </div>
  );
}
