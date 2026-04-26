'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';


import { useParams, notFound } from 'next/navigation';
import { SHADOWING_LESSONS, ShadowingSentence, ShadowingLesson } from '@/data/shadowing-lessons';
import DictionaryPopup from '@/components/DictionaryPopup';
import Tooltip from '@/components/Tooltip';
import { shadowingApi, ShadowingVideo } from '@/services/shadowing.api';
import { useAuth } from '@/contexts/AuthContext';

// (Removed hardcoded SENTENCES and AUDIO_URL)
const SPEED_PRESETS = [0.25, 0.5, 0.75, 1.0, 2.0];

// Declare global YT types
declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: (() => void) | undefined;
    }
}

// Pre-generated waveform heights (stable across re-renders)
const WAVEFORM_HEIGHTS = Array.from({ length: 60 }, () => Math.max(15, Math.random() * 100));

// Normalize a word for comparison
const normalizeWord = (w: string) => w.toLowerCase().replace(/[.,!?'"]/g, '').trim();

// ── Helper: look up lesson from static data or DB ──
async function findLesson(id: string | string[] | undefined): Promise<ShadowingLesson | undefined> {
    if (!id || Array.isArray(id)) return undefined;
    const staticLesson = SHADOWING_LESSONS.find(l => l.id === id);
    if (staticLesson) return staticLesson;

    // Check user-created videos via API
    try {
        const found = await shadowingApi.getVideoById(id);
        if (found) {
            return {
                id: found.id,
                title: found.title,
                audioUrl: '',
                youtubeVideoId: found.youtubeVideoId,
                image: `https://img.youtube.com/vi/${found.youtubeVideoId}/maxresdefault.jpg`,
                tags: ['YOUTUBE'],
                duration: found.duration,
                sentences: found.sentences,
            } as ShadowingLesson;
        }
    } catch (error) {
        // Will throw 404 if it's not a valid user video ID, which is fine
    }
    return undefined;
}

// ──── Page Component ────
export default function ShadowingPracticePage() {
    const params = useParams();
    const { isAuthenticated, loading: authLoading } = useAuth();



    // States for asynchronous initialization
    const [lesson, setLesson] = useState<ShadowingLesson | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [completedSentences, setCompletedSentences] = useState<number[]>([]);

    // ── Load Lesson and Progress on mount ──
    const loadLessonAndProgress = useCallback(async () => {
        if (authLoading) return;
        setIsInitializing(true);
        try {
            // 1. Find lesson
            const loadedLesson = await findLesson(params.id);
            if (!loadedLesson) {
                notFound();
                return;
            }
            setLesson(loadedLesson);

            // 2. Fetch progress if authenticated
            if (isAuthenticated && typeof params.id === 'string') {
                const progressData = await shadowingApi.getProgress(params.id);
                if (progressData && progressData.shadowing) {
                    const parsed = progressData.shadowing.completedSentences;
                    setCompletedSentences(parsed);
                    if (parsed.length > 0) {
                        const maxCompleted = Math.max(...parsed);
                        if (maxCompleted < loadedLesson.sentences.length - 1) {
                            setCurrentIndex(maxCompleted + 1);
                        } else {
                            setCurrentIndex(loadedLesson.sentences.length - 1);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Failed to init shadowing page:', error);
        } finally {
            setIsInitializing(false);
        }
    }, [params.id, isAuthenticated, authLoading]);

    useEffect(() => {
        loadLessonAndProgress();
    }, [loadLessonAndProgress]);

    useEffect(() => {
        window.dispatchEvent(new CustomEvent('set-header-plain', { detail: true }));
    }, []);

    // Save progress to DB whenever it changes
    const isFirstLoad = useRef(true);
    useEffect(() => {
        if (isInitializing) return;
        if (isFirstLoad.current) {
            isFirstLoad.current = false;
            return;
        }
        if (!isAuthenticated || completedSentences.length === 0 || !lesson) return;
        const saveProgress = async () => {
            try {
                if (typeof params.id === 'string') {
                    await shadowingApi.upsertProgress({
                        lessonId: params.id,
                        type: 'shadowing',
                        completedSentences
                    });
                }
            } catch (error) {
                console.error('Failed to save progress:', error);
            }
        };
        saveProgress();
    }, [completedSentences, params.id, isAuthenticated, lesson]);


    const [isPlaying, setIsPlaying] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordedResult, setRecordedResult] = useState<string[] | null>(null);
    const [resultStatus, setResultStatus] = useState<'correct' | 'incorrect' | null>(null);
    const [showSpeedPanel, setShowSpeedPanel] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
    const [sentenceCorrect, setSentenceCorrect] = useState(false);
    const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
    const [isPlayingRecorded, setIsPlayingRecorded] = useState(false);
    // Dictionary Popup state
    const [selectedDictionaryWord, setSelectedDictionaryWord] = useState<string | null>(null);
    const [dictionaryPopupPosition, setDictionaryPopupPosition] = useState<{ x: number, y: number } | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const recordedAudioRef = useRef<HTMLAudioElement>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recognitionRef = useRef<any>(null);
    const ytPlayerRef = useRef<any>(null);
    const ytContainerRef = useRef<HTMLDivElement>(null);
    const [ytReady, setYtReady] = useState(false);

    // ── YouTube IFrame API Setup ──
    useEffect(() => {
        if (!lesson || !lesson.youtubeVideoId) return;

        const YOUTUBE_VIDEO_ID = lesson.youtubeVideoId;
        let isMounted = true;

        const initPlayer = () => {
            if (!isMounted || !ytContainerRef.current) return;
            ytPlayerRef.current = new window.YT.Player(ytContainerRef.current, {
                videoId: YOUTUBE_VIDEO_ID,
                playerVars: {
                    autoplay: 0,
                    controls: 1,
                    modestbranding: 1,
                    rel: 0,
                },
                events: {
                    onReady: () => {
                        if (isMounted) setYtReady(true);
                    },
                },
            });
        };

        const loadYT = () => {
            if (window.YT && window.YT.Player) {
                initPlayer();
                return;
            }

            const checkYT = setInterval(() => {
                if (window.YT && window.YT.Player) {
                    clearInterval(checkYT);
                    initPlayer();
                }
            }, 100);

            if (!document.getElementById('youtube-iframe-script')) {
                const tag = document.createElement('script');
                tag.id = 'youtube-iframe-script';
                tag.src = 'https://www.youtube.com/iframe_api';
                document.head.appendChild(tag);
            }
        };

        loadYT();

        return () => {
            isMounted = false;
            if (ytPlayerRef.current && ytPlayerRef.current.destroy) {
                try { ytPlayerRef.current.destroy(); } catch (e) { }
            }
        };
    }, [lesson]);

    const skipNextRecordingRef = useRef(false);

    const AUDIO_URL = lesson?.audioUrl || '';
    const IS_YOUTUBE = !!lesson?.youtubeVideoId;
    const SENTENCES = (lesson?.sentences as ShadowingSentence[]) || [];
    const LESSON_TITLE = lesson?.title || '';
    const TOTAL_SENTENCES = SENTENCES.length;

    const currentSentenceRaw = SENTENCES[currentIndex] || { id: '', english: '', vietnamese: '', words: [], audioStart: 0, audioEnd: 0 };
    const currentSentence = useMemo(() => ({
        ...currentSentenceRaw,
        words: (currentSentenceRaw.words && currentSentenceRaw.words.length > 0)
            ? currentSentenceRaw.words
            : ((currentSentenceRaw as any).text || currentSentenceRaw.english || '').split(' ').filter((w: string) => w.trim() !== '')
    }), [currentSentenceRaw]);
    const progressCount = completedSentences.length;
    const isFinished = TOTAL_SENTENCES > 0 && completedSentences.length === TOTAL_SENTENCES;

    // ── Word-level match status for result display ──
    const wordStatuses = useMemo(() => {
        if (!recordedResult) return [];
        return currentSentence.words.map((correctWord: string, i: number) => {
            if (i >= recordedResult.length) return 'missing' as const;
            const spoken = normalizeWord(recordedResult[i]);
            const correct = normalizeWord(correctWord);
            if (spoken === correct) return 'correct' as const;
            return 'incorrect' as const;
        });
    }, [currentSentence.words, recordedResult]);

    // ── Play current sentence audio segment ──
    const playSentence = useCallback((target?: any) => {
        if (!lesson) return;
        const sentenceToPlay = (target && target.audioStart !== undefined) ? target : currentSentence;

        if (timerRef.current) clearInterval(timerRef.current);

        if (IS_YOUTUBE && ytPlayerRef.current && ytReady) {
            const player = ytPlayerRef.current;
            player.setPlaybackRate(playbackSpeed);
            player.seekTo(sentenceToPlay.audioStart, true);
            player.playVideo();
            setIsPlaying(true);

            timerRef.current = setInterval(() => {
                const currentTime = player.getCurrentTime();
                if (currentTime >= sentenceToPlay.audioEnd) {
                    player.pauseVideo();
                    setIsPlaying(false);
                    if (timerRef.current) clearInterval(timerRef.current);
                }
            }, 50);
        } else {
            const audio = audioRef.current;
            if (!audio) return;

            audio.playbackRate = playbackSpeed;
            audio.currentTime = sentenceToPlay.audioStart;
            audio.play();
            setIsPlaying(true);

            timerRef.current = setInterval(() => {
                if (audio.currentTime >= sentenceToPlay.audioEnd) {
                    audio.pause();
                    setIsPlaying(false);
                    if (timerRef.current) clearInterval(timerRef.current);
                }
            }, 50);
        }
    }, [lesson, currentSentence, playbackSpeed, IS_YOUTUBE, ytReady]);

    // ── Auto-play audio when moving to next sentence ──
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        const timeout = setTimeout(() => {
            if (!lesson) return;
            if (currentIndex >= TOTAL_SENTENCES) return;
            if (timerRef.current) clearInterval(timerRef.current);
            const sentence = SENTENCES[currentIndex];

            if (IS_YOUTUBE && ytPlayerRef.current && ytReady) {
                const player = ytPlayerRef.current;
                player.setPlaybackRate(playbackSpeed);
                player.seekTo(sentence.audioStart, true);
                player.playVideo();
                setIsPlaying(true);
                timerRef.current = setInterval(() => {
                    const currentTime = player.getCurrentTime();
                    if (currentTime >= sentence.audioEnd) {
                        player.pauseVideo();
                        setIsPlaying(false);
                        if (timerRef.current) clearInterval(timerRef.current);
                    }
                }, 50);
            } else {
                const audio = audioRef.current;
                if (!audio) return;
                audio.playbackRate = playbackSpeed;
                audio.currentTime = sentence.audioStart;
                audio.play();
                setIsPlaying(true);
                timerRef.current = setInterval(() => {
                    if (audio.currentTime >= sentence.audioEnd) {
                        audio.pause();
                        setIsPlaying(false);
                        if (timerRef.current) clearInterval(timerRef.current);
                    }
                }, 50);
            }
        }, 300);
        return () => clearTimeout(timeout);
    }, [currentIndex, playbackSpeed, IS_YOUTUBE, ytReady]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch (e) { }
            }
        };
    }, []);

    // ── Start Recording with Speech Recognition ──
    const startRecording = useCallback(() => {
        // Use Web Speech API for speech recognition
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Speech recognition is not supported in your browser. Please use Chrome.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        recognition.continuous = true;

        recognition.onresult = (event: any) => {
            // Combine all results into a full transcript
            let fullTranscript = '';
            for (let i = 0; i < event.results.length; i++) {
                fullTranscript += event.results[i][0].transcript + ' ';
            }
            const spokenWords = fullTranscript.trim().split(/\s+/).filter((w: string) => w.length > 0);
            setRecordedResult(spokenWords);

            // Only check correctness on final results
            const allFinal = Array.from(event.results).every((r: any) => r.isFinal);
            if (allFinal && spokenWords.length > 0) {
                const allCorrect = currentSentence.words.length === spokenWords.length &&
                    currentSentence.words.every((w: string, i: number) => // Added types here
                        normalizeWord(spokenWords[i] || '') === normalizeWord(w)
                    );

                if (allCorrect) {
                    setResultStatus('correct');
                    setSentenceCorrect(true);
                    setCompletedSentences(prev => {
                        if (prev.includes(currentIndex)) return prev;
                        return [...prev, currentIndex];
                    });
                } else {
                    setResultStatus('incorrect');
                }
            }
        };

        recognition.onerror = (event: any) => {
            // Ignore 'no-speech' errors silently — user just hasn't spoken yet
            if (event.error === 'no-speech') return;
            setIsRecording(false);
            setResultStatus('incorrect');
        };

        recognition.onend = () => {
            setIsRecording(false);
        };

        recognitionRef.current = recognition;
        setSentenceCorrect(false);
        setIsRecording(true);
        recognition.start();

        // Also start MediaRecorder to capture audio
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            const mediaRecorder = new MediaRecorder(stream);
            audioChunksRef.current = [];
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };
            mediaRecorder.onstop = () => {
                // Stop all tracks to release mic
                stream.getTracks().forEach(t => t.stop());
                // Skip if we're navigating to next sentence
                if (skipNextRecordingRef.current) {
                    skipNextRecordingRef.current = false;
                    return;
                }
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setRecordedAudioUrl(url);
            };
            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start();
        }).catch(() => {
            // Mic permission denied — speech recognition still works
        });
    }, [currentSentence, currentIndex]);

    // ── Stop Recording ──
    const stopRecording = useCallback(() => {
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch (e) { }
        }
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            try { mediaRecorderRef.current.stop(); } catch (e) { }
        }
        setIsRecording(false);
    }, []);

    // ── Handlers ──
    const handleRepeat = () => playSentence();

    const handleSpeedChange = (speed: number) => {
        setPlaybackSpeed(speed);
        if (audioRef.current) audioRef.current.playbackRate = speed;
    };

    const handleNext = useCallback(() => {
        // Mark to skip the onstop callback so old recording doesn't persist
        skipNextRecordingRef.current = true;
        // Stop any active recording first
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch (e) { }
        }
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            try { mediaRecorderRef.current.stop(); } catch (e) { }
        }
        // Stop and clean up recorded audio playback
        if (recordedAudioRef.current) {
            recordedAudioRef.current.pause();
            recordedAudioRef.current.src = '';
        }
        if (recordedAudioUrl) {
            URL.revokeObjectURL(recordedAudioUrl);
        }
        setIsRecording(false);
        setIsPlayingRecorded(false);
        setRecordedResult(null);
        setResultStatus(null);
        setSentenceCorrect(false);
        setRecordedAudioUrl(null);
        setSelectedDictionaryWord(null);
        setDictionaryPopupPosition(null);
        if (currentIndex < TOTAL_SENTENCES - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    }, [currentIndex, recordedAudioUrl, TOTAL_SENTENCES]);

    const handlePlayRecordedAudio = () => {
        const audio = recordedAudioRef.current;
        if (!audio || !recordedAudioUrl) return;
        audio.src = recordedAudioUrl;
        audio.play();
        setIsPlayingRecorded(true);
        audio.onended = () => setIsPlayingRecorded(false);
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && !e.altKey && !e.ctrlKey && !e.shiftKey && !e.metaKey) {
                if (currentIndex < TOTAL_SENTENCES - 1) {
                    e.preventDefault();
                    handleNext();
                }
                return;
            }

            if (e.altKey) {
                switch (e.key.toLowerCase()) {
                    case 'r':
                        e.preventDefault();
                        handleRepeat();
                        break;
                    case 's':
                        e.preventDefault();
                        setShowSpeedPanel(prev => !prev);
                        break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, TOTAL_SENTENCES, handleNext]);

    if (isInitializing || !lesson) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Hidden audio elements */}
            {!IS_YOUTUBE && <audio ref={audioRef} src={AUDIO_URL} preload="auto" />}
            <audio ref={recordedAudioRef} />

            <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-4 xl:px-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 py-4">

                    {/* ══ COLUMN 1: Source ══ */}
                    {/* Source / Audio or YouTube Player */}
                    <div className="lg:col-span-2 lg:sticky lg:top-6 self-start z-10">
                        {IS_YOUTUBE ? (
                            <div key={`yt-wrapper-${lesson?.id}`} className="w-full aspect-video rounded-xl overflow-hidden bg-black shadow-sm">
                                <div ref={ytContainerRef} className="w-full h-full" />
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex items-center gap-3">
                                <button
                                    onClick={() => playSentence()}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${isPlaying
                                        ? 'bg-primary text-white'
                                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                                        }`}
                                >
                                    {isPlaying ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                                <div className="flex-1 flex items-center gap-[2px] h-10 overflow-hidden">
                                    {WAVEFORM_HEIGHTS.map((height, i: number) => (
                                        <div
                                            key={i}
                                            className={`flex-1 rounded-full transition-colors ${isPlaying ? 'bg-primary animate-waveform' : 'bg-gray-300'
                                                }`}
                                            style={{
                                                height: `${height}%`,
                                                minWidth: '2px',
                                                animationDelay: isPlaying ? `${i * 0.05}s` : '0s'
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ══ COLUMN 2: Transcript Feed & Shadowing Controls ══ */}
                    <div className="lg:col-span-1 relative">
                        {/* Mobile Background Fallback */}
                        <div className="block lg:hidden w-full h-[600px]"></div>
                        
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[600px] lg:h-auto lg:absolute lg:inset-0 z-20 overflow-hidden">
                            {/* Fixed Header */}
                            <div className="p-6 border-b border-gray-100 shrink-0">
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="text-lg font-bold text-gray-800">Shadowing</h2>
                                    <span className="text-lg font-bold text-gray-800">
                                        {progressCount}/{TOTAL_SENTENCES}
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full transition-all duration-500"
                                        style={{ width: `${(progressCount / TOTAL_SENTENCES) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Scrollable Transcript Area */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth" ref={(el) => {
                                if (el && currentIndex > 0) {
                                    // Auto-scroll logic similar to dictation
                                    const activeEl = el.querySelector(`#sentence-${currentIndex}`);
                                    if (activeEl) {
                                        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    }
                                }
                            }}>
                                {isFinished ? (
                                    <div className="text-center py-8">
                                        <div className="text-6xl mb-4">🎉</div>
                                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Congratulations!</h3>
                                        <p className="text-gray-500">You have completed all {TOTAL_SENTENCES} sentences.</p>
                                    </div>
                                ) : (
                                    SENTENCES.map((sentence, index) => {
                                        const isCompleted = completedSentences.includes(index);
                                        const isActive = index === currentIndex;

                                        if (!isCompleted && !isActive) return null;

                                        if (isCompleted) {
                                            return (
                                                <div 
                                                    key={sentence.id} 
                                                    className="flex gap-4 text-gray-800 opacity-90 hover:opacity-100 transition-opacity cursor-pointer group"
                                                    onClick={() => playSentence(sentence)}
                                                    title="Click to replay this sentence"
                                                >
                                                    <div className="shrink-0 pt-0.5">
                                                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[11px] font-semibold tracking-wide">
                                                            {formatTime(sentence.audioStart)}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-bold text-[15px] leading-relaxed mb-1">
                                                            {sentence.english}
                                                        </p>
                                                        <p className="text-gray-500 text-sm leading-relaxed">
                                                            {sentence.vietnamese}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        // isActive (Current Sentence)
                                        return (
                                            <div key={sentence.id} className="relative scroll-mt-6" id={`sentence-${index}`}>
                                                <div className="absolute -inset-x-4 -inset-y-4 bg-gray-100/80 rounded-xl" />
                                                <div className="relative flex gap-4 text-gray-900">
                                                    <div className="shrink-0 pt-0.5">
                                                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-primary text-gray-900 text-[11px] font-bold tracking-wide shadow-sm">
                                                            {formatTime(sentence.audioStart)}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-[17px] font-bold leading-relaxed mb-2 flex flex-wrap gap-x-1.5 gap-y-1">
                                                            {currentSentence.words.map((word: string, idx: number) => (
                                                                <span
                                                                    key={idx}
                                                                    onClick={(e) => {
                                                                        const cleanWord = word.replace(/[.,!?'"]/g, '').toLowerCase();
                                                                        if (cleanWord) {
                                                                            const rect = e.currentTarget.getBoundingClientRect();
                                                                            setDictionaryPopupPosition({ x: rect.left, y: rect.bottom + window.scrollY });
                                                                            setSelectedDictionaryWord(cleanWord);
                                                                        }
                                                                    }}
                                                                    className="cursor-pointer hover:text-primary hover:underline underline-offset-4 decoration-2 transition-colors relative"
                                                                >
                                                                    {word}
                                                                </span>
                                                            ))}
                                                            {selectedDictionaryWord && dictionaryPopupPosition && (
                                                                <DictionaryPopup
                                                                    word={selectedDictionaryWord}
                                                                    sentence={currentSentence.english}
                                                                    position={dictionaryPopupPosition}
                                                                    onClose={() => {
                                                                        setSelectedDictionaryWord(null);
                                                                        setDictionaryPopupPosition(null);
                                                                    }}
                                                                />
                                                            )}
                                                        </p>
                                                        <p className="text-gray-500 text-sm leading-relaxed font-mono">
                                                            {currentSentence.phonetic}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Fixed Bottom Action Dock */}
                            {!isFinished && (
                                <div className="p-6 bg-white border-t border-gray-100 shrink-0">
                                    {/* Success/Result Section */}
                                    {recordedResult && !sentenceCorrect && (
                                        <div className="mb-4">
                                            <div className="flex flex-wrap gap-1 mb-2">
                                                {recordedResult.map((word: string, i: number) => {
                                                    const status = wordStatuses[i];
                                                    return (
                                                        <span
                                                            key={i}
                                                            className={`px-2 py-1 rounded text-xs font-semibold ${status === 'correct'
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-red-100 text-red-700'
                                                                }`}
                                                        >
                                                            {word}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                            {resultStatus === 'incorrect' && (
                                                <p className="text-red-500 font-semibold text-xs text-center">Please try again!</p>
                                            )}
                                        </div>
                                    )}

                                    {sentenceCorrect && (
                                        <div className="mb-4 bg-green-50 border-2 border-green-400 rounded-xl p-3 flex flex-col items-center justify-center gap-2">
                                            <span className="text-green-700 font-semibold text-sm">Correct! Great pronunciation 🎉</span>
                                            {currentIndex < TOTAL_SENTENCES - 1 && (
                                                <button
                                                    onClick={handleNext}
                                                    className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center gap-1.5"
                                                >
                                                    Next Sentence
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {/* Record Button */}
                                    <button
                                        onClick={isRecording ? stopRecording : startRecording}
                                        disabled={sentenceCorrect}
                                        className={`w-full py-3.5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all mb-4 ${sentenceCorrect
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            : isRecording
                                                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-lg'
                                                : 'bg-primary hover:bg-yellow-500 text-gray-900 shadow-md'
                                            }`}
                                    >
                                        {isRecording ? (
                                            <>
                                                <div className="w-4 h-4 rounded-full bg-white" />
                                                Stop Recording
                                            </>
                                        ) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                                                </svg>
                                                Start Recording
                                            </>
                                        )}
                                    </button>

                                    {/* Floating Actions */}
                                    <div className="flex items-center justify-center gap-4 relative">
                                        <Tooltip content="Repeat Video" shortcut="Alt+R" position="top">
                                            <button
                                                onClick={handleRepeat}
                                                className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors shadow-sm"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </Tooltip>

                                        <Tooltip content="Playback Speed" shortcut="Alt+S" position="top">
                                            <button
                                                onClick={() => setShowSpeedPanel(!showSpeedPanel)}
                                                className="w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition-colors shadow-sm"
                                            >
                                                <span className="text-xs font-bold">{playbackSpeed}x</span>
                                            </button>
                                        </Tooltip>

                                        <Tooltip content="Play Your Recording" position="top">
                                            <button
                                                onClick={handlePlayRecordedAudio}
                                                disabled={!recordedAudioUrl}
                                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-sm ${recordedAudioUrl
                                                    ? isPlayingRecorded
                                                        ? 'bg-red-600 text-white animate-pulse'
                                                        : 'bg-red-500 hover:bg-red-600 text-white'
                                                    : 'bg-gray-300 text-gray-400 cursor-not-allowed'
                                                    }`}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </Tooltip>

                                        {/* Speed Panel Popup */}
                                        {showSpeedPanel && (
                                            <div className="absolute bottom-12 right-0 bg-gray-800 text-white rounded-2xl p-5 shadow-2xl z-20 w-72 origin-bottom-right">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <button
                                                        onClick={() => setShowSpeedPanel(false)}
                                                        className="text-white/70 hover:text-white"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                    <span className="font-semibold text-sm">Playback speed</span>
                                                </div>

                                                <div className="text-center mb-4">
                                                    <span className="text-3xl font-bold">{playbackSpeed.toFixed(2)}x</span>
                                                </div>

                                                <div className="flex items-center gap-3 mb-4">
                                                    <button
                                                        onClick={() => handleSpeedChange(Math.max(0.25, playbackSpeed - 0.25))}
                                                        className="text-white/70 hover:text-white font-bold text-lg"
                                                    >
                                                        −
                                                    </button>
                                                    <input
                                                        type="range"
                                                        min="0.25"
                                                        max="2"
                                                        step="0.25"
                                                        value={playbackSpeed}
                                                        onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                                                        className="flex-1 accent-white h-1 bg-gray-600 rounded-full appearance-none cursor-pointer"
                                                    />
                                                    <button
                                                        onClick={() => handleSpeedChange(Math.min(2, playbackSpeed + 0.25))}
                                                        className="text-white/70 hover:text-white font-bold text-lg"
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                <div className="flex gap-2">
                                                    {SPEED_PRESETS.map((speed) => (
                                                        <button
                                                            key={speed}
                                                            onClick={() => {
                                                                handleSpeedChange(speed);
                                                                setShowSpeedPanel(false);
                                                            }}
                                                            className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition-colors ${playbackSpeed === speed
                                                                ? 'bg-white text-gray-800'
                                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                                }`}
                                                        >
                                                            {speed}
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="text-xs text-gray-400 mt-2">Normal</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
