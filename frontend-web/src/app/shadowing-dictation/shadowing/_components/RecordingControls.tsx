import { Mic, Square, PlayCircle, Trash2 } from 'lucide-react';

export interface RecordingControlsProps {
  isRecording: boolean;
  recordedAudioUrl: string | null;
  onStart: () => void;
  onStop: () => void;
  onClear: () => void;
}

export default function RecordingControls({
  isRecording,
  recordedAudioUrl,
  onStart,
  onStop,
  onClear,
}: RecordingControlsProps) {
  const hasRecording = !!recordedAudioUrl;
  const onPlayRecording = () => {
    const audio = new Audio(recordedAudioUrl!);
    audio.play();
  };
  return (
    <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 shrink-0">
      <div className="flex flex-col items-center justify-center space-y-4">
        {isRecording && (
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-sm font-medium text-red-500">Recording...</span>
          </div>
        )}

        <div className="flex items-center gap-6">
          {!isRecording && !hasRecording && (
            <button
              onClick={onStart}
              className="group flex flex-col items-center gap-2"
            >
              <div className="w-16 h-16 bg-white dark:bg-gray-800 border-2 border-red-500 text-red-500 rounded-full flex items-center justify-center group-hover:bg-red-50 dark:group-hover:bg-red-900/20 transition-colors shadow-sm">
                <Mic className="w-8 h-8" />
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Record</span>
            </button>
          )}

          {isRecording && (
            <button
              onClick={onStop}
              className="group flex flex-col items-center gap-2"
            >
              <div className="w-16 h-16 bg-red-50 text-red-600 border-2 border-red-600 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors shadow-sm">
                <Square className="w-6 h-6" fill="currentColor" />
              </div>
              <span className="text-sm font-medium text-red-600">Stop</span>
            </button>
          )}

          {hasRecording && !isRecording && (
            <>
              <button
                onClick={onPlayRecording}
                className="group flex flex-col items-center gap-2"
              >
                <div className="w-16 h-16 bg-white border-2 border-primary text-primary rounded-full flex items-center justify-center group-hover:bg-primary/10 transition-colors shadow-sm">
                  <PlayCircle className="w-8 h-8" />
                </div>
                <span className="text-sm font-medium text-primary">Play Yours</span>
              </button>
              
              <button
                onClick={onClear}
                className="group flex flex-col items-center gap-2"
              >
                <div className="w-12 h-12 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-400 rounded-full flex items-center justify-center hover:border-red-400 hover:text-red-500 transition-colors shadow-sm">
                  <Trash2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Clear</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
