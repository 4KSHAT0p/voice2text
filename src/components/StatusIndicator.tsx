/**
 * StatusIndicator Component
 * Shows connection and permission status
 */

import React from 'react';
import './StatusIndicator.css';

interface StatusIndicatorProps {
  isInitialized: boolean;
  isConnected: boolean;
  isRecording: boolean;
  error: string | null;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  isInitialized,
  isConnected,
  isRecording,
  error,
}) => {
  const getStatus = () => {
    if (error) {
      return { label: 'Error', color: 'error' };
    }
    if (isRecording) {
      return { label: 'Recording', color: 'recording' };
    }
    if (isConnected) {
      return { label: 'Connected', color: 'connected' };
    }
    if (isInitialized) {
      return { label: 'Ready', color: 'ready' };
    }
    return { label: 'Not Initialized', color: 'idle' };
  };

  const status = getStatus();

  return (
    <div className="status-container">
      <div className={`status-indicator ${status.color}`}>
        <span className="status-dot" />
        <span className="status-label">{status.label}</span>
      </div>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};
