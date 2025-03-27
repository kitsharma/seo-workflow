/**
 * SEO Workflow System Test Utilities
 * Path: /tests/test-utils.js
 * Purpose: Provides utility functions for testing the SEO Workflow System
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

/**
 * Create a DOM environment for testing UI components
 * @param {string} html - HTML content for the DOM
 * @param {Object} options - Additional options for JSDOM
 * @returns {Object} Object with window, document, and cleanup function
 */
function createDOMEnvironment(html, options = {}) {
    // Default options
    const defaultOptions = {
        url: 'http://localhost',
        referrer: 'http://localhost',
        contentType: 'text/html',
        runScripts: 'dangerously',
        resources: 'usable',
        pretendToBeVisual: true,
        ...options
    };
    
    // Create DOM
    const dom = new JSDOM(html, defaultOptions);
    
    // Add mock implementations for Canvas and other browser APIs
    mockBrowserAPIs(dom.window);
    
    // Return window, document, and cleanup function
    return {
        window: dom.window,
        document: dom.window.document,
        cleanup: () => {
            dom.window.close();
        }
    };
}

/**
 * Mock browser APIs for testing
 * @param {Window} window - The window object to add mocks to
 */
function mockBrowserAPIs(window) {
    // Mock canvas
    if (!window.HTMLCanvasElement.prototype.getContext) {
        window.HTMLCanvasElement.prototype.getContext = function() {
            return {
                fillRect: function() {},
                clearRect: function() {},
                getImageData: function() {
                    return {
                        data: new Array(1024)
                    };
                },
                putImageData: function() {},
                createImageData: function() {
                    return [];
                },
                setTransform: function() {},
                drawImage: function() {},
                save: function() {},
                restore: function() {},
                beginPath: function() {},
                moveTo: function() {},
                lineTo: function() {},
                closePath: function() {},
                stroke: function() {},
                translate: function() {},
                scale: function() {},
                rotate: function() {},
                arc: function() {},
                fill: function() {},
                measureText: function() {
                    return { width: 0 };
                },
                transform: function() {},
                rect: function() {},
                clip: function() {},
                createLinearGradient: function() {
                    return {
                        addColorStop: function() {}
                    };
                },
                createRadialGradient: function() {
                    return {
                        addColorStop: function() {}
                    };
                },
                fillText: function() {},
                strokeText: function() {},
                bezierCurveTo: function() {}
            };
        };
    }
    
    // Mock localStorage
    if (!window.localStorage) {
        window.localStorage = {
            getItem: function(key) {
                return this[key] || null;
            },
            setItem: function(key, value) {
                this[key] = value.toString();
            },
            removeItem: function(key) {
                delete this[key];
            },
            clear: function() {
                Object.keys(this).forEach(key => {
                    if (typeof this[key] !== 'function') {
                        delete this[key];
                    }
                });
            }
        };
    }
    
    // Mock fetch API
    if (!window.fetch) {
        window.fetch = function(url) {
            return Promise.resolve({
                json: () => Promise.resolve({}),
                text: () => Promise.resolve(''),
                ok: true,
                status: 200,
                statusText: 'OK'
            });
        };
    }
    
    // Mock navigator
    if (!window.navigator) {
        window.navigator = {
            userAgent: 'node.js',
            language: 'en-US',
            languages: ['en-US', 'en'],
            clipboard: {
                writeText: function(text) {
                    return Promise.resolve();
                }
            }
        };
    }
    
    // Mock ResizeObserver
    if (!window.ResizeObserver) {
        window.ResizeObserver = class ResizeObserver {
            constructor(callback) {
                this.callback = callback;
            }
            
            observe() {}
            unobserve() {}
            disconnect() {}
        };
    }
    
    // Mock MutationObserver
    if (!window.MutationObserver) {
        window.MutationObserver = class MutationObserver {
            constructor(callback) {
                this.callback = callback;
            }
            
            observe() {}
            disconnect() {}
        };
    }
    
    // Add utility function to trigger events
    window.triggerEvent = function(element, eventType, options = {}) {
        const event = new window.Event(eventType, {
            bubbles: true,
            cancelable: true,
            ...options
        });
        
        element.dispatchEvent(event);
    };
}

/**
 * Load HTML fixture from file
 * @param {string} fixtureName - Name of the fixture file
 * @returns {string} HTML content of the fixture
 */
function loadFixture(fixtureName) {
    const fixturePath = path.join(__dirname, 'fixtures', `${fixtureName}.html`);
    
    try {
        return fs.readFileSync(fixturePath, 'utf-8');
    } catch (error) {
        console.error(`Error loading fixture ${fixtureName}:`, error);
        return '<div>Fixture not found</div>';
    }
}

/**
 * Load mock JSON data from file
 * @param {string} dataName - Name of the mock data file
 * @returns {Object} JSON data
 */
function loadMockData(dataName) {
    const dataPath = path.join(__dirname, 'mock-data', `${dataName}.json`);
    
    try {
        const data = fs.readFileSync(dataPath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error loading mock data ${dataName}:`, error);
        return {};
    }
}

/**
 * Wait for a specified amount of time
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} Promise that resolves after the specified time
 */
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Wait for a DOM element to be rendered
 * @param {Document} document - The document object
 * @param {string} selector - CSS selector for the element
 * @param {number} timeout - Maximum time to wait in milliseconds
 * @returns {Promise<Element>} The element when found
 */
function waitForElement(document, selector, timeout = 2000) {
    return new Promise((resolve, reject) => {
        // Check if element already exists
        const element = document.querySelector(selector);
        if (element) {
            return resolve(element);
        }
        
        // Set timeout
        const timeoutId = setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Element ${selector} not found within ${timeout}ms`));
        }, timeout);
        
        // Set up mutation observer
        const observer = new MutationObserver(() => {
            const element = document.querySelector(selector);
            if (element) {
                clearTimeout(timeoutId);
                observer.disconnect();
                resolve(element);
            }
        });
        
        // Start observing
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

/**
 * Generate a test report
 * @param {Object} results - Test results
 * @param {string} outputPath - Path to write the report to
 * @returns {string} Path to the report file
 */
function generateTestReport(results, outputPath) {
    const report = {
        timestamp: new Date().toISOString(),
        results: results,
        summary: {
            total: results.stats.tests,
            passed: results.stats.passes,
            failed: results.stats.failures,
            duration: results.stats.duration
        }
    };
    
    const reportJson = JSON.stringify(report, null, 2);
    
    try {
        fs.writeFileSync(outputPath, reportJson);
        return outputPath;
    } catch (error) {
        console.error('Error writing test report:', error);
        return null;
    }
}

module.exports = {
    createDOMEnvironment,
    mockBrowserAPIs,
    loadFixture,
    loadMockData,
    wait,
    waitForElement,
    generateTestReport
};
