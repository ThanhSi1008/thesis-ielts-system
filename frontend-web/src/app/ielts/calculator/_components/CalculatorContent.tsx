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
      <div className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-8 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-center gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <Info className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">Overall Band Calculator</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 max-w-lg leading-relaxed">
              Enter your band score for each skill to instantly estimate your overall IELTS band score based on official rounding rules.
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {skills.map(({ key, label, icon: Icon }) => (
                <div key={key} className="flex flex-col gap-1.5">
                  <label
                    htmlFor={`overall-${key}`}
                    className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500"
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </label>
                  <select
                    id={`overall-${key}`}
                    value={bands[key]}
                    onChange={(e) => setBands((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="appearance-none px-3.5 py-2.5 text-sm font-bold border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-slate-100 dark:focus:ring-slate-800/50 focus:border-slate-300 dark:focus:border-slate-600 transition-all cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
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

          <div className="flex flex-col items-center justify-center p-6 bg-slate-900 dark:bg-black rounded-3xl border border-white/5 shadow-xl min-w-[180px]">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-1.5">
              Estimated
            </span>
            <div className="relative">
              <span className={`relative text-5xl font-black tabular-nums leading-none tracking-tighter ${bandColor}`}>
                {overall !== null ? (overall === 0 ? "0" : overall.toFixed(1)) : "—"}
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 mt-3.5 uppercase tracking-[0.15em]">
              Overall Band
            </span>
            {!allFilled && (
              <span className="text-[9px] font-medium text-slate-600 mt-2.5 animate-pulse">Select all skills</span>
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
    <div className="w-full bg-slate-50 dark:bg-slate-950 overflow-y-auto px-4 sm:px-12 py-10 min-h-screen relative">
      
      <div className="max-w-6xl mx-auto flex flex-col gap-6 relative">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/50">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-0.5">IELTS Calculator</h1>
            <p className="text-[13px] font-medium text-slate-400 dark:text-slate-500">
              Access precise score conversion tables and official band descriptors.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-full shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest">Official Standards</span>
          </div>
        </div>

        {/* Overall Band Calculator Section */}
        <OverallBandCalculator />

        {/* 4-Tab Navigation */}
        <div className="flex flex-wrap sm:flex-nowrap bg-slate-100 dark:bg-slate-900/50 p-1 rounded-2xl gap-1">
          {CALCULATOR_TABS.map(({ key, label, icon: Icon }) => {
            const isActive = activeTab === key;
            const tabColors = {
              listening: { text: "text-emerald-500", active: "text-emerald-600" },
              reading: { text: "text-blue-500", active: "text-blue-600" },
              writing: { text: "text-amber-500", active: "text-amber-600" },
              speaking: { text: "text-red-500", active: "text-red-600" },
            }[key];

            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={[
                  "flex-1 flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl text-[13px] font-bold transition-all duration-200",
                  isActive
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300",
                ].join(" ")}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? tabColors.active : "text-slate-400"}`} />
                {label}
              </button>
            );
          })}
        </div>

        {/* Tab Content with animation */}
        <div key={activeTab} className="animate-fade-up">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-sm overflow-hidden">
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

