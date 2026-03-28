"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { examsApi } from "@/services/exams.api";
import { useAuth } from "@/contexts/AuthContext";
import SpeakingDeviceTest from "@/components/SpeakingDeviceTest";

export default function IntensiveExamStartPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const examId = params?.examId as string;
  const isSpeaking = searchParams?.get("type") === "SPEAKING";
  
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [isDeviceTested, setIsDeviceTested] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) return;
    if (isSpeaking && !isDeviceTested) return;

    let mounted = true;
    setCreating(true);
    setError(null);

    examsApi
      .createSession(examId, user!.id)
      .then((session) => {
        if (!mounted) return;
        router.replace(`/ielts/intensive/${encodeURIComponent(examId)}/take/${encodeURIComponent(session.id)}`);
      })
      .catch((e: any) => {
        if (!mounted) return;
        setError(e?.message || "Failed to start session");
      })
      .finally(() => {
        if (!mounted) return;
        setCreating(false);
      });

    return () => {
      mounted = false;
    };
  }, [authLoading, examId, isAuthenticated, router, user, isSpeaking, isDeviceTested]);

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
        <svg className="animate-[spin_0.8s_linear_infinite] w-[80px] h-[80px] mb-8 text-black" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 12 A10 10 0 0 0 12 2" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
        </svg>
        <h1 className="text-[28px] font-extrabold text-[#1a1a1a] mb-3 text-center tracking-tight">Your test will begin shortly</h1>
        <p className="text-[17px] text-[#1a1a1a] text-center">Please wait</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto max-w-screen-md px-4 py-16">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-3">Sign in required</h1>
          <p className="text-gray-600 mb-8">
            Please sign in before starting the test.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/login"
              className="px-6 py-3 rounded-xl bg-primary hover:bg-yellow-400 font-bold text-gray-900 transition-colors"
            >
              Go to login
            </Link>
            <Link
              href={`/ielts/intensive/${encodeURIComponent(examId)}`}
              className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold text-gray-800 transition-colors"
            >
              Back to instructions
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isSpeaking && !isDeviceTested) {
    return <SpeakingDeviceTest onComplete={() => setIsDeviceTested(true)} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
      {error ? (
        <div className="flex flex-col items-center">
          <div className="bg-red-50 text-red-700 border border-red-100 rounded-2xl p-4 mb-8 text-center max-w-lg">
            {error}
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href={`/ielts/intensive/${encodeURIComponent(examId)}`}
              className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold text-gray-800 transition-colors"
            >
              Back to instructions
            </Link>
            <button
              disabled={creating}
              onClick={() => router.refresh()}
              className="px-6 py-3 rounded-xl bg-primary hover:bg-yellow-400 font-bold text-gray-900 transition-colors disabled:opacity-60"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <>
          <svg className="animate-[spin_0.8s_linear_infinite] w-[80px] h-[80px] mb-8 text-black" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 12 A10 10 0 0 0 12 2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" />
          </svg>
          <h1 className="text-[28px] font-extrabold text-[#1a1a1a] mb-2 text-center tracking-tight">Your test will begin shortly</h1>
          <p className="text-[17px] text-[#1a1a1a] text-center">Please wait</p>
        </>
      )}
    </div>
  );
}

