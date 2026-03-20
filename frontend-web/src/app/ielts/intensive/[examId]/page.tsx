"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { examsApi } from "@/services/exams.api";
import type { ExamDetail } from "@/types";

function extractYouTubeId(input: string) {
  // Supports: https://youtu.be/<id>, https://www.youtube.com/watch?v=<id>, raw id
  const raw = input.trim();
  if (/^[a-zA-Z0-9_-]{6,}$/.test(raw) && !raw.includes("http")) return raw;
  try {
    const u = new URL(raw);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.replace("/", "");
    }
    if (u.hostname.includes("youtube.com")) {
      return u.searchParams.get("v") || "";
    }
  } catch {
    // ignore
  }
  return "";
}

function splitExamTitle(title: string) {
  // "Cambridge IELTS 17 - Listening Test 1"
  const parts = title.split(" - ");
  if (parts.length >= 2) {
    return { groupTitle: parts[0].trim(), testTitle: parts.slice(1).join(" - ").trim() };
  }
  return { groupTitle: title, testTitle: "" };
}

function Breadcrumbs({ current }: { current: string }) {
  const items = useMemo(
    () => [
      { label: "Homepage", href: "/" },
      { label: "IELTS", href: "/ielts" },
      { label: "Intensive IELTS", href: "/ielts/intensive" },
      { label: current },
    ],
    [current]
  );

  return (
    <nav className="text-sm font-semibold text-gray-700 flex items-center flex-wrap gap-2">
      {items.map((it, idx) => {
        const last = idx === items.length - 1;
        return (
          <span key={`${it.label}-${idx}`} className="flex items-center gap-2">
            {last ? (
              <span className="text-gray-900">{it.label}</span>
            ) : (
              <Link href={it.href!} className="hover:text-gray-900 transition-colors">
                {it.label}
              </Link>
            )}
            {!last && <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />}
          </span>
        );
      })}
    </nav>
  );
}

export default function IntensiveExamIntroPage() {
  const params = useParams();
  const examId = params?.examId as string;

  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const videoId = useMemo(() => extractYouTubeId("https://youtu.be/UFjDeMuyPMs"), []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    examsApi
      .getExam(examId)
      .then((res) => {
        if (!mounted) return;
        setExam(res);
      })
      .catch((e: any) => {
        if (!mounted) return;
        setError(e?.message || "Failed to load exam");
        setExam(null);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [examId]);

  const title = exam?.title || "Loading...";
  const { groupTitle, testTitle } = splitExamTitle(title);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-screen-xl px-4 py-8">
        {/* <Breadcrumbs current={title} /> */}

        <div className="mt-2 flex justify-center">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-sm border border-gray-100 px-10 py-12">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 w-56 bg-gray-200 rounded mx-auto" />
                <div className="h-6 w-44 bg-gray-200 rounded mx-auto mt-4" />
                <div className="h-4 w-40 bg-gray-200 rounded mx-auto mt-3" />
                <div className="h-1 w-20 bg-gray-200 rounded mx-auto mt-6" />
                <div className="h-5 w-44 bg-gray-200 rounded mx-auto mt-10" />
                <div className="mt-6 aspect-video bg-gray-200 rounded-2xl" />
                <div className="mt-10 h-12 w-48 bg-gray-200 rounded-full mx-auto" />
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-700 border border-red-100 rounded-2xl p-4">
                {error}
              </div>
            ) : !exam ? (
              <div className="bg-amber-50 text-amber-800 border border-amber-100 rounded-2xl p-4">
                Exam not found.
              </div>
            ) : (
              <>
                <div className="text-center">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                    {groupTitle}
                  </h1>
                  {testTitle && (
                    <div className="mt-2 text-lg font-bold text-gray-900">
                      {testTitle}
                    </div>
                  )}
                  <div className="mt-2 text-sm font-semibold text-gray-600">
                    Time: {exam.duration} minutes
                  </div>

                  <div className="mt-6 flex items-center justify-center">
                    <div className="w-12 h-[3px] rounded-full bg-primary/60" />
                    <div className="w-3 h-[3px] rounded-full bg-primary/60 mx-1" />
                    <div className="w-12 h-[3px] rounded-full bg-primary/60" />
                  </div>
                </div>

                <div className="mt-10 text-center font-extrabold text-gray-900">
                  Test Instruction
                </div>

                <div className="mt-6">
                  <div className="aspect-video rounded-2xl overflow-hidden bg-black">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title="Test instruction video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                </div>

                <div className="mt-10 flex justify-center">
                  <Link
                    href={`/ielts/intensive/${encodeURIComponent(exam.id)}/start`}
                    className="inline-flex items-center justify-center gap-3 bg-primary hover:bg-yellow-400 text-gray-900 font-extrabold uppercase tracking-wide px-10 py-4 rounded-full shadow-[0_10px_22px_rgba(255,198,0,0.20)] transition-all"
                  >
                    Start Test
                    <span className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

