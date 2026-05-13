"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { examsApi } from "@/services/exams.api";
import type { ExamDetail } from "@/types";
import { Clock, Headphones, BookOpen, ChevronRight, PlayCircle, Mic, User } from "lucide-react";

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

function getSpeakingExaminer(exam: ExamDetail | null): { name: string; role: string; avatarUrl?: string; initials: string } | null {
  const examiner = (exam as any)?.questions?.ieltsIntensiveExaminer;
  if (!examiner) return null;
  const parts = (examiner.name as string).split(" ");
  const initials = parts.map((p: string) => p[0]).join("").toUpperCase().slice(0, 2);
  return { ...examiner, initials };
}

function countSpeakingQuestions(exam: ExamDetail | null): number {
  const parts = (exam as any)?.questions?.parts ?? [];
  return parts.reduce((acc: number, p: any) => {
    if (p.questions) return acc + p.questions.length;
    return acc + 1; // Part 2 cue card counts as 1
  }, 0);
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

  const examType = (exam as any)?.type?.toUpperCase() ?? "";
  const isSpeaking = examType === "SPEAKING";

  const videoId = useMemo(() => {
    if (examType === "READING") return extractYouTubeId("https://youtu.be/zectOHoEduM");
    if (examType === "WRITING") return extractYouTubeId("https://youtu.be/ZU7RjBvAj2E");
    if (examType === "SPEAKING") return "";
    return extractYouTubeId("https://youtu.be/UFjDeMuyPMs");
  }, [examType]);

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
  const examiner = isSpeaking ? getSpeakingExaminer(exam) : null;
  const speakingQuestionCount = isSpeaking ? countSpeakingQuestions(exam) : 0;

  return (
    <div className="bg-gray-50 flex items-center justify-center px-4">
      {loading ? (
        <SkeletonCard />
      ) : error ? (
        <div className="bg-white text-red-600 border border-gray-200 rounded-2xl p-6 max-w-lg w-full text-center">
          {error}
        </div>
      ) : !exam ? (
        <div className="bg-white text-gray-700 border border-gray-200 rounded-2xl p-6 max-w-lg w-full text-center">
          Exam not found.
        </div>
      ) : (
        <div className="w-full max-w-4xl relative py-10">

          {/* Back icon */}
          <div className="mb-4 absolute top-8 left-0">
            <Link
              href="/ielts/intensive"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-400 transition-all shadow-sm"
              title="Back to all tests"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-gray-900 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase mb-5">
              <BookOpen className="w-3.5 h-3.5 text-primary" />
              Cambridge IELTS
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
              {groupTitle}
            </h1>
            {testTitle && (
              <div className="mt-2 text-xl font-semibold text-gray-500">
                {testTitle}
              </div>
            )}
            <div className="flex items-center justify-center gap-1.5 mt-6">
              <div className="h-[3px] w-10 rounded-full bg-primary" />
              <div className="h-[3px] w-3 rounded-full bg-gray-300" />
              <div className="h-[3px] w-3 rounded-full bg-gray-200" />
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-[0_8px_40px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">

              {/* LEFT — exam details */}
              <div className="p-8 flex flex-col gap-6 border-b lg:border-b-0 lg:border-r border-gray-200">
                <div className="text-xs font-black uppercase tracking-widest text-gray-400">Exam Details</div>

                <div className="space-y-3">
                  {/* Duration */}
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-200">
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Duration</div>
                      <div className="text-base font-extrabold text-gray-900">{exam.duration} minutes</div>
                    </div>
                  </div>

                  {/* Skill */}
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-200">
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center shrink-0">
                      {examType === "READING" ? (
                        <BookOpen className="w-5 h-5 text-primary" />
                      ) : examType === "WRITING" ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-primary">
                          <path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /><path d="M2 2l5 5" /><path d="M9.5 14.5L16 8" />
                        </svg>
                      ) : examType === "SPEAKING" ? (
                        <Mic className="w-5 h-5 text-primary" />
                      ) : (
                        <Headphones className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Skill</div>
                      <div className="text-base font-extrabold text-gray-900 capitalize">
                        {(exam as any).type?.toLowerCase() ?? "Listening"}
                      </div>
                    </div>
                  </div>

                  {/* Questions / Parts */}
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-200">
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        {isSpeaking ? "Structure" : examType === "WRITING" ? "Tasks" : "Questions"}
                      </div>
                      <div className="text-base font-extrabold text-gray-900">
                        {isSpeaking
                          ? `3 Parts · ${speakingQuestionCount} questions`
                          : examType === "WRITING"
                          ? "2 tasks"
                          : "40 questions"}
                      </div>
                    </div>
                  </div>

                  {/* Notice */}
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-gray-600 text-sm font-medium leading-relaxed">
                    {isSpeaking
                      ? "Make sure your microphone is connected and allowed. Speak clearly and at a natural pace."
                      : examType === "LISTENING"
                      ? "Make sure your headphones or speakers are on. Audio will play automatically when you start."
                      : "Ensure you have a quiet environment and are ready to focus for the duration of the test."}
                  </div>
                </div>
              </div>

              {/* RIGHT — examiner card (Speaking) or YouTube (others) */}
              <div className="p-8 flex flex-col gap-4">

                {isSpeaking && examiner ? (
                  <>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-black uppercase tracking-widest text-gray-400">Your Examiner</span>
                    </div>

                    {/* Examiner card */}
                    <div className="flex-1 flex flex-col items-center justify-center gap-6 rounded-2xl bg-gray-50 border border-gray-200 p-8">
                      {/* Avatar */}
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                          {examiner.avatarUrl ? (
                            <img
                              src={examiner.avatarUrl}
                              alt={examiner.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl font-black text-gray-700">{examiner.initials}</span>
                          )}
                        </div>
                        {/* Online indicator */}
                        <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow" />
                      </div>

                      <div className="text-center">
                        <div className="text-xl font-black text-gray-900">{examiner.name}</div>
                        <div className="text-sm text-gray-500 font-medium mt-0.5">{examiner.role}</div>
                      </div>

                      {/* Speaking format info */}
                      <div className="w-full space-y-2">
                        {[
                          { part: "Part 1", desc: "Introduction & Interview", time: "4–5 min" },
                          { part: "Part 2", desc: "Individual Long Turn", time: "3–4 min" },
                          { part: "Part 3", desc: "Two-way Discussion", time: "4–5 min" },
                        ].map(({ part, desc, time }) => (
                          <div key={part} className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm">
                            <div>
                              <span className="font-bold text-gray-800">{part}</span>
                              <span className="text-gray-400 ml-2">{desc}</span>
                            </div>
                            <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{time}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-3 flex-wrap">
                      {["3 Parts", `${speakingQuestionCount} Questions`, "Face-to-Face"].map(label => (
                        <span key={label} className="text-[11px] font-semibold px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                          {label}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <PlayCircle className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-black uppercase tracking-widest text-gray-400">Test Instructions</span>
                    </div>

                    <div className="rounded-2xl overflow-hidden bg-black aspect-video ring-1 ring-gray-200 shadow-md">
                      <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title="Test instruction video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>

                    <p className="text-xs text-gray-400 leading-relaxed text-center">
                      Watch the full tutorial before attempting the test to familiarise yourself with the format and interface.
                    </p>

                    <div className="flex items-center justify-center gap-3 flex-wrap">
                      {(examType === "WRITING"
                        ? ["2 Tasks", "60 Minutes", "Computer Based"]
                        : examType === "READING"
                        ? ["3 Sections", "40 Questions", "Computer Based"]
                        : ["4 Sections", "40 Questions", "Computer Based"]
                      ).map(label => (
                        <span key={label} className="text-[11px] font-semibold px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                          {label}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>

            </div>
          </div>

          {/* CTA */}
          <div className="mt-6 flex justify-center">
            <Link
              href={`/ielts/intensive/${encodeURIComponent(exam.id)}/start${isSpeaking ? '?type=SPEAKING' : ''}`}
              className="group flex items-center justify-between bg-primary hover:brightness-105 px-6 py-4 rounded-full transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-[1px] w-full max-w-60"
            >
              <span className="text-[14px] font-black uppercase text-gray-900 pl-1">Start Test</span>
              <span className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-white stroke-[2.5]" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

