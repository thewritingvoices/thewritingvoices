// The Refiner's Edge - Main Application Logic
class RefinersEdgeApp {
    constructor() {
        this.currentFrame = 'clear';
        this.markedSections = [];
        this.burnedMemory = [];
        this.isProcessing = false;
        this.projectData = {};
        this.autoSaveInterval = null;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadProject();
        this.setupAutoSave();
        this.setupServiceWorkerCommunication();
        this.initializeApp();
    }

    // Editorial suggestions database
    get clearFrameSuggestions() {
        return [
            "Consider shortening this sentence for better readability.",
            "The transition between paragraphs could be smoother.",
            "This dialogue tag is unnecessary - the context is clear.",
            "Watch for repetitive word usage in this section.",
            "Consider active voice for stronger impact.",
            "This paragraph would benefit from better structure.",
            "Check for consistent tense usage throughout.",
            "The subject-verb agreement needs attention here.",
            "Break up this long sentence for clarity.",
            "Consider parallel structure in this list.",
            "The pronoun reference is ambiguous here.",
            "This adverb may be redundant."
        ];
    }

    get ritualFrameSuggestions() {
        return [
            "The emotional undertone here resonates with your character's journey.",
            "This metaphor echoes the themes established in chapter two.",
            "Consider the symbolic weight of this scene's setting.",
            "The rhythm of these sentences creates beautiful cadence.",
            "This dialogue reveals deep character motivation.",
            "The imagery here evokes powerful sensory connections.",
            "Notice how this scene mirrors the protagonist's internal state.",
            "The thematic resonance between action and meaning shines here.",
            "This moment captures the essence of transformation.",
            "The voice here feels authentic and compelling.",
            "Consider the emotional arc of this passage.",
            "The subtext in this dialogue is particularly rich."
        ];
    }

    // DOM element getters
    get frameIndicator() { return document.getElementById('frameIndicator'); }
    get clearFrameBtn() { return document.getElementById('clearFrameBtn'); }
    get ritualFrameBtn() { return document.getElementById('ritualFrameBtn'); }
    get presencePassBtn() { return document.getElementById('presencePassBtn'); }
    get markSectionBtn() { return document.getElementById('markSectionBtn'); }
    get exportBtn() { return document.getElementById('exportBtn'); }
    get editorContent() { return document.getElementById('editorContent'); }
    get editorDescription() { return document.getElementById('editorDescription'); }
    get feedbackTitle() { return document.getElementById('feedbackTitle'); }
    get suggestionsContainer() { return document.getElementById('suggestionsContainer'); }
    get wordCount() { return document.getElementById('wordCount'); }
    get statusIndicator() { return document.getElementById('statusIndicator'); }
    get projectName() { return document.getElementById('projectName'); }
    get projectStatus() { return document.getElementById('projectStatus'); }
    get autoSaveStatus() { return document.getElementById('autoSaveStatus'); }

    bindEvents() {
        // Frame switching
        this.clearFrameBtn?.addEventListener('click', () => this.switchToFrame('clear'));
        this.ritualFrameBtn?.addEventListener('click', () => this.switchToFrame('ritual'));
        
        // Main actions
        this.presencePassBtn?.addEventListener('click', () => this.runPresencePass());
        this.markSectionBtn?.addEventListener('click', () => this.markSection());
        this.exportBtn?.addEventListener('click', () => this.exportProject());
        
        // Project management
        document.getElementById('saveBtn')?.addEventListener('click', () => this.saveProject());
        document.getElementById('loadBtn')?.addEventListener('click', () => this.loadProject());
        document.getElementById('downloadBtn')?.addEventListener('click', () => this.downloadProject());
        
        // Content tracking
        this.editorContent?.addEventListener('input', () => this.updateWordCount());
        this.projectName?.addEventListener('input', () => this.updateProjectStatus());
        
        // Text selection for marking
        document.addEventListener('mouseup', () => this.handleTextSelection());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // Prevent data loss
        window.addEventListener('beforeunload', (e) => this.handleBeforeUnload(e));
    }

    switchToFrame(frame) {
        this.currentFrame = frame;
        
        if (frame === 'clear') {
            this.applyClearFrameStyling();
        } else {
            this.applyRitualFrameStyling();
        }
        
        this.updateProjectData();
    }

