import { useState, useCallback, useEffect } from 'react';
import { 
  useAudioRecorder, 
  useAudioRecorderState, 
  RecordingOptions, 
  requestRecordingPermissionsAsync,
  getRecordingPermissionsAsync,
  AudioRecorder
} from 'expo-audio';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';

/**
 * Custom Hook for handling audio recording using expo-audio
 * Provides methods to start, stop, and retrieve the recorded file URI.
 */
export const useAudioRecorderHook = () => {
  // Configure recording options
  const recordingOptions: RecordingOptions = {
    isMeteringEnabled: true,
    extension: '.m4a',
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
    // Add platform specific options if required by the type system
    android: {
      outputFormat: 'mpeg4',
      audioEncoder: 'aac',
    },
    ios: {
      audioQuality: 127, // High quality
    },
    web: {
      mimeType: 'audio/webm',
    }
  };

  const recorder: AudioRecorder = useAudioRecorder(recordingOptions);
  const state = useAudioRecorderState(recorder, 100); // Update every 100ms for waveform

  const [recordedUri, setRecordedUri] = useState<string | null>(null);

  const startRecording = useCallback(async () => {
    try {
      // Check/Request permissions
      let permission = await getRecordingPermissionsAsync();
      if (!permission.granted) {
        permission = await requestRecordingPermissionsAsync();
      }
      
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Microphone access is required to record audio.');
        return;
      }

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
      recorder.stop();
      // In the new API, the URI might be in the state or recorder object
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
