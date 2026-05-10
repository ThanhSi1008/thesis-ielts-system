"use client";

import { useState } from "react";
import { AchievementItem } from "@/types";
import {
  BookOpen,
  PenTool,
  Mic,
  Circle,
  Target,
  Flame,
  Video,
  Headphones,
  FlaskConical,
  Users,
  Award,
  Book,
  CheckCircle2,
  Edit3,
  Type,
  Languages,
  Medal,
  FileText,
  Star,
  Diamond,
  Trophy,
  MessageSquare,
  Mic2,
  Box,
  Library,
  Brain,
  Store,
  MessageCircle,
  Heart,
  Mountain,
  MountainSnow,
  GraduationCap
} from "lucide-react";

export const EMOJI_ICON_MAP: Record<string, any> = {
  "📖": Book,
  "📗": BookOpen,
  "💯": CheckCircle2,
  "✏️": Edit3,
  "📘": Book,
  "🔤": Type,
  "🎯": Target,
  "👄": Languages,
  "🎧": Headphones,
  "✍️": PenTool,
  "🏅": Medal,
  "📝": FileText,
  "⭐": Star,
  "💎": Diamond,
  "🏆": Trophy,
  "🎙️": Mic,
  "🗣️": MessageSquare,
  "🎤": Mic2,
  "📦": Box,
  "📚": Library,
  "🧠": Brain,
  "🏪": Store,
  "💬": MessageCircle,
  "❤️": Heart,
  "🔥": Flame,
  "🏔️": Mountain,
  "🌋": MountainSnow,
  "🎓": GraduationCap,
};

interface AchievementsSectionProps {
  achievements: AchievementItem[];
  earnedCount: number;
  totalCount: number;
}

const CATEGORY_CONFIG: Record<string, { label: string, icon: any }> = {
  FOUNDATION_VOCAB: { label: "Foundation: FoundationVocabWord", icon: BookOpen },
  FOUNDATION_GRAMMAR: { label: "Foundation: Grammar", icon: PenTool },
  FOUNDATION_PRONUNCIATION: { label: "Foundation: Pronunciation", icon: Mic },
  IELTS_BASIC: { label: "IELTS Basic", icon: Circle },
  IELTS_ADVANCED: { label: "IELTS Advanced", icon: Target },
  IELTS_INTENSIVE: { label: "IELTS Intensive", icon: Flame },
  SHADOWING: { label: "Shadowing", icon: Video },
  DICTATION: { label: "Dictation", icon: Headphones },
  VOCAB_LAB: { label: "Vocab Lab", icon: FlaskConical },
  COMMUNITY: { label: "Community", icon: Users },
  CROSS_MODULE: { label: "Milestones", icon: Award },
};

export default function AchievementsSection({ achievements, earnedCount, totalCount }: AchievementsSectionProps) {
  // Group achievements by category
  const grouped = achievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) acc[achievement.category] = [];
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as Record<string, AchievementItem[]>);

  const categories = Object.keys(grouped);

  // Define tier ring colors
  const getTierRingColor = (tier: number, earned: boolean) => {
    if (!earned) return "ring-transparent";
    switch (tier) {
      case 1:
        return "ring-amber-600/40"; // Bronze
      case 2:
        return "ring-gray-400/60"; // Silver
      case 3:
        return "ring-yellow-400/80"; // Gold
      default:
        return "ring-amber-600/40";
    }
  };

  return (
    <div className="space-y-8 mb-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold flex items-center gap-3 text-gray-900 dark:text-white">
          <Trophy className="w-8 h-8 text-amber-500" /> 
          Achievements
          <span className="text-lg font-bold bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-gray-500 dark:text-gray-400 ml-2">
            {earnedCount} / {totalCount}
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {categories.map((category) => {
          const items = grouped[category] || [];
          const config = CATEGORY_CONFIG[category] || { label: category, icon: Award };
          const Icon = config.icon;

          return (
            <div key={category} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-4 border-b border-gray-50 dark:border-gray-800 pb-3">
                <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight">
                  {config.label}
                </h3>
              </div>

              <div className="flex flex-wrap gap-3">
                {items.map((achievement) => (
                  <div key={achievement.id} className="relative group">
                    <div
                      className={`w-11 h-11 rounded-lg flex items-center justify-center cursor-default transition-all duration-300 ring-2 ring-offset-2 dark:ring-offset-gray-900 ${
                        getTierRingColor(achievement.tier, achievement.earned)
                      } ${
                        achievement.earned
                          ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 shadow-sm text-amber-600 dark:text-amber-400"
                          : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 opacity-40 grayscale text-gray-400"
                      }`}
                    >
                      {(() => {
                        const IconComp = EMOJI_ICON_MAP[achievement.icon];
                        return IconComp ? <IconComp className="w-6 h-6" /> : <span className="text-xl">{achievement.icon}</span>;
                      })()}
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 bottom-full mb-2 left-0 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] md:text-xs rounded-xl shadow-xl p-2.5 w-40 md:w-48 z-[100] pointer-events-none">
                      <p className="font-bold text-xs md:text-sm mb-0.5">{achievement.name}</p>
                      <p className="text-gray-300 dark:text-gray-600 mb-1.5 leading-tight">{achievement.description}</p>
                      {achievement.earned && achievement.earnedAt && (
                        <p className="text-[9px] text-amber-400 dark:text-amber-600 font-bold uppercase tracking-wider">
                          Unlocked {new Date(achievement.earnedAt).toLocaleDateString()}
                        </p>
                      )}
                      {!achievement.earned && (
                        <p className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">
                          Locked
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
