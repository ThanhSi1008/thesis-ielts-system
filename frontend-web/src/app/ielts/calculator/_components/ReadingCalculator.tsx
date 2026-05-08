"use client";

import React, { useState } from "react";
import {
  READING_ACADEMIC_SCORE_TABLE,
  READING_GENERAL_SCORE_TABLE,
  findRowByRawScore,
  findRowByBandScore,
  getUniqueBands,
} from "@/lib/calculator-data";
import ScoreConversionTable from "./ScoreConversionTable";
import { Hash, Star, Layout, ChevronDown } from "lucide-react";

type ReadingType = "ACADEMIC" | "GENERAL";
const MAX_RAW = 40;

export default function ReadingCalculator() {
  const [readingType, setReadingType] = useState<ReadingType>("ACADEMIC");
  const [rawInput, setRawInput] = useState<string>("");
  const [highlightedBand, setHighlightedBand] = useState<number | null>(null);

  const scoreTable =
    readingType === "ACADEMIC" ? READING_ACADEMIC_SCORE_TABLE : READING_GENERAL_SCORE_TABLE;

  const handleTypeChange = (type: ReadingType) => {
    setReadingType(type);
    setRawInput("");
    setHighlightedBand(null);
  };

  const handleRawChange = (value: string) => {
    setRawInput(value);
    if (value === "") {
      setHighlightedBand(null);
      return;
    }
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 0 || num > MAX_RAW) return;
    const match = findRowByRawScore(scoreTable, num);
    setHighlightedBand(match?.band ?? null);
  };

  const handleBandChange = (value: string) => {
    if (value === "") {
      setHighlightedBand(null);
      setRawInput("");
      return;
    }
    const band = parseFloat(value);
    const row = findRowByBandScore(scoreTable, band);
    if (!row) return;
    setHighlightedBand(band);
    const mid = Math.round((row.rawRange[0] + row.rawRange[1]) / 2);
    setRawInput(String(mid));
  };

  const handleRowClick = (band: number) => {
    const row = findRowByBandScore(scoreTable, band);
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

  const bands = getUniqueBands(scoreTable);

  return (
    <div className="flex flex-col gap-8">
      {/* Academic / General Training toggle */}
      <div className="flex flex-col gap-2.5">
        <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <Layout className="w-3 h-3 text-slate-400" />
          Test Type
        </label>
        <div className="flex bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 rounded-xl max-w-xs shadow-sm">
          {(["ACADEMIC", "GENERAL"] as ReadingType[]).map((type) => {
            const isActive = readingType === type;
            return (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                className={`flex-1 py-2 px-4 text-[11px] font-black rounded-lg transition-all duration-300 uppercase tracking-wider ${
                  isActive
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-600"
                    : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400"
                }`}
              >
                {type === "ACADEMIC" ? "Academic" : "General"}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Band Score Dropdown */}
        <div className="flex flex-col gap-2.5">
          <label htmlFor="reading-band" className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <Star className="w-3 h-3 text-slate-400" />
            Target Band Score
          </label>
          <div className="relative">
            <select
              id="reading-band"
              value={highlightedBand ?? ""}
              onChange={(e) => handleBandChange(e.target.value)}
              className="w-full appearance-none px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-300 dark:focus:border-blue-700 transition-all shadow-sm cursor-pointer"
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
          <label htmlFor="reading-raw" className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <Hash className="w-3 h-3 text-slate-400" />
            Raw Score <span className="text-slate-400 dark:text-slate-500 font-medium normal-case">(0–40)</span>
          </label>
          <div className="relative">
            <input
              id="reading-raw"
              type="number"
              min={0}
              max={MAX_RAW}
              value={rawInput}
              onChange={(e) => handleRawChange(e.target.value)}
              placeholder="e.g. 33"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-300 dark:focus:border-blue-700 transition-all shadow-sm"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] pointer-events-none">
              Correct
            </div>
          </div>
        </div>
      </div>



      <div className="mt-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            {readingType === "ACADEMIC" ? "Academic" : "General"} Conversion Table
          </span>
          <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
        </div>
        <ScoreConversionTable
          data={scoreTable}
          highlightedBand={highlightedBand}
          onRowClick={handleRowClick}
          themeColor="blue"
        />
      </div>
    </div>
  );
}

