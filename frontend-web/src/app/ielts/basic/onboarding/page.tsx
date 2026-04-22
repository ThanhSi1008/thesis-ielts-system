"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { ArrowRight, CheckCircle2, Clock, Target, Crosshair, ChevronRight, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function IeltsOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  
  // Form State
  const [targetBand, setTargetBand] = useState<number>(6.5);
  const [dailyCommitment, setDailyCommitment] = useState<number>(30);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bands = [5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5];
  const timeOptions = [
    { mins: 15, label: "15 min/day", desc: "Light practice" },
    { mins: 30, label: "30 min/day", desc: "Steady progress" },
    { mins: 60, label: "60 min/day", desc: "Intensive prep" },
    { mins: 120, label: "2 hrs/day", desc: "Exam ready" },
  ];

  const handleComplete = async (takePlacement: boolean, simulatedScore: number = 0) => {
    setIsSubmitting(true);
    try {
      await api.post("/ielts/onboarding", {
        targetBand,
        dailyCommitmentMins: dailyCommitment,
        takePlacement,
        placementScore: simulatedScore,
      });
      // Force refresh to reload the layouts/roadmap
      window.location.href = "/ielts/basic";
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
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-12 px-4 relative overflow-hidden">
      
      {/* Background decorations */}
      <div className="absolute top-[-100px] left-[-100px] w-64 h-64 bg-[#FFF9E6] rounded-full blur-[80px] pointer-events-none -z-10" />
      <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden relative">
        
        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-gray-50 flex">
          <div 
            className="h-full bg-gradient-to-r from-[#FFC107] to-[#FF9800] transition-all duration-500 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className="p-8 md:p-12 min-h-[450px] flex flex-col relative">
          
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
                <div className="flex items-center gap-3 mb-2 text-[#FF9800]">
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
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                      <Crosshair className="w-4 h-4 text-gray-400" /> Target IELTS Band Score
                    </label>
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                      {bands.map((b) => (
                        <button
                          key={b}
                          onClick={() => setTargetBand(b)}
                          className={`py-3 rounded-xl font-bold transition-all ${
                            targetBand === b 
                              ? "bg-gray-900 text-white shadow-md scale-105" 
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100"
                          }`}
                        >
                          {b.toFixed(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Daily Commitment */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                      <Clock className="w-4 h-4 text-gray-400" /> Daily Study Commitment
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {timeOptions.map((opt) => (
                        <button
                          key={opt.mins}
                          onClick={() => setDailyCommitment(opt.mins)}
                          className={`p-4 rounded-2xl flex flex-col items-start transition-all border-2 ${
                            dailyCommitment === opt.mins
                              ? "border-[#FFC107] bg-[#FFFdf5] shadow-sm"
                              : "border-gray-100 bg-white hover:border-gray-200"
                          }`}
                        >
                          <span className={`text-lg font-bold ${dailyCommitment === opt.mins ? 'text-gray-900' : 'text-gray-700'}`}>
                            {opt.label}
                          </span>
                          <span className={`text-sm font-medium ${dailyCommitment === opt.mins ? 'text-[#e0a800]' : 'text-gray-400'}`}>
                            {opt.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-10 flex justify-end">
                  <button 
                    onClick={() => setStep(2)}
                    className="flex items-center gap-2 bg-[#FFC107] text-gray-900 px-8 py-3.5 rounded-xl font-bold hover:bg-[#FFB300] transition-transform hover:scale-105 active:scale-95 shadow-sm"
                  >
                    Continue <ArrowRight className="w-5 h-5" />
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
                <div className="w-20 h-20 bg-[#FFF0C2] rounded-full flex items-center justify-center mb-6">
                  <Zap className="w-10 h-10 text-[#FFC107]" />
                </div>
                
                <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
                  Already know some English?
                </h1>
                <p className="text-gray-600 font-medium mb-10 leading-relaxed">
                  Take a quick 2-minute placement diagnostic. We'll assess your current level and automatically skip basic lessons so you can focus on material that actually improves your score.
                </p>

                <div className="flex flex-col gap-4 w-full">
                  <button 
                    onClick={() => setStep(3)}
                    className="flex items-center justify-center gap-2 bg-[#FFC107] w-full text-gray-900 px-8 py-4 rounded-2xl font-bold hover:bg-[#FFB300] transition-transform hover:scale-105 active:scale-95 shadow-md shadow-[#FFC107]/20 text-lg"
                  >
                    Take Short Placement Test
                  </button>
                  <button 
                    onClick={() => handleComplete(false)}
                    disabled={isSubmitting}
                    className="text-gray-400 font-bold py-3 hover:text-gray-600 transition-colors"
                  >
                    Skip and start from absolute basics
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Placement Test Simulation (DEV) */}
            {step === 3 && (
              <motion.div 
                key="step3"
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex-1 flex flex-col items-center justify-center text-center max-w-lg mx-auto"
              >
                <div className="p-6 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 w-full mb-8">
                  <h3 className="text-gray-400 font-extrabold text-sm uppercase tracking-widest mb-4">Dev Environment</h3>
                  <p className="text-sm text-gray-500 font-medium mb-6">
                    In a production environment, an actual English diagnostic quiz would render here. For development, simulate a test result below to bypass the basics.
                  </p>
                  
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => handleComplete(true, 90)}
                      disabled={isSubmitting}
                      className="group flex items-center justify-between p-4 bg-white border border-green-200 rounded-xl hover:border-green-400 hover:shadow-sm transition-all"
                    >
                      <div className="flex flex-col items-start gap-0.5">
                        <span className="font-bold text-green-700">Simulate High Score (90%)</span>
                        <span className="text-[12px] text-green-600/70 font-medium">Completed foundational lessons</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-green-500 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button 
                      onClick={() => handleComplete(true, 40)}
                      disabled={isSubmitting}
                      className="group flex items-center justify-between p-4 bg-white border border-orange-200 rounded-xl hover:border-orange-400 hover:shadow-sm transition-all"
                    >
                      <div className="flex flex-col items-start gap-0.5">
                        <span className="font-bold text-orange-700">Simulate Low Score (40%)</span>
                        <span className="text-[12px] text-orange-600/70 font-medium">Starts from Day 1</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-orange-500 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>

                {isSubmitting && (
                  <div className="flex items-center justify-center gap-3 text-gray-500 font-bold animate-pulse">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-[#FFC107] rounded-full animate-spin" />
                    Generating personalized roadmap...
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