    applyClearFrameStyling() {
        this.frameIndicator.textContent = 'Clear Frame';
        this.frameIndicator.className = 'frame-indicator px-4 py-2 rounded-lg font-medium bg-blue-100 text-blue-800 border border-blue-200';
        
        this.clearFrameBtn.className = 'frame-btn w-full px-4 py-3 rounded-lg text-left transition-all duration-200 bg-blue-500 text-white shadow-md';
        this.ritualFrameBtn.className = 'frame-btn w-full px-4 py-3 rounded-lg text-left transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-gray-200';
        
        this.editorDescription.textContent = 'Focus on technical precision and structural clarity';
        this.feedbackTitle.textContent = 'Technical Feedback';
        
        this.statusIndicator.innerHTML = '<div class="w-2 h-2 rounded-full bg-blue-400"></div><span>Clear Frame Active</span>';
        this.statusIndicator.className = 'flex items-center space-x-1 text-blue-600';
    }

    applyRitualFrameStyling() {
        this.frameIndicator.textContent = 'Editor\'s Muse';
        this.frameIndicator.className = 'frame-indicator px-4 py-2 rounded-lg font-medium bg-purple-100 text-purple-800 border border-purple-200';
        
        this.ritualFrameBtn.className = 'frame-btn w-full px-4 py-3 rounded-lg text-left transition-all duration-200 bg-purple-500 text-white shadow-md';
        this.clearFrameBtn.className = 'frame-btn w-full px-4 py-3 rounded-lg text-left transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-gray-200';
        
        this.editorDescription.textContent = 'Explore voice, rhythm, and thematic resonance';
        this.feedbackTitle.textContent = 'Creative Guidance';
        
        this.statusIndicator.innerHTML = '<div class="w-2 h-2 rounded-full bg-purple-400"></div><span>Editor\'s Muse Active</span>';
        this.statusIndicator.className = 'flex items-center space-x-1 text-purple-600';
    }

    generateSuggestions() {
        const suggestions = this.currentFrame === 'clear' ? this.clearFrameSuggestions : this.ritualFrameSuggestions;
        const content = this.editorContent.value;
        
        // Simple content-based suggestion selection
        let selectedSuggestions = suggestions.sort(() => 0.5 - Math.random()).slice(0, 4);
        
        // Add content-specific suggestions based on text analysis
        if (content.length > 100) {
            const wordCount = content.split(/\s+/).length;
            const avgSentenceLength = content.split('.').length > 1 ? wordCount / content.split('.').length : wordCount;
            
            if (this.currentFrame === 'clear') {
                if (avgSentenceLength > 25) {
                    selectedSuggestions[0] = "Consider breaking up some of these longer sentences for better readability.";
                }
                if (content.match(/\b(very|really|quite|pretty)\b/gi)?.length > 3) {
                    selectedSuggestions[1] = "Consider reducing the use of weak intensifiers like 'very' and 'really'.";
                }
            } else {
                if (content.match(/[.!?]/g)?.length > 10) {
                    selectedSuggestions[0] = "The pacing here creates an engaging rhythm that draws readers forward.";
                }
                if (content.match(/\b(felt|feel|feeling)\b/gi)?.length > 2) {
                    selectedSuggestions[1] = "The emotional landscape you're creating resonates with authentic human experience.";
                }
            }
        }
        
        this.displaySuggestions(selectedSuggestions);
    }

    displaySuggestions(suggestions) {
        this.suggestionsContainer.innerHTML = '';
        
        suggestions.forEach((suggestion, index) => {
            const suggestionDiv = document.createElement('div');
            suggestionDiv.className = `suggestion-card p-4 rounded-lg border-l-4 ${
                this.currentFrame === 'clear' 
                    ? 'bg-blue-50 border-blue-400 text-blue-800' 
                    : 'bg-purple-50 border-purple-400 text-purple-800'
            }`;
            suggestionDiv.innerHTML = `<p class="text-sm">${suggestion}</p>`;
            
            suggestionDiv.addEventListener('click', function() {
                this.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
            });
            
            this.suggestionsContainer.appendChild(suggestionDiv);
        });
    }

