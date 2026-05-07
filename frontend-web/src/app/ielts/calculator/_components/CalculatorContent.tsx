"use client";

import React, { useState } from "react";
import { Headphones, BookOpen, PenTool, Mic } from "lucide-react";
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
      ? "text-green-600"
      : overall >= 5.5
      ? "text-blue-600"
      : "text-amber-600";

  const skills = [
    { key: "listening", label: "Listening", icon: Headphones },
    { key: "reading",   label: "Reading",   icon: BookOpen },
    { key: "writing",   label: "Writing",   icon: PenTool },
    { key: "speaking",  label: "Speaking",  icon: Mic },
  ];

  return (
    <div className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        <div className="flex-1">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">Overall Band Calculator</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enter your band for each skill to estimate your overall IELTS band score.
          </p>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {skills.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex flex-col gap-1">
                <label
                  htmlFor={`overall-${key}`}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </label>
                <select
                  id={`overall-${key}`}
                  value={bands[key]}
                  onChange={(e) => setBands((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="px-2.5 py-2 text-sm font-medium border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
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

        {/* IeltsIntensiveResult */}
        <div className="flex flex-col items-center justify-center px-8 py-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm min-w-[140px]">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
            Estimated
          </span>
          <span className={`text-5xl font-bold tabular-nums leading-none ${bandColor}`}>
            {overall !== null ? (overall === 0 ? "0" : overall.toFixed(1)) : "—"}
          </span>
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-1.5 uppercase tracking-wider">
            Overall Band
          </span>
          {!allFilled && (
            <span className="text-[10px] text-slate-300 dark:text-slate-500 mt-2">Fill all 4 skills</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Content ─────────────────────────────────────────────────────────────
export default function CalculatorContent() {
  const [activeTab, setActiveTab] = useState<TabKey>("listening");

  return (
    <div className="w-full bg-white dark:bg-slate-950 overflow-y-auto px-4 sm:px-8 py-6 min-h-screen">
      <div className="max-w-6xl mx-auto flex flex-col gap-6 animate-fade-up">

        {/* Page Header */}
        <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">IELTS Calculator</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Score conversion tables and official band descriptors for all four skills.
          </p>
        </div>

        {/* Overall Band Calculator */}
        <OverallBandCalculator />

        {/* 4-Tab Navigation */}
        <div className="flex flex-wrap sm:flex-nowrap bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 p-1 rounded-xl gap-1">
          {CALCULATOR_TABS.map(({ key, label, icon: Icon }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={[
                  "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all",
                  isActive
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300",
                ].join(" ")}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div key={activeTab} className="animate-fade-up">
          {activeTab === "listening" && <ListeningCalculator />}
          {activeTab === "reading"   && <ReadingCalculator />}
          {activeTab === "writing"   && <WritingDescriptors />}
          {activeTab === "speaking"  && <SpeakingDescriptors />}
        </div>
      </div>
    </div>
  );
}
