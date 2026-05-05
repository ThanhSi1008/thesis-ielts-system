"use client";

import { useEffect, useState } from "react";
import { Headphones, BookOpen, PenTool, Mic } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import FeatureLock from "@/components/FeatureLock";

interface PracticePart {
  id: string;
  title: string;
  partNumber: number;
  questionTypes: string[];
  // If the API ever returns score/total, we can add them here
  myScore?: number;
  totalQuestions?: number;
}

const SKILLS = [
  { key: "Listening", label: "Listening", icon: <Headphones className="w-4 h-4" /> },
  { key: "Reading", label: "Reading", icon: <BookOpen className="w-4 h-4" /> },
  { key: "Writing", label: "Writing", icon: <PenTool className="w-4 h-4" /> },
  { key: "Speaking", label: "Speaking", icon: <Mic className="w-4 h-4" /> },
];

export default function AdvancedContent({ embedded }: { embedded?: boolean }) {
  const [skill, setSkill] = useState("Listening");
  const [parts, setParts] = useState<PracticePart[]>([]);
  const [selectedPart, setSelectedPart] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (skill === "Listening" || skill === "Reading") {
      setLoading(true);
      api.get<PracticePart[]>(`/ielts/advanced/${skill.toLowerCase()}`, {
        withCredentials: true
      })
      .then(res => {
        setParts(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [skill]);

  return (
    <FeatureLock requiredTier="PREMIUM" featureName="IELTS Advanced Practice">
      <div className={`flex-1 min-w-0 bg-white dark:bg-slate-950 overflow-y-auto px-4 md:px-6 py-4 w-full ${embedded ? 'h-full' : 'min-h-screen'}`}>
      {/* Skill Tabs */}
      <div className="flex items-center gap-4 md:gap-8 mb-6 border-b border-gray-100 dark:border-slate-800 overflow-x-auto">
        {SKILLS.map((s) => {
          const active = skill === s.key;
          return (
            <button
              key={s.key}
              onClick={() => { setSkill(s.key); setSelectedPart(1); }}
              className={`whitespace-nowrap relative py-4 text-sm font-bold flex items-center gap-2 transition-colors ${active ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300"}`}
            >
              {s.icon}
              {s.label}
              <span className={`absolute left-0 -bottom-[1px] h-[3px] rounded-full bg-primary transition-all ${active ? "w-full" : "w-0"}`} />
            </button>
          );
        })}
      </div>

      {(skill === "Listening" || skill === "Reading") ? (
        <>
          {/* Part Selection */}
          <div className="flex items-center gap-2 md:gap-4 mb-8 overflow-x-auto pb-2">
            {[1, 2, 3, 4].map((partNum) => {
              // Hide part 4 for Reading since it only has 3 parts
              if (skill === "Reading" && partNum === 4) return null;
              
              const active = selectedPart === partNum;
              return (
                <button
                  key={partNum}
                  onClick={() => setSelectedPart(partNum)}
                  className={`shrink-0 flex items-center justify-center gap-2 px-4 md:px-6 py-3 rounded-2xl flex-1 border transition-colors ${active ? "bg-white dark:bg-slate-800 border-primary shadow-sm text-primary font-bold" : "bg-gray-50/50 dark:bg-slate-900/50 border-gray-100 dark:border-slate-800 text-gray-500 dark:text-slate-400 font-semibold hover:bg-gray-50 dark:hover:bg-slate-800"}`}
                >
                  <svg viewBox="0 0 24 24" className={`hidden sm:block w-5 h-5 ${active ? "text-primary" : "text-gray-400 dark:text-slate-500"}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                  <div className="flex flex-col items-start gap-[1px]">
                    <span className="text-sm">Part {partNum}</span>
                    {skill === "Listening" && (
                      <span className="hidden lg:block text-[10px] opacity-70 font-medium tracking-wide whitespace-nowrap">
                        {partNum === 1 ? "Basic Conversation" : partNum === 2 ? "Short Monologue" : partNum === 3 ? "Academic Discussion" : "Academic Lecture"}
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Submissions List */}
          <div className="space-y-4 pb-4">
            {loading ? (
              <div className="py-10 text-center text-gray-500 dark:text-slate-400 font-medium">Loading practice items...</div>
            ) : (
              (() => {
                const items = parts.filter(p => p.partNumber === selectedPart);
                if (items.length === 0) return <div className="py-10 text-center text-gray-500 dark:text-slate-400 font-medium bg-gray-50 dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">No practice items found for this part.</div>;

                return items.map((item, idx) => (
                  <div key={item.id} className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
                    
                    <div className="flex gap-6 items-center flex-1 w-full">
                      <div className={`relative shrink-0 w-16 h-16 rounded-full border-[3px] flex flex-col items-center justify-center bg-white dark:bg-slate-900 ${item.myScore !== undefined ? "border-green-500 text-green-600 dark:border-green-500 dark:text-green-500" : "border-gray-200 text-gray-400 dark:border-slate-700 dark:text-slate-500"}`}>
                        {item.myScore !== undefined ? (
                          <>
                            <span className="font-black leading-none text-xl">{item.myScore}</span>
                            {item.totalQuestions && <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 mt-0.5">/ {item.totalQuestions}</span>}
                          </>
                        ) : (
                          <span className="font-extrabold leading-none text-xl">-</span>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-[3px] rounded-md bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 text-[10px] font-bold tracking-wide uppercase truncate">Advanced Practice</span>
                          {item.questionTypes?.map((qt) => (
                            <span key={qt} className="px-2.5 py-[3px] rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-[10px] font-bold tracking-wide uppercase truncate">
                              {qt.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight truncate">{item.title}</h3>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center justify-end w-full md:w-auto mt-4 md:mt-0">
                      <Link
                        href={`/ielts/advanced/${skill.toLowerCase()}/${item.id}`}
                        className="w-full md:w-auto px-6 py-3 rounded-xl border-2 border-primary hover:bg-primary hover:text-white text-primary text-sm font-bold shadow-sm transition-all bg-white dark:bg-slate-800 flex items-center justify-center gap-2 group"
                      >
                        Practice Now
                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                      </Link>
                    </div>
                  </div>
                ));
              })()
            )}
          </div>
        </>
      ) : (
        <div className="py-20 text-center bg-gray-50 dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">
          <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm mx-auto mb-4">
            <span className="text-2xl text-gray-400 dark:text-slate-500">🚧</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{skill} section coming soon</h3>
          <p className="text-gray-500 dark:text-slate-400 text-sm max-w-sm mx-auto">We're currently preparing high-quality {skill.toLowerCase()} materials for you.</p>
        </div>
      )}
      </div>
    </FeatureLock>
  );
}

