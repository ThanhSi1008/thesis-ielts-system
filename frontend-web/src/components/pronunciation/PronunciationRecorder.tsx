'use client';

import React, { useState, useRef } from 'react';
import { learningApi } from '@/services/learning.api';
import type { PronunciationResult } from '@/types';
import ScoreCircle, { getScoreColor } from './ScoreCircle';
import IpaFeedback from './IpaFeedback';

interface PronunciationRecorderProps {
  vocabularyId?: string;
  userId: string;
  targetWord: string;
  /** Called with the full result when scoring is complete */
  onSuccess?: (result: PronunciationResult) => void;
}

export const PronunciationRecorder: React.FC<PronunciationRecorderProps> = ({
  vocabularyId,
  userId,
  targetWord,
  onSuccess,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        submitAudio(blob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setError(null);
      setResult(null);
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
    } catch {
      setError('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const submitAudio = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      const file = new File([blob], 'recording.webm', { type: 'audio/webm' });
      const response = await learningApi.checkPronunciation(file, userId, { vocabularyId, targetWord }) as { attemptId: string };
      pollResult(response.attemptId);
    } catch {
      setError('Failed to submit audio. Please try again.');
      setIsProcessing(false);
    }
  };

  const pollResult = (attemptId: string) => {
    const start = Date.now();
    const pollInterval = setInterval(async () => {
      try {
        if (Date.now() - start > 30_000) {
          clearInterval(pollInterval);
          setIsProcessing(false);
          setError('Analysis timed out. Please try again.');
          return;
        }

        const attempts = await learningApi.getUserPronunciationAttempts(userId) as any[];
        const attempt = attempts.find((a: any) => a.id === attemptId);

        if (attempt?.status === 'COMPLETED') {
          clearInterval(pollInterval);
          setIsProcessing(false);
          const parsedResult: PronunciationResult = {
            score: attempt.score,
            transcribedText: attempt.transcribedText ?? '',
            feedback: attempt.feedback,
          };
          setResult(parsedResult);
          onSuccess?.(parsedResult);
        } else if (attempt?.status === 'FAILED') {
          clearInterval(pollInterval);
          setIsProcessing(false);
          setError('Analysis failed. Please try again.');
        }
      } catch {
        // transient network error — keep polling
      }
    }, 2000);
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  };

  if (result) {
    return <ResultView result={result} targetWord={targetWord} audioUrl={audioUrl} onRetry={handleReset} />;
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4 border border-slate-100 rounded-xl bg-slate-50">
      <h3 className="font-bold text-slate-700 text-sm">Practice Pronunciation</h3>

      <div className="text-sm text-slate-500">
        Say: <span className="font-bold text-slate-900 text-base">{targetWord}</span>
      </div>

      {error && (
        <div className="text-red-500 text-xs bg-red-50 border border-red-200 px-3 py-2 rounded-lg w-full text-center">
          {error}
        </div>
      )}

      {isProcessing ? (
        <div className="flex flex-col items-center gap-2 py-2">
          <div className="w-10 h-10 border-[3px] border-amber-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500">Analyzing pronunciation…</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-md
              ${isRecording
                ? 'bg-red-500 hover:bg-red-600 ring-4 ring-red-200 animate-pulse'
                : 'bg-[#FFC600] hover:bg-yellow-400 hover:scale-105'
              }`}
          >
            {isRecording ? (
              <div className="w-5 h-5 bg-white rounded-sm" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>
          <p className="text-xs text-slate-500">{isRecording ? 'Listening…' : 'Tap to record'}</p>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// ResultView — shown after scoring is complete
// ─────────────────────────────────────────────

interface ResultViewProps {
  result: PronunciationResult;
  targetWord: string;
  audioUrl: string | null;
  onRetry: () => void;
}

function ResultView({ result, targetWord, audioUrl, onRetry }: ResultViewProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const playAudio = () => {
    if (!audioUrl) return;
    setIsPlaying(true);
    const audio = new Audio(audioUrl);
    audio.onended = () => setIsPlaying(false);
    audio.play().catch(() => setIsPlaying(false));
  };
  const { score, feedback } = result;
  const { text: textColor, bg, label } = getScoreColor(score);
  const details = feedback?.details;

  const targetIPA = details?.targetIPA ?? '';
  const spokenIPA = details?.transcribedIPA ?? '';

  return (
    <div className="flex flex-col items-center gap-4 p-4 border border-slate-100 rounded-xl bg-slate-50 animate-in fade-in zoom-in duration-300">

      {/* Score circle + IPA feedback row */}
      <div className="flex flex-col items-center gap-2 w-full">
        <ScoreCircle score={score} size={80} />

        {/* Level badge */}
        <span className={`text-xs font-bold px-3 py-0.5 rounded-full ${bg} ${textColor}`}>
          {feedback?.level ?? label}
        </span>

        {/* IPA comparison */}
        {targetIPA && (
          <IpaFeedback
            targetIPA={targetIPA}
            spokenIPA={spokenIPA}
            className="mt-1"
          />
        )}

        {/* Message */}
        {feedback?.message && (
          <p className="text-xs text-slate-500 text-center max-w-[200px] leading-relaxed">
            {feedback.message}
          </p>
        )}
      </div>

      {/* Sub-scores */}
      {details && (
        <div className="flex gap-3 w-full bg-white border border-slate-100 rounded-lg p-2.5 text-center">
          <SubScore label="Phoneme" value={details.phonemeAccuracy} />
          <div className="w-px bg-slate-100" />
          <SubScore label="Confidence" value={details.confidenceScore} />
          <div className="w-px bg-slate-100" />
          <SubScore label="Text" value={details.textAccuracy} />
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-3 w-full justify-center">
        {audioUrl && (
          <button
            onClick={playAudio}
            className={`flex items-center justify-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-full transition-all border ${
              isPlaying 
                ? 'bg-blue-50 text-blue-600 border-blue-200' 
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-900'
            }`}
          >
            <svg className={`w-4 h-4 ${isPlaying ? 'animate-pulse' : ''}`} fill="currentColor" viewBox="0 0 24 24">
              {isPlaying ? (
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              ) : (
                <path d="M8 5v14l11-7z" />
              )}
            </svg>
            {isPlaying ? 'Playing' : 'Listen'}
          </button>
        )}

        <button
          onClick={onRetry}
          className="text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-400 px-4 py-1.5 rounded-full transition-all"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

function SubScore({ label, value }: { label: string; value: number }) {
  const { text } = getScoreColor(value);
  return (
    <div className="flex-1 flex flex-col gap-0.5">
      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{label}</span>
      <span className={`text-sm font-bold ${text}`}>{Math.round(value)}%</span>
    </div>
  );
}
