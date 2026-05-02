'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useShadowingLesson } from '../_hooks/useShadowingLesson';
import { useShadowingProgress } from '../_hooks/useShadowingProgress';
import { useYouTubePlayer } from '../_hooks/useYouTubePlayer';
import { useAudioPlayer } from '../_hooks/useAudioPlayer';
import { useRecording } from '../_hooks/useRecording';
import { useShadowingShortcuts } from '../_hooks/useShadowingShortcuts';
import { SPEED_PRESETS, normalizeWord, formatTime } from '../_constants';

import ShadowingVideoPlayer from '../_components/ShadowingVideoPlayer';
import ShadowingProgressBar from '../_components/ShadowingProgressBar';
import ShadowingPlaybackControls from '../_components/ShadowingPlaybackControls';
import ShadowingTranscriptList from '../_components/ShadowingTranscriptList';
import ActiveSentenceDisplay from '../_components/ActiveSentenceDisplay';
import RecordingControls from '../_components/RecordingControls';
import ShadowingActionBar from '../_components/ShadowingActionBar';
import ShadowingCompletionScreen from '../_components/ShadowingCompletionScreen';

export default function ShadowingPracticePage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const { lesson, isInitializing, sentences, isYouTube, audioUrl, totalSentences } = useShadowingLesson(id);

  const {
    completedSentences,
    currentIndex,
    setCurrentIndex,
    markCompleted,
    isFinished,
  } = useShadowingProgress({ lessonId: lesson?.id, totalSentences, isInitializing });

  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [showTranslation, setShowTranslation] = useState(true);
  const [showPhonetic, setShowPhonetic] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const {
    playerRef: ytPlayerRef,
    isReady: isYtReady,
  } = useYouTubePlayer({ videoId: lesson?.youtubeVideoId || null, containerRef });

  const {
    isPlaying,
    playSentence: playAudioSentence,
    stopPlayback,
  } = useAudioPlayer({
    isYouTube,
    ytPlayerRef,
    ytReady: isYtReady,
    audioRef,
    playbackSpeed
  });

  const {
    isRecording,
    spokenWords,
    recordedAudioUrl,
    startRecording,
    stopRecording,
    clearRecording,
  } = useRecording();

  const currentSentence = sentences[currentIndex];

  const playCurrentSentence = () => {
    if (!currentSentence) return;
    playAudioSentence(currentSentence);
  };

  const toggleSpeed = () => {
    const idx = SPEED_PRESETS.indexOf(playbackSpeed as any);
    const nextIdx = (idx + 1) % SPEED_PRESETS.length;
    setPlaybackSpeed(SPEED_PRESETS[nextIdx]);
  };

  const handleNext = () => {
    if (!currentSentence) return;
    markCompleted(currentIndex);
    clearRecording();
    if (currentIndex < totalSentences - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  useShadowingShortcuts({
    onNext: handleNext,
    onRepeat: playCurrentSentence,
    onToggleSpeed: toggleSpeed,
    canGoNext: !!currentSentence,
  });

  // Auto-play on sentence change
  useEffect(() => {
    if (currentSentence && !isFinished) {
      setTimeout(() => playCurrentSentence(), 300);
    }
  }, [currentIndex, isYtReady]);

  // Auto-scroll right panel to bottom on sentence change
  useEffect(() => {
    if (scrollContainerRef.current) {
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({
            top: scrollContainerRef.current.scrollHeight,
            behavior: 'smooth',
          });
        }
      }, 50);
    }
  }, [currentIndex, completedSentences]);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!lesson || !currentSentence) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Lesson not found or empty.</div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-white relative overflow-hidden">
      {/* Left Panel: Video only — full-height black theater */}
      <div className="flex-1 flex flex-col bg-black min-w-0 justify-center">
        <div className="w-full max-w-[1280px] mx-auto aspect-video">
          <ShadowingVideoPlayer
            lesson={lesson}
            isYouTube={isYouTube}
            ytState={{ isPlaying }}
            playerRef={isYouTube ? containerRef : { current: null }}
            audioRef={audioRef}
            currentTime={0}
            formatTime={formatTime}
            currentSentence={currentSentence}
          />
        </div>
      </div>

      {/* Right Panel: Progress + Transcript + Recording + Controls */}
      <div className="w-full md:w-[400px] lg:w-[450px] xl:w-[500px] flex flex-col border-l bg-white flex-shrink-0 relative">
        {/* Progress Bar Header */}
        <div className="pt-2 px-4 pb-2 border-b bg-white">
          <ShadowingProgressBar
            current={completedSentences.length}
            total={totalSentences}
          />
        </div>

        {/* Scrollable area: transcript + active sentence + recording */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto flex flex-col bg-gray-50 pb-4">
          <ShadowingTranscriptList
            sentences={sentences}
            completedSentences={completedSentences}
            currentIndex={currentIndex}
            onPlaySentence={(s) => playAudioSentence(s)}
            scrollAnchorRef={undefined as any}
          />

          <div className="mt-auto px-4 py-6 bg-white border-t border-gray-100 shadow-sm space-y-8">
            <ActiveSentenceDisplay
              sentence={currentSentence as any}
              spokenWords={spokenWords}
              showTranslation={showTranslation}
              showPhonetic={showPhonetic}
              onToggleTranslation={() => setShowTranslation(!showTranslation)}
              onTogglePhonetic={() => setShowPhonetic(!showPhonetic)}
              normalizeWord={normalizeWord}
            />

            <div className="flex flex-col items-center justify-center gap-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tap to Record</span>
              <RecordingControls
                isRecording={isRecording}
                recordedAudioUrl={recordedAudioUrl}
                onStart={startRecording}
                onStop={stopRecording}
                onClear={clearRecording}
              />
            </div>
          </div>
        </div>

        {/* Pinned bottom: Playback controls + action bar */}
        <div className="border-t bg-gray-50">
          <ShadowingPlaybackControls
            playbackSpeed={playbackSpeed}
            onSpeedChange={setPlaybackSpeed}
            onRepeat={playCurrentSentence}
            isPlaying={isPlaying}
          />
        </div>

        <ShadowingActionBar
          onMarkDone={handleNext}
          onNext={handleNext}
          isFinished={isFinished}
          hasNext={currentIndex < totalSentences - 1}
        />
      </div>

      {isFinished && (
        <ShadowingCompletionScreen
          lesson={lesson}
          onRetry={() => {
            setCurrentIndex(0);
            clearRecording();
            setTimeout(() => playCurrentSentence(), 500);
          }}
          onBack={() => router.push('/shadowing-dictation/shadowing')}
        />
      )}
    </div>
  );
}
