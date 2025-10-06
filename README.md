# AI Audio Mixer Pro

Advanced DAW (Digital Audio Workstation) with Multi-Band Effects, built with Tone.js

## Features

- 🎵 **Multi-track Audio Editing** - Load and mix multiple audio files
- 🎚️ **Professional Effects** - EQ, Reverb, Delay, Distortion, Chorus, Compression
- 🎛️ **Multi-Band Compression** - Advanced frequency-based dynamics control
- 🎨 **Dynamic EQ** - Frequency-specific dynamic processing
- 🎤 **Audio Recording** - Record directly from your microphone
- 🤖 **AI Assistant** - Smart mixing presets and automated enhancements
- 📊 **Visual Timeline** - Drag-and-drop timeline editor with waveform display
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices

## Setup & Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-audio-mixer-pro
```

2. Install dependencies:
```bash
npm install
```

### Running the Application

Start the local development server:

```bash
npm start
```

The application will be available at `http://localhost:3000`

Alternatively, you can use the dev command:

```bash
npm run dev
```

## Usage

### Loading Audio Files

1. Click the "Tap to add audio" area in the sidebar
2. Select one or more audio files from your computer
3. Supported formats: MP3, WAV, OGG, M4A, and other common audio formats
4. Maximum file size: 50MB per file

### Recording Audio

1. Click the microphone button in the transport controls
2. Allow microphone access when prompted
3. Record your audio
4. Click stop when finished
5. The recording will be automatically added as a new track

### Mixing & Effects

1. Select a track from the sidebar
2. Navigate to the "Effects" tab
3. Enable and adjust effects:
   - **EQ**: 3-band equalizer for frequency shaping
   - **Reverb**: Add space and ambience
   - **Delay**: Echo and time-based effects
   - **Distortion**: Add warmth and grit
   - **Chorus**: Thicken and widen your sound
   - **Compressor**: Control dynamics

### Multi-Band Effects

1. Go to the "Effects" tab
2. Enable "Multi-Band Compressor" for frequency-specific compression
3. Adjust crossover points to split frequencies
4. Fine-tune each band (Low, Mid, High) independently

### AI Assistant

1. Click the AI button in the header
2. Choose from preset mixing styles:
   - Pop Mix
   - Rock Mix
   - Electronic Mix
3. Or use AI-powered tools:
   - Smart Mix (auto-balance)
   - Master Track
   - Noise Reduction
   - Vocal Enhancement
   - Bass Boost
   - Stereo Width Enhancement

### Exporting

1. Click the "Export" button in the header
2. Your mixed audio will be prepared for download

## Keyboard Shortcuts

- **Space**: Play/Pause
- **Ctrl+X/Cmd+X**: Cut
- **Ctrl+C/Cmd+C**: Copy
- **Ctrl+V/Cmd+V**: Paste
- **Ctrl+Z/Cmd+Z**: Undo
- **Ctrl+Y/Cmd+Y**: Redo
- **Delete/Backspace**: Delete selected region

## Project Structure

```
├── index.html              # Main HTML file
├── package.json            # Project dependencies
├── styles/
│   └── style.css          # Application styles
└── scripts/
    ├── main.js            # Application initialization
    ├── audio-engine.js    # Core audio processing
    ├── ui-manager.js      # UI utilities and controls
    ├── track-manager.js   # Track management
    ├── transport.js       # Playback controls
    ├── timeline.js        # Timeline editor
    ├── effects-manager.js # Audio effects
    ├── multiband-effects.js # Multi-band processing
    ├── audio-editor.js    # Audio editing tools
    ├── recording-manager.js # Recording functionality
    ├── project-manager.js # Project save/load
    └── ai-assistant.js    # AI-powered features
```

## Technologies Used

- **Tone.js** (v14.7.77) - Web Audio framework
- **Web Audio API** - Browser audio processing
- **MediaRecorder API** - Audio recording
- **HTML5 Canvas** - Waveform visualization
- **CSS Grid & Flexbox** - Responsive layout

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

**Note**: Recording features require HTTPS or localhost

## Troubleshooting

### Audio files won't load
- Check that files are valid audio formats
- Ensure file size is under 50MB
- Try a different audio file
- Check browser console for errors

### Recording doesn't work
- Grant microphone permissions in browser settings
- Ensure you're using HTTPS or localhost
- Check that your microphone is connected and working

### UI not loading properly
- Clear browser cache
- Ensure all scripts are loading (check browser console)
- Try refreshing the page

### No sound during playback
- Check master volume slider
- Ensure tracks aren't muted
- Check system audio settings
- Try playing a different track

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
