"use client";

import { useState, useRef, useEffect, useMemo } from "react";

// The types corresponding to our seed data
interface SpeakingQuestion {
  text: string;
  audio: string;
}

interface SpeakingPart {
  part_number: number;
  part_type: string;
  topic: string;
  questions?: SpeakingQuestion[];
  cue_card?: string;
  audio?: string;
}

interface SpeakingTaskBoardProps {
  exam: any; // The full exam object
  onAnswersChange?: (ans: Record<string, any>) => void;
  onSubmit: (answers: Record<string, any>) => void;
  submitting: boolean;
}

type StepState = "IDLE" | "LISTEN_CAPTION" | "PLAYING" | "THINK_CAPTION" | "THINKING" | "RECORDING" | "RECORDED";

export default function SpeakingTaskBoard({
  exam,
  onAnswersChange,
  onSubmit,
  submitting
}: SpeakingTaskBoardProps) {
  const parts: SpeakingPart[] = exam?.questions?.parts || [];
  const videoUrl: string = exam?.questions?.video_url || "";

  // Which part & question are we currently on?
  const [activePartIdx, setActivePartIdx] = useState(0);
  const [activeQnIdx, setActiveQnIdx] = useState(0);

  const [step, setStep] = useState<StepState>("IDLE");
  const [thinkTimeLeft, setThinkTimeLeft] = useState(0);
  const [recordTimeElapsed, setRecordTimeElapsed] = useState(0);

  // Store user's recorded audio blobs
  const [answers, setAnswers] = useState<Record<string, { blob: Blob; url: string }>>({});

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const currentPart = parts[activePartIdx];
  
  // Normalize the current question data whether it's Part 1/3 (array) or Part 2 (single audio/cue_card)
  const currentQuestionData = useMemo(() => {
    if (!currentPart) return null;
    if (currentPart.questions && currentPart.questions.length > 0) {
      return currentPart.questions[activeQnIdx];
    }
    // Part 2
    return {
      text: currentPart.cue_card || "",
      audio: currentPart.audio || ""
    };
  }, [currentPart, activeQnIdx]);

  const questionKey = `${activePartIdx}-${activeQnIdx}`;
  const isRecorded = !!answers[questionKey];

  // Helper to get total length of questions in current part
  const totalQuestionsInPart = currentPart?.questions?.length || 1;

  // Clean up timers
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Update parent when answers change
  useEffect(() => {
    if (onAnswersChange) {
      onAnswersChange(answers);
    }
  }, [answers, onAnswersChange]);

  const startPlaybackFlow = () => {
    if (!currentQuestionData?.audio) return;
    setStep("LISTEN_CAPTION");
    
    // 2 seconds later, start playing
    setTimeout(() => {
      setStep("PLAYING");
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(e => console.error("Video play error:", e));
      }
      if (audioRef.current) {
        audioRef.current.src = currentQuestionData.audio;
        audioRef.current.play().catch(e => console.error("Audio play error:", e));
      }
    }, 2000);
  };

  const handleAudioEnded = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setStep("THINK_CAPTION");
    
    // Quickly show "Time to think" then start thinking timer
    setTimeout(() => {
      setStep("THINKING");
      // 5s for Part 1 & 3; 60s for Part 2
      const thinkDuration = currentPart.part_number === 2 ? 60 : 5;
      setThinkTimeLeft(thinkDuration);
    }, 2000);
  };

  // Thinking Timer
  useEffect(() => {
    if (step === "THINKING") {
      if (thinkTimeLeft > 0) {
        timerRef.current = window.setTimeout(() => setThinkTimeLeft(t => t - 1), 1000);
      } else {
        // Time to think is over, auto start recording
        startRecording();
      }
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [step, thinkTimeLeft]);

  // Recording Timer
  useEffect(() => {
    if (step === "RECORDING") {
      timerRef.current = window.setTimeout(() => {
        const newElapsed = recordTimeElapsed + 1;
        setRecordTimeElapsed(newElapsed);
        
        // Check max duration: 60s for Part 1/3; 120s for Part 2
        const maxDuration = currentPart.part_number === 2 ? 120 : 60;
        if (newElapsed >= maxDuration) {
          stopRecording();
        }
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [step, recordTimeElapsed, currentPart]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAnswers(prev => ({ ...prev, [questionKey]: { blob, url } }));
        setStep("RECORDED");
      };

      mediaRecorderRef.current.start();
      setRecordTimeElapsed(0);
      setStep("RECORDING");
    } catch (err) {
      console.error("Microphone access denied:", err);
      // Fallback state if they deny mic
      alert("Microphone access is required to take the speaking test.");
      setStep("IDLE");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleNextBtnClick = () => {
    if (activeQnIdx < totalQuestionsInPart - 1) {
      // Next question in same part
      setActiveQnIdx(prev => prev + 1);
      setStep("IDLE");
    } else if (activePartIdx < parts.length - 1) {
      // Next part
      setActivePartIdx(prev => prev + 1);
      setActiveQnIdx(0);
      setStep("IDLE");
    } else {
      // Submit the whole test
      onSubmit(answers);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!currentPart) return null;

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-[#fafafa] overflow-hidden text-[#1a1a1a] font-sans">
      
      {/* Hidden Audio Element for Examiner */}
      <audio ref={audioRef} onEnded={handleAudioEnded} className="hidden" />

      {/* Top Instructions Banner */}
      <div className="bg-[#f1f2ec] border border-[#e2dcd2] rounded-[3px] py-3 px-5 mx-4 mt-3 mb-4 flex-shrink-0 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <div className="font-bold text-[16px] mb-1.5 text-black tracking-wide">{currentPart.part_type}</div>
            <div className="text-[15px] font-medium text-[#222]">
              {currentPart.part_number === 2 
                ? "You will have 1 minute to prepare, and 1 to 2 minutes to speak."
                : "Listen to the examiner and answer the questions."}
            </div>
          </div>
          {/* Status Badge */}
          <div className="bg-white border border-[#ccc] px-3 py-1.5 rounded-full text-[13px] font-bold uppercase tracking-wider text-[#555] shadow-sm">
            {step === "IDLE" && "Ready"}
            {step === "LISTEN_CAPTION" && "Listen"}
            {step === "PLAYING" && "Prompt Playing"}
            {step === "THINK_CAPTION" && "Prepare"}
            {step === "THINKING" && "Thinking Time"}
            {step === "RECORDING" && (
              <span className="flex items-center gap-2 text-red-600">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
                Recording
              </span>
            )}
            {step === "RECORDED" && "Recorded"}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden relative w-full px-6 mb-6 gap-6">

        {/* Left column (Video & Actions) */}
        <div className="w-full md:w-[45%] flex flex-col items-center justify-start pt-4 h-full">
          
          <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-lg border-2 border-[#eee]">
            {/* The examiner video looping */}
            <video 
              ref={videoRef}
              src={videoUrl}
              loop
              muted
              playsInline
              className={`w-full h-full object-cover transition-opacity duration-300 ${step === "PLAYING" ? "opacity-100" : "opacity-60"}`}
            />
            
            {/* Overlay Captions based on step */}
            {step === "LISTEN_CAPTION" && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center animate-in fade-in z-10">
                <span className="text-white text-2xl font-bold tracking-wider">Listen to the question</span>
              </div>
            )}
            {step === "THINK_CAPTION" && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center animate-in fade-in z-10">
                <span className="text-white text-2xl font-bold tracking-wider">Time to think</span>
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-col items-center justify-center w-full h-[180px] bg-white border border-[#cfcfcf] rounded-xl shadow-sm p-6 relative">
            
            {/* Central Action Area */}
            {step === "IDLE" && (
              <button 
                onClick={startPlaybackFlow}
                className="bg-[#2181d8] hover:bg-[#1a6bb5] text-white font-bold py-3 px-8 rounded-full shadow-md text-lg transition-transform hover:scale-105"
              >
                Play Question
              </button>
            )}

            {step === "THINKING" && (
              <div className="flex flex-col items-center">
                <div className="text-sm uppercase tracking-widest text-[#666] mb-2 font-bold">Preparation Time</div>
                <div className="text-4xl font-light text-[#111] tabular-nums tracking-tight">{formatTime(thinkTimeLeft)}</div>
              </div>
            )}

            {step === "RECORDING" && (
              <div className="flex flex-col items-center w-full">
                 <div className="text-sm uppercase tracking-widest text-red-600 mb-2 font-bold animate-pulse">Recording...</div>
                 <div className="text-4xl font-light text-[#111] tabular-nums tracking-tight mb-4">{formatTime(recordTimeElapsed)}</div>
                 
                 <button 
                  onClick={stopRecording}
                  disabled={recordTimeElapsed < 3}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${recordTimeElapsed < 3 ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 shadow-md transform hover:scale-105'}`}
                  title={recordTimeElapsed < 3 ? "Wait at least 3 seconds" : "Stop Recording"}
                 >
                   <div className="w-5 h-5 bg-white rounded-[3px]"></div>
                 </button>
              </div>
            )}

            {step === "RECORDED" && isRecorded && (
              <div className="flex flex-col items-center w-full">
                 <div className="text-green-600 font-bold flex items-center gap-2 mb-3 text-lg">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                   Answer Recorded
                 </div>
                 {/* Provide basic playback for the user to hear what they recorded */}
                 <audio controls src={answers[questionKey].url} className="w-full h-[40px] mt-2" />
                 
                 {/* Re-record Option */}
                 <button 
                  onClick={() => {
                    setAnswers(prev => {
                      const copy = {...prev};
                      delete copy[questionKey];
                      return copy;
                    });
                    setStep("IDLE");
                    setRecordTimeElapsed(0);
                    setThinkTimeLeft(0);
                  }}
                  className="mt-4 text-[13px] text-gray-500 hover:text-gray-800 underline"
                 >
                   Re-record Answer
                 </button>
              </div>
            )}
            
            {(step === "PLAYING" || step === "LISTEN_CAPTION" || step === "THINK_CAPTION") && (
               <div className="flex flex-col items-center">
                  <div className="w-8 h-8 border-4 border-[#2181d8] border-t-transparent rounded-full animate-spin"></div>
                  <div className="mt-3 text-[#555] text-sm font-medium">Please wait...</div>
               </div>
            )}

          </div>

        </div>

        {/* Right column (Text/Cue Card) */}
        <div className="w-full md:w-[55%] h-full flex flex-col overflow-hidden bg-white rounded-xl shadow-sm border border-[#e2dcd2]">
          <div className="px-6 py-4 border-b border-[#eee] bg-[#fafafa]">
            <h2 className="text-xl font-bold text-[#111]">
               {currentPart.topic} 
            </h2>
            <div className="text-sm text-[#777] mt-1">Question {activeQnIdx + 1} of {totalQuestionsInPart}</div>
          </div>
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar text-[17px] leading-[1.7] text-[#1a1a1a]">
            {/* Show Text only if requested (or maybe standard IELTS says text is not shown in Part 1/3? User images show it!) */}
            {/* User prompt says: "part 1 should look like this: image... part 3 should look like part 1" and the image implies text is shown! */}
            {currentPart.part_number === 2 && currentQuestionData?.text ? (
              <div className="whitespace-pre-wrap cue-card-content border-l-4 border-[#2181d8] pl-5 py-2 bg-[#f8fbff] rounded-r-lg">
                <span className="font-bold text-[18px] block mb-4 text-[#000]">Candidate Task Card</span>
                {currentQuestionData.text}
              </div>
            ) : (
              <div className="text-[18px] font-medium p-4 bg-[#f8f9fa] rounded-lg border border-[#eee]">
                "{currentQuestionData?.text}"
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Footer Navigation */}
      <footer className="h-[60px] flex-shrink-0 flex items-center justify-between px-6 bg-white border-t border-[#dcdcdc] z-20 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
        
        {/* Parts Tabs (Read Only Status) */}
        <div className="flex items-center h-full gap-4">
          {[1,2,3].map(pn => (
            <div key={pn} className={`flex items-center gap-2 ${activePartIdx + 1 === pn ? 'font-bold text-[#2181d8]' : 'font-medium text-[#888]'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] ${activePartIdx + 1 > pn ? 'bg-[#319c28] text-white' : activePartIdx + 1 === pn ? 'bg-[#2181d8] text-white' : 'bg-[#e0e0e0] text-[#777]'}`}>
                {activePartIdx + 1 > pn ? '✓' : pn}
              </div>
              <span>Part {pn}</span>
            </div>
          ))}
        </div>

        {/* Next/Submit Button */}
        <button
          onClick={handleNextBtnClick}
          disabled={step !== "RECORDED" || submitting}
          className={`px-8 py-2.5 rounded-full font-bold text-[15px] transition-all ${
            step === "RECORDED" && !submitting
            ? 'bg-[#319c28] hover:bg-[#278220] text-white shadow-md transform hover:scale-[1.03]'
            : 'bg-[#e5e5e5] text-[#999] cursor-not-allowed'
          }`}
        >
          {submitting ? 'Submitting...' : (activePartIdx === parts.length - 1 && activeQnIdx === totalQuestionsInPart - 1 ? 'Finish & Submit' : 'Next Question')}
        </button>
      </footer>
    </div>
  );
}
