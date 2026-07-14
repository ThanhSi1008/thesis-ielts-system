"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { examsApi } from "@/services/exams.api";
import type { IeltsIntensiveCatalogResponse, IeltsIntensiveGroup, IeltsBasicSkill, PracticeCatalogResponse } from "@/types";

import { Headphones, BookOpen, PenTool, Mic, Search, X, TrendingUp } from "lucide-react";

const SKILLS: Array<{ key: IeltsBasicSkill; label: string; icon: JSX.Element }> = [
  { key: "LISTENING", label: "Listening", icon: <Headphones className="w-4 h-4" /> },
  { key: "READING", label: "Reading", icon: <BookOpen className="w-4 h-4" /> },
  { key: "WRITING", label: "Writing", icon: <PenTool className="w-4 h-4" /> },
  { key: "SPEAKING", label: "Speaking", icon: <Mic className="w-4 h-4" /> },
];

type CardTone = "success" | "danger" | "info" | "warning" | "primary";
type StatusFilter = "all" | "taken" | "not-taken";

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
      return { bg: "bg-primary/10 dark:bg-primary/20", border: "border-primary", text: "text-primary dark:text-primary", badge: "", label: "Not taken yet" };
  }
}

function StatPill({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
      <span className="text-gray-400 dark:text-slate-500">{icon}</span>
      <span className="font-semibold text-gray-700 dark:text-slate-300">{value}</span>
      <span className="text-gray-400 dark:text-slate-500">{label}</span>
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
  skill: IeltsBasicSkill;
  test: IeltsIntensiveGroup["tests"][number];
}) {
  const rawScore = test.myScore ?? 0;
  const band = (skill === "WRITING" || skill === "SPEAKING")
    ? rawScore
    : skill === "READING"
      ? getIeltsReadingBand(rawScore)
      : getIeltsListeningBand(rawScore);
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
              <polygon fill="currentColor" points="50,5 89,27.5 89,72.5 50,95 11,72.5 11,27.5" />
              <polygon fill="white" fillOpacity="0.15" points="50,5 11,27.5 11,72.5 50,95 50,5" />
              <polygon fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.5" strokeLinejoin="round" points="50,14 81,32 81,68 50,86 19,68 19,32" />
            </svg>
            <span className="relative z-10 text-[15px] font-extrabold text-white leading-none tracking-tight drop-shadow-sm mt-0.5">
              {band.toFixed(1)}
            </span>
          </div>
        ) : (
          <div className="relative h-14 w-14 flex flex-col items-center justify-center shrink-0 text-gray-300 dark:text-slate-600">
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
              <polygon fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" points="50,5 89,27.5 89,72.5 50,95 11,72.5 11,27.5" />
              <polygon fill="none" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" strokeLinejoin="round" strokeDasharray="4 4" points="50,14 81,32 81,68 50,86 19,68 19,32" />
            </svg>
            <span className="relative z-10 text-[16px] font-bold text-gray-400 dark:text-slate-500 leading-none mt-0.5">
              -
            </span>
          </div>
        )}
        <div className="p-4 flex flex-col justify-between h-full gap-2 relative z-10 w-full">
          <div className="flex justify-between items-start gap-2 w-full">
            <div className="font-bold text-gray-900 dark:text-white transition-colors flex-1">
              {skill.charAt(0) + skill.slice(1).toLowerCase()} Test {test.testNumber}
            </div>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-gray-600 dark:text-slate-400 font-medium">
            <div className="flex items-center gap-1.5"><SmallIcon name="users" /> {test.participantsCount}</div>
            <div className="flex items-center gap-1.5"><SmallIcon name="clock" /> {test.durationMinutes}m</div>
          </div>
        </div>
      </div>
    </Link>
  );
}



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



