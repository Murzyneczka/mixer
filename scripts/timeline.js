// ===== timeline.js =====
        const Timeline = {
            zoom: 100,
            pixelsPerSecond: 100,
            timelineDuration: 30, // 30 seconds default view
            tracks: [],

            init() {
                this.renderRuler();
                this.renderTracks();
                this.updatePlayhead();
            },

            renderRuler() {
                const ruler = document.getElementById('timelineRuler');
                ruler.innerHTML = '';
                
                const marksContainer = document.createElement('div');
                marksContainer.className = 'timeline-ruler-marks';
                
                // Generate time marks
                for (let time = 0; time <= this.timelineDuration; time++) {
                    const isMajor = time % 5 === 0;
                    const mark = document.createElement('div');
                    mark.className = `ruler-mark ${isMajor ? 'major' : ''}`;
                    mark.style.left = (time * this.pixelsPerSecond) + 'px';
                    
                    if (isMajor) {
                        const label = document.createElement('div');
                        label.className = 'ruler-label';
                        label.textContent = this.formatTime(time);
                        label.style.left = (time * this.pixelsPerSecond) + 'px';
                        marksContainer.appendChild(label);
                    }
                    
                    marksContainer.appendChild(mark);
                }
                
                ruler.appendChild(marksContainer);
            },

            renderTracks() {
                const container = document.getElementById('timelineTracks');
                container.innerHTML = '';
                
                AudioEngine.tracks.forEach((track, index) => {
                    const trackElement = document.createElement('div');
                    trackElement.className = 'timeline-track';
                    if (AudioEngine.currentTrack && AudioEngine.currentTrack.id === track.id) {
                        trackElement.classList.add('selected');
                    }
                    
                    // Add audio regions
                    const region = document.createElement('div');
                    region.className = 'audio-region waveform';
                    region.style.left = '0px';
                    region.style.width = (track.buffer.duration * this.pixelsPerSecond) + 'px';
                    region.onclick = () => TrackManager.selectTrack(track);
                    
                    // Add resize handles
                    const leftHandle = document.createElement('div');
                    leftHandle.className = 'region-handle left';
                    const rightHandle = document.createElement('div');
                    rightHandle.className = 'region-handle right';
                    
                    region.appendChild(leftHandle);
                    region.appendChild(rightHandle);
                    trackElement.appendChild(region);
                    
                    container.appendChild(trackElement);
                });
            },

            updatePlayhead() {
                const playhead = document.getElementById('timelinePlayhead');
                const position = Tone.Transport.position;
                const seconds = parseFloat(position);
                playhead.style.left = (seconds * this.pixelsPerSecond) + 'px';
                
                if (Transport.isPlaying) {
                    requestAnimationFrame(() => this.updatePlayhead());
                }
            },

            setZoom(value) {
                this.zoom = parseInt(value);
                this.pixelsPerSecond = value;
                document.getElementById('zoomValue').textContent = value + '%';
                this.renderRuler();
                this.renderTracks();
            },

            zoomIn() {
                const newZoom = Math.min(200, this.zoom + 20);
                document.getElementById('zoomSlider').value = newZoom;
                this.setZoom(newZoom);
            },

            zoomOut() {
                const newZoom = Math.max(10, this.zoom - 20);
                document.getElementById('zoomSlider').value = newZoom;
                this.setZoom(newZoom);
            },

            formatTime(seconds) {
                const mins = Math.floor(seconds / 60);
                const secs = Math.floor(seconds % 60);
                return `${mins}:${secs.toString().padStart(2, '0')}`;
            }
        };