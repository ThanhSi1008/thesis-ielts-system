"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface SpeakingDeviceTestProps {
  onComplete: () => void;
  examId?: string;
}

export default function SpeakingDeviceTest({ onComplete, examId }: SpeakingDeviceTestProps) {
  const router = useRouter();

  // Headphone Test State
  const [hasCompletedStep1, setHasCompletedStep1] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0); // 0 to 100
  const audioIntervalRef = useRef<number | null>(null);
  const testAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    testAudioRef.current = new Audio("https://res.cloudinary.com/dalaaegob/video/upload/v1774555714/changthevolume_cqpnwp.mp3");
    testAudioRef.current.onended = () => {
      setIsPlayingAudio(false);
      setAudioProgress(100);
      setHasCompletedStep1(true);
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
    return () => {
      if (testAudioRef.current) {
        testAudioRef.current.pause();
        testAudioRef.current.src = "";
      }
    };
  }, []);

  // Microphone Test State
  const [hasCompletedStep2, setHasCompletedStep2] = useState(false);
  const [micState, setMicState] = useState<"IDLE" | "RECORDING" | "RECORDED" | "PLAYING">("IDLE");
  const [recordTime, setRecordTime] = useState(0);
  const [recordedProgress, setRecordedProgress] = useState(0);
  const recordedIntervalRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordedAudioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      if (recordedIntervalRef.current) clearInterval(recordedIntervalRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handlePlayHeadphoneAudio = () => {
    if (isPlayingAudio || !testAudioRef.current) return;
    setIsPlayingAudio(true);
    setAudioProgress(0);
    testAudioRef.current.currentTime = 0;
    testAudioRef.current.play().catch(console.error);

    audioIntervalRef.current = window.setInterval(() => {
      if (testAudioRef.current && testAudioRef.current.duration) {
        setAudioProgress((testAudioRef.current.currentTime / testAudioRef.current.duration) * 100);
      }
    }, 50);
  };

  const handleMicAction = async () => {
    if (micState === "IDLE") {
      // Start Recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          const url = URL.createObjectURL(blob);
          if (!recordedAudioRef.current) {
            recordedAudioRef.current = new Audio(url);
          } else {
            recordedAudioRef.current.src = url;
          }
          recordedAudioRef.current.onended = () => {
            setMicState("RECORDED");
            setRecordedProgress(100);
            setHasCompletedStep2(true);
            if (recordedIntervalRef.current) clearInterval(recordedIntervalRef.current);
          };
          setMicState("RECORDED");
        };

        mediaRecorderRef.current.start();
        setMicState("RECORDING");
        setRecordTime(0);
        setRecordedProgress(0);

        timerRef.current = window.setInterval(() => {
          setRecordTime((prev) => {
            if (prev >= 10) {
              // Auto stop after 10s
              handleMicAction();
              return prev;
            }
            return prev + 1;
          });
        }, 1000);
      } catch (err) {
        console.error("Mic access denied", err);
        alert("Microphone access is required to complete the test.");
      }
    } else if (micState === "RECORDING") {
      // Stop Recording
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      }
    } else if (micState === "RECORDED") {
      // Play back
      if (recordedAudioRef.current) {
        setRecordedProgress(0);
        recordedAudioRef.current.play();
        setMicState("PLAYING");
        recordedIntervalRef.current = window.setInterval(() => {
          if (recordedAudioRef.current && recordedAudioRef.current.duration) {
            setRecordedProgress((recordedAudioRef.current.currentTime / recordedAudioRef.current.duration) * 100);
          }
        }, 50);
      }
    } else if (micState === "PLAYING") {
      // Stop playback
      if (recordedAudioRef.current) {
        recordedAudioRef.current.pause();
        recordedAudioRef.current.currentTime = 0;
        setMicState("RECORDED");
        setRecordedProgress(0);
        if (recordedIntervalRef.current) clearInterval(recordedIntervalRef.current);
      }
    }
  };

  const handleRerecord = () => {
    if (micState === "PLAYING" && recordedAudioRef.current) {
      recordedAudioRef.current.pause();
      recordedAudioRef.current.currentTime = 0;
      if (recordedIntervalRef.current) clearInterval(recordedIntervalRef.current);
    }
    setMicState("IDLE");
    setRecordTime(0);
    setRecordedProgress(0);
    setHasCompletedStep2(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleExit = () => {
    if (examId) {
      router.push(`/ielts/intensive/${encodeURIComponent(examId)}`);
    } else {
      router.push("/ielts/intensive");
    }
  };

  return (
    <div className="h-screen flex flex-col font-sans bg-[#f7f8fa] overflow-y-auto w-full text-[#1a1a1a]">
      {/* Lexen-style Top Header */}
      <header className="h-[64px] flex-shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-20 shadow-sm">
        <div className="flex items-center">
          {/* Logo */}
          <div className="text-3xl font-extrabold tracking-tighter text-[#D51025]">IELTS</div>
        </div>
        <div>
          <button
            onClick={handleExit}
            className="px-6 py-2 border border-[#dcdcdc] rounded-[6px] text-[14px] font-bold text-[#555] hover:bg-gray-50 hover:text-black transition-colors"
          >
            Exit Test
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center py-10 px-4 w-full">
        <div className="bg-white rounded-[12px] shadow-[0_2px_16px_rgba(0,0,0,0.04)] border border-[#eeeeee] w-full max-w-[900px] p-10 px-12 relative flex flex-col">

          <div className="text-center mb-10">
            <h1 className="text-[22px] font-bold text-[#1a1a1a] mb-1">Device Test</h1>
            <p className="text-[15px] text-[#666]">Test if your recording device working</p>
          </div>

          <div className="relative flex flex-col gap-10">
            {/* Vertical Line */}
            <div className="absolute left-[23px] top-[30px] bottom-[40px] w-[2px] bg-[#f0f0f0] z-0" />

            {/* 1. Headphone Check */}
            <div className="flex gap-6 relative z-10 w-full">
              <div className="w-[48px] h-[48px] flex-shrink-0 bg-white border-[2px] border-[#D51025] rounded-full flex items-center justify-center relative mt-1">
                {/* Headphone SVG */}
                <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] text-[#D51025] fill-none stroke-current stroke-[2.5]" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                  <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                </svg>
              </div>
              <div className="flex flex-col flex-1 pb-4">
                <h3 className="text-[16px] font-bold text-[#1a1a1a] mb-2">1. Headphone check</h3>
                <p className="text-[14.5px] text-[#555] mb-5">
                  Make sure your headphone's audio is good enough before taking the test. Please click on the play icon to check the sound quality.
                </p>

                {/* Audio block */}
                <div className="bg-[#f8f9fa] rounded-[8px] h-[54px] w-full flex items-center px-4 relative overflow-hidden">
                  <button
                    onClick={handlePlayHeadphoneAudio}
                    className="w-[28px] h-[28px] flex items-center justify-center mr-3 hover:scale-105 transition-transform"
                  >
                    {isPlayingAudio ? (
                      <div className="w-4 h-4 bg-[#D51025] rounded-sm" />
                    ) : (
                      <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#D51025] fill-current">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>
                  <span className="text-[14px] font-medium text-[#444] min-w-[44px]">
                    00:04
                  </span>

                  {/* Fake Audio Waveform */}
                  <div className="flex-1 ml-4 h-[24px] flex items-center relative">
                    <div className="absolute inset-0 flex items-center justify-between gap-[2px]">
                      {Array.from({ length: 80 }).map((_, i) => {
                        // Create a random-looking static wave pattern
                        const h = 4 + Math.abs(Math.sin(i * 0.3) * 16) + Math.abs(Math.cos(i * 0.8) * 8);
                        return (
                          <div
                            key={i}
                            style={{ height: `${Math.min(24, h)}px` }}
                            className="bg-[#dcdcdc] w-[3px] rounded-full"
                          />
                        );
                      })}
                    </div>
                    {/* Progress overlay */}
                    {audioProgress > 0 && (
                      <div
                        className="absolute left-0 top-0 bottom-0 bg-[#e3e5ed]/60 mix-blend-overlay border-r-2 border-[#D51025] transition-all duration-[50ms]"
                        style={{ width: `${audioProgress}%` }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Microphone Check */}
            <div className={`flex gap-6 relative z-10 w-full pt-2 transition-opacity duration-500 ${!hasCompletedStep1 ? "opacity-30 pointer-events-none select-none" : "opacity-100"}`}>
              <div className={`w-[48px] h-[48px] flex-shrink-0 bg-white border-[2px] rounded-full flex items-center justify-center relative mt-1 transition-colors duration-500 ${hasCompletedStep1 ? "border-[#D51025]" : "border-[#dfdfdf]"}`}>
                {/* Mic SVG */}
                <svg viewBox="0 0 24 24" className={`w-[20px] h-[20px] fill-none stroke-current stroke-[2.5] transition-colors duration-500 ${hasCompletedStep1 ? "text-[#D51025]" : "text-[#999]"}`} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
                </svg>
              </div>
              <div className="flex flex-col flex-1 pb-4">
                <h3 className={`text-[16px] font-bold mb-2 transition-colors duration-500 ${hasCompletedStep1 ? "text-[#1a1a1a]" : "text-[#999]"}`}>2. Microphone check</h3>
                <p className="text-[14.5px] text-[#888] mb-5">
                  Make sure your microphone works well before taking the test. Record audio and play to go next
                </p>

                <div className="w-full border border-[#ebebeb] border-dashed rounded-[10px] p-6 flex flex-col items-center">
                  <div className="text-[14.5px] text-[#555] font-medium mb-2">Please read out loud:</div>
                  <div className="text-[15px] italic text-[#777] font-medium mb-6">"I love English. My English is great and I practice it everyday!"</div>

                  <div className="w-full bg-[#f8f9fa] rounded-[8px] h-[64px] flex items-center px-5">
                    <button
                      onClick={handleMicAction}
                      className="h-[36px] px-4 rounded-[18px] bg-[#D51025] hover:bg-[#b01229] text-white text-[13px] font-bold flex items-center gap-2 transition-colors mr-3"
                    >
                      <span className="tracking-wide">
                        {micState === "IDLE" ? "REC" : micState === "RECORDING" ? "STOP" : micState === "PLAYING" ? "STOP PLAYING" : "PLAY"}
                      </span>
                      {micState === "IDLE" && (
                        <div className="w-[12px] h-[12px] border-[2px] border-white rounded-full bg-transparent flex items-center justify-center">
                          <div className="w-[4px] h-[4px] bg-white rounded-full" />
                        </div>
                      )}
                      {micState === "RECORDED" && (
                        <svg viewBox="0 0 24 24" className="w-[14px] h-[14px] fill-current text-white">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                      {(micState === "RECORDING" || micState === "PLAYING") && (
                        <div className="w-[10px] h-[10px] bg-white rounded-sm" />
                      )}
                    </button>

                    <button
                      onClick={handleRerecord}
                      disabled={micState === "IDLE" || micState === "RECORDING"}
                      className="w-[36px] h-[36px] bg-white border border-[#e5e5e5] rounded-[10px] flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 transition-colors mr-6"
                    >
                      <svg viewBox="0 0 24 24" className="w-[16px] h-[16px] text-[#888] fill-none stroke-current stroke-[2.5]" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="1 4 1 10 7 10"></polyline>
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                      </svg>
                    </button>

                    <span className="text-[14px] font-bold text-[#666] min-w-[44px]">
                      {formatTime(recordTime)}
                    </span>

                    <div className="flex-1 ml-6 h-[24px] flex items-center relative">
                      <div className={`absolute inset-0 flex items-center justify-between gap-[2px] transition-opacity duration-300 ${(micState === "RECORDED" || micState === "PLAYING") ? "opacity-100" : "opacity-40"}`}>
                        {Array.from({ length: 60 }).map((_, i) => {
                          const h = 4 + Math.abs(Math.sin(i * 0.4) * 20) + Math.abs(Math.cos(i * 0.7) * 10);
                          return (
                            <div
                              key={i}
                              style={{ height: `${Math.min(24, h)}px` }}
                              className="bg-[#dcdcdc] w-[3px] rounded-full"
                            />
                          );
                        })}
                      </div>
                      {(micState === "PLAYING" && recordedProgress > 0) && (
                        <div
                          className="absolute left-0 top-0 bottom-0 bg-[#e3e5ed]/60 mix-blend-overlay border-r-2 border-[#D51025] transition-all duration-[50ms]"
                          style={{ width: `${recordedProgress}%` }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Waiting Room */}
            <div className={`flex gap-6 relative z-10 w-full pt-4 transition-opacity duration-500 ${!hasCompletedStep2 ? "opacity-30 pointer-events-none select-none" : "opacity-100"}`}>
              <div className={`w-[48px] h-[48px] flex-shrink-0 bg-white border-[2px] rounded-full flex items-center justify-center relative mt-1 transition-colors duration-500 ${hasCompletedStep2 ? "border-[#D51025]" : "border-[#dfdfdf]"}`}>
                {/* Loader SVG */}
                <svg viewBox="0 0 24 24" className={`w-[22px] h-[22px] fill-none stroke-current stroke-[2.5] transition-colors duration-500 ${hasCompletedStep2 ? "text-[#D51025]" : "text-[#999]"}`} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="2" x2="12" y2="6" />
                  <line x1="12" y1="18" x2="12" y2="22" />
                  <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
                  <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                  <line x1="2" y1="12" x2="6" y2="12" />
                  <line x1="18" y1="12" x2="22" y2="12" />
                  <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
                  <line x1="16.24" y1="4.93" x2="19.07" y2="7.76" />
                </svg>
              </div>
              <div className="flex flex-col flex-1 pb-4">
                <h3 className={`text-[16px] font-bold mb-2 transition-colors duration-500 ${hasCompletedStep2 ? "text-[#1a1a1a]" : "text-[#999]"}`}>3. Waiting room</h3>
                <p className="text-[14.5px] text-[#888] mb-8">
                  You are in the waiting room now. The examiner will enter the meeting soon. Please wait for a while.
                </p>

                <div className="w-full flex justify-center pb-2">
                  <button
                    onClick={onComplete}
                    className="h-[44px] px-8 rounded-[6px] bg-[#D51025] hover:bg-[#b01229] text-white text-[14px] font-bold tracking-wide uppercase transition-colors flex items-center gap-2"
                  >
                    I'M READY
                    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-none stroke-current stroke-[2.5]" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
