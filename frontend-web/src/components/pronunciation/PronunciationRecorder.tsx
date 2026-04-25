import React, { useState, useRef, useEffect } from 'react';
import { learningApi } from '@/services/learning.api';

interface PronunciationRecorderProps {
  vocabularyId?: string;
  userId: string;
  targetWord: string;
  onSuccess?: (score: number) => void;
}

export const PronunciationRecorder: React.FC<PronunciationRecorderProps> = ({
  vocabularyId,
  userId,
  targetWord,
  onSuccess,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        submitAudio(blob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setError(null);
      setResult(null);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Stop all tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const submitAudio = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      const file = new File([blob], 'recording.webm', { type: 'audio/webm' });
      const response = await learningApi.checkPronunciation(file, userId, { vocabularyId, targetWord }) as { attemptId: string };
      
      // Start polling for result
      pollResult(response.attemptId);
    } catch (err) {
      console.error('Error submitting audio:', err);
      setError('Failed to submit audio. Please try again.');
      setIsProcessing(false);
    }
  };

  const pollResult = async (attemptId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const attempts = await learningApi.getUserPronunciationAttempts(userId) as any[];
        const attempt = attempts.find((a: any) => a.id === attemptId);

        if (attempt && attempt.status === 'COMPLETED') {
          clearInterval(pollInterval);
          setResult(attempt);
          setIsProcessing(false);
          if (onSuccess && attempt.score) {
            onSuccess(attempt.score);
          }
        } else if (attempt && attempt.status === 'FAILED') {
          clearInterval(pollInterval);
          setError('Analysis failed. Please try again.');
          setIsProcessing(false);
        }
        // If PENDING or PROCESSING, continue polling
      } catch (err) {
        console.error('Polling error:', err);
        // Don't stop polling on transient network errors
      }
    }, 2000);

    // Timeout after 30 seconds
    setTimeout(() => {
      clearInterval(pollInterval);
      if (isProcessing) {
         setIsProcessing(false);
         setError('Analysis timed out.');
      }
    }, 30000);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 border rounded-lg bg-gray-50 shadow-sm">
      <h3 className="font-bold text-gray-700">Practice Pronunciation</h3>
      
      <div className="text-sm text-gray-500 mb-2">
        Say: <span className="font-bold text-black text-lg">{targetWord}</span>
      </div>

      {error && (
        <div className="text-red-500 text-sm bg-red-50 p-2 rounded w-full text-center">
          {error}
        </div>
      )}

      {result ? (
        <div className="flex flex-col items-center gap-3 w-full animate-in fade-in zoom-in">
          {/* Overall Score */}
          <div className="flex flex-col items-center">
            <div className={`text-4xl font-bold ${result.score >= 80 ? 'text-green-500' : result.score >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
              {result.score}/100
            </div>
            <p className="text-sm font-semibold text-gray-700 mt-1">{result.feedback?.level || ''}</p>
          </div>
          
          {/* Sub-scores */}
          {result.feedback?.details && (
            <div className="flex gap-4 w-full bg-white p-3 rounded-md shadow-sm border text-xs text-center justify-between mt-2">
              <div className="flex flex-col">
                <span className="text-gray-500 font-medium">Phoneme</span>
                <span className="font-bold text-gray-800">{result.feedback.details.phonemeAccuracy}%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 font-medium">Confidence</span>
                <span className="font-bold text-gray-800">{result.feedback.details.confidenceScore}%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 font-medium">Text</span>
                <span className="font-bold text-gray-800">{result.feedback.details.textAccuracy}%</span>
              </div>
            </div>
          )}
          
          {/* Per-word details */}
          {result.feedback?.words && result.feedback.words.length > 0 ? (
            <div className="w-full bg-white border rounded-md p-3 text-sm max-h-40 overflow-y-auto">
                <p className="font-semibold text-gray-700 mb-2 border-b pb-1">Word Analysis</p>
                {result.feedback.words.map((w: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center mb-2">
                        <div className="flex flex-col">
                           <div className="flex gap-2 items-center">
                               <span className={`font-medium ${w.match === 'correct' ? 'text-green-600' : 'text-red-500'}`}>{w.word}</span>
                               <span className="text-xs text-gray-400">/{w.targetIPA}/</span>
                           </div>
                           {w.spokenIPA && w.match !== 'correct' && (
                               <span className="text-xs text-red-400 flex items-center gap-1">
                                 ↳ said: /{w.spokenIPA}/
                               </span>
                           )}
                        </div>
                        <div className="flex gap-1 text-xs whitespace-nowrap">
                           <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600" title="Phoneme Score">P: {w.phonemeScore}%</span>
                           <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600" title="Whisper Confidence">C: {w.confidence}%</span>
                        </div>
                    </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600 italic mt-2">"{result.transcribedText}"</p>
          )}

          <button 
            onClick={() => setResult(null)}
            className="text-sm text-blue-600 hover:underline mt-2 font-medium bg-blue-50 px-4 py-1.5 rounded-full"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
            {isProcessing ? (
                <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 border-4 border-[#FFC600] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs text-gray-500">Analyzing...</p>
                </div>
            ) : (
                <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                    isRecording 
                        ? 'bg-red-500 hover:bg-red-600 animate-pulse ring-4 ring-red-200' 
                        : 'bg-[#FFC600] hover:bg-yellow-400 shadow-md transform hover:scale-105'
                    }`}
                >
                    {isRecording ? (
                    <div className="w-6 h-6 bg-white rounded-sm" />
                    ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    )}
                </button>
            )}
            
            <p className="text-xs text-gray-500">
                {isRecording ? "Listening..." : "Tap to record"}
            </p>
        </div>
      )}
    </div>
  );
};
