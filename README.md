# 🎤 Wispr Clone - Voice to Text App

A cross-platform desktop application that converts speech to text in real-time using Tauri and Deepgram.

## Features

- **Push-to-Talk Recording**: Hold the button to record, release to stop
- **Real-Time Transcription**: Stream audio to Deepgram for instant speech-to-text
- **Copy & Clear**: Easily copy transcribed text to clipboard or clear it
- **Visual Feedback**: Clear status indicators and recording state visualization
- **Error Handling**: Graceful handling of permission, network, and API errors

## Tech Stack

| Component | Technology |
|-----------|------------|
| Desktop Framework | [Tauri](https://tauri.app/) v2 |
| Frontend | React 19 + TypeScript |
| Build Tool | Vite 7 |
| Speech-to-Text | [Deepgram](https://deepgram.com/) API |

## Prerequisites

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **Rust** ([Install via rustup](https://rustup.rs/))
- **Deepgram API Key** ([Get free API key](https://console.deepgram.com/))

## Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Wispr-Clone
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run in Development Mode

```bash
npm run tauri dev
```

This will start the Vite dev server and launch the Tauri application.

### 4. Get Your Deepgram API Key

1. Go to [console.deepgram.com](https://console.deepgram.com/)
2. Sign up for a free account
3. Create a new API key
4. Paste it into the app when prompted

## Usage

1. **Enter your Deepgram API key** in the input field
2. **Click "Initialize Microphone"** to request microphone permission
3. **Hold the record button** to start recording
4. **Release the button** to stop recording and see your transcription
5. **Copy or clear** the transcript as needed

## Project Structure

```
Wispr-Clone/
├── src/                      # React frontend source
│   ├── components/           # UI components
│   │   ├── ApiKeyInput.tsx   # API key input field
│   │   ├── RecordButton.tsx  # Push-to-talk button
│   │   ├── StatusIndicator.tsx # Connection status
│   │   └── TranscriptDisplay.tsx # Transcription output
│   ├── hooks/
│   │   └── useVoiceToText.ts # Main hook combining services
│   ├── services/
│   │   ├── audioCapture.ts   # Microphone & audio recording
│   │   └── deepgramService.ts # Deepgram WebSocket client
│   ├── App.tsx               # Main application component
│   └── main.tsx              # Entry point
├── src-tauri/                # Tauri/Rust backend
│   ├── src/
│   │   └── lib.rs            # Rust backend code
│   ├── tauri.conf.json       # Tauri configuration
│   └── Cargo.toml            # Rust dependencies
├── package.json
└── README.md
```

## Architecture Decisions

### Audio Capture
- Uses Web Audio API with `MediaRecorder` for browser-compatible audio capture
- Streams audio in 250ms chunks for near real-time transcription
- Uses `audio/webm;codecs=opus` format for efficient streaming

### Deepgram Integration
- WebSocket connection for real-time bidirectional communication
- Uses Deepgram's Nova-2 model for high accuracy
- Handles both interim (partial) and final transcription results

### State Management
- Simple React hooks pattern (`useVoiceToText`)
- No external state management library needed for this scope
- Clean separation between UI, audio capture, and transcription services

### Error Handling
- Graceful degradation for permission denials
- Network error detection and user feedback
- API error messages displayed to user

## Building for Production

```bash
# Build the desktop application
npm run tauri build
```

The built application will be in `src-tauri/target/release/`.

## Known Limitations

1. **Browser Audio API**: Audio capture uses Web APIs, which work well but have browser-specific behaviors
2. **API Key Storage**: Currently stored in memory only (resets on app restart). For production, consider secure storage.
3. **Single Language**: Currently configured for English. Can be extended to support other languages.
