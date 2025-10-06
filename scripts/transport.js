// ===== transport.js =====
        window.Transport = {
            isPlaying: false,
            isLooping: false,
            loopStart: 0,
            loopEnd: 4,

            async toggle() {
                if (!AudioEngine.currentTrack) {
                    UI.showToast('No track selected', 'error');
                    return;
                }

                if (this.isPlaying) {
                    this.pause();
                } else {
                    await this.start();
                }
            },

            async start() {
                await Tone.start();
                this.isPlaying = true;
                
                document.getElementById('playBtn').classList.add('playing');
                document.getElementById('playIcon').className = 'fas fa-pause';
                
                document.getElementById('timeDisplay').classList.remove('recording-time');
                
                Tone.Transport.start();
                
                // Check if any tracks are soloed
                const hasSoloedTracks = AudioEngine.tracks.some(t => t.isSoloed);
                
                AudioEngine.tracks.forEach(track => {
                    // Play track if it has a buffer AND (no solo tracks exist OR this track is soloed)
                    if (track.buffer && (!hasSoloedTracks || track.isSoloed)) {
                        track.start();
                    }
                });
                
                UI.startVisualization();
                UI.updateTimeDisplay();
                Timeline.updatePlayhead();
            },

            pause() {
                this.isPlaying = false;
                document.getElementById('playBtn').classList.remove('playing');
                document.getElementById('playIcon').className = 'fas fa-play';
                
                Tone.Transport.pause();
                
                AudioEngine.tracks.forEach(track => {
                    track.stop();
                });
            },

            stop() {
                this.pause();
                Tone.Transport.stop();
                Tone.Transport.position = 0;
                document.getElementById('playhead').style.left = '0px';
                document.getElementById('timeDisplay').textContent = '00:00';
                document.getElementById('timeDisplay').classList.remove('recording-time');
                Timeline.updatePlayhead();
            },

            toggleLoop() {
                this.isLooping = !this.isLooping;
                Tone.Transport.loop = this.isLooping;
                Tone.Transport.loopStart = this.loopStart;
                Tone.Transport.loopEnd = this.loopEnd;
                UI.showToast(this.isLooping ? 'Loop enabled' : 'Loop disabled', 'info');
            },

            record() {
                RecordingManager.startRecording();
            }
        };