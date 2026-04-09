"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, Lightbulb, Info } from "lucide-react";

interface QuizQuestion {
  question: string;
  options: string[];
  hint: string;
  answer: string;
  explanation: string;
}

interface ContentBlock {
  type: "overview" | "traps" | "strategy" | "tips" | "section" | "markdown";
  title?: string;
  content: string;
}

interface Lesson {
  id: string;
  skillId: string;
  chapter: string | null;
  title: string;
  content: ContentBlock[];
  quiz: QuizQuestion[];
}

const QuizSection = ({ quiz }: { quiz: QuizQuestion[] }) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!quiz || quiz.length === 0) return null;

  const isFinished = currentQ >= quiz.length;
  if (isFinished) {
    return (
      <div className="mt-12 bg-green-50 rounded-2xl p-8 text-center border border-green-100">
        <h2 className="text-2xl font-bold text-green-900 mb-2">Knowledge Check Completed! 🎉</h2>
        <p className="text-green-700 font-medium">Great job reviewing the key concepts. You are fully prepared to tackle the reading/listening exercises!</p>
      </div>
    );
  }

  const question = quiz[currentQ];

  const checkCorrectness = () => {
    if (!selectedOption) return false;
    const optionLetterMatch = selectedOption.match(/^([A-Z])\)/);
    if (optionLetterMatch && question.answer) {
       return optionLetterMatch[1].toLowerCase() === question.answer.toLowerCase().trim();
    }
    return selectedOption.toLowerCase().includes((question.answer || "").toLowerCase().trim());
  };

  const isCorrect = isSubmitted ? checkCorrectness() : false;

  return (
    <div className="mt-16 bg-white rounded-2xl p-8 border-2 border-gray-100 shadow-sm relative overflow-hidden mb-8">
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100">
        <div 
          className="h-full bg-blue-500 transition-all duration-300 ease-out" 
          style={{ width: `${(currentQ / quiz.length) * 100}%` }}
        />
      </div>
      
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-extrabold text-black">Knowledge Check</h2>
        <span className="text-sm font-bold text-gray-500">Question {currentQ + 1} of {quiz.length}</span>
      </div>

      <p className="text-lg font-bold text-gray-900 mb-6 leading-relaxed">{question.question}</p>

      <div className="space-y-3 mb-8">
        {question.options.map((opt, i) => {
          const isSelected = selectedOption === opt;
          return (
            <button
              key={i}
              onClick={() => !isSubmitted && setSelectedOption(opt)}
              disabled={isSubmitted}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all font-medium ${
                 isSubmitted 
                  ? isSelected 
                      ? isCorrect ? 'border-green-500 bg-green-50 text-green-900' : 'border-red-500 bg-red-50 text-red-900'
                      : 'border-gray-100 bg-gray-50 text-gray-400'
                  : isSelected 
                      ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-sm' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-800'
              }`}
            >
              {opt}
            </button>
          )
        })}
      </div>

      {/* Result Explanation */}
      {isSubmitted && (
         <div className={`p-6 rounded-xl mb-8 border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <h4 className={`font-bold flex items-center gap-2 mb-3 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
               {isCorrect ? '✅ Correct!' : '❌ Incorrect'}
            </h4>
            <div 
              dangerouslySetInnerHTML={{ __html: (question.explanation || "No explanation provided.").replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} 
              className="text-sm text-gray-900 leading-relaxed" 
            />
         </div>
      )}

      {/* Hint Alert */}
      {showHint && !isSubmitted && question.hint && (
        <div className="p-4 bg-yellow-50 text-yellow-900 text-sm rounded-xl mb-8 border border-yellow-200 shadow-inner">
           <strong className="text-yellow-700">💡 Hint:</strong> {question.hint}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        {!isSubmitted ? (
          <>
            {question.hint && !showHint && (
              <button 
                onClick={() => setShowHint(true)}
                className="px-6 py-3 rounded-full font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors focus:outline-none"
              >
                Need a hint?
              </button>
            )}
            <button 
              onClick={() => setIsSubmitted(true)}
              disabled={!selectedOption}
              className="flex-1 px-6 py-3 rounded-full font-bold bg-[#111111] text-[#FFCC00] hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none shadow-md"
            >
              Check Answer
            </button>
          </>
        ) : (
          <button 
            onClick={() => {
              setCurrentQ(q => q + 1);
              setSelectedOption(null);
              setIsSubmitted(false);
              setShowHint(false);
            }}
            className="w-full px-6 py-3 rounded-full font-bold bg-[#FFCC00] text-black hover:bg-[#E6B800] transition-colors focus:outline-none shadow-md"
          >
            {currentQ + 1 === quiz.length ? 'Finish Quiz' : 'Next Question'}
          </button>
        )}
      </div>
    </div>
  );
};

export default function TheoryPage() {
  const { lessonId } = useParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:3000/api/v1/ielts/lessons/${lessonId}`);
        setLesson(res.data);
      } catch (err) {
        console.error("Failed to fetch lesson:", err);
      } finally {
        setLoading(false);
      }
    };
    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId]);

  if (loading) {
    return <div className="p-10 flex justify-center text-gray-500 animate-pulse font-medium">Loading Theory...</div>;
  }

  if (!lesson) {
    return <div className="p-10 text-center text-red-500 font-bold">Lesson not found.</div>;
  }

  const renderContent = (content: string) => {
    const boldedContent = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return <div dangerouslySetInnerHTML={{ __html: boldedContent }} className="space-y-3 whitespace-pre-wrap text-sm leading-relaxed" />;
  };

  return (
    <div className="flex flex-col min-h-screen bg-white relative pb-28">
      {/* Header */}
      <div className="pt-10 pb-6 text-center">
        <h1 className="text-3xl font-extrabold text-black tracking-tight">
          {lesson.title}
        </h1>
      </div>

      {/* Content Blocks */}
      <div className="flex-1 overflow-y-auto px-8 lg:px-12 mx-auto max-w-5xl space-y-6 w-full text-black">
        {Array.isArray(lesson.content) ? lesson.content.map((block, idx) => {
          if (block.type === 'traps') {
            return (
              <div key={idx} className="bg-[#FFF0F0] rounded-xl p-6 my-6 border border-[#FFE1E1]">
                <div className="flex items-center gap-2 mb-3 text-red-500">
                  <AlertCircle className="w-5 h-5 fill-red-100" />
                  <h3 className="font-bold text-sm text-black">{block.title || "The Common Traps"}</h3>
                </div>
                <div>{renderContent(block.content)}</div>
              </div>
            );
          } else if (block.type === 'strategy') {
            return (
              <div key={idx} className="bg-[#FFF9E6] rounded-xl p-6 my-6 border border-[#FFF0C2]">
                <div className="flex items-center gap-2 mb-3 text-[#E0A800]">
                  <Lightbulb className="w-5 h-5 fill-[#FFF0C2]" />
                  <h3 className="font-bold text-sm text-black">{block.title || "The Step-by-Step Strategy"}</h3>
                </div>
                <div>{renderContent(block.content)}</div>
              </div>
            );
          } else if (block.type === 'tips') {
            return (
              <div key={idx} className="bg-[#F0F7FF] rounded-xl p-6 my-6 border border-[#DCEBFF]">
                <div className="flex items-center gap-2 mb-3 text-[#3B82F6]">
                  <Info className="w-5 h-5 fill-[#DCEBFF]" />
                  <h3 className="font-bold text-sm text-black">{block.title || "Pro-Tips for Test Day"}</h3>
                </div>
                <div>{renderContent(block.content)}</div>
              </div>
            );
          } else {
            return (
              <div key={idx} className="prose prose-gray max-w-none text-black">
                {renderContent(block.content)}
              </div>
            );
          }
        }) : (
          <div className="prose max-w-none text-black">{renderContent(JSON.stringify(lesson.content))}</div>
        )}

        {/* --- DYNAMIC QUIZ SECTION --- */}
        <QuizSection quiz={lesson.quiz} />
      </div>
    </div>
  );
}
