"use client";

import React, { useEffect, useRef } from "react";
import { ScoreRow } from "@/lib/calculator-data";

interface ScoreConversionTableProps {
  data: ScoreRow[];
  highlightedBand: number | null;
  onRowClick: (band: number) => void;
}

export default function ScoreConversionTable({
  data,
  highlightedBand,
  onRowClick,
}: ScoreConversionTableProps) {
  const highlightedRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    if (highlightedRef.current) {
      highlightedRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [highlightedBand]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
            <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 w-1/2">
              Raw Score
            </th>
            <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 w-1/2">
              Band Score
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
          {data.map((row, idx) => {
            const isHighlighted = highlightedBand === row.band;
            return (
              <tr
                key={idx}
                ref={isHighlighted ? highlightedRef : null}
                onClick={() => onRowClick(row.band)}
                tabIndex={0}
                role="button"
                aria-pressed={isHighlighted}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onRowClick(row.band);
                  }
                }}
                className={[
                  "group relative cursor-pointer transition-all duration-300",
                  isHighlighted
                    ? "bg-primary/10 dark:bg-primary/20"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50",
                ].join(" ")}
              >
                <td className="px-8 py-4.5 relative">
                  {isHighlighted && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                  )}
                  <span className={[
                    "text-sm tracking-tight transition-colors duration-300",
                    isHighlighted 
                      ? "font-bold text-slate-900 dark:text-white" 
                      : "font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200"
                  ].join(" ")}>
                    {row.rawLabel}
                  </span>
                </td>
                <td className="px-8 py-4.5">
                  <span className={[
                    "text-sm tracking-tight transition-all duration-300",
                    isHighlighted 
                      ? "text-base font-black text-primary" 
                      : "font-bold text-slate-900 dark:text-white/80 group-hover:text-slate-900 dark:group-hover:text-white"
                  ].join(" ")}>
                    {row.band === 0 ? "0" : row.band.toFixed(1)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

