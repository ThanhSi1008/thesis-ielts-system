'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import PageHeader from '@/components/PageHeader';

// ──── Types ────
interface ShadowingSentence {
    id: number;
    english: string;
    phonetic: string;
    vietnamese: string;
    words: string[];
    audioStart: number;
    audioEnd: number;
}

// ──── Audio Source ────
const AUDIO_URL = 'https://res.cloudinary.com/dalaaegob/video/upload/v1772874242/lesson-K5C-Rt6PJHdZNt0vkUpTp_1_lkoskg.mp3';

// ──── Real Transcription Sentences with exact SRT timestamps ────
const SENTENCES: ShadowingSentence[] = [
    {
        id: 1,
        english: 'So, the last thing in the agenda before we wrap up our end of the year meeting is choosing the MVP of the year.',
        phonetic: 'soʊ, ðə læst θɪŋ ɪn ðə əˈdʒɛndə bɪˈfɔːr wi ræp ʌp aʊər ɛnd ʌv ðə jɪr ˈmiːtɪŋ ɪz ˈtʃuːzɪŋ ðə ɛm viː piː ʌv ðə jɪr',
        vietnamese: 'Vậy, điều cuối cùng trong chương trình nghị sự trước khi chúng ta kết thúc cuộc họp cuối năm là chọn ra MVP của năm.',
        words: ['So', 'the', 'last', 'thing', 'in', 'the', 'agenda', 'before', 'we', 'wrap', 'up', 'our', 'end', 'of', 'the', 'year', 'meeting', 'is', 'choosing', 'the', 'MVP', 'of', 'the', 'year'],
        audioStart: 0, audioEnd: 10.6,
    },
    {
        id: 2,
        english: "I know we don't typically give the most valuable person award to someone who didn't work a complete year with us, but maybe we should make an exception.",
        phonetic: "aɪ noʊ wi doʊnt ˈtɪpɪkli ɡɪv ðə moʊst ˈvæljəbl ˈpɜːrsən əˈwɔːrd tuː ˈsʌmwʌn huː ˈdɪdnt wɜːrk ə kəmˈpliːt jɪr wɪð ʌs bʌt ˈmeɪbi wi ʃʊd meɪk ən ɪkˈsɛpʃən",
        vietnamese: 'Tôi biết chúng ta thường không trao giải thưởng nhân viên xuất sắc nhất cho người chưa làm việc trọn năm với chúng ta, nhưng có lẽ chúng ta nên tạo một ngoại lệ.',
        words: ['I', 'know', 'we', "don't", 'typically', 'give', 'the', 'most', 'valuable', 'person', 'award', 'to', 'someone', 'who', "didn't", 'work', 'a', 'complete', 'year', 'with', 'us', 'but', 'maybe', 'we', 'should', 'make', 'an', 'exception'],
        audioStart: 10.6, audioEnd: 21.28,
    },
    {
        id: 3,
        english: 'Sarah Glassman has been phenomenal since she started with us.',
        phonetic: 'ˈsɛrə ˈɡlæsmən hæz biːn fəˈnɒmɪnəl sɪns ʃiː ˈstɑːrtɪd wɪð ʌs',
        vietnamese: 'Sarah Glassman đã rất xuất sắc kể từ khi cô ấy bắt đầu làm việc với chúng tôi.',
        words: ['Sarah', 'Glassman', 'has', 'been', 'phenomenal', 'since', 'she', 'started', 'with', 'us'],
        audioStart: 21.28, audioEnd: 25.56,
    },
    {
        id: 4,
        english: 'Yes, she has done great.',
        phonetic: 'jɛs ʃiː hæz dʌn ɡreɪt',
        vietnamese: 'Vâng, cô ấy đã làm rất tốt.',
        words: ['Yes', 'she', 'has', 'done', 'great'],
        audioStart: 25.56, audioEnd: 29.2,
    },
    {
        id: 5,
        english: 'Despite not having experience in sales, she helped us reach our goal of over 350 sales in a month.',
        phonetic: 'dɪˈspaɪt nɒt ˈhævɪŋ ɪkˈspɪriəns ɪn seɪlz ʃiː hɛlpt ʌs riːtʃ aʊər ɡoʊl ʌv ˈoʊvər θriː ˈhʌndrəd ˈfɪfti seɪlz ɪn ə mʌnθ',
        vietnamese: 'Mặc dù không có kinh nghiệm bán hàng, cô ấy đã giúp chúng tôi đạt mục tiêu hơn 350 đơn hàng trong một tháng.',
        words: ['Despite', 'not', 'having', 'experience', 'in', 'sales', 'she', 'helped', 'us', 'reach', 'our', 'goal', 'of', 'over', '350', 'sales', 'in', 'a', 'month'],
        audioStart: 29.2, audioEnd: 38.72,
    },
    {
        id: 6,
        english: "This has been something we've strived for since we opened eight years ago.",
        phonetic: "ðɪs hæz biːn ˈsʌmθɪŋ wiːv straɪvd fɔːr sɪns wi ˈoʊpənd eɪt jɪrz əˈɡoʊ",
        vietnamese: 'Đây là điều mà chúng tôi đã nỗ lực đạt được kể từ khi mở cửa 8 năm trước.',
        words: ['This', 'has', 'been', 'something', "we've", 'strived', 'for', 'since', 'we', 'opened', 'eight', 'years', 'ago'],
        audioStart: 38.72, audioEnd: 43.76,
    },
    {
        id: 7,
        english: 'Yes, and by looking at this graph, it is clear she was a great hire.',
        phonetic: 'jɛs ænd baɪ ˈlʊkɪŋ æt ðɪs ɡræf ɪt ɪz klɪr ʃiː wɒz ə ɡreɪt haɪər',
        vietnamese: 'Vâng, và nhìn vào biểu đồ này, rõ ràng cô ấy là một tuyển dụng tuyệt vời.',
        words: ['Yes', 'and', 'by', 'looking', 'at', 'this', 'graph', 'it', 'is', 'clear', 'she', 'was', 'a', 'great', 'hire'],
        audioStart: 43.76, audioEnd: 50.08,
    },
    {
        id: 8,
        english: 'Our sales have only continued to rise since she began.',
        phonetic: 'aʊər seɪlz hæv ˈoʊnli kənˈtɪnjuːd tuː raɪz sɪns ʃiː bɪˈɡæn',
        vietnamese: 'Doanh số bán hàng của chúng tôi chỉ tiếp tục tăng kể từ khi cô ấy bắt đầu.',
        words: ['Our', 'sales', 'have', 'only', 'continued', 'to', 'rise', 'since', 'she', 'began'],
        audioStart: 50.08, audioEnd: 54.08,
    },
    {
        id: 9,
        english: 'I just wonder if the rest of the team will be disappointed.',
        phonetic: 'aɪ dʒʌst ˈwʌndər ɪf ðə rɛst ʌv ðə tiːm wɪl biː ˌdɪsəˈpɔɪntɪd',
        vietnamese: 'Tôi chỉ tự hỏi liệu phần còn lại của đội có thất vọng không.',
        words: ['I', 'just', 'wonder', 'if', 'the', 'rest', 'of', 'the', 'team', 'will', 'be', 'disappointed'],
        audioStart: 54.08, audioEnd: 58.44,
    },
    {
        id: 10,
        english: "They are longtime employees and may feel like she doesn't have the seniority that typically comes with this reward.",
        phonetic: "ðeɪ ɑːr ˈlɒŋtaɪm ɪmˈplɔɪiːz ænd meɪ fiːl laɪk ʃiː ˈdʌznt hæv ðə ˌsiːniˈɒrɪti ðæt ˈtɪpɪkli kʌmz wɪð ðɪs rɪˈwɔːrd",
        vietnamese: 'Họ là những nhân viên lâu năm và có thể cảm thấy cô ấy không có thâm niên thường đi kèm với phần thưởng này.',
        words: ['They', 'are', 'longtime', 'employees', 'and', 'may', 'feel', 'like', 'she', "doesn't", 'have', 'the', 'seniority', 'that', 'typically', 'comes', 'with', 'this', 'reward'],
        audioStart: 58.44, audioEnd: 66.84,
    },
    {
        id: 11,
        english: "Hmm, you may be right, but she gets along with everyone, and I believe everyone should recognize her value and hard work.",
        phonetic: "hm juː meɪ biː raɪt bʌt ʃiː ɡɛts əˈlɒŋ wɪð ˈɛvriːwʌn ænd aɪ bɪˈliːv ˈɛvriːwʌn ʃʊd ˈrɛkəɡnaɪz hɜːr ˈvæljuː ænd hɑːrd wɜːrk",
        vietnamese: 'Hmm, bạn có thể đúng, nhưng cô ấy hòa đồng với mọi người, và tôi tin rằng mọi người nên công nhận giá trị và sự chăm chỉ của cô ấy.',
        words: ['Hmm', 'you', 'may', 'be', 'right', 'but', 'she', 'gets', 'along', 'with', 'everyone', 'and', 'I', 'believe', 'everyone', 'should', 'recognize', 'her', 'value', 'and', 'hard', 'work'],
        audioStart: 66.84, audioEnd: 76.44,
    },
    {
        id: 12,
        english: 'If anything, it may inspire the rest of the team.',
        phonetic: 'ɪf ˈɛniθɪŋ ɪt meɪ ɪnˈspaɪər ðə rɛst ʌv ðə tiːm',
        vietnamese: 'Nếu có gì, điều đó có thể truyền cảm hứng cho phần còn lại của đội.',
        words: ['If', 'anything', 'it', 'may', 'inspire', 'the', 'rest', 'of', 'the', 'team'],
        audioStart: 76.44, audioEnd: 80.16,
    },
    {
        id: 13,
        english: 'Good point. OK, that is decided.',
        phonetic: 'ɡʊd pɔɪnt oʊˈkeɪ ðæt ɪz dɪˈsaɪdɪd',
        vietnamese: 'Ý kiến hay. Được rồi, vậy là quyết định xong.',
        words: ['Good', 'point', 'OK', 'that', 'is', 'decided'],
        audioStart: 80.16, audioEnd: 83.76,
    },
];

