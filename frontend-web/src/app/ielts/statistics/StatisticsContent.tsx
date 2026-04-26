"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, Target, Clock, Zap, Activity, BookOpen, PenTool, Headphones, Mic, Eye, LayoutList, ChevronRight, Calendar, Pencil, CheckCircle, TestTube, GraduationCap, ChevronLeft } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { examsApi } from "@/services/exams.api";
import { API_BASE_URL } from "@/constants";

function getIeltsBandFromScore(score: number): number {
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
}

function getIeltsReadingBand(score: number): number {
  if (score >= 39) return 9.0;
  if (score >= 37) return 8.5;
  if (score >= 35) return 8.0;
  if (score >= 33) return 7.5;
  if (score >= 30) return 7.0;
  if (score >= 27) return 6.5;
  if (score >= 23) return 6.0;
  if (score >= 19) return 5.5;
  if (score >= 15) return 5.0;
  if (score >= 13) return 4.5;
  if (score >= 10) return 4.0;
  if (score >= 8) return 3.5;
  if (score >= 6) return 3.0;
  if (score >= 4) return 2.5;
  if (score >= 2) return 2.0;
  return 1.0;
}

function BandScoreChart({ points, label }: { points: { date: string; band: number; title: string }[], label: string }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const W = 600; const H = 180; const PAD = { top: 24, right: 24, bottom: 36, left: 44 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const minBand = 1.0; const maxBand = 9.0;

  const xs = points.map((_, i) => PAD.left + (i / Math.max(points.length - 1, 1)) * chartW);
  const ys = points.map(p => PAD.top + chartH - ((p.band - minBand) / (maxBand - minBand)) * chartH);

  const pathD = points.map((_, i) => `${i === 0 ? 'M' : 'L'}${xs[i]},${ys[i]}`).join(' ');
  const areaD = `${pathD} L${xs[xs.length - 1]},${PAD.top + chartH} L${xs[0]},${PAD.top + chartH} Z`;

  const latestBand = points[points.length - 1]?.band ?? 0;
  const strokeColor = latestBand >= 7.0 ? '#22c55e' : latestBand >= 5.5 ? '#3b82f6' : '#f59e0b';
  const gradId = `band-grad-${label}`;

  const yLabels = [2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="font-semibold text-slate-900 text-sm">{label} Progress</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Band score over your last {points.length} attempt{points.length !== 1 ? 's' : ''}</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold" style={{ color: strokeColor }}>{latestBand.toFixed(1)}</div>
          <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">Latest band</div>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 160 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.18" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y axis lines + labels */}
        {yLabels.map(b => {
          const y = PAD.top + chartH - ((b - minBand) / (maxBand - minBand)) * chartH;
          return (
            <g key={b}>
              <line x1={PAD.left} y1={y} x2={PAD.left + chartW} y2={y} stroke="#f0f0f0" strokeWidth="1" />
              <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#b0b0b0" fontWeight="600">{b}</text>
            </g>
          );
        })}

        {/* Area fill */}
        {points.length > 1 && <path d={areaD} fill={`url(#${gradId})`} />}

        {/* Line */}
        {points.length > 1 && (
          <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        )}

        {/* X axis labels */}
        {points.map((p, i) => (
          <text key={i} x={xs[i]} y={H - 6} textAnchor="middle" fontSize="9" fill="#b0b0b0" fontWeight="500">
            {new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </text>
        ))}

        {/* Dots + hover */}
        {points.map((p, i) => (
          <g key={i} style={{ cursor: 'default' }}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <circle cx={xs[i]} cy={ys[i]} r={hoveredIdx === i ? 7 : 5} fill="white" stroke={strokeColor} strokeWidth={hoveredIdx === i ? 2.5 : 2} />
            {hoveredIdx === i && (
              <g>
                <rect x={xs[i] - 68} y={ys[i] - 44} width={136} height={38} rx={6} fill="#1a1a1a" opacity={0.92} />
                <text x={xs[i]} y={ys[i] - 26} textAnchor="middle" fontSize="11" fill="white" fontWeight="700">Band {p.band.toFixed(1)}</text>
                <text x={xs[i]} y={ys[i] - 13} textAnchor="middle" fontSize="9.5" fill="#aaaaaa">{p.title}</text>
              </g>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function StatisticsContent({ embedded, hideCharts, hideSummary, studentId }: { embedded?: boolean, hideCharts?: boolean, hideSummary?: boolean, studentId?: string }) {
  const [profile, setProfile] = useState<any>(null);
  const [historyPoints, setHistoryPoints] = useState<{ date: string; band: number; title: string }[]>([]);
  const [readingPoints, setReadingPoints] = useState<{ date: string; band: number; title: string }[]>([]);
  const [writingPoints, setWritingPoints] = useState<{ date: string; band: number; title: string }[]>([]);
  const [speakingPoints, setSpeakingPoints] = useState<{ date: string; band: number; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState<{ currentStreak: number; longestStreak: number } | null>(null);
  const [mockHistory, setMockHistory] = useState<any[]>([]);
  const [practiceHistory, setPracticeHistory] = useState<any[]>([]);
  const [historyTab, setHistoryTab] = useState('ALL');
  const [examDate, setExamDate] = useState<string | null>(null);
  const [isEditingExamDate, setIsEditingExamDate] = useState(false);
  const [volumeTab, setVolumeTab] = useState('LISTENING');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ── TEACHER MODE: single API call for student data ──
        if (studentId) {
          const token = localStorage.getItem("accessToken");
          const res = await fetch(`${API_BASE_URL}/users/student/${studentId}/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error("Failed to load student stats");
          const data = await res.json();

          setProfile(data.profile);
          setExamDate(data.profile?.examDate ?? null);
          setStreak(data.streak ?? { currentStreak: 0, longestStreak: 0 });

          const mockItems: any[] = Array.isArray(data.mockHistory) ? data.mockHistory : (data.mockHistory as any)?.history || (data.mockHistory as any)?.data || [];
          setMockHistory(mockItems);

          const listPractice = (data.advancedListeningHistory || []).map((h: any) => ({
            ...h,
            skill: 'LISTENING',
            examTitle: h.examTitle || h.part?.title || 'Listening Practice',
            dateTaken: h.createdAt,
            practicePart: true,
            maxScore: h.totalQuestions,
            rawScore: h.totalScore,
            examId: h.partId,
          }));
          const readPractice = (data.advancedReadingHistory || []).map((h: any) => ({
            ...h,
            skill: 'READING',
            examTitle: h.examTitle || h.part?.title || 'Reading Practice',
            dateTaken: h.createdAt,
            practicePart: true,
            maxScore: h.totalQuestions,
            rawScore: h.totalScore,
            examId: h.partId,
          }));
          const combinedPractice = [...listPractice, ...readPractice].sort(
            (a, b) => new Date(b.dateTaken).getTime() - new Date(a.dateTaken).getTime()
          );
          setPracticeHistory(combinedPractice);

          const toPoints = (skill: string) =>
            mockItems
              .filter((h: any) => h.skill === skill)
              .sort((a: any, b: any) => new Date(a.dateTaken).getTime() - new Date(b.dateTaken).getTime())
              .slice(-10)
              .map((h: any) => {
                let band = 1.0;
                if (skill === "WRITING" || skill === "SPEAKING") {
                  band = h.writingScore ?? h.rawScore ?? 0;
                } else if (skill === "READING") {
                  band = getIeltsReadingBand(h.rawScore);
                } else {
                  band = getIeltsBandFromScore(h.rawScore);
                }
                return { date: h.dateTaken, band, title: h.examTitle?.split(" - ")[1] ?? h.examTitle };
              });
          setHistoryPoints(toPoints("LISTENING"));
          setReadingPoints(toPoints("READING"));
          setWritingPoints(toPoints("WRITING"));
          setSpeakingPoints(toPoints("SPEAKING"));
          return;
        }

        // ── SELF MODE: fetch from personal endpoints ──
        if (!hideSummary) {
          const [profileRes, streakRes] = await Promise.all([
            api.get("/ielts/profile"),
            api.get("/ielts/streak").catch(() => ({ data: { currentStreak: 0, longestStreak: 0 } }))
          ]);
          setProfile(profileRes.data);
          setExamDate((profileRes.data as any).examDate);
          setStreak(streakRes.data as { currentStreak: number; longestStreak: number });
        }

        if (!hideCharts) {
          const [mockItemsRaw, advListRes, advReadRes] = await Promise.all([
            examsApi.getHistory(),
            api.get('/ielts/advanced/history').catch(() => ({ data: [] })),
            api.get('/ielts/advanced/reading/history').catch(() => ({ data: [] }))
          ]);
          const mockItems = Array.isArray(mockItemsRaw) ? mockItemsRaw : (mockItemsRaw as any)?.history || (mockItemsRaw as any)?.data || [];
          setMockHistory(mockItems);

          const listPractice = ((advListRes.data as any[]) || []).map((h: any) => ({
            ...h,
            skill: 'LISTENING',
            examTitle: h.part?.title || 'Listening Practice',
            dateTaken: h.createdAt,
            practicePart: true,
            maxScore: h.totalQuestions,
            rawScore: h.totalScore,
            examId: h.partId
          }));
          const readPractice = ((advReadRes.data as any[]) || []).map((h: any) => ({
            ...h,
            skill: 'READING',
            examTitle: h.part?.title || 'Reading Practice',
            dateTaken: h.createdAt,
            practicePart: true,
            maxScore: h.totalQuestions,
            rawScore: h.totalScore,
            examId: h.partId
          }));
          const combinedPractice = [...listPractice, ...readPractice].sort((a, b) => new Date(b.dateTaken).getTime() - new Date(a.dateTaken).getTime());
          setPracticeHistory(combinedPractice);

          const toPoints = (skill: string) =>
            mockItems
              .filter((h: any) => h.skill === skill)
              .sort((a: any, b: any) => new Date(a.dateTaken).getTime() - new Date(b.dateTaken).getTime())
              .slice(-10)
              .map((h: any) => {
                let band = 1.0;
                if (skill === "WRITING" || skill === "SPEAKING") {
                  band = h.writingScore ?? h.rawScore ?? 0;
                } else if (skill === "READING") {
                  band = getIeltsReadingBand(h.rawScore);
                } else {
                  band = getIeltsBandFromScore(h.rawScore);
                }
                return {
                  date: h.dateTaken,
                  band,
                  title: h.examTitle?.split(" - ")[1] ?? h.examTitle,
                };
              });
          setHistoryPoints(toPoints("LISTENING"));
          setReadingPoints(toPoints("READING"));
          setWritingPoints(toPoints("WRITING"));
          setSpeakingPoints(toPoints("SPEAKING"));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [hideCharts, studentId]);

  const getQualityLabel = (score?: number) => {
    if (score === undefined || score === null) return null;
    if (score >= 90) return { text: "Excellent", color: "text-green-600 bg-green-50" };
    if (score >= 70) return { text: "Good", color: "text-blue-600 bg-blue-50" };
    if (score >= 50) return { text: "Needs Work", color: "text-amber-600 bg-amber-50" };
    return { text: "Beginner", color: "text-red-500 bg-red-50" };
  };

  const getLatestScore = (points: { band: number }[]) => points.length > 0 ? points[points.length - 1].band : 0;
  const lBand = getLatestScore(historyPoints);
  const rBand = getLatestScore(readingPoints);
  const wBand = getLatestScore(writingPoints);
  const sBand = getLatestScore(speakingPoints);
  let numSkills = 0; let totalBand = 0;
  if (lBand > 0) { numSkills++; totalBand += lBand; }
  if (rBand > 0) { numSkills++; totalBand += rBand; }
  if (wBand > 0) { numSkills++; totalBand += wBand; }
  if (sBand > 0) { numSkills++; totalBand += sBand; }
  const estimatedBand = numSkills > 0 ? Math.round((totalBand / numSkills) * 2) / 2 : 0;

  const getSkillBadge = (skill: string) => {
    switch (skill) {
      case 'LISTENING': return <span className="px-2 py-1 bg-pink-50 text-pink-600 rounded-md text-[10px] font-bold uppercase flex items-center gap-1 w-max"><Headphones className="w-3 h-3" /> Listening</span>;
      case 'READING': return <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold uppercase flex items-center gap-1 w-max"><BookOpen className="w-3 h-3" /> Reading</span>;
      case 'WRITING': return <span className="px-2 py-1 bg-amber-50 text-amber-600 rounded-md text-[10px] font-bold uppercase flex items-center gap-1 w-max"><PenTool className="w-3 h-3" /> Writing</span>;
      case 'SPEAKING': return <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded-md text-[10px] font-bold uppercase flex items-center gap-1 w-max"><Mic className="w-3 h-3" /> Speaking</span>;
      default: return <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded-md text-[10px] font-bold uppercase w-max">{skill}</span>;
    }
  };

  const getBandForHistoryItem = (h: any) => {
    if (h.skill === "WRITING" || h.skill === "SPEAKING") return h.writingScore ?? h.rawScore ?? 0;
    if (h.skill === "READING") return getIeltsReadingBand(h.rawScore);
    return getIeltsBandFromScore(h.rawScore);
  };

  const allHistory = [...mockHistory, ...practiceHistory].sort((a, b) => new Date(b.dateTaken).getTime() - new Date(a.dateTaken).getTime());
  const recentActivity = allHistory.slice(0, 5);
  const filteredMockHistory = historyTab === 'ALL' ? mockHistory : mockHistory.filter(h => h.skill === historyTab);
  const filteredPracticeHistory = historyTab === 'ALL' ? practiceHistory : practiceHistory.filter(h => h.skill === historyTab);

  // -- Phase 2: Practice Submissions Chart Logic --
  const getSubmissionsOverTime = () => {
    const now = new Date();
    const months: { key: string; label: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString('en-US', { month: 'short' }), count: 0 });
    }
    mockHistory.forEach(h => {
      const d = new Date(h.dateTaken);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const m = months.find(x => x.key === key);
      if (m) m.count++;
    });
    return months;
  };
  const submissionPoints = getSubmissionsOverTime();

  // -- Phase 2: Submission Volume Logic --
  const volumeHistory = mockHistory.filter(h => h.skill === volumeTab);
  const totalVolume = volumeHistory.length;
  const easyVolume = volumeHistory.filter(h => h.difficulty === 'BEGINNER').length;
  const mediumVolume = volumeHistory.filter(h => h.difficulty === 'INTERMEDIATE').length;
  const hardVolume = volumeHistory.filter(h => h.difficulty === 'ADVANCED').length;
  const maxPossible = Math.max(100, Math.ceil(totalVolume / 10) * 10 + 20); // Dynamic target for gauge

  const isTeacherMode = !!studentId;
  const studentName = isTeacherMode && profile?.user
    ? `${profile.user.firstName || ''} ${profile.user.lastName || ''}`.trim() || profile.user.email || 'Student'
    : null;

  return (
    <div className={`w-full bg-white overflow-y-auto px-4 sm:px-8 py-6 ${embedded ? 'h-full' : 'min-h-screen'}`}>
      <div className="max-w-6xl mx-auto flex flex-col gap-6">

        {/* Teacher Mode Banner */}
        {isTeacherMode && (
          <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
            <GraduationCap className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-sm font-medium text-amber-800">
              Teacher view — you are seeing <strong>{studentName || 'this student'}</strong>'s statistics (read-only)
            </span>
          </div>
        )}

        {/* Top Header / Profile Info */}
        {!hideSummary && !loading && profile && (
          <div className="mb-10 animate-fade-up">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 border-b border-slate-200">
              {/* Profile info */}
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center text-white text-xl font-bold shadow-lg ring-4 ring-slate-100">
                  {(profile.user?.firstName?.[0] || profile.user?.lastName?.[0] || 'S').toUpperCase()}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    {isTeacherMode
                      ? studentName || 'Student'
                      : (profile.user?.firstName || profile.user?.lastName ? `${profile.user.firstName || ''} ${profile.user.lastName || ''}`.trim() : 'Student')
                    }
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase tracking-wider border border-primary/20">IELTS Candidate</span>
                    <span className="text-slate-400 text-sm font-medium border-l border-slate-200 pl-2">
                      {isTeacherMode ? 'Performance Overview' : "Your learning journey at a glance"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Summary Bar */}
              <div className="flex items-center gap-8 lg:gap-12 overflow-x-auto pb-2 lg:pb-0 hide-scrollbar">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">Estimate</span>
                  <span className="text-2xl font-bold text-slate-900 tabular-nums leading-none">{estimatedBand > 0 ? estimatedBand.toFixed(1) : "—"}</span>
                </div>
                <div className="w-px h-8 bg-slate-100 hidden sm:block"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">Target</span>
                  <span className="text-2xl font-bold text-slate-900 tabular-nums leading-none">{profile.targetBand?.toFixed(1) || "—"}</span>
                </div>
                <div className="w-px h-8 bg-slate-100 hidden sm:block"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">Streak</span>
                  <span className="text-2xl font-bold text-slate-900 tabular-nums leading-none flex items-center gap-1.5">
                    {streak?.currentStreak || 0}
                    <span className="text-sm font-medium text-slate-400 lowercase">d</span>
                  </span>
                </div>
                <div className="w-px h-8 bg-slate-100 hidden sm:block"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">Daily Goal</span>
                  <span className="text-2xl font-bold text-slate-900 tabular-nums leading-none flex items-center gap-1.5">
                    {profile.dailyCommitmentMins || 0}
                    <span className="text-sm font-medium text-slate-400 lowercase">m</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Sub-bar: Exam Date & Actions */}
            <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-slate-600">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <Calendar className="w-5 h-5 text-slate-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Upcoming Exam</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[15px] font-bold text-slate-900">
                      {examDate ? (() => {
                        const days = Math.ceil((new Date(examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                        if (days < 0) return "Completed on " + new Date(examDate).toLocaleDateString();
                        if (days === 0) return "Happening Today!";
                        return `${new Date(examDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} (${days} days left)`;
                      })() : "No exam date scheduled"}
                    </span>
                    {!isTeacherMode && (
                      <button onClick={() => setIsEditingExamDate(true)} className="text-slate-300 hover:text-primary transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {!isTeacherMode && isEditingExamDate && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    className="text-sm font-bold border border-slate-200 rounded-lg py-1.5 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    value={examDate ? new Date(examDate).toISOString().split('T')[0] : ''}
                    onChange={async (e) => {
                      const newDate = e.target.value || null;
                      setExamDate(newDate);
                      setIsEditingExamDate(false);
                      try { await api.patch('/ielts/profile', { examDate: newDate }); } catch (err) { }
                    }}
                    onBlur={() => setIsEditingExamDate(false)}
                    autoFocus
                  />
                  <button onClick={() => setIsEditingExamDate(false)} className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider px-2">Cancel</button>
                </div>
              )}

              {!isTeacherMode && !examDate && !isEditingExamDate && (
                <button
                  onClick={() => setIsEditingExamDate(true)}
                  className="px-6 py-2 bg-white text-slate-900 text-xs font-bold border border-slate-200 rounded-lg hover:bg-slate-50 transition-all active:scale-95 uppercase tracking-wider shadow-sm"
                >
                  Schedule Exam
                </button>
              )}
            </div>
          </div>
        )}

        {!hideCharts && (
          <>
            {!loading && (
              <>
                {/* 1. Practice Submissions Over Time (Full Width Line Chart) */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col mb-8">
                  <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="w-5 h-5 text-slate-900" />
                    <h2 className="text-lg font-bold text-slate-900">Practice Submissions Over Time</h2>
                  </div>
                  <div className="flex-1 w-full relative" style={{ height: 220 }}>
                    <svg viewBox="0 0 1000 200" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="submissions-grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                        </linearGradient>
                      </defs>

                      {/* Grid Lines */}
                      {[0, 1, 2, 3, 4].map(i => (
                        <line key={i} x1="0" y1={i * 40} x2="1000" y2={i * 40} stroke="#f3f4f6" strokeWidth="1" />
                      ))}

                      {(() => {
                        const maxCount = Math.max(...submissionPoints.map(p => p.count), 5);
                        const points = submissionPoints.map((p, i) => {
                          const x = (i / (submissionPoints.length - 1)) * 1000;
                          const y = 160 - (p.count / maxCount) * 160;
                          return { x, y, count: p.count, label: p.label };
                        });

                        const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
                        const areaD = `${pathD} L1000,160 L0,160 Z`;

                        return (
                          <>
                            <path d={areaD} fill="url(#submissions-grad)" />
                            <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinejoin="round" />
                            {points.map((p, i) => (
                              <g key={i}>
                                <circle cx={p.x} cy={p.y} r="5" fill="white" stroke="#2563eb" strokeWidth="2.5" />
                                <text x={p.x} y="190" textAnchor={i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"} fontSize="12" fill="#9ca3af" fontWeight="600">{p.label}</text>
                                {p.count > 0 && (
                                  <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize="12" fill="#111827" fontWeight="bold">{p.count}</text>
                                )}
                              </g>
                            ))}
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                </div>

                {/* 2. Band Score Trends */}
                <div className="text-lg font-bold text-slate-900 mb-4">Band Score Trends</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 border-b border-slate-200 mb-8">
                  {/* Listening */}
                  {historyPoints.length >= 2 ? (
                    <BandScoreChart points={historyPoints} label="Listening" />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center text-slate-500 border border-slate-200 bg-slate-50 rounded-xl h-full min-h-[200px]">
                      <TrendingUp className="w-10 h-10 mb-3 opacity-30 text-slate-400" />
                      <div className="font-medium text-slate-600">No Listening chart data yet</div>
                      <div className="text-sm mt-1">Complete at least 2 listening tests.</div>
                    </div>
                  )}

                  {/* Reading */}
                  {readingPoints.length >= 2 ? (
                    <BandScoreChart points={readingPoints} label="Reading" />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center text-slate-500 border border-slate-200 bg-slate-50 rounded-xl h-full min-h-[200px]">
                      <TrendingUp className="w-10 h-10 mb-3 opacity-30 text-slate-400" />
                      <div className="font-medium text-slate-600">No Reading chart data yet</div>
                      <div className="text-sm mt-1">Complete at least 2 reading tests.</div>
                    </div>
                  )}

                  {/* Writing */}
                  {writingPoints.length >= 2 ? (
                    <BandScoreChart points={writingPoints} label="Writing" />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center text-slate-500 border border-slate-200 bg-slate-50 rounded-xl h-full min-h-[200px]">
                      <TrendingUp className="w-10 h-10 mb-3 opacity-30 text-slate-400" />
                      <div className="font-medium text-slate-600">No Writing chart data yet</div>
                      <div className="text-sm mt-1">Complete at least 2 writing tests.</div>
                    </div>
                  )}

                  {/* Speaking */}
                  {speakingPoints.length >= 2 ? (
                    <BandScoreChart points={speakingPoints} label="Speaking" />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center text-slate-500 border border-slate-200 bg-slate-50 rounded-xl h-full min-h-[200px]">
                      <TrendingUp className="w-10 h-10 mb-3 opacity-30 text-slate-400" />
                      <div className="font-medium text-slate-600">No Speaking chart data yet</div>
                      <div className="text-sm mt-1">Complete at least 2 speaking tests.</div>
                    </div>
                  )}
                </div>

                {/* 3. Submission Volume by Skill (Full Width) */}
                <div className="bg-white rounded-xl border border-slate-200 p-8 flex flex-col mb-8">
                  <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-4">
                    <div className="flex items-center gap-2">
                      <LayoutList className="w-5 h-5 text-slate-900" />
                      <h2 className="text-lg font-bold text-slate-900">Submission Volume</h2>
                    </div>
                  </div>

                  <div className="flex bg-slate-50 border border-slate-100 p-1 rounded-lg mb-8 max-w-lg mx-auto w-full">
                    {['LISTENING', 'READING', 'WRITING', 'SPEAKING'].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setVolumeTab(tab)}
                        className={`flex-1 text-[11px] font-medium py-2 rounded transition-all ${volumeTab === tab ? 'bg-white border border-slate-200 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        {tab.charAt(0) + tab.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-col md:flex-row gap-12 items-center justify-center flex-1 max-w-4xl mx-auto w-full">
                    <div className="relative w-40 h-40 shrink-0">
                      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#f8fafc" strokeWidth="14" />
                        <circle
                          cx="50" cy="50" r="40" fill="none"
                          stroke="#2563eb" strokeWidth="14" strokeLinecap="round"
                          strokeDasharray={`${(totalVolume / maxPossible) * 251.2} 251.2`}
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center mt-1">
                        <div className="text-4xl font-semibold text-slate-900 leading-none">{totalVolume}</div>
                        <div className="text-[10px] font-medium text-slate-400 uppercase mt-1">Tests</div>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-5 w-full">
                      <div className="flex items-center gap-3">
                        <div className="w-16 text-sm font-medium text-slate-500 text-right">Easy</div>
                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-slate-300 rounded-full transition-all duration-1000" style={{ width: `${totalVolume ? (easyVolume / totalVolume) * 100 : 0}%` }}></div>
                        </div>
                        <div className="w-8 text-sm font-semibold text-slate-900">{easyVolume}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-16 text-sm font-medium text-slate-500 text-right">Medium</div>
                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-slate-400 rounded-full transition-all duration-1000" style={{ width: `${totalVolume ? (mediumVolume / totalVolume) * 100 : 0}%` }}></div>
                        </div>
                        <div className="w-8 text-sm font-semibold text-slate-900">{mediumVolume}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-16 text-sm font-medium text-slate-500 text-right">Hard</div>
                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-slate-500 rounded-full transition-all duration-1000" style={{ width: `${totalVolume ? (hardVolume / totalVolume) * 100 : 0}%` }}></div>
                        </div>
                        <div className="w-8 text-sm font-semibold text-slate-900">{hardVolume}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Remove duplicate loading check for BandScoreCharts since we already checked rawHistory above, 
                and they are now integrated into the single layout stream. */}

            {!loading && (
              <div className="flex flex-col gap-10 mt-4">

                {/* Recent Activity Feed */}
                <div className="flex flex-col mb-4">
                  <div className="flex items-center gap-2 mb-4 px-1">
                    <Clock className="w-5 h-5 text-slate-900" />
                    <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
                  </div>
                  <div className="flex flex-col border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
                    {recentActivity.map((h, i) => (
                      <div key={i} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50/80 transition-all duration-200 group border-b last:border-0 border-slate-100">
                        <div className="flex items-center gap-5">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:shadow-sm transition-all">
                            {h.skill === 'LISTENING' && <Headphones className="w-4 h-4 text-slate-500 group-hover:text-primary" />}
                            {h.skill === 'READING' && <BookOpen className="w-4 h-4 text-slate-500 group-hover:text-primary" />}
                            {h.skill === 'WRITING' && <PenTool className="w-4 h-4 text-slate-500 group-hover:text-primary" />}
                            {h.skill === 'SPEAKING' && <Mic className="w-4 h-4 text-slate-500 group-hover:text-primary" />}
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-3 mb-0.5">
                              <span className="text-[13px] font-bold text-slate-900 group-hover:text-primary transition-colors">{h.examTitle?.split(" - ")[1] ?? h.examTitle}</span>
                              {getSkillBadge(h.skill)}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
                              <span>{new Date(h.dateTaken).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                              <span>{new Date(h.dateTaken).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-8">
                          <div className="text-right">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Score</div>
                            <div className="text-lg font-bold text-slate-900 tabular-nums">{getBandForHistoryItem(h).toFixed(1)}</div>
                          </div>
                          <Link
                            href={h.practicePart ? `/ielts/advanced/${h.skill.toLowerCase()}/${h.examId}/my-answers/${h.id}` : `/ielts/intensive/${h.examId}/result/${h.id}`}
                            className="flex items-center gap-2 text-[11px] font-bold text-slate-400 group-hover:text-primary uppercase tracking-widest transition-all"
                          >
                            Review
                            <ChevronRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Practice History List */}
                <div className="flex flex-col mt-4">
                  <div className="flex items-center gap-2 mb-4 px-1">
                    <LayoutList className="w-5 h-5 text-slate-900" />
                    <h2 className="text-lg font-bold text-slate-900">Practice History</h2>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col flex-1">

                    {/* Tabs */}
                    <div className="flex p-2 border-b border-slate-200 gap-1 overflow-x-auto hide-scrollbar">
                      {['ALL', 'LISTENING', 'READING', 'WRITING', 'SPEAKING'].map(tab => (
                        <button
                          key={tab}
                          onClick={() => setHistoryTab(tab)}
                          className={`px-4 py-2 rounded text-sm font-medium whitespace-nowrap transition-colors ${historyTab === tab
                            ? 'bg-slate-100 text-slate-900 font-semibold'
                            : 'bg-transparent text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                          {tab === 'ALL' ? 'All Skills' : tab.charAt(0) + tab.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>

                    {/* List */}
                    <div className="flex flex-col divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                      {filteredPracticeHistory.length > 0 ? (
                        filteredPracticeHistory.map((h, i) => {
                          const pct = h.maxScore ? Math.round((h.rawScore / h.maxScore) * 100) : 0;
                          return (
                            <div key={i} className="flex flex-wrap items-center justify-between p-4 sm:p-5 gap-4 hover:bg-slate-50 transition-colors">
                              <div className="flex items-center gap-4 min-w-[200px] flex-1">
                                <div className="w-10 h-10 rounded bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                                  {h.skill === 'LISTENING' && <Headphones className="w-4 h-4 text-slate-500" />}
                                  {h.skill === 'READING' && <BookOpen className="w-4 h-4 text-slate-500" />}
                                  {h.skill === 'WRITING' && <PenTool className="w-4 h-4 text-slate-500" />}
                                  {h.skill === 'SPEAKING' && <Mic className="w-4 h-4 text-slate-500" />}
                                </div>
                                <div className="flex flex-col">
                                  <div className="font-semibold text-slate-900 text-sm sm:text-base">{h.examTitle?.split(" - ")[1] ?? h.examTitle}</div>
                                  <div className="text-xs text-slate-500 mt-0.5">{new Date(h.dateTaken).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</div>
                                </div>
                              </div>

                              <div className="flex items-center gap-6 shrink-0">
                                <div className="text-right hidden sm:block">
                                  <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">Score</div>
                                  <div className="text-lg font-semibold text-slate-900 leading-none">{h.rawScore}/{h.maxScore}</div>
                                </div>

                                <Link
                                  href={`/ielts/advanced/${h.skill.toLowerCase()}/${h.examId}/my-answers/${h.id}`}
                                  className="text-sm font-medium text-primary hover:underline"
                                >
                                  View Result
                                </Link>
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <div className="p-10 flex flex-col items-center justify-center text-center">
                          <LayoutList className="w-12 h-12 text-gray-200 mb-3" />
                          <div className="text-gray-900 font-bold">No practice history found</div>
                          <div className="text-sm text-gray-500 mt-1">You haven't completed any {historyTab !== 'ALL' ? historyTab.toLowerCase() : ''} practice sessions yet.</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mock Test History Table */}
                <div className="flex flex-col mt-4">
                  <div className="flex items-center gap-2 mb-4 px-1">
                    <TestTube className="w-5 h-5 text-slate-900" />
                    <h2 className="text-lg font-bold text-slate-900">Mock Test History</h2>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col flex-1 p-6">

                    {/* Tabs */}
                    <div className="flex border-b border-slate-200 mb-6 gap-8">
                      {[
                        { id: 'LISTENING', label: 'Listening', icon: Headphones },
                        { id: 'READING', label: 'Reading', icon: BookOpen },
                        { id: 'WRITING', label: 'Writing', icon: PenTool },
                        { id: 'SPEAKING', label: 'Speaking', icon: Mic }
                      ].map(tab => {
                        const isActive = historyTab === tab.id || (historyTab === 'ALL' && tab.id === 'LISTENING'); // Fallback if ALL was selected
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setHistoryTab(tab.id)}
                            className={`flex items-center gap-2 pb-4 text-sm font-medium transition-colors relative ${isActive ? 'text-primary' : 'text-slate-500 hover:text-slate-700'
                              }`}
                          >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                            {isActive && (
                              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Search and Sort */}
                    <div className="flex gap-4 mb-6">
                      <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          placeholder="Search by test name..."
                          className="w-full pl-11 pr-4 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all bg-white"
                        />
                      </div>
                      <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap bg-white">
                        Newest first
                      </button>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[800px] text-left border-collapse">
                        <thead>
                          <tr>
                            <th className="py-3 px-4 text-xs font-medium text-slate-500 border-b border-slate-200 w-12">#</th>
                            <th className="py-3 px-4 text-xs font-medium text-slate-500 border-b border-slate-200">Test Name</th>
                            <th className="py-3 px-4 text-xs font-medium text-slate-500 border-b border-slate-200 w-36">Date Taken</th>
                            <th className="py-3 px-4 text-xs font-medium text-slate-500 border-b border-slate-200 w-32">Time Taken</th>
                            <th className="py-3 px-4 text-xs font-medium text-slate-500 border-b border-slate-200 w-24">Raw Score</th>
                            <th className="py-3 px-4 text-xs font-medium text-slate-500 border-b border-slate-200 w-28">Band Score</th>
                            <th className="py-3 px-4 text-xs font-medium text-slate-500 border-b border-slate-200 w-32">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredMockHistory.length > 0 ? (
                            filteredMockHistory.map((h, i) => {
                              const bandScore = getBandForHistoryItem(h);
                              const isLowScore = bandScore < 5.0;

                              return (
                                <tr key={i} className="hover:bg-slate-50 transition-colors group">
                                  <td className="py-4 px-4 text-sm font-medium text-slate-400">{i + 1}</td>
                                  <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                                        <CheckCircle className="w-4 h-4 text-slate-500" />
                                      </div>
                                      <span className="font-medium text-slate-900 text-sm">
                                        {h.examTitle?.split(" - ")[1] ?? h.examTitle}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-4 px-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                      {new Date(h.dateTaken).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                  </td>
                                  <td className="py-4 px-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                                      {h.timeTaken ? (
                                        h.timeTaken < 60 ? `${h.timeTaken}s` : `${Math.floor(h.timeTaken / 60)}m ${h.timeTaken % 60}s`
                                      ) : "-"}
                                    </div>
                                  </td>
                                  <td className="py-4 px-4 text-sm font-medium text-slate-900">
                                    {h.skill === "WRITING" || h.skill === "SPEAKING" ? "-" : (
                                      <>
                                        {h.rawScore}<span className="text-slate-400">/{h.skill === 'LISTENING' || h.skill === 'READING' ? 40 : h.maxScore}</span>
                                      </>
                                    )}
                                  </td>
                                  <td className="py-4 px-4">
                                    <span className="text-sm font-semibold text-slate-900">
                                      {bandScore.toFixed(1)}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4">
                                    <div className="flex items-center gap-4">
                                      <Link
                                        href={`/ielts/intensive/${h.examId}/result/${h.id}`}
                                        className="text-sm font-medium text-primary hover:underline"
                                      >
                                        Review
                                      </Link>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={7} className="py-12 text-center">
                                <LayoutList className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                <div className="text-gray-900 font-bold">No history found</div>
                                <div className="text-sm text-gray-500 mt-1">You haven't completed any {(historyTab === 'ALL' ? 'LISTENING' : historyTab).toLowerCase()} tests yet.</div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
