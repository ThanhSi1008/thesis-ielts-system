/**
 * Learning API - Handles AI Voice pronunciation checks
 * Syncs with Web implementation
 */

import { apiClient } from './api-client';
import type { PronunciationCheckResponse } from '../types';

export const learningApi = {
  /**
   * Check pronunciation of an audio file
   * @param audioUri URI of the recorded audio file (local path)
   * @param userId Current user ID
   * @param options Target word or vocabulary ID for context
   */
  checkPronunciation: async (
    audioUri: string,
    userId: string,
    options: { vocabularyId?: string; targetWord?: string } = {}
  ): Promise<PronunciationCheckResponse> => {
    const formData = new FormData();

    // In React Native, FormData requires an object with uri, type, and name for files
    const uriParts = audioUri.split('/');
    const fileName = uriParts[uriParts.length - 1];

    // Extension → MIME map: covers all formats iOS/Android expo-audio may produce
    const extensionMimeMap: Record<string, string> = {
      '.wav': 'audio/wav',
      '.mp3': 'audio/mpeg',
      '.webm': 'audio/webm',
      '.m4a': 'audio/mp4',   // iOS M4A is MPEG-4 Audio container (RFC 4337)
      '.mp4': 'audio/mp4',
      '.aac': 'audio/aac',
      '.caf': 'audio/x-caf', // iOS Core Audio Format (edge case)
    };
    const ext = fileName.includes('.') ? fileName.slice(fileName.lastIndexOf('.')) : '.wav';
    const fileType = extensionMimeMap[ext] ?? 'audio/wav';

    // DEBUG: shows actual URI & MIME in Metro console so we can verify iOS output
    console.log(`[PronunciationAPI] uri=${audioUri}`);
    console.log(`[PronunciationAPI] fileName=${fileName} | ext=${ext} | mimeType=${fileType}`);

    // @ts-ignore - React Native FormData accepts {uri, name, type} for files
    formData.append('audio', {
      uri: audioUri,
      name: fileName,
      type: fileType,
    });

    formData.append('userId', userId);

    if (options.vocabularyId) {
      formData.append('vocabularyId', options.vocabularyId);
    }

    if (options.targetWord) {
      formData.append('targetWord', options.targetWord);
    }

    return apiClient.postForm<PronunciationCheckResponse>('/learning/pronunciation/check', formData);
  },

  /** Poll pronunciation attempts to check if AI processing completed */
  getUserPronunciationAttempts: async (userId: string): Promise<any[]> => {
    return apiClient.get<any[]>(`/learning/pronunciation/attempts/${userId}`);
  },
};

export default learningApi;
