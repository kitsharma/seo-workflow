/**
 * SEO User Guidance System
 * Path: /static/js/seo-user-guidance.js
 * Purpose: Provide contextual help, tooltips, and educational content for SEO professionals
 * 
 * Security features:
 * - Content sanitization for all dynamic content
 * - Strict CSP-compatible implementation (no eval or inline scripts)
 * - XSS prevention for all user-facing content
 */

/**
 * SEO Guidance System
 * Provides contextual help and educational content throughout the application
 */
class SEOGuidanceSystem {
    /**
     * Initialize the guidance system
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        // Default settings
        this.settings = {
            enableTooltips: options.enableTooltips !== false,
            enableTutorials: options.enableTutorials !== false,
            enableContextualHelp: options.enableContextualHelp !== false,
            expertMode: options.expertMode || false,
            language: options.language || 'en',
            showOnFirstVisit: options.showOnFirstVisit !== false,
            autoHideDelay: options.autoHideDelay || 8000,
            ...options
        };
        
        // Guidance content
        this.guidanceContent = {};
        
        // Tutorial steps
        this.tutorials = {};
        
        // Active tutorial
        this.activeTutorial = null;
        this.currentStep = 0;
        
        // Track whether this is first visit
        this.isFirstVisit = this.checkIfFirstVisit();
        
        // Initialize content
        this.initializeContent();
        
        // Storage for listener references
        this.eventListeners = {};
    }
    
    /**
     * Initialize the guidance system
     */
    initialize() {
        try {
            // Check if the guidance system is disabled
            if (this.isDisabled()) {
                console.log('SEO Guidance System is disabled by user preferences');
                return;
            }
            
            // Create UI elements
            this.createUIElements();
            
            // Attach event listeners
            this.attachEventListeners();
            
            // Initialize tooltips
            if (this.settings.enableTooltips) {
                this.initializeTooltips();
            }
            
            // Show welcome tutorial on first visit
            if (this.settings.showOnFirstVisit && this.isFirstVisit) {
                this.showWelcomeTutorial();
                this.markFirstVisitComplete();
            }
            
            console.log('SEO Guidance System initialized successfully');
        } catch (error) {
            console.error('Error initializing SEO Guidance System:', error);
            // Fail gracefully - the app should continue working without guidance
        }
    }
    
    /**
     * Check if the guidance system is disabled by user preferences
     * @returns {boolean} True if the guidance system is disabled
     */
    isDisabled() {
        try {
            const userPreferences = this.loadUserPreferences();
            return userPreferences.disableGuidance === true;
        } catch (error) {
            console.warn('Could not check if guidance system is disabled:', error);
            return false;
        }
    }
    
    /**
     * Initialize guidance content
     */
    initializeContent() {
        // Load content based on language setting
        this.guidanceContent = this.loadGuidanceContent(this.settings.language);
        this.tutorials = this.loadTutorials(this.settings.language);
    }
    
    /**
     * Load guidance content for the specified language
     * @param {string} language - The language code
     * @returns {Object} The guidance content
     */
    loadGuidanceContent(language) {
        // This would typically load from a server or a larger embedded JSON object
        // For simplicity, we'll include basic content directly
        
        const baseContent = {
            metrics: {
                technical_seo: {
                    title: 'Technical SEO',
                    description: 'Measures how well your site can be crawled and indexed by search engines.',
                    learnMoreUrl: 'https://moz.com/learn/seo/technical-seo'
                },
                content_quality: {
                    title: 'Content Quality',
                    description: 'Evaluates how well your content meets user needs and search intent.',
                    learnMoreUrl: 'https://moz.com/learn/seo/on-page-factors'
                },
                keyword_strategy: {
                    title: 'Keyword Strategy',
                    description: 'Assesses your targeting of valuable, relevant keywords for your audience.',
                    learnMoreUrl: 'https://moz.com/learn/seo/what-is-keyword-research'
                },
                user_experience: {
                    title: 'User Experience',
                    description: 'Measures how well your site serves visitors through usability and design.',
                    learnMoreUrl: 'https://developers.google.com/search/docs/fundamentals/core-web-vitals'
                },
                mobile_optimization: {
                    title: 'Mobile Optimization',
                    description: 'Evaluates how well your site performs on mobile devices.',
                    learnMoreUrl: 'https://developers.google.com/search/mobile-sites'
                }
            },
            recommendations: {
                high_priority: {
                    title: 'High Priority',
                    description: 'These issues have significant impact on your SEO performance and should be addressed first.',
                    icon: 'priority_high'
                },
                medium_priority: {
                    title: 'Medium Priority',
                    description: 'These issues have moderate impact and should be addressed after high-priority items.',
                    icon: 'priority_medium'
                },
                low_priority: {
                    title: 'Low Priority',
                    description: 'These issues have minimal impact but still represent opportunities for improvement.',
                    icon: 'priority_low'
                }
            },
            categories: {
                technical: {
                    title: 'Technical Issues',
                    description: 'Problems affecting how search engines access, crawl, and index your site.',
                    examples: ['Broken links', 'Slow page speed', 'XML sitemap errors']
                },
                content: {
                    title: 'Content Issues',
                    description: 'Problems with your content quality, relevance, or structure.',
                    examples: ['Thin content', 'Duplicate content', 'Missing headers']
                },
                keywords: {
                    title: 'Keyword Issues',
                    description: 'Problems with your keyword targeting and usage.',
                    examples: ['Missing target keywords', 'Keyword cannibalization', 'Inadequate keyword coverage']
                },
                onpage: {
                    title: 'On-Page Issues',
                    description: 'Problems with on-page SEO elements.',
                    examples: ['Missing meta descriptions', 'Poor title tags', 'Non-optimized URLs']
                },
                offpage: {
                    title: 'Off-Page Issues',
                    description: 'Problems with external factors affecting your site authority.',
                    examples: ['Low-quality backlinks', 'Missing local citations', 'Poor social signals']
                }
            },
            glossary: {
                seo: {
                    term: 'SEO',
                    definition: 'Search Engine Optimization: The practice of optimizing a website to improve its visibility in search engine results.'
                },
                serp: {
                    term: 'SERP',
                    definition: 'Search Engine Results Page: The page displayed by search engines in response to a query.'
                },
                backlink: {
                    term: 'Backlink',
                    definition: 'A link from another website to your website. Quality backlinks are a key ranking factor.'
                },
                ctr: {
                    term: 'CTR',
                    definition: 'Click-Through Rate: The percentage of people who click on your search result out of the total who view it.'
                },
                crawlability: {
                    term: 'Crawlability',
                    definition: 'How easily search engine bots can access and crawl content on your website.'
                },
                canonical: {
                    term: 'Canonical Tag',
                    definition: 'An HTML element that helps prevent duplicate content by specifying the "canonical" or "preferred" version of a webpage.'
                },
                schema: {
                    term: 'Schema Markup',
                    definition: 'Structured data vocabulary that helps search engines understand the content and context of webpages.'
                }
            }
        };
        
        // Language-specific adjustments could be made here
        if (language === 'es') {
            // Spanish content would go here
        }
        
        return baseContent;
    }
    
