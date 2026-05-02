import { useState, useRef, useCallback, useEffect } from 'react';

export interface UseRecordingReturn {
  isRecording: boolean;
  recordedAudioUrl: string | null;
  spokenWords: string[];
  startRecording: () => void;
  stopRecording: () => void;
  clearRecording: () => void;
  recordedAudioRef: React.RefObject<HTMLAudioElement>;
}

export function useRecording(): UseRecordingReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [spokenWords, setSpokenWords] = useState<string[]>([]);
  
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const skipNextRecordingRef = useRef(false);
  const recordedAudioRef = useRef<HTMLAudioElement>(null);

  const clearRecording = useCallback(() => {
    setRecordedAudioUrl(null);
    setSpokenWords([]);
  }, []);

  const startRecording = useCallback(() => {
    clearRecording();
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser. Please use Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = true;

    recognition.onresult = (event: any) => {
      let fullTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        fullTranscript += event.results[i][0].transcript + ' ';
      }
      const words = fullTranscript.trim().split(/\s+/).filter(w => w.length > 0);
      setSpokenWords(words);
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') return;
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    setIsRecording(true);
    recognition.start();

    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        if (skipNextRecordingRef.current) {
          skipNextRecordingRef.current = false;
          return;
        }
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedAudioUrl(url);
      };
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
    }).catch(() => {
      // Mic denied
    });
  }, [clearRecording]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (e) {}
    }
    setIsRecording(false);
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        skipNextRecordingRef.current = true;
        try { mediaRecorderRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  return {
    isRecording,
    recordedAudioUrl,
    spokenWords,
    startRecording,
    stopRecording,
    clearRecording,
    recordedAudioRef
  };
}
