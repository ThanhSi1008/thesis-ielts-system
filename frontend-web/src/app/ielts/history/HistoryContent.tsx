"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { IeltsBasicSkill } from "@/types";
import { examsApi } from "@/services/exams.api";
import ConfirmModal from "@/components/ConfirmModal";

import {
  Headphones, BookOpen, PenTool, Mic,
  Calendar, Clock, CheckCircle, ChevronRight, TestTube,
  Search, X, Trash2, Dumbbell,
} from "lucide-react";

const SKILLS: Array<{ key: IeltsBasicSkill; label: string; icon: JSX.Element }> = [
  { key: "LISTENING", label: "Listening", icon: <Headphones className="w-4 h-4" /> },
  { key: "READING", label: "Reading", icon: <BookOpen className="w-4 h-4" /> },
  { key: "WRITING", label: "Writing", icon: <PenTool className="w-4 h-4" /> },
  { key: "SPEAKING", label: "Speaking", icon: <Mic className="w-4 h-4" /> },
];

type SortOrder = "newest" | "oldest" | "score-desc" | "score-asc";

function toneByBandScore(band: number): { bg: string; text: string; bgLight: string } {
  if (band >= 8.0) return { bg: "bg-success dark:bg-green-600", text: "text-success dark:text-green-400", bgLight: "bg-success/10 dark:bg-green-900/20" };
  if (band >= 6.5) return { bg: "bg-info dark:bg-blue-600", text: "text-info dark:text-blue-400", bgLight: "bg-info/10 dark:bg-blue-900/20" };
  if (band >= 5.0) return { bg: "bg-warning dark:bg-amber-600", text: "text-warning dark:text-amber-400", bgLight: "bg-warning/10 dark:bg-amber-900/20" };
  return { bg: "bg-danger dark:bg-red-600", text: "text-danger dark:text-red-400", bgLight: "bg-danger/10 dark:bg-red-900/20" };
}

