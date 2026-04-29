import { useState, useCallback } from 'react';
import {
  useAudioRecorder,
  useAudioRecorderState,
  RecordingOptions,
  requestRecordingPermissionsAsync,
  getRecordingPermissionsAsync,
  AudioRecorder,
  setAudioModeAsync,
} from 'expo-audio';
// Fix Bug #1: Use legacy import path for deprecated deleteAsync in Expo SDK 54
import * as FileSystem from 'expo-file-system/legacy';
import { Alert } from 'react-native';

/**
 * Custom Hook for handling audio recording using expo-audio (SDK 54).
 *
 * Fixes applied:
 * 1. Import FileSystem from 'expo-file-system/legacy' (SDK 54 migration).
 * 2. Call setAudioModeAsync({ allowsRecording: true }) before record()
 *    to enable iOS microphone recording mode.
 * 3. Record as WAV (.wav / audio/wav) so backend accepts the file without
 *    any backend changes (WAV is already in the allowed MIME list).
 */
export const useAudioRecorderHook = () => {
  const recordingOptions: RecordingOptions = {
    isMeteringEnabled: true,
    // Use WAV format: backend accepts audio/wav without any changes
    // WAV is uncompressed PCM — works natively on iOS & Android
    extension: '.wav',
    sampleRate: 16000,  // 16kHz is optimal for speech/Whisper AI
    numberOfChannels: 1, // Mono is sufficient and halves file size
    bitRate: 128000,
    android: {
      outputFormat: 'default',
      audioEncoder: 'default',
    },
    ios: {
      audioQuality: 127, // AVAudioQuality.high
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false,
    },
    web: {
      mimeType: 'audio/webm', // Web keeps webm (already in allowlist)
    },
  };

  const recorder: AudioRecorder = useAudioRecorder(recordingOptions);
  const state = useAudioRecorderState(recorder, 100);

  const [recordedUri, setRecordedUri] = useState<string | null>(null);

  const startRecording = useCallback(async () => {
    try {
      // Check / request microphone permission
      let permission = await getRecordingPermissionsAsync();
      if (!permission.granted) {
        permission = await requestRecordingPermissionsAsync();
      }
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Microphone access is required to record audio.');
        return;
      }

      // Fix Bug #2: Enable iOS recording mode BEFORE calling record()
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      setRecordedUri(null);
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Could not start recording.');
    }
  }, [recorder]);

  const stopRecording = useCallback(async () => {
    try {
      // MUST await stop() — it is async; uri is null until the file is finalized
      await recorder.stop();

      // Restore iOS audio mode to playback (best practice)
      await setAudioModeAsync({ allowsRecording: false });

      const uri = recorder.uri;
      if (uri) {
        setRecordedUri(uri);
        return uri;
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Could not stop recording.');
    }
    return null;
  }, [recorder]);

  const clearRecording = useCallback(async () => {
    const uri = recordedUri || recorder.uri;
    if (uri) {
      try {
        // Fix Bug #1: legacy API still provides deleteAsync correctly
        await FileSystem.deleteAsync(uri, { idempotent: true });
        setRecordedUri(null);
      } catch (error) {
        console.error('Failed to clear recording:', error);
      }
    }
  }, [recordedUri, recorder.uri]);

  return {
    isRecording: state.isRecording,
    recordedUri: recordedUri || recorder.uri,
    durationMillis: state.durationMillis,
    currentMetering: state.metering ?? -160,
    startRecording,
    stopRecording,
    clearRecording,
    recorder,
  };
};

export default useAudioRecorderHook;
