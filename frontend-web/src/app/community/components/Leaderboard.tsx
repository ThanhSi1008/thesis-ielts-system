"use client";

import { useEffect, useState } from "react";
import { Trophy, Medal, Flame } from "lucide-react";
import { gamificationApi } from "@/services/gamification.api";
import type { LeaderboardEntry } from "@/types";


interface LeaderboardProps {
  currentUserId?: string;
}

export default function Leaderboard({ currentUserId }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [type, setType] = useState<"xp_weekly" | "streak">("xp_weekly");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    gamificationApi.getLeaderboard(type, 10)
      .then(setEntries)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [type]);

  const currentUserEntry = entries.find((e) => e.userId === currentUserId);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-500" /> Leaderboard
        </h2>
      </div>

      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-6">
        <button
          onClick={() => setType("xp_weekly")}
          className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors ${
            type === "xp_weekly" ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          XP This Week
        </button>
        <button
          onClick={() => setType("streak")}
          className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors ${
            type === "streak" ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          Streak
        </button>
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-4 text-gray-500">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No data available</div>
        ) : (
          entries.map((entry, index) => {
            const isTop3 = index < 3;
            const isMe = entry.userId === currentUserId;
            
            return (
              <div
                key={entry.userId}
                className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                  isTop3 ? "bg-amber-50/50 dark:bg-amber-900/10" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                } ${
                  isMe ? "border-l-4 border-primary bg-primary/5 dark:bg-primary/10 pl-2" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 text-center font-bold text-gray-400">
                    {index === 0 ? <Medal className="w-5 h-5 text-yellow-500 mx-auto" /> : 
                     index === 1 ? <Medal className="w-5 h-5 text-gray-400 mx-auto" /> : 
                     index === 2 ? <Medal className="w-5 h-5 text-amber-600 mx-auto" /> : 
                     entry.rank}
                  </div>
                  <div className="flex items-center gap-2">
                    {entry.avatar ? (
                      <img src={entry.avatar} alt={entry.name} className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                        {entry.name.charAt(0)}
                      </div>
                    )}
                    <span className={`font-medium ${isMe ? "text-primary font-bold" : "text-gray-800 dark:text-gray-200"}`}>
                      {entry.name} {isMe && "(You)"}
                    </span>
                  </div>
                </div>
                <div className="font-semibold text-gray-600 dark:text-gray-400">
                  {entry.value} {type === "streak" ? <Flame className="w-4 h-4 inline-block text-orange-500 fill-orange-500" /> : "XP"}
                </div>
              </div>
            );
          })
        )}
      </div>

      {currentUserId && !currentUserEntry && !loading && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-center text-sm text-gray-500">
          Complete lessons to join the leaderboard!
        </div>
      )}
    </div>
  );
}
