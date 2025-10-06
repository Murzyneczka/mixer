// ===== project-manager.js =====
        const ProjectManager = {
            newProject() {
                if (confirm('Create a new project? All unsaved changes will be lost.')) {
                    if (RecordingManager.isRecording) {
                        RecordingManager.cancelRecording();
                    }
                    
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
                    Transport.stop();
                    UI.showToast('New project created', 'info');
                }
            },

            saveProject() {
                const projectData = {
                    version: '1.0',
                    name: 'Audio Mixer Project',
                    timestamp: new Date().toISOString(),
                    tracks: AudioEngine.tracks.map(track => ({
                        id: track.id,
                        name: track.name,
                        volume: track.volumeValue,
                        pan: track.pan.pan.value,
                        muted: track.isMuted,
                        soloed: track.isSoloed,
                        effects: {
                            eq: {
                                low: track.eq.low.value,
                                mid: track.eq.mid.value,
                                high: track.eq.high.value
                            },
                            reverb: {
                                roomSize: track.reverb.roomSize.value,
                                wet: track.reverb.wet.value
                            },
                            delay: {
                                time: track.delay.delayTime.value * 1000,
                                feedback: track.delay.feedback.value,
                                wet: track.delay.wet.value
                            },
                            compressor: {
                                threshold: track.compressor.threshold.value,
                                ratio: track.compressor.ratio.value
                            },
                            distortion: {
                                amount: track.distortion.distortion
                            },
                            chorus: {
                                rate: track.chorus.frequency.value,
                                depth: track.chorus.depth.value,
                                wet: track.chorus.wet.value
                            }
                        }
                    })),
                    masterVolume: AudioEngine.masterVolume.volume.value,
                    transport: {
                        isLooping: Transport.isLooping,
                        loopStart: Transport.loopStart,
                        loopEnd: Transport.loopEnd
                    }
                };
                
                const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `audio-mixer-project-${Date.now()}.json`;
                a.click();
                
                UI.showToast('Project saved!', 'success');
            },

            async loadProject(projectData) {
                UI.showToast('Load project feature coming soon!', 'info');
            }
        };