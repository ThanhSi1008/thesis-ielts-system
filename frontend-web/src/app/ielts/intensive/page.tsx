"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { examsApi } from "@/services/exams.api";
import type { IeltsIntensiveCatalogResponse, IeltsIntensiveGroup, IeltsSkill } from "@/types";

import { Headphones, BookOpen, PenTool, Mic, Search, X, TrendingUp } from "lucide-react";

const SKILLS: Array<{ key: IeltsSkill; label: string; icon: JSX.Element }> = [
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
  // WRITING/SPEAKING saves the band directly (e.g. 6.5); READING has its own table
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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="font-extrabold text-gray-900 text-sm">{label} Progress</span>
          </div>
          <div className="text-xs text-gray-400 mt-0.5">Band score over your last {points.length} attempt{points.length !== 1 ? 's' : ''}</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black" style={{ color: strokeColor }}>{latestBand.toFixed(1)}</div>
          <div className="text-[11px] text-gray-400 font-semibold">Latest band</div>
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

function IeltsIntensiveContent() {
  const searchParams = useSearchParams();
  const [skill, setSkill] = useState<IeltsSkill>("LISTENING");
  const [data, setData] = useState<IeltsIntensiveCatalogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [historyPoints, setHistoryPoints] = useState<{ date: string; band: number; title: string }[]>([]);
  const [readingPoints, setReadingPoints] = useState<{ date: string; band: number; title: string }[]>([]);
  const [writingPoints, setWritingPoints] = useState<{ date: string; band: number; title: string }[]>([]);
  const [speakingPoints, setSpeakingPoints] = useState<{ date: string; band: number; title: string }[]>([]);
  const [view, setView] = useState<"dashboard" | "mock-test">(
    searchParams?.get("view") === "dashboard" ? "dashboard" : "mock-test"
  );

  // Search & filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

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

  // Load history for the charts
  useEffect(() => {
    examsApi.getHistory()
      .then(items => {
        const toPoints = (skill: string) =>
          items
            .filter((h: any) => h.skill === skill)
            .sort((a: any, b: any) => new Date(a.dateTaken).getTime() - new Date(b.dateTaken).getTime())
            .slice(-10)
            .map((h: any) => {
              let band = 1.0;
              if (skill === "WRITING" || skill === "SPEAKING") {
                band = h.writingScore ?? h.rawScore ?? 0;
              } else if (skill === "READING") {
                band = getIeltsReadingBand(h.rawScore); // Wait, looking at page.tsx originally it used getIeltsBandFromScore which is hardcoded for Listening.. Wait, let me fix it!
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
      })
      .catch(() => { });
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="container mx-auto max-w-screen-xl px-4 py-4">

        <div className="flex gap-4 mt-2">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 space-y-4">
                <button
                  onClick={() => setView("dashboard")}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-colors ${view === "dashboard"
                    ? "font-bold bg-primary/10 text-primary"
                    : "font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                    Dashboard
                  </div>
                </button>

                <button
                  onClick={() => setView("mock-test")}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-colors ${view === "mock-test"
                    ? "font-bold bg-primary/10 text-primary"
                    : "font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                    Mock Test
                  </div>
                </button>

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

          <main className="flex-1 min-w-0 bg-white rounded-2xl shadow-sm overflow-hidden px-8 py-4">
            {/* Dashboard view — chart only */}
            {view === "dashboard" && (
              <div className="flex flex-col h-full">
                <div className="text-lg font-extrabold text-gray-900 mb-5">Dashboard</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                  {/* Listening */}
                  {historyPoints.length >= 2 ? (
                    <BandScoreChart points={historyPoints} label="Listening" />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400 border border-gray-100 bg-white rounded-2xl h-full min-h-[200px]">
                      <TrendingUp className="w-10 h-10 mb-3 opacity-30" />
                      <div className="font-semibold">No Listening chart data yet</div>
                      <div className="text-sm mt-1">Complete at least 2 listening tests.</div>
                    </div>
                  )}
                  {/* Reading */}
                  {readingPoints.length >= 2 ? (
                    <BandScoreChart points={readingPoints} label="Reading" />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400 border border-gray-100 bg-white rounded-2xl h-full min-h-[200px]">
                      <TrendingUp className="w-10 h-10 mb-3 opacity-30" />
                      <div className="font-semibold">No Reading chart data yet</div>
                      <div className="text-sm mt-1">Complete at least 2 reading tests.</div>
                    </div>
                  )}
                  {/* Writing */}
                  {writingPoints.length >= 2 ? (
                    <BandScoreChart points={writingPoints} label="Writing" />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400 border border-gray-100 bg-white rounded-2xl h-full min-h-[200px]">
                      <TrendingUp className="w-10 h-10 mb-3 opacity-30" />
                      <div className="font-semibold">No Writing chart data yet</div>
                      <div className="text-sm mt-1">Complete at least 2 writing tests.</div>
                    </div>
                  )}
                  {/* Speaking */}
                  {speakingPoints.length >= 2 ? (
                    <BandScoreChart points={speakingPoints} label="Speaking" />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400 border border-gray-100 bg-white rounded-2xl h-full min-h-[200px]">
                      <TrendingUp className="w-10 h-10 mb-3 opacity-30" />
                      <div className="font-semibold">No Speaking chart data yet</div>
                      <div className="text-sm mt-1">Complete at least 2 speaking tests.</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mock Test view — existing tabs + catalog */}
            {view === "mock-test" && (<>
              {/* Skill Tabs */}
              <div className="flex items-center gap-8 mb-6 border-b border-gray-100">
                {SKILLS.map((s) => {
                  const active = skill === s.key;
                  return (
                    <button
                      key={s.key}
                      onClick={() => setSkill(s.key)}
                      className={`relative py-4 text-sm font-bold flex items-center gap-2 transition-colors ${active ? "text-gray-900" : "text-gray-400 hover:text-gray-700"}`}
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
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search Cambridge IELTS books…"
                    className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Status filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="shrink-0 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition cursor-pointer"
                >
                  <option value="all">All tests</option>
                  <option value="not-taken">Not taken</option>
                  <option value="taken">Completed</option>
                </select>
              </div>

              {/* Removed chart from mock-test view */}

              {/* Result summary */}
              {hasActiveFilter && !loading && (
                <p className="text-xs text-gray-400 mb-4">
                  Showing <span className="font-semibold text-gray-600">{totalResults}</span> test{totalResults !== 1 ? "s" : ""}
                  {search && <> matching &ldquo;<span className="font-semibold text-gray-700">{search}</span>&rdquo;</>}
                </p>
              )}

              {/* Loading */}
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
                <div className="bg-red-50 text-red-700 border border-red-100 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-center">
                  <p className="font-semibold">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 font-bold rounded-xl transition-colors text-sm"
                  >
                    Reload Page
                  </button>
                </div>
              )}

              {!loading && !error && groups.length === 0 && (
                <div className="bg-amber-50 text-amber-800 border border-amber-100 rounded-2xl p-5">
                  {hasActiveFilter
                    ? "No tests match your search or filters. Try adjusting them."
                    : <>
                      No published Cambridge exams found for {skill}. Make sure exam titles follow:
                      <div className="mt-2 font-mono text-xs text-amber-900/80">
                        Cambridge IELTS 17 - {skill.charAt(0) + skill.slice(1).toLowerCase()} Test 1
                      </div>
                    </>
                  }
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
            </>)}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function IeltsIntensivePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
      </div>
    }>
      <IeltsIntensiveContent />
    </Suspense>
  );
}
