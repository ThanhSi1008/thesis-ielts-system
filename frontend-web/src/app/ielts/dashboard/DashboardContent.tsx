// frontend-web/src/app/ielts/dashboard/DashboardContent.tsx

"use client";

import React from "react";
import { useDashboardData } from "./_hooks/useDashboardData";
import { STAGES, FEATURES } from "./_constants/dashboard.constants";
import HeroSection from "./_components/HeroSection";
import QuickStatsBar from "./_components/QuickStatsBar";
import RoadmapTimeline from "./_components/RoadmapTimeline";
import FeatureCard from "./_components/FeatureCard";

export default function DashboardContent() {
  const { counts, loading, error } = useDashboardData();

  return (
    <div className="pt-6 pb-16 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* ── Hero Section ── */}
        <HeroSection />

        {/* ── Quick Stats ── */}
        <QuickStatsBar counts={counts} loading={loading} />

        {/* ── Error Banner (graceful) ── */}
        {error && (
          <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 rounded-xl p-4 text-sm font-medium">
            Some data couldn't be loaded. Counts may be incomplete.
          </div>
        )}

        {/* ── Learning Roadmap (4 Stages) ── */}
        <RoadmapTimeline stages={STAGES} counts={counts} loading={loading} />

        {/* ── Additional Features ── */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 rounded-full bg-gradient-to-b from-amber-400 to-violet-500" />
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Tools & Features
              </h2>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Additional tools to enhance your IELTS preparation
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FEATURES.map((feature) => (
              <FeatureCard
                key={feature.id}
                title={feature.title}
                description={feature.description}
                href={feature.href}
                iconKey={feature.iconKey}
                accentColor={feature.accentColor}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
