/**
 * Audio Capture Service
 * Handles microphone access and audio recording using Web Audio API
 */

export interface AudioCaptureConfig {
  sampleRate?: number;
  channelCount?: number;
}

export class AudioCaptureService {
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private onDataCallback: ((data: Blob) => void) | null = null;

  /**
   * Check if the browser/webview supports audio capture
   */
  private checkMediaDevicesSupport(): void {
    if (!navigator.mediaDevices) {
      throw new Error(
        'Media devices not supported. This may be a permissions issue on macOS. ' +
        'Please ensure microphone access is granted in System Preferences > Security & Privacy > Privacy > Microphone.'
      );
    }
    if (!navigator.mediaDevices.getUserMedia) {
      throw new Error(
        'getUserMedia not supported in this environment.'
      );
    }
  }

  /**
   * Request microphone permission and initialize audio capture
   */
  async initialize(): Promise<boolean> {
    try {
      // Check support first
      this.checkMediaDevicesSupport();

      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });

      this.audioContext = new AudioContext({ sampleRate: 16000 });
      return true;
    } catch (error) {
      console.error('Failed to initialize audio capture:', error);
      throw this.handlePermissionError(error);
    }
  }

  /**
   * Start recording audio
   */
  startRecording(onData: (data: Blob) => void): void {
    if (!this.mediaStream) {
      throw new Error('Audio capture not initialized. Call initialize() first.');
    }

    this.onDataCallback = onData;
    this.audioChunks = [];

    // Use browser's default audio format (no mimeType specified)
    // This ensures compatibility with Safari/WKWebView which has limited codec support
    try {
      this.mediaRecorder = new MediaRecorder(this.mediaStream);
      console.log('MediaRecorder created with default mimeType:', this.mediaRecorder.mimeType);
    } catch (err) {
      console.error('Failed to create MediaRecorder:', err);
      throw new Error('Audio recording is not supported in this browser/environment');
    }

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        console.log('Audio chunk:', event.data.size, 'bytes, type:', event.data.type);
        this.audioChunks.push(event.data);
        if (this.onDataCallback) {
          this.onDataCallback(event.data);
        }
      }
    };

    this.mediaRecorder.onerror = (event) => {
      console.error('MediaRecorder error:', event);
    };

    // Capture data every 250ms for near real-time streaming
    this.mediaRecorder.start(250);
    console.log('Recording started');
  }

  /**
   * Stop recording audio
   */
  stopRecording(): Blob | null {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    if (this.audioChunks.length > 0) {
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      this.audioChunks = [];
      return audioBlob;
    }

    return null;
  }

  /**
   * Check if currently recording
   */
  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stopRecording();

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  /**
   * Handle permission errors with user-friendly messages
   */
  private handlePermissionError(error: unknown): Error {
    if (error instanceof DOMException) {
      switch (error.name) {
        case 'NotAllowedError':
          return new Error(
            'Microphone permission denied. Please allow microphone access in your system settings.'
          );
        case 'NotFoundError':
          return new Error(
            'No microphone found. Please connect a microphone and try again.'
          );
        case 'NotReadableError':
          return new Error(
            'Microphone is in use by another application. Please close other apps using the microphone.'
          );
        default:
          return new Error(`Microphone error: ${error.message}`);
      }
    }
    return error instanceof Error ? error : new Error('Unknown audio capture error');
  }

  /**
   * Check if microphone permission is granted
   */
  static async checkPermission(): Promise<PermissionState> {
    try {
      const result = await navigator.permissions.query({
        name: 'microphone' as PermissionName,
      });
      return result.state;
    } catch {
      // Some browsers don't support permission query for microphone
      return 'prompt';
    }
  }
}

// Singleton instance
export const audioCapture = new AudioCaptureService();
