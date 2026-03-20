"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { examsApi } from "@/services/exams.api";
import type { IeltsIntensiveCatalogResponse, IeltsIntensiveGroup, IeltsSkill } from "@/types";

import { Headphones, BookOpen, PenTool, Mic } from "lucide-react";

const SKILLS: Array<{ key: IeltsSkill; label: string; icon: JSX.Element }> = [
  { key: "LISTENING", label: "Listening", icon: <Headphones className="w-4 h-4" /> },
  { key: "READING", label: "Reading", icon: <BookOpen className="w-4 h-4" /> },
  { key: "WRITING", label: "Writing", icon: <PenTool className="w-4 h-4" /> },
  { key: "SPEAKING", label: "Speaking", icon: <Mic className="w-4 h-4" /> },
];

type CardTone = "success" | "danger" | "info" | "warning" | "primary";

function getIeltsListeningBand(score: number): number {
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

function toneByBandScore(rawScore: number, band: number): CardTone {
  if (rawScore === 0) return "primary";
  if (band <= 4.5) return "danger";
  if (band <= 6.0) return "warning";
  if (band <= 7.5) return "info";
  return "success";
}

function toneClasses(tone: CardTone) {
  switch (tone) {
    case "success":
      return { bg: "bg-success/20", border: "border-success", text: "text-success", badge: "bg-success", label: "Advanced" };
    case "danger":
      return { bg: "bg-danger/10", border: "border-danger", text: "text-danger", badge: "bg-danger", label: "Beginner" };
    case "warning":
      return { bg: "bg-warning/20", border: "border-warning", text: "text-warning", badge: "bg-warning", label: "Intermediate" };
    case "info":
      return { bg: "bg-info/20", border: "border-info", text: "text-info", badge: "bg-info", label: "Upper-Intermediate" };
    case "primary":
    default:
      return { bg: "bg-primary/10", border: "border-primary", text: "text-primary", badge: "", label: "Not taken yet" };
  }
}

function StatPill({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <span className="text-gray-400">{icon}</span>
      <span className="font-semibold text-gray-700">{value}</span>
      <span className="text-gray-400">{label}</span>
    </div>
  );
}

function SmallIcon({ name }: { name: "users" | "check" | "clock" }) {
  if (name === "users") {
    return (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }
  if (name === "check") {
    return (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function TestCard({
  skill,
  test,
}: {
  skill: IeltsSkill;
  test: IeltsIntensiveGroup["tests"][number];
}) {
  const rawScore = test.myScore ?? 0;
  const band = getIeltsListeningBand(rawScore);
  const tone = toneByBandScore(rawScore, band);
  const cls = toneClasses(tone);

  return (
    <Link
      href={`/ielts/intensive/${encodeURIComponent(test.examId)}?skill=${skill}`}
      className={`group block rounded-xl ${cls.bg} outline outline-1 outline-transparent transition-all duration-200 overflow-hidden relative`}
    >
      <div className="flex items-center justify-between px-4 py-1 w-full gap-2">
        {rawScore > 0 ? (
          <div className={`relative h-14 w-14 flex flex-col items-center justify-center shrink-0 ${cls.text}`}>
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-md">
              {/* Base Hexagon */}
              <polygon fill="currentColor" points="50,5 89,27.5 89,72.5 50,95 11,72.5 11,27.5" />
              {/* Subtle 3D Left-Side Highlight */}
              <polygon fill="white" fillOpacity="0.15" points="50,5 11,27.5 11,72.5 50,95 50,5" />
              {/* Inner Decorative Hexagon */}
              <polygon fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.5" strokeLinejoin="round" points="50,14 81,32 81,68 50,86 19,68 19,32" />
            </svg>
            <span className="relative z-10 text-[15px] font-extrabold text-white leading-none tracking-tight drop-shadow-sm mt-0.5">
              {band.toFixed(1)}
            </span>
          </div>
        ) : (
          <div className="relative h-14 w-14 flex flex-col items-center justify-center shrink-0 text-gray-300">
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
              <polygon fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" points="50,5 89,27.5 89,72.5 50,95 11,72.5 11,27.5" />
              <polygon fill="none" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" strokeLinejoin="round" strokeDasharray="4 4" points="50,14 81,32 81,68 50,86 19,68 19,32" />
            </svg>
            <span className="relative z-10 text-[16px] font-bold text-gray-400 leading-none mt-0.5">
              -
            </span>
          </div>
        )}
        <div className="p-4 flex flex-col justify-between h-full gap-2 relative z-10 w-full">
          <div className="flex justify-between items-start gap-2 w-full">
            <div className="font-bold text-gray-900 transition-colors flex-1">
              {skill.charAt(0) + skill.slice(1).toLowerCase()} Test {test.testNumber}
            </div>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-gray-600 font-medium">
            <div className="flex items-center gap-1.5"><SmallIcon name="users" /> {test.participantsCount}</div>
            <div className="flex items-center gap-1.5"><SmallIcon name="clock" /> {test.durationMinutes}m</div>
          </div>
        </div>
      </div>
    </Link>
  );
}

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

export default function IeltsIntensivePage() {
  const [skill, setSkill] = useState<IeltsSkill>("LISTENING");
  const [data, setData] = useState<IeltsIntensiveCatalogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    examsApi
      .getIntensiveCatalog(skill)
      .then((res) => {
        if (!mounted) return;
        setData(res);
        // Default: expanded
        const next: Record<string, boolean> = {};
        res.groups.forEach((g) => (next[g.id] = collapsed[g.id] ?? false));
        setCollapsed(next);
      })
      .catch((e: any) => {
        if (!mounted) return;
        setError(e?.message || "Failed to load intensive catalog");
        setData(null);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skill]);

  const groups = useMemo(() => data?.groups ?? [], [data]);

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
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold bg-primary/10 text-primary"
                >
                  <div className="flex items-center gap-3">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                    Mock Test
                  </div>
                </Link>

                <Link
                  href="/ielts/history"
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Test History
                  </div>
                </Link>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0 bg-white rounded-2xl shadow-sm overflow-hidden px-8 py-4">
            {/* Tabs */}
            <div className="flex items-center gap-8 mb-8">
              {SKILLS.map((s) => {
                const active = skill === s.key;
                return (
                  <button
                    key={s.key}
                    onClick={() => setSkill(s.key)}
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

            {/* Loading / Error */}
            {loading && (
              <div className="space-y-6">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-gray-50 border border-gray-100 rounded-2xl p-6 animate-pulse">
                    <div className="h-6 w-56 bg-gray-200 rounded mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map((k) => (
                        <div key={k} className="h-20 bg-gray-200 rounded-2xl" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && error && (
              <div className="bg-red-50 text-red-700 border border-red-100 rounded-2xl p-4">
                {error}
              </div>
            )}

            {!loading && !error && groups.length === 0 && (
              <div className="bg-amber-50 text-amber-800 border border-amber-100 rounded-2xl p-5">
                No published Cambridge exams found for {skill}. Make sure exam titles follow:
                <div className="mt-2 font-mono text-xs text-amber-900/80">
                  Cambridge IELTS 17 - {skill.charAt(0) + skill.slice(1).toLowerCase()} Test 1
                </div>
              </div>
            )}

            {/* Groups */}
            {!loading && !error && groups.length > 0 && (
              <div className="space-y-8">
                {groups.map((g) => {
                  const isCollapsed = collapsed[g.id] ?? false;
                  return (
                    <section key={g.id} className="bg-white shadow-sm border border-black/1 rounded-2xl">
                      <button
                        onClick={() => setCollapsed((prev) => ({ ...prev, [g.id]: !isCollapsed }))}
                        className="w-full px-6 py-5 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          {g.imageUrl ? (
                            <img src={g.imageUrl} alt={g.title} className="w-[50px] h-[70px] object-cover rounded shadow-sm flex-shrink-0" />
                          ) : (
                            <div className="w-[50px] h-[70px] rounded bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0">
                              <span className="text-[10px] font-bold text-gray-500 text-center px-1 leading-tight">
                                {g.title.replace("Cambridge IELTS ", "IELTS\n")}
                              </span>
                            </div>
                          )}
                          <div className="min-w-0 text-left flex flex-col gap-1">
                            <div className="font-extrabold text-gray-900 truncate">{g.title}</div>
                            <StatPill icon={<SmallIcon name="users" />} value={`${g.participantsCount}`} label="participants" />
                            <StatPill icon={<SmallIcon name="check" />} value={`${g.completedCount}`} label="completed" />
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-gray-400">
                          <span className="text-xs font-bold uppercase tracking-wide hidden sm:inline">
                            {isCollapsed ? "Expand" : "Collapse"}
                          </span>
                          <svg
                            viewBox="0 0 24 24"
                            className={`w-5 h-5 transition-transform ${isCollapsed ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M6 15l6-6 6 6" />
                          </svg>
                        </div>
                      </button>

                      {!isCollapsed && (
                        <div className="px-6 pb-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {g.tests.map((t) => (
                              <TestCard key={t.examId} skill={skill} test={t} />
                            ))}
                          </div>
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

