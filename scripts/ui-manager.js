        // ===== ui-manager.js =====
        const UI = {
            currentTab: 'waveform',
            effectsVisible: true,

            showToast(message, type = 'info') {
                const container = document.getElementById('toastContainer');
                const toast = document.createElement('div');
                toast.className = `toast ${type}`;
                
                const icons = {
                    success: 'fas fa-check-circle',
                    error: 'fas fa-exclamation-circle',
                    info: 'fas fa-info-circle'
                };
                
                toast.innerHTML = `
                    <span class="toast-icon"><i class="${icons[type]}"></i></span>
                    <span>${message}</span>
                `;
                
                container.appendChild(toast);
                
                setTimeout(() => {
                    toast.style.animation = 'slideIn 0.3s ease reverse';
                    setTimeout(() => {
                        container.removeChild(toast);
                    }, 300);
                }, 3000);
            },

            toggleSidebar() {
                const sidebar = document.getElementById('sidebar');
                const overlay = document.getElementById('mobileOverlay');
                
                sidebar.classList.toggle('open');
                overlay.classList.toggle('active');
            },

            toggleAIPanel() {
                const panel = document.getElementById('aiPanel');
                panel.classList.toggle('open');
                
                if (window.innerWidth <= 768 && panel.classList.contains('open')) {
                    const sidebar = document.getElementById('sidebar');
                    const overlay = document.getElementById('mobileOverlay');
                    sidebar.classList.remove('open');
                    overlay.classList.remove('active');
                }
            },

            switchTab(tabName) {
                document.querySelectorAll('.tab-nav-item').forEach(item => {
                    item.classList.remove('active');
                });
                event.target.classList.add('active');
                
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(`${tabName}-tab`).classList.add('active');
                
                this.currentTab = tabName;
                
                if (tabName === 'timeline') {
                    Timeline.init();
                }
            },

            toggleEffectsVisibility() {
                const effectsGrid = document.getElementById('effectsGrid');
                const toggleBtn = event.target.closest('.effects-toggle');
                
                this.effectsVisible = !this.effectsVisible;
                
                if (this.effectsVisible) {
                    effectsGrid.style.display = 'grid';
                    toggleBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
                } else {
                    effectsGrid.style.display = 'none';
                    toggleBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
                }
            },

            showAIProgress(text) {
                const progress = document.getElementById('aiProgress');
                const progressText = document.getElementById('progressText');
                progress.classList.add('active');
                progressText.textContent = text;
                this.updateAIProgress(0, text);
            },

            updateAIProgress(percent, text) {
                const progressFill = document.getElementById('progressFill');
                const progressText = document.getElementById('progressText');
                progressFill.style.width = percent + '%';
                if (text) progressText.textContent = text;
            },

            hideAIProgress() {
                const progress = document.getElementById('aiProgress');
                progress.classList.remove('active');
            },

            showLoading() {
                document.getElementById('loading').classList.add('active');
            },

            hideLoading() {
                document.getElementById('loading').classList.remove('active');
            },

            formatDuration(seconds) {
                const mins = Math.floor(seconds / 60);
                const secs = Math.floor(seconds % 60);
                return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            },

            drawWaveform(buffer) {
                const canvas = document.getElementById('waveformCanvas');
                const ctx = canvas.getContext('2d');
                const width = canvas.width = canvas.offsetWidth;
                const height = canvas.height = canvas.offsetHeight;
                
                ctx.clearRect(0, 0, width, height);
                
                if (!buffer) return;
                
                const data = buffer.getChannelData(0);
                const step = Math.ceil(data.length / width);
                const amp = height / 2;
                
                ctx.beginPath();
                ctx.moveTo(0, amp);
                ctx.strokeStyle = '#00ff88';
                ctx.lineWidth = 2;
                
                for (let i = 0; i < width; i++) {
                    let min = 1.0;
                    let max = -1.0;
                    
                    for (let j = 0; j < step; j++) {
                        const datum = data[(i * step) + j];
                        if (datum < min) min = datum;
                        if (datum > max) max = datum;
                    }
                    
                    ctx.lineTo(i, (1 + min) * amp);
                    ctx.lineTo(i, (1 + max) * amp);
                }
                
                ctx.stroke();
            },

            startVisualization() {
                const draw = () => {
                    if (!Transport.isPlaying) return;
                    
                    requestAnimationFrame(draw);
                    
                    AudioEngine.updateMeters();
                    
                    if (AudioEngine.currentTrack) {
                        const progress = Tone.Transport.position / Tone.Transport.loopEnd;
                        const canvas = document.getElementById('waveformCanvas');
                        const playhead = document.getElementById('playhead');
                        playhead.style.left = (progress * canvas.width) + 'px';
                    }
                };
                
                draw();
            },

            updateTimeDisplay() {
                const update = () => {
                    if (!Transport.isPlaying) return;
                    
                    const position = Tone.Transport.position;
                    const seconds = parseFloat(position);
                    document.getElementById('timeDisplay').textContent = this.formatDuration(seconds);
                    
                    requestAnimationFrame(update);
                };
                
                update();
            },

            openModal(modalId) {
                document.getElementById(modalId).classList.add('active');
            },

            closeModal(modalId) {
                document.getElementById(modalId).classList.remove('active');
            }
        };