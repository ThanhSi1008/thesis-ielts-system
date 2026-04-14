"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { ChevronRight, ChevronDown, FileCheck, Save } from "lucide-react";
import { LessonBlock } from "../utils/SharedExerciseTypes";
import { TheoryPopup } from "../ui/TheoryModal";
import { authService } from "@/services/auth.service";
import { toast } from "@/components/Toaster";
import api from "@/lib/api";

export function WritingExerciseLayout({
    exercise,
    lessonBlocks = [],
    onComplete,
    onNext,
}: {
    exercise: any;
    lessonBlocks?: LessonBlock[];
    onComplete?: () => void;
    onNext?: () => void;
}) {
    const [showAnswer, setShowAnswer] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [answers, setAnswers] = useState({
        intro: "",
        overview: "",
        body1: "",
        body2: "",
    });

    useEffect(() => {
        const fetchSavedAnswers = async () => {
            if (!exercise?.id) return;
            try {
                const token = authService.getToken();
                const res = await axios.get(`http://localhost:3000/api/v1/ielts/writing-exercises/${exercise.id}/my-answer`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data) {
                    setAnswers({
                        intro: res.data.intro || "",
                        overview: res.data.overview || "",
                        body1: res.data.body1 || "",
                        body2: res.data.body2 || "",
                    });
                }
            } catch (err) {
                console.error("Failed to load saved answers:", err);
            }
        };
        fetchSavedAnswers();
    }, [exercise?.id]);

    const handleSaveProgress = async () => {
        if (!exercise?.id) return;
        setIsSaving(true);
        try {
            const token = authService.getToken();
            await axios.post(`http://localhost:3000/api/v1/ielts/writing-exercises/${exercise.id}/save-answer`, answers, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await api.post("/ielts/progress/mark-completed", { writingExerciseId: exercise.id });
            toast.success("Progress saved successfully!");
            if (onComplete) onComplete();
        } catch (err) {
            console.error("Failed to save progress:", err);
            toast.error("Failed to save tracking progress");
        } finally {
            setIsSaving(false);
        }
    };

    const handleShowAnswer = async () => {
        setShowAnswer(true);
        try {
            if (exercise?.id) {
                await api.post("/ielts/progress/mark-completed", { writingExerciseId: exercise.id });
            }
            if (onComplete) onComplete(); // Mark as completed
        } catch (err) {
            console.error("Failed to mark completed", err);
        }
    };

    const handleTryAgain = () => {
        setShowAnswer(false);
        // Do not erase user doing
    };

    const [activeModal, setActiveModal] = useState<"traps" | "strategy" | "tips" | null>(null);

    // Safe destructuring of modelAnswer
    const modelAnswer = exercise?.modelAnswer || {};

    const modalBlock = activeModal ? lessonBlocks.find((b) => b.type === activeModal) ?? { type: activeModal, content: "_No content available._" } : null;

    return (
        <div
            className="flex w-full flex-col bg-white overflow-hidden rounded-xl border border-gray-100 shadow-sm h-[90vh]"
        >
            {/* Header */}
            <div className="flex px-8 py-5 flex-none items-start justify-between border-b border-gray-100">
                <div className="flex flex-col">
                    {(() => {
                        const topicRaw = exercise?.topic || "Writing Task 1";
                        const hasSeparator = topicRaw.includes(" - ");
                        const category = hasSeparator ? topicRaw.split(" - ")[0] : "IELTS Writing";
                        const subTopic = hasSeparator ? topicRaw.split(" - ").slice(1).join(" - ") : topicRaw;

                        return (
                            <>
                                <span className="text-[13px] font-medium text-gray-400 tracking-wide">{category}</span>
                                <h1 className="text-2xl font-extrabold text-slate-800 mt-0.5 tracking-tight">{subTopic}</h1>
                            </>
                        );
                    })()}
                </div>

                {/* Theory Buttons */}
                <div className="relative flex items-center gap-3">
                    <button onClick={() => setActiveModal(activeModal === "traps" ? null : "traps")} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeModal === "traps" ? "bg-red-200" : "bg-red-50 hover:bg-red-100"}`} title="Task Achievement">
                        <FileCheck className="w-5 h-5 text-red-500" />
                    </button>
                    <button onClick={() => setActiveModal(activeModal === "strategy" ? null : "strategy")} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeModal === "strategy" ? "bg-yellow-200" : "bg-yellow-50 hover:bg-yellow-100"}`} title="Grammar & Cohesion">
                        <span className="font-bold text-yellow-600 text-[13px] flex items-center">Aa<span className="text-[10px] ml-0.5">✓</span></span>
                    </button>
                    <button onClick={() => setActiveModal(activeModal === "tips" ? null : "tips")} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeModal === "tips" ? "bg-blue-200" : "bg-blue-50 hover:bg-blue-100"}`} title="Lexical Resource">
                        <span className="font-serif text-xl font-bold text-blue-500 tracking-tighter">V</span>
                    </button>
                    {modalBlock && <TheoryPopup block={modalBlock as LessonBlock} onClose={() => setActiveModal(null)} />}
                </div>
            </div>

            {/* Main Two-Pane Split */}
            <div className="flex flex-1 overflow-hidden px-6 py-6">
                {/* Left Pane: Prompt and Image */}
                <div className="w-[45%] overflow-y-auto pl-2 pr-6">
                    <div className="text-[14.5px] font-semibold text-slate-800 leading-snug max-w-[95%]">
                        {exercise?.prompt}
                    </div>

                    {exercise?.diagramUrl && (
                        <div className="mt-6 rounded-lg p-2 shadow-sm bg-white">
                            <img
                                src={exercise.diagramUrl}
                                alt="Diagram"
                                className="w-full h-auto object-contain rounded"
                            />
                        </div>
                    )}
                </div>

                {/* Vertical Divider */}
                <div className="w-px bg-gray-100 mx-2 flex-none" />

                {/* Right Pane Container */}
                <div className="flex-1 flex flex-col h-full pl-6 pr-2">
                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto px-1 pr-4 pb-4 flex flex-col space-y-5 pt-1">
                        <Section
                            title="Introduction"
                            value={answers.intro}
                            onChange={(v) => setAnswers((prev) => ({ ...prev, intro: v }))}
                            showAnswer={showAnswer}
                            modelText={modelAnswer.intro}
                        />
                        <Section
                            title="Overview"
                            value={answers.overview}
                            onChange={(v) => setAnswers((prev) => ({ ...prev, overview: v }))}
                            showAnswer={showAnswer}
                            modelText={modelAnswer.overview}
                        />
                        <Section
                            title="Body 1"
                            value={answers.body1}
                            onChange={(v) => setAnswers((prev) => ({ ...prev, body1: v }))}
                            showAnswer={showAnswer}
                            modelText={modelAnswer.body1}
                        />
                        <Section
                            title="Body 2"
                            value={answers.body2}
                            onChange={(v) => setAnswers((prev) => ({ ...prev, body2: v }))}
                            showAnswer={showAnswer}
                            modelText={modelAnswer.body2}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 pb-1 bg-white flex gap-3 w-full justify-end flex-none pr-2">
                        {!showAnswer ? (
                            <>
                                <button
                                    onClick={handleSaveProgress}
                                    disabled={isSaving}
                                    className="px-5 py-2 flex items-center justify-center gap-2 text-[14px] bg-sky-50 text-sky-600 hover:bg-sky-100 font-bold rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-sky-100 focus:ring-offset-2 disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    {isSaving ? "Saving..." : "Save Progress"}
                                </button>
                                <button
                                    onClick={handleShowAnswer}
                                    className="px-5 py-2 text-[14px] bg-[#FFC107] hover:bg-[#FFB300] text-black font-bold rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[#FFC107] focus:ring-offset-2"
                                >
                                    Show Answer
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={handleTryAgain}
                                    className="px-5 py-2 text-[14px] bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2"
                                >
                                    Try again
                                </button>
                                <button
                                    onClick={onNext}
                                    className="px-6 py-2 text-[14px] bg-[#FFC107] hover:bg-[#FFB300] text-black font-bold rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[#FFC107] focus:ring-offset-2"
                                >
                                    Next
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Section({
    title,
    value,
    onChange,
    showAnswer,
    modelText,
}: {
    title: string;
    value: string;
    onChange: (v: string) => void;
    showAnswer: boolean;
    modelText?: string;
}) {
    const [isOpen, setIsOpen] = useState(true);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };

    useEffect(() => {
        if (isOpen) {
            adjustHeight();
        }
    }, [value, isOpen]);

    return (
        <div className="flex flex-col">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center text-[13.5px] font-bold text-slate-800 mb-1.5 focus:outline-none group w-fit"
            >
                <span className={`mr-2 flex items-center justify-center transition-transform duration-200 ${isOpen ? "rotate-0" : "-rotate-90"}`}>
                    <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                </span>
                {title}
            </button>

            {isOpen && (
                <div className="flex flex-col space-y-2.5 animate-in fade-in duration-300">
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => {
                            onChange(e.target.value);
                            adjustHeight();
                        }}
                        placeholder={showAnswer ? "" : "Write your answer here..."}
                        readOnly={showAnswer}
                        className={`w-full p-3 text-[14px] leading-relaxed rounded-lg border overflow-hidden resize-none focus:outline-none transition-all ${showAnswer
                            ? "bg-gray-50 border-gray-100 text-slate-600 cursor-default"
                            : "bg-white border-gray-200 text-slate-800 hover:border-gray-300 focus:border-[#4caf50] focus:ring-1 focus:ring-[#4caf50]"
                            }`}
                        style={{ minHeight: "85px" }}
                    />
                    {showAnswer && modelText && (
                        <div className="text-[#2e7d32] bg-[#f1f8e9] border border-[#c8e6c9] rounded-lg p-3 text-[14px] font-medium leading-relaxed">
                            {modelText}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
