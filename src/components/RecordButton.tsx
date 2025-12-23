/**
 * RecordButton Component
 * Push-to-talk button with visual feedback for recording state
 */

import React from 'react';
import './RecordButton.css';

interface RecordButtonProps {
  isRecording: boolean;
  isInitialized: boolean;
  disabled?: boolean;
  onMouseDown: () => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
}

export const RecordButton: React.FC<RecordButtonProps> = ({
  isRecording,
  isInitialized,
  disabled = false,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
}) => {
  const buttonClass = `record-button ${isRecording ? 'recording' : ''} ${
    !isInitialized || disabled ? 'disabled' : ''
  }`;

  return (
    <div className="record-button-container">
      <button
        className={buttonClass}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onTouchStart={onMouseDown}
        onTouchEnd={onMouseUp}
        disabled={!isInitialized || disabled}
        aria-label={isRecording ? 'Recording... Release to stop' : 'Hold to record'}
      >
        <div className="button-inner">
          <div className="mic-icon">
            {isRecording ? (
              <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            )}
          </div>
        </div>
      </button>
      <p className="record-hint">
        {!isInitialized
          ? 'Click "Initialize" to start'
          : isRecording
          ? '🔴 Recording... Release to stop'
          : 'Hold to record'}
      </p>
      {isRecording && <div className="pulse-ring" />}
    </div>
  );
};
