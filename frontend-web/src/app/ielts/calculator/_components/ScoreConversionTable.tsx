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
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
            <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-1/2">
              Raw Score
            </th>
            <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-1/2">
              Band Score
            </th>
          </tr>
        </thead>
        <tbody>
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
                  "border-b border-slate-100 dark:border-slate-800/50 last:border-0 cursor-pointer transition-all duration-300",
                  isHighlighted
                    ? "bg-primary/15 dark:bg-primary/20 border-l-4 border-l-primary font-semibold"
                    : "hover:bg-slate-50/80 dark:hover:bg-slate-800 border-l-4 border-l-transparent",
                ].join(" ")}
              >
                <td className={`px-6 py-3.5 text-sm ${isHighlighted ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"}`}>
                  {row.rawLabel}
                </td>
                <td className={`px-6 py-3.5 text-sm ${isHighlighted ? "text-slate-900 dark:text-white font-bold" : "text-slate-600 dark:text-slate-400"}`}>
                  {row.band === 0 ? "0" : row.band.toFixed(1)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
