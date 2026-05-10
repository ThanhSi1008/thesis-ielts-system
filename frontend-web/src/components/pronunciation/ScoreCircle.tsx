import React from 'react';

const SIZE = 80;
const STROKE_WIDTH = 7;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function getScoreColor(score: number): { stroke: string; text: string; bg: string; label: string } {
  if (score >= 80) return { stroke: '#22C55E', text: 'text-green-600', bg: 'bg-green-50', label: 'Success' };
  if (score >= 65) return { stroke: '#3B82F6', text: 'text-blue-600', bg: 'bg-blue-50', label: 'Info' };
  if (score >= 40) return { stroke: '#F59E0B', text: 'text-amber-600', bg: 'bg-amber-50', label: 'Warning' };
  return { stroke: '#EF4444', text: 'text-red-600', bg: 'bg-red-50', label: 'Danger' };
}

interface ScoreCircleProps {
  score: number;
  size?: number;
  className?: string;
}

export default function ScoreCircle({ score, size = SIZE, className = '' }: ScoreCircleProps) {
  const radius = (size - STROKE_WIDTH) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score));
  const offset = circumference - (clampedScore / 100) * circumference;
  const { stroke, text } = getScoreColor(score);

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={STROKE_WIDTH}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      <span className={`absolute text-base font-extrabold leading-none ${text}`}>
        {clampedScore}
      </span>
    </div>
  );
}

export { getScoreColor };