    /**
     * Load tutorials for the specified language
     * @param {string} language - The language code
     * @returns {Object} The tutorials
     */
    loadTutorials(language) {
        // This would typically load from a server or a larger embedded JSON object
        
        const tutorials = {
            welcome: {
                title: 'Welcome to achievewith.ai',
                steps: [
                    {
                        title: 'Welcome to achievewith.ai',
                        content: 'This tool helps you analyze and improve your website\'s SEO. Let\'s take a quick tour!',
                        target: 'body',
                        position: 'center'
                    },
                    {
                        title: 'Dashboard Overview',
                        content: 'The dashboard shows your key metrics and recent analyses at a glance.',
                        target: '.dashboard-overview',
                        position: 'bottom'
                    },
                    {
                        title: 'Performance Metrics',
                        content: 'These metrics show how your site performs across different SEO categories.',
                        target: '.performance-metrics',
                        position: 'right'
                    },
                    {
                        title: 'Recommendations',
                        content: 'Here you\'ll find actionable recommendations to improve your SEO, sorted by priority.',
                        target: '.recommendations-panel',
                        position: 'left'
                    },
                    {
                        title: 'Ready to go!',
                        content: 'That\'s it for the basics! You can start a new analysis or explore your existing results.',
                        target: 'body',
                        position: 'center'
                    }
                ]
            },
            results_analysis: {
                title: 'Understanding Your Results',
                steps: [
                    {
                        title: 'Analysis Results Overview',
                        content: 'Let\'s explore your SEO analysis results and understand what they mean.',
                        target: 'body',
                        position: 'center'
                    },
                    {
                        title: 'Executive Summary',
                        content: 'This section provides an overview of the analysis with key findings and metrics.',
                        target: '.executive-summary',
                        position: 'bottom'
                    },
                    {
                        title: 'Performance Metrics',
                        content: 'These charts show your performance across different SEO categories.',
                        target: '.performance-chart',
                        position: 'right'
                    },
                    {
                        title: 'Detailed Recommendations',
                        content: 'Here you\'ll find specific actions to take, sorted by priority and impact.',
                        target: '.recommendations-tab',
                        position: 'left'
                    },
                    {
                        title: 'Implementation Plan',
                        content: 'This tab provides a structured plan to implement the recommendations efficiently.',
                        target: '.quick-actions-tab',
                        position: 'bottom'
                    },
                    {
                        title: 'Exporting Options',
                        content: 'You can export your results in various formats to share with team members or clients.',
                        target: '.export-menu',
                        position: 'left'
                    }
                ]
            }
        };
        
        // Language-specific adjustments could be made here
        if (language === 'es') {
            // Spanish tutorials would go here
        }
        
        return tutorials;
    }
    
