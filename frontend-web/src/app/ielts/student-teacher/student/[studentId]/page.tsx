"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, GraduationCap, Calendar, Brain, Clock, ChevronRight, TestTube, Library, Activity, BookOpen, PenTool, Headphones, Dumbbell, X } from "lucide-react";
import { API_BASE_URL } from "@/constants";
// Reuse the BandScoreChart from intensive page
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
    <div className="bg-white p-5 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
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

function toneByBandScore(band: number): { bg: string; text: string; bgLight: string } {
  if (band >= 8.0) return { bg: "bg-success", text: "text-success", bgLight: "bg-success/10" };
  if (band >= 6.5) return { bg: "bg-info", text: "text-info", bgLight: "bg-info/10" };
  if (band >= 5.0) return { bg: "bg-warning", text: "text-warning", bgLight: "bg-warning/10" };
  return { bg: "bg-danger", text: "text-danger", bgLight: "bg-danger/10" };
}

export default function TeacherDrilldownPage(props: { params: { studentId: string } }) {
  const { studentId } = props.params;

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_BASE_URL}/users/student/${studentId}/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to load student stats");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [studentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4 text-center">
        <div className="bg-white p-8 max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-6">You do not have access to this student's statistics or they do not exist.</p>
          <Link href="/ielts/student-teacher" className="inline-block bg-primary text-white font-bold py-2.5 px-6 rounded-xl hover:bg-primary/90 transition-colors">
            Go Back
          </Link>
        </div>
      </div>
    );
  }

  // Calculate chart data from mock exams
  const exams = stats?.examSessions || [];
  const getIeltsBand = (score: number) => {
    // simplified listening band
    if (score >= 39) return 9.0; if (score >= 37) return 8.5; if (score >= 35) return 8.0;
    if (score >= 32) return 7.5; if (score >= 30) return 7.0; if (score >= 26) return 6.5;
    if (score >= 23) return 6.0; if (score >= 18) return 5.5; if (score >= 16) return 5.0;
    if (score >= 13) return 4.5; if (score >= 10) return 4.0; if (score >= 8) return 3.5;
    if (score >= 6) return 3.0; if (score >= 4) return 2.5; if (score >= 2) return 2.0;
    return 1.0;
  };

  const getReadingBand = (score: number) => getIeltsBand(score);

  const listeningPoints = exams
    .filter((e: any) => e.exam.title.toLowerCase().includes("listening") || e.exam.type === "LISTENING")
    .map((e: any) => ({ date: e.createdAt, band: getIeltsBand(e.result?.totalScore || 0), title: e.exam.title }));
    
  const readingPoints = exams
    .filter((e: any) => e.exam.title.toLowerCase().includes("reading") || e.exam.type === "READING")
    .map((e: any) => ({ date: e.createdAt, band: getReadingBand(e.result?.totalScore || 0), title: e.exam.title }));

  // Aggregate stats
  const totalMocks = exams.length;
  const totalPractices = (stats?.practiceSessions || []).length;
  const lastActiveMocks = exams.length > 0 ? new Date(exams[0].createdAt).toLocaleDateString() : 'N/A';
  const lastActivePractices = stats?.practiceSessions?.length > 0 ? new Date(stats.practiceSessions[0].createdAt).toLocaleDateString() : 'N/A';

  return (
    <div className="min-h-screen bg-white font-sans pb-12">
      {/* Header bar */}
      <div className="bg-white sticky top-0 z-10 w-full">
        <div className="container mx-auto max-w-screen-xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/ielts/student-teacher" className="p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="h-8 w-[1px] bg-gray-200"></div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                Teacher Mode: Student Details
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-screen-xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Sidebar Profile/Summary */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-md font-bold mb-4 ml-auto mr-auto text-2xl">
                 ID
              </div>
              <h2 className="text-xl font-bold text-gray-900 text-center w-full">Student Analytics</h2>
              <div className="text-sm font-medium text-gray-500 w-full text-center">ID: {studentId.slice(0, 8)}...</div>
              
              <div className="w-full h-[1px] bg-gray-100 my-5"></div>
              
              <div className="w-full space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Activity className="w-4 h-4" /> Mock Tests
                  </div>
                  <div className="font-bold text-gray-900">{totalMocks}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Library className="w-4 h-4" /> Practices
                  </div>
                  <div className="font-bold text-gray-900">{totalPractices}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" /> Last Active
                  </div>
                  <div className="font-bold text-gray-900 text-xs">{lastActiveMocks !== 'N/A' ? lastActiveMocks : lastActivePractices}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Dashboard Area */}
          <div className="lg:col-span-3 space-y-8">
            
            <h3 className="section-heading text-lg font-extrabold text-gray-900 mb-2 flex items-center gap-2"><Brain className="w-5 h-5 text-primary" /> Performance Trends</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Listening */}
               {listeningPoints.length >= 2 ? (
                    <BandScoreChart points={listeningPoints} label="Listening" />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400 bg-white h-full min-h-[200px]">
                      <Activity className="w-10 h-10 mb-3 opacity-30" />
                      <div className="font-semibold">Not enough data</div>
                      <div className="text-sm mt-1">Student needs at least 2 mock tests.</div>
                    </div>
                )}
                {/* Reading */}
                {readingPoints.length >= 2 ? (
                    <BandScoreChart points={readingPoints} label="Reading" />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400 bg-white h-full min-h-[200px]">
                      <Activity className="w-10 h-10 mb-3 opacity-30" />
                      <div className="font-semibold">Not enough data</div>
                      <div className="text-sm mt-1">Student needs at least 2 mock tests.</div>
                    </div>
                )}
            </div>

            <h3 className="section-heading mt-8 text-lg font-extrabold text-gray-900 mb-2 flex items-center gap-2"><TestTube className="w-5 h-5 text-primary" /> Recent Mock Tests</h3>
            {exams.length === 0 ? (
                <div className="bg-white p-8 text-center text-gray-500">No mock tests completed by this student.</div>
            ) : (
              <div className="bg-white overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Test</th>
                      <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Type</th>
                      <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Date</th>
                      <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {exams.slice(0, 5).map((session: any) => {
                      let typeIcon = <Headphones className="w-4 h-4 text-blue-500" />;
                      if (session.exam.type === "READING") typeIcon = <BookOpen className="w-4 h-4 text-green-500" />;
                      else if (session.exam.type === "WRITING") typeIcon = <PenTool className="w-4 h-4 text-yellow-500" />;

                      let band = getIeltsBand(session.result?.totalScore || 0);
                      const tone = toneByBandScore(band);

                      return (
                        <tr key={session.id} className="hover:bg-gray-50">
                          <td className="px-5 py-4 font-bold text-gray-900">{session.exam.title}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md inline-flex">
                              {typeIcon} {session.exam.type}
                            </div>
                          </td>
                          <td className="px-5 py-4 text-gray-500 whitespace-nowrap">
                            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gray-400" />{new Date(session.createdAt).toLocaleDateString()}</span>
                          </td>
                          <td className="px-5 py-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-extrabold ${tone.bgLight} ${tone.text}`}>{band.toFixed(1)} Band</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <h3 className="section-heading mt-8 text-lg font-extrabold text-gray-900 mb-2 flex items-center gap-2"><Dumbbell className="w-5 h-5 text-primary" /> Recent Practice Sessions</h3>
             {(stats?.practiceSessions || []).length === 0 ? (
                <div className="bg-white p-8 text-center text-gray-500">No practice sessions completed by this student.</div>
            ) : (
                <div className="bg-white overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Practice Module</th>
                        <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Part Number</th>
                        <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {(stats?.practiceSessions || []).slice(0, 5).map((session: any) => (
                        <tr key={session.id} className="hover:bg-gray-50">
                          <td className="px-5 py-4 font-bold text-gray-900">{session.part.title}</td>
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-purple-50 text-purple-600 text-xs font-bold">Part {session.part.partNumber}</span>
                          </td>
                          <td className="px-5 py-4 text-gray-500 whitespace-nowrap">
                            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gray-400" />{new Date(session.createdAt).toLocaleDateString()}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
