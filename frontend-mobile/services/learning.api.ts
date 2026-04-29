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
    // Extract file name and extension from URI
    const uriParts = audioUri.split('/');
    const fileName = uriParts[uriParts.length - 1];
    
    // MIME type mapping — backend-core accepts: audio/wav, audio/mpeg, audio/mp3, audio/webm, audio/mp4
    // iOS expo-audio records as .m4a → correct MIME is audio/mp4 (RFC 4337)
    const extensionMimeMap: Record<string, string> = {
      '.wav': 'audio/wav',
      '.mp3': 'audio/mpeg',
      '.webm': 'audio/webm',
      '.m4a': 'audio/mp4',  // m4a is an MPEG-4 audio container
      '.mp4': 'audio/mp4',
    };
    const ext = fileName.includes('.') ? fileName.slice(fileName.lastIndexOf('.')) : '.m4a';
    const fileType = extensionMimeMap[ext] ?? 'audio/mp4';

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
