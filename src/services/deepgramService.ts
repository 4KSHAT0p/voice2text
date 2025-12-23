/**
 * Deepgram Service
 * Handles WebSocket connection to Deepgram for real-time speech-to-text
 */

export interface DeepgramConfig {
  apiKey: string;
  language?: string;
  model?: string;
  punctuate?: boolean;
  interimResults?: boolean;
}

export interface TranscriptionResult {
  transcript: string;
  isFinal: boolean;
  confidence: number;
  words?: Array<{
    word: string;
    start: number;
    end: number;
    confidence: number;
  }>;
}

export type DeepgramEventHandler = {
  onTranscript: (result: TranscriptionResult) => void;
  onError: (error: Error) => void;
  onOpen: () => void;
  onClose: () => void;
};

export class DeepgramService {
  private socket: WebSocket | null = null;
  private config: DeepgramConfig;
  private handlers: DeepgramEventHandler | null = null;
  private isConnected = false;

  constructor(config: DeepgramConfig) {
    this.config = {
      language: 'en',
      model: 'nova-2',
      punctuate: true,
      interimResults: true,
      ...config,
    };
  }

  /**
   * Connect to Deepgram WebSocket API
   */
  connect(handlers: DeepgramEventHandler): void {
    if (this.isConnected) {
      console.warn('Already connected to Deepgram');
      return;
    }

    this.handlers = handlers;

    // Build WebSocket URL with query parameters
    // Using webm/opus encoding which matches MediaRecorder output
    const params = new URLSearchParams({
      model: this.config.model!,
      language: this.config.language!,
      punctuate: String(this.config.punctuate),
      interim_results: String(this.config.interimResults),
    });

    const wsUrl = `wss://api.deepgram.com/v1/listen?${params.toString()}`;

    try {
      this.socket = new WebSocket(wsUrl, ['token', this.config.apiKey]);

      this.socket.onopen = () => {
        this.isConnected = true;
        console.log('Connected to Deepgram');
        this.handlers?.onOpen();
      };

      this.socket.onmessage = (event) => {
        this.handleMessage(event);
      };

      this.socket.onerror = (event) => {
        console.error('Deepgram WebSocket error:', event);
        this.handlers?.onError(new Error('WebSocket connection error'));
      };

      this.socket.onclose = (event) => {
        this.isConnected = false;
        console.log('Disconnected from Deepgram:', event.code, event.reason);
        this.handlers?.onClose();
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to connect to Deepgram');
      this.handlers?.onError(err);
    }
  }

  /**
   * Send audio data to Deepgram
   */
  sendAudio(audioData: Blob | ArrayBuffer): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('Cannot send audio: WebSocket not connected');
      return;
    }

    if (audioData instanceof Blob) {
      console.log('Sending audio blob:', audioData.size, 'bytes, type:', audioData.type);
      audioData.arrayBuffer().then((buffer) => {
        this.socket?.send(buffer);
      });
    } else {
      console.log('Sending audio buffer:', audioData.byteLength, 'bytes');
      this.socket.send(audioData);
    }
  }

  /**
   * Disconnect from Deepgram
   */
  disconnect(): void {
    if (this.socket) {
      // Send close message to Deepgram
      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: 'CloseStream' }));
      }
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
  }

  /**
   * Check if connected to Deepgram
   */
  isReady(): boolean {
    return this.isConnected && this.socket?.readyState === WebSocket.OPEN;
  }

  /**
   * Handle incoming messages from Deepgram
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);

      // Handle transcription results
      if (data.type === 'Results' && data.channel?.alternatives?.length > 0) {
        const alternative = data.channel.alternatives[0];
        const result: TranscriptionResult = {
          transcript: alternative.transcript || '',
          isFinal: data.is_final || false,
          confidence: alternative.confidence || 0,
          words: alternative.words,
        };

        if (result.transcript) {
          this.handlers?.onTranscript(result);
        }
      }

      // Handle errors from Deepgram
      if (data.type === 'Error') {
        this.handlers?.onError(new Error(data.message || 'Deepgram error'));
      }
    } catch (error) {
      console.error('Failed to parse Deepgram message:', error);
    }
  }

  /**
   * Update API key (useful for runtime configuration)
   */
  updateApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
    if (this.isConnected) {
      this.disconnect();
    }
  }
}

// Factory function to create service with API key
export function createDeepgramService(apiKey: string): DeepgramService {
  return new DeepgramService({ apiKey });
}