    /**
     * Create UI elements for the guidance system
     */
    createUIElements() {
        // Create tooltip container
        this.tooltipContainer = document.createElement('div');
        this.tooltipContainer.id = 'seo-tooltip-container';
        this.tooltipContainer.className = 'seo-tooltip-container';
        this.tooltipContainer.style.position = 'absolute';
        this.tooltipContainer.style.zIndex = '9999';
        this.tooltipContainer.style.display = 'none';
        document.body.appendChild(this.tooltipContainer);
        
        // Create tutorial overlay
        this.tutorialOverlay = document.createElement('div');
        this.tutorialOverlay.id = 'seo-tutorial-overlay';
        this.tutorialOverlay.className = 'seo-tutorial-overlay';
        this.tutorialOverlay.style.position = 'fixed';
        this.tutorialOverlay.style.top = '0';
        this.tutorialOverlay.style.left = '0';
        this.tutorialOverlay.style.width = '100%';
        this.tutorialOverlay.style.height = '100%';
        this.tutorialOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        this.tutorialOverlay.style.zIndex = '9998';
        this.tutorialOverlay.style.display = 'none';
        document.body.appendChild(this.tutorialOverlay);
        
        // Create tutorial popup
        this.tutorialPopup = document.createElement('div');
        this.tutorialPopup.id = 'seo-tutorial-popup';
        this.tutorialPopup.className = 'seo-tutorial-popup';
        this.tutorialPopup.style.position = 'absolute';
        this.tutorialPopup.style.zIndex = '10000';
        this.tutorialPopup.style.display = 'none';
        this.tutorialPopup.style.backgroundColor = 'white';
        this.tutorialPopup.style.borderRadius = '8px';
        this.tutorialPopup.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        this.tutorialPopup.style.padding = '20px';
        this.tutorialPopup.style.maxWidth = '400px';
        document.body.appendChild(this.tutorialPopup);
        
        // Create help button
        this.helpButton = document.createElement('button');
        this.helpButton.id = 'seo-help-button';
        this.helpButton.className = 'seo-help-button';
        this.helpButton.textContent = '?';
        this.helpButton.title = 'Get Help';
        this.helpButton.style.position = 'fixed';
        this.helpButton.style.bottom = '20px';
        this.helpButton.style.right = '20px';
        this.helpButton.style.width = '50px';
        this.helpButton.style.height = '50px';
        this.helpButton.style.borderRadius = '50%';
        this.helpButton.style.backgroundColor = '#1e7d88';
        this.helpButton.style.color = 'white';
        this.helpButton.style.fontSize = '24px';
        this.helpButton.style.border = 'none';
        this.helpButton.style.cursor = 'pointer';
        this.helpButton.style.zIndex = '9997';
        this.helpButton.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
        document.body.appendChild(this.helpButton);
    }
    
    /**
     * Attach event listeners for the guidance system
     */
    attachEventListeners() {
        // Store listeners so they can be removed later if needed
        this.eventListeners = {
            helpButtonClick: this.toggleHelpMenu.bind(this),
            documentClick: this.handleDocumentClick.bind(this),
            tutorialNavNext: this.nextTutorialStep.bind(this),
            tutorialNavPrev: this.previousTutorialStep.bind(this),
            tutorialClose: this.closeTutorial.bind(this),
            windowResize: this.handleResize.bind(this)
        };
        
        // Add event listeners
        this.helpButton.addEventListener('click', this.eventListeners.helpButtonClick);
        document.addEventListener('click', this.eventListeners.documentClick);
        window.addEventListener('resize', this.eventListeners.windowResize);
    }
    
    /**
     * Initialize tooltips on the page
     */
    initializeTooltips() {
        // Find all tooltip triggers
        const tooltipTriggers = document.querySelectorAll('[data-seo-tooltip]');
        
        // Add event listeners to each trigger
        tooltipTriggers.forEach(trigger => {
            trigger.addEventListener('mouseenter', (event) => {
                this.showTooltip(event.target);
            });
            
            trigger.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
        });
    }
    
    /**
     * Show a tooltip for the specified element
     * @param {HTMLElement} element - The element to show the tooltip for
     */
    showTooltip(element) {
        try {
            // Get tooltip content from data attribute
            const tooltipKey = element.getAttribute('data-seo-tooltip');
            
            // Find content based on the key
            let content = this.getTooltipContent(tooltipKey);
            if (!content) {
                console.warn(`No tooltip content found for key: ${tooltipKey}`);
                return;
            }
            
            // Sanitize content for security
            content = this.sanitizeHTML(content);
            
            // Set tooltip content
            this.tooltipContainer.innerHTML = content;
            
            // Position the tooltip
            this.positionTooltip(element);
            
            // Show the tooltip
            this.tooltipContainer.style.display = 'block';
        } catch (error) {
            console.warn('Error showing tooltip:', error);
            // Fail gracefully - hide the tooltip
            this.hideTooltip();
        }
    }
    
    /**
     * Hide the current tooltip
     */
    hideTooltip() {
        this.tooltipContainer.style.display = 'none';
    }
    
