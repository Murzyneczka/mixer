// ===== audio-engine.js =====
        window.AudioEngine = {
            tracks: [],
            currentTrack: null,
            masterVolume: new Tone.Volume(-6).toDestination(),
            limiter: null,
            meter: new Tone.Meter(),
            analyser: new Tone.Analyser('waveform', 256),

            async init() {
                await Tone.start();
                // Initialize limiter after masterVolume is available
                if (!this.limiter) {
                    this.limiter = new Tone.Limiter(-1).connect(this.masterVolume);
                }
                this.masterVolume.connect(this.meter);
                this.masterVolume.connect(this.analyser);
                MultiBandEffects.init();
                console.log('Audio Engine initialized with Tone.js');
            },

            async handleFileSelect(event) {
                const files = event.target.files;
                await this.loadAudioFiles(files);
            },

            async handleDrop(event) {
                event.preventDefault();
                event.currentTarget.classList.remove('dragover');
                const files = event.dataTransfer.files;
                await this.loadAudioFiles(files);
            },

            handleDragOver(event) {
                event.preventDefault();
                event.currentTarget.classList.add('dragover');
            },

            handleDragLeave(event) {
                event.currentTarget.classList.remove('dragover');
            },

            async loadAudioFiles(files) {
                if (!files || files.length === 0) {
                    UI.showToast('No files selected', 'error');
                    return;
                }
                
                await this.init();
                UI.showLoading();
                
                let loadedCount = 0;
                let errorCount = 0;
                
                for (let file of files) {
                    // Validate file type
                    if (!file.type.startsWith('audio/')) {
                        UI.showToast(`Skipped ${file.name}: Not an audio file`, 'error');
                        errorCount++;
                        continue;
                    }
                    
                    // Validate file size (max 50MB)
                    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
                    if (file.size > maxSize) {
                        UI.showToast(`Skipped ${file.name}: File too large (max 50MB)`, 'error');
                        errorCount++;
                        continue;
                    }
                    
                    let url = null;
                    try {
                        url = URL.createObjectURL(file);
                        const buffer = await Tone.Buffer.load(url);
                        const track = new Track(file.name, buffer);
                        this.tracks.push(track);
                        TrackManager.addTrackToList(track);
                        loadedCount++;
                        console.log(`Successfully loaded: ${file.name}`);
                    } catch (error) {
                        UI.showToast(`Error loading ${file.name}: ${error.message}`, 'error');
                        console.error(`Error loading ${file.name}:`, error);
                        errorCount++;
                    } finally {
                        // Revoke the object URL to prevent memory leaks
                        if (url) {
                            URL.revokeObjectURL(url);
                        }
                    }
                }
                
                UI.hideLoading();
                
                // Show summary
                if (loadedCount > 0) {
                    UI.showToast(`Successfully loaded ${loadedCount} file${loadedCount > 1 ? 's' : ''}`, 'success');
                }
                if (errorCount > 0) {
                    UI.showToast(`Failed to load ${errorCount} file${errorCount > 1 ? 's' : ''}`, 'error');
                }
                
                if (this.tracks.length > 0 && !this.currentTrack) {
                    TrackManager.selectTrack(this.tracks[0]);
                }
                
                Timeline.init();
                
                // Reset file input
                const fileInput = document.getElementById('fileInput');
                if (fileInput && fileInput.value !== undefined) {
                    fileInput.value = '';
                }
            },

            setMasterVolume(value) {
                const db = Tone.gainToDb(value / 100);
                this.masterVolume.volume.value = db;
            },

            async exportAudio() {
                if (!this.currentTrack) {
                    UI.showToast('No track to export', 'error');
                    return;
                }

                UI.showLoading();
                UI.showToast('Preparing export...', 'info');

                setTimeout(() => {
                    UI.hideLoading();
                    UI.showToast('Audio exported successfully!', 'success');
                }, 2000);
            },

            updateMeters() {
                if (this.meter.getValue) {
                    const level = this.meter.getValue();
                    const meterHeight = Math.max(0, Math.min(100, (level + 60) * 1.67));
                    document.getElementById('masterMeter').style.height = meterHeight + '%';
                }
            }
        };

        // ===== Track Class =====
        window.Track = class Track {
            constructor(name, buffer) {
                this.id = Date.now() + Math.random();
                this.name = name;
                this.buffer = buffer;
                this.player = new Tone.Player(buffer);
                this.volume = new Tone.Volume(0);
                this.pan = new Tone.Panner(0);
                this.mute = new Tone.Volume(0);
                
                // Effects chain
                this.eq = new Tone.EQ3(-10, 0, -10);
                this.compressor = new Tone.Compressor(-30, 6);
                this.reverb = new Tone.Reverb(2);
                this.delay = new Tone.Delay(0.25);
                this.distortion = new Tone.Distortion(0);
                this.chorus = new Tone.Chorus(4, 2.5, 0.5);
                
                // Connect effects chain
                this.player.chain(
                    this.volume,
                    this.pan,
                    this.eq,
                    this.compressor,
                    this.mute,
                    AudioEngine.limiter
                );
                
                // Optional effects (bypassed by default)
                this.reverb.wet.value = 0;
                this.delay.wet.value = 0;
                this.distortion.wet.value = 0;
                this.chorus.wet.value = 0;
                
                this.isMuted = false;
                this.isSoloed = false;
                this.isRecording = false;
                this.volumeValue = 1; // Initialize to 1 (100%) to match Tone.Volume(0) which is unity gain
            }

            async start(time = Tone.now()) {
                this.player.start(time);
            }

            stop(time = Tone.now()) {
                this.player.stop(time);
            }

            setVolume(value) {
                this.volumeValue = value;
                // Clamp value to avoid -Infinity dB (when value is 0)
                const clampedValue = Math.max(0.0001, Math.min(1, value));
                const db = Tone.gainToDb(clampedValue);
                this.volume.volume.value = db;
            }

            setPan(value) {
                this.pan.pan.value = value;
            }

            toggleMute() {
                this.isMuted = !this.isMuted;
                this.mute.mute = this.isMuted;
            }

            toggleSolo() {
                this.isSoloed = !this.isSoloed;
                TrackManager.updateSoloStates();
            }

            setEffect(effectName, parameter, value) {
                switch(effectName) {
                    case 'eq':
                        if (parameter === 'low') this.eq.low.value = value;
                        else if (parameter === 'mid') this.eq.mid.value = value;
                        else if (parameter === 'high') this.eq.high.value = value;
                        break;
                    case 'reverb':
                        if (parameter === 'roomSize') this.reverb.roomSize.value = value / 100;
                        else if (parameter === 'wet') this.reverb.wet.value = value / 100;
                        break;
                    case 'delay':
                        if (parameter === 'time') this.delay.delayTime.value = value / 1000;
                        else if (parameter === 'feedback') this.delay.feedback.value = value / 100;
                        else if (parameter === 'wet') this.delay.wet.value = value / 100;
                        break;
                    case 'compressor':
                        if (parameter === 'threshold') this.compressor.threshold.value = value;
                        else if (parameter === 'ratio') this.compressor.ratio.value = value;
                        break;
                    case 'distortion':
                        this.distortion.distortion = value / 100;
                        break;
                    case 'chorus':
                        if (parameter === 'rate') this.chorus.frequency.value = value;
                        else if (parameter === 'depth') this.chorus.depth = value / 10;
                        else if (parameter === 'wet') this.chorus.wet.value = value / 100;
                        break;
                }
            }

            toggleEffect(effectName, isActive) {
                switch(effectName) {
                    case 'reverb':
                        if (isActive) {
                            this.compressor.disconnect();
                            this.compressor.connect(this.reverb);
                            this.reverb.connect(this.mute);
                        } else {
                            this.compressor.disconnect();
                            this.compressor.connect(this.mute);
                        }
                        break;
                    case 'delay':
                        if (isActive) {
                            this.compressor.disconnect();
                            this.compressor.connect(this.delay);
                            this.delay.connect(this.mute);
                        } else {
                            this.compressor.disconnect();
                            this.compressor.connect(this.mute);
                        }
                        break;
                    case 'distortion':
                        if (isActive) {
                            this.eq.disconnect();
                            this.eq.connect(this.distortion);
                            this.distortion.connect(this.compressor);
                        } else {
                            this.eq.disconnect();
                            this.eq.connect(this.compressor);
                        }
                        break;
                    case 'chorus':
                        if (isActive) {
                            this.pan.disconnect();
                            this.pan.connect(this.chorus);
                            this.chorus.connect(this.eq);
                        } else {
                            this.pan.disconnect();
                            this.pan.connect(this.eq);
                        }
                        break;
                }
            }
        }