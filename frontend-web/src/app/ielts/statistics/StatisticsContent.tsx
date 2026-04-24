"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, Target, Clock, Zap } from "lucide-react";
import api from "@/lib/api";
import { examsApi } from "@/services/exams.api";

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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-full flex flex-col justify-between">
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
          <div className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Latest band</div>
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

export default function StatisticsContent({ embedded, hideCharts, hideSummary }: { embedded?: boolean, hideCharts?: boolean, hideSummary?: boolean }) {
  const [profile, setProfile] = useState<any>(null);
  const [historyPoints, setHistoryPoints] = useState<{ date: string; band: number; title: string }[]>([]);
  const [readingPoints, setReadingPoints] = useState<{ date: string; band: number; title: string }[]>([]);
  const [writingPoints, setWritingPoints] = useState<{ date: string; band: number; title: string }[]>([]);
  const [speakingPoints, setSpeakingPoints] = useState<{ date: string; band: number; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState<{ currentStreak: number; longestStreak: number } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!hideSummary) {
          const [profileRes, streakRes] = await Promise.all([
            api.get("/ielts/profile"),
            api.get("/ielts/streak").catch(() => ({ data: { currentStreak: 0, longestStreak: 0 } }))
          ]);
          setProfile(profileRes.data);
          setStreak(streakRes.data as { currentStreak: number; longestStreak: number });
        }

        if (!hideCharts) {
          const items = await examsApi.getHistory();
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
  }, [hideCharts]);

  const getQualityLabel = (score?: number) => {
    if (score === undefined || score === null) return null;
    if (score >= 90) return { text: "Excellent", color: "text-green-600 bg-green-50" };
    if (score >= 70) return { text: "Good", color: "text-blue-600 bg-blue-50" };
    if (score >= 50) return { text: "Needs Work", color: "text-amber-600 bg-amber-50" };
    return { text: "Beginner", color: "text-red-500 bg-red-50" };
  };

  return (
    <div className={`w-full bg-white overflow-y-auto px-4 sm:px-8 py-6 ${embedded ? 'h-full' : 'min-h-screen'}`}>
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        
        {/* Top Header / Profile Info */}
        {!hideSummary && !loading && profile && (
           <div className="bg-gray-50/50 border border-gray-100 rounded-3xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
             <div>
               <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
                 Hello, {profile.user?.firstName || profile.user?.lastName ? `${profile.user.firstName || ''} ${profile.user.lastName || ''}`.trim() : "Student"} 👋
               </h1>
               <p className="text-gray-500 font-medium">Here's a snapshot of your IELTS journey.</p>
             </div>

             <div className="flex flex-wrap items-center gap-4">
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 flex gap-4 min-w-[200px]">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                     <Target className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Target Band</div>
                    <div className="text-2xl font-black text-gray-900 leading-none">{profile.targetBand?.toFixed(1) || "-"}</div>
                  </div>
                </div>

                {streak && streak.longestStreak > 0 && (
                  <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 flex gap-4 min-w-[200px]">
                    <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                      <span className="text-xl">🔥</span>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Current Streak</div>
                      <div className="text-2xl font-black text-gray-900 leading-none">
                        {streak.currentStreak} <span className="text-sm font-semibold text-gray-400 ml-1">days</span>
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1 font-medium">Longest: {streak.longestStreak}</div>
                    </div>
                  </div>
                )}

                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 flex gap-4 min-w-[200px]">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                     <Clock className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Daily Study</div>
                    <div className="text-2xl font-black text-gray-900 leading-none">{profile.dailyCommitmentMins || 0}<span className="text-sm text-gray-400 ml-1">m</span></div>
                  </div>
                </div>

                {profile.placementScore !== null && (
                  <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 flex gap-4 min-w-[200px]">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                      <Zap className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Placement</div>
                      <div className="text-2xl font-black text-gray-900 leading-none flex items-center gap-2">
                        {profile.placementScore}% 
                        {getQualityLabel(profile.placementScore) && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-md ${getQualityLabel(profile.placementScore)!.color}`}>
                            {getQualityLabel(profile.placementScore)!.text}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
             </div>
           </div>
        )}

        {!hideCharts && (
          <>
            <div className="text-xl font-extrabold text-gray-900">Performance Dashboard</div>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                <div className="h-48 bg-gray-50 rounded-2xl animate-pulse"></div>
                <div className="h-48 bg-gray-50 rounded-2xl animate-pulse"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                {/* Listening */}
                {historyPoints.length >= 2 ? (
                  <BandScoreChart points={historyPoints} label="Listening" />
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400 border border-gray-100 bg-white shadow-sm rounded-2xl h-full min-h-[200px]">
                    <TrendingUp className="w-10 h-10 mb-3 opacity-30" />
                    <div className="font-semibold">No Listening chart data yet</div>
                    <div className="text-sm mt-1">Complete at least 2 listening tests.</div>
                  </div>
                )}
                
                {/* Reading */}
                {readingPoints.length >= 2 ? (
                  <BandScoreChart points={readingPoints} label="Reading" />
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400 border border-gray-100 bg-white shadow-sm rounded-2xl h-full min-h-[200px]">
                    <TrendingUp className="w-10 h-10 mb-3 opacity-30" />
                    <div className="font-semibold">No Reading chart data yet</div>
                    <div className="text-sm mt-1">Complete at least 2 reading tests.</div>
                  </div>
                )}
                
                {/* Writing */}
                {writingPoints.length >= 2 ? (
                  <BandScoreChart points={writingPoints} label="Writing" />
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400 border border-gray-100 bg-white shadow-sm rounded-2xl h-full min-h-[200px]">
                    <TrendingUp className="w-10 h-10 mb-3 opacity-30" />
                    <div className="font-semibold">No Writing chart data yet</div>
                    <div className="text-sm mt-1">Complete at least 2 writing tests.</div>
                  </div>
                )}
                
                {/* Speaking */}
                {speakingPoints.length >= 2 ? (
                  <BandScoreChart points={speakingPoints} label="Speaking" />
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400 border border-gray-100 bg-white shadow-sm rounded-2xl h-full min-h-[200px]">
                    <TrendingUp className="w-10 h-10 mb-3 opacity-30" />
                    <div className="font-semibold">No Speaking chart data yet</div>
                    <div className="text-sm mt-1">Complete at least 2 speaking tests.</div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