function IeltsIntensiveContentInner({ embedded, initialView }: { embedded?: boolean; initialView?: string }) {
  const searchParams = useSearchParams();
  const [skill, setSkill] = useState<IeltsBasicSkill>("LISTENING");
  const [data, setData] = useState<IeltsIntensiveCatalogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  
  const queryView = searchParams?.get("view") || initialView;
  const [view, setView] = useState<"mock-test" | "practice" | "custom-practice">(
    queryView === "practice" ? "practice" :
      queryView === "custom-practice" ? "custom-practice" : "mock-test"
  );
  
  // if initialView prop changes, update view
  useEffect(() => {
    if (initialView) {
      if (initialView === "practice" || initialView === "custom-practice" || initialView === "mock-test") {
        setView(initialView);
      }
    }
  }, [initialView]);

  const [practiceData, setPracticeData] = useState<PracticeCatalogResponse | null>(null);
  const [practiceLoading, setPracticeLoading] = useState(true);
  const [activePartNumber, setActivePartNumber] = useState(1);

  // Custom practice state
  const [customExamId, setCustomExamId] = useState<string>("");
  const [customPart, setCustomPart] = useState<number | "all">("all");
  const [customTime, setCustomTime] = useState<number>(30); // in minutes
  const [isCustomTimeMode, setIsCustomTimeMode] = useState<boolean>(false);
  const [customTimeStr, setCustomTimeStr] = useState<string>("30");
  const [customAutoSubmit, setCustomAutoSubmit] = useState<boolean>(true);

  // Search & filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [mockTestOpen, setMockTestOpen] = useState(true);
  const [testHistoryOpen, setTestHistoryOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const [isLoaded, setIsLoaded] = useState(false);

  // Sync state with URL search params or sessionStorage on mount
  useEffect(() => {
    const urlView = searchParams.get("view");
    const urlSkill = searchParams.get("skill");
    const urlPart = searchParams.get("part");

    if (urlView) {
      setView(urlView as any);
      sessionStorage.setItem("intensive_view", urlView);
    } else {
      const savedView = sessionStorage.getItem("intensive_view");
      if (savedView) setView(savedView as any);
    }

    if (urlSkill) {
      setSkill(urlSkill.toUpperCase() as any);
      sessionStorage.setItem("intensive_skill", urlSkill);
    } else {
      const savedSkill = sessionStorage.getItem("intensive_skill");
      if (savedSkill) setSkill(savedSkill.toUpperCase() as any);
    }

    if (urlPart) {
      setActivePartNumber(Number(urlPart) || 1);
      sessionStorage.setItem("intensive_part", urlPart);
    } else {
      const savedPart = sessionStorage.getItem("intensive_part");
      if (savedPart) setActivePartNumber(Number(savedPart) || 1);
    }
    setIsLoaded(true);
  }, []);

  // Persist selections back to sessionStorage and URL parameters on change
  useEffect(() => {
    if (!isLoaded) return;

    sessionStorage.setItem("intensive_view", view);
    sessionStorage.setItem("intensive_skill", skill.toLowerCase());
    sessionStorage.setItem("intensive_part", String(activePartNumber));

    const params = new URLSearchParams(searchParams.toString());
    let changed = false;
    if (params.get("view") !== view) {
      params.set("view", view);
      changed = true;
    }
    if (params.get("skill") !== skill.toLowerCase()) {
      params.set("skill", skill.toLowerCase());
      changed = true;
    }
    if (Number(params.get("part")) !== activePartNumber) {
      params.set("part", String(activePartNumber));
      changed = true;
    }
    if (changed) {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [view, skill, activePartNumber, isLoaded, pathname, router, searchParams]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    examsApi
      .getIntensiveCatalog(skill)
      .then((res) => {
        if (!mounted) return;
        setData(res);
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

  useEffect(() => {
    if (data?.groups) {
      const allTests = data.groups.flatMap(g => g.tests);
      if (allTests.length > 0 && (!customExamId || !allTests.find(t => t.examId === customExamId))) {
        const ielts17 = data.groups.find(g => g.title.includes("17"));
        if (ielts17 && ielts17.tests.length > 0) {
          setCustomExamId(ielts17.tests[0].examId);
        } else {
          setCustomExamId(allTests[0].examId);
        }
      }
    }
  }, [data, customExamId]);

  useEffect(() => {
    let mounted = true;
    if (view !== "practice") return;
    setPracticeLoading(true);
    examsApi
      .getPracticeCatalog(skill)
      .then(res => {
        if (!mounted) return;
        setPracticeData(res);
      })
      .catch(e => console.error(e))
      .finally(() => {
        if (!mounted) return;
        setPracticeLoading(false);
      });

    return () => { mounted = false; };
  }, [view, skill]);



  const rawGroups = useMemo(() => data?.groups ?? [], [data]);

  // Apply search + status filter across groups/tests
  const groups = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rawGroups
      .map((g) => {
        // Filter by group title
        const titleMatch = !q || g.title.toLowerCase().includes(q);
        // Filter tests by status
        const filteredTests = g.tests.filter((t) => {
          const taken = (t.myScore ?? 0) > 0;
          if (statusFilter === "taken") return taken;
          if (statusFilter === "not-taken") return !taken;
          return true;
        });
        if (!titleMatch && filteredTests.length === 0) return null;
        return { ...g, tests: titleMatch ? filteredTests : [] };
      })
      .filter((g): g is NonNullable<typeof g> => g !== null && g.tests.length > 0);
  }, [rawGroups, search, statusFilter]);

  const totalResults = groups.reduce((acc, g) => acc + g.tests.length, 0);
  const hasActiveFilter = search !== "" || statusFilter !== "all";

  const mainContent = (
    <main className={`flex-1 min-w-0 bg-white dark:bg-slate-950 overflow-y-auto px-3 md:px-6 py-2 ${embedded ? 'h-full' : ''}`}>


      {/* Mock Test view — existing tabs + catalog */}
      {view === "mock-test" && (<>
        {/* Skill Tabs */}
        <div className="flex items-center gap-4 md:gap-8 mb-6 overflow-x-auto no-scrollbar">
          {SKILLS.map((s) => {
            const active = skill === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setSkill(s.key)}
                className={`whitespace-nowrap relative py-4 text-sm font-bold flex items-center gap-2 transition-colors ${active ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300"}`}
              >
                {s.icon}
                {s.label}
                <span
                  className={`absolute left-0 -bottom-[1px] h-[3px] rounded-full bg-primary transition-all ${active ? "w-full" : "w-0"}`}
                />
              </button>
            );
          })}
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Cambridge IELTS books…"
              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 text-sm text-gray-800 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="shrink-0 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 text-sm font-semibold text-gray-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition cursor-pointer"
          >
            <option value="all">All tests</option>
            <option value="not-taken">Not taken</option>
            <option value="taken">Completed</option>
          </select>
        </div>

        {/* Result summary */}
        {hasActiveFilter && !loading && (
          <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">
            Showing <span className="font-semibold text-gray-600 dark:text-slate-300">{totalResults}</span> test{totalResults !== 1 ? "s" : ""}
            {search && <> matching &ldquo;<span className="font-semibold text-gray-700 dark:text-slate-200">{search}</span>&rdquo;</>}
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-gray-50 dark:bg-slate-900 rounded-2xl p-6 animate-pulse">
                <div className="h-6 w-56 bg-gray-200 dark:bg-slate-800 rounded mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((k) => (
                    <div key={k} className="h-20 bg-gray-200 dark:bg-slate-800 rounded-2xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-center">
            <p className="font-semibold">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-900/60 text-red-800 dark:text-red-300 font-bold rounded-xl transition-colors text-sm"
            >
              Reload Page
            </button>
          </div>
        )}

        {!loading && !error && groups.length === 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-5">
            {hasActiveFilter
              ? "No tests match your search or filters. Try adjusting them."
              : <>
                No published Cambridge exams found for {skill}. Make sure exam titles follow:
                <div className="mt-2 font-mono text-xs text-amber-900/80 dark:text-amber-400/80">
                  Cambridge IELTS 17 - {skill.charAt(0) + skill.slice(1).toLowerCase()} Test 1
                </div>
              </>
            }
          </div>
        )}

        {/* Groups */}
        {!loading && !error && groups.length > 0 && (
          <div className="space-y-8 pb-4">
            {groups.map((g) => {
              const isCollapsed = collapsed[g.id] ?? false;
              return (
                <section key={g.id} className="bg-white dark:bg-slate-900 shadow-sm border border-black/1 dark:border-slate-800 rounded-2xl">
                  <button
                    onClick={() => setCollapsed((prev) => ({ ...prev, [g.id]: !isCollapsed }))}
                    className="w-full px-6 py-5 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {g.imageUrl ? (
                        <img src={g.imageUrl} alt={g.title} className="w-[50px] h-[70px] object-cover rounded shadow-sm flex-shrink-0" />
                      ) : (
                        <div className="w-[50px] h-[70px] rounded bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-bold text-gray-500 dark:text-slate-400 text-center px-1 leading-tight">
                            {g.title.replace("Cambridge IELTS ", "IELTS\n")}
                          </span>
                        </div>
                      )}
                      <div className="min-w-0 text-left flex flex-col gap-1">
                        <div className="font-extrabold text-gray-900 dark:text-white truncate">{g.title}</div>
                        <StatPill icon={<SmallIcon name="users" />} value={`${g.participantsCount}`} label="participants" />
                        <StatPill icon={<SmallIcon name="check" />} value={`${g.completedCount}`} label="completed" />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-gray-400 dark:text-slate-500">
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
      </>)}

      {view === "practice" && (
        <>
          <div className="flex items-center gap-4 md:gap-8 mb-6 border-b border-gray-100 dark:border-slate-800 overflow-x-auto">
            {SKILLS.map((s) => {
              const active = skill === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => { setSkill(s.key); setActivePartNumber(1); }}
                  className={`whitespace-nowrap relative py-4 text-sm font-bold flex items-center gap-2 transition-colors ${active ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300"}`}
                >
                  {s.icon}
                  {s.label}
                  <span className={`absolute left-0 -bottom-[1px] h-[3px] rounded-full bg-primary transition-all ${active ? "w-full" : "w-0"}`} />
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 md:gap-4 mb-8 overflow-x-auto pb-2">
            {[1, 2, 3, 4].map((partNum) => {
              const active = activePartNumber === partNum;
              return (
                <button
                  key={partNum}
                  onClick={() => setActivePartNumber(partNum)}
                  className={`shrink-0 flex items-center justify-center gap-2 px-4 md:px-6 py-3 rounded-2xl flex-1 border transition-colors ${active ? "bg-white dark:bg-slate-800 border-primary shadow-sm text-primary font-bold" : "bg-gray-50/50 dark:bg-slate-900/50 border-gray-100 dark:border-slate-800 text-gray-500 dark:text-slate-400 font-semibold hover:bg-gray-50 dark:hover:bg-slate-800"}`}
                >
                  <svg viewBox="0 0 24 24" className={`hidden sm:block w-5 h-5 ${active ? "text-primary" : "text-gray-400 dark:text-slate-500"}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                  <div className="flex flex-col items-start gap-[1px]">
                    <span className="text-sm">Part {partNum}</span>
                    {skill === "LISTENING" && <span className="hidden lg:block text-[10px] opacity-70 font-medium tracking-wide whitespace-nowrap">
                      {partNum === 1 ? "Basic Conversation" : partNum === 2 ? "Short Monologue" : partNum === 3 ? "Academic Discussion" : "Academic Lecture"}
                    </span>}
                  </div>
                </button>
              )
            })}
          </div>

          <div className="space-y-4 pb-4">
            {practiceLoading && <div className="py-10 text-center text-gray-500 dark:text-slate-400 font-medium">Loading practice items...</div>}
            {!practiceLoading && practiceData?.items && (() => {
              const items = practiceData.items.filter(i => i.partNumber === activePartNumber);
              if (items.length === 0) return <div className="py-10 text-center text-gray-500 dark:text-slate-400 font-medium bg-gray-50 dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">No practice items found for this part.</div>;

              return items.map(item => (
                <div key={item.id} className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-md transition-shadow">

                  <div className="flex gap-6 items-center flex-1 w-full">
                    <div className={`relative shrink-0 w-16 h-16 rounded-full border-[3px] flex flex-col items-center justify-center bg-white dark:bg-slate-900 ${item.myScore !== undefined ? "border-green-500 text-green-600 dark:border-green-500 dark:text-green-500" : "border-gray-200 text-gray-400 dark:border-slate-700 dark:text-slate-500"}`}>
                      {item.myScore !== undefined ? (
                        <>
                          <span className="font-black leading-none text-xl">{item.myScore}</span>
                          <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 mt-0.5">/ {item.totalQuestions}</span>
                        </>
                      ) : (
                        <span className="font-extrabold leading-none text-xl">-</span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-[3px] rounded-md bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 text-[10px] font-bold tracking-wide uppercase truncate">{item.testTitle}</span>
                      </div>
                      <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight truncate">{item.topic}</h3>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center justify-end w-full md:w-auto mt-4 md:mt-0">
                    <button
                      onClick={() => window.location.href = `/ielts/intensive/${item.examId}/start?practicePart=${item.partNumber}`}
                      className="w-full md:w-auto px-6 py-3 rounded-xl border-2 border-primary hover:bg-primary hover:text-white text-primary text-sm font-bold shadow-sm transition-all bg-white dark:bg-slate-800 flex items-center justify-center gap-2 group"
                    >
                      Start Test
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                </div>
              ));
            })()}
          </div>
        </>
      )}

      {view === "custom-practice" && (
        <div className="flex flex-col h-full max-w-3xl pb-8">
          <div className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">Custom Practice</div>
          <div className="text-gray-500 dark:text-slate-400 text-sm mb-8">Build your own practice session exactly the way you want.</div>

          {/* Skill Selector */}
          <div className="mb-8">
            <div className="font-bold text-gray-900 dark:text-white mb-3 text-sm">1. Select Skill</div>
            <div className="flex flex-wrap gap-3">
              {SKILLS.map((s) => {
                const active = skill === s.key;
                return (
                  <button
                    key={s.key}
                    onClick={() => { setSkill(s.key); setCustomPart("all"); }}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all border-2 ${active ? "border-primary bg-primary/5 text-gray-900 dark:text-white shadow-sm" : "border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-400 dark:text-slate-500 hover:border-gray-200 dark:hover:border-slate-700"}`}
                  >
                    {s.icon} {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Exam Selector */}
          <div className="mb-8">
            <div className="font-bold text-gray-900 dark:text-white mb-3 text-sm">2. Select Exam Source</div>
            {loading && <div className="h-12 bg-gray-100 dark:bg-slate-800 animate-pulse rounded-xl shadow-inner w-full" />}
            {!loading && (
              <div className="relative border-2 border-gray-100 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm hover:border-gray-200 dark:hover:border-slate-700 transition overflow-hidden">
                <select
                  value={customExamId}
                  onChange={(e) => setCustomExamId(e.target.value)}
                  className="w-full px-4 py-3 bg-transparent text-gray-800 dark:text-slate-200 font-bold focus:outline-none focus:ring-0 appearance-none cursor-pointer text-sm"
                >
                  {data?.groups.map(g => (
                    <optgroup key={g.id} label={g.title}>
                      {g.tests.map(t => (
                        <option key={t.examId} value={t.examId}>
                          {g.title} - {skill.charAt(0) + skill.slice(1).toLowerCase()} Test {t.testNumber}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
              </div>
            )}
          </div>

          {/* Parts Selector */}
          <div className="mb-8">
            <div className="font-bold text-gray-900 dark:text-white mb-3 text-sm">3. Select Parts</div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setCustomPart("all")}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${customPart === "all" ? "border-primary bg-primary/5 text-gray-900 dark:text-white" : "border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-500 dark:text-slate-400 hover:border-gray-200 dark:hover:border-slate-700"}`}
              >
                All Parts
              </button>
              {Array.from({ length: skill === "LISTENING" ? 4 : skill === "READING" ? 3 : skill === "WRITING" ? 2 : 3 }).map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCustomPart(i + 1)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${customPart === i + 1 ? "border-primary bg-primary/5 text-gray-900 dark:text-white" : "border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-500 dark:text-slate-400 hover:border-gray-200 dark:hover:border-slate-700"}`}
                >
                  Part {i + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Time Limit */}
          <div className="mb-8">
            <div className="font-bold text-gray-900 dark:text-white mb-3 text-sm">4. Time Limit</div>
            <div className="flex flex-wrap gap-3 mb-4">
              {[10, 20, 30, 40, 60].map(mins => (
                <button
                  key={mins}
                  onClick={() => { setIsCustomTimeMode(false); setCustomTime(mins); }}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${!isCustomTimeMode && customTime === mins ? "border-primary bg-primary/5 text-gray-900 dark:text-white" : "border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-500 dark:text-slate-400 hover:border-gray-200 dark:hover:border-slate-700"}`}
                >
                  {mins} min
                </button>
              ))}
              <button
                onClick={() => setIsCustomTimeMode(true)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${isCustomTimeMode ? "border-primary bg-primary/5 text-gray-900 dark:text-white" : "border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-500 dark:text-slate-400 hover:border-gray-200 dark:hover:border-slate-700"}`}
              >
                Custom
              </button>
            </div>
            {isCustomTimeMode && (
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={customTimeStr}
                  onChange={(e) => {
                    setCustomTimeStr(e.target.value);
                    const v = parseInt(e.target.value);
                    if (!isNaN(v) && v > 0) setCustomTime(v);
                  }}
                  className="w-24 px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-slate-800 focus:border-primary focus:outline-none font-bold text-gray-900 dark:text-white text-center bg-transparent"
                  min="1"
                  max="180"
                />
                <span className="text-sm font-bold text-gray-500 dark:text-slate-400">minutes</span>
              </div>
            )}
          </div>

          {/* Auto Submit */}
          <div className="mb-10 flex items-center gap-4 border-t border-gray-100 dark:border-slate-800 pt-6">
            <div className="flex-1">
              <div className="font-bold text-gray-900 dark:text-white text-sm">Auto-Submit when time is up</div>
              <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">If turned off, you can continue practicing after the timer reaches zero.</div>
            </div>
            <button
              onClick={() => setCustomAutoSubmit(!customAutoSubmit)}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${customAutoSubmit ? "bg-primary" : "bg-gray-200 dark:bg-slate-700"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${customAutoSubmit ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>

          <button
            disabled={!customExamId}
            onClick={() => {
              let url = `/ielts/intensive/${customExamId}/start?type=${skill}`;
              if (customPart !== "all") url += `&practicePart=${customPart}`;
              url += `&customTime=${customTime}&autoSubmit=${customAutoSubmit}`;
              window.location.href = url;
            }}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gray-900 dark:bg-slate-800 hover:bg-black dark:hover:bg-slate-700 text-white font-black shadow-lg shadow-gray-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            Start Custom Practice
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </div>
      )}

    </main>
  );

  if (embedded) return mainContent;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 font-sans">
      <div className="container mx-auto max-w-screen-xl px-4 py-4">

        <div className="flex gap-4 mt-2">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="h-full bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
              <div className="p-4 space-y-1">
                {/* Custom Practice */}
                <button
                  onClick={() => setView("custom-practice")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${view === "custom-practice"
                    ? "font-bold bg-primary/10 text-primary"
                    : "font-semibold text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-900 hover:text-gray-900 dark:hover:text-white"
                    }`}
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 21v-7" /><path d="M4 10V3" /><path d="M12 21v-9" /><path d="M12 8V3" /><path d="M20 21v-5" /><path d="M20 12V3" /><path d="M1 14h6" /><path d="M9 8h6" /><path d="M17 16h6" /></svg>
                  Custom Practice
                </button>

                {/* Mock Test accordion */}
                <div className="space-y-0.5">
                  <button
                    onClick={() => setMockTestOpen(o => !o)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors hover:bg-gray-50 dark:hover:bg-slate-900 ${view === "mock-test" || view === "practice" ? "text-primary" : "text-gray-700 dark:text-slate-300"}`}
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                    Mock Test
                    <svg viewBox="0 0 24 24" className={`w-4 h-4 shrink-0 ml-auto text-gray-400 dark:text-slate-500 transition-transform duration-200 ${mockTestOpen ? "" : "-rotate-90"}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                  </button>

                  {mockTestOpen && (
                    <div className="pl-3 space-y-0.5 border-l-2 border-gray-100 dark:border-slate-800 ml-6">
                      {/* Per Part sub-item */}
                      <button
                        onClick={() => setView("practice")}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${view === "practice"
                          ? "font-bold bg-primary/10 text-primary"
                          : "font-semibold text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-900 hover:text-gray-800 dark:hover:text-slate-200"
                          }`}
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                        Per Part
                      </button>

                      {/* Part Skill sub-item */}
                      <button
                        onClick={() => setView("mock-test")}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${view === "mock-test"
                          ? "font-bold bg-primary/10 text-primary"
                          : "font-semibold text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-900 hover:text-gray-800 dark:hover:text-slate-200"
                          }`}
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 10h12M4 14h8" /></svg>
                        Part Skill
                      </button>

                      {/* Per Test — coming soon placeholder */}
                      <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-300 dark:text-slate-600 cursor-not-allowed select-none">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
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
                    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="9" /></svg>
                    Test History
                    <svg viewBox="0 0 24 24" className={`w-4 h-4 shrink-0 ml-auto text-gray-400 dark:text-slate-500 transition-transform duration-200 ${testHistoryOpen ? "" : "-rotate-90"}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                  </button>

                  {testHistoryOpen && (
                    <div className="pl-3 space-y-0.5 border-l-2 border-gray-100 dark:border-slate-800 ml-6">
                      <Link
                        href="/ielts/history?mode=practice"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-900 hover:text-gray-800 dark:hover:text-slate-200 transition-colors"
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                        Per Part
                      </Link>

                      <Link
                        href="/ielts/history?mode=mock"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-900 hover:text-gray-800 dark:hover:text-slate-200 transition-colors"
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 10h12M4 14h8" /></svg>
                        Part Skill
                      </Link>

                      <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-300 dark:text-slate-600 cursor-not-allowed select-none">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
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

          {mainContent}
        </div>
      </div>
    </div>
  );
}

export default function IntensiveContent({ embedded, initialView }: { embedded?: boolean; initialView?: string }) {
  return (
    <Suspense fallback={
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
      </div>
    }>
      <IeltsIntensiveContentInner embedded={embedded} initialView={initialView} />
    </Suspense>
  );
}
