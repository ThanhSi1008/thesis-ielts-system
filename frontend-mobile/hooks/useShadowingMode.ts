import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { useAudioRecorderHook } from './useAudioRecorder';
import { usePronunciationChecker } from './usePronunciationChecker';
import { shadowingApi, dictationApi } from '@/services/features.api';

// Colour aliases so existing code compiles (COLORS has no .success/.error keys)
let ExpoSpeechRecognitionModule: any = null;
let useSpeechRecognitionEvent: any = (_eventName: string, _listener: any) => {};

try {
  const SpeechModule = require('expo-speech-recognition');
  ExpoSpeechRecognitionModule = SpeechModule.ExpoSpeechRecognitionModule;
  useSpeechRecognitionEvent = SpeechModule.useSpeechRecognitionEvent;
} catch (e) {
  console.warn('expo-speech-recognition not found. Voice features require a dev client.');
}

// Placeholder sentence data — in production, loaded from API or bundled JSON
const PLACEHOLDER_SENTENCES = [
  {
    id: 0,
    english: 'Hello, welcome to the IELTS practice session.',
    vietnamese: 'Xin chào, chào mừng đến với buổi luyện tập IELTS.',
    audioStart: 0,
    audioEnd: 3,
  },
  {
    id: 1,
    english: 'Today we will practice shadowing techniques.',
    vietnamese: 'Hôm nay chúng ta sẽ luyện tập kỹ thuật shadowing.',
    audioStart: 3,
    audioEnd: 6,
  },
  {
    id: 2,
    english: 'Listen carefully and repeat after the speaker.',
    vietnamese: 'Lắng nghe cẩn thận và nhắc lại sau người nói.',
    audioStart: 6,
    audioEnd: 9,
  },
];