    /**
     * Position the tooltip relative to the specified element
     * @param {HTMLElement} element - The element to position the tooltip relative to
     */
    positionTooltip(element) {
        // Get element position
        const rect = element.getBoundingClientRect();
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Calculate tooltip position (above the element by default)
        let top = rect.top + scrollTop - this.tooltipContainer.offsetHeight - 10;
        let left = rect.left + scrollLeft + (rect.width / 2) - (this.tooltipContainer.offsetWidth / 2);
        
        // Check if tooltip would go off the top of the screen
        if (top < scrollTop) {
            // Position below the element instead
            top = rect.bottom + scrollTop + 10;
        }
        
        // Check if tooltip would go off the left or right of the screen
        if (left < scrollLeft) {
            left = scrollLeft + 10;
        } else if (left + this.tooltipContainer.offsetWidth > window.innerWidth + scrollLeft) {
            left = window.innerWidth + scrollLeft - this.tooltipContainer.offsetWidth - 10;
        }
        
        // Set tooltip position
        this.tooltipContainer.style.top = `${top}px`;
        this.tooltipContainer.style.left = `${left}px`;
    }
    
    /**
     * Get tooltip content for the specified key
     * @param {string} key - The tooltip key
     * @returns {string} The tooltip content
     */
    getTooltipContent(key) {
        // Parse the key to find the content in the guidance content
        const parts = key.split('.');
        
        let content = this.guidanceContent;
        for (const part of parts) {
            if (!content[part]) {
                return null;
            }
            content = content[part];
        }
        
        // If content is an object with a title and description, format it
        if (content.title && content.description) {
            let html = `<div class="tooltip-title">${content.title}</div>`;
            html += `<div class="tooltip-description">${content.description}</div>`;
            
            // Add examples if available
            if (content.examples && content.examples.length > 0) {
                html += '<div class="tooltip-examples">';
                html += '<div class="tooltip-examples-title">Examples:</div>';
                html += '<ul>';
                for (const example of content.examples) {
                    html += `<li>${example}</li>`;
                }
                html += '</ul>';
                html += '</div>';
            }
            
            // Add learn more link if available
            if (content.learnMoreUrl) {
                html += `<a href="${content.learnMoreUrl}" target="_blank" rel="noopener noreferrer" class="tooltip-learn-more">Learn more</a>`;
            }
            
            return html;
        }
        
        // If content is just a string, return it
        if (typeof content === 'string') {
            return content;
        }
        
        return null;
    }
    
    /**
     * Toggle the help menu
     */
    toggleHelpMenu() {
        // Create menu if it doesn't exist
        if (!this.helpMenu) {
            this.createHelpMenu();
        }
        
        // Toggle menu visibility
        if (this.helpMenu.style.display === 'none' || !this.helpMenu.style.display) {
            this.helpMenu.style.display = 'block';
        } else {
            this.helpMenu.style.display = 'none';
        }
    }
    
    /**
     * Create the help menu
     */
    createHelpMenu() {
        // Create help menu
        this.helpMenu = document.createElement('div');
        this.helpMenu.id = 'seo-help-menu';
        this.helpMenu.className = 'seo-help-menu';
        this.helpMenu.style.position = 'fixed';
        this.helpMenu.style.bottom = '80px';
        this.helpMenu.style.right = '20px';
        this.helpMenu.style.width = '250px';
        this.helpMenu.style.backgroundColor = 'white';
        this.helpMenu.style.borderRadius = '8px';
        this.helpMenu.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        this.helpMenu.style.zIndex = '9996';
        
        // Create menu content
        let menuContent = `
            <div style="padding: 15px; border-bottom: 1px solid #eee;">
                <h3 style="margin: 0; color: #333; font-size: 16px;">Help & Guidance</h3>
            </div>
            <div style="padding: 15px;">
                <ul style="list-style-type: none; padding: 0; margin: 0;">
                    <li style="margin-bottom: 10px;">
                        <a href="#" id="show-welcome-tutorial" style="text-decoration: none; color: #1e7d88; display: block;">
                            <span style="margin-right: 8px;">📚</span> Welcome Tour
                        </a>
                    </li>
                    <li style="margin-bottom: 10px;">
                        <a href="#" id="show-results-tutorial" style="text-decoration: none; color: #1e7d88; display: block;">
                            <span style="margin-right: 8px;">📊</span> Results Walkthrough
                        </a>
                    </li>
                    <li style="margin-bottom: 10px;">
                        <a href="#" id="toggle-tooltips" style="text-decoration: none; color: #1e7d88; display: block;">
                            <span style="margin-right: 8px;">💡</span> Toggle Tooltips
                        </a>
                    </li>
                    <li style="margin-bottom: 10px;">
                        <a href="#" id="show-glossary" style="text-decoration: none; color: #1e7d88; display: block;">
                            <span style="margin-right: 8px;">📖</span> SEO Glossary
                        </a>
                    </li>
                </ul>
            </div>
        `;
        
        // Sanitize content for security
        menuContent = this.sanitizeHTML(menuContent);
        
        // Set menu content
        this.helpMenu.innerHTML = menuContent;
        
        // Add event listeners for menu items
        setTimeout(() => {
            document.getElementById('show-welcome-tutorial')?.addEventListener('click', (e) => {
                e.preventDefault();
                this.helpMenu.style.display = 'none';
                this.showWelcomeTutorial();
            });
            
            document.getElementById('show-results-tutorial')?.addEventListener('click', (e) => {
                e.preventDefault();
                this.helpMenu.style.display = 'none';
                this.showResultsTutorial();
            });
            
            document.getElementById('toggle-tooltips')?.addEventListener('click', (e) => {
                e.preventDefault();
                this.settings.enableTooltips = !this.settings.enableTooltips;
                this.saveUserPreferences({ enableTooltips: this.settings.enableTooltips });
                this.helpMenu.style.display = 'none';
                this.showNotification(`Tooltips ${this.settings.enableTooltips ? 'enabled' : 'disabled'}`);
            });
            
            document.getElementById('show-glossary')?.addEventListener('click', (e) => {
                e.preventDefault();
                this.helpMenu.style.display = 'none';
                this.showGlossary();
            });
        }, 0);
        
        // Add menu to the page
        document.body.appendChild(this.helpMenu);
    }
    
