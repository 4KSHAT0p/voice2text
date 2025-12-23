/**
 * TranscriptDisplay Component
 * Shows transcribed text with copy functionality
 */

import React from 'react';
import './TranscriptDisplay.css';

interface TranscriptDisplayProps {
  transcript: string;
  interimTranscript: string;
  onCopy: () => void;
  onClear: () => void;
}

export const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({
  transcript,
  interimTranscript,
  onCopy,
  onClear,
}) => {
  const hasContent = transcript || interimTranscript;

  return (
    <div className="transcript-container">
      <div className="transcript-header">
        <h3>Transcription</h3>
        <div className="transcript-actions">
          <button
            className="action-button"
            onClick={onCopy}
            disabled={!transcript}
            title="Copy to clipboard"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
            </svg>
            Copy
          </button>
          <button
            className="action-button danger"
            onClick={onClear}
            disabled={!hasContent}
            title="Clear transcript"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
            </svg>
            Clear
          </button>
        </div>
      </div>

      <div className="transcript-content">
        {hasContent ? (
          <p>
            {transcript}
            {interimTranscript && (
              <span className="interim-text">{interimTranscript}</span>
            )}
          </p>
        ) : (
          <p className="placeholder-text">
            Your transcribed text will appear here...
          </p>
        )}
      </div>
    </div>
  );
};
