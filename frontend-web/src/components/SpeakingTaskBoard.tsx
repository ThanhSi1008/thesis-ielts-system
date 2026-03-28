"use client";

import { useState, useRef, useEffect, useMemo } from "react";

// The types corresponding to our seed data
interface SpeakingQuestion {
  text: string;
  video?: string;
  video2?: string;
}

interface SpeakingPart {
  part_number: number;
  part_type: string;
  topic: string;
  questions?: SpeakingQuestion[];
  cue_card?: string;
  video?: string;
  video2?: string;
}

interface SpeakingTaskBoardProps {
  exam: any; // The full exam object
  onAnswersChange?: (ans: Record<string, any>) => void;
  onSubmit: (answers: Record<string, any>) => void;
  submitting: boolean;
}

type StepState = "IDLE" | "LISTEN_CAPTION" | "PLAYING" | "THINK_CAPTION" | "THINKING" | "PLAYING_2" | "RECORDING" | "RECORDED";

export default function SpeakingTaskBoard({
  exam,
  onAnswersChange,
  onSubmit,
  submitting
}: SpeakingTaskBoardProps) {
  const parts: SpeakingPart[] = exam?.questions?.parts || [];

  // Which part & question are we currently on?
  const [activePartIdx, setActivePartIdx] = useState(0);
  const [activeQnIdx, setActiveQnIdx] = useState(0);
  const [autoPlayNext, setAutoPlayNext] = useState(false);

  const [step, setStep] = useState<StepState>("IDLE");
  const [thinkTimeLeft, setThinkTimeLeft] = useState(0);
  const [recordTimeElapsed, setRecordTimeElapsed] = useState(0);

  // Store user's recorded audio blobs
  const [answers, setAnswers] = useState<Record<string, { blob: Blob; url: string }>>({});

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const hasAutoStarted = useRef(false);

  const currentPart = parts[activePartIdx];

  // Normalize the current question data whether it's Part 1/3 (array) or Part 2 (single video/cue_card)
  const currentQuestionData = useMemo(() => {
    if (!currentPart) return null;
    if (currentPart.questions && currentPart.questions.length > 0) {
      return currentPart.questions[activeQnIdx];
    }
    // Part 2
    return {
      text: currentPart.cue_card || "",
      video: currentPart.video || "",
      video2: currentPart.video2 || ""
    };
  }, [currentPart, activeQnIdx]);

  const currentVideoUrl = currentQuestionData?.video || "";
  const currentVideo2Url = currentQuestionData?.video2 || "";
  const activeVideoSrc = step === "PLAYING_2" ? currentVideo2Url : currentVideoUrl;

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

  // Handle auto-playing next question
  useEffect(() => {
    if (autoPlayNext && step === "IDLE" && currentVideoUrl) {
      setAutoPlayNext(false);
      startPlaybackFlow();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlayNext, step, currentVideoUrl]);

  // Auto-play the first question when the exam loads
  useEffect(() => {
    if (!hasAutoStarted.current && currentVideoUrl && step === "IDLE") {
      hasAutoStarted.current = true;
      startPlaybackFlow();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentVideoUrl]);

  const startPlaybackFlow = () => {
    if (!currentVideoUrl) return;

    // Immediately pause and reset so the video doesn't accidentally play
    // during the 2-second "Listen to the question" caption delay
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }

    setStep("LISTEN_CAPTION");

    // 2 seconds later, start playing
    setTimeout(() => {
      setStep("PLAYING");
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(e => console.error("Video play error:", e));
      }
    }, 2000);
  };

  const handleVideoEnded = () => {
    if (step === "PLAYING") {
      setStep("THINK_CAPTION");

      // Quickly show "Time to think" then start thinking timer
      setTimeout(() => {
        setStep("THINKING");
        // 2s for Part 1 & 3; 60s for Part 2
        const thinkDuration = currentPart.part_number === 2 ? 60 : 2;
        setThinkTimeLeft(thinkDuration);
      }, 2000);
    } else if (step === "PLAYING_2") {
      startRecording();
    }
  };

  // Thinking Timer
  useEffect(() => {
    if (step === "THINKING") {
      if (thinkTimeLeft > 0) {
        timerRef.current = window.setTimeout(() => setThinkTimeLeft(t => t - 1), 1000);
      } else {
        // Time to think is over
        if (currentVideo2Url) {
          setStep("PLAYING_2");
        } else {
          startRecording();
        }
      }
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [step, thinkTimeLeft, currentVideo2Url]);

  // Handle the play logic for the second video after React updates the src
  useEffect(() => {
    if (step === "PLAYING_2" && videoRef.current) {
      const playTimer = setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play().catch(e => console.error("Video2 play error:", e));
        }
      }, 150);
      return () => clearTimeout(playTimer);
    }
  }, [step]);

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
      setAutoPlayNext(true);
      setStep("IDLE");
    } else if (activePartIdx < parts.length - 1) {
      // Next part
      setActivePartIdx(prev => prev + 1);
      setActiveQnIdx(0);
      setAutoPlayNext(true);
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

      {/* Top Instructions Banner removed */}


      {currentPart.part_number !== 2 ? (
        // === CENTERED LAYOUT FOR PART 1 & 3 ===
        <div className="flex-1 min-h-0 flex flex-col items-center justify-start overflow-y-auto px-6 py-6 w-full custom-scrollbar">
          <div className="bg-white rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-[#eaeaea] w-full max-w-[640px] p-8 flex flex-col items-center relative">

            <h2 className="text-[24px] font-bold text-black mb-7 tracking-tight">Speaking Part {currentPart.part_number}</h2>

            {/* Video Area */}
            <div className="relative w-full max-w-[500px] aspect-video bg-[#e8e8e8] rounded-2xl overflow-hidden mb-6 shadow-sm border border-[#f0f0f0]">
              <video
                ref={videoRef}
                src={activeVideoSrc}
                playsInline
                onEnded={handleVideoEnded}
                className={`w-full h-full object-cover transition-opacity duration-500 ${(step === "PLAYING" || step === "PLAYING_2") ? "opacity-100" : "opacity-80"}`}
              />
              {step === "LISTEN_CAPTION" && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/75 px-4 py-1.5 rounded text-[16px] text-white font-medium z-10 whitespace-nowrap animate-in fade-in">
                  Listen to the question
                </div>
              )}
              {step === "THINK_CAPTION" && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/75 px-4 py-1.5 rounded text-[16px] text-white font-medium z-10 whitespace-nowrap animate-in fade-in">
                  Time to think
                </div>
              )}
              {step === "THINKING" && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/75 px-4 py-1.5 rounded text-[16px] text-white font-medium z-10 whitespace-nowrap">
                  Time to think: {formatTime(thinkTimeLeft)}
                </div>
              )}
            </div>

            {/* Action / Controls Area — Unified design like Part 2 */}
            <div className="w-full relative flex items-center justify-between pt-8 mt-8 border-t border-[#e8e8e8]">

              {/* Timer */}
              <div className={`flex items-center gap-2 border border-[#eaeaea] rounded px-3 py-1.5 transition-opacity duration-300 ${(step === "RECORDING" || step === "RECORDED") ? "opacity-100" : "opacity-0"}`}>
                <svg className="w-[18px] h-[18px] text-[#e31837]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 6v6l4 2"></path>
                </svg>
                <span className="text-[#e31837] text-[15px] tracking-wide font-medium w-[40px] text-center">
                  {(step === "RECORDING" || step === "RECORDED") ? formatTime(recordTimeElapsed) : "0:00"}
                </span>
              </div>

              {/* Main Play / Mic / Check Button on the line */}
              <div className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center bg-white rounded-full p-2">
                {step === "IDLE" && (
                  <button
                    onClick={startPlaybackFlow}
                    className="w-[64px] h-[64px] bg-gradient-to-b from-[#e31837] to-[#b01229] text-white rounded-full flex items-center justify-center shadow-[0_4px_10px_rgba(227,24,55,0.35)] hover:scale-105 hover:from-[#f01c3d] hover:to-[#c4142e] transition-all duration-300"
                  >
                    <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </button>
                )}
                {(step === "PLAYING" || step === "PLAYING_2" || step === "LISTEN_CAPTION" || step === "THINK_CAPTION" || step === "THINKING") && (
                  <div className="w-[64px] h-[64px] bg-gray-50 border-[3px] border-[#f0f0f0] rounded-full flex items-center justify-center shadow-inner">
                    <div className="w-6 h-6 rounded-full border-[2px] border-gray-200"></div>
                  </div>
                )}
                {step === "RECORDING" && (
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-[64px] h-[64px] bg-[#e31837] rounded-full animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] opacity-75"></div>
                    <button
                      onClick={stopRecording}
                      className="relative z-10 w-[64px] h-[64px] bg-gradient-to-b from-[#e31837] to-[#b01229] text-white rounded-full flex items-center justify-center shadow-[0_4px_10px_rgba(227,24,55,0.4)] transition-all duration-300 hover:scale-95 hover:from-[#d11531] hover:to-[#a31126]"
                    >
                      <div className="w-[20px] h-[20px] bg-white rounded-sm shadow-sm" />
                    </button>
                  </div>
                )}
                {step === "RECORDED" && isRecorded && (
                  <div className="w-[64px] h-[64px] bg-white border-2 border-[#e31837] text-[#e31837] rounded-full flex items-center justify-center shadow-md">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                )}
              </div>

              {/* Next Button */}
              <div className="flex items-center justify-end min-w-[90px] gap-3">
                <button
                  onClick={() => {
                    stopRecording();
                    handleNextBtnClick();
                  }}
                  className="text-[#999] hover:text-[#333] text-[15px] font-medium transition-colors px-2"
                >
                  Skip
                </button>
                <button
                  onClick={handleNextBtnClick}
                  disabled={step !== "RECORDED" || submitting}
                  className={`flex items-center justify-center px-5 py-2 rounded-[8px] text-[15px] font-black transition-all duration-300 ${step === "RECORDED" && !submitting
                    ? 'bg-gradient-to-b from-[#e31837] to-[#b01229] hover:from-[#f01c3d] hover:to-[#c4142e] text-white cursor-pointer shadow-md hover:scale-105 active:scale-95'
                    : 'bg-[#e5e5e5] text-[#999] cursor-not-allowed opacity-50'
                    }`}
                >
                  Next <span className="ml-1 text-[16px] leading-none">»</span>
                </button>
              </div>
            </div>

            {/* Re-record logic removed as requested */}

          </div>
        </div>
      ) : (
        // === CENTERED LAYOUT FOR PART 2 ===
        <div className="flex-1 min-h-0 flex flex-col items-center justify-start overflow-y-auto px-6 py-6 w-full custom-scrollbar">
          <div className="bg-white rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-[#eaeaea] w-full max-w-[960px] p-8 flex flex-col items-center relative">

            <h2 className="text-[20px] font-bold text-black mb-8 tracking-tight">Speaking Part {currentPart.part_number}</h2>

            <div className="flex flex-col md:flex-row w-full gap-8">

              {/* LEFT COLUMN - Video & Controls */}
              <div className="w-full md:w-[50%] flex flex-col">
                <div className="relative w-full aspect-video bg-[#e8e8e8] rounded-2xl overflow-hidden mb-4 shadow-sm border border-[#f0f0f0]">
                  <video
                    ref={videoRef}
                    src={activeVideoSrc}
                    playsInline
                    onEnded={handleVideoEnded}
                    className={`w-full h-full object-cover transition-opacity duration-500 ${(step === "PLAYING" || step === "PLAYING_2") ? "opacity-100" : "opacity-80"}`}
                  />
                  {step === "LISTEN_CAPTION" && (
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/75 px-4 py-1.5 rounded text-[16px] text-white font-medium z-10 whitespace-nowrap animate-in fade-in">
                      Listen to the question
                    </div>
                  )}
                  {step === "THINK_CAPTION" && (
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/75 px-4 py-1.5 rounded text-[16px] text-white font-medium z-10 whitespace-nowrap animate-in fade-in">
                      Time to think
                    </div>
                  )}
                  {step === "THINKING" && (
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/75 px-4 py-1.5 rounded text-[16px] text-white font-medium z-10 whitespace-nowrap">
                      Time to think: {formatTime(thinkTimeLeft)}
                    </div>
                  )}
                </div>

                <div className="text-[16px] font-medium text-[#111] mb-8 text-center">
                  Listen to the instructions and answer cue card
                </div>

                {/* Controls area, separated by a thin top line */}
                <div className="w-full relative flex items-center justify-between pt-6 mt-6 border-t border-[#e8e8e8]">

                  {/* Timer */}
                  <div className={`flex items-center gap-2 border border-[#eaeaea] rounded px-3 py-1.5 transition-opacity duration-300 ${(step === "RECORDING" || step === "RECORDED") ? "opacity-100" : "opacity-0"}`}>
                    <svg className="w-[18px] h-[18px] text-[#e31837]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 6v6l4 2"></path>
                    </svg>
                    <span className="text-[#e31837] text-[15px] tracking-wide font-medium w-[40px] text-center">
                      {(step === "RECORDING" || step === "RECORDED") ? formatTime(recordTimeElapsed) : "0:00"}
                    </span>
                  </div>

                  {/* Play / Mic Button */}
                  <div className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center bg-white rounded-full p-2">
                    {step === "IDLE" && (
                      <button
                        onClick={startPlaybackFlow}
                        className="w-[64px] h-[64px] bg-gradient-to-b from-[#e31837] to-[#b01229] text-white rounded-full flex items-center justify-center shadow-[0_4px_10px_rgba(227,24,55,0.35)] hover:scale-105 hover:from-[#f01c3d] hover:to-[#c4142e] transition-all duration-300"
                      >
                        <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      </button>
                    )}
                    {(step === "PLAYING" || step === "PLAYING_2" || step === "LISTEN_CAPTION" || step === "THINK_CAPTION" || step === "THINKING") && (
                      <div className="flex flex-col items-center justify-center bg-white rounded-full">
                        <div className="w-[64px] h-[64px] bg-gray-50 border-[3px] border-[#f0f0f0] rounded-full flex items-center justify-center shadow-inner">
                          <div className="w-6 h-6 rounded-full border-[2px] border-gray-200"></div>
                        </div>
                      </div>
                    )}
                    {step === "RECORDING" && (
                      <div className="relative flex items-center justify-center">
                        <div className="absolute w-[64px] h-[64px] bg-[#e31837] rounded-full animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] opacity-75"></div>
                        <button
                          onClick={stopRecording}
                          className="relative z-10 w-[64px] h-[64px] bg-gradient-to-b from-[#e31837] to-[#b01229] text-white rounded-full flex items-center justify-center shadow-[0_4px_10px_rgba(227,24,55,0.4)] transition-all duration-300 hover:scale-95 hover:from-[#d11531] hover:to-[#a31126]"
                        >
                          <div className="w-[20px] h-[20px] bg-white rounded-sm shadow-sm" />
                        </button>
                      </div>
                    )}
                    {step === "RECORDED" && isRecorded && (
                      <div className="w-[64px] h-[64px] bg-white border-2 border-[#e31837] text-[#e31837] rounded-full flex items-center justify-center shadow-md">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                    )}
                  </div>

                  {/* Next Button */}
                  <div className="flex items-center justify-end min-w-[90px] gap-3">
                    <button
                      onClick={() => {
                        stopRecording();
                        handleNextBtnClick();
                      }}
                      className="text-[#999] hover:text-[#333] text-[15px] font-medium transition-colors px-2"
                    >
                      Skip
                    </button>
                    <button
                      onClick={handleNextBtnClick}
                      disabled={step !== "RECORDED" || submitting}
                      className={`flex items-center justify-center px-5 py-2 rounded-[8px] text-[15px] font-black transition-all duration-300 ${step === "RECORDED" && !submitting
                        ? 'bg-gradient-to-b from-[#e31837] to-[#b01229] hover:from-[#f01c3d] hover:to-[#c4142e] text-white cursor-pointer shadow-md hover:scale-105 active:scale-95'
                        : 'bg-[#e5e5e5] text-[#999] cursor-not-allowed opacity-50'
                        }`}
                    >
                      Next <span className="ml-1 text-[16px] leading-none">»</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN - Cue Card & Notes */}
              <div className="w-full md:w-[50%] flex flex-col pt-1">

                {/* Cue Card Area */}
                <div className="bg-[#f5f5f5] rounded-[10px] p-6 h-[270px] overflow-y-auto mb-4 custom-scrollbar text-[16px] text-[#222]">
                  {currentQuestionData?.text ? (
                    <div className="whitespace-pre-wrap leading-[1.6]">
                      {currentQuestionData.text}
                    </div>
                  ) : (
                    <div className="text-[#888] italic">No text provided.</div>
                  )}
                </div>

                {/* Notes Area */}
                <div className="flex flex-col flex-1 mt-2">
                  <label className="text-[14px] font-bold text-[#111] mb-2">Note</label>
                  <textarea
                    className="w-full flex-1 min-h-[180px] bg-[#f5f5f5] rounded-[10px] border border-transparent focus:border-[#dcdcdc] focus:bg-white focus:outline-none p-4 text-[14px] resize-none text-[#111] placeholder-[#999]"
                    placeholder="Note here..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <footer className="h-[60px] flex-shrink-0 bg-white border-t border-[#e2e2e2] z-20 flex items-center justify-stretch shadow-[0_-2px_10px_rgba(0,0,0,0.02)] pr-6">

        {/* Parts Tabs */}
        <div className="w-full flex justify-between items-center h-full">
          {parts.map((p, idx) => {
            const isCompleted = activePartIdx > idx;
            const isActive = activePartIdx === idx;
            const isFuture = activePartIdx < idx;

            return (
              <div key={idx} className={`w-full relative flex items-center h-full px-8 cursor-default transition-colors ${isActive ? 'bg-[#fafafa]' : ''}`}>
                <div className={`absolute top-[-1px] left-0 right-0 h-[3px] ${isCompleted ? 'bg-[#319c28]' : (isActive ? 'bg-[#bebebe]' : 'bg-transparent')}`} />

                {isCompleted && (
                  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] mr-2.5 text-[#319c28] fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                )}

                <span className={`text-[15px] ${isFuture ? 'text-[#666] font-medium' : 'text-[#1a1a1a] font-bold'}`}>
                  Part {idx + 1}
                </span>
              </div>
            );
          })}
        </div>
      </footer>
    </div>
  );
}