    /**
     * Show the welcome tutorial
     */
    showWelcomeTutorial() {
        try {
            // Get welcome tutorial
            const tutorial = this.tutorials.welcome;
            if (!tutorial) {
                console.warn('Welcome tutorial not found');
                return;
            }
            
            // Start the tutorial
            this.startTutorial(tutorial);
        } catch (error) {
            console.error('Error showing welcome tutorial:', error);
        }
    }
    
    /**
     * Show the results analysis tutorial
     */
    showResultsTutorial() {
        try {
            // Get results tutorial
            const tutorial = this.tutorials.results_analysis;
            if (!tutorial) {
                console.warn('Results tutorial not found');
                return;
            }
            
            // Start the tutorial
            this.startTutorial(tutorial);
        } catch (error) {
            console.error('Error showing results tutorial:', error);
        }
    }
    
    /**
     * Start a tutorial
     * @param {Object} tutorial - The tutorial to start
     */
    startTutorial(tutorial) {
        // Set active tutorial
        this.activeTutorial = tutorial;
        this.currentStep = 0;
        
        // Show the tutorial overlay
        this.tutorialOverlay.style.display = 'block';
        
        // Show the first step
        this.showTutorialStep();
    }
    
    /**
     * Show the current tutorial step
     */
    showTutorialStep() {
        try {
            // Check if there is an active tutorial
            if (!this.activeTutorial || !this.activeTutorial.steps) {
                console.warn('No active tutorial');
                this.closeTutorial();
                return;
            }
            
            // Get current step
            const step = this.activeTutorial.steps[this.currentStep];
            if (!step) {
                console.warn('Step not found');
                this.closeTutorial();
                return;
            }
            
            // Create step content
            let content = `
                <div class="tutorial-header" style="margin-bottom: 15px;">
                    <h3 style="margin: 0; color: #333; font-size: 18px;">${this.sanitizeHTML(step.title || '')}</h3>
                </div>
                <div class="tutorial-content" style="margin-bottom: 20px;">
                    <p style="margin: 0; color: #666;">${this.sanitizeHTML(step.content || '')}</p>
                </div>
                <div class="tutorial-navigation" style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <button id="tutorial-prev" class="tutorial-nav-button" style="padding: 8px 16px; background-color: #f5f5f5; border: none; border-radius: 4px; cursor: pointer; color: #333; margin-right: 10px; ${this.currentStep === 0 ? 'visibility: hidden;' : ''}">Previous</button>
                        <button id="tutorial-next" class="tutorial-nav-button" style="padding: 8px 16px; background-color: #1e7d88; border: none; border-radius: 4px; cursor: pointer; color: white;">${this.currentStep === this.activeTutorial.steps.length - 1 ? 'Finish' : 'Next'}</button>
                    </div>
                    <div>
                        <span style="color: #999; font-size: 14px;">${this.currentStep + 1} / ${this.activeTutorial.steps.length}</span>
                    </div>
                </div>
            `;
            
            // Set popup content
            this.tutorialPopup.innerHTML = content;
            
            // Position the popup
            this.positionTutorialPopup(step);
            
            // Show the popup
            this.tutorialPopup.style.display = 'block';
            
            // Highlight the target element
            this.highlightTutorialTarget(step);
            
            // Add event listeners for navigation buttons
            setTimeout(() => {
                document.getElementById('tutorial-prev')?.addEventListener('click', this.eventListeners.tutorialNavPrev);
                document.getElementById('tutorial-next')?.addEventListener('click', this.eventListeners.tutorialNavNext);
            }, 0);
        } catch (error) {
            console.error('Error showing tutorial step:', error);
            this.closeTutorial();
        }
    }
    
