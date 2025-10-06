window.TrackManager = {
            addTrackToList(track) {
                const trackList = document.getElementById('trackList');
                const trackElement = document.createElement('div');
                trackElement.className = 'track-item';
                if (track.isRecording) {
                    trackElement.classList.add('recording');
                }
                trackElement.id = `track-${track.id}`;
                trackElement.onclick = () => this.selectTrack(track);
                
                trackElement.innerHTML = `
                    <div class="track-indicator ${track.isRecording ? 'recording' : ''}"></div>
                    <div class="track-name">
                        <span>${track.name}</span>
                        <span style="font-size: 0.8rem; color: var(--text-secondary);">${UI.formatDuration(track.buffer.duration)}</span>
                    </div>
                    <div class="track-controls">
                        <button class="track-btn" onclick="event.stopPropagation(); TrackManager.toggleTrackMute('${track.id}', this)">M</button>
                        <button class="track-btn" onclick="event.stopPropagation(); TrackManager.toggleTrackSolo('${track.id}', this)">S</button>
                        <button class="track-btn" onclick="event.stopPropagation(); TrackManager.removeTrack('${track.id}')">✕</button>
                    </div>
                `;
                
                trackList.appendChild(trackElement);
            },

            selectTrack(track) {
                AudioEngine.currentTrack = track;
                
                document.querySelectorAll('.track-item').forEach(el => {
                    el.classList.remove('active');
                });
                document.getElementById(`track-${track.id}`).classList.add('active');
                
                UI.drawWaveform(track.buffer);
                this.updateTrackDetails(track);
                
                if (window.innerWidth <= 768) {
                    UI.switchTab('waveform', null);
                    // Manually update active tab since we don't have an event target
                    document.querySelectorAll('.tab-nav-item').forEach(item => {
                        item.classList.remove('active');
                    });
                    document.querySelector('.tab-nav-item:first-child').classList.add('active');
                }
            },

            updateTrackDetails(track) {
                const detailsDiv = document.getElementById('trackDetails');
                detailsDiv.innerHTML = `
                    <div style="background: var(--bg-tertiary); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                        <h3 style="color: var(--accent); margin-bottom: 0.5rem;">${track.name}</h3>
                        <p style="color: var(--text-secondary); font-size: 0.9rem;">Duration: ${UI.formatDuration(track.buffer.duration)}</p>
                    </div>
                    
                    <div class="effect-control">
                        <div class="effect-label">Volume</div>
                        <input type="range" class="slider" min="0" max="100" value="${track.volumeValue * 100}" oninput="AudioEngine.currentTrack.setVolume(this.value / 100)">
                    </div>
                    
                    <div class="effect-control">
                        <div class="effect-label">Pan</div>
                        <input type="range" class="slider" min="-100" max="100" value="${track.pan.pan.value * 100}" oninput="AudioEngine.currentTrack.setPan(this.value / 100)">
                    </div>
                    
                    <div style="margin-top: 1rem;">
                        <button class="btn" style="width: 100%; margin-bottom: 0.5rem;" onclick="TrackManager.duplicateCurrentTrack()">
                            <i class="fas fa-copy"></i> Duplicate Track
                        </button>
                        <button class="btn btn-danger" style="width: 100%;" onclick="TrackManager.removeCurrentTrack()">
                            <i class="fas fa-trash"></i> Remove Track
                        </button>
                    </div>
                `;
            },

            removeTrack(trackId) {
                const trackIndex = AudioEngine.tracks.findIndex(t => t.id == trackId);
                if (trackIndex > -1) {
                    const track = AudioEngine.tracks[trackIndex];
                    track.stop();
                    track.player.dispose();
                    track.volume.dispose();
                    track.pan.dispose();
                    track.eq.dispose();
                    track.compressor.dispose();
                    track.reverb.dispose();
                    track.delay.dispose();
                    track.distortion.dispose();
                    track.chorus.dispose();
                    track.mute.dispose();
                    
                    AudioEngine.tracks.splice(trackIndex, 1);
                    document.getElementById(`track-${trackId}`).remove();
                    
                    if (AudioEngine.currentTrack && AudioEngine.currentTrack.id == trackId) {
                        AudioEngine.currentTrack = AudioEngine.tracks[0] || null;
                        if (AudioEngine.currentTrack) {
                            this.selectTrack(AudioEngine.currentTrack);
                        } else {
                            document.getElementById('trackDetails').innerHTML = `
                                <p style="color: var(--text-secondary); text-align: center; padding: 2rem;">
                                    Select a track to view details
                                </p>
                            `;
                        }
                    }
                    
                    UI.showToast('Track removed', 'info');
                }
            },

            addNewTrack() {
                UI.showToast('Please upload an audio file to create a track', 'info');
            },

            duplicateTrack() {
                if (AudioEngine.currentTrack) {
                    const newTrack = new Track(
                        AudioEngine.currentTrack.name + ' (Copy)', 
                        AudioEngine.currentTrack.buffer
                    );
                    AudioEngine.tracks.push(newTrack);
                    this.addTrackToList(newTrack);
                    UI.showToast('Track duplicated', 'success');
                } else {
                    UI.showToast('No track selected', 'error');
                }
            },

            duplicateCurrentTrack() {
                this.duplicateTrack();
            },

            removeCurrentTrack() {
                if (AudioEngine.currentTrack) {
                    this.removeTrack(AudioEngine.currentTrack.id);
                }
            },

            clearAllTracks() {
                if (confirm('Are you sure you want to clear all tracks?')) {
                    AudioEngine.tracks.forEach(track => {
                        track.stop();
                        track.player.dispose();
                        track.volume.dispose();
                        track.pan.dispose();
                        track.eq.dispose();
                        track.compressor.dispose();
                        track.reverb.dispose();
                        track.delay.dispose();
                        track.distortion.dispose();
                        track.chorus.dispose();
                        track.mute.dispose();
                    });
                    
                    AudioEngine.tracks = [];
                    AudioEngine.currentTrack = null;
                    document.getElementById('trackList').innerHTML = '';
                    document.getElementById('trackDetails').innerHTML = `
                        <p style="color: var(--text-secondary); text-align: center; padding: 2rem;">
                            Select a track to view details
                        </p>
                    `;
                    UI.showToast('All tracks cleared', 'info');
                }
            },

            updateSoloStates() {
                const hasSolo = AudioEngine.tracks.some(t => t.isSoloed);
                AudioEngine.tracks.forEach(track => {
                    if (hasSolo) {
                        track.mute.mute = !track.isSoloed || track.isMuted;
                    } else {
                        track.mute.mute = track.isMuted;
                    }
                });
            },

            toggleTrackMute(trackId, button) {
                const track = AudioEngine.tracks.find(t => t.id == trackId);
                if (track) {
                    track.toggleMute();
                    button.classList.toggle('active');
                }
            },

            toggleTrackSolo(trackId, button) {
                const track = AudioEngine.tracks.find(t => t.id == trackId);
                if (track) {
                    track.toggleSolo();
                    button.classList.toggle('active');
                }
            }
        };