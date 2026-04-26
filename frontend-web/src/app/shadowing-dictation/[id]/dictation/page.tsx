'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import PageHeader from '@/components/PageHeader';
import Tooltip from '@/components/Tooltip';

import { useParams, notFound } from 'next/navigation';
import { SHADOWING_LESSONS, ShadowingSentence as DictationSentence, ShadowingLesson } from '@/data/shadowing-lessons';
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

// Pre-generated waveform heights
const WAVEFORM_HEIGHTS = Array.from({ length: 60 }, () => Math.max(15, Math.random() * 100));

// Normalize a word for comparison (strip punctuation, lowercase)
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
        // Will throw 404 if it's not a valid user video ID
    }
    return undefined;
}

const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
};

// ──── Page Component ────
export default function DictationPracticePage() {
    const params = useParams();
    const { isAuthenticated, loading: authLoading } = useAuth();


    // States for asynchronous initialization
    const [lesson, setLesson] = useState<ShadowingLesson | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [completedSentences, setCompletedSentences] = useState<number[]>([]);

    const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'>('Intermediate');

    // ── Load Lesson, Progress and Difficulty on mount ──
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
                if (progressData && progressData.dictation) {
                    const parsed = progressData.dictation.completedSentences;
                    setCompletedSentences(parsed);
                    if (parsed.length > 0) {
                        const maxCompleted = Math.max(...parsed);
                        if (maxCompleted < loadedLesson.sentences.length - 1) {
                            setCurrentIndex(maxCompleted + 1);
                        } else {
                            setCurrentIndex(loadedLesson.sentences.length - 1);
                        }
                    }
                    if (progressData.dictation.difficulty) {
                        setDifficulty(progressData.dictation.difficulty as any);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to init dictation page:', error);
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

    // Save progress and difficulty to DB whenever they change (and after initial load)
    const isFirstLoad = useRef(true);
    useEffect(() => {
        if (isInitializing) return;
        if (isFirstLoad.current) {
            isFirstLoad.current = false;
            return;
        }
        if (!isAuthenticated || !lesson) return;
        const saveProgress = async () => {
            try {
                if (typeof params.id === 'string') {
                    await shadowingApi.upsertProgress({
                        lessonId: params.id,
                        type: 'dictation',
                        completedSentences: completedSentences,
                        dictationDifficulty: difficulty,
                        lessonTitle: lesson.title,
                        totalSentences: lesson.sentences.length
                    });
                }
            } catch (error) {
                console.error('Failed to save progress:', error);
            }
        };
        saveProgress();
    }, [completedSentences, difficulty, params.id, isAuthenticated, lesson]);

    const [userInput, setUserInput] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [sentenceCorrect, setSentenceCorrect] = useState(false);
    const [revealedWords, setRevealedWords] = useState<Set<number>>(new Set());
    const [showAllWords, setShowAllWords] = useState(false);
    const [showSpeedPanel, setShowSpeedPanel] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
    const [showDifficultyPanel, setShowDifficultyPanel] = useState(false);

    const audioRef = useRef<HTMLAudioElement>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const ytPlayerRef = useRef<any>(null);
    const ytContainerRef = useRef<HTMLDivElement>(null);
    const scrollAnchorRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const [ytReady, setYtReady] = useState(false);

    const AUDIO_URL = lesson?.audioUrl || '';
    const IS_YOUTUBE = !!lesson?.youtubeVideoId;
    const SENTENCES = (lesson?.sentences as DictationSentence[]) || [];
    const LESSON_TITLE = lesson?.title || '';
    const TOTAL_SENTENCES = SENTENCES.length;

    // Check if all sentences completed
    const isFinished = TOTAL_SENTENCES > 0 && completedSentences.length === TOTAL_SENTENCES;

    // ── Auto-scroll to active sentence ──
    useEffect(() => {
        if (scrollAnchorRef.current) {
            scrollAnchorRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
        if (!isFinished && inputRef.current && !sentenceCorrect) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 300);
        }
    }, [currentIndex, isFinished, sentenceCorrect]);

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



    const currentSentenceRaw = SENTENCES[currentIndex] || { id: '', english: '', vietnamese: '', words: [], audioStart: 0, audioEnd: 0 };
    const currentSentence = useMemo(() => ({
        ...currentSentenceRaw,
        words: (currentSentenceRaw.words && currentSentenceRaw.words.length > 0)
            ? currentSentenceRaw.words
            : ((currentSentenceRaw as any).text || currentSentenceRaw.english || '').split(' ').filter((w: string) => w.trim() !== '')
    }), [currentSentenceRaw]);
    const progressCount = completedSentences.length;

    // ── Apply Difficulty Logic on Current Sentence Change ──
    useEffect(() => {
        if (!lesson || !currentSentence || !currentSentence.words) return;

        const words = currentSentence.words;
        const totalWords = words.length;
        const newRevealed = new Set<number>();

        // Always reveal punctuation if they are treated as separate words
        words.forEach((w: string, i: number) => {
            if (/^[.,!?'"]+$/.test(w)) {
                newRevealed.add(i);
            }
        });

        // Determine how many extra words to reveal based on difficulty
        let targetRevealPercent = 0;
        switch (difficulty) {
            case 'Beginner': targetRevealPercent = 0.7; break;
            case 'Intermediate': targetRevealPercent = 0.5; break;
            case 'Advanced': targetRevealPercent = 0.3; break;
            case 'Expert': targetRevealPercent = 0; break;
        }

        if (targetRevealPercent > 0) {
            const targetCount = Math.floor(totalWords * targetRevealPercent);

            // Try to favor revealing shorter words or common words first in a real scenario,
            // but for simplicity, we'll pick pseudo-randomly based on the sentence string 
            // so it's consistent for the same sentence.
            const indices = Array.from({ length: totalWords }, (_, i) => i)
                .filter(i => !newRevealed.has(i));

            // Shuffle deterministically based on word length so shorter words are revealed first
            indices.sort((a, b) => words[a].length - words[b].length);

            for (let i = 0; i < targetCount && i < indices.length; i++) {
                newRevealed.add(indices[i]);
            }
        }

        setRevealedWords(newRevealed);
        setUserInput('');
        setSentenceCorrect(false);
        setShowAllWords(false);
    }, [currentIndex, lesson, difficulty]);

    // ── Split user input into words for real-time comparison ──
    const userWords = useMemo(() => {
        return userInput.split(/\s+/).filter(w => w.length > 0);
    }, [userInput]);

    // ── Word-level match status ──
    const wordStatuses = useMemo(() => {
        return currentSentence.words.map((correctWord: string, i: number) => {
            if (revealedWords.has(i) || showAllWords) return 'revealed' as const;
            if (i >= userWords.length) return 'pending' as const;
            const typed = normalizeWord(userWords[i]);
            const correct = normalizeWord(correctWord);
            if (typed === correct) return 'correct' as const;
            return 'incorrect' as const;
        });
    }, [currentSentence.words, userWords, revealedWords, showAllWords]);

    // ── Check if all words are correct → show success ──
    useEffect(() => {
        if (sentenceCorrect) return; // already marked correct
        if (userWords.length === currentSentence.words.length) {
            const allCorrect = currentSentence.words.length > 0 && currentSentence.words.every((w: string, i: number) =>
                normalizeWord(userWords[i] || '') === normalizeWord(w)
            );
            if (allCorrect) {
                setSentenceCorrect(true);
                setCompletedSentences(prev => {
                    if (prev.includes(currentIndex)) return prev;
                    return [...prev, currentIndex];
                });
            }
        }
    }, [userWords, currentSentence.words, currentIndex, sentenceCorrect]);

    // ── Handle Next button click ──
    const handleNext = useCallback(() => {
        setUserInput('');
        setRevealedWords(new Set());
        setShowAllWords(false);
        setSentenceCorrect(false);
        if (currentIndex < TOTAL_SENTENCES - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    }, [currentIndex, TOTAL_SENTENCES]);

    // ── Auto-play audio when moving to next sentence ──
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        // Play the new sentence after index changes
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

    // ── Play current sentence audio segment ──
    const playSentence = useCallback((target?: any) => {
        const sentenceToPlay = (target && target.audioStart !== undefined) ? target : currentSentence;

        // Clear any existing timer
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

            // Poll to stop at sentence end
            timerRef.current = setInterval(() => {
                if (audio.currentTime >= sentenceToPlay.audioEnd) {
                    audio.pause();
                    setIsPlaying(false);
                    if (timerRef.current) clearInterval(timerRef.current);
                }
            }, 50);
        }
    }, [currentSentence, playbackSpeed, IS_YOUTUBE, ytReady]);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // ── Handlers ──
    const handleRepeat = () => {
        playSentence();
    };

    const handleSpeedChange = (speed: number) => {
        setPlaybackSpeed(speed);
        if (audioRef.current) {
            audioRef.current.playbackRate = speed;
        }
    };

    const handleShowAll = () => {
        setShowAllWords(true);
    };

    const handleRevealWord = (index: number) => {
        if (!showAllWords && wordStatuses[index] !== 'correct') {
            setRevealedWords(prev => new Set(prev).add(index));
        }
    };

    const handleAudioEnded = () => {
        setIsPlaying(false);
    };


    // Generate asterisks matching word length
    const getAsterisks = (word: string) => {
        return '*'.repeat(word.length);
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && !e.altKey && !e.ctrlKey && !e.shiftKey && !e.metaKey) {
                if (sentenceCorrect && currentIndex < TOTAL_SENTENCES - 1) {
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
                    case 'a':
                        e.preventDefault();
                        handleShowAll();
                        break;
                    case 'm':
                        e.preventDefault();
                        setShowDifficultyPanel(prev => !prev);
                        break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, TOTAL_SENTENCES, handleNext, sentenceCorrect]);

    if (isInitializing || !lesson) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Hidden audio element */}
            {!IS_YOUTUBE && <audio ref={audioRef} src={AUDIO_URL} onEnded={handleAudioEnded} preload="auto" />}



            {/* Main Content - Two Column Layout */}
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
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
                                <h2 className="text-lg font-bold text-gray-800 mb-4">Source Audio</h2>
                                <div className="flex items-center gap-3">
                                    {/* Play Button */}
                                    <button
                                        onClick={playSentence}
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

                                    {/* Waveform Visualization */}
                                    <div className="flex-1 flex items-center gap-[2px] h-10 overflow-hidden">
                                        {WAVEFORM_HEIGHTS.map((height, i) => (
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
                            </div>
                        )}
                    </div>

                    {/* ══ COLUMN 2: Dictation + Transcript ══ */}
                    <div className="lg:col-span-1 relative">
                        <div className="block lg:hidden w-full h-[600px]"></div>
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[600px] lg:h-auto lg:absolute lg:inset-0 z-20 overflow-hidden">
                            {/* Fixed Header */}
                            <div className="p-6 border-b border-gray-100 shrink-0">
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="text-lg font-bold text-gray-800">Dictation</h2>
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
                            <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth">
                                {SENTENCES.map((sentence, index) => {
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
                                                    <p className="font-medium text-[15px] leading-relaxed">
                                                        {sentence.english}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    }

                                    if (isActive && !isFinished) {
                                        return (
                                            <div key={sentence.id} className="bg-gray-100/80 rounded-xl p-4 flex gap-4 border border-gray-200/60 shadow-sm relative">
                                                <div className="shrink-0 pt-0.5">
                                                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-700 text-[11px] font-semibold tracking-wide">
                                                        {formatTime(sentence.audioStart)}
                                                    </span>
                                                </div>
                                                <div className="flex-1">
                                                    {/* Word Hints */}
                                                    <div className="flex flex-wrap gap-x-3 gap-y-2 mt-0.5">
                                                        {currentSentence.words.map((word: string, i: number) => {
                                                            const status = wordStatuses[i];
                                                            let display: string;
                                                            let colorClass: string;
                                                            let cursorClass = 'cursor-pointer';

                                                            if (status === 'revealed') {
                                                                display = word;
                                                                colorClass = 'text-gray-800 font-medium';
                                                                cursorClass = 'cursor-default';
                                                            } else if (status === 'correct') {
                                                                display = word;
                                                                colorClass = 'text-green-600 font-medium';
                                                                cursorClass = 'cursor-default';
                                                            } else if (status === 'incorrect') {
                                                                display = getAsterisks(word);
                                                                colorClass = 'text-red-400 font-medium';
                                                            } else {
                                                                // pending
                                                                display = getAsterisks(word);
                                                                colorClass = 'text-gray-400';
                                                            }

                                                            return (
                                                                <span
                                                                    key={i}
                                                                    onClick={() => handleRevealWord(i)}
                                                                    className={`text-sm font-mono px-0.5 select-none transition-colors ${colorClass} ${cursorClass} hover:opacity-80`}
                                                                    title={status === 'pending' || status === 'incorrect' ? 'Click to reveal' : ''}
                                                                >
                                                                    {display}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                })}

                                {/* Hidden anchor to scroll to */}
                                <div ref={scrollAnchorRef} className="h-4 w-full shrink-0" />
                            </div>

                            {/* Fixed Input Area */}
                            {!isFinished ? (
                                <div className="p-4 sm:p-6 border-t border-gray-100 shrink-0 bg-white rounded-b-2xl">
                                    {/* Success Banner */}
                                    {sentenceCorrect && (
                                        <div className="mb-4 bg-green-50 border-2 border-green-400 rounded-xl p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <span className="text-green-700 font-semibold">Correct! Well done</span>
                                            </div>
                                            {currentIndex < TOTAL_SENTENCES - 1 && (
                                                <Tooltip content="Next Sentence" shortcut="Enter" position="top">
                                                    <button
                                                        onClick={handleNext}
                                                        className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center gap-1.5"
                                                    >
                                                        Next Sentence
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </Tooltip>
                                            )}
                                        </div>
                                    )}

                                    {/* Text Input */}
                                    <div className="mb-4">
                                        <textarea
                                            ref={inputRef}
                                            id="dictation-input"
                                            rows={3}
                                            placeholder="Type what you hear"
                                            value={userInput}
                                            onChange={(e) => setUserInput(e.target.value)}
                                            disabled={sentenceCorrect}
                                            className={`w-full border-2 rounded-xl px-4 py-3 text-gray-700 resize-none focus:outline-none transition-colors ${sentenceCorrect
                                                ? 'border-green-400 bg-green-50 cursor-not-allowed'
                                                : 'border-gray-200 focus:border-primary bg-white'
                                                }`}
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-end gap-3 relative">
                                        {/* 1. Repeat Sentence */}
                                        <Tooltip content="Repeat Sentence" shortcut="Alt+R" position="top">
                                            <button
                                                onClick={handleRepeat}
                                                className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors shadow-md"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </Tooltip>

                                        {/* 2. Speed Control */}
                                        <Tooltip content="Playback Speed" shortcut="Alt+S" position="top">
                                            <button
                                                onClick={() => setShowSpeedPanel(!showSpeedPanel)}
                                                className="w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition-colors shadow-md"
                                            >
                                                <span className="text-xs font-bold">{playbackSpeed}x</span>
                                            </button>
                                        </Tooltip>

                                        {/* 3. Show All Words */}
                                        <Tooltip content="Show All Words" shortcut="Alt+A" position="top">
                                            <button
                                                onClick={handleShowAll}
                                                className="w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-md"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </Tooltip>

                                        {/* 4. Difficulty Selector */}
                                        <Tooltip content="Difficulty Level" shortcut="Alt+M" position="top">
                                            <button
                                                onClick={() => setShowDifficultyPanel(!showDifficultyPanel)}
                                                className="h-10 px-4 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2 transition-colors shadow-md font-semibold text-sm"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                                                </svg>
                                                <span>{difficulty}</span>
                                            </button>
                                        </Tooltip>

                                        {/* Difficulty Panel Popup */}
                                        {showDifficultyPanel && (
                                            <div className="absolute bottom-14 right-0 bg-gray-800 text-white rounded-2xl p-4 shadow-2xl z-20 w-52 flex flex-col gap-2">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-semibold text-sm">Select Difficulty</span>
                                                    <button onClick={() => setShowDifficultyPanel(false)} className="text-gray-400 hover:text-white">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                                    </button>
                                                </div>
                                                {(['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const).map(level => (
                                                    <button
                                                        key={level}
                                                        onClick={() => {
                                                            setDifficulty(level);
                                                            setShowDifficultyPanel(false);
                                                        }}
                                                        className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${difficulty === level ? 'bg-orange-500 font-bold' : 'hover:bg-gray-700'}`}
                                                    >
                                                        {level}
                                                        <span className="block text-xs text-gray-400 font-normal mt-0.5">
                                                            {level === 'Beginner' && '30% words hidden'}
                                                            {level === 'Intermediate' && '50% words hidden'}
                                                            {level === 'Advanced' && '70% words hidden'}
                                                            {level === 'Expert' && '100% words hidden'}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Speed Panel Popup */}
                                        {showSpeedPanel && (
                                            <div className="absolute bottom-14 right-0 bg-gray-800 text-white rounded-2xl p-5 shadow-2xl z-20 w-72">
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

                                                {/* Slider */}
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
                                                        max="3"
                                                        step="0.25"
                                                        value={playbackSpeed}
                                                        onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                                                        className="flex-1 accent-white h-1 bg-gray-600 rounded-full appearance-none cursor-pointer"
                                                    />
                                                    <button
                                                        onClick={() => handleSpeedChange(Math.min(3, playbackSpeed + 0.25))}
                                                        className="text-white/70 hover:text-white font-bold text-lg"
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                {/* Presets */}
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
                            ) : (
                                <div className="p-8 border-t border-gray-100 shrink-0 bg-white rounded-b-2xl text-center">
                                    <div className="text-6xl mb-4">🎉</div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Congratulations!</h3>
                                    <p className="text-gray-500">You have completed all {TOTAL_SENTENCES} sentences.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
