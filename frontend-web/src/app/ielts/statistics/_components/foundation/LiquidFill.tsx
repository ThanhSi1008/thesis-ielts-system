"use client";

import React, { useState, useEffect } from "react";

interface LiquidFillProps {
  percentage: number;
  color: string;
  size?: number;
}

export default function LiquidFill({ percentage, color, size = 100 }: LiquidFillProps) {
  const [animPct, setAnimPct] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimPct(Math.min(percentage, 100)), 120);
    return () => clearTimeout(t);
  }, [percentage]);

  const waveOffset = 100 - animPct;

  return (
    <div
      className="relative overflow-hidden rounded-full shrink-0 border-4 border-slate-100 dark:border-slate-800"
      style={{ width: size, height: size, borderColor: `${color}15` }}
    >
      {/* Wave fill */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
        style={{ transition: "all 1.2s cubic-bezier(0.34,1.56,0.64,1)" }}
      >
        <defs>
          <clipPath id={`clip-${color.replace("#", "")}-${size}`}>
            <rect x="0" y={waveOffset} width="100" height="100" />
          </clipPath>
        </defs>
        {/* Wave shape */}
        <path
          d={`M0,${waveOffset + 4} C25,${waveOffset - 4} 75,${waveOffset + 8} 100,${waveOffset} L100,100 L0,100 Z`}
          fill={color}
          fillOpacity="0.18"
          style={{ transition: "d 1.2s ease" }}
        />
        <rect
          x="0"
          y={waveOffset + 3}
          width="100"
          height={100 - waveOffset}
          fill={color}
          fillOpacity="0.15"
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black" style={{ color }}>
          {animPct}%
        </span>
      </div>
    </div>
  );
}