export const getHintText = (word: string, level: number): string => {
  if (level <= 0 || word.length === 0) return '';
  if (level >= 3) return word;

  const clean = word.replace(/[.,!?'"]/g, '');
  if (level === 1) return `${clean[0]}...`;
  if (level === 2 && clean.length > 1) return `${clean[0]}...${clean[clean.length - 1]}`;

  return '';
};

export interface UseShadowingModeProps {
  lessonId: string;
  mode: string;
  userId?: string;
}

export function useShadowingMode({ lessonId, mode, userId }: UseShadowingModeProps) {
  const isShadowing = mode === 'shadowing';

  const audioRecorder = useAudioRecorderHook();
  const pronunciationChecker = usePronunciationChecker();

  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const [dictationInput, setDictationInput] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showFinishDialog, setShowFinishDialog] = useState(false);

  const sentences = useMemo(
    () => (lesson?.sentences?.length ? lesson.sentences : PLACEHOLDER_SENTENCES),
    [lesson],
  );
  const current = useMemo(() => sentences[currentIdx] || sentences[0], [sentences, currentIdx]);
  const progress = Math.round((completed.length / sentences.length) * 100);

  // Phase 1: Media Sync States
  const [playing, setPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [currentTime, setCurrentTime] = useState(0);
  const [trackWidth, setTrackWidth] = useState(0);

  const playerRef = useRef<any>(null);
  const audioPlayer = useAudioPlayer(lesson?.audioUrl || '');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // JS-clock based tracking
  const playStartTimeRef = useRef<number>(0);
  const sentenceStartSecRef = useRef<number>(0);

  // Phase 2: Dictation States
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'>(
    'Intermediate',
  );
  const [userInputs, setUserInputs] = useState<string[]>([]);
  const [isChecked, setIsChecked] = useState(false);
  const [isAllCorrect, setIsAllCorrect] = useState(false);
  const [hintLevels, setHintLevels] = useState<Record<number, number>>({});
  const [hiddenIndices, setHiddenIndices] = useState<Set<number>>(new Set());
  const [revealedWords, setRevealedWords] = useState<Set<number>>(new Set());
  const [sentenceCorrect, setSentenceCorrect] = useState(false);

  const currentSentenceWords = useMemo(() => {
    if (current?.words && Array.isArray(current.words) && current.words.length > 0) {
      return current.words;
    }
    return (current?.english || '').split(/\s+/).filter((w: string) => w.length > 0);
  }, [current]);

  const normalizeWord = useCallback(
    (w: string) =>
      w
        .toLowerCase()
        .replace(/[.,!?'"]/g, '')
        .trim(),
    [],
  );

  // Phase 2: Apply difficulty and initialize sentence states
  useEffect(() => {
    if (!current) return;

    setIsChecked(false);
    setIsAllCorrect(false);
    setSentenceCorrect(false);
    setHintLevels({});
    setShowAnswer(false);
    setSpokenTranscript('');
    pronunciationChecker.reset();
    setCurrentTime(current.audioStart);

    // Initialize userInputs to match word count
    const wordsCount = currentSentenceWords.length;
    setUserInputs(new Array(wordsCount).fill(''));

    // Determine hidden indices based on difficulty
    const totalWords = currentSentenceWords.length;
    const nonPunctuationIndices: number[] = [];
    currentSentenceWords.forEach((w: string, i: number) => {
      if (/[a-zA-Z0-9]/.test(w)) {
        nonPunctuationIndices.push(i);
      }
    });

    let ratio = 0.5;
    if (difficulty === 'Beginner') ratio = 0.3;
    else if (difficulty === 'Intermediate') ratio = 0.5;
    else if (difficulty === 'Advanced') ratio = 0.7;
    else if (difficulty === 'Expert') ratio = 1.0;

    const numToHide = Math.max(1, Math.floor(nonPunctuationIndices.length * ratio));
    const indices = [...nonPunctuationIndices];
    // basic shuffle to hide random words
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    const newHidden = new Set(indices.slice(0, numToHide));
    setHiddenIndices(newHidden);

    // Backwards compatibility for revealedWords
    const backCompatRevealed = new Set<number>();
    currentSentenceWords.forEach((_: string, i: number) => {
      if (!newHidden.has(i)) {
        backCompatRevealed.add(i);
      }
    });
    setRevealedWords(backCompatRevealed);
  }, [currentIdx, difficulty, currentSentenceWords]);

  const handleSeek = useCallback(
    (value: number) => {
      setCurrentTime(value);
      sentenceStartSecRef.current = value;
      playStartTimeRef.current = Date.now();
      if (lesson?.youtubeVideoId && playerRef.current) {
        playerRef.current.seekTo(value, true);
      } else if (lesson?.audioUrl) {
        audioPlayer.seekTo(value * 1000);
      }
    },
    [lesson, audioPlayer],
  );

  const handleSeekPress = useCallback(
    (locationX: number) => {
      if (trackWidth > 0 && current) {
        const duration = current.audioEnd - current.audioStart;
        const seekTime =
          current.audioStart + Math.max(0, Math.min(1, locationX / trackWidth)) * duration;
        handleSeek(seekTime);
      }
    },
    [trackWidth, current, handleSeek],
  );

  const formatTimeStr = useCallback((seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handleInputChange = useCallback((index: number, value: string) => {
    setUserInputs((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  }, []);

  const requestHint = useCallback((wordIndex: number) => {
    if (isChecked || !hiddenIndices.has(wordIndex) || !currentSentenceWords?.[wordIndex]) return;

    setHintLevels((prev) => {
      const currentLevel = prev[wordIndex] ?? 0;
      if (currentLevel >= 3) return prev;

      const nextLevel = currentLevel + 1;
      const next = { ...prev, [wordIndex]: nextLevel };

      if (nextLevel >= 3) {
        // Auto fill
        handleInputChange(wordIndex, currentSentenceWords[wordIndex]);
      }

      return next;
    });
  }, [isChecked, hiddenIndices, currentSentenceWords, handleInputChange]);

  const markCompleted = useCallback((idx: number) => {
    setCompleted((prev) => {
      if (!prev.includes(idx)) {
        return [...prev, idx];
      }
      return prev;
    });
  }, []);

  const checkAnswers = useCallback(() => {
    if (!current) return;

    let correctCount = 0;
    const totalHidden = hiddenIndices.size;

    currentSentenceWords.forEach((word: string, idx: number) => {
      if (!hiddenIndices.has(idx)) return;

      const isMatch = normalizeWord(userInputs[idx] || '') === normalizeWord(word);
      if (isMatch) {
        correctCount++;
      }
    });

    const isAllCorrect = correctCount === totalHidden;

    setIsChecked(true);
    setIsAllCorrect(isAllCorrect);

    if (isAllCorrect) {
      setSentenceCorrect(true);
      markCompleted(currentIdx);
    }
  }, [current, currentSentenceWords, hiddenIndices, userInputs, normalizeWord, markCompleted, currentIdx]);

  const retry = useCallback(() => {
    setIsChecked(false);
    setIsAllCorrect(false);
    setSentenceCorrect(false);
  }, []);

  const userWords = userInputs;

  // Phase 3: Speech Recognition + AI Scoring
  const [isRecording, setIsRecording] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');

  // Register speech recognition handler inside hook
  useSpeechRecognitionEvent('result', (event: any) => {
    if (event.results && event.results.length > 0) {
      const transcript = event.results[0].transcript;
      setSpokenTranscript(transcript);

      if (isShadowing && !sentenceCorrect) {
        const closeCount = currentSentenceWords.filter((cw: string) =>
          transcript.toLowerCase().includes(normalizeWord(cw)),
        ).length;
        if (closeCount >= currentSentenceWords.length * 0.7) {
          setSentenceCorrect(true);
          markCompleted(currentIdx);
          stopShadowingRecording();
        }
      }
    }
  });

  const startShadowingRecording = useCallback(async () => {
    pronunciationChecker.reset();
    await audioRecorder.startRecording();

    if (!ExpoSpeechRecognitionModule) return;
    try {
      const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!perm.granted) return;
      setSpokenTranscript('');
      setIsRecording(true);
      ExpoSpeechRecognitionModule.start({ lang: 'en-US', continuous: true, interimResults: true });
    } catch (e) {
      console.error(e);
      setIsRecording(false);
    }
  }, [audioRecorder, pronunciationChecker]);

  const stopShadowingRecording = useCallback(async () => {
    if (ExpoSpeechRecognitionModule) ExpoSpeechRecognitionModule.stop();
    setIsRecording(false);

    const uri = await audioRecorder.stopRecording();
    if (uri && userId && current?.english) {
      await pronunciationChecker.checkPronunciation(uri, userId, {
        targetWord: current.english,
      });
      audioRecorder.clearRecording();
    }
  }, [audioRecorder, pronunciationChecker, userId, current]);

  const stopRecording = useCallback(() => stopShadowingRecording(), [stopShadowingRecording]);

  // Phase 4: Dictionary State
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  const handleWordTap = useCallback(
    (word: string) => {
      const clean = normalizeWord(word);
      if (!clean) return;

      const context = current?.english || '';
      DeviceEventEmitter.emit('OPEN_DICTIONARY', {
        word: clean,
        sentence: context.trim(),
      });
    },
    [normalizeWord, current],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const currentRef = useRef(current);
  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  const playSentence = useCallback(
    (targetSentence?: any) => {
      const sentence = targetSentence ?? currentRef.current;
      if (!sentence) return;
      if (timerRef.current) clearInterval(timerRef.current);

      sentenceStartSecRef.current = sentence.audioStart;
      playStartTimeRef.current = Date.now();

      const startInterval = (audioEnd: number) => {
        timerRef.current = setInterval(() => {
          const elapsed = (Date.now() - playStartTimeRef.current) / 1000;
          const t = sentenceStartSecRef.current + elapsed;
          setCurrentTime(t);
          if (t >= audioEnd) {
            setPlaying(false);
            if (timerRef.current) clearInterval(timerRef.current);
            if (lesson?.youtubeVideoId && playerRef.current) {
              // No-op
            } else if (lesson?.audioUrl) {
              audioPlayer.pause();
            }
          }
        }, 100);
      };

      if (lesson?.youtubeVideoId && playerRef.current) {
        setPlaying(false);
        playerRef.current.seekTo(sentence.audioStart, true);
        setTimeout(() => {
          setPlaying(true);
          playStartTimeRef.current = Date.now();
          startInterval(sentence.audioEnd);
        }, 150);
      } else if (lesson?.audioUrl) {
        audioPlayer.seekTo(sentence.audioStart * 1000);
        audioPlayer.play();
        setPlaying(true);
        startInterval(sentence.audioEnd);
      }
    },
    [lesson, audioPlayer],
  );

  const togglePlay = useCallback(() => {
    if (playing) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (lesson?.youtubeVideoId && playerRef.current) {
        setPlaying(false);
      } else if (lesson?.audioUrl) {
        audioPlayer.pause();
        setPlaying(false);
      }
    } else {
      playSentence(current);
    }
  }, [playing, lesson, audioPlayer, current, playSentence]);

  const cycleSpeed = useCallback(() => {
    const speeds = [0.25, 0.5, 0.75, 1.0, 2.0];
    const nextSpeed = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
  }, [playbackSpeed]);

  const handleYoutubeStateChange = useCallback((state: string) => {
    if (state === 'ended' || state === 'paused') {
      setPlaying(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      const isDictationLesson = String(lessonId).startsWith('dictation-');
      const api = isDictationLesson ? dictationApi : shadowingApi;
      try {
        const data = await api.getLessonById(lessonId);
        setLesson(data);
      } catch {
        try {
          const data = await api.getVideoById(lessonId);
          setLesson(data);
        } catch {
          setLesson({ id: lessonId, title: 'Practice Session', youtubeVideoId: '', sentences: [] });
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [lessonId]);

  const handleFinish = useCallback(async () => {
    setSaving(true);
    try {
      const isDictationLesson = String(lessonId).startsWith('dictation-');
      if (isDictationLesson) {
        await dictationApi.upsertProgress({
          lessonId,
          completedSentences: [...new Set([...completed, currentIdx])],
          difficulty,
          lessonTitle: lesson?.title || 'Practice Session',
          totalSentences: sentences.length,
        });
      } else {
        await shadowingApi.upsertProgress({
          lessonId,
          type: mode === 'dictation' ? 'dictation' : 'shadowing',
          completedSentences: [...new Set([...completed, currentIdx])],
        });
      }
      setShowFinishDialog(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }, [lessonId, mode, completed, currentIdx, difficulty, lesson, sentences.length]);

  const handleNext = useCallback(() => {
    markCompleted(currentIdx);
    setDictationInput('');
    setSpokenTranscript('');
    setShowAnswer(false);
    setPlaying(false);
    if (isRecording) stopRecording();
    if (timerRef.current) clearInterval(timerRef.current);

    if (currentIdx < sentences.length - 1) {
      setCurrentIdx((i) => i + 1);
    } else {
      handleFinish();
    }
  }, [currentIdx, sentences.length, isRecording, stopRecording, handleFinish, markCompleted]);

  return {
    userInputs,
    setUserInputs,
    isChecked,
    setIsChecked,
    isAllCorrect,
    setIsAllCorrect,
    hintLevels,
    setHintLevels,
    hiddenIndices,
    requestHint,
    checkAnswers,
    retry,
    handleInputChange,
    isShadowing,
    lesson,
    loading,
    currentIdx,
    setCurrentIdx,
    completed,
    setCompleted,
    dictationInput,
    setDictationInput,
    showAnswer,
    setShowAnswer,
    saving,
    setSaving,
    sentences,
    current,
    progress,
    playing,
    setPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    currentTime,
    setCurrentTime,
    trackWidth,
    setTrackWidth,
    playerRef,
    audioPlayer,
    difficulty,
    setDifficulty,
    revealedWords,
    setRevealedWords,
    sentenceCorrect,
    setSentenceCorrect,
    currentSentenceWords,
    normalizeWord,
    handleSeek,
    handleSeekPress,
    formatTimeStr,
    userWords,
    markCompleted,
    isRecording,
    setIsRecording,
    spokenTranscript,
    setSpokenTranscript,
    startShadowingRecording,
    stopShadowingRecording,
    stopRecording,
    selectedWord,
    setSelectedWord,
    handleWordTap,
    playSentence,
    togglePlay,
    cycleSpeed,
    handleNext,
    handleFinish,
    audioRecorder,
    pronunciationChecker,
    handleYoutubeStateChange,
    showFinishDialog,
    setShowFinishDialog,
  };
}
