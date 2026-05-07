"use client";

import React, { useState } from "react";
import {
  LISTENING_SCORE_TABLE,
  findRowByRawScore,
  findRowByBandScore,
  getUniqueBands,
} from "@/lib/calculator-data";
import ScoreConversionTable from "./ScoreConversionTable";
import { Hash, Star } from "lucide-react";

const MAX_RAW = 40;

export default function ListeningCalculator() {
  const [rawInput, setRawInput] = useState<string>("");
  const [highlightedBand, setHighlightedBand] = useState<number | null>(null);

  const handleRawChange = (value: string) => {
    setRawInput(value);
    if (value === "") {
      setHighlightedBand(null);
      return;
    }
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 0 || num > MAX_RAW) return;
    const match = findRowByRawScore(LISTENING_SCORE_TABLE, num);
    setHighlightedBand(match?.band ?? null);
  };

  const handleBandChange = (value: string) => {
    if (value === "") {
      setHighlightedBand(null);
      setRawInput("");
      return;
    }
    const band = parseFloat(value);
    const row = findRowByBandScore(LISTENING_SCORE_TABLE, band);
    if (!row) return;
    setHighlightedBand(band);
    const mid = Math.round((row.rawRange[0] + row.rawRange[1]) / 2);
    setRawInput(String(mid));
  };

  const handleRowClick = (band: number) => {
    const row = findRowByBandScore(LISTENING_SCORE_TABLE, band);
    if (!row) return;
    setHighlightedBand((prev) => {
      if (prev === band) {
        setRawInput("");
        return null;
      }
      const mid = Math.round((row.rawRange[0] + row.rawRange[1]) / 2);
      setRawInput(String(mid));
      return band;
    });
  };

  const bands = getUniqueBands(LISTENING_SCORE_TABLE);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Raw Score Input */}
        <div className="flex flex-col gap-2.5">
          <label htmlFor="listening-raw" className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
            <Hash className="w-4 h-4 text-slate-400" />
            Raw Score <span className="text-slate-400 dark:text-slate-500 font-medium">(0–40)</span>
          </label>
          <div className="relative">
            <input
              id="listening-raw"
              type="number"
              min={0}
              max={MAX_RAW}
              value={rawInput}
              onChange={(e) => handleRawChange(e.target.value)}
              placeholder="e.g. 35"
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-base font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"
            />
            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-300 uppercase tracking-widest pointer-events-none">
              Questions
            </div>
          </div>
        </div>

        {/* Band Score Dropdown */}
        <div className="flex flex-col gap-2.5">
          <label htmlFor="listening-band" className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
            <Star className="w-4 h-4 text-slate-400" />
            Target Band Score
          </label>
          <div className="relative">
            <select
              id="listening-band"
              value={highlightedBand ?? ""}
              onChange={(e) => handleBandChange(e.target.value)}
              className="w-full appearance-none px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm cursor-pointer"
            >
              <option value="">Select a band</option>
              {bands.map((b) => (
                <option key={b} value={b}>
                  Band {b === 0 ? "0" : b.toFixed(1)}
                </option>
              ))}
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
              <div className="w-5 h-5 flex items-center justify-center text-slate-400">
                ▼
              </div>
            </div>
          </div>
        </div>
      </div>

      {highlightedBand !== null && (
        <div className="relative overflow-hidden group animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 dark:from-primary/30 dark:to-transparent opacity-50" />
          <div className="relative flex items-center justify-between gap-4 px-8 py-6 border border-primary/20 dark:border-primary/40 rounded-2xl">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">Conversion Result</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-slate-900 dark:text-white">Raw Score {rawInput}</span>
                <span className="text-slate-400 font-bold">→</span>
                <span className="text-2xl font-black text-primary drop-shadow-sm">
                  Band {highlightedBand === 0 ? "0" : highlightedBand.toFixed(1)}
                </span>
              </div>
            </div>
            <div className="hidden sm:flex p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
              <Star className="w-5 h-5 text-primary fill-primary/20" />
            </div>
          </div>
        </div>
      )}

      <div className="mt-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Score Conversion Table</span>
          <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
        </div>
        <ScoreConversionTable
          data={LISTENING_SCORE_TABLE}
          highlightedBand={highlightedBand}
          onRowClick={handleRowClick}
        />
      </div>
    </div>
  );
}