    runPresencePass() {
        if (this.isProcessing) return;
        
        const content = this.editorContent.value.trim();
        if (!content) {
            this.showMessage('Please add some text before running a Presence Pass.', 'warning');
            return;
        }
        
        this.isProcessing = true;
        this.presencePassBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Reading...</span>';
        this.presencePassBtn.disabled = true;
        
        this.suggestionsContainer.innerHTML = '<div class="typing-indicator text-center py-8 text-gray-500"><i class="fas fa-ellipsis-h text-2xl"></i><p class="text-sm mt-2">Analyzing your text...</p></div>';
        
        setTimeout(() => {
            this.generateSuggestions();
            this.isProcessing = false;
            this.presencePassBtn.innerHTML = '<i class="fas fa-comments"></i><span>Presence Pass</span>';
            this.presencePassBtn.disabled = false;
        }, 2000);
    }

    markSection() {
        const selection = window.getSelection().toString().trim();
        if (selection) {
            const newSection = {
                id: Date.now(),
                text: selection,
                frame: this.currentFrame,
                timestamp: new Date().toLocaleString()
            };
            
            this.markedSections.push(newSection);
            this.updateMarkedSections();
            this.updateProjectData();
            
            this.showMessage('Section marked successfully!', 'success');
            this.flashButton(this.markSectionBtn, 'success');
        } else {
            this.showMessage('Please select some text to mark.', 'warning');
        }
    }

    updateMarkedSections() {
        const container = document.getElementById('markedSectionsContainer');
        const list = document.getElementById('markedSectionsList');
        
        if (this.markedSections.length > 0) {
            container.style.display = 'block';
            list.innerHTML = '';
            
            this.markedSections.forEach((section) => {
                const sectionDiv = document.createElement('div');
                sectionDiv.className = 'p-3 bg-gray-50 rounded-lg';
                sectionDiv.innerHTML = `
                    <p class="text-sm text-gray-700 mb-2">"${section.text.substring(0, 50)}..."</p>
                    <div class="flex justify-between items-center text-xs text-gray-500">
                        <span>${section.frame} frame</span>
                        <button onclick="app.burnToMemory(${section.id})" class="text-indigo-600 hover:text-indigo-800 font-medium">
                            Burn to Memory
                        </button>
                    </div>
                `;
                list.appendChild(sectionDiv);
            });
        } else {
            container.style.display = 'none';
        }
    }

    burnToMemory(sectionId) {
        const section = this.markedSections.find(s => s.id === sectionId);
        if (section) {
            this.burnedMemory.push({...section, burned: true});
            this.updateBurnedMemory();
            this.updateProjectData();
            this.showMessage('Section burned to memory!', 'success');
        }
    }

