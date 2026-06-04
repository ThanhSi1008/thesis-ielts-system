import React from 'react';

// IPA digraphs and affricates that count as single phonemes (longest-match first)
const DIGRAPHS = [
  'oʊ', 'aʊ', 'aɪ', 'eɪ', 'ɔɪ', 'ɪə', 'eə', 'ʊə',
  'tʃ', 'dʒ', 'ɑː', 'iː', 'uː', 'ɔː', 'ɜː', 'eː',
];

const STRIP_CHARS = /[ˈˌ.'\s]/g;

function parsePhonemes(ipa: string): string[] {
  const cleaned = ipa.replace(STRIP_CHARS, '');
  const phonemes: string[] = [];
  let i = 0;
  while (i < cleaned.length) {
    let matched = false;
    for (const dg of DIGRAPHS) {
      if (cleaned.startsWith(dg, i)) {
        phonemes.push(dg);
        i += dg.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      phonemes.push(cleaned[i]);
      i++;
    }
  }
  return phonemes;
}

type PhonemeStatus = 'correct' | 'wrong' | 'missing';

interface AlignedPhoneme {
  target: string;
  spoken: string | null;
  status: PhonemeStatus;
}

/**
 * Aligns target vs spoken phoneme arrays using a simple DP edit-distance alignment.
 * Returns one entry per TARGET phoneme.
 */
function alignPhonemes(target: string[], spoken: string[]): AlignedPhoneme[] {
  const n = target.length;
  const m = spoken.length;

  // dp[i][j] = min ops to align target[0..i-1] with spoken[0..j-1]
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 0; i <= n; i++) dp[i][0] = i;
  for (let j = 0; j <= m; j++) dp[0][j] = j;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,                              // deletion (target phoneme missing)
        dp[i][j - 1] + 1,                              // insertion (extra spoken phoneme)
        dp[i - 1][j - 1] + (target[i - 1] === spoken[j - 1] ? 0 : 1), // sub/match
      );
    }
  }

  // Backtrack
  const aligned: AlignedPhoneme[] = [];
  let i = n, j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + (target[i - 1] === spoken[j - 1] ? 0 : 1)) {
      aligned.unshift({
        target: target[i - 1],
        spoken: spoken[j - 1],
        status: target[i - 1] === spoken[j - 1] ? 'correct' : 'wrong',
      });
      i--; j--;
    } else if (j > 0 && dp[i][j] === dp[i][j - 1] + 1) {
      // Extra spoken phoneme — skip (insertion), don't add to output
      j--;
    } else {
      // Target phoneme was deleted
      aligned.unshift({ target: target[i - 1], spoken: null, status: 'missing' });
      i--;
    }
  }
  return aligned;
}

const STATUS_STYLES: Record<PhonemeStatus, string> = {
  correct: 'text-green-600 font-semibold',
  wrong: 'text-red-500 font-semibold',
  missing: 'text-slate-400 font-medium',
};

interface IpaFeedbackProps {
  targetIPA: string;
  spokenIPA: string;
  className?: string;
}

export default function IpaFeedback({ targetIPA, spokenIPA, className = '' }: IpaFeedbackProps) {
  if (!targetIPA) return null;

  const targetPhonemes = parsePhonemes(targetIPA);
  const spokenPhonemes = parsePhonemes(spokenIPA || '');
  const aligned = alignPhonemes(targetPhonemes, spokenPhonemes);

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      {/* Target IPA row */}
      <div className="flex items-center font-mono text-[15px] tracking-wide">
        <span className="text-slate-400 mr-1 text-xs">Target:</span>
        <span className="text-slate-400 mr-1">/</span>
        {aligned.map((entry, idx) => (
          <span
            key={idx}
            className={`px-[1px] ${STATUS_STYLES[entry.status]}`}
          >
            {entry.target || '-'}
          </span>
        ))}
        <span className="text-slate-400 ml-1">/</span>
      </div>

      {/* Spoken IPA row (only if different) */}
      {spokenIPA && targetIPA !== spokenIPA && (
        <div className="flex items-center font-mono text-[14px] tracking-wide mt-1 bg-slate-100 rounded px-2 py-0.5">
          <span className="text-slate-400 mr-1 text-xs">Spoken:</span>
          <span className="text-slate-400 mr-1">/</span>
          {aligned.map((entry, idx) => (
            <span
              key={idx}
              className={`px-[1px] ${entry.status === 'wrong' ? 'text-red-500 font-bold' : entry.status === 'missing' ? 'text-transparent' : 'text-slate-600'}`}
            >
              {entry.spoken || '-'}
            </span>
          ))}
          <span className="text-slate-400 ml-1">/</span>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />Correct</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Wrong</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />Missing</span>
      </div>
    </div>
  );
}
