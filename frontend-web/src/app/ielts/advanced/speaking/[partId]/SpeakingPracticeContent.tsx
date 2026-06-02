"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Clock, Mic, PlayCircle, Send } from "lucide-react";
import { toast } from "@/components/Toaster";
import {
  useSpeakingPartDetail,
  useSpeakingSession,
  useStartSpeakingSession,
  useSubmitSpeaking,
} from "@/hooks/useIeltsAdvancedSpeaking";

type StepState = "IDLE" | "INTRODUCING" | "READING" | "THINKING" | "RECORDING" | "RECORDED";

const THINK_DURATIONS: Record<number, number> = { 1: 2, 2: 60, 3: 2 };
const MAX_RECORD_DURATIONS: Record<number, number> = { 1: 60, 2: 120, 3: 60 };

export default function SpeakingPracticeContent({ partId }: { partId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session") || "";

  const { data: part, isLoading: isPartLoading } = useSpeakingPartDetail(partId);
  const { data: session, isLoading: isSessionLoading } = useSpeakingSession(sessionId);
  const startSession = useStartSpeakingSession();
  const submitSpeaking = useSubmitSpeaking();

  const questions = useMemo(() => part?.questions || session?.part?.questions || [], [part, session]);
  const partNumber = (part?.partNumber || session?.part?.partNumber || 1) as 1 | 2 | 3;

  const [activeQnIdx, setActiveQnIdx] = useState(0);
  const [step, setStep] = useState<StepState>("IDLE");
  const [thinkTimeLeft, setThinkTimeLeft] = useState(0);
  const [recordTimeElapsed, setRecordTimeElapsed] = useState(0);
  const [totalElapsedTime, setTotalElapsedTime] = useState(0);
  const [notes, setNotes] = useState("");
  const [micError, setMicError] = useState(false);
  const [isBrowserSupported, setIsBrowserSupported] = useState(true);
  const [answers, setAnswers] = useState<Record<string, { blob: Blob; url: string }>>({});

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const currentQuestionText = questions[activeQnIdx]?.text || "";
  const questionKey = String(activeQnIdx);
  const allAnswered = questions.length > 0 && questions.every((_, idx) => !!answers[String(idx)]);

  const checkBrowserSupport = useCallback(() => {
    if (typeof window === "undefined") return false;
    if (!navigator.mediaDevices?.getUserMedia) return false;
    if (!window.MediaRecorder) return false;
    return true;
  }, []);

  const startRecording = useCallback(async () => {
    try {
      if (!checkBrowserSupport()) {
        setMicError(true);
        setIsBrowserSupported(false);
        setStep("IDLE");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAnswers((prev) => ({ ...prev, [questionKey]: { blob, url } }));
        setStep("RECORDED");
      };

      mediaRecorderRef.current.start();
      setRecordTimeElapsed(0);
      setStep("RECORDING");
    } catch {
      setMicError(true);
      toast.error("Microphone access is required.");
      setStep("IDLE");
    }
  }, [checkBrowserSupport, questionKey]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    }
  }, []);

  useEffect(() => {
    setIsBrowserSupported(checkBrowserSupport());
  }, [checkBrowserSupport]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (sessionId) setTotalElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionId]);

  useEffect(() => {
    if (step !== "THINKING") return;
    if (thinkTimeLeft <= 0) {
      startRecording();
      return;
    }
    const t = setTimeout(() => setThinkTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [step, thinkTimeLeft, startRecording]);

  useEffect(() => {
    if (step !== "RECORDING") return;
    const t = setTimeout(() => {
      const next = recordTimeElapsed + 1;
      setRecordTimeElapsed(next);
      if (next >= (MAX_RECORD_DURATIONS[partNumber] || 60)) {
        stopRecording();
      }
    }, 1000);
    return () => clearTimeout(t);
  }, [step, recordTimeElapsed, partNumber, stopRecording]);

  useEffect(() => {
    return () => {
      Object.values(answers).forEach((a) => URL.revokeObjectURL(a.url));
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [answers]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [activeQnIdx]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const speakQuestion = useCallback((text: string, onEnd: () => void) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      onEnd();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const enVoice =
      voices.find((v) => v.lang.startsWith("en-GB")) ||
      voices.find((v) => v.lang.startsWith("en-US"));
    if (enVoice) utterance.voice = enVoice;

    utterance.onend = () => {
      onEnd();
    };
    utterance.onerror = () => {
      onEnd();
    };
    window.speechSynthesis.speak(utterance);
  }, []);

  const startFlow = () => {
    if (activeQnIdx === 0) {
      setStep("INTRODUCING");
      let introText = "";
      if (partNumber === 1) {
        introText = `Welcome to the IELTS Speaking practice test. In this first part, I'd like to ask you some general questions about yourself. Let's talk about ${part?.topic || "various topics"}. First question: ${currentQuestionText}`;
      } else if (partNumber === 2) {
        introText = `Now, in this second part, I'd like to give you a topic, and you will have one minute to think about what you want to say, and then speak for up to two minutes. You can make notes in the box on the right if you wish. Describe the topic: ${currentQuestionText}. Please prepare now.`;
      } else {
        introText = `We've been talking about ${part?.topic || "the topic"}, and now, in this third part, I'd like to ask you some more general questions related to this. First question: ${currentQuestionText}`;
      }
      speakQuestion(introText, () => {
        setStep("THINKING");
        setThinkTimeLeft(THINK_DURATIONS[partNumber] || 2);
      });
    } else {
      setStep("READING");
      speakQuestion(currentQuestionText, () => {
        setStep("THINKING");
        setThinkTimeLeft(THINK_DURATIONS[partNumber] || 2);
      });
    }
  };


  const goNext = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (activeQnIdx < questions.length - 1) {
      setActiveQnIdx((i) => i + 1);
      setStep("IDLE");
      setRecordTimeElapsed(0);
      setThinkTimeLeft(0);
      return;
    }
    if (allAnswered) {
      handleSubmit();
    }
  };

  const handleStart = async () => {
    try {
      const s = await startSession.mutateAsync(partId);
      router.push(`/ielts/advanced/speaking/${partId}?session=${s.id}`);
    } catch {
      toast.error("Failed to start speaking session");
    }
  };

  const toBase64 = (blob: Blob) =>
    new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string) || "");
      reader.readAsDataURL(blob);
    });

  const handleSubmit = async () => {
    if (!sessionId) return;
    const audioAnswers: Record<string, string> = {};
    for (const [key, value] of Object.entries(answers)) {
      audioAnswers[key] = await toBase64(value.blob);
    }

    const loadingToastId = toast.loading("Submitting your answers for grading...");
    try {
      await submitSpeaking.mutateAsync({
        sessionId,
        audioAnswers,
        timeTaken: totalElapsedTime,
      });
      toast.update(loadingToastId, "success", "Submitted! Grading in progress...");
      router.push(`/ielts/advanced/speaking/${partId}/result/${sessionId}`);
    } catch (e: unknown) {
      const maybeMessage =
        typeof e === "object" &&
        e &&
        "response" in e &&
        (e as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast.update(loadingToastId, "error", maybeMessage || "Failed to submit.");
    }
  };

  if (!sessionId) {
    if (isPartLoading) return <div className="p-10 font-bold text-gray-500">Loading...</div>;
    if (!part) return <div className="p-10 font-bold text-red-500">Part not found.</div>;

    return (
      <div className="max-w-3xl mx-auto py-8 px-4 flex flex-col gap-6">
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
          <div className="text-sm font-medium text-amber-800 dark:text-amber-400">
            Part {part.partNumber} ({part.partType.replace("_", " ")}): Think time {THINK_DURATIONS[part.partNumber] || 2}s, max recording {MAX_RECORD_DURATIONS[part.partNumber] || 60}s per question.
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-8">
          <h2 className="text-xl font-black mb-2 text-gray-900 dark:text-white">{part.title}</h2>
          <p className="text-sm font-bold text-gray-500 dark:text-slate-400 mb-4">{part.topic}</p>
          <ol className="space-y-3 list-decimal list-inside">
            {part.questions.map((q, idx) => (
              <li key={idx} className="text-gray-800 dark:text-slate-200 leading-relaxed">
                {q.text}
              </li>
            ))}
          </ol>
        </div>

        <div className="flex items-center justify-between">
          {part.activeSession ? (
            <button
              onClick={() => router.push(`/ielts/advanced/speaking/${partId}?session=${part.activeSession!.id}`)}
              className="flex items-center gap-2 px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black text-base transition-all shadow-sm"
            >
              <PlayCircle className="w-5 h-5" />
              Resume Practice
            </button>
          ) : (
            <button
              onClick={handleStart}
              disabled={startSession.isPending}
              className="flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary/90 text-gray-900 rounded-xl font-black text-base transition-all shadow-sm disabled:opacity-50"
            >
              <PlayCircle className="w-5 h-5" />
              {startSession.isPending ? "Starting..." : "Start Practice"}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (isPartLoading || isSessionLoading) {
    return <div className="p-10 font-bold text-gray-500">Loading practice...</div>;
  }

  if (!questions.length || !session) {
    return <div className="p-10 font-bold text-red-500">Session data not found.</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-h-screen bg-gray-50 dark:bg-slate-950 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
        <div>
          <h1 className="text-lg font-black text-gray-900 dark:text-white">
            Speaking Part {partNumber}: {session.part?.partType?.replace("_", " ") || part?.partType?.replace("_", " ")}
          </h1>
          <p className="text-xs font-bold text-gray-400">
            Question {activeQnIdx + 1} of {questions.length}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 text-sm font-bold">
            <Clock className="w-4 h-4 inline mr-1" />
            {formatTime(totalElapsedTime)}
          </div>
          <button
            disabled={!allAnswered || submitSpeaking.isPending}
            onClick={handleSubmit}
            className="px-4 py-2 rounded-xl bg-primary text-gray-900 font-black disabled:opacity-50 inline-flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Submit
          </button>
        </div>
      </div>

      <div className={`flex-1 min-h-0 p-6 grid gap-6 ${partNumber === 2 ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 overflow-auto">
          {!isBrowserSupported && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h3 className="font-semibold text-red-700 dark:text-red-400">Browser Not Supported</h3>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                Your browser does not support microphone recording for this practice.
              </p>
            </div>
          )}
          {micError && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h3 className="font-semibold text-red-700 dark:text-red-400">Microphone Access Required</h3>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                Please allow microphone access in your browser settings, then try again.
              </p>
              <button
                onClick={() => {
                  setMicError(false);
                  setStep("IDLE");
                }}
                className="mt-3 px-3 py-1.5 rounded-md text-sm font-bold bg-white dark:bg-slate-900 border border-red-200 dark:border-red-700"
              >
                Try Again
              </button>
            </div>
          )}
          <div className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Prompt</div>
          <p className="text-gray-900 dark:text-white text-lg leading-relaxed whitespace-pre-wrap">{currentQuestionText}</p>
          <div className="mt-6 text-sm font-bold text-gray-500">
            Status: {step === "INTRODUCING" ? "Introducing..." : step === "READING" ? "Reading..." : step === "THINKING" ? `Thinking (${thinkTimeLeft}s)` : step}
          </div>
          {step === "RECORDED" && answers[questionKey] && (
            <audio src={answers[questionKey].url} controls className="w-full max-w-[420px] mt-4" />
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (typeof window !== "undefined" && "speechSynthesis" in window) {
                    window.speechSynthesis.cancel();
                  }
                  setActiveQnIdx(idx);
                  setStep("IDLE");
                }}
                className={`w-8 h-8 rounded-full text-sm font-medium ${
                  idx === activeQnIdx
                    ? "bg-primary text-white"
                    : answers[String(idx)]
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-500"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {partNumber === 2 && (
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col">
            <div className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Notes</div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Note your key ideas..."
              className="flex-1 min-h-[220px] resize-none rounded-xl border border-gray-200 dark:border-slate-700 p-4 bg-gray-50 dark:bg-slate-950"
            />
          </div>
        )}
      </div>

      <div className="px-6 py-4 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between">
        <div className="text-sm font-bold text-red-500">
          {step === "RECORDING" || step === "RECORDED" ? `Record: ${formatTime(recordTimeElapsed)}` : "Record: 0:00"}
        </div>
        <div className="flex items-center gap-2">
          {step === "IDLE" && (
            <button onClick={startFlow} className="px-4 py-2 rounded-xl bg-primary text-gray-900 font-black inline-flex items-center gap-2">
              <PlayCircle className="w-4 h-4" />
              Start
            </button>
          )}
          {step === "RECORDING" && (
            <button onClick={stopRecording} className="px-4 py-2 rounded-xl bg-red-500 text-white font-black inline-flex items-center gap-2">
              <Mic className="w-4 h-4" />
              Stop
            </button>
          )}
          <button
            onClick={() => {
              if (step === "RECORDING") stopRecording();
              else goNext();
            }}
            className="px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-700 font-bold"
          >
            Skip
          </button>
          <button
            onClick={goNext}
            disabled={step !== "RECORDED"}
            className="px-5 py-2 rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-black disabled:opacity-50"
          >
            {activeQnIdx === questions.length - 1 ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
