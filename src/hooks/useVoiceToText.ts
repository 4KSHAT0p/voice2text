/**
 * useVoiceToText Hook
 * Custom React hook that combines audio capture and Deepgram transcription
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { AudioCaptureService } from '../services/audioCapture';
import { DeepgramService, TranscriptionResult } from '../services/deepgramService';

export interface VoiceToTextState {
  isRecording: boolean;
  isConnected: boolean;
  isInitialized: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  permissionStatus: PermissionState | null;
}

export interface VoiceToTextActions {
  initialize: () => Promise<void>;
  startRecording: () => void;
  stopRecording: () => void;
  clearTranscript: () => void;
  copyToClipboard: () => Promise<void>;
}

export function useVoiceToText(apiKey: string): [VoiceToTextState, VoiceToTextActions] {
  const [state, setState] = useState<VoiceToTextState>({
    isRecording: false,
    isConnected: false,
    isInitialized: false,
    transcript: '',
    interimTranscript: '',
    error: null,
    permissionStatus: null,
  });

  const audioServiceRef = useRef<AudioCaptureService | null>(null);
  const deepgramServiceRef = useRef<DeepgramService | null>(null);

  // Initialize audio capture service
  const initialize = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, error: null }));

      // Check permission status
      const permissionStatus = await AudioCaptureService.checkPermission();
      setState((prev) => ({ ...prev, permissionStatus }));

      // Initialize audio capture
      const audioService = new AudioCaptureService();
      await audioService.initialize();
      audioServiceRef.current = audioService;

      // Initialize Deepgram service
      if (apiKey) {
        deepgramServiceRef.current = new DeepgramService({ apiKey });
      }

      setState((prev) => ({
        ...prev,
        isInitialized: true,
        permissionStatus: 'granted',
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize';
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isInitialized: false,
      }));
    }
  }, [apiKey]);

  // Start recording and streaming to Deepgram
  const startRecording = useCallback(() => {
    if (!audioServiceRef.current || !deepgramServiceRef.current) {
      setState((prev) => ({
        ...prev,
        error: 'Services not initialized. Please initialize first.',
      }));
      return;
    }

    if (!apiKey) {
      setState((prev) => ({
        ...prev,
        error: 'Deepgram API key is required.',
      }));
      return;
    }

    setState((prev) => ({ ...prev, error: null, interimTranscript: '' }));

    // Connect to Deepgram
    deepgramServiceRef.current.connect({
      onOpen: () => {
        setState((prev) => ({ ...prev, isConnected: true }));

        // Start audio capture and send to Deepgram
        audioServiceRef.current?.startRecording((audioBlob) => {
          deepgramServiceRef.current?.sendAudio(audioBlob);
        });

        setState((prev) => ({ ...prev, isRecording: true }));
      },
      onTranscript: (result: TranscriptionResult) => {
        setState((prev) => {
          if (result.isFinal) {
            // Append final transcript with a space
            const newTranscript = prev.transcript
              ? `${prev.transcript} ${result.transcript}`
              : result.transcript;
            return {
              ...prev,
              transcript: newTranscript,
              interimTranscript: '',
            };
          } else {
            // Update interim transcript
            return {
              ...prev,
              interimTranscript: result.transcript,
            };
          }
        });
      },
      onError: (error) => {
        setState((prev) => ({
          ...prev,
          error: error.message,
          isRecording: false,
          isConnected: false,
        }));
      },
      onClose: () => {
        setState((prev) => ({
          ...prev,
          isConnected: false,
          isRecording: false,
        }));
      },
    });
  }, [apiKey]);

  // Stop recording
  const stopRecording = useCallback(() => {
    audioServiceRef.current?.stopRecording();
    deepgramServiceRef.current?.disconnect();

    setState((prev) => ({
      ...prev,
      isRecording: false,
      isConnected: false,
      interimTranscript: '',
    }));
  }, []);

  // Clear transcript
  const clearTranscript = useCallback(() => {
    setState((prev) => ({
      ...prev,
      transcript: '',
      interimTranscript: '',
    }));
  }, []);

  // Copy transcript to clipboard
  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(state.transcript);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: 'Failed to copy to clipboard',
      }));
    }
  }, [state.transcript]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioServiceRef.current?.dispose();
      deepgramServiceRef.current?.disconnect();
    };
  }, []);

  // Update Deepgram service when API key changes
  useEffect(() => {
    if (apiKey && state.isInitialized) {
      deepgramServiceRef.current = new DeepgramService({ apiKey });
    }
  }, [apiKey, state.isInitialized]);

  return [
    state,
    {
      initialize,
      startRecording,
      stopRecording,
      clearTranscript,
      copyToClipboard,
    },
  ];
}
