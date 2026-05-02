import { useState, useEffect } from 'react';
import { dictationApi, DictationVideo, DictationSentence } from '@/services/dictation.api';

interface UseDictationLessonReturn {
  lesson: DictationVideo | null;
  isInitializing: boolean;
  sentences: DictationSentence[];
  isYouTube: boolean;
  audioUrl: string | undefined;
  lessonTitle: string;
  totalSentences: number;
}

export function useDictationLesson(lessonId: string | undefined): UseDictationLessonReturn {
  const [lesson, setLesson] = useState<DictationVideo | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (!lessonId) {
      setIsInitializing(false);
      return;
    }

    const fetchLesson = async () => {
      try {
        let data: DictationVideo | null = null;
        if (lessonId.startsWith('sys-') || lessonId.startsWith('toeic-') || lessonId.startsWith('shadowing-') || lessonId.startsWith('ielts-') || lessonId.startsWith('test-')) {
          data = await dictationApi.getLessonById(lessonId);
        } else {
          try {
            data = await dictationApi.getLessonById(lessonId);
          } catch (e) {
            data = await dictationApi.getVideoById(lessonId);
          }
        }
        setLesson(data);
      } catch (error) {
        console.error('Failed to fetch dictation lesson:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    fetchLesson();
  }, [lessonId]);

  return {
    lesson,
    isInitializing,
    sentences: lesson?.sentences || [],
    isYouTube: !!lesson?.youtubeVideoId,
    audioUrl: lesson?.audioUrl,
    lessonTitle: lesson?.title || '',
    totalSentences: lesson?.sentences?.length || 0,
  };
}
