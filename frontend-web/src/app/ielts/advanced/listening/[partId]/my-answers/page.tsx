"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { CheckCircle2, ChevronRight, Clock } from "lucide-react";
import Link from "next/link";
import dayjs from "dayjs";

export default function IeltsAdvancedHistoryPage({ params }: { params: { partId: string } }) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/ielts/advanced/history?partId=${params.partId}`, {
      withCredentials: true
    })
    .then(res => {
      setHistory(res.data as any[]);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [params.partId]);

  return (
    <div className="flex flex-col animate-fade-up">
       <div className="flex items-center justify-between mb-8">
         <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Answer History</h1>
         <Link href="/ielts/advanced/statistics" className="text-[13px] font-black uppercase tracking-wider text-primary hover:brightness-90 transition-all flex items-center gap-2">
            View Skill Accuracy
            <ChevronRight className="w-4 h-4" />
         </Link>
       </div>

       {loading ? (
         <div className="animate-pulse space-y-4">
            <div className="h-24 bg-gray-200 rounded-2xl w-full"></div>
            <div className="h-24 bg-gray-200 rounded-2xl w-full"></div>
         </div>
       ) : history.length === 0 ? (
         <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-100 font-bold text-gray-500">
            No practice history found.
         </div>
       ) : (
         <div className="space-y-4">
           {history.map((session, idx) => (
             <div key={session.id} className="bg-white border border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.04)] rounded-[20px] p-6 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                   
                   {/* Time and Info */}
                   <div className="flex gap-8">
                      <div className="flex flex-col">
                        <span className="text-[15px] font-extrabold text-gray-900">{dayjs(session.createdAt).format("h:mm A")}</span>
                        <span className="text-[13px] font-semibold text-gray-400">{dayjs(session.createdAt).format("DD MMM, YYYY")}</span>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-[16px] font-extrabold text-gray-900">
                          {session.part?.title || `Practice Attempt ${history.length - idx}`}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1 text-primary font-bold text-[14px]">
                           <CheckCircle2 className="w-4 h-4" />
                           Score {session.totalScore} / {session.totalQuestions}
                        </div>
                      </div>
                   </div>

                   {/* Action */}
                   <Link 
                     href={`/ielts/advanced/listening/${params.partId}/my-answers/${session.id}`} 
                     className="px-6 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-[13px] font-black text-gray-700 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-300 self-start sm:self-center uppercase tracking-wider"
                   >
                     Details
                   </Link>
                </div>
             </div>
           ))}
         </div>
       )}
    </div>
  );
}
