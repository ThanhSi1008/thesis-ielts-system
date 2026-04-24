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

  if (loading) return <div className="p-10 font-bold text-gray-500 flex justify-center mt-20">Loading History...</div>;
  if (!session) return <div className="p-10 font-bold text-red-500 flex justify-center mt-20">Session not found</div>;

  const scoreData = session.scoreData || {};
  const userAnswers = session.answers || {};

  return (
    <div className="flex flex-col h-auto min-h-full pb-8">
       <div className="flex items-center gap-3 mb-6">
         <Link href={`/ielts/advanced/reading/${params.partId}/my-answers`} className="flex items-center text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Answer History / Details
         </Link>
       </div>

       <div className="bg-white border text-left border-gray-100 shadow-sm p-0 rounded-2xl overflow-hidden mb-6">
         <div className="p-5 border-b border-gray-100">
           <h3 className="font-extrabold text-gray-900 text-lg">Score Report</h3>
         </div>
         
         <div className="p-6 flex flex-col md:flex-row gap-6">
            {/* Big Score Box */}
            <div className="bg-[#EBF3FF] border border-blue-100 rounded-xl p-6 flex flex-col items-center justify-center shrink-0 w-48">
               <span className="text-blue-500 font-bold text-sm mb-1">Marks</span>
               <div className="text-4xl font-black text-blue-500">
                  {session.totalScore} <span className="text-2xl text-blue-300">/ {session.totalQuestions}</span>
               </div>
            </div>

            {/* Score Table */}
            <div className="flex-1 overflow-x-auto">
               <table className="w-full text-left text-[14px]">
                 <thead>
                   <tr className="border-b border-gray-100">
                     <th className="pb-3 text-gray-500 font-bold">Question type</th>
                     <th className="pb-3 text-gray-500 font-bold text-center">Total</th>
                     <th className="pb-3 text-gray-500 font-bold text-center">Attempted</th>
                     <th className="pb-3 text-gray-500 font-bold text-center">Correct</th>
                     <th className="pb-3 text-gray-500 font-bold text-right">Marks</th>
                   </tr>
                 </thead>
                 <tbody>
                   {Object.entries(scoreData).map(([type, stats]: [string, any]) => (
                     <tr key={type} className="border-b border-gray-50 last:border-0">
                       <td className="py-4 font-bold text-gray-800 capitalize">{type.replace(/_/g, ' ')}</td>
                       <td className="py-4 text-gray-600 font-medium text-center">{stats.total}</td>
                       <td className="py-4 text-gray-600 font-medium text-center">{stats.total}</td>
                       <td className="py-4 text-gray-600 font-medium text-center">{stats.correct}</td>
                       <td className="py-4 text-gray-800 font-extrabold text-right">{stats.correct}/{stats.total}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
         </div>
       </div>

       <div className="flex-1 min-h-[600px] container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
          {/* Left: Reading Passage */}
          <div className="h-[800px] lg:h-[800px] border-b lg:border-b-0 lg:border-r border-gray-100 pl-6 lg:pl-10 pt-6">
            <ReadingPassagePanel
              passageWithLocations={session.part.passageWithLocations}
              passage={session.part.passage}
              locatedQuestion={locatedQuestion}
              showAnswers={true}
            />
          </div>

          {/* Right: Reading Questions */}
          <div className="h-full overflow-y-auto pr-6 lg:pr-10 pt-6 pb-20 custom-scrollbar relative">
            <div className="sticky top-0 bg-white/95 backdrop-blur-md pb-4 pt-1 z-10 border-b border-gray-100 mb-8 rounded-b-xl flex justify-between items-center">
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Question Review</h2>
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
