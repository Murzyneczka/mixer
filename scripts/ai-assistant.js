// ===== ai-assistant.js =====
        window.AIAssistant = {
            async autoMix() {
                UI.showAIProgress('Analyzing tracks...');
                
                setTimeout(() => {
                    UI.updateAIProgress(25, 'Balancing levels...');
                    setTimeout(() => {
                        UI.updateAIProgress(50, 'Applying EQ...');
                        setTimeout(() => {
                            UI.updateAIProgress(75, 'Adding effects...');
                            setTimeout(() => {
                                UI.updateAIProgress(100, 'Mix complete!');
                                setTimeout(() => {
                                    UI.hideAIProgress();
                                    UI.showToast('Auto-mix applied successfully!', 'success');
                                    
                                    AudioEngine.tracks.forEach((track, index) => {
                                        const targetVolume = 0.6 + (Math.random() * 0.3);
                                        track.setVolume(targetVolume);
                                        
                                        const panValue = (index - AudioEngine.tracks.length / 2) / (AudioEngine.tracks.length / 2) * 0.3;
                                        track.setPan(panValue);
                                        
                                        track.setEffect('eq', 'low', -2);
                                        track.setEffect('eq', 'mid', 1);
                                        track.setEffect('eq', 'high', 2);
                                        
                                        track.setEffect('reverb', 'wet', 15);
                                    });
                                    
                                    AudioEngine.tracks.forEach(track => {
                                        track.setEffect('compressor', 'threshold', -24);
                                        track.setEffect('compressor', 'ratio', 4);
                                    });
                                }, 1000);
                            }, 1000);
                        }, 1000);
                    }, 1000);
                }, 1000);
            },

            async masterTrack() {
                UI.showAIProgress('Mastering track...');
                
                setTimeout(() => {
                    UI.updateAIProgress(50, 'Optimizing loudness...');
                    setTimeout(() => {
                        UI.updateAIProgress(100, 'Mastering complete!');
                        setTimeout(() => {
                            UI.hideAIProgress();
                            UI.showToast('Track mastered successfully!', 'success');
                            
                            AudioEngine.tracks.forEach(track => {
                                track.setEffect('eq', 'low', 1);
                                track.setEffect('eq', 'high', 3);
                                
                                track.setEffect('compressor', 'threshold', -18);
                                track.setEffect('compressor', 'ratio', 3);
                                
                                track.setEffect('distortion', 'amount', 5);
                            });
                            
                            AudioEngine.setMasterVolume(85);
                        }, 1000);
                    }, 1500);
                }, 1000);
            },

            async removeNoise() {
                UI.showAIProgress('Removing noise...');
                
                setTimeout(() => {
                    UI.updateAIProgress(100, 'Noise reduction complete!');
                    setTimeout(() => {
                        UI.hideAIProgress();
                        UI.showToast('Noise reduction applied!', 'success');
                        
                        AudioEngine.tracks.forEach(track => {
                            track.setEffect('eq', 'low', -4);
                            track.setEffect('eq', 'high', -2);
                            
                            track.setEffect('compressor', 'threshold', -35);
                            track.setEffect('compressor', 'ratio', 8);
                        });
                    }, 1000);
                }, 2000);
            },

            async vocalEnhance() {
                UI.showAIProgress('Enhancing vocals...');
                
                setTimeout(() => {
                    UI.updateAIProgress(100, 'Vocal enhancement complete!');
                    setTimeout(() => {
                        UI.hideAIProgress();
                        UI.showToast('Vocals enhanced!', 'success');
                        
                        if (AudioEngine.currentTrack) {
                            AudioEngine.currentTrack.setEffect('eq', 'low', -3);
                            AudioEngine.currentTrack.setEffect('eq', 'mid', 4);
                            AudioEngine.currentTrack.setEffect('eq', 'high', 6);
                            
                            AudioEngine.currentTrack.setEffect('distortion', 'amount', 8);
                            
                            AudioEngine.currentTrack.setEffect('compressor', 'threshold', -20);
                            AudioEngine.currentTrack.setEffect('compressor', 'ratio', 4);
                        }
                    }, 1000);
                }, 1500);
            },

            async bassBoost() {
                UI.showAIProgress('Boosting bass...');
                
                setTimeout(() => {
                    UI.updateAIProgress(100, 'Bass boost complete!');
                    setTimeout(() => {
                        UI.hideAIProgress();
                        UI.showToast('Bass boosted!', 'success');
                        
                        AudioEngine.tracks.forEach(track => {
                            track.setEffect('eq', 'low', 8);
                            track.setEffect('eq', 'mid', -1);
                            
                            track.setEffect('distortion', 'amount', 12);
                        });
                    }, 1000);
                }, 1000);
            },

            async stereoWidth() {
                UI.showAIProgress('Enhancing stereo...');
                
                setTimeout(() => {
                    UI.updateAIProgress(100, 'Stereo enhancement complete!');
                    setTimeout(() => {
                        UI.hideAIProgress();
                        UI.showToast('Stereo width enhanced!', 'success');
                        
                        AudioEngine.tracks.forEach((track, index) => {
                            const panValue = (Math.random() - 0.5) * 0.8;
                            track.setPan(panValue);
                            
                            track.setEffect('chorus', 'rate', 2);
                            track.setEffect('chorus', 'depth', 3);
                            track.setEffect('chorus', 'wet', 25);
                        });
                    }, 1000);
                }, 1500);
            },

            async applyPreset(preset) {
                UI.showAIProgress(`Applying ${preset} preset...`);
                
                setTimeout(() => {
                    UI.updateAIProgress(100, `${preset.charAt(0).toUpperCase() + preset.slice(1)} preset applied!`);
                    setTimeout(() => {
                        UI.hideAIProgress();
                        UI.showToast(`${preset.charAt(0).toUpperCase() + preset.slice(1)} preset applied!`, 'success');
                        
                        AudioEngine.tracks.forEach(track => {
                            switch(preset) {
                                case 'pop':
                                    track.setEffect('eq', 'low', 3);
                                    track.setEffect('eq', 'mid', 2);
                                    track.setEffect('eq', 'high', 5);
                                    track.setEffect('reverb', 'wet', 20);
                                    track.setEffect('compressor', 'threshold', -24);
                                    track.setEffect('compressor', 'ratio', 4);
                                    break;
                                case 'rock':
                                    track.setEffect('eq', 'low', 6);
                                    track.setEffect('eq', 'mid', -1);
                                    track.setEffect('eq', 'high', 4);
                                    track.setEffect('distortion', 'amount', 15);
                                    track.setEffect('compressor', 'threshold', -18);
                                    track.setEffect('compressor', 'ratio', 6);
                                    break;
                                case 'electronic':
                                    track.setEffect('eq', 'low', 8);
                                    track.setEffect('eq', 'mid', 0);
                                    track.setEffect('eq', 'high', 8);
                                    track.setEffect('delay', 'time', 125);
                                    track.setEffect('delay', 'wet', 20);
                                    track.setEffect('reverb', 'wet', 25);
                                    break;
                            }
                        });
                    }, 1000);
                }, 1500);
            }
        };