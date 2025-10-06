// ===== main.js =====
        document.addEventListener('DOMContentLoaded', async () => {
            EffectsManager.render();
            AudioEditor.init();
            
            setInterval(() => {
                AudioEngine.updateMeters();
            }, 100);
            
            window.addEventListener('resize', () => {
                if (window.innerWidth > 768) {
                    document.getElementById('sidebar').classList.remove('open');
                    document.getElementById('mobileOverlay').classList.remove('active');
                }
            });
            
            window.addEventListener('orientationchange', () => {
                setTimeout(() => {
                    if (AudioEngine.currentTrack) {
                        UI.drawWaveform(AudioEngine.currentTrack.buffer);
                    }
                }, 100);
            });
            
            document.addEventListener('visibilitychange', () => {
                if (document.hidden && RecordingManager.isRecording) {
                    UI.showToast('Recording continues in background', 'info');
                }
            });
            
            window.addEventListener('beforeunload', (e) => {
                if (AudioEngine.tracks.length > 0 || RecordingManager.isRecording) {
                    e.preventDefault();
                    e.returnValue = '';
                }
            });
            
            UI.showToast('Welcome to AI Audio Mixer Pro! Upload audio files or record to get started.', 'info');
            
            if ('ontouchstart' in window) {
                document.body.classList.add('touch-device');
            }
            
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                UI.showToast('Recording not supported in this browser', 'error');
                document.getElementById('recordBtn').style.display = 'none';
            }
        });