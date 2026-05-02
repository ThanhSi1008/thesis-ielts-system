"use client";

import React, { useEffect, useRef } from "react";
import { BandDescriptorRow } from "@/lib/calculator-data";

const ALL_BANDS = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0];

interface BandDescriptorTableProps {
  criteriaLabels: string[];
  criteriaKeys: string[];
  descriptors: BandDescriptorRow[];
  highlightedBand: number | null;
  onBandSelect: (band: number | null) => void;
}

export default function BandDescriptorTable({
  criteriaLabels,
  criteriaKeys,
  descriptors,
  highlightedBand,
  onBandSelect,
}: BandDescriptorTableProps) {
  const highlightedRef = useRef<HTMLTableRowElement>(null);

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
    <div className="flex flex-col gap-4">
      {/* Band selector */}
      <div className="flex items-center gap-3">
        <label htmlFor="band-select" className="text-sm font-semibold text-slate-700 dark:text-slate-300 shrink-0">
          Select Band:
        </label>
        <select
          id="band-select"
          aria-label="Select band score"
          value={highlightedBand ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            onBandSelect(val === "" ? null : Number(val));
          }}
          className="px-3 py-2 text-sm font-medium border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        >
          <option value="">— Choose a band —</option>
          {ALL_BANDS.map((b) => (
            <option key={b} value={b}>
              Band {b}
            </option>
          ))}
        </select>
        {highlightedBand !== null && (
          <button
            onClick={() => onBandSelect(null)}
            className="text-xs font-semibold text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Scrollable table */}
      <div className="overflow-x-auto -mx-0 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <table className="min-w-[860px] w-full border-collapse" role="grid" aria-label="Band descriptors">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
              <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-16 shrink-0">
                Band
              </th>
              {criteriaLabels.map((label) => (
                <th
                  key={label}
                  className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
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
                    "border-b border-slate-100 dark:border-slate-800/50 last:border-0 cursor-pointer transition-all duration-300 align-top",
                    isHighlighted
                      ? "bg-primary/15 dark:bg-primary/20 border-l-4 border-l-primary"
                      : "hover:bg-slate-50/80 dark:hover:bg-slate-800 border-l-4 border-l-transparent",
                  ].join(" ")}
                >
                  <td className="px-4 py-4 align-middle">
                    <span
                      className={`inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-bold transition-colors ${isHighlighted
                          ? "bg-primary text-slate-900"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                    >
                      {band}
                    </span>
                  </td>
                  {criteriaKeys.map((key) => (
                    <td
                      key={key}
                      className={`px-4 py-4 text-[13px] leading-relaxed align-top transition-colors ${isHighlighted ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"
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