function toneByPracticeScore(score: number, max: number): { bgLight: string; text: string } {
  const pct = max > 0 ? score / max : 0;
  if (pct >= 0.8) return { bgLight: "bg-green-50 dark:bg-green-900/20", text: "text-green-600 dark:text-green-500" };
  if (pct >= 0.5) return { bgLight: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-600 dark:text-amber-500" };
  return { bgLight: "bg-red-50 dark:bg-red-900/20", text: "text-red-600 dark:text-red-500" };
}

function HistoryContentInner({ embedded }: { embedded?: boolean }) {
  const searchParams = useSearchParams();
  const mode = (searchParams?.get("mode") === "practice" ? "practice" : "mock") as "mock" | "practice";

  const [skill, setSkill] = useState<IeltsBasicSkill>("LISTENING");
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOrder>("newest");
  const [activePart, setActivePart] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [mockTestOpen, setMockTestOpen] = useState(true);
  const [testHistoryOpen, setTestHistoryOpen] = useState(true);

  const handleDelete = async () => {
    if (!pendingDeleteId) return;
    setDeletingId(pendingDeleteId);
    try {
      await examsApi.deleteSession(pendingDeleteId);
      setHistoryItems(prev => prev.filter(item => item.id !== pendingDeleteId));
    } catch (err) {
      alert("Failed to delete the test ieltsIntensiveResult. Please try again.");
    } finally {
      setDeletingId(null);
      setPendingDeleteId(null);
    }
  };

  const getIeltsBand = (score: number) => {
    if (score >= 39) return 9.0; if (score >= 37) return 8.5; if (score >= 35) return 8.0;
    if (score >= 32) return 7.5; if (score >= 30) return 7.0; if (score >= 26) return 6.5;
    if (score >= 23) return 6.0; if (score >= 18) return 5.5; if (score >= 16) return 5.0;
    if (score >= 13) return 4.5; if (score >= 10) return 4.0; if (score >= 8) return 3.5;
    if (score >= 6) return 3.0; if (score >= 4) return 2.5; if (score >= 2) return 2.0;
    return 1.0;
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    examsApi.getHistory()
      .then(res => { if (mounted) setHistoryItems(Array.isArray(res) ? res : (res as any)?.history || (res as any)?.data || []); })
      .catch(err => console.error("Failed to load history", err))
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const isWritingOrSpeaking = skill === "WRITING" || skill === "SPEAKING";

  const filteredMockHistory = useMemo(() => {
    const q = search.trim().toLowerCase();
    const safeHistory = Array.isArray(historyItems) ? historyItems : (historyItems as any)?.history || (historyItems as any)?.data || [];
    return safeHistory
      .filter((h: any) => h.skill === skill && !h.practicePart)
      .map((h: any) => {
        let band = getIeltsBand(h.rawScore);
        if (h.skill === "WRITING" || h.skill === "SPEAKING") band = h.writingScore ?? h.rawScore;
        return { ...h, bandScore: band };
      })
      .filter((h: any) => !q || h.examTitle?.toLowerCase().includes(q))
      .sort((a: any, b: any) => {
        if (sort === "newest") return new Date(b.dateTaken).getTime() - new Date(a.dateTaken).getTime();
        if (sort === "oldest") return new Date(a.dateTaken).getTime() - new Date(b.dateTaken).getTime();
        if (sort === "score-desc") return b.bandScore - a.bandScore;
        if (sort === "score-asc") return a.bandScore - b.bandScore;
        return 0;
      });
  }, [skill, historyItems, search, sort]);

  const filteredPracticeHistory = useMemo(() => {
    const q = search.trim().toLowerCase();
    const safeHistory = Array.isArray(historyItems) ? historyItems : (historyItems as any)?.history || (historyItems as any)?.data || [];
    return safeHistory
      .filter((h: any) => h.skill === skill && !!h.practicePart)
      .filter((h: any) => activePart === null || h.practicePart === activePart)
      .filter((h: any) => !q || h.examTitle?.toLowerCase().includes(q))
      .sort((a: any, b: any) => {
        if (sort === "newest") return new Date(b.dateTaken).getTime() - new Date(a.dateTaken).getTime();
        if (sort === "oldest") return new Date(a.dateTaken).getTime() - new Date(b.dateTaken).getTime();
        if (sort === "score-desc") return b.rawScore - a.rawScore;
        if (sort === "score-asc") return a.rawScore - b.rawScore;
        return 0;
      });
  }, [skill, historyItems, search, sort, activePart]);

  const currentList = mode === "mock" ? filteredMockHistory : filteredPracticeHistory;
  const mockActive = mode === "mock";
  const practiceActive = mode === "practice";

  const mainContent = (
    <main className={`flex-1 min-w-0 bg-white dark:bg-slate-950 overflow-y-auto flex flex-col px-3 md:px-6 py-2 ${embedded ? 'h-full' : ''}`}>
      {/* Skill Tabs */}
      <div className="flex items-center gap-4 md:gap-8 mb-6 overflow-x-auto">
        {SKILLS.map((s) => {
          const active = skill === s.key;
          return (
            <button
              key={s.key}
              onClick={() => { setSkill(s.key); setSearch(""); setActivePart(null); }}
              className={`whitespace-nowrap relative py-4 text-sm font-bold flex items-center gap-2 transition-colors ${active ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300"}`}
            >
              {s.icon}
              {s.label}
              <span className={`absolute left-0 -bottom-[1px] h-[3px] rounded-full bg-primary transition-all ${active ? "w-full" : "w-0"}`} />
            </button>
          );
        })}
      </div>

      {/* Part Filter Pills — practice mode only */}
      {mode === "practice" && (
        <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2">
          {[null, 1, 2, 3, 4].map((part) => {
            const partLabels: Record<number, string> = {
              1: skill === "LISTENING" ? "Basic Conversation" : skill === "READING" ? "Passage 1" : "Task 1",
              2: skill === "LISTENING" ? "Short Monologue" : skill === "READING" ? "Passage 2" : "Task 2",
              3: skill === "LISTENING" ? "Academic Discussion" : skill === "READING" ? "Passage 3" : "Part 3",
              4: skill === "LISTENING" ? "Academic Lecture" : skill === "READING" ? "Passage 4" : "Part 4",
            };
            const isActive = activePart === part;
            return (
              <button
                key={part ?? "all"}
                onClick={() => setActivePart(part)}
                className={`shrink-0 flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-2xl border transition-all ${
                  isActive
                    ? "bg-white dark:bg-slate-800 border-primary shadow-sm text-primary font-bold"
                    : "bg-gray-50/50 dark:bg-slate-900/50 border-gray-100 dark:border-slate-800 text-gray-500 dark:text-slate-400 font-semibold hover:bg-gray-50 dark:hover:bg-slate-800"
                }`}
              >
                <svg viewBox="0 0 24 24" className={`w-4 h-4 ${isActive ? "text-primary" : "text-gray-400 dark:text-slate-500"}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                <div className="flex flex-col items-start gap-0">
                  <span className="text-sm leading-tight">{part === null ? "All Parts" : `Part ${part}`}</span>
                  {part !== null && (
                    <span className="text-[10px] opacity-70 font-medium leading-tight">{partLabels[part]}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by test name…"
            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 text-sm text-gray-800 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOrder)}
          className="shrink-0 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 text-sm font-semibold text-gray-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition cursor-pointer"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="score-desc">Score ↓ high–low</option>
          <option value="score-asc">Score ↑ low–high</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-14 bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
        </div>
      ) : currentList.length === 0 ? (
        <div className="bg-gray-50/50 dark:bg-slate-900/50 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm mb-4">
            <TestTube className="w-8 h-8 text-gray-300 dark:text-slate-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {search.trim() !== "" ? "No matching results" : "No History Found"}
          </h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 max-w-[280px]">
            {search.trim() !== ""
              ? "Try adjusting your search."
              : mode === "mock"
                ? `You haven't completed any ${skill.toLowerCase()} mock tests yet.`
                : `You haven't completed any ${skill.toLowerCase()} practice sessions yet.`}
          </p>
          {search.trim() === "" && (
            <Link
              href={mode === "mock" ? "/ielts/intensive" : "/ielts/intensive?view=practice"}
              className="mt-6 px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
            >
              {mode === "mock" ? "Take a Mock Test" : "Start Practicing"}
            </Link>
          )}
        </div>
      ) : mode === "mock" ? (
        /* ── Mock Test Table ── */
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 w-10">#</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">Test Name</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">Date Taken</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">Time Taken</th>
                {!isWritingOrSpeaking && <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">Raw Score</th>}
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">Band Score</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
              {filteredMockHistory.map((item: any, idx: number) => {
                const date = new Date(item.dateTaken);
                const tone = toneByBandScore(item.bandScore);
                return (
                  <tr key={item.id} className="group hover:bg-gray-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-4 text-gray-400 dark:text-slate-500 font-semibold">{idx + 1}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 ${tone.bgLight} rounded-lg flex items-center justify-center shrink-0`}><CheckCircle className={`w-4 h-4 ${tone.text}`} /></div>
                        <span className="font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{item.examTitle}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-slate-400 whitespace-nowrap">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />{date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-slate-400 whitespace-nowrap">
                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
                        {item.timeTaken != null ? (() => { const m = Math.floor(item.timeTaken / 60); const s = item.timeTaken % 60; return m > 0 ? `${m}m ${s}s` : `${s}s`; })() : <span className="text-gray-300 dark:text-slate-600">—</span>}
                      </span>
                    </td>
                    {!isWritingOrSpeaking && <td className="px-5 py-4 font-semibold text-gray-700 dark:text-slate-300">{item.rawScore}<span className="text-gray-400 dark:text-slate-500 font-normal">/{item.maxScore}</span></td>}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-extrabold ${tone.bgLight} ${tone.text}`}>{item.bandScore.toFixed(1)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <Link href={`/ielts/intensive/${encodeURIComponent(item.examId)}/ieltsIntensiveResult/${encodeURIComponent(item.id)}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
                          Review <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                        <button onClick={() => setPendingDeleteId(item.id)} disabled={deletingId === item.id} className="text-gray-400 dark:text-slate-500 hover:text-red-500 transition-colors disabled:opacity-50" title="Delete ieltsIntensiveResult"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* ── Practice History Table ── */
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 w-10">#</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">Test Name</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">Part</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">Date Taken</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">Time Taken</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">Score</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
              {filteredPracticeHistory.map((item: any, idx: number) => {
                const date = new Date(item.dateTaken);
                const partMax = 10;
                const tone = toneByPracticeScore(item.rawScore, partMax);
                const pct = Math.round((item.rawScore / partMax) * 100);
                return (
                  <tr key={item.id} className="group hover:bg-gray-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-4 text-gray-400 dark:text-slate-500 font-semibold">{idx + 1}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 ${tone.bgLight} rounded-lg flex items-center justify-center shrink-0`}><Dumbbell className={`w-4 h-4 ${tone.text}`} /></div>
                        <span className="font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{item.examTitle}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 text-xs font-bold">Part {item.practicePart}</span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-slate-400 whitespace-nowrap">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />{date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-slate-400 whitespace-nowrap">
                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
                        {item.timeTaken != null ? (() => { const m = Math.floor(item.timeTaken / 60); const s = item.timeTaken % 60; return m > 0 ? `${m}m ${s}s` : `${s}s`; })() : <span className="text-gray-300 dark:text-slate-600">—</span>}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`font-extrabold text-sm ${tone.text}`}>{item.rawScore}/{partMax}</span>
                        <div className="w-16 h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${pct >= 80 ? "bg-green-400" : pct >= 50 ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <Link href={`/ielts/intensive/${encodeURIComponent(item.examId)}/ieltsIntensiveResult/${encodeURIComponent(item.id)}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
                          Review <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                        <button onClick={() => setPendingDeleteId(item.id)} disabled={deletingId === item.id} className="text-gray-400 dark:text-slate-500 hover:text-red-500 transition-colors disabled:opacity-50" title="Delete ieltsIntensiveResult"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        isOpen={!!pendingDeleteId}
        title="Delete Test IeltsIntensiveResult"
        message="Are you sure you want to delete this test ieltsIntensiveResult? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive
        onConfirm={handleDelete}
        onClose={() => setPendingDeleteId(null)}
      />
    </main>
  );

  if (embedded) {
    return mainContent;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans">
      <div className="container mx-auto max-w-screen-xl px-2 py-2">
        <div className="flex gap-4 mt-2">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="h-full bg-white dark:bg-slate-950 overflow-hidden">
              <div className="p-4 space-y-1">
                {/* Dashboard */}
                <Link href="/ielts/intensive?view=dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-900 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 opacity-70" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                  Dashboard
                </Link>

                {/* Mock Test accordion */}
                <div className="space-y-0.5">
                  <button
                    onClick={() => setMockTestOpen(o => !o)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-900 transition-colors"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 opacity-70" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                    Mock Test
                    <svg viewBox="0 0 24 24" className={`w-4 h-4 shrink-0 ml-auto text-gray-400 dark:text-slate-500 transition-transform duration-200 ${mockTestOpen ? "" : "-rotate-90"}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                  </button>

                  {mockTestOpen && (
                    <div className="pl-3 space-y-0.5 ml-6">
                      <Link href="/ielts/intensive?view=practice" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-900 hover:text-gray-800 dark:hover:text-slate-200 transition-colors">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                        Per Part
                      </Link>

                      <Link href="/ielts/intensive" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-900 hover:text-gray-800 dark:hover:text-slate-200 transition-colors">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 10h12M4 14h8"/></svg>
                        Part Skill
                      </Link>

                      <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-300 dark:text-slate-600 cursor-not-allowed select-none">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                        Per Test
                        <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 uppercase tracking-wide">Soon</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Test History accordion */}
                <div className="space-y-0.5 pt-2">
                  <button
                    onClick={() => setTestHistoryOpen(o => !o)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-900 transition-colors"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="9"/></svg>
                    Test History
                    <svg viewBox="0 0 24 24" className={`w-4 h-4 shrink-0 ml-auto text-gray-400 dark:text-slate-500 transition-transform duration-200 ${testHistoryOpen ? "" : "-rotate-90"}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                  </button>

                  {testHistoryOpen && (
                    <div className="pl-3 space-y-0.5 ml-6">
                      <Link
                        href="/ielts/history?mode=practice"
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${practiceActive ? "font-bold bg-primary/10 text-primary" : "font-semibold text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-900 hover:text-gray-800 dark:hover:text-slate-200"}`}
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                        Per Part
                      </Link>

                      <Link
                        href="/ielts/history?mode=mock"
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${mockActive ? "font-bold bg-primary/10 text-primary" : "font-semibold text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-900 hover:text-gray-800 dark:hover:text-slate-200"}`}
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 10h12M4 14h8"/></svg>
                        Part Skill
                      </Link>

                      <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-300 dark:text-slate-600 cursor-not-allowed select-none">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                        Per Test
                        <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 uppercase tracking-wide">Soon</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Student/Teacher */}
                <div className="pt-2">
                  <Link
                    href="/ielts/student-teacher"
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-900 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    Student/Teacher
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          {mainContent}
        </div>
      </div>
    </div>
  );
}

export default function HistoryContent({ embedded }: { embedded?: boolean }) {
  return (
    <Suspense fallback={<div className="h-full flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
      <HistoryContentInner embedded={embedded} />
    </Suspense>
  );
}
