"use client";

import React, { useState } from "react";
import {
  LISTENING_SCORE_TABLE,
  findRowByRawScore,
  findRowByBandScore,
  getUniqueBands,
} from "@/lib/calculator-data";
import ScoreConversionTable from "./ScoreConversionTable";
import { Hash, Star, ChevronDown } from "lucide-react";

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
        {/* Band Score Dropdown */}
        <div className="flex flex-col gap-2.5">
          <label htmlFor="listening-band" className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <Star className="w-3 h-3 text-slate-400" />
            Target Band Score
          </label>
          <div className="relative">
            <select
              id="listening-band"
              value={highlightedBand ?? ""}
              onChange={(e) => handleBandChange(e.target.value)}
              className="w-full appearance-none px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-300 dark:focus:border-emerald-700 transition-all shadow-sm cursor-pointer"
            >
              <option value="">Select a band</option>
              {bands.map((b) => (
                <option key={b} value={b}>
                  Band {b === 0 ? "0" : b.toFixed(1)}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <div className="w-4 h-4 flex items-center justify-center text-slate-400">
                <ChevronDown className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>

        {/* Raw Score Input */}
        <div className="flex flex-col gap-2.5">
          <label htmlFor="listening-raw" className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <Hash className="w-3 h-3 text-slate-400" />
            Raw Score <span className="text-slate-400 dark:text-slate-500 font-medium normal-case">(0–40)</span>
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
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-300 dark:focus:border-emerald-700 transition-all shadow-sm"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] pointer-events-none">
              Questions
            </div>
          </div>
        </div>
      </div>



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
          themeColor="emerald"
        />
      </div>
    </div>
  );
}