    /**
     * Position the tutorial popup for the current step
     * @param {Object} step - The current tutorial step
     */
    positionTutorialPopup(step) {
        // Default position (center)
        let top = window.innerHeight / 2 - this.tutorialPopup.offsetHeight / 2;
        let left = window.innerWidth / 2 - this.tutorialPopup.offsetWidth / 2;
        
        // If step has a target element, position relative to it
        if (step.target && step.target !== 'body') {
            const targetElement = document.querySelector(step.target);
            if (targetElement) {
                const rect = targetElement.getBoundingClientRect();
                const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                
                switch (step.position) {
                    case 'top':
                        top = rect.top + scrollTop - this.tutorialPopup.offsetHeight - 20;
                        left = rect.left + scrollLeft + (rect.width / 2) - (this.tutorialPopup.offsetWidth / 2);
                        break;
                    case 'bottom':
                        top = rect.bottom + scrollTop + 20;
                        left = rect.left + scrollLeft + (rect.width / 2) - (this.tutorialPopup.offsetWidth / 2);
                        break;
                    case 'left':
                        top = rect.top + scrollTop + (rect.height / 2) - (this.tutorialPopup.offsetHeight / 2);
                        left = rect.left + scrollLeft - this.tutorialPopup.offsetWidth - 20;
                        break;
                    case 'right':
                        top = rect.top + scrollTop + (rect.height / 2) - (this.tutorialPopup.offsetHeight / 2);
                        left = rect.right + scrollLeft + 20;
                        break;
                    default:
                        // If no valid position is specified, default to bottom
                        top = rect.bottom + scrollTop + 20;
                        left = rect.left + scrollLeft + (rect.width / 2) - (this.tutorialPopup.offsetWidth / 2);
                }
                
                // Ensure the element is visible
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }
        
        // Ensure the popup stays within the viewport
        if (top < 20) {
            top = 20;
        } else if (top + this.tutorialPopup.offsetHeight > window.innerHeight - 20) {
            top = window.innerHeight - this.tutorialPopup.offsetHeight - 20;
        }
        
        if (left < 20) {
            left = 20;
        } else if (left + this.tutorialPopup.offsetWidth > window.innerWidth - 20) {
            left = window.innerWidth - this.tutorialPopup.offsetWidth - 20;
        }
        
        // Set popup position
        this.tutorialPopup.style.top = `${top}px`;
        this.tutorialPopup.style.left = `${left}px`;
    }
    
    /**
     * Highlight the target element for the current tutorial step
     * @param {Object} step - The current tutorial step
     */
    highlightTutorialTarget(step) {
        // Remove any existing highlight
        this.removeTargetHighlight();
        
        // If step has a target element (other than body), highlight it
        if (step.target && step.target !== 'body') {
            const targetElement = document.querySelector(step.target);
            if (targetElement) {
                // Create highlight element
                const highlight = document.createElement('div');
                highlight.id = 'seo-tutorial-highlight';
                highlight.style.position = 'absolute';
                highlight.style.boxShadow = '0 0 0 9999px rgba(0, 0, 0, 0.5)';
                highlight.style.zIndex = '9999';
                highlight.style.pointerEvents = 'none';
                highlight.style.transition = 'all 0.3s ease-in-out';
                
                // Position highlight
                const rect = targetElement.getBoundingClientRect();
                const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                
                highlight.style.top = `${rect.top + scrollTop - 5}px`;
                highlight.style.left = `${rect.left + scrollLeft - 5}px`;
                highlight.style.width = `${rect.width + 10}px`;
                highlight.style.height = `${rect.height + 10}px`;
                highlight.style.borderRadius = '4px';
                
                // Add highlight to the page
                document.body.appendChild(highlight);
            }
        }
    }
    
    /**
     * Remove the target highlight
     */
    removeTargetHighlight() {
        const highlight = document.getElementById('seo-tutorial-highlight');
        if (highlight) {
            highlight.parentNode.removeChild(highlight);
        }
    }
    
    /**
     * Move to the next tutorial step
     */
    nextTutorialStep() {
        // If this is the last step, close the tutorial
        if (this.currentStep === this.activeTutorial.steps.length - 1) {
            this.closeTutorial();
            return;
        }
        
        // Move to the next step
        this.currentStep++;
        
        // Show the new step
        this.showTutorialStep();
    }
    
    /**
     * Move to the previous tutorial step
     */
    previousTutorialStep() {
        // If this is the first step, do nothing
        if (this.currentStep === 0) {
            return;
        }
        
        // Move to the previous step
        this.currentStep--;
        
        // Show the new step
        this.showTutorialStep();
    }
    
    /**
     * Close the current tutorial
     */
    closeTutorial() {
        // Hide tutorial elements
        this.tutorialOverlay.style.display = 'none';
        this.tutorialPopup.style.display = 'none';
        
        // Remove target highlight
        this.removeTargetHighlight();
        
        // Reset tutorial state
        this.activeTutorial = null;
        this.currentStep = 0;
    }
    
    /**
     * Show the SEO glossary
     */
    showGlossary() {
        try {
            // Create glossary content
            let content = '<div style="padding: 20px;">';
            content += '<h2 style="margin-top: 0; margin-bottom: 20px; color: #333;">SEO Glossary</h2>';
            
            // Add glossary terms
            const terms = Object.values(this.guidanceContent.glossary || {});
            terms.sort((a, b) => a.term.localeCompare(b.term));
            
            for (const term of terms) {
                content += `
                    <div style="margin-bottom: 15px;">
                        <h3 style="margin: 0 0 5px 0; color: #333; font-size: 16px;">${this.sanitizeHTML(term.term)}</h3>
                        <p style="margin: 0; color: #666;">${this.sanitizeHTML(term.definition)}</p>
                    </div>
                `;
            }
            
            // Add close button
            content += `
                <div style="text-align: center; margin-top: 20px;">
                    <button id="glossary-close" style="padding: 8px 16px; background-color: #1e7d88; border: none; border-radius: 4px; cursor: pointer; color: white;">Close</button>
                </div>
            `;
            
            content += '</div>';
            
            // Create modal
            const modal = document.createElement('div');
            modal.id = 'seo-glossary-modal';
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            modal.style.zIndex = '10001';
            modal.style.display = 'flex';
            modal.style.justifyContent = 'center';
            modal.style.alignItems = 'center';
            
            // Create modal content
            const modalContent = document.createElement('div');
            modalContent.style.backgroundColor = 'white';
            modalContent.style.borderRadius = '8px';
            modalContent.style.maxWidth = '600px';
            modalContent.style.width = '90%';
            modalContent.style.maxHeight = '80vh';
            modalContent.style.overflowY = 'auto';
            modalContent.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            
            // Sanitize content for security
            content = this.sanitizeHTML(content);
            
            // Set modal content
            modalContent.innerHTML = content;
            
            // Add modal content to modal
            modal.appendChild(modalContent);
            
            // Add modal to the page
            document.body.appendChild(modal);
            
            // Add event listener for close button
            setTimeout(() => {
                document.getElementById('glossary-close')?.addEventListener('click', () => {
                    modal.parentNode.removeChild(modal);
                });
                
                // Close when clicking outside the modal content
                modal.addEventListener('click', (event) => {
                    if (event.target === modal) {
                        modal.parentNode.removeChild(modal);
                    }
                });
            }, 0);
        } catch (error) {
            console.error('Error showing glossary:', error);
        }
    }
    
    /**
     * Show a notification message
     * @param {string} message - The message to show
     * @param {string} type - The notification type (info, success, warning, error)
     * @param {number} duration - The duration in milliseconds
     */
    showNotification(message, type = 'info', duration = 3000) {
        try {
            // Create notification element
            const notification = document.createElement('div');
            notification.className = `seo-notification seo-notification-${type}`;
            notification.style.position = 'fixed';
            notification.style.bottom = '20px';
            notification.style.left = '20px';
            notification.style.padding = '10px 15px';
            notification.style.borderRadius = '4px';
            notification.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
            notification.style.zIndex = '10000';
            notification.style.minWidth = '200px';
            notification.style.maxWidth = '300px';
            notification.style.animation = 'seo-notification-slide-in 0.3s ease-out';
            
            // Set background color based on type
            switch (type) {
                case 'success':
                    notification.style.backgroundColor = '#4caf50';
                    notification.style.color = 'white';
                    break;
                case 'warning':
                    notification.style.backgroundColor = '#ff9800';
                    notification.style.color = 'white';
                    break;
                case 'error':
                    notification.style.backgroundColor = '#f44336';
                    notification.style.color = 'white';
                    break;
                default:
                    notification.style.backgroundColor = '#1e7d88';
                    notification.style.color = 'white';
            }
            
            // Sanitize message for security
            message = this.sanitizeHTML(message);
            
            // Set notification content
            notification.innerHTML = message;
            
            // Add notification to the page
            document.body.appendChild(notification);
            
            // Remove notification after duration
            setTimeout(() => {
                notification.style.animation = 'seo-notification-slide-out 0.3s ease-out';
                setTimeout(() => {
                    notification.parentNode?.removeChild(notification);
                }, 300);
            }, duration);
        } catch (error) {
            console.warn('Error showing notification:', error);
        }
    }
    
    /**
     * Handle document click events
     * @param {Event} event - The click event
     */
    handleDocumentClick(event) {
        // Close help menu if clicking outside it and the help button
        if (this.helpMenu && 
            this.helpMenu.style.display === 'block' && 
            !this.helpMenu.contains(event.target) && 
            !this.helpButton.contains(event.target)) {
            this.helpMenu.style.display = 'none';
        }
    }
    
    /**
     * Handle window resize events
     */
    handleResize() {
        // Reposition tutorial popup if active
        if (this.activeTutorial && this.currentStep < this.activeTutorial.steps.length) {
            this.positionTutorialPopup(this.activeTutorial.steps[this.currentStep]);
        }
    }
    
    /**
     * Check if this is the user's first visit
     * @returns {boolean} True if this is the first visit
     */
    checkIfFirstVisit() {
        try {
            return !localStorage.getItem('seo-guidance-visited');
        } catch (error) {
            console.warn('Could not check if first visit:', error);
            return false;
        }
    }
    
    /**
     * Mark first visit as complete
     */
    markFirstVisitComplete() {
        try {
            localStorage.setItem('seo-guidance-visited', 'true');
        } catch (error) {
            console.warn('Could not mark first visit as complete:', error);
        }
    }
    
    /**
     * Load user preferences from local storage
     * @returns {Object} The user preferences
     */
    loadUserPreferences() {
        try {
            const preferencesJson = localStorage.getItem('seo-guidance-preferences');
            if (preferencesJson) {
                return JSON.parse(preferencesJson);
            }
            return {};
        } catch (error) {
            console.warn('Could not load user preferences:', error);
            return {};
        }
    }
    
    /**
     * Save user preferences to local storage
     * @param {Object} preferences - The preferences to save
     */
    saveUserPreferences(preferences) {
        try {
            const currentPreferences = this.loadUserPreferences();
            const updatedPreferences = { ...currentPreferences, ...preferences };
            localStorage.setItem('seo-guidance-preferences', JSON.stringify(updatedPreferences));
        } catch (error) {
            console.warn('Could not save user preferences:', error);
        }
    }
    
    /**
     * Sanitize HTML to prevent XSS attacks
     * @param {string} html - The HTML to sanitize
     * @returns {string} The sanitized HTML
     */
    sanitizeHTML(html) {
        if (!html) return '';
        
        // Create a temporary element
        const temp = document.createElement('div');
        
        // Set textContent to escape all HTML (converts HTML entities)
        temp.textContent = html;
        
        // Get escaped HTML
        let escapedHtml = temp.innerHTML;
        
        // Allow some safe HTML tags
        escapedHtml = escapedHtml
            // Replace escaped tags with actual tags
            .replace(/&lt;(\/?(b|strong|i|em|p|h[1-6]|ul|ol|li|br|div|span|a|button))&gt;/g, '<$1>')
            // Replace style="..." with proper attributes
            .replace(/&lt;(\/?(div|span|a|button)) style=&quot;([^&]+)&quot;&gt;/g, '<$1 style="$3">')
            // Replace id="..." with proper attributes
            .replace(/&lt;(\/?(div|span|a|button)) id=&quot;([^&]+)&quot;&gt;/g, '<$1 id="$3">')
            // Replace class="..." with proper attributes
            .replace(/&lt;(\/?(div|span|a|button)) class=&quot;([^&]+)&quot;&gt;/g, '<$1 class="$3">')
            // Replace href="..." with proper attributes (only allowing safe protocols)
            .replace(/&lt;a href=&quot;(https?:\/\/[^&]+)&quot;&gt;/g, '<a href="$1" target="_blank" rel="noopener noreferrer">')
            // Replace combined attributes (limited to safe combinations)
            .replace(/&lt;(div|span) style=&quot;([^&]+)&quot; class=&quot;([^&]+)&quot;&gt;/g, '<$1 style="$2" class="$3">');
        
        return escapedHtml;
    }
    
    /**
     * Clean up the guidance system (remove elements and event listeners)
     */
    cleanup() {
        try {
            // Remove UI elements
            if (this.tooltipContainer) {
                this.tooltipContainer.parentNode?.removeChild(this.tooltipContainer);
            }
            
            if (this.tutorialOverlay) {
                this.tutorialOverlay.parentNode?.removeChild(this.tutorialOverlay);
            }
            
            if (this.tutorialPopup) {
                this.tutorialPopup.parentNode?.removeChild(this.tutorialPopup);
            }
            
            if (this.helpButton) {
                this.helpButton.parentNode?.removeChild(this.helpButton);
            }
            
            if (this.helpMenu) {
                this.helpMenu.parentNode?.removeChild(this.helpMenu);
            }
            
            // Remove event listeners
            this.helpButton?.removeEventListener('click', this.eventListeners.helpButtonClick);
            document.removeEventListener('click', this.eventListeners.documentClick);
            window.removeEventListener('resize', this.eventListeners.windowResize);
            
            console.log('SEO Guidance System cleaned up successfully');
        } catch (error) {
            console.error('Error cleaning up SEO Guidance System:', error);
        }
    }
}

// Add stylesheet for the guidance system
function addGuidanceStylesheet() {
    const styleElement = document.createElement('style');
    styleElement.id = 'seo-guidance-styles';
    styleElement.textContent = `
        .seo-tooltip-container {
            background-color: white;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            padding: 10px;
            max-width: 300px;
            z-index: 9999;
        }
        
        .tooltip-title {
            font-weight: bold;
            margin-bottom: 5px;
            color: #333;
        }
        
        .tooltip-description {
            color: #666;
            font-size: 14px;
            margin-bottom: 5px;
        }
        
        .tooltip-examples {
            margin-top: 8px;
            font-size: 13px;
        }
        
        .tooltip-examples-title {
            font-weight: bold;
            margin-bottom: 3px;
            color: #555;
        }
        
        .tooltip-examples ul {
            margin: 0;
            padding-left: 20px;
        }
        
        .tooltip-learn-more {
            display: inline-block;
            margin-top: 8px;
            color: #1e7d88;
            text-decoration: none;
            font-size: 13px;
        }
        
        .tooltip-learn-more:hover {
            text-decoration: underline;
        }
        
        @keyframes seo-notification-slide-in {
            from {
                transform: translateX(-100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes seo-notification-slide-out {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(-100%);
                opacity: 0;
            }
        }
    `;
    
    document.head.appendChild(styleElement);
}

// Initialize guidance system when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add stylesheet
    addGuidanceStylesheet();
    
    // Initialize guidance system
    window.seoGuidance = new SEOGuidanceSystem();
    window.seoGuidance.initialize();
});

// Export module if using CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SEOGuidanceSystem;
}
