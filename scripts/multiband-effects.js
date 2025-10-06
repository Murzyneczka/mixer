// ===== multiband-effects.js =====
        window.MultiBandEffects = {
            mbCompressor: null,
            dynamicEQ: null,
            crossovers: { 1: 250, 2: 4000 },
            bandParams: {
                low: { threshold: -20, ratio: 4, attack: 10, release: 100, mute: false, solo: false },
                mid: { threshold: -18, ratio: 6, attack: 5, release: 50, mute: false, solo: false },
                high: { threshold: -16, ratio: 8, attack: 3, release: 30, mute: false, solo: false }
            },
            dynamicEQParams: {
                low: { frequency: 100, gain: 0, q: 1, threshold: -20 },
                mid: { frequency: 1000, gain: 0, q: 1, threshold: -18 },
                high: { frequency: 8000, gain: 0, q: 1, threshold: -16 }
            },

            init() {
                this.createMultiBandCompressor();
                this.createDynamicEQ();
            },

            createMultiBandCompressor() {
                // Create crossover filters
                const lowMidFilter = new Tone.Filter(this.crossovers[1], 'lowpass');
                const midHighFilter = new Tone.Filter(this.crossovers[2], 'highpass');
                const midLowFilter = new Tone.Filter(this.crossovers[1], 'highpass');
                const highMidFilter = new Tone.Filter(this.crossovers[2], 'lowpass');

                // Create compressors for each band
                const lowCompressor = new Tone.Compressor(this.bandParams.low.threshold, this.bandParams.low.ratio);
                const midCompressor = new Tone.Compressor(this.bandParams.mid.threshold, this.bandParams.mid.ratio);
                const highCompressor = new Tone.Compressor(this.bandParams.high.threshold, this.bandParams.high.ratio);

                // Set attack and release
                lowCompressor.attack.value = this.bandParams.low.attack / 1000;
                lowCompressor.release.value = this.bandParams.low.release / 1000;
                midCompressor.attack.value = this.bandParams.mid.attack / 1000;
                midCompressor.release.value = this.bandParams.mid.release / 1000;
                highCompressor.attack.value = this.bandParams.high.attack / 1000;
                highCompressor.release.value = this.bandParams.high.release / 1000;

                // Create gain nodes for mute/solo
                const lowGain = new Tone.Gain(1);
                const midGain = new Tone.Gain(1);
                const highGain = new Tone.Gain(1);

                // Store references
                this.mbCompressor = {
                    lowMidFilter,
                    midHighFilter,
                    midLowFilter,
                    highMidFilter,
                    lowCompressor,
                    midCompressor,
                    highCompressor,
                    lowGain,
                    midGain,
                    highGain
                };
            },

            createDynamicEQ() {
                // Create filters for each band
                const lowFilter = new Tone.Filter(this.dynamicEQParams.low.frequency, 'peaking');
                const midFilter = new Tone.Filter(this.dynamicEQParams.mid.frequency, 'peaking');
                const highFilter = new Tone.Filter(this.dynamicEQParams.high.frequency, 'peaking');

                // Set Q and gain
                lowFilter.Q.value = this.dynamicEQParams.low.q;
                lowFilter.gain.value = this.dynamicEQParams.low.gain;
                midFilter.Q.value = this.dynamicEQParams.mid.q;
                midFilter.gain.value = this.dynamicEQParams.mid.gain;
                highFilter.Q.value = this.dynamicEQParams.high.q;
                highFilter.gain.value = this.dynamicEQParams.high.gain;

                // Create compressors for dynamic processing
                const lowComp = new Tone.Compressor(this.dynamicEQParams.low.threshold, 4);
                const midComp = new Tone.Compressor(this.dynamicEQParams.mid.threshold, 4);
                const highComp = new Tone.Compressor(this.dynamicEQParams.high.threshold, 4);

                // Store references
                this.dynamicEQ = {
                    lowFilter,
                    midFilter,
                    highFilter,
                    lowComp,
                    midComp,
                    highComp
                };
            },

            toggleCompressor(toggleElement) {
                toggleElement.classList.toggle('active');
                const isActive = toggleElement.classList.contains('active');
                
                if (AudioEngine.currentTrack) {
                    if (isActive) {
                        this.connectMultiBandCompressor(AudioEngine.currentTrack);
                    } else {
                        this.disconnectMultiBandCompressor(AudioEngine.currentTrack);
                    }
                    UI.showToast(`Multi-Band Compressor ${isActive ? 'enabled' : 'disabled'}`, 'info');
                }
            },

            toggleDynamicEQ(toggleElement) {
                toggleElement.classList.toggle('active');
                const isActive = toggleElement.classList.contains('active');
                
                if (AudioEngine.currentTrack) {
                    if (isActive) {
                        this.connectDynamicEQ(AudioEngine.currentTrack);
                    } else {
                        this.disconnectDynamicEQ(AudioEngine.currentTrack);
                    }
                    UI.showToast(`Dynamic EQ ${isActive ? 'enabled' : 'disabled'}`, 'info');
                }
            },

            connectMultiBandCompressor(track) {
                if (!this.mbCompressor) return;

                const { lowMidFilter, midHighFilter, midLowFilter, highMidFilter,
                        lowCompressor, midCompressor, highCompressor,
                        lowGain, midGain, highGain } = this.mbCompressor;

                // Disconnect existing connections
                track.eq.disconnect();
                
                // Low band path (everything below crossover 1)
                track.eq.connect(lowMidFilter);
                lowMidFilter.connect(lowCompressor);
                lowCompressor.connect(lowGain);
                
                // Mid band path (between crossover 1 and crossover 2)
                track.eq.connect(midLowFilter);
                midLowFilter.connect(highMidFilter);
                highMidFilter.connect(midCompressor);
                midCompressor.connect(midGain);
                
                // High band path (everything above crossover 2)
                track.eq.connect(midHighFilter);
                midHighFilter.connect(highCompressor);
                highCompressor.connect(highGain);
                
                // Merge bands
                lowGain.connect(track.compressor);
                midGain.connect(track.compressor);
                highGain.connect(track.compressor);
            },

            disconnectMultiBandCompressor(track) {
                if (!this.mbCompressor) return;
                
                // Disconnect all multi-band connections
                track.eq.disconnect();
                track.eq.connect(track.compressor);
            },

            connectDynamicEQ(track) {
                if (!this.dynamicEQ) return;

                const { lowFilter, midFilter, highFilter, lowComp, midComp, highComp } = this.dynamicEQ;

                // Disconnect existing connections
                track.eq.disconnect();
                
                // Connect filters in series (not parallel to avoid amplitude issues)
                // Signal flow: track.eq -> lowFilter -> midFilter -> highFilter -> compressor chain -> track.compressor
                track.eq.connect(lowFilter);
                lowFilter.connect(midFilter);
                midFilter.connect(highFilter);
                
                // For dynamic EQ, we'll use the compressors in series as well
                highFilter.connect(lowComp);
                lowComp.connect(midComp);
                midComp.connect(highComp);
                highComp.connect(track.compressor);
            },

            disconnectDynamicEQ(track) {
                if (!this.dynamicEQ) return;
                
                // Disconnect all dynamic EQ connections
                track.eq.disconnect();
                track.eq.connect(track.compressor);
            },

            setCrossover(band, frequency) {
                this.crossovers[band] = parseFloat(frequency);
                document.getElementById(`crossover${band}Value`).textContent = frequency + ' Hz';
                
                // Update filters if they exist
                if (this.mbCompressor) {
                    if (band === 1) {
                        this.mbCompressor.lowMidFilter.frequency.value = frequency;
                        this.mbCompressor.midLowFilter.frequency.value = frequency;
                    } else if (band === 2) {
                        this.mbCompressor.midHighFilter.frequency.value = frequency;
                        this.mbCompressor.highMidFilter.frequency.value = frequency;
                    }
                }
            },

            setBandParam(band, param, value) {
                this.bandParams[band][param] = parseFloat(value);
                
                if (this.mbCompressor && AudioEngine.currentTrack) {
                    const compressor = this.mbCompressor[`${band}Compressor`];
                    if (param === 'threshold') {
                        compressor.threshold.value = value;
                    } else if (param === 'ratio') {
                        compressor.ratio.value = value;
                    } else if (param === 'attack') {
                        compressor.attack.value = value / 1000;
                    } else if (param === 'release') {
                        compressor.release.value = value / 1000;
                    }
                }
            },

            setDynamicEQParam(band, param, value) {
                this.dynamicEQParams[band][param] = parseFloat(value);
                
                if (this.dynamicEQ && AudioEngine.currentTrack) {
                    const filter = this.dynamicEQ[`${band}Filter`];
                    const comp = this.dynamicEQ[`${band}Comp`];
                    
                    if (param === 'frequency') {
                        filter.frequency.value = value;
                    } else if (param === 'gain') {
                        filter.gain.value = value;
                    } else if (param === 'q') {
                        filter.Q.value = value;
                    } else if (param === 'threshold') {
                        comp.threshold.value = value;
                    }
                }
            },

            soloBand(band, button) {
                // Reset all solo states
                ['low', 'mid', 'high'].forEach(b => {
                    this.bandParams[b].solo = false;
                    document.getElementById(`${b}Solo`).classList.remove('active');
                });
                
                // Set solo for selected band
                this.bandParams[band].solo = true;
                button.classList.add('active');
                
                this.updateBandGains();
                UI.showToast(`${band.charAt(0).toUpperCase() + band.slice(1)} band soloed`, 'info');
            },

            muteBand(band, button) {
                this.bandParams[band].mute = !this.bandParams[band].mute;
                button.classList.toggle('active');
                this.updateBandGains();
                UI.showToast(`${band.charAt(0).toUpperCase() + band.slice(1)} band ${this.bandParams[band].mute ? 'muted' : 'unmuted'}`, 'info');
            },

            updateBandGains() {
                if (!this.mbCompressor) return;
                
                const hasSolo = Object.values(this.bandParams).some(p => p.solo);
                
                ['low', 'mid', 'high'].forEach(band => {
                    const gain = this.mbCompressor[`${band}Gain`];
                    if (hasSolo) {
                        gain.gain.value = this.bandParams[band].solo ? 1 : 0;
                    } else {
                        gain.gain.value = this.bandParams[band].mute ? 0 : 1;
                    }
                });
            }
        };