// Individual Guide Page Scripts

class GuideInteractions {
    constructor() {
        this.init();
    }

    init() {
        this.setupTryItSections();
        this.setupTableOfContents();
        this.setupCodeBlocks();
        this.trackProgress();
    }

    setupTryItSections() {
        const tryItSections = document.querySelectorAll('.try-it-section');
        
        tryItSections.forEach(section => {
            const textarea = section.querySelector('.prompt-input');
            const testBtn = section.querySelector('.btn-primary');
            const solutionBtn = section.querySelector('.btn-secondary');

            if (testBtn) {
                testBtn.addEventListener('click', () => {
                    this.testPrompt(textarea.value);
                });
            }

            if (solutionBtn) {
                solutionBtn.addEventListener('click', () => {
                    this.showSolution(section);
                });
            }

            // Auto-resize textarea
            if (textarea) {
                textarea.addEventListener('input', () => {
                    textarea.style.height = 'auto';
                    textarea.style.height = textarea.scrollHeight + 'px';
                });
            }
        });
    }

    testPrompt(prompt) {
        // In a real implementation, this would send to an AI API
        console.log('Testing prompt:', prompt);
        
        // Simulate feedback
        const feedback = this.analyzePrompt(prompt);
        this.showFeedback(feedback);
    }

    analyzePrompt(prompt) {
        const feedback = {
            score: 0,
            suggestions: []
        };

        // Simple analysis logic
        if (prompt.length < 20) {
            feedback.suggestions.push('Your prompt is too short. Add more detail.');
        } else {
            feedback.score += 25;
        }

        if (prompt.includes('specific') || prompt.includes('exactly')) {
            feedback.score += 25;
        } else {
            feedback.suggestions.push('Be more specific about what you want.');
        }

        if (prompt.match(/\d+\s*(words?|sentences?|paragraphs?)/i)) {
            feedback.score += 25;
        } else {
            feedback.suggestions.push('Consider specifying the desired length.');
        }

        if (prompt.includes('example') || prompt.includes('format')) {
            feedback.score += 25;
        } else {
            feedback.suggestions.push('Provide examples or specify the format you want.');
        }

        return feedback;
    }

    showFeedback(feedback) {
        const modal = document.createElement('div');
        modal.className = 'feedback-modal';
        modal.innerHTML = `
            <div class="feedback-content">
                <h3>Prompt Analysis</h3>
                <div class="feedback-score">Score: ${feedback.score}/100</div>
                <div class="feedback-suggestions">
                    ${feedback.suggestions.length ? 
                        '<h4>Suggestions:</h4><ul>' + 
                        feedback.suggestions.map(s => `<li>${s}</li>`).join('') + 
                        '</ul>' : 
                        '<p>Great job! Your prompt follows best practices.</p>'
                    }
                </div>
                <button class="btn btn-primary" onclick="this.parentElement.parentElement.remove()">Close</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Style the modal
        const style = document.createElement('style');
        style.textContent = `
            .feedback-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }
            .feedback-content {
                background: var(--guide-card-bg);
                padding: 2rem;
                border-radius: 8px;
                max-width: 500px;
                width: 90%;
            }
            .feedback-score {
                font-size: 1.5rem;
                color: var(--guide-primary);
                margin: 1rem 0;
            }
            .feedback-suggestions ul {
                margin: 1rem 0;
                padding-left: 1.5rem;
            }
        `;
        document.head.appendChild(style);
    }

    showSolution(section) {
        const solutionText = section.getAttribute('data-solution') || 
            `Context: I'm a marketing manager at a B2B SaaS company
Role: Act as a professional LinkedIn content strategist
Task: Write a LinkedIn post about launching our new AI-powered analytics feature
Format: 
- Opening hook (1 sentence)
- Problem we solved (2-3 sentences)
- Solution highlight (2-3 sentences)  
- Call to action
Length: 150-200 words
Tone: Professional but enthusiastic, avoiding jargon
Include: Relevant emoji and 3-5 hashtags`;

        const textarea = section.querySelector('.prompt-input');
        if (textarea) {
            textarea.value = solutionText;
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
            
            // Highlight the solution
            textarea.style.backgroundColor = 'rgba(40, 167, 69, 0.1)';
            setTimeout(() => {
                textarea.style.backgroundColor = '';
            }, 2000);
        }
    }

    setupTableOfContents() {
        const tocLinks = document.querySelectorAll('.guide-toc a');
        const sections = document.querySelectorAll('.guide-content h2');
        
        // Smooth scrolling
        tocLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // Highlight current section
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -70% 0px',
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    tocLinks.forEach(link => {
                        link.classList.toggle('active', 
                            link.getAttribute('href') === `#${id}`);
                    });
                }
            });
        }, observerOptions);

        sections.forEach(section => observer.observe(section));
    }

    setupCodeBlocks() {
        const codeBlocks = document.querySelectorAll('.code-block, .bp-gem-example');
        
        codeBlocks.forEach(block => {
            // Add copy button
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
            copyBtn.style.cssText = `
                position: absolute;
                top: 0.5rem;
                right: 0.5rem;
                padding: 0.25rem 0.5rem;
                background: var(--guide-primary);
                color: white;
                border: none;
                border-radius: 4px;
                font-size: 0.75rem;
                cursor: pointer;
                opacity: 0;
                transition: opacity 0.2s;
            `;

            block.style.position = 'relative';
            block.appendChild(copyBtn);

            block.addEventListener('mouseenter', () => {
                copyBtn.style.opacity = '1';
            });

            block.addEventListener('mouseleave', () => {
                copyBtn.style.opacity = '0';
            });

            copyBtn.addEventListener('click', () => {
                const text = block.textContent.replace('Copy', '').trim();
                navigator.clipboard.writeText(text).then(() => {
                    copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    setTimeout(() => {
                        copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
                    }, 2000);
                });
            });
        });
    }

    trackProgress() {
        // Track reading progress
        const content = document.querySelector('.guide-content');
        const progressBar = document.createElement('div');
        progressBar.className = 'reading-progress';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            height: 3px;
            background: var(--guide-primary);
            transition: width 0.2s;
            z-index: 1000;
        `;
        document.body.appendChild(progressBar);

        window.addEventListener('scroll', () => {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollTop = window.scrollY;
            const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
            progressBar.style.width = `${progress}%`;
        });

        // Save progress to localStorage
        const guideId = window.location.pathname.split('/').pop().replace('.html', '');
        const savedProgress = localStorage.getItem(`guide-progress-${guideId}`) || 0;
        
        if (savedProgress > 10) {
            const resumeBtn = document.createElement('button');
            resumeBtn.className = 'resume-reading';
            resumeBtn.textContent = 'Resume where you left off';
            resumeBtn.style.cssText = `
                position: fixed;
                bottom: 2rem;
                right: 2rem;
                padding: 0.75rem 1.5rem;
                background: var(--guide-primary);
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                z-index: 100;
            `;
            
            document.body.appendChild(resumeBtn);
            
            resumeBtn.addEventListener('click', () => {
                window.scrollTo({
                    top: (savedProgress / 100) * (document.documentElement.scrollHeight - window.innerHeight),
                    behavior: 'smooth'
                });
                resumeBtn.remove();
            });

            // Auto-hide after 5 seconds
            setTimeout(() => resumeBtn.remove(), 5000);
        }

        // Save progress on scroll
        let saveTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                const progress = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
                localStorage.setItem(`guide-progress-${guideId}`, progress);
            }, 1000);
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new GuideInteractions();
});