// frontend-web/src/app/ielts/dashboard/_components/HeroSection.tsx

"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function HeroSection() {
  const { user } = useAuth();

  const greeting = user?.firstName
    ? `Welcome back, ${user.firstName}!`
    : "Welcome to IELTS Preparation";

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6 md:p-8 text-white">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -ml-12 -mb-12 pointer-events-none" />

      <div className="relative z-10">
        {/* Greeting */}
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            IELTS Dashboard
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
          {greeting}
        </h1>

        <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl mb-6">
          Your complete IELTS preparation platform. Follow our 4-stage learning
          path from Foundation skills through Intensive mock tests. Use the tools
          below to personalize your journey, calculate scores, and track progress.
        </p>

        {/* Quick action buttons */}
        <div className="flex flex-wrap gap-3">
          <Link
            href="/ielts/roadmap"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-slate-900 text-sm font-bold hover:opacity-90 transition-opacity shadow-sm"
          >
            Get Your Personalized Plan
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/ielts/statistics"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 text-white text-sm font-bold hover:bg-white/20 transition-colors border border-white/10"
          >
            View Progress
          </Link>
        </div>
      </div>
    </section>
  );
}
