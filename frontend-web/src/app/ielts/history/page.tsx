"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { IeltsSkill } from "@/types";
import { examsApi } from "@/services/exams.api";

import { Headphones, BookOpen, PenTool, Mic, Calendar, Clock, BarChart2, CheckCircle, ChevronRight, TestTube } from "lucide-react";

const SKILLS: Array<{ key: IeltsSkill; label: string; icon: JSX.Element }> = [
  { key: "LISTENING", label: "Listening", icon: <Headphones className="w-4 h-4" /> },
  { key: "READING", label: "Reading", icon: <BookOpen className="w-4 h-4" /> },
  { key: "WRITING", label: "Writing", icon: <PenTool className="w-4 h-4" /> },
  { key: "SPEAKING", label: "Speaking", icon: <Mic className="w-4 h-4" /> },
];


function Breadcrumbs({ current }: { current: string }) {
  const items = useMemo(
    () => [
      { label: "Homepage", href: "/" },
      { label: "IELTS", href: "/ielts" },
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
              <span className="text-primary">{it.label}</span>
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

function toneByBandScore(band: number): { bg: string; text: string; bgLight: string } {
  if (band >= 8.0) return { bg: "bg-success", text: "text-success", bgLight: "bg-success/10" };
  if (band >= 6.5) return { bg: "bg-info", text: "text-info", bgLight: "bg-info/10" };
  if (band >= 5.0) return { bg: "bg-warning", text: "text-warning", bgLight: "bg-warning/10" };
  return { bg: "bg-danger", text: "text-danger", bgLight: "bg-danger/10" };
}

export default function IeltsHistoryPage() {
  const [skill, setSkill] = useState<IeltsSkill>("LISTENING");
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Band Score Calculation
  const getIeltsBand = (score: number) => {
    if (score >= 39) return 9.0;
    if (score >= 37) return 8.5;
    if (score >= 35) return 8.0;
    if (score >= 32) return 7.5;
    if (score >= 30) return 7.0;
    if (score >= 26) return 6.5;
    if (score >= 23) return 6.0;
    if (score >= 18) return 5.5;
    if (score >= 16) return 5.0;
    if (score >= 13) return 4.5;
    if (score >= 10) return 4.0;
    if (score >= 8) return 3.5;
    if (score >= 6) return 3.0;
    if (score >= 4) return 2.5;
    if (score >= 2) return 2.0;
    return 1.0;
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    examsApi.getHistory()
      .then(res => { if (mounted) setHistoryItems(res); })
      .catch(err => console.error("Failed to load history", err))
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const filteredHistory = useMemo(() => {
    return historyItems.filter(h => h.skill === skill).map(h => ({
      ...h,
      bandScore: getIeltsBand(h.rawScore)
    })).sort((a, b) => new Date(b.dateTaken).getTime() - new Date(a.dateTaken).getTime());
  }, [skill, historyItems]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="container mx-auto max-w-screen-xl px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumbs current="Intensive IELTS" />

        <div className="flex gap-4 mt-6">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="top-24 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 space-y-1">
                <Link
                  href="#"
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                    Study Roadmap
                  </div>
                </Link>

                <Link
                  href="/ielts/intensive"
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                    Mock Test
                  </div>
                </Link>

                <Link
                  href="/ielts/history"
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold bg-primary/10 text-primary"
                >
                  <div className="flex items-center gap-3">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Test History
                  </div>
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0 bg-white rounded-2xl shadow-sm overflow-hidden px-8 py-4">
            {/* Tabs */}
            <div className="flex items-center gap-8 mb-8">
              {SKILLS.map((s) => {
                const active = skill === s.key;
                return (
                  <button
                    key={s.key}
                    onClick={() => {
                      setSkill(s.key);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`relative py-4 text-sm font-bold flex items-center gap-2 transition-colors ${active ? "text-gray-900" : "text-gray-400 hover:text-gray-700"
                      }`}
                  >
                    {s.icon}
                    {s.label}
                    <span
                      className={`absolute left-0 -bottom-[1px] h-[3px] rounded-full bg-primary transition-all ${active ? "w-full" : "w-0"
                        }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* History Table */}
            {filteredHistory.length === 0 ? (
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                  <TestTube className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No History Found</h3>
                <p className="text-sm text-gray-500 max-w-[280px]">You haven't completed any {skill.toLowerCase()} tests yet. Head over to the Mock Test tab to get started!</p>
                <Link href="/ielts/intensive" className="mt-6 px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors">
                  Take a Mock Test
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-gray-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 w-10">#</th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">Test Name</th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">Date Taken</th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">Duration</th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">Raw Score</th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">Band Score</th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredHistory.map((item, idx) => {
                      const date = new Date(item.dateTaken);
                      const tone = toneByBandScore(item.bandScore);
                      return (
                        <tr key={item.id} className="group hover:bg-gray-50/70 transition-colors">
                          <td className="px-5 py-4 text-gray-400 font-semibold">{idx + 1}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 ${tone.bgLight} rounded-lg flex items-center justify-center shrink-0`}>
                                <CheckCircle className={`w-4 h-4 ${tone.text}`} />
                              </div>
                              <span className="font-semibold text-gray-900 group-hover:text-primary transition-colors">{item.examTitle}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-gray-500">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              {date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-gray-500">
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              {item.durationMinutes} mins
                            </span>
                          </td>
                          <td className="px-5 py-4 font-semibold text-gray-700">
                            {item.rawScore}<span className="text-gray-400 font-normal">/{item.maxScore}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-extrabold ${tone.bgLight} ${tone.text}`}>
                              {item.bandScore.toFixed(1)}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <Link
                              href={`/ielts/intensive/${encodeURIComponent(item.examId)}/result/${encodeURIComponent(item.id)}`}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                            >
                              Review <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
