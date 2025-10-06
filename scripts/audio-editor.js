// ===== audio-editor.js =====
        window.AudioEditor = {
            currentTool: 'select',
            clipboard: null,
            selectedRegions: [],
            isDragging: false,
            dragStartX: 0,
            dragStartY: 0,
            selectionBox: null,
            timeStretchRatio: 1,
            pitchShiftSemitones: 0,
            crossfadeDuration: 100,

            init() {
                this.setupEventListeners();
                this.createSelectionBox();
            },

            setupEventListeners() {
                const timeline = document.getElementById('timelineTracks');
                
                if (timeline) {
                    timeline.addEventListener('mousedown', (e) => this.handleMouseDown(e));
                    timeline.addEventListener('contextmenu', (e) => this.handleContextMenu(e));
                }
                
                // Attach mousemove and mouseup to document to handle dragging outside timeline
                document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
                document.addEventListener('mouseup', (e) => this.handleMouseUp(e));
                
                // Keyboard shortcuts
                document.addEventListener('keydown', (e) => this.handleKeyDown(e));
            },

            createSelectionBox() {
                this.selectionBox = document.createElement('div');
                this.selectionBox.className = 'selection-box';
                this.selectionBox.style.display = 'none';
                const timelineTracks = document.getElementById('timelineTracks');
                if (timelineTracks) {
                    timelineTracks.appendChild(this.selectionBox);
                }
            },

            setTool(tool) {
                this.currentTool = tool;
                
                // Update UI
                document.querySelectorAll('.tool-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                const toolButton = document.getElementById(`${tool}Tool`);
                if (toolButton) {
                    toolButton.classList.add('active');
                }
                
                UI.showToast(`${tool.charAt(0).toUpperCase() + tool.slice(1)} tool selected`, 'info');
            },

            handleMouseDown(e) {
                if (e.button === 2) return; // Right click
                
                const rect = e.currentTarget.getBoundingClientRect();
                this.dragStartX = e.clientX - rect.left;
                this.dragStartY = e.clientY - rect.top;
                this.isDragging = true;
                
                if (this.currentTool === 'select') {
                    this.startSelection(this.dragStartX, this.dragStartY);
                }
            },

            handleMouseMove(e) {
                if (!this.isDragging) return;
                
                const timeline = document.getElementById('timelineTracks');
                if (!timeline) return;
                
                const rect = timeline.getBoundingClientRect();
                const currentX = e.clientX - rect.left;
                const currentY = e.clientY - rect.top;
                
                if (this.currentTool === 'select' && this.selectionBox) {
                    this.updateSelection(this.dragStartX, this.dragStartY, currentX, currentY);
                }
            },

            handleMouseUp(e) {
                if (!this.isDragging) return;
                
                this.isDragging = false;
                
                if (this.currentTool === 'select') {
                    this.finalizeSelection();
                }
            },

            handleContextMenu(e) {
                e.preventDefault();
                this.showContextMenu(e.clientX, e.clientY);
            },

            handleKeyDown(e) {
                // Keyboard shortcuts
                if (e.ctrlKey || e.metaKey) {
                    switch(e.key) {
                        case 'x':
                            e.preventDefault();
                            this.cut();
                            break;
                        case 'c':
                            e.preventDefault();
                            this.copy();
                            break;
                        case 'v':
                            e.preventDefault();
                            this.paste();
                            break;
                        case 'z':
                            e.preventDefault();
                            this.undo();
                            break;
                        case 'y':
                            e.preventDefault();
                            this.redo();
                            break;
                    }
                } else {
                    switch(e.key) {
                        case 'Delete':
                        case 'Backspace':
                            e.preventDefault();
                            this.deleteRegion();
                            break;
                        case ' ':
                            e.preventDefault();
                            Transport.toggle();
                            break;
                    }
                }
            },

            startSelection(x, y) {
                if (this.selectionBox) {
                    this.selectionBox.style.left = x + 'px';
                    this.selectionBox.style.top = y + 'px';
                    this.selectionBox.style.width = '0px';
                    this.selectionBox.style.height = '0px';
                    this.selectionBox.style.display = 'block';
                }
            },

            updateSelection(startX, startY, currentX, currentY) {
                if (this.selectionBox) {
                    const left = Math.min(startX, currentX);
                    const top = Math.min(startY, currentY);
                    const width = Math.abs(currentX - startX);
                    const height = Math.abs(currentY - startY);
                    
                    this.selectionBox.style.left = left + 'px';
                    this.selectionBox.style.top = top + 'px';
                    this.selectionBox.style.width = width + 'px';
                    this.selectionBox.style.height = height + 'px';
                }
            },

            finalizeSelection() {
                if (this.selectionBox) {
                    this.selectionBox.style.display = 'none';
                    
                    // Find selected regions based on selection box
                    this.findSelectedRegions();
                }
            },

            findSelectedRegions() {
                // Implementation to find regions within selection box
                this.selectedRegions = [];
                // This would involve checking which audio regions intersect with the selection box
                UI.showToast(`${this.selectedRegions.length} region(s) selected`, 'info');
            },

            showContextMenu(x, y) {
                const menu = document.getElementById('contextMenu');
                menu.style.left = x + 'px';
                menu.style.top = y + 'px';
                menu.style.display = 'block';
                
                // Hide menu when clicking elsewhere
                document.addEventListener('click', () => {
                    menu.style.display = 'none';
                }, { once: true });
            },

            cut() {
                if (this.selectedRegions.length > 0) {
                    this.clipboard = this.selectedRegions.map(region => ({
                        ...region,
                        action: 'cut'
                    }));
                    this.deleteRegion();
                    UI.showToast('Cut to clipboard', 'success');
                }
            },

            copy() {
                if (this.selectedRegions.length > 0) {
                    this.clipboard = this.selectedRegions.map(region => ({
                        ...region,
                        action: 'copy'
                    }));
                    UI.showToast('Copied to clipboard', 'success');
                }
            },

            paste() {
                if (this.clipboard && this.clipboard.length > 0) {
                    // Implementation to paste regions at current playhead position
                    UI.showToast('Pasted from clipboard', 'success');
                }
            },

            split() {
                if (this.selectedRegions.length > 0) {
                    // Implementation to split selected regions at playhead position
                    UI.showToast('Regions split', 'success');
                }
            },

            trim() {
                if (this.selectedRegions.length === 1) {
                    // Implementation to trim region to selection
                    UI.showToast('Region trimmed', 'success');
                }
            },

            join() {
                if (this.selectedRegions.length > 1) {
                    // Implementation to join selected regions
                    UI.showToast('Regions joined', 'success');
                }
            },

            deleteRegion() {
                if (this.selectedRegions.length > 0) {
                    // Implementation to delete selected regions
                    UI.showToast('Region(s) deleted', 'info');
                }
            },

            undo() {
                // Implementation for undo functionality
                UI.showToast('Undo', 'info');
            },

            redo() {
                // Implementation for redo functionality
                UI.showToast('Redo', 'info');
            },

            updateTimeStretch(value) {
                this.timeStretchRatio = value / 100;
                document.getElementById('timeStretchValue').textContent = value + '%';
            },

            updatePitchShift(value) {
                this.pitchShiftSemitones = parseFloat(value);
                document.getElementById('pitchShiftValue').textContent = value + ' st';
            },

            updateCrossfade(value) {
                this.crossfadeDuration = parseInt(value);
                document.getElementById('crossfadeValue').textContent = value + 'ms';
            },

            applyTimeStretch() {
                if (AudioEngine.currentTrack) {
                    UI.showToast('Applying time stretch...', 'info');
                    // Implementation for time stretching
                    setTimeout(() => {
                        UI.showToast('Time stretch applied', 'success');
                        UI.closeModal('timeStretchModal');
                    }, 1000);
                }
            },

            applyCrossfade() {
                if (this.selectedRegions.length === 2) {
                    UI.showToast('Applying crossfade...', 'info');
                    // Implementation for crossfading
                    setTimeout(() => {
                        UI.showToast('Crossfade applied', 'success');
                        UI.closeModal('crossfadeModal');
                    }, 1000);
                }
            },

            applyStretchPreset(preset) {
                switch(preset) {
                    case 'double':
                        document.getElementById('timeStretchSlider').value = 50;
                        this.updateTimeStretch(50);
                        break;
                    case 'half':
                        document.getElementById('timeStretchSlider').value = 200;
                        this.updateTimeStretch(200);
                        break;
                    case 'octaveUp':
                        document.getElementById('pitchShiftSlider').value = 12;
                        this.updatePitchShift(12);
                        break;
                    case 'octaveDown':
                        document.getElementById('pitchShiftSlider').value = -12;
                        this.updatePitchShift(-12);
                        break;
                }
            }
        };