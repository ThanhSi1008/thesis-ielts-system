'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { useDictationLesson } from '../_hooks/useDictationLesson';
import { useDictationProgress } from '../_hooks/useDictationProgress';
import { useYouTubePlayer } from '../_hooks/useYouTubePlayer';
import { useAudioPlayer } from '../_hooks/useAudioPlayer';
import { useDictation } from '../_hooks/useDictation';
import { useDictationHints } from '../_hooks/useDictationHints';
import { useDictationShortcuts } from '../_hooks/useDictationShortcuts';
import { SPEED_PRESETS, normalizeWord, formatTime } from '../_constants';

import DictationVideoPlayer from '../_components/DictationVideoPlayer';
import DictationProgressBar from '../_components/DictationProgressBar';
import DictationPlaybackControls from '../_components/DictationPlaybackControls';
import DictationTranscriptList from '../_components/DictationTranscriptList';
import DictationInputRow from '../_components/DictationInputRow';
import DictationActionBar from '../_components/DictationActionBar';
import DictationCompletionScreen from '../_components/DictationCompletionScreen';
import FloatingSelectionManager from '@/components/FloatingSelectionManager';

export default function DictationPracticePage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const { foundationVocabLesson, isInitializing, sentences, isYouTube, audioUrl, totalSentences } = useDictationLesson(id);

  const {
    completedSentences,
    currentIndex,
    setCurrentIndex,
    markCompleted,
    isFinished,
    difficulty,
    setDifficulty,
  } = useDictationProgress({ lessonId: foundationVocabLesson?.id, totalSentences, isInitializing });

  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const {
    playerRef: ytPlayerRef,
    isReady: isYtReady,
  } = useYouTubePlayer({ videoId: foundationVocabLesson?.youtubeVideoId || null, containerRef });

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

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentSentence = sentences[currentIndex];

  const playCurrentSentence = () => {
    if (!currentSentence) return;
    playAudioSentence(currentSentence);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
  };

  const toggleSpeed = () => {
    const idx = SPEED_PRESETS.indexOf(playbackSpeed as any);
    const nextIdx = (idx + 1) % SPEED_PRESETS.length;
    handleSpeedChange(SPEED_PRESETS[nextIdx]);
  };

  const {
    userInputs,
    handleInputChange,
    hiddenIndices,
    isChecked,
    isAllCorrect,
    checkAnswers,
    retry,
  } = useDictation(currentSentence as any, difficulty);

  const {
    getHintLevel,
    requestHint,
    requestHintForFocused,
  } = useDictationHints({
    words: currentSentence?.words,
    hiddenIndices,
    sentenceId: currentSentence?.id,
    onAutoFill: handleInputChange,
    isChecked,
  });

  const handleCheck = () => {
    checkAnswers(getHintLevel);
  };

  const handleNext = () => {
    if (!currentSentence) return;
    if (isChecked) {
      markCompleted(currentIndex);
    }
    if (currentIndex < totalSentences - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  useDictationShortcuts({
    onCheck: handleCheck,
    onNext: handleNext,
    onRepeat: playCurrentSentence,
    onToggleSpeed: toggleSpeed,
    onRetry: retry,
    onHint: requestHintForFocused,
    canCheck: !isChecked,
    canRetry: isChecked && !isAllCorrect,
    canGoNext: isChecked && isAllCorrect && currentIndex < totalSentences - 1,
  });

  useEffect(() => {
    if (currentSentence && !isFinished) {
      setTimeout(() => playCurrentSentence(), 300);
    }
  }, [currentIndex, isYtReady]);

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!foundationVocabLesson || !currentSentence) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">FoundationVocabLesson not found or empty.</div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-white relative overflow-hidden">
      {/* Left Panel: Video only */}
      <div className="flex-1 flex flex-col bg-black min-w-0 justify-center">
        <div className="w-full max-w-[1280px] mx-auto aspect-video">
          <DictationVideoPlayer
            foundationVocabLesson={foundationVocabLesson}
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

      {/* Right Panel: Sidebar (Progress, Controls, Dictation Interaction, Transcript) */}
      <div className="w-full md:w-[400px] lg:w-[450px] xl:w-[500px] flex flex-col border-l bg-white flex-shrink-0 relative">
        {/* Progress Bar Header */}
        <div className="pt-2 px-4 pb-2 border-b bg-white">
          <DictationProgressBar
            current={completedSentences.length}
            total={totalSentences}
          />
        </div>

        {/* Main interactive area */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto flex flex-col bg-gray-50 pb-8">
          <FloatingSelectionManager>
            <DictationTranscriptList
              sentences={sentences}
              completedSentences={completedSentences}
              currentIndex={currentIndex}
              onPlaySentence={(s) => {
                playAudioSentence(s);
              }}
            />

            <div className="pt-2 pb-4 px-4">
              <DictationInputRow
                sentence={currentSentence as any}
                userInputs={userInputs}
                onInputChange={handleInputChange}
                hiddenIndices={hiddenIndices}
                isChecked={isChecked}
                normalizeWord={normalizeWord}
                getHintLevel={getHintLevel}
                onRequestHint={requestHint}
              />
            </div>
          </FloatingSelectionManager>
        </div>

        {/* Playback Controls (moved to bottom) */}
        <div className="border-t bg-gray-50">
          <DictationPlaybackControls
            playbackSpeed={playbackSpeed}
            onSpeedChange={handleSpeedChange}
            onRepeat={playCurrentSentence}
            isPlaying={isPlaying}
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
          />
        </div>

        <DictationActionBar
          onCheck={handleCheck}
          onNext={handleNext}
          canCheck={!isChecked}
          isChecked={isChecked}
          isAllCorrect={isAllCorrect}
          hasNext={currentIndex < totalSentences - 1}
          isFinished={isFinished}
          onRetry={retry}
        />
      </div>

      {isFinished && (
        <DictationCompletionScreen
          foundationVocabLesson={foundationVocabLesson}
          onRestart={() => {
            setCurrentIndex(0);
            setTimeout(() => playCurrentSentence(), 500);
          }}
          onBack={() => router.push('/shadowing-dictation/dictation')}
        />
      )}
    </div>
  );
}
