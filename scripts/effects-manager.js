// ===== effects-manager.js =====
        const EffectsManager = {
            effects: [
                {
                    name: 'Reverb',
                    id: 'reverb',
                    controls: [
                        { label: 'Room Size', param: 'roomSize', min: 0, max: 100, value: 30 },
                        { label: 'Wet Level', param: 'wet', min: 0, max: 100, value: 30 }
                    ]
                },
                {
                    name: 'Delay',
                    id: 'delay',
                    controls: [
                        { label: 'Time (ms)', param: 'time', min: 0, max: 1000, value: 250 },
                        { label: 'Feedback', param: 'feedback', min: 0, max: 95, value: 40 },
                        { label: 'Mix', param: 'wet', min: 0, max: 100, value: 30 }
                    ]
                },
                {
                    name: 'Distortion',
                    id: 'distortion',
                    controls: [
                        { label: 'Amount', param: 'amount', min: 0, max: 100, value: 0 }
                    ]
                },
                {
                    name: 'Chorus',
                    id: 'chorus',
                    controls: [
                        { label: 'Rate', param: 'rate', min: 0.1, max: 10, value: 4 },
                        { label: 'Depth', param: 'depth', min: 0, max: 10, value: 2.5 },
                        { label: 'Mix', param: 'wet', min: 0, max: 100, value: 50 }
                    ]
                }
            ],

            render() {
                const effectsGrid = document.getElementById('effectsGrid');
                effectsGrid.innerHTML = '';

                this.effects.forEach(effect => {
                    const effectCard = document.createElement('div');
                    effectCard.className = 'effect-card';
                    
                    let controlsHTML = '';
                    effect.controls.forEach(control => {
                        controlsHTML += `
                            <div class="effect-control">
                                <div class="effect-label">
                                    <span>${control.label}</span>
                                    <span class="effect-value">${control.value}</span>
                                </div>
                                <input type="range" class="slider" 
                                    min="${control.min}" 
                                    max="${control.max}" 
                                    value="${control.value}" 
                                    oninput="EffectsManager.updateEffect('${effect.id}', '${control.param}', this.value, this)">
                            </div>
                        `;
                    });

                    effectCard.innerHTML = `
                        <div class="effect-header">
                            <span class="effect-name">${effect.name}</span>
                            <div class="effect-toggle" onclick="EffectsManager.toggleEffect('${effect.id}', this)"></div>
                        </div>
                        ${controlsHTML}
                    `;
                    
                    effectsGrid.appendChild(effectCard);
                });
            },

            toggleEffect(effectId, toggleElement) {
                toggleElement.classList.toggle('active');
                
                if (AudioEngine.currentTrack) {
                    AudioEngine.currentTrack.toggleEffect(effectId, toggleElement.classList.contains('active'));
                    UI.showToast(`${effectId.charAt(0).toUpperCase() + effectId.slice(1)} ${toggleElement.classList.contains('active') ? 'enabled' : 'disabled'}`, 'info');
                }
            },

            updateEffect(effectId, parameter, value, sliderElement) {
                if (AudioEngine.currentTrack) {
                    AudioEngine.currentTrack.setEffect(effectId, parameter, parseFloat(value));
                    
                    const valueDisplay = sliderElement.parentElement.querySelector('.effect-value');
                    if (valueDisplay) {
                        valueDisplay.textContent = value;
                    }
                }
            }
        };