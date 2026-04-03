"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { examsApi } from "@/services/exams.api";
import type { ExamDetail } from "@/types";
import PracticeListeningBoard from "./PracticeListeningBoard";
import PracticeReadingBoard from "./PracticeReadingBoard";
import PracticeWritingBoard from "./PracticeWritingBoard";
import PracticeSpeakingBoard from "./PracticeSpeakingBoard";

type AnswersState = Record<string, string | string[]>;

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function PracticeTestTakePage() {
  const params = useParams();
  const router = useRouter();
  const examId = params?.examId as string;
  const sessionId = params?.sessionId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [sessionInfo, setSessionInfo] = useState<any>(null);

  const [secondsLeft, setSecondsLeft] = useState(0);
  const [answers, setAnswers] = useState<AnswersState>({});

  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<any>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [res, session] = await Promise.all([
          examsApi.getExam(examId),
          examsApi.getSession(sessionId),
        ]);
        if (!mounted) return;

        setExam(res);
        setSessionInfo(session);
        setSecondsLeft(res.duration * 60);

        if (session?.answers) {
          setAnswers(session.answers as AnswersState);
        }

        if (session?.status === "COMPLETED") {
          router.replace(
            `/ielts/intensive/${encodeURIComponent(examId)}/result/${encodeURIComponent(sessionId)}`
          );
          return;
        }

        setLoading(false);
      } catch (err: any) {
        if (!mounted) return;
        setError(err.message || "Failed to load practice");
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [examId, sessionId, router]);

  // Global countdown (used only by Listening/Reading boards; Writing/Speaking own their timer via secondsLeft prop)
  useEffect(() => {
    if (loading || !!error || !exam || submitting || submitResult) return;
    const intervalId = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(intervalId);
  }, [loading, error, exam, submitting, submitResult]);

  useEffect(() => {
    if (submitResult) {
      router.replace(
        `/ielts/intensive/${encodeURIComponent(examId)}/result/${encodeURIComponent(sessionId)}`
      );
    }
  }, [submitResult, examId, sessionId, router]);

  const submitAndTrack = async (data: any) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await examsApi.submitSession(data.sessionId, data.answers, data.timeTaken);
      setSubmitResult(result);
      return result;
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit answers");
      setSubmitting(false);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <svg className="animate-[spin_0.8s_linear_infinite] w-[80px] h-[80px] mb-8 text-black" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 12 A10 10 0 0 0 12 2" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
        </svg>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="min-h-screen bg-[#faf9f8] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-[#e2e1df] p-8 text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-3">Unable to Load Practice</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <button onClick={() => router.push("/ielts/intensive")} className="bg-gray-900 hover:bg-black text-white font-bold py-3 px-6 rounded-xl transition-colors w-full">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <>
      {exam.type === "WRITING" ? (
        <PracticeWritingBoard
          exam={exam}
          sessionInfo={sessionInfo}
          secondsLeft={secondsLeft}
          formatTime={formatTime}
        />
      ) : exam.type === "SPEAKING" ? (
        <PracticeSpeakingBoard
          exam={exam}
          sessionInfo={sessionInfo}
          secondsLeft={secondsLeft}
        />
      ) : exam.type === "READING" ? (
        <PracticeReadingBoard
          exam={exam}
          sessionInfo={sessionInfo}
          answers={answers}
          setAnswers={setAnswers}
          formatTime={formatTime}
          secondsLeft={secondsLeft}
          submitting={submitting}
          submitResult={submitResult}
          submitError={submitError}
          submitAndTrack={submitAndTrack}
        />
      ) : (
        <PracticeListeningBoard
          exam={exam}
          sessionInfo={sessionInfo}
          answers={answers}
          setAnswers={setAnswers}
          formatTime={formatTime}
          secondsLeft={secondsLeft}
          submitting={submitting}
          submitResult={submitResult}
          submitError={submitError}
          submitAndTrack={submitAndTrack}
        />
      )}
    </>
  );
}
