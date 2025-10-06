// ===== recording-manager.js =====
        const RecordingManager = {
            mediaRecorder: null,
            audioChunks: [],
            audioContext: null,
            analyser: null,
            microphone: null,
            isRecording: false,
            isPaused: false,
            startTime: null,
            pausedTime: 0,
            timerInterval: null,
            levelInterval: null,
            currentTrack: null,

            async startRecording() {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ 
                        audio: {
                            echoCancellation: true,
                            noiseSuppression: true,
                            sampleRate: 44100
                        } 
                    });

                    if (!this.audioContext) {
                        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    }

                    this.analyser = this.audioContext.createAnalyser();
                    this.analyser.fftSize = 256;
                    
                    this.microphone = this.audioContext.createMediaStreamSource(stream);
                    this.microphone.connect(this.analyser);

                    this.mediaRecorder = new MediaRecorder(stream);
                    this.audioChunks = [];

                    this.mediaRecorder.ondataavailable = (event) => {
                        this.audioChunks.push(event.data);
                    };

                    this.mediaRecorder.onstop = async () => {
                        await this.processRecording();
                    };

                    this.mediaRecorder.start();
                    this.isRecording = true;
                    this.startTime = Date.now();
                    this.pausedTime = 0;

                    document.getElementById('recordBtn').classList.add('recording');
                    document.getElementById('recordingModal').classList.add('active');
                    
                    this.startTimer();
                    this.startLevelMonitoring();

                    UI.showToast('Recording started', 'success');

                } catch (error) {
                    console.error('Error accessing microphone:', error);
                    UI.showToast('Failed to access microphone. Please check permissions.', 'error');
                }
            },

            pauseRecording() {
                if (!this.isRecording) return;

                if (this.isPaused) {
                    this.mediaRecorder.resume();
                    this.isPaused = false;
                    this.startTime = Date.now() - this.pausedTime;
                    document.getElementById('pauseBtn').innerHTML = '<i class="fas fa-pause"></i>';
                    UI.showToast('Recording resumed', 'info');
                } else {
                    this.mediaRecorder.pause();
                    this.isPaused = true;
                    this.pausedTime = Date.now() - this.startTime;
                    document.getElementById('pauseBtn').innerHTML = '<i class="fas fa-play"></i>';
                    UI.showToast('Recording paused', 'info');
                }
            },

            async stopRecording() {
                if (!this.isRecording) return;

                this.mediaRecorder.stop();
                this.isRecording = false;

                const stream = this.mediaRecorder.stream;
                stream.getTracks().forEach(track => track.stop());

                if (this.timerInterval) {
                    clearInterval(this.timerInterval);
                }
                if (this.levelInterval) {
                    clearInterval(this.levelInterval);
                }

                document.getElementById('recordBtn').classList.remove('recording');
                document.getElementById('recordingModal').classList.remove('active');
                document.getElementById('recordingLevels').classList.remove('active');
                
                document.getElementById('recordingTimer').textContent = '00:00';
                document.getElementById('pauseBtn').innerHTML = '<i class="fas fa-pause"></i>';
            },

            async processRecording() {
                try {
                    const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    
                    const arrayBuffer = await audioBlob.arrayBuffer();
                    const audioBuffer = await Tone.getContext().decodeAudioData(arrayBuffer);
                    
                    const trackName = document.getElementById('recordingName').value || 'Recording';
                    
                    const track = new Track(trackName, audioBuffer);
                    track.isRecording = false;
                    
                    AudioEngine.tracks.push(track);
                    TrackManager.addTrackToList(track);
                    TrackManager.selectTrack(track);
                    
                    this.audioChunks = [];
                    URL.revokeObjectURL(audioUrl);
                    
                    UI.showToast(`Recording "${trackName}" added to tracks`, 'success');
                    
                } catch (error) {
                    console.error('Error processing recording:', error);
                    UI.showToast('Error processing recording', 'error');
                }
            },

            startTimer() {
                this.timerInterval = setInterval(() => {
                    if (!this.isPaused) {
                        const elapsed = Date.now() - this.startTime;
                        const seconds = Math.floor(elapsed / 1000);
                        const minutes = Math.floor(seconds / 60);
                        const displaySeconds = seconds % 60;
                        
                        const display = `${minutes.toString().padStart(2, '0')}:${displaySeconds.toString().padStart(2, '0')}`;
                        document.getElementById('recordingTimer').textContent = display;
                        
                        if (this.isRecording) {
                            document.getElementById('timeDisplay').textContent = display;
                            document.getElementById('timeDisplay').classList.add('recording-time');
                        }
                    }
                }, 100);
            },

            startLevelMonitoring() {
                const bufferLength = this.analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);

                this.levelInterval = setInterval(() => {
                    if (!this.isRecording) return;

                    this.analyser.getByteFrequencyData(dataArray);
                    
                    let sumL = 0, sumR = 0;
                    const halfLength = bufferLength / 2;
                    
                    for (let i = 0; i < halfLength; i++) {
                        sumL += dataArray[i] * dataArray[i];
                    }
                    for (let i = halfLength; i < bufferLength; i++) {
                        sumR += dataArray[i] * dataArray[i];
                    }
                    
                    const rmsL = Math.sqrt(sumL / halfLength);
                    const rmsR = Math.sqrt(sumR / halfLength);
                    
                    const levelL = Math.min(100, (rmsL / 128) * 100);
                    const levelR = Math.min(100, (rmsR / 128) * 100);
                    
                    this.updateLevelMeter('inputLevelL', levelL);
                    this.updateLevelMeter('inputLevelR', levelR);
                    this.updateLevelMeter('inputLevelL2', levelL);
                    this.updateLevelMeter('inputLevelR2', levelR);
                }, 50);
            },

            updateLevelMeter(elementId, level) {
                const element = document.getElementById(elementId);
                if (element) {
                    element.style.width = level + '%';
                    
                    if (level > 80) {
                        element.classList.add('high');
                    } else {
                        element.classList.remove('high');
                    }
                }
            },

            cancelRecording() {
                if (this.isRecording) {
                    this.stopRecording();
                    this.audioChunks = [];
                    UI.showToast('Recording cancelled', 'info');
                }
            }
        };