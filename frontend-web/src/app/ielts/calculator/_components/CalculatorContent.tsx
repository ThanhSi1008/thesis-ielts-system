"use client";
import React, { useState } from "react";
import { Headphones, BookOpen, PenTool, Mic, Info } from "lucide-react";
import { calculateOverallBand, getUniqueBands, LISTENING_SCORE_TABLE } from "@/lib/calculator-data";
import ListeningCalculator from "./ListeningCalculator";
import ReadingCalculator from "./ReadingCalculator";
import WritingDescriptors from "./WritingDescriptors";
import SpeakingDescriptors from "./SpeakingDescriptors";

// ─── Tab config (OCP: add tabs here only) ────────────────────────────────────
const CALCULATOR_TABS = [
  { key: "listening", label: "Listening", icon: Headphones },
  { key: "reading",   label: "Reading",   icon: BookOpen },
  { key: "writing",   label: "Writing",   icon: PenTool },
  { key: "speaking",  label: "Speaking",  icon: Mic },
] as const;

type TabKey = (typeof CALCULATOR_TABS)[number]["key"];

const ALL_BANDS = getUniqueBands(LISTENING_SCORE_TABLE);

// ─── Overall Band Banner ──────────────────────────────────────────────────────
function OverallBandCalculator() {
  const [bands, setBands] = useState<Record<string, string>>({
    listening: "",
    reading: "",
    writing: "",
    speaking: "",
  });

  const filledBands = Object.values(bands).filter((v) => v !== "").map(Number);
  const allFilled = filledBands.length === 4;
  const overall = allFilled
    ? calculateOverallBand(
        Number(bands.listening),
        Number(bands.reading),
        Number(bands.writing),
        Number(bands.speaking),
      )
    : null;

  const bandColor =
    overall === null
      ? "text-slate-400"
      : overall >= 7.0
      ? "text-emerald-500"
      : overall >= 5.5
      ? "text-blue-500"
      : "text-amber-500";

  const skills = [
    { key: "listening", label: "Listening", icon: Headphones },
    { key: "reading",   label: "Reading",   icon: BookOpen },
    { key: "writing",   label: "Writing",   icon: PenTool },
    { key: "speaking",  label: "Speaking",  icon: Mic },
  ];

  return (
    <div className="relative overflow-hidden group">
      {/* Decorative background elements */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/10 transition-colors duration-700" />
      <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/10 transition-colors duration-700" />
      
      <div className="relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-center gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Info className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Overall Band Calculator</h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-lg">
              Enter your band score for each skill to instantly estimate your overall IELTS band score based on official rounding rules.
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {skills.map(({ key, label, icon: Icon }) => (
                <div key={key} className="flex flex-col gap-2">
                  <label
                    htmlFor={`overall-${key}`}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </label>
                  <select
                    id={`overall-${key}`}
                    value={bands[key]}
                    onChange={(e) => setBands((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="appearance-none px-4 py-3 text-sm font-bold border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <option value="">—</option>
                    {ALL_BANDS.map((b) => (
                      <option key={b} value={b}>
                        {b === 0 ? "0" : b.toFixed(1)}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-8 bg-slate-950 dark:bg-black rounded-2xl border border-white/10 shadow-2xl min-w-[200px] transform transition-transform hover:scale-[1.02] duration-300">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">
              Estimated
            </span>
            <div className="relative">
              {overall !== null && (
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
              )}
              <span className={`relative text-7xl font-black tabular-nums leading-none tracking-tighter ${bandColor}`}>
                {overall !== null ? (overall === 0 ? "0" : overall.toFixed(1)) : "—"}
              </span>
            </div>
            <span className="text-[11px] font-black text-slate-400 mt-4 uppercase tracking-[0.15em]">
              Overall Band
            </span>
            {!allFilled && (
              <span className="text-[10px] font-bold text-slate-600 mt-3 animate-pulse">Select all skills</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Content ─────────────────────────────────────────────────────────────
export default function CalculatorContent() {
  const [activeTab, setActiveTab] = useState<TabKey>("listening");

  return (
    <div className="w-full bg-[#fafbfc] dark:bg-slate-950 overflow-y-auto px-4 sm:px-12 py-10 min-h-screen relative">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      
      <div className="max-w-6xl mx-auto flex flex-col gap-10 relative">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2">IELTS Calculator</h1>
            <p className="text-base font-medium text-slate-500 dark:text-slate-400">
              Access precise score conversion tables and official band descriptors.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Official Standards</span>
          </div>
        </div>

        {/* Overall Band Calculator Section */}
        <OverallBandCalculator />

        {/* 4-Tab Navigation */}
        <div className="flex flex-wrap sm:flex-nowrap bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-2xl shadow-sm gap-1.5">
          {CALCULATOR_TABS.map(({ key, label, icon: Icon }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={[
                  "flex-1 flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl text-sm font-bold transition-all duration-300",
                  isActive
                    ? "bg-primary text-gray-900 shadow-lg shadow-primary/20 scale-[1.02]"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800",
                ].join(" ")}
              >
                <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? "text-gray-900" : "text-slate-400"}`} />
                {label}
              </button>
            );
          })}
        </div>

        {/* Tab Content with animation */}
        <div key={activeTab} className="animate-fade-up">
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-1 shadow-sm">
            <div className="p-6 sm:p-10">
              {activeTab === "listening" && <ListeningCalculator />}
              {activeTab === "reading"   && <ReadingCalculator />}
              {activeTab === "writing"   && <WritingDescriptors />}
              {activeTab === "speaking"  && <SpeakingDescriptors />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