const LESSON_TITLE = "Sarah's Sales Success: MVP Debate";
const TOTAL_SENTENCES = SENTENCES.length;
const SPEED_PRESETS = [0.25, 0.5, 0.75, 1.0, 2.0];

// Pre-generated waveform heights (stable across re-renders)
const WAVEFORM_HEIGHTS = Array.from({ length: 60 }, () => Math.max(15, Math.random() * 100));

// Normalize a word for comparison
const normalizeWord = (w: string) => w.toLowerCase().replace(/[.,!?'"]/g, '').trim();

// ──── Page Component ────
export default function ShadowingPracticePage() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [completedSentences, setCompletedSentences] = useState<number[]>([]);
    const [showCompleted, setShowCompleted] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordedResult, setRecordedResult] = useState<string[] | null>(null);
    const [resultStatus, setResultStatus] = useState<'correct' | 'incorrect' | null>(null);
    const [showSpeedPanel, setShowSpeedPanel] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
    const [sentenceCorrect, setSentenceCorrect] = useState(false);
    const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
    const [isPlayingRecorded, setIsPlayingRecorded] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const recordedAudioRef = useRef<HTMLAudioElement>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recognitionRef = useRef<any>(null);
    const skipNextRecordingRef = useRef(false);

    const currentSentence = SENTENCES[currentIndex];
    const progressCount = completedSentences.length;
    const isFinished = completedSentences.length === TOTAL_SENTENCES;

    // ── Word-level match status for result display ──
    const wordStatuses = useMemo(() => {
        if (!recordedResult) return [];
        return currentSentence.words.map((correctWord, i) => {
            if (i >= recordedResult.length) return 'missing' as const;
            const spoken = normalizeWord(recordedResult[i]);
            const correct = normalizeWord(correctWord);
            if (spoken === correct) return 'correct' as const;
            return 'incorrect' as const;
        });
    }, [currentSentence.words, recordedResult]);

    // ── Play current sentence audio segment ──
    const playSentence = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;
        if (timerRef.current) clearInterval(timerRef.current);

        audio.playbackRate = playbackSpeed;
        audio.currentTime = currentSentence.audioStart;
        audio.play();
        setIsPlaying(true);

        timerRef.current = setInterval(() => {
            if (audio.currentTime >= currentSentence.audioEnd) {
                audio.pause();
                setIsPlaying(false);
                if (timerRef.current) clearInterval(timerRef.current);
            }
        }, 50);
    }, [currentSentence, playbackSpeed]);

    // ── Auto-play audio when moving to next sentence ──
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        const timeout = setTimeout(() => {
            const audio = audioRef.current;
            if (!audio || currentIndex >= TOTAL_SENTENCES) return;
            if (timerRef.current) clearInterval(timerRef.current);
            const sentence = SENTENCES[currentIndex];
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
        }, 300);
        return () => clearTimeout(timeout);
    }, [currentIndex, playbackSpeed]);

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
                    currentSentence.words.every((w, i) =>
                        normalizeWord(spokenWords[i] || '') === normalizeWord(w)
                    );

                if (allCorrect) {
                    setResultStatus('correct');
                    setSentenceCorrect(true);
                    setCompletedSentences(prev => [...prev, currentIndex]);
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
        if (currentIndex < TOTAL_SENTENCES - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    }, [currentIndex, recordedAudioUrl]);

    const handlePlayRecordedAudio = () => {
        const audio = recordedAudioRef.current;
        if (!audio || !recordedAudioUrl) return;
        audio.src = recordedAudioUrl;
        audio.play();
        setIsPlayingRecorded(true);
        audio.onended = () => setIsPlayingRecorded(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hidden audio elements */}
            <audio ref={audioRef} src={AUDIO_URL} preload="auto" />
            <audio ref={recordedAudioRef} />

            <PageHeader
                title={LESSON_TITLE}
                backgroundImage="https://res.cloudinary.com/dalaaegob/image/upload/v1772877124/28d5a6da-70f6-4b0b-acc9-78cbd397dbf9.png"
                breadcrumbs={[
                    { label: 'Homepage', href: '/' },
                    { label: 'Shadowing & Dication', href: '/shadowing-dictation' },
                    { label: LESSON_TITLE },
                ]}
            />

            {/* Main Content - Two Column Layout */}
            <div className="container mx-auto max-w-screen-xl px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* ══ LEFT COLUMN ══ */}
                    <div className="flex flex-col gap-6">
                        {/* Source / Audio Player */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Source</h2>
                            <div className="flex items-center gap-3">
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
                                <div className="flex-1 flex items-center gap-[2px] h-10 overflow-hidden">
                                    {WAVEFORM_HEIGHTS.map((height, i) => (
                                        <div
                                            key={i}
                                            className={`flex-1 rounded-full transition-colors ${isPlaying ? 'bg-primary' : 'bg-gray-300'
                                                }`}
                                            style={{ height: `${height}%`, minWidth: '2px' }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Completed Sentences */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 max-h-[500px] overflow-y-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-gray-800">Completed</h2>
                                <button
                                    onClick={() => setShowCompleted(!showCompleted)}
                                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={`h-4 w-4 transition-transform ${showCompleted ? '' : 'rotate-180'}`}
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                    </svg>
                                    {showCompleted ? 'Hide' : 'Show'}
                                </button>
                            </div>

                            {showCompleted && completedSentences.length > 0 && (
                                <div className="space-y-6">
                                    {completedSentences.map((sentenceIdx) => {
                                        const sentence = SENTENCES[sentenceIdx];
                                        return (
                                            <div key={sentence.id}>
                                                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white text-sm font-bold mb-2">
                                                    {sentence.id}
                                                </div>
                                                <p className="font-bold text-gray-800 mb-1 leading-relaxed">
                                                    {sentence.english}
                                                </p>
                                                <div className="flex gap-1 mb-2 flex-wrap">
                                                    {Array.from({ length: 8 }).map((_, i) => (
                                                        <svg key={i} width="50" height="8" viewBox="0 0 50 8">
                                                            <path
                                                                d="M0 4 Q6 0 12 4 Q18 8 25 4 Q31 0 37 4 Q43 8 50 4"
                                                                fill="none"
                                                                stroke="#FFC600"
                                                                strokeWidth="2"
                                                                strokeDasharray={i % 2 === 0 ? 'none' : '4 3'}
                                                            />
                                                        </svg>
                                                    ))}
                                                </div>
                                                <p className="text-gray-500 text-sm leading-relaxed">
                                                    {sentence.vietnamese}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {completedSentences.length === 0 && (
                                <p className="text-gray-400 text-sm text-center py-4">No sentences completed yet. Start recording!</p>
                            )}
                        </div>
                    </div>

                    {/* ══ RIGHT COLUMN ══ */}
                    <div>
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-6">
                            {/* Header with Progress */}
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-lg font-bold text-gray-800">Shadowing</h2>
                                <span className="text-lg font-bold text-gray-800">
                                    {progressCount}/{TOTAL_SENTENCES}
                                </span>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full transition-all duration-500"
                                    style={{ width: `${(progressCount / TOTAL_SENTENCES) * 100}%` }}
                                />
                            </div>

                            {/* Finished State */}
                            {isFinished ? (
                                <div className="text-center py-8">
                                    <div className="text-6xl mb-4">🎉</div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Congratulations!</h3>
                                    <p className="text-gray-500">You have completed all {TOTAL_SENTENCES} sentences.</p>
                                </div>
                            ) : (
                                <>
                                    {/* Current Sentence */}
                                    <div className="mb-4">
                                        <p className="text-lg font-bold text-gray-800 leading-relaxed mb-2">
                                            {currentSentence.english}
                                        </p>
                                        <p className="text-gray-500 text-sm leading-relaxed font-mono">
                                            {currentSentence.phonetic}
                                        </p>
                                    </div>

                                    {/* Success Banner */}
                                    {sentenceCorrect && (
                                        <div className="mb-4 bg-green-50 border-2 border-green-400 rounded-xl p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <span className="text-green-700 font-semibold">Correct! Well done 🎉</span>
                                            </div>
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
                                        className={`w-full py-3.5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all mb-5 ${sentenceCorrect
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            : isRecording
                                                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                                                : 'bg-primary hover:bg-yellow-500 text-gray-900'
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

                                    {/* Result Section */}
                                    {recordedResult && (
                                        <div className="mb-4">
                                            <p className="text-sm font-semibold text-gray-600 mb-3">Result:</p>
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {recordedResult.map((word, i) => {
                                                    const status = wordStatuses[i];
                                                    return (
                                                        <span
                                                            key={i}
                                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 ${status === 'correct'
                                                                ? 'border-green-400 bg-green-50 text-green-700'
                                                                : 'border-red-400 bg-red-50 text-red-700'
                                                                }`}
                                                        >
                                                            {word}
                                                        </span>
                                                    );
                                                })}
                                                {/* Show missing words as gray placeholders */}
                                                {currentSentence.words.slice(recordedResult.length).map((word, i) => (
                                                    <span
                                                        key={`missing-${i}`}
                                                        className="px-3 py-1.5 rounded-lg text-sm font-medium border-2 border-gray-300 bg-gray-50 text-gray-400"
                                                    >
                                                        {word}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Feedback + Action Buttons */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            {resultStatus === 'incorrect' && (
                                                <p className="text-red-500 font-semibold text-sm">Not correct! Please try again!</p>
                                            )}
                                            {resultStatus === 'correct' && (
                                                <p className="text-green-500 font-semibold text-sm">Great pronunciation!</p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3 relative">
                                            {/* Replay */}
                                            <button
                                                onClick={handleRepeat}
                                                className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors shadow-md"
                                                title="Repeat sentence"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                                </svg>
                                            </button>

                                            {/* Speed Control */}
                                            <button
                                                onClick={() => setShowSpeedPanel(!showSpeedPanel)}
                                                className="w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition-colors shadow-md"
                                                title="Playback speed"
                                            >
                                                <span className="text-xs font-bold">{playbackSpeed}x</span>
                                            </button>

                                            {/* Play Recorded Audio */}
                                            <button
                                                onClick={handlePlayRecordedAudio}
                                                disabled={!recordedAudioUrl}
                                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-md ${recordedAudioUrl
                                                    ? isPlayingRecorded
                                                        ? 'bg-red-600 text-white animate-pulse'
                                                        : 'bg-red-500 hover:bg-red-600 text-white'
                                                    : 'bg-gray-300 text-gray-400 cursor-not-allowed'
                                                    }`}
                                                title="Play your recording"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                                </svg>
                                            </button>

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
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
