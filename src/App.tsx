/**
 * Wispr Clone - Voice to Text App
 * Main Application Component
 */

import { useState, useCallback } from 'react';
import { useVoiceToText } from './hooks/useVoiceToText';
import { RecordButton } from './components/RecordButton';
import { TranscriptDisplay } from './components/TranscriptDisplay';
import { StatusIndicator } from './components/StatusIndicator';
import { ApiKeyInput } from './components/ApiKeyInput';
import { DEEPGRAM_API_KEY } from './config';
import './App.css';

function App() {
  // Store API key in state - initialized from config file (users should edit config.ts)
  const [apiKey, setApiKey] = useState(DEEPGRAM_API_KEY !== 'YOUR_API_KEY_HERE' ? DEEPGRAM_API_KEY : '');

  // Use the voice-to-text hook
  const [state, actions] = useVoiceToText(apiKey);

  // Handle push-to-talk: start on mouse down
  const handleRecordStart = useCallback(() => {
    if (state.isInitialized && apiKey && !state.isRecording) {
      actions.startRecording();
    }
  }, [state.isInitialized, state.isRecording, apiKey, actions]);

  // Handle push-to-talk: stop on mouse up or leave
  const handleRecordStop = useCallback(() => {
    if (state.isRecording) {
      actions.stopRecording();
    }
  }, [state.isRecording, actions]);

  // Initialize audio capture
  const handleInitialize = useCallback(async () => {
    await actions.initialize();
  }, [actions]);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🎤 Wispr Clone</h1>
        <p className="subtitle">Voice to Text powered by Deepgram</p>
      </header>

      <main className="app-main">
        {/* API Key Input Section */}
        <section className="section api-section">
          <ApiKeyInput value={apiKey} onChange={setApiKey} />
        </section>

        {/* Status Indicator */}
        <section className="section status-section">
          <StatusIndicator
            isInitialized={state.isInitialized}
            isConnected={state.isConnected}
            isRecording={state.isRecording}
            error={state.error}
          />
        </section>

        {/* Initialize Button */}
        {!state.isInitialized && (
          <section className="section">
            <button
              className="initialize-button"
              onClick={handleInitialize}
              disabled={!apiKey}
            >
              Initialize Microphone
            </button>
            {!apiKey && (
              <p className="init-hint">Enter your API key first</p>
            )}
          </section>
        )}

        {/* Record Button - Push to Talk */}
        <section className="section record-section">
          <RecordButton
            isRecording={state.isRecording}
            isInitialized={state.isInitialized}
            disabled={!apiKey}
            onMouseDown={handleRecordStart}
            onMouseUp={handleRecordStop}
            onMouseLeave={handleRecordStop}
          />
        </section>

        {/* Transcript Display */}
        <section className="section transcript-section">
          <TranscriptDisplay
            transcript={state.transcript}
            interimTranscript={state.interimTranscript}
            onCopy={actions.copyToClipboard}
            onClear={actions.clearTranscript}
          />
        </section>
      </main>

      <footer className="app-footer">
        <p>Built with Tauri + React + Deepgram</p>
      </footer>
    </div>
  );
}

export default App;
