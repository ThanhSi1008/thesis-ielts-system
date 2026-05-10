"use client";

import React, { useEffect, useRef } from "react";
import { ScoreRow } from "@/lib/calculator-data";

interface ScoreConversionTableProps {
  data: ScoreRow[];
  highlightedBand: number | null;
  onRowClick: (band: number) => void;
  themeColor?: "emerald" | "blue" | "amber" | "rose" | "primary";
}

export default function ScoreConversionTable({
  data,
  highlightedBand,
  onRowClick,
  themeColor = "primary",
}: ScoreConversionTableProps) {
  const highlightedRef = useRef<HTMLTableRowElement>(null);

  const colors = {
    primary: { bg: "bg-primary/10", darkBg: "dark:bg-primary/20", border: "bg-primary", text: "text-primary" },
    emerald: { bg: "bg-emerald-50", darkBg: "dark:bg-emerald-900/10", border: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
    blue: { bg: "bg-blue-50", darkBg: "dark:bg-blue-900/10", border: "bg-blue-500", text: "text-blue-600 dark:text-blue-400" },
    amber: { bg: "bg-amber-50", darkBg: "dark:bg-amber-900/10", border: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
    rose: { bg: "bg-rose-50", darkBg: "dark:bg-rose-900/10", border: "bg-rose-500", text: "text-rose-600 dark:text-rose-400" },
  }[themeColor];

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
                    ? `${colors.bg} ${colors.darkBg}`
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50",
                ].join(" ")}
              >
                <td className="px-8 py-4.5 relative">
                  {isHighlighted && (
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${colors.border}`} />
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
                      ? `text-base font-black ${colors.text}` 
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

