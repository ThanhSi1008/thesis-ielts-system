"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { examsApi } from "@/services/exams.api";
import { useAuth } from "@/contexts/AuthContext";

export default function IntensiveExamStartPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params?.examId as string;
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) return;

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
  }, [authLoading, examId, isAuthenticated, router, user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto max-w-screen-md px-4 py-16">
          <div className="h-6 w-56 bg-gray-200 rounded animate-pulse" />
        </div>
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

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto max-w-screen-md px-4 py-16">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-3">Starting test…</h1>
        <p className="text-gray-600 mb-8">
          Creating your test session and preparing the player.
        </p>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-100 rounded-2xl p-4 mb-8">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
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
    </div>
  );
}

