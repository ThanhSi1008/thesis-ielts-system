"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import dayjs from "dayjs";

export default function IeltsAdvancedReadingHistoryPage({ params }: { params: { partId: string } }) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/ielts/advanced/reading/history?partId=${params.partId}`, {
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
    <div className="flex flex-col">
       <div className="flex items-center justify-between mb-8 px-4">
         <h2 className="text-2xl font-extrabold text-gray-900">Answer History</h2>
         <Link href="/ielts/advanced/statistics" className="text-sm font-bold text-[#FF2A6D] hover:underline">
            View Skill Accuracy
         </Link>
       </div>

       {loading ? (
         <div className="animate-pulse space-y-4 px-4">
            <div className="h-24 bg-gray-200 rounded-2xl w-full"></div>
            <div className="h-24 bg-gray-200 rounded-2xl w-full"></div>
         </div>
       ) : history.length === 0 ? (
         <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-100 font-bold text-gray-500 mx-4">
            No reading practice history found.
         </div>
       ) : (
         <div className="space-y-4 px-4">
           {history.map((session, idx) => (
             <div key={session.id} className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 hover:shadow-md transition-shadow">
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
                        <div className="flex items-center gap-1.5 mt-1 text-blue-600 font-bold text-[14px]">
                           <CheckCircle2 className="w-4 h-4" />
                           Score {session.totalScore} / {session.totalQuestions}
                        </div>
                      </div>
                   </div>

                   {/* Action */}
                   <Link href={`/ielts/advanced/reading/${params.partId}/my-answers/${session.id}`} className="px-5 py-2 border border-gray-200 rounded-xl text-[14px] font-bold text-gray-700 hover:bg-gray-50 transition-colors self-start sm:self-center">
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
