"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";

// Types matching the backend schema and JSON structure
interface TranscriptLine {
  speaker: string;
  text: string;
  timestampStart?: number;
  timestampEnd?: number;
}

interface QuestionBlock {
  type: string; // "multiple_choice", "note_completion", etc.
  questions: unknown[]; 
}

interface Exercise {
  id: string;
  topic: string;
  audioUrl?: string;
  transcript?: TranscriptLine[];
  content: QuestionBlock[];
}

export default function ExercisePage() {
  const { exerciseId } = useParams();
  const router = useRouter();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    const fetchExercise = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:3000/api/v1/ielts/exercises/${exerciseId}`);
        setExercise(res.data);
      } catch (err) {
        console.error("Failed to fetch exercise:", err);
      } finally {
        setLoading(false);
      }
    };
    if (exerciseId) fetchExercise();
  }, [exerciseId]);

  if (loading) {
    return <div className="p-10 flex justify-center text-gray-500 animate-pulse font-medium">Loading Exercise...</div>;
  }

  if (!exercise) {
    return <div className="p-10 text-center text-red-500 font-bold">Exercise not found.</div>;
  }

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Top Bar with Audio & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-4">
        <div>
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-900 mb-2 inline-flex items-center gap-2 font-semibold transition-colors text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">{exercise.topic}</h1>
        </div>
        
        {exercise.audioUrl && (
          <div className="flex-shrink-0 bg-gray-50 rounded-full px-4 py-2 border border-gray-200">
             <audio controls className="h-10 outline-none w-64 md:w-80" controlsList="nodownload">
               <source src={exercise.audioUrl} type="audio/mpeg" />
               Your browser does not support the audio element.
             </audio>
          </div>
        )}
      </div>

      {/* Main Content Area (Split layout for Transcript) */}
      <div className="flex gap-6 flex-1 overflow-hidden">
        
        {/* Left Side: Questions */}
        <div className={`flex-1 overflow-y-auto pr-2 pb-20 transition-all ${showTranscript ? 'md:w-1/2' : 'w-full'}`}>
          
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Questions</h2>
            {!showTranscript && exercise.transcript && (
              <button 
                onClick={() => setShowTranscript(true)}
                className="text-sm font-bold text-[#FFC107] hover:text-[#E0A800] bg-[#FFFBEA] px-3 py-1 rounded-lg transition-colors border border-[#FFC107]/20"
              >
                View Transcript
              </button>
            )}
          </div>

          <div className="space-y-8">
            {Array.isArray(exercise.content) ? exercise.content.map((block, idx) => (
              <div key={idx} className="bg-[#F8F9FB] rounded-xl p-5 border border-gray-100">
                 <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-4 border-b border-gray-200 pb-2">
                   {block.type.replace(/_/g, ' ')}
                 </h3>
                 <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                   {JSON.stringify(block.questions, null, 2)}
                 </pre>
                 {/* In a real implementation we would switch on block.type to render nice UI components like MultipleChoice, NoteCompletion, etc. */}
              </div>
            )) : (
              <p className="text-gray-500">No questions found</p>
            )}
          </div>
        </div>

        {/* Right Side: Transcript (Toggleable) */}
        {showTranscript && exercise.transcript && (
          <div className="w-full md:w-1/2 border-l border-gray-100 pl-6 overflow-y-auto pb-20 relative">
            <div className="sticky top-0 bg-white pt-1 pb-3 mb-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">Audio Transcript</h2>
              <button 
                onClick={() => setShowTranscript(false)}
                className="text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 p-1.5 rounded-full transition-colors"
                title="Close Transcript"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4 text-[15px] leading-relaxed text-gray-700">
              {Array.isArray(exercise.transcript) ? exercise.transcript.map((line, idx) => (
                <div key={idx} className="flex gap-3">
                  {line.speaker && (
                    <span className="font-bold text-gray-900 shrink-0 min-w-[3rem]">{line.speaker}:</span>
                  )}
                  <p>{line.text}</p>
                </div>
              )) : (
                <p className="text-gray-500 italic">Static transcript text loaded...</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 pt-4 pb-2 flex justify-between items-center">
        <div className="text-sm font-medium text-gray-400">
           Review your answers before submitting
        </div>
        <button 
          className="bg-[#212121] text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-black transition-colors"
          onClick={() => alert("Submit action goes here")}
        >
          Submit Answers
        </button>
      </div>

    </div>
  );
}
