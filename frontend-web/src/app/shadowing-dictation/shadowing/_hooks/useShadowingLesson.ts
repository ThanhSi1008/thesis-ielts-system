import { useState, useEffect } from 'react';
import { shadowingApi, ShadowingVideo, ShadowingSentence } from '@/services/shadowing.api';

interface UseShadowingLessonReturn {
  foundationVocabLesson: ShadowingVideo | null;
  isInitializing: boolean;
  sentences: ShadowingSentence[];
  isYouTube: boolean;
  audioUrl: string | undefined;
  lessonTitle: string;
  totalSentences: number;
}

export function useShadowingLesson(lessonId: string | undefined): UseShadowingLessonReturn {
  const [foundationVocabLesson, setLesson] = useState<ShadowingVideo | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (!lessonId) {
      setIsInitializing(false);
      return;
    }

    const fetchLesson = async () => {
      try {
        let data: ShadowingVideo | null = null;
        if (lessonId.startsWith('sys-') || lessonId.startsWith('toeic-') || lessonId.startsWith('shadowing-') || lessonId.startsWith('ielts-') || lessonId.startsWith('test-')) {
          data = await shadowingApi.getLessonById(lessonId);
        } else {
          try {
            data = await shadowingApi.getLessonById(lessonId);
          } catch (e) {
            data = await shadowingApi.getVideoById(lessonId);
          }
        }
        setLesson(data);
      } catch (error) {
        console.error('Failed to fetch shadowing foundationVocabLesson:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    fetchLesson();
  }, [lessonId]);

  return {
    foundationVocabLesson,
    isInitializing,
    sentences: foundationVocabLesson?.sentences || [],
    isYouTube: !!foundationVocabLesson?.youtubeVideoId,
    audioUrl: foundationVocabLesson?.audioUrl,
    lessonTitle: foundationVocabLesson?.title || '',
    totalSentences: foundationVocabLesson?.sentences?.length || 0,
  };
}
