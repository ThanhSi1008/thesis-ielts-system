"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { ArrowRight, CheckCircle2, Clock, Target, Crosshair, ChevronRight, Zap, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DiagnosticQuiz } from "./DiagnosticQuiz";

export default function IeltsOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  
  // Form State
  const [targetBand, setTargetBand] = useState<number>(6.5);
  const [dailyCommitment, setDailyCommitment] = useState<number>(30);
  const [examDate, setExamDate] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bands = [5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5];
  const timeOptions = [
    { mins: 15, label: "15 min/day", desc: "Light practice" },
    { mins: 30, label: "30 min/day", desc: "Steady progress" },
    { mins: 60, label: "60 min/day", desc: "Intensive prep" },
    { mins: 120, label: "2 hrs/day", desc: "Exam ready" },
  ];

  const handleComplete = async (
    takePlacement: boolean, 
    scores?: { listening: number; reading: number; writing: number; overall: number }
  ) => {
    setIsSubmitting(true);
    try {
      await api.post("/ielts/onboarding", {
        targetBand,
        dailyCommitmentMins: dailyCommitment,
        examDate: examDate || undefined,
        takePlacement,
        placementScore: scores?.overall ?? 0,
        placementListening: scores?.listening,
        placementReading: scores?.reading,
        placementWriting: scores?.writing,
      });
      // Force refresh to reload the layouts/roadmap
      window.location.href = "/ielts/roadmap";
    } catch (err) {
      console.error(err);
      alert("Failed to save profile. Please try again.");
      setIsSubmitting(false);
    }
  };

  const variants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full py-10 px-4 relative overflow-y-auto overflow-x-hidden">
      
      {/* Background decorations */}
      <div className="absolute top-[-100px] left-[-100px] w-64 h-64 bg-[#FFF9E6] rounded-full blur-[80px] pointer-events-none -z-10" />
      <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className={`w-full ${step === 3 ? "max-w-[4xl] lg:max-w-5xl" : "max-w-2xl"} bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden relative transition-all duration-500`}>
        
        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-gray-50 flex">
          <div 
            className="h-full bg-[#FFC107] transition-all duration-500 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className="p-6 md:p-8 flex flex-col relative">
          
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Goal & Time */}
            {step === 1 && (
              <motion.div 
                key="step1"
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex-1 flex flex-col"
              >
                <div className="flex items-center gap-3 mb-2 text-[#FFC107]">
                  <Target className="w-6 h-6" />
                  <h2 className="text-sm font-bold tracking-widest uppercase">Step 1 of 3</h2>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 leading-tight">
                  Let's personalize your <br/> IELTS roadmap.
                </h1>
                <p className="text-gray-500 font-medium mb-10">
                  Tell us your target and how much you can study daily.
                </p>

                <div className="space-y-8">
                  {/* Target Band */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                       Target IELTS Band Score
                    </label>
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                      {bands.map((b) => (
                        <button
                          key={b}
                          onClick={() => setTargetBand(b)}
                          className={`py-2 px-3 rounded-lg text-sm font-medium transition-all border ${
                            targetBand === b 
                              ? "bg-gray-900 border-gray-900 text-white" 
                              : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {b.toFixed(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Daily Commitment */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                       Daily Study Commitment
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {timeOptions.map((opt) => (
                        <button
                          key={opt.mins}
                          onClick={() => setDailyCommitment(opt.mins)}
                          className={`p-3 rounded-lg flex flex-col items-start transition-all border ${
                            dailyCommitment === opt.mins
                              ? "border-gray-900 bg-gray-50 ring-1 ring-gray-900"
                              : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <span className={`text-sm font-medium ${dailyCommitment === opt.mins ? 'text-gray-900' : 'text-gray-700'}`}>
                            {opt.label}
                          </span>
                          <span className="text-xs text-gray-500 mt-0.5">
                            {opt.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Exam Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                       Target Exam Date <span className="font-normal text-gray-400">(Optional)</span>
                    </label>
                    <input
                      type="date"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="w-full md:w-1/2 p-2.5 rounded-lg border border-gray-200 bg-white focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all text-sm font-medium text-gray-900"
                    />
                  </div>
                </div>

                <div className="mt-auto pt-10 flex justify-end">
                  <button 
                    onClick={() => setStep(2)}
                    className="flex items-center gap-2 bg-[#FFC107] text-gray-900 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#E0A800] transition-colors"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Placement Pitch */}
            {step === 2 && (
              <motion.div 
                key="step2"
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex-1 flex flex-col items-center justify-center text-center max-w-lg mx-auto"
              >
                <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center mb-6">
                  <Zap className="w-5 h-5 text-[#FFC107]" />
                </div>
                
                <h1 className="text-xl font-semibold text-gray-900 mb-2">
                  Already know some English?
                </h1>
                <p className="text-sm text-gray-500 mb-8 max-w-sm">
                  Take a quick 2-minute diagnostic. We'll assess your current level and automatically skip basic lessons so you can focus on material that improves your score.
                </p>

                <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
                  <button 
                    onClick={() => setStep(3)}
                    className="flex items-center justify-center gap-2 bg-[#FFC107] w-full text-gray-900 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#E0A800] transition-colors"
                  >
                    Take Short Placement Test
                  </button>
                  <button 
                    onClick={() => handleComplete(false)}
                    disabled={isSubmitting}
                    className="text-xs font-medium text-gray-400 py-2 hover:text-gray-700 transition-colors"
                  >
                    Skip and start from absolute basics
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Placement Test */}
            {step === 3 && (
              <motion.div 
                key="step3"
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex-1 flex flex-col items-center justify-center w-full"
              >
                <div className="w-full max-w-5xl">
                   <DiagnosticQuiz 
                     onComplete={(scores) => handleComplete(true, scores)} 
                     isSubmitting={isSubmitting} 
                   />
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
