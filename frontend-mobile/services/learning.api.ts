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

    // Mobile records as .wav → audio/wav (already accepted by backend)
    // Map kept for safety in case extension changes in the future
    const extensionMimeMap: Record<string, string> = {
      '.wav': 'audio/wav',
      '.mp3': 'audio/mpeg',
      '.webm': 'audio/webm',
    };
    const ext = fileName.includes('.') ? fileName.slice(fileName.lastIndexOf('.')) : '.wav';
    const fileType = extensionMimeMap[ext] ?? 'audio/wav';

    // @ts-ignore - React Native FormData is slightly different from Web
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
};

export default learningApi;
