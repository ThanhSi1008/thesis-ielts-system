import React from 'react';

interface SoundInstructionSectionProps {
  description: string;
  tip: string;
  imageUrl?: string;
}

export default function SoundInstructionSection({ description, tip, imageUrl }: SoundInstructionSectionProps) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm h-full">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">How to produce</h3>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">{description}</p>
        
        {tip && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-xl border border-blue-100 dark:border-blue-800/30">
            <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2 text-sm flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Pronunciation Tip
            </h4>
            <p className="text-blue-700 dark:text-blue-200 text-sm leading-relaxed">{tip}</p>
          </div>
        )}

        {imageUrl && (
          <div className="mt-6 aspect-video bg-slate-50 dark:bg-slate-800/50 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 flex items-center justify-center">
            <img src={imageUrl} alt="Mouth diagram" className="w-full h-full object-contain" />
          </div>
        )}
      </div>
    </div>
  );
}