    updateBurnedMemory() {
        const container = document.getElementById('burnedMemoryContainer');
        const list = document.getElementById('burnedMemoryList');
        
        if (this.burnedMemory.length > 0) {
            container.style.display = 'block';
            list.innerHTML = '';
            
            this.burnedMemory.forEach((item, index) => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'p-2 bg-amber-50 rounded border-l-2 border-amber-400';
                itemDiv.innerHTML = `<p class="text-xs text-amber-800">"${item.text.substring(0, 40)}..."</p>`;
                list.appendChild(itemDiv);
            });
        } else {
            container.style.display = 'none';
        }
    }

    updateWordCount() {
        const text = this.editorContent.value;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const characters = text.length;
        
        this.wordCount.innerHTML = `<span>Words: ${words}</span><span>Characters: ${characters}</span>`;
        this.updateProjectData();
    }

    updateProjectStatus() {
        this.projectStatus.textContent = `Project: ${this.projectName.value}`;
        this.updateProjectData();
    }

    updateProjectData() {
        this.projectData = {
            name: this.projectName.value,
            content: this.editorContent.value,
            markedSections: this.markedSections,
            burnedMemory: this.burnedMemory,
            currentFrame: this.currentFrame,
            lastModified: new Date().toISOString()
        };
    }

    saveProject() {
        this.updateProjectData();
        localStorage.setItem('refinersEdgeProject', JSON.stringify(this.projectData));
        
        // Also cache in service worker for offline access
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'CACHE_PROJECT',
                payload: this.projectData
            });
        }
        
        this.flashButton(document.getElementById('saveBtn'), 'success');
        this.showMessage('Project saved successfully!', 'success');
    }

    loadProject() {
        const savedProject = localStorage.getItem('refinersEdgeProject');
        if (savedProject) {
            try {
                const projectData = JSON.parse(savedProject);
                this.projectName.value = projectData.name || 'Untitled Project';
                this.editorContent.value = projectData.content || '';
                this.markedSections = projectData.markedSections || [];
                this.burnedMemory = projectData.burnedMemory || [];
                
                this.switchToFrame(projectData.currentFrame || 'clear');
                this.updateWordCount();
                this.updateProjectStatus();
                this.updateMarkedSections();
                this.updateBurnedMemory();
                
                this.showMessage('Project loaded successfully!', 'success');
            } catch (error) {
                this.showMessage('Error loading project data.', 'error');
            }
        }
    }

    downloadProject() {
        this.updateProjectData();
        const dataStr = JSON.stringify(this.projectData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.projectName.value.replace(/\s+/g, '_')}_refiners_edge.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        this.showMessage('Project downloaded successfully!', 'success');
    }

    exportProject() {
        const content = this.editorContent.value;
        if (!content.trim()) {
            this.showMessage('No content to export.', 'warning');
            return;
        }

        if (navigator.share) {
            navigator.share({
                title: this.projectName.value,
                text: content,
            }).catch(err => console.log('Error sharing:', err));
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(content).then(() => {
                this.showMessage('Content copied to clipboard!', 'success');
            }).catch(() => {
                this.showMessage('Unable to copy content.', 'error');
            });
        }
    }

    handleTextSelection() {
        const selection = window.getSelection().toString().trim();
        if (selection) {
            this.markSectionBtn.style.backgroundColor = '#f59e0b';
            this.markSectionBtn.style.boxShadow = '0 4px 8px rgba(245, 158, 11, 0.3)';
        } else {
            this.markSectionBtn.style.backgroundColor = '';
            this.markSectionBtn.style.boxShadow = '';
        }
    }

    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 's':
                    e.preventDefault();
                    this.saveProject();
                    break;
                case '1':
                    e.preventDefault();
                    this.switchToFrame('clear');
                    break;
                case '2':
                    e.preventDefault();
                    this.switchToFrame('ritual');
                    break;
                case 'Enter':
                    e.preventDefault();
                    this.runPresencePass();
                    break;
            }
        }
    }

    handleBeforeUnload(e) {
        if (this.editorContent.value.trim()) {
            this.saveProject();
        }
    }

    setupAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            if (this.editorContent.value.trim()) {
                this.saveProject();
                this.autoSaveStatus.textContent = 'Auto-saved';
                setTimeout(() => {
                    this.autoSaveStatus.textContent = 'Auto-save enabled';
                }, 2000);
            }
        }, 30000);
    }

    setupServiceWorkerCommunication() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data.type === 'SYNC_REQUEST') {
                    this.saveProject();
                }
                if (event.data.type === 'AUTO_SAVE_REQUEST') {
                    this.saveProject();
                }
            });
        }
    }

    flashButton(button, type = 'success') {
        const originalClass = button.className;
        const originalHTML = button.innerHTML;
        
        if (type === 'success') {
            button.innerHTML = '<i class="fas fa-check"></i>';
            button.className = button.className.replace(/bg-\w+-\d+/, 'bg-green-600');
        }
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.className = originalClass;
        }, 1000);
    }

    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `fixed top-4 right-4 px-4 py-2 rounded-lg text-white font-medium z-50 ${
            type === 'success' ? 'bg-green-500' : 
            type === 'warning' ? 'bg-yellow-500' : 
            type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        }`;
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    initializeApp() {
        this.switchToFrame('clear');
        this.updateWordCount();
        this.updateProjectStatus();
    }
}

// Initialize the application
let app;
document.addEventListener('DOMContentLoaded', function() {
    app = new RefinersEdgeApp();
});

// Global function for burning sections to memory (called from HTML)
window.app = app;
