"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { PenTool, Clock, Trophy } from "lucide-react";
import Link from "next/link";
import dayjs from "dayjs";

export default function WritingMyAnswersPage({ params }: { params: { promptId: string } }) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/ielts/advanced/writing/prompts/${params.promptId}/sessions`, {
      withCredentials: true,
    })
      .then((res) => {
        setSessions(res.data as any[]);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [params.promptId]);

  const statusLabel: Record<string, { label: string; color: string }> = {
    IN_PROGRESS: { label: "In Progress", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" },
    SUBMITTED: { label: "Submitted", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" },
    GRADING: { label: "Grading…", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400" },
    GRADED: { label: "Graded", color: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" },
    GRADING_FAILED: { label: "Failed", color: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400" },
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-8 px-4">
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">My Writing History</h2>
        <Link href="/ielts/advanced/statistics" className="text-sm font-bold text-[#FF2A6D] hover:underline">
          View Statistics
        </Link>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4 px-4">
          <div className="h-24 bg-gray-200 dark:bg-slate-800 rounded-2xl w-full" />
          <div className="h-24 bg-gray-200 dark:bg-slate-800 rounded-2xl w-full" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 font-bold text-gray-500 dark:text-slate-400 mx-4">
          You haven't practiced this prompt yet.
        </div>
      ) : (
        <div className="space-y-4 px-4">
          {sessions.map((session, idx) => {
            const st = statusLabel[session.status] || { label: session.status, color: "bg-gray-100 text-gray-600" };
            const isGraded = session.status === "GRADED";
            const isInProgress = session.status === "IN_PROGRESS";
            return (
              <div
                key={session.id}
                className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm rounded-2xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex gap-8">
                    <div className="flex flex-col">
                      <span className="text-[15px] font-extrabold text-gray-900 dark:text-white">
                        {dayjs(session.createdAt).format("h:mm A")}
                      </span>
                      <span className="text-[13px] font-semibold text-gray-400 dark:text-slate-500">
                        {dayjs(session.createdAt).format("DD MMM, YYYY")}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className={`self-start text-[11px] font-bold uppercase px-2.5 py-1 rounded-lg ${st.color}`}>
                        {st.label}
                      </span>
                      <div className="flex items-center gap-4 text-[13px] text-gray-500 dark:text-slate-400 font-medium">
                        {session.timeTaken && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {Math.floor(session.timeTaken / 60)}m {session.timeTaken % 60}s
                          </span>
                        )}
                        {isGraded && session.bandScore && (
                          <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-bold">
                            <Trophy className="w-3.5 h-3.5" />
                            Band {session.bandScore.toFixed(1)}
                          </span>
                        )}
                        {session.essay && (
                          <span className="flex items-center gap-1">
                            <PenTool className="w-3.5 h-3.5" />
                            {session.essay.trim().split(/\s+/).length} words
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    {isInProgress && (
                      <Link
                        href={`/ielts/advanced/writing/${params.promptId}?session=${session.id}`}
                        className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[14px] font-bold transition-colors"
                      >
                        Resume
                      </Link>
                    )}
                    {isGraded && (
                      <Link
                        href={`/ielts/advanced/writing/${params.promptId}/result/${session.id}`}
                        className="px-5 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-[14px] font-bold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        View Feedback
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
