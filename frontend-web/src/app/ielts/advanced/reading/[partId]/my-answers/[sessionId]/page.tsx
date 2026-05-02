"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { ReadingPassagePanel } from "../../../../../basic/[skill]/exercises/[exerciseId]/_components/ui/ReadingPassagePanel";
import { ReadingQuestionsPanel } from "../../../../../basic/[skill]/exercises/[exerciseId]/_components/ui/ReadingQuestionsPanel";

export default function IeltsAdvancedReadingHistoryDetailsPage({ params }: { params: { partId: string; sessionId: string } }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [locatedQuestion, setLocatedQuestion] = useState<number | null>(null);

  const handleLocate = (qNum: number) => {
    setLocatedQuestion(qNum);
    const target = document.getElementById(`passage-q-${qNum}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setTimeout(() => {
      setLocatedQuestion(null);
    }, 3000);
  };

  useEffect(() => {
     api.get(`/ielts/advanced/reading/history/${params.sessionId}`, {
       withCredentials: true
     }).then(res => {
       setSession(res.data);
       setLoading(false);
     }).catch(err => {
       console.error(err);
       setLoading(false);
     });
  }, [params.sessionId]);

  if (loading) return <div className="p-10 font-bold text-gray-500 dark:text-slate-400 flex justify-center mt-20">Loading History...</div>;
  if (!session) return <div className="p-10 font-bold text-red-500 flex justify-center mt-20">Session not found</div>;

  const scoreData = session.scoreData || {};
  const userAnswers = session.answers || {};

  return (
    <div className="flex flex-col h-auto min-h-full pb-8">
       <div className="flex items-center gap-3 mb-6">
         <Link href={`/ielts/advanced/reading/${params.partId}/my-answers`} className="flex items-center text-sm font-bold text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Answer History / Details
         </Link>
       </div>

       <div className="bg-white dark:bg-slate-900 border text-left border-gray-100 dark:border-slate-800 shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-0 rounded-2xl overflow-hidden mb-6">
         <div className="p-5 border-b border-gray-100 dark:border-slate-800">
           <h3 className="font-extrabold text-gray-900 dark:text-white text-lg">Score Report</h3>
         </div>
         
         <div className="p-6 flex flex-col md:flex-row gap-6">
            {/* Big Score Box */}
            <div className="bg-[#EBF3FF] dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-xl p-6 flex flex-col items-center justify-center shrink-0 w-48">
               <span className="text-blue-500 dark:text-blue-400 font-bold text-sm mb-1">Marks</span>
               <div className="text-4xl font-black text-blue-500 dark:text-blue-400">
                  {session.totalScore} <span className="text-2xl text-blue-300 dark:text-blue-500/50">/ {session.totalQuestions}</span>
               </div>
            </div>

            {/* Score Table */}
            <div className="flex-1 overflow-x-auto">
               <table className="w-full text-left text-[14px]">
                 <thead>
                   <tr className="border-b border-gray-100 dark:border-slate-800">
                     <th className="pb-3 text-gray-500 dark:text-slate-400 font-bold">Question type</th>
                     <th className="pb-3 text-gray-500 dark:text-slate-400 font-bold text-center">Total</th>
                     <th className="pb-3 text-gray-500 dark:text-slate-400 font-bold text-center">Attempted</th>
                     <th className="pb-3 text-gray-500 dark:text-slate-400 font-bold text-center">Correct</th>
                     <th className="pb-3 text-gray-500 dark:text-slate-400 font-bold text-right">Marks</th>
                   </tr>
                 </thead>
                 <tbody>
                   {Object.entries(scoreData).map(([type, stats]: [string, any]) => (
                     <tr key={type} className="border-b border-gray-50 dark:border-slate-800/50 last:border-0">
                       <td className="py-4 font-bold text-gray-800 dark:text-slate-200 capitalize">{type.replace(/_/g, ' ')}</td>
                       <td className="py-4 text-gray-600 dark:text-slate-400 font-medium text-center">{stats.total}</td>
                       <td className="py-4 text-gray-600 dark:text-slate-400 font-medium text-center">{stats.total}</td>
                       <td className="py-4 text-gray-600 dark:text-slate-400 font-medium text-center">{stats.correct}</td>
                       <td className="py-4 text-gray-800 dark:text-slate-200 font-extrabold text-right">{stats.correct}/{stats.total}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
         </div>
       </div>

       <div className="flex-1 min-h-[600px] container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-[0_8px_40px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-slate-800 overflow-hidden relative">
          {/* Left: Reading Passage */}
          <div className="h-[800px] lg:h-[800px] border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-slate-800 pl-6 lg:pl-10 pt-6">
            <ReadingPassagePanel
              passageWithLocations={session.part.passageWithLocations}
              passage={session.part.passage}
              locatedQuestion={locatedQuestion}
              showAnswers={true}
            />
          </div>

          {/* Right: Reading Questions */}
          <div className="h-full overflow-y-auto pr-6 lg:pr-10 pt-6 pb-20 custom-scrollbar relative">
            <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md pb-4 pt-1 z-10 border-b border-gray-100 dark:border-slate-800 mb-8 rounded-b-xl flex justify-between items-center">
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">Question Review</h2>
            </div>
            
            <ReadingQuestionsPanel
              exercise={session.part}
              answers={userAnswers}
              submitted={true}
              showAnswers={true}
              onAnswer={() => {}}
              onLocate={handleLocate}
            />
          </div>
       </div>
    </div>
  );
}
