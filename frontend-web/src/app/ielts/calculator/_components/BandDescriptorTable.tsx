"use client";

import React, { useEffect, useRef } from "react";
import { BandDescriptorRow } from "@/lib/calculator-data";
import { ChevronDown, Trash2 } from "lucide-react";

const ALL_BANDS = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0];

interface BandDescriptorTableProps {
  criteriaLabels: string[];
  criteriaKeys: string[];
  descriptors: BandDescriptorRow[];
  highlightedBand: number | null;
  onBandSelect: (band: number | null) => void;
  themeColor?: "amber" | "rose" | "primary" | "emerald" | "blue";
}

export default function BandDescriptorTable({
  criteriaLabels,
  criteriaKeys,
  descriptors,
  highlightedBand,
  onBandSelect,
  themeColor = "primary",
}: BandDescriptorTableProps) {
  const highlightedRef = useRef<HTMLTableRowElement>(null);

  const colors = {
    primary: { bg: "bg-primary/10", darkBg: "dark:bg-primary/20", border: "bg-primary", labelBg: "bg-primary", labelText: "text-slate-950", shadow: "shadow-primary/30", focus: "focus:ring-primary/10", focusBorder: "focus:border-primary" },
    amber: { bg: "bg-amber-50", darkBg: "dark:bg-amber-900/10", border: "bg-amber-500", labelBg: "bg-amber-500", labelText: "text-white", shadow: "shadow-amber-500/30", focus: "focus:ring-amber-500/10", focusBorder: "focus:border-amber-500" },
    rose: { bg: "bg-rose-50", darkBg: "dark:bg-rose-900/10", border: "bg-rose-500", labelBg: "bg-rose-500", labelText: "text-white", shadow: "shadow-rose-500/30", focus: "focus:ring-rose-500/10", focusBorder: "focus:border-rose-500" },
    emerald: { bg: "bg-emerald-50", darkBg: "dark:bg-emerald-900/10", border: "bg-emerald-500", labelBg: "bg-emerald-500", labelText: "text-white", shadow: "shadow-emerald-500/30", focus: "focus:ring-emerald-500/10", focusBorder: "focus:border-emerald-500" },
    blue: { bg: "bg-blue-50", darkBg: "dark:bg-blue-900/10", border: "bg-blue-500", labelBg: "bg-blue-500", labelText: "text-white", shadow: "shadow-blue-500/30", focus: "focus:ring-blue-500/10", focusBorder: "focus:border-blue-500" },
  }[themeColor];

  useEffect(() => {
    if (highlightedRef.current) {
      highlightedRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [highlightedBand]);

  const getDescriptorRow = (band: number) =>
    descriptors.find((d) => d.band === band);

  const handleRowClick = (band: number) => {
    onBandSelect(highlightedBand === band ? null : band);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Band selector */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <select
            id="band-select"
            aria-label="Select band score"
            value={highlightedBand ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              onBandSelect(val === "" ? null : Number(val));
            }}
            className={`appearance-none pl-4 pr-10 py-2.5 text-sm font-bold border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none transition-all cursor-pointer shadow-sm min-w-[180px] ${colors.focus} ${colors.focusBorder}`}
          >
            <option value="">Select Band</option>
            {ALL_BANDS.map((b) => (
              <option key={b} value={b}>
                Band Score {b}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {highlightedBand !== null && (
          <button
            onClick={() => onBandSelect(null)}
            className="flex items-center gap-2 px-3 py-2 text-xs font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all duration-300"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Scrollable table */}
      <div className="overflow-x-auto -mx-0 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
        <table className="min-w-[1000px] w-full border-collapse" role="grid" aria-label="Band descriptors">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <th className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 w-20">
                Band
              </th>
              {criteriaLabels.map((label) => (
                <th
                  key={label}
                  className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {ALL_BANDS.map((band) => {
              const row = getDescriptorRow(band);
              const isHighlighted = highlightedBand === band;
              return (
                <tr
                  key={band}
                  ref={isHighlighted ? highlightedRef : null}
                  onClick={() => handleRowClick(band)}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isHighlighted}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleRowClick(band);
                    }
                  }}
                  className={[
                    "group transition-all duration-300 align-top cursor-pointer",
                    isHighlighted
                      ? `${colors.bg} ${colors.darkBg}`
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/50",
                  ].join(" ")}
                >
                  <td className="px-5 py-4 align-middle relative">
                    {isHighlighted && (
                      <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${colors.border}`} />
                    )}
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-black transition-all duration-300 ${isHighlighted
                          ? `${colors.labelBg} ${colors.labelText} scale-110 shadow-lg ${colors.shadow}`
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 group-hover:scale-105"
                        }`}
                    >
                      {band}
                    </span>
                  </td>
                  {criteriaKeys.map((key) => (
                    <td
                      key={key}
                      className={`px-5 py-4 text-[12px] leading-relaxed transition-colors duration-300 ${isHighlighted ? "text-slate-900 dark:text-white font-medium" : "text-slate-600 dark:text-slate-400"
                        }`}
                    >
                      {row?.criteria[key] ?? "—"}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

