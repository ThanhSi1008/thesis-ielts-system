"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { examsApi } from "@/services/exams.api";
import type { IeltsIntensiveCatalogResponse, IeltsIntensiveGroup, IeltsSkill } from "@/types";

const SKILLS: Array<{ key: IeltsSkill; label: string }> = [
  { key: "LISTENING", label: "Listening" },
  { key: "READING", label: "Reading" },
  { key: "WRITING", label: "Writing" },
  { key: "SPEAKING", label: "Speaking" },
];

type CardTone = "success" | "danger" | "info" | "warning";

function toneByTestNumber(n: number): CardTone {
  if (n === 1) return "success";
  if (n === 2) return "danger";
  if (n === 3) return "info";
  return "warning";
}

function toneClasses(tone: CardTone) {
  switch (tone) {
    case "success":
      return {
        bg: "bg-green-50",
        ring: "ring-green-200",
        accent: "text-green-700",
        badge: "bg-green-600",
      };
    case "danger":
      return {
        bg: "bg-red-50",
        ring: "ring-red-200",
        accent: "text-red-700",
        badge: "bg-red-600",
      };
    case "info":
      return {
        bg: "bg-blue-50",
        ring: "ring-blue-200",
        accent: "text-blue-700",
        badge: "bg-blue-600",
      };
    case "warning":
    default:
      return {
        bg: "bg-amber-50",
        ring: "ring-amber-200",
        accent: "text-amber-700",
        badge: "bg-amber-600",
      };
  }
}

function ShieldScore({
  score,
  tone,
}: {
  score: number;
  tone: CardTone;
}) {
  const cls = toneClasses(tone);
  return (
    <div className="flex items-center gap-3 min-w-[78px]">
      <div className={`relative w-12 h-12`}>
        <svg viewBox="0 0 64 64" className="w-12 h-12">
          <path
            d="M32 4c10 8 20 10 26 12v18c0 16-10 26-26 30C16 60 6 50 6 34V16c6-2 16-4 26-12Z"
            fill="white"
            stroke="currentColor"
            className={`${cls.accent}`}
            strokeWidth="3"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-extrabold ${cls.accent}`}>{score}</span>
        </div>
      </div>
    </div>
  );
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
  groupTitle,
  skill,
  test,
}: {
  groupTitle: string;
  skill: IeltsSkill;
  test: IeltsIntensiveGroup["tests"][number];
}) {
  const tone = toneByTestNumber(test.testNumber);
  const cls = toneClasses(tone);
  const score = test.myScore ?? 0;

  return (
    <Link
      href={`/ielts/intensive/${encodeURIComponent(test.examId)}?skill=${skill}`}
      className={`group block rounded-2xl ${cls.bg} ring-1 ${cls.ring} hover:shadow-md transition-all duration-200`}
    >
      <div className="p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <ShieldScore score={score} tone={tone} />
          <div className="min-w-0">
            <div className="font-bold text-gray-900 truncate">
              {skill.charAt(0) + skill.slice(1).toLowerCase()} Test {test.testNumber}
            </div>
            <div className="mt-1 flex items-center gap-4 flex-wrap">
              <StatPill icon={<SmallIcon name="users" />} value={`${test.participantsCount}`} label="participants" />
              <StatPill icon={<SmallIcon name="check" />} value={`${test.completedCount}`} label="completed" />
              <StatPill icon={<SmallIcon name="clock" />} value={`${test.durationMinutes}`} label="min" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 text-gray-400 group-hover:text-gray-600 transition-colors">
          <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wide">
            {groupTitle.replace("Cambridge IELTS ", "")}
          </span>
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

export default function IeltsIntensivePage() {
  const [skill, setSkill] = useState<IeltsSkill>("READING");
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
    <div className="min-h-screen bg-white">
      <div className="container mx-auto max-w-screen-xl px-4 py-8">
        <div className="flex gap-10">
          {/* Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24">
              <div className="flex items-center gap-3 text-gray-700 font-semibold mb-6">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 13h8V3H3v10Zm10 8h8V11h-8v10ZM13 3h8v6h-8V3ZM3 17h8v4H3v-4Z" />
                </svg>
                Dashboard
              </div>

              <div className="space-y-2">
                <Link
                  href="/ielts"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  <span className="w-2 h-2 rounded-full bg-gray-300" />
                  IELTS Home
                </Link>

                <Link
                  href="/ielts/intensive"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold bg-primary/10 text-primary"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20l9-5-9-5-9 5 9 5Z" />
                    <path d="M12 12l9-5-9-5-9 5 9 5Z" />
                  </svg>
                  Mock Test
                </Link>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0">
            {/* Tabs */}
            <div className="flex items-center gap-8 border-b border-gray-100 mb-8">
              {SKILLS.map((s) => {
                const active = skill === s.key;
                return (
                  <button
                    key={s.key}
                    onClick={() => setSkill(s.key)}
                    className={`relative py-4 text-sm font-bold transition-colors ${
                      active ? "text-gray-900" : "text-gray-400 hover:text-gray-700"
                    }`}
                  >
                    {s.label}
                    <span
                      className={`absolute left-0 -bottom-[1px] h-[3px] rounded-full bg-primary transition-all ${
                        active ? "w-full" : "w-0"
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
                    <section key={g.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm">
                      <button
                        onClick={() => setCollapsed((prev) => ({ ...prev, [g.id]: !isCollapsed }))}
                        className="w-full px-6 py-5 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-gray-700">
                              {g.title.replace("Cambridge IELTS ", "IELTS ")}
                            </span>
                          </div>
                          <div className="min-w-0 text-left">
                            <div className="font-extrabold text-gray-900 truncate">{g.title}</div>
                            <div className="mt-1 flex items-center gap-4 flex-wrap">
                              <StatPill icon={<SmallIcon name="users" />} value={`${g.participantsCount}`} label="participants" />
                              <StatPill icon={<SmallIcon name="check" />} value={`${g.completedCount}`} label="completed" />
                            </div>
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
                              <TestCard key={t.examId} groupTitle={g.title} skill={skill} test={t} />
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

