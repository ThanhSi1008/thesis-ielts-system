"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { examsApi } from "@/services/exams.api";
import type { ExamDetail } from "@/types";
import { Clock, Headphones, BookOpen, ChevronRight, PlayCircle } from "lucide-react";

function extractYouTubeId(input: string) {
  const raw = input.trim();
  if (/^[a-zA-Z0-9_-]{6,}$/.test(raw) && !raw.includes("http")) return raw;
  try {
    const u = new URL(raw);
    if (u.hostname.includes("youtu.be")) return u.pathname.replace("/", "");
    if (u.hostname.includes("youtube.com")) return u.searchParams.get("v") || "";
  } catch { /* ignore */ }
  return "";
}

function splitExamTitle(title: string) {
  const parts = title.split(" - ");
  if (parts.length >= 2) {
    return { groupTitle: parts[0].trim(), testTitle: parts.slice(1).join(" - ").trim() };
  }
  return { groupTitle: title, testTitle: "" };
}

function SkeletonCard() {
  return (
    <div className="animate-pulse w-full max-w-4xl mx-auto">
      <div className="h-10 w-72 bg-gray-200 rounded-xl mx-auto mb-4" />
      <div className="h-6 w-48 bg-gray-200 rounded-lg mx-auto mb-10" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-14 bg-gray-200 rounded-2xl" />)}
        </div>
        <div className="aspect-video bg-gray-200 rounded-2xl" />
      </div>
    </div>
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
    examsApi.getExam(examId)
      .then((res) => { if (mounted) setExam(res); })
      .catch((e: any) => { if (mounted) { setError(e?.message || "Failed to load exam"); setExam(null); } })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [examId]);

  const title = exam?.title || "Loading...";
  const { groupTitle, testTitle } = splitExamTitle(title);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      {loading ? (
        <SkeletonCard />
      ) : error ? (
        <div className="bg-red-50 text-red-700 border border-red-100 rounded-2xl p-6 max-w-lg w-full text-center">
          {error}
        </div>
      ) : !exam ? (
        <div className="bg-amber-50 text-amber-800 border border-amber-100 rounded-2xl p-6 max-w-lg w-full text-center">
          Exam not found.
        </div>
      ) : (
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-10">
            {/* Book badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase mb-5 border border-primary/20">
              <BookOpen className="w-3.5 h-3.5" />
              Cambridge IELTS
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
              {groupTitle}
            </h1>

            {testTitle && (
              <div className="mt-2 text-xl font-bold text-gray-500">
                {testTitle}
              </div>
            )}

            {/* Decorative rule */}
            <div className="flex items-center justify-center gap-1.5 mt-6">
              <div className="h-[3px] w-10 rounded-full bg-primary" />
              <div className="h-[3px] w-3 rounded-full bg-primary/50" />
              <div className="h-[3px] w-3 rounded-full bg-primary/30" />
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_40px_rgba(0,0,0,0.07)] overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">

              {/* LEFT — test info + CTA */}
              <div className="px-8 py-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-gray-100">
                <div>
                  <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-5">Exam Details</div>

                  <div className="space-y-4">
                    {/* Duration */}
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Duration</div>
                        <div className="text-base font-extrabold text-gray-800">{exam.duration} minutes</div>
                      </div>
                    </div>

                    {/* Type */}
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                        <Headphones className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Skill</div>
                        <div className="text-base font-extrabold text-gray-800 capitalize">
                          {(exam as any).type?.toLowerCase() ?? "Listening"}
                        </div>
                      </div>
                    </div>

                    {/* Questions */}
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Questions</div>
                        <div className="text-base font-extrabold text-gray-800">40 questions</div>
                      </div>
                    </div>

                    {/* Notice */}
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-800 text-sm font-medium leading-relaxed">
                      Make sure your headphones or speakers are on. Audio will play automatically when you start.
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-8">
                  <Link
                    href={`/ielts/intensive/${encodeURIComponent(exam.id)}/start`}
                    className="group w-full flex items-center justify-between bg-gray-900 hover:bg-black text-white font-extrabold px-6 py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-[1px]"
                  >
                    <span className="text-base tracking-wide">Start Test</span>
                    <span className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_4px_14px_rgba(255,198,0,0.4)]">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-gray-900"><path d="M8 5v14l11-7z" /></svg>
                    </span>
                  </Link>

                  <Link
                    href="/ielts/intensive"
                    className="mt-3 flex items-center justify-center gap-1 text-sm text-gray-400 hover:text-gray-700 transition-colors font-semibold"
                  >
                    <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                    Back to all tests
                  </Link>
                </div>
              </div>

              {/* RIGHT — video */}
              <div className="p-8 flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <PlayCircle className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-black uppercase tracking-widest text-gray-400">Test Instructions</span>
                </div>

                <div className="rounded-2xl overflow-hidden bg-black aspect-video ring-1 ring-black/10 shadow-lg">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title="Test instruction video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>

                <p className="mt-4 text-xs text-gray-400 leading-relaxed text-center">
                  Watch the full tutorial before attempting the test to familiarise yourself with the format and interface.
                </p>

                {/* Decorative bottom stat pills */}
                <div className="mt-auto pt-6 flex items-center justify-center gap-3 flex-wrap">
                  {[
                    { label: "4 Sections", color: "bg-blue-50 text-blue-600" },
                    { label: "40 Questions", color: "bg-purple-50 text-purple-600" },
                    { label: "Computer Based", color: "bg-green-50 text-green-700" },
                  ].map(p => (
                    <span key={p.label} className={`text-[11px] font-bold px-3 py-1.5 rounded-full ${p.color}`}>
                      {p.label}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
