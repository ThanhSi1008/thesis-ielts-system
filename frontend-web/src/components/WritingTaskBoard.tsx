"use client";

import { useState, useMemo, useEffect } from "react";

interface WritingTask {
  task_number: number;
  task_type: string;
  time_advice?: string;
  prompt: string;
  instruction?: string;
  image_url?: string;
  min_words: number;
}

interface WritingTaskBoardProps {
  tasks: WritingTask[];
  onAnswersChange?: (ans: { task1: string; task2: string }) => void;
  onSubmit: (answers: { task1: string; task2: string }) => void;
  submitting: boolean;
  secondsLeft: number | null;
  formatTime: (s: number) => string;
  examTitle: string;
  initialAnswers?: { task1?: string; task2?: string };
}

export default function WritingTaskBoard({
  tasks,
  onAnswersChange,
  onSubmit,
  submitting,
  secondsLeft,
  formatTime,
  initialAnswers,
}: WritingTaskBoardProps) {
  const task1 = tasks.find((t) => t.task_number === 1);
  const task2 = tasks.find((t) => t.task_number === 2);

  // Initialize activeTask to the first available task number in the array
  const defaultTask = tasks.length > 0 ? tasks[0].task_number : 1;
  const [activeTask, setActiveTask] = useState(defaultTask);

  const [essay1, setEssay1] = useState(initialAnswers?.task1 || "");
  const [essay2, setEssay2] = useState(initialAnswers?.task2 || "");

  // Sync draft answers when they load asynchronously
  useEffect(() => {
    if (initialAnswers?.task1 && !essay1) {
      setEssay1(initialAnswers.task1);
    }
    if (initialAnswers?.task2 && !essay2) {
      setEssay2(initialAnswers.task2);
    }
  }, [initialAnswers]);

  const wordCount1 = useMemo(
    () => (essay1.trim() ? essay1.trim().split(/\s+/).length : 0),
    [essay1]
  );
  const wordCount2 = useMemo(
    () => (essay2.trim() ? essay2.trim().split(/\s+/).length : 0),
    [essay2]
  );

  const handleSubmit = () => {
    onSubmit({ task1: essay1, task2: essay2 });
  };

  const [leftPaneWidth, setLeftPaneWidth] = useState(50);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (!isResizing) return;
    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = (e.clientX / window.innerWidth) * 100;
      if (newWidth > 20 && newWidth < 80) setLeftPaneWidth(newWidth);
    };
    const handleMouseUp = () => setIsResizing(false);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.userSelect = "none";
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

  const currentTask = activeTask === 1 ? task1 : task2;
  const currentEssay = activeTask === 1 ? essay1 : essay2;
  const setEssay = activeTask === 1 ? setEssay1 : setEssay2;
  const currentWordCount = activeTask === 1 ? wordCount1 : wordCount2;

  // Derive completed checks based on having any text
  const task1Completed = wordCount1 > 0;
  const task2Completed = wordCount2 > 0;

  useEffect(() => {
    if (onAnswersChange) {
      onAnswersChange({ task1: essay1, task2: essay2 });
    }
  }, [essay1, essay2, onAnswersChange]);

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-white overflow-hidden text-[#1a1a1a] font-sans">

      {/* Top Instructions Banner */}
      {currentTask && (
        <div className="bg-[#f1f2ec] border border-[#e2dcd2] rounded-[3px] py-3 px-5 mx-4 mt-3 mb-4 flex-shrink-0 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <div className="font-bold text-[16px] mb-1.5 text-black tracking-wide">Task {activeTask}</div>
            <div className="text-[15px] font-medium text-[#222]">
              You should spend about {currentTask.time_advice || (activeTask === 1 ? '20' : '40')} minutes on this task. Write at least {currentTask.min_words} words.
            </div>
          </div>
          {/* Subtle IELTS CD styling gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#ffffff40] pointer-events-none" />
        </div>
      )}

      {/* Main Split Pane Area */}
      {currentTask && (
        <div className="flex-1 min-h-0 flex flex-row overflow-hidden relative w-full px-6 mb-6">

          {/* Left Pane - Prompt */}
          <div
            style={{ width: `${leftPaneWidth}%` }}
            className="flex-shrink-0 h-full overflow-y-auto pr-6 custom-scrollbar"
          >
            <div className="text-[#1a1a1a] leading-[1.7] text-[15px]">
              {activeTask === 2 && currentTask.instruction && (
                <p
                  className="mb-6"
                  dangerouslySetInnerHTML={{
                    __html: currentTask.instruction
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
                  }}
                />
              )}
              {currentTask.prompt.split("\n\n").map((para, i) => {
                let htmlContent = para.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                htmlContent = htmlContent.replace(/\*([^*]+)\*/g, '<em>$1</em>');
                return (
                  <p
                    key={i}
                    className={`mb-5 ${(activeTask === 2 && i < 2) || (activeTask === 1 && i === 0)
                      ? "font-bold text-[16px]"
                      : ""
                      }`}
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                  />
                );
              })}
              {currentTask.image_url && (
                <div className="mt-8">
                  <img
                    src={currentTask.image_url}
                    alt={`Task ${activeTask} material`}
                    className="max-w-full h-auto object-contain border border-[#dcdcdc] rounded-[2px]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Resizer Handle */}
          <div
            className="w-[3px] border-l border-r border-[#e0e0e0] cursor-col-resize hover:bg-[#d8d8d8] active:bg-[#c0c0c0] flex-shrink-0 z-10 relative flex justify-center items-center group transition-colors mx-2"
            onMouseDown={(e) => { e.preventDefault(); setIsResizing(true); }}
          >
            {/* The little box with arrows in the middle */}
            <div className="absolute w-[24px] h-[24px] bg-white border border-[#888] flex items-center justify-center text-[#555] shadow-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-[14px] h-[14px]">
                <polyline points="9 16 5 12 9 8" />
                <polyline points="15 16 19 12 15 8" />
              </svg>
            </div>
          </div>

          {/* Right Pane - Textarea */}
          <div style={{ flex: 1 }} className="h-full flex flex-col min-w-0 pl-6 pb-12">
            <textarea
              value={currentEssay}
              onChange={(e) => setEssay(e.target.value)}
              className="flex-1 w-full resize-none border border-dark bg-white p-4 text-[16px] leading-[1.7] text-[#1a1a1a] focus:outline-none focus:border-primary transition-colors shadow-inner font-sans rounded-[10px]"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            <div className="flex justify-end pt-2 px-1 text-[13.5px] font-medium text-[#1a1a1a]">
              Words: {currentWordCount}
            </div>
          </div>
        </div>
      )}

      {/* Authentic Footer Ribbon */}
      {tasks.length > 1 && (
        <footer className="h-[52px] flex-shrink-0 flex items-center justify-between z-20 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
          {/* Left Tabs */}
          <div className="flex items-center h-full w-full">
            <button
              onClick={() => setActiveTask(1)}
              className={`px-4 flex-1 flex items-center h-full w-full relative transition-colors ${activeTask === 1 ? 'bg-white font-bold' : 'hover:bg-[#f1f2ec] font-medium text-[#333]'}`}
            >
              {(task1Completed || activeTask === 1) && <div className={`absolute top-[-2px] left-0 w-full h-[3px] ${task1Completed ? 'bg-[#319c28]' : 'bg-[#dcdcdc]'}`} />}
              {task1Completed && <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] text-[#319c28] fill-current mr-2 -ml-1" xmlns="http://www.w3.org/2000/svg"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>}
              <span className="text-[14px] tracking-wide">Task 1</span>
            </button>

            <button
              onClick={() => setActiveTask(2)}
              className={`px-4 flex-1 flex items-center h-full relative transition-colors ${activeTask === 2 ? 'bg-white font-bold' : 'hover:bg-[#f1f2ec] font-medium text-[#333]'}`}
            >
              {(task2Completed || activeTask === 2) && <div className={`absolute top-[-2px] left-0 w-full h-[3px] ${task2Completed ? 'bg-[#319c28]' : 'bg-[#dcdcdc]'}`} />}
              {task2Completed && <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] text-[#319c28] fill-current mr-2 -ml-1" xmlns="http://www.w3.org/2000/svg"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>}
              <span className="text-[14px] tracking-wide">Task 2</span>
            </button>
          </div>
        </footer>
      )}

      {/* Floating Navigation Arrows */}
      {tasks.length > 1 && (
        <div className="absolute bottom-[68px] right-8 flex gap-1 z-30 opacity-90 transition-opacity hover:opacity-100 shadow-md">
          {/* Back Arrow */}
          <button
            onClick={() => setActiveTask(1)}
            disabled={activeTask === 1}
            className="w-[52px] h-[52px] flex items-center justify-center transition-colors border"
            style={{
              backgroundColor: activeTask === 1 ? '#f2f2f2' : '#424242',
              borderColor: activeTask === 1 ? '#d6d6d6' : '#282828',
              cursor: activeTask === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className={`w-[26px] h-[26px] stroke-current stroke-[2.5] fill-none ${activeTask === 1 ? 'text-[#7f7f7f]' : 'text-white'}`}>
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Forward Arrow */}
          <button
            onClick={() => setActiveTask(2)}
            disabled={activeTask === 2}
            className="w-[52px] h-[52px] flex items-center justify-center transition-colors border"
            style={{
              backgroundColor: activeTask === 2 ? '#f2f2f2' : '#333333',
              borderColor: activeTask === 2 ? '#d6d6d6' : '#111111',
              cursor: activeTask === 2 ? 'not-allowed' : 'pointer'
            }}
          >
            <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className={`w-[26px] h-[26px] stroke-current stroke-[2.5] fill-none ${activeTask === 2 ? 'text-[#7f7f7f]' : 'text-white'}`}>
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

    </div>
  );
}
