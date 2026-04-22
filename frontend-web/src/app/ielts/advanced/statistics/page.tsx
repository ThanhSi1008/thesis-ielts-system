"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Info } from "lucide-react";

export default function IeltsAdvancedStatisticsPage() {
  const [stats, setStats] = useState<Record<string, { correct: number; total: number; attempted: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/ielts/advanced/statistics", {
      withCredentials: true
    })
    .then(res => {
      setStats(res.data);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const questionTypes = [
    { id: "multiple_choice", label: "Multiple Choice", icon: "Oo" },
    { id: "multiple_answer", label: "Multiple Answer", icon: "Oo" },
    { id: "note_completion", label: "Note Completion", icon: "Note" },
    { id: "table_completion", label: "Table Completion", icon: "Table" },
    { id: "summary_completion_woc", label: "Summary Completion WOC", icon: "TXT" },
    { id: "sentence_completion", label: "Sentence Completion", icon: "Sent" },
    { id: "form_completion", label: "Form / Note Completion", icon: "Form" },
    { id: "short_answers", label: "Short Answers", icon: "Sho" },
    { id: "diagram_labelling", label: "Diagram Labelling", icon: "Dia" },
  ];

  return (
    <div className="flex flex-col">
       <div className="mb-8 flex items-center gap-2">
         <h2 className="text-2xl font-extrabold text-gray-900">Skill Accuracy</h2>
         <Info className="w-5 h-5 text-gray-400" />
       </div>

       {/* Skill Filters */}
       <div className="flex items-center gap-4 mb-8">
         <button className="px-6 py-2 rounded-xl bg-pink-50 text-pink-500 font-extrabold text-[15px] border border-pink-100">
           Listening
         </button>
         <button className="px-6 py-2 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 font-extrabold text-[15px] transition-colors">
           Reading
         </button>
         <button className="px-6 py-2 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 font-extrabold text-[15px] transition-colors">
           Writing
         </button>
         <button className="px-6 py-2 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 font-extrabold text-[15px] transition-colors">
           Speaking
         </button>
       </div>

       {/* Bars Grid */}
       {loading ? (
         <div className="animate-pulse flex gap-4">Loading stats...</div>
       ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {questionTypes.map((qt) => {
             const stat = stats[qt.id] || { correct: 0, total: 0, attempted: 0 };
             const percentage = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
             const hasAttempted = stat.attempted > 0;

             return (
               <div key={qt.id} className="flex gap-4">
                 <div className="w-12 h-12 rounded-xl bg-blue-500 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                    {qt.icon}
                 </div>
                 <div className="flex-1 flex flex-col justify-center">
                    <div className="text-[13px] font-bold text-gray-500 mb-1.5">{qt.label}</div>
                    {hasAttempted ? (
                      <div className="relative h-6 bg-blue-100 rounded flex overflow-hidden">
                        <div className="absolute left-0 top-0 h-full bg-blue-500 transition-all" style={{ width: `${percentage}%` }}></div>
                        <span className="relative z-10 text-[12px] font-bold text-white px-2 mt-0.5">{percentage}%</span>
                      </div>
                    ) : (
                      <div className="h-6 bg-blue-200/50 rounded flex items-center px-2">
                        <span className="text-[12px] font-bold text-white leading-none mt-0.5">Not Attempted</span>
                      </div>
                    )}
                 </div>
               </div>
             )
           })}
         </div>
       )}
    </div>
  );
}
