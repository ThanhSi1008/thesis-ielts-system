"use client";

import React, { useState } from "react";
import {
  LISTENING_SCORE_TABLE,
  findRowByRawScore,
  findRowByBandScore,
  getUniqueBands,
} from "@/lib/calculator-data";
import ScoreConversionTable from "./ScoreConversionTable";

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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Raw Score Input */}
        <div className="flex flex-col gap-1.5 flex-1">
          <label htmlFor="listening-raw" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Raw Score <span className="text-slate-400 dark:text-slate-500 font-normal">(0–40)</span>
          </label>
          <input
            id="listening-raw"
            type="number"
            min={0}
            max={MAX_RAW}
            value={rawInput}
            onChange={(e) => handleRawChange(e.target.value)}
            placeholder="e.g. 35"
            aria-label="Enter raw score (0 to 40)"
            className="px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white dark:bg-slate-800"
          />
        </div>

        {/* Band Score Dropdown */}
        <div className="flex flex-col gap-1.5 flex-1">
          <label htmlFor="listening-band" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Band Score
          </label>
          <select
            id="listening-band"
            aria-label="Select band score"
            value={highlightedBand ?? ""}
            onChange={(e) => handleBandChange(e.target.value)}
            className="px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white dark:bg-slate-800"
          >
            <option value="">— Select a band —</option>
            {bands.map((b) => (
              <option key={b} value={b}>
                {b === 0 ? "0" : b.toFixed(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {highlightedBand !== null && (
        <div className="flex items-center gap-3 px-4 py-3 bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 rounded-xl">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Result:</span>
          <span className="text-base font-bold text-slate-900 dark:text-white">
            Raw Score {rawInput} → Band{" "}
            <span className="text-primary">
              {highlightedBand === 0 ? "0" : highlightedBand.toFixed(1)}
            </span>
          </span>
        </div>
      )}

      <ScoreConversionTable
        data={LISTENING_SCORE_TABLE}
        highlightedBand={highlightedBand}
        onRowClick={handleRowClick}
      />
    </div>
  );
}
