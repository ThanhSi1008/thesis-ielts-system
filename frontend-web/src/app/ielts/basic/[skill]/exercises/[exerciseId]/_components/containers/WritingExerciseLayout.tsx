"use client";

import { useState } from "react";

export function WritingExerciseLayout({
    exercise,
    onComplete,
    onNext,
}: {
    exercise: any;
    onComplete?: () => void;
    onNext?: () => void;
}) {
    const [showAnswer, setShowAnswer] = useState(false);
    const [answers, setAnswers] = useState({
        intro: "",
        overview: "",
        body1: "",
        body2: "",
    });

    const handleShowAnswer = () => {
        setShowAnswer(true);
        if (onComplete) onComplete(); // Mark as completed
    };

    const handleTryAgain = () => {
        setShowAnswer(false);
        setAnswers({ intro: "", overview: "", body1: "", body2: "" });
    };

    // Safe destructuring of modelAnswer
    const modelAnswer = exercise?.modelAnswer || {};

    return (
        <div className="flex h-full w-full flex-col bg-white overflow-hidden rounded-xl">
            {/* Header */}
            <div className="flex flex-col p-8 pb-4">
                <span className="text-sm font-medium text-gray-400">Exercise 1</span>
                <h1 className="text-3xl font-bold text-gray-900 mt-1">{exercise?.topic || "Writing Task 1"}</h1>
            </div>

            {/* Main Two-Pane Split */}
            <div className="flex flex-1 overflow-hidden px-8 pb-8">
                {/* Left Pane: Prompt and Image */}
                <div className="w-1/2 overflow-y-auto pr-8">
                    <p className="font-bold text-gray-900 leading-relaxed text-[15px] max-w-xl">
                        {exercise?.prompt}
                    </p>

                    {exercise?.diagramUrl && (
                        <div className="mt-8 border border-gray-200 p-2">
                            <img
                                src={exercise.diagramUrl}
                                alt="Diagram"
                                className="w-full h-auto object-contain"
                            />
                        </div>
                    )}
                </div>

                {/* Vertical Divider */}
                <div className="w-px bg-gray-300 my-2 mx-4" />

                {/* Right Pane: Inputs and Feedback */}
                <div className="w-1/2 overflow-y-auto pl-6 pr-2 pb-24 relative flex flex-col space-y-6">
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

                    {/* Action Buttons */}
                    <div className="absolute bottom-0 right-4 pt-4 pb-4 bg-white bg-opacity-90 flex gap-4 w-full justify-end">
                        {!showAnswer ? (
                            <button
                                onClick={handleShowAnswer}
                                className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-full transition-colors"
                            >
                                Show Answer
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleTryAgain}
                                    className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-full transition-colors"
                                >
                                    Try again
                                </button>
                                <button
                                    onClick={onNext}
                                    className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-full transition-colors"
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
    return (
        <div className="flex flex-col">
            <h3 className="flex items-center text-[15px] font-semibold text-gray-800 mb-2">
                {showAnswer ? (
                    <span className="mr-2 text-xs">▼</span>
                ) : null}
                {title}
            </h3>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder=""
                readOnly={showAnswer}
                className={`w-full p-4 text-[14px] leading-relaxed rounded-xl border border-gray-300 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${showAnswer ? "bg-white text-gray-800" : "bg-white text-gray-800 hover:border-gray-400"
                    }`}
            />
            {showAnswer && modelText && (
                <div className="mt-3 text-[#4caf50] text-[14px] leading-relaxed whitespace-pre-wrap px-2">
                    {modelText}
                </div>
            )}
        </div>
    );
}
