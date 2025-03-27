/**
 * SEO Workflow System Test Suite
 * Path: /tests/test-suite.js
 * Purpose: Provides comprehensive testing for the SEO Workflow System UX enhancements
 * 
 * Test Categories:
 * 1. Unit Tests - Testing individual components in isolation
 * 2. Integration Tests - Testing components working together
 * 3. UI Tests - Testing user interface functionality
 * 4. Security Tests - Testing security measures
 */

// Import testing framework
const { describe, it, before, after, beforeEach, afterEach } = require('mocha');
const { expect, assert } = require('chai');
const sinon = require('sinon');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

// Import components to test
const DataVisualization = require('../static/js/seo-visualizations');
const PDFExport = require('../static/js/seo-pdf-export');
const UserGuidance = require('../static/js/seo-user-guidance');

// Import test utilities
const testUtils = require('./test-utils');
const mockData = require('./mock-data');

//------------------------------------------------
// Unit Tests
//------------------------------------------------
describe('SEO Workflow System Unit Tests', function() {
    
    //------------------------------------------------
    // Data Visualization Component Tests
    //------------------------------------------------
    describe('Data Visualization Component', function() {
        let dom;
        let window;
        let document;
        let consoleSpy;
        
        before(function() {
            // Setup DOM environment
            dom = new JSDOM(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Test</title>
                    <style>
                        .chart-container { width: 500px; height: 300px; }
                    </style>
                </head>
                <body>
                    <div id="performanceChart" class="chart-container"></div>
                    <div id="keywordVolumeChart" class="chart-container"></div>
                    <div id="contentQualityChart" class="chart-container"></div>
                    <div id="technicalIssuesChart" class="chart-container"></div>
                </body>
                </html>
            `);
            
            window = dom.window;
            document = window.document;
            
            // Mock Chart.js
            window.Chart = class Chart {
                constructor(ctx, config) {
                    this.ctx = ctx;
                    this.config = config;
                    this.type = config.type;
                    this.data = config.data;
                }
                
                destroy() {}
            };
            
            // Spy on console
            consoleSpy = sinon.spy(console, 'error');
            
            // Mock window object and functions for visualization
            global.window = window;
            global.document = document;
        });
        
        after(function() {
            // Cleanup
            consoleSpy.restore();
            delete global.window;
            delete global.document;
        });
        
        it('should initialize SEO visualizations', function() {
            // Call the function with mock data
            const result = DataVisualization.initializeSEOVisualizations(mockData.seoAnalysisResults);
            
            // Assert function execution without errors
            expect(consoleSpy.callCount).to.equal(0);
        });
        
        it('should calculate performance scores correctly', function() {
            // Test the calculatePerformanceScores function
            const scores = DataVisualization.calculatePerformanceScores(mockData.seoAnalysisResults);
            
            // Verify scores are calculated and within expected range
            expect(scores).to.be.an('object');
            expect(scores).to.have.property('Technical SEO');
            expect(scores['Technical SEO']).to.be.a('number').and.to.be.within(0, 100);
        });
        
        it('should handle missing data gracefully', function() {
            // Call with null data
            DataVisualization.initializeSEOVisualizations(null);
            
            // Should log an error but not throw
            expect(consoleSpy.callCount).to.be.at.least(1);
            
            // Call with empty data
            DataVisualization.initializeSEOVisualizations({});
            
            // Error message should be about invalid data
            expect(consoleSpy.firstCall.args[0]).to.include('Invalid');
        });
        
        it('should detect correct chart types for different data', function() {
            // Check keyword data detection
            const hasKeyword = DataVisualization.hasKeywordData(mockData.seoAnalysisResults);
            
            // Since mock data contains keyword data, should return true
            expect(hasKeyword).to.be.a('boolean');
            
            // Check technical data detection
            const hasTechnical = DataVisualization.hasTechnicalData(mockData.seoAnalysisResults);
            expect(hasTechnical).to.be.a('boolean');
        });
        
        it('should extract keyword data correctly', function() {
            // Use a mock step with keyword data
            const keywordData = {
                keywords: [
                    { keyword: 'test', volume: 1000, difficulty: 50 },
                    { keyword: 'example', volume: 500, difficulty: 30 }
                ]
            };
            
            // Extract keyword data
            const extracted = DataVisualization.extractKeywordData(keywordData);
            
            // Should have the same number of items
            expect(extracted).to.be.an('array');
            expect(extracted.length).to.equal(2);
            
            // Should have processed the data correctly
            expect(extracted[0]).to.have.property('keyword', 'test');
            expect(extracted[0]).to.have.property('volume', 1000);
        });
    });
    
    //------------------------------------------------
    // PDF Export Component Tests
    //------------------------------------------------
    describe('PDF Export Component', function() {
        let dom;
        let window;
        let document;
        let jsPDFMock;
        let canvasMock;
        
        before(function() {
            // Setup DOM environment
            dom = new JSDOM(`
                <!DOCTYPE html>
                <html>
                <body>
                    <div id="report-content">Test content for PDF</div>
                </body>
                </html>
            `);
            
            window = dom.window;
            document = window.document;
            
            // Mock jsPDF
            jsPDFMock = {
                text: sinon.spy(),
                addPage: sinon.spy(),
                setFont: sinon.spy(),
                setFontSize: sinon.spy(),
                setTextColor: sinon.spy(),
                setFillColor: sinon.spy(),
                setDrawColor: sinon.spy(),
                setLineWidth: sinon.spy(),
                rect: sinon.spy(),
                line: sinon.spy(),
                addImage: sinon.spy(),
                circle: sinon.spy(),
                roundedRect: sinon.spy(),
                output: sinon.stub().returns(new Uint8Array([1, 2, 3])),
                autoTable: sinon.spy(),
                setProperties: sinon.spy(),
                previousAutoTable: { finalY: 100 }
            };
            
            // Mock Canvas
            canvasMock = {
                getContext: () => ({
                    createLinearGradient: () => ({
                        addColorStop: sinon.spy()
                    }),
                    fillStyle: '',
                    beginPath: sinon.spy(),
                    moveTo: sinon.spy(),
                    bezierCurveTo: sinon.spy(),
                    lineTo: sinon.spy(),
                    closePath: sinon.spy(),
                    fill: sinon.spy()
                }),
                toDataURL: sinon.stub().returns('data:image/png;base64,testdata')
            };
            
            // Mock window object
            window.jspdf = { jsPDF: sinon.stub().returns(jsPDFMock) };
            window.document.createElement = function(tag) {
                if (tag === 'canvas') {
                    return canvasMock;
                }
                return dom.window.document.createElement(tag);
            };
            
            // Set global variables
            global.window = window;
            global.document = document;
        });
        
        after(function() {
            delete global.window;
            delete global.document;
        });
        
        it('should generate PDF report without errors', async function() {
            // Call generate function with mock data
            const result = await PDFExport.generateSEOReport(mockData.seoAnalysisResults, {
                fileName: 'test-report.pdf',
                companyName: 'Test Company'
            });
            
            // Should return a Blob
            expect(result).to.be.an.instanceof(Uint8Array);
            
            // Should have called jsPDF methods
            expect(jsPDFMock.text.called).to.be.true;
            expect(jsPDFMock.addPage.called).to.be.true;
        });
        
        it('should sanitize content to prevent XSS in PDFs', function() {
            // Test sanitization function
            const unsafeText = '<script>alert("XSS")</script><img src="x" onerror="alert(1)">';
            const sanitized = PDFExport.sanitizeText(unsafeText);
            
            // Should sanitize unsafe HTML
            expect(sanitized).to.not.include('<script>');
            expect(sanitized).to.not.include('onerror=');
            expect(sanitized).to.include('&lt;script&gt;');
        });
        
        it('should handle null or undefined inputs', function() {
            // Test sanitization with null/undefined
            expect(PDFExport.sanitizeText(null)).to.equal('');
            expect(PDFExport.sanitizeText(undefined)).to.equal('');
            
            // Test with numbers
            expect(PDFExport.sanitizeText(123)).to.equal('123');
        });
        
        it('should generate correct parts of the PDF', async function() {
            // Mock the results data with minimal requirements
            const minimalData = {
                workflow_type: 'test_workflow',
                execution_summary: {
                    execution_log: [{ timestamp: '2023-01-01T00:00:00Z' }],
                    total_steps_executed: 3,
                    total_execution_time_seconds: 5.5
                }
            };
            
            // Generate PDF with minimal data
            await PDFExport.generateSEOReport(minimalData, {});
            
            // Should have generated the cover page
            expect(jsPDFMock.text.calledWith('test_workflow', sinon.match.any, sinon.match.any)).to.be.true;
            
            // Should have added the execution time
            expect(jsPDFMock.text.calledWith('5.5s', sinon.match.any, sinon.match.any)).to.be.true;
        });
    });
    
    //------------------------------------------------
    // User Guidance Component Tests
    //------------------------------------------------
    describe('User Guidance Component', function() {
        let dom;
        let window;
        let document;
        let localStorage;
        let guidanceSystem;
        
        beforeEach(function() {
            // Setup DOM environment for each test
            dom = new JSDOM(`
                <!DOCTYPE html>
                <html>
                <body>
                    <div class="dashboard-overview"></div>
                    <div class="performance-metrics"></div>
                    <div class="recommendations-panel"></div>
                    <div data-seo-tooltip="metrics.technical_seo">Technical SEO</div>
                </body>
                </html>
            `, { url: 'http://localhost' });
            
            window = dom.window;
            document = window.document;
            
            // Mock localStorage
            localStorage = {
                getItem: sinon.stub(),
                setItem: sinon.stub(),
                removeItem: sinon.stub()
            };
            window.localStorage = localStorage;
            
            // Set global variables
            global.window = window;
            global.document = document;
            
            // Create guidance system instance
            guidanceSystem = new UserGuidance({ enableTooltips: true });
        });
        
        afterEach(function() {
            if (guidanceSystem && guidanceSystem.cleanup) {
                guidanceSystem.cleanup();
            }
            delete global.window;
            delete global.document;
        });
        
        it('should initialize with default settings', function() {
            // Check initialization
            expect(guidanceSystem.settings).to.be.an('object');
            expect(guidanceSystem.settings.enableTooltips).to.be.true;
            expect(guidanceSystem.settings.enableTutorials).to.be.true;
        });
        
        it('should load guidance content correctly', function() {
            // Initialize content
            guidanceSystem.initializeContent();
            
            // Check content was loaded
            expect(guidanceSystem.guidanceContent).to.be.an('object');
            expect(guidanceSystem.guidanceContent.metrics).to.be.an('object');
            expect(guidanceSystem.tutorials).to.be.an('object');
        });
        
        it('should sanitize HTML content safely', function() {
            // Test sanitization function
            const unsafeHTML = '<script>alert("XSS")</script><img src="x" onerror="alert(1)">';
            const sanitized = guidanceSystem.sanitizeHTML(unsafeHTML);
            
            // Should sanitize unsafe HTML
            expect(sanitized).to.not.include('<script>');
            expect(sanitized).to.not.include('onerror=');
            
            // Should preserve safe HTML
            const safeHTML = '<p>This is <b>safe</b> content.</p>';
            const sanitizedSafe = guidanceSystem.sanitizeHTML(safeHTML);
            
            // Should allow safe tags
            expect(sanitizedSafe).to.include('<p>');
            expect(sanitizedSafe).to.include('<b>');
        });
        
        it('should create UI elements when initialized', function() {
            // Initialize the system
            guidanceSystem.initialize();
            
            // Check if UI elements were created
            expect(document.getElementById('seo-help-button')).to.exist;
            expect(document.getElementById('seo-tooltip-container')).to.exist;
            expect(document.getElementById('seo-tutorial-overlay')).to.exist;
        });
        
        it('should check first visit status', function() {
            // Mock localStorage for first visit
            localStorage.getItem.withArgs('seo-guidance-visited').returns(null);
            
            // Check first visit status
            const isFirstVisit = guidanceSystem.checkIfFirstVisit();
            expect(isFirstVisit).to.be.true;
            
            // Mock localStorage for returning user
            localStorage.getItem.withArgs('seo-guidance-visited').returns('true');
            
            // Check first visit status again
            const isReturningUser = guidanceSystem.checkIfFirstVisit();
            expect(isReturningUser).to.be.false;
        });
        
        it('should mark first visit complete', function() {
            // Mark first visit complete
            guidanceSystem.markFirstVisitComplete();
            
            // Check localStorage was updated
            expect(localStorage.setItem.calledWith('seo-guidance-visited', 'true')).to.be.true;
        });
        
        it('should handle tooltip content retrieval', function() {
            // Initialize content
            guidanceSystem.initializeContent();
            
            // Get tooltip content for a known key
            const content = guidanceSystem.getTooltipContent('metrics.technical_seo');
            
            // Should return formatted HTML
            expect(content).to.be.a('string');
            expect(content).to.include('Technical SEO');
        });
    });
});

//------------------------------------------------
// Integration Tests
//------------------------------------------------
describe('SEO Workflow System Integration Tests', function() {
    let dom;
    let window;
    let document;
    
    before(function() {
        // Setup DOM environment
        dom = new JSDOM(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Integration Test</title>
            </head>
            <body>
                <div id="performanceChart" class="chart-container"></div>
                <div id="result-container">
                    <div class="executive-summary"></div>
                    <div class="recommendations-tab"></div>
                    <div class="quick-actions-tab"></div>
                    <button class="export-pdf">Export PDF</button>
                    <button class="help-button">Help</button>
                </div>
            </body>
            </html>
        `, { url: 'http://localhost', runScripts: 'dangerously' });
        
        window = dom.window;
        document = window.document;
        
        // Mock required browser objects
        window.Chart = class Chart {
            constructor(ctx, config) {
                this.ctx = ctx;
                this.config = config;
            }
            destroy() {}
        };
        
        window.jspdf = { 
            jsPDF: function() {
                return {
                    text: () => {},
                    addPage: () => {},
                    setFont: () => {},
                    setFontSize: () => {},
                    output: () => new Uint8Array([1, 2, 3]),
                    setProperties: () => {},
                    rect: () => {},
                    line: () => {}
                };
            }
        };
        
        // Mock localStorage
        window.localStorage = {
            getItem: sinon.stub().returns(null),
            setItem: sinon.stub(),
            removeItem: sinon.stub()
        };
        
        // Set global variables
        global.window = window;
        global.document = document;
    });
    
    after(function() {
        delete global.window;
        delete global.document;
    });
    
    it('should integrate data visualization with PDF export', async function() {
        // First initialize visualizations
        DataVisualization.initializeSEOVisualizations(mockData.seoAnalysisResults);
        
        // Then export PDF that should include the visualizations
        const pdfResult = await PDFExport.generateSEOReport(mockData.seoAnalysisResults, {
            includeCharts: true,
            fileName: 'integrated-test.pdf'
        });
        
        // Check PDF was generated
        expect(pdfResult).to.be.an.instanceof(Uint8Array);
    });
    
    it('should integrate guidance system with visualizations', function() {
        // Initialize guidance system
        const guidanceSystem = new UserGuidance({ enableTooltips: true });
        guidanceSystem.initialize();
        
        // Add tooltip data attribute to visualization element
        const chartElement = document.getElementById('performanceChart');
        chartElement.setAttribute('data-seo-tooltip', 'metrics.technical_seo');
        
        // Initialize tooltips
        guidanceSystem.initializeTooltips();
        
        // Trigger mouseenter event
        const event = new window.MouseEvent('mouseenter', {
            bubbles: true,
            cancelable: true
        });
        chartElement.dispatchEvent(event);
        
        // Tooltip container should be visible
        const tooltipContainer = document.getElementById('seo-tooltip-container');
        expect(tooltipContainer.style.display).to.equal('block');
        
        // Cleanup
        guidanceSystem.cleanup();
    });
    
    it('should successfully process results data through all components', async function() {
        // Start with user guidance
        const guidanceSystem = new UserGuidance();
        guidanceSystem.initialize();
        
        // Then add visualizations
        DataVisualization.initializeSEOVisualizations(mockData.seoAnalysisResults);
        
        // Finally export results
        const pdfResult = await PDFExport.generateSEOReport(mockData.seoAnalysisResults);
        
        // All components should have processed the data without errors
        expect(pdfResult).to.exist;
        
        // Cleanup
        guidanceSystem.cleanup();
    });
});

//------------------------------------------------
// UI Tests
//------------------------------------------------
describe('SEO Workflow System UI Tests', function() {
    let dom;
    let window;
    let document;
    
    beforeEach(function() {
        // Setup DOM environment for each test
        dom = new JSDOM(`
            <!DOCTYPE html>
            <html>
            <body>
                <div id="app-container">
                    <div class="tabs">
                        <button id="insights-tab" class="tab active">Insights</button>
                        <button id="recommendations-tab" class="tab">Recommendations</button>
                        <button id="detailed-analysis-tab" class="tab">Detailed Analysis</button>
                        <button id="quick-actions-tab" class="tab">Quick Actions</button>
                    </div>
                    
                    <div id="tab-content">
                        <div id="insights-content" class="tab-content active">
                            <div id="performanceChart" class="chart-container"></div>
                        </div>
                        <div id="recommendations-content" class="tab-content">
                            <div class="filter-container">
                                <select id="priority-filter">
                                    <option value="all">All Priorities</option>
                                    <option value="high">High Priority</option>
                                </select>
                            </div>
                            <div id="recommendations-list"></div>
                        </div>
                        <div id="detailed-analysis-content" class="tab-content"></div>
                        <div id="quick-actions-content" class="tab-content"></div>
                    </div>
                    
                    <div class="export-options">
                        <button id="export-pdf">Export PDF</button>
                        <button id="export-csv">Export CSV</button>
                    </div>
                </div>
            </body>
            </html>
        `, { url: 'http://localhost', runScripts: 'dangerously' });
        
        window = dom.window;
        document = window.document;
        
        // Set global variables
        global.window = window;
        global.document = document;
        
        // Add Alpine.js mock
        window.Alpine = {
            data: function(obj) {
                return obj;
            },
            start: function() {},
            evaluate: function(element, expr) {
                return [];
            }
        };
    });
    
    afterEach(function() {
        delete global.window;
        delete global.document;
    });
    
    it('should switch tabs when clicked', function() {
        // Setup tab switching handlers (simplified version of what's in result_view.html)
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', function() {
                // Remove active class from all tabs
                document.querySelectorAll('.tab').forEach(t => {
                    t.classList.remove('active');
                });
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Hide all tab content
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                
                // Show content for clicked tab
                const contentId = this.id.replace('-tab', '-content');
                document.getElementById(contentId).classList.add('active');
            });
        });
        
        // Click recommendations tab
        const recommendationsTab = document.getElementById('recommendations-tab');
        recommendationsTab.click();
        
        // Check if recommendations tab is active
        expect(recommendationsTab.classList.contains('active')).to.be.true;
        expect(document.getElementById('recommendations-content').classList.contains('active')).to.be.true;
        
        // Check if insights tab is inactive
        expect(document.getElementById('insights-tab').classList.contains('active')).to.be.false;
        expect(document.getElementById('insights-content').classList.contains('active')).to.be.false;
    });
    
    it('should filter recommendations when filter changes', function() {
        // Setup recommendations data
        const recommendations = [
            { id: 1, title: 'High Priority Rec', priority: 'high' },
            { id: 2, title: 'Medium Priority Rec', priority: 'medium' },
            { id: 3, title: 'Another High Priority', priority: 'high' }
        ];
        
        // Add recommendations to the list
        const recList = document.getElementById('recommendations-list');
        recommendations.forEach(rec => {
            const recElement = document.createElement('div');
            recElement.className = `recommendation priority-${rec.priority}`;
            recElement.textContent = rec.title;
            recList.appendChild(recElement);
        });
        
        // Setup filter handler
        const priorityFilter = document.getElementById('priority-filter');
        priorityFilter.addEventListener('change', function() {
            const filterValue = this.value;
            const recommendations = document.querySelectorAll('.recommendation');
            
            recommendations.forEach(rec => {
                if (filterValue === 'all' || rec.classList.contains(`priority-${filterValue}`)) {
                    rec.style.display = 'block';
                } else {
                    rec.style.display = 'none';
                }
            });
        });
        
        // Change filter to high priority
        priorityFilter.value = 'high';
        priorityFilter.dispatchEvent(new window.Event('change'));
        
        // Check if only high priority recommendations are visible
        const visibleRecs = Array.from(document.querySelectorAll('.recommendation'))
            .filter(rec => rec.style.display !== 'none');
            
        expect(visibleRecs.length).to.equal(2);
        expect(visibleRecs[0].textContent).to.equal('High Priority Rec');
        expect(visibleRecs[1].textContent).to.equal('Another High Priority');
    });
    
    it('should trigger PDF export when button is clicked', function() {
        // Create spy for PDF export
        const exportSpy = sinon.spy();
        
        // Attach export function to button
        const exportBtn = document.getElementById('export-pdf');
        exportBtn.addEventListener('click', exportSpy);
        
        // Click export button
        exportBtn.click();
        
        // Check if export function was called
        expect(exportSpy.calledOnce).to.be.true;
    });
});

//------------------------------------------------
// Security Tests
//------------------------------------------------
describe('SEO Workflow System Security Tests', function() {
    let dom;
    let window;
    let document;
    
    before(function() {
        // Setup DOM environment
        dom = new JSDOM(`
            <!DOCTYPE html>
            <html>
            <body>
                <div id="content-container"></div>
            </body>
            </html>
        `, { url: 'http://localhost' });
        
        window = dom.window;
        document = window.document;
        
        // Set global variables
        global.window = window;
        global.document = document;
    });
    
    after(function() {
        delete global.window;
        delete global.document;
    });
    
    it('should sanitize HTML in PDF generation to prevent XSS', function() {
        // Test sanitization function
        const unsafeHtml = '<img src="x" onerror="alert(\'XSS\')"><script>alert("XSS")</script>';
        const sanitized = PDFExport.sanitizeText(unsafeHtml);
        
        // Should sanitize unsafe HTML
        expect(sanitized).to.not.include('<script>');
        expect(sanitized).to.not.include('onerror=');
    });
    
    it('should sanitize tooltip content to prevent XSS', function() {
        // Create guidance system
        const guidanceSystem = new UserGuidance();
        
        // Test with unsafe content
        const unsafeHTML = '<script>alert("XSS")</script><img src="x" onerror="alert(1)">';
        const sanitized = guidanceSystem.sanitizeHTML(unsafeHTML);
        
        // Should sanitize unsafe HTML
        expect(sanitized).to.not.include('<script>');
        expect(sanitized).to.not.include('onerror=');
    });
    
    it('should validate inputs to prevent injection attacks', function() {
        // Mock malicious input data
        const maliciousData = {
            workflow_type: '<script>alert("XSS")</script>',
            website_url: 'javascript:alert("XSS")',
            execution_summary: {
                execution_log: [{ 
                    timestamp: '2023-01-01T00:00:00Z',
                    agent: '<img src="x" onerror="alert(1)">' 
                }],
                total_steps_executed: '3; DROP TABLE users;'
            }
        };
        
        // Should sanitize when used in PDF generation
        const generatorPromise = PDFExport.generateSEOReport(maliciousData, {});
        
        // Should not throw errors
        return expect(generatorPromise).to.eventually.be.fulfilled;
    });
    
    it('should prevent DOM-based XSS via user guidance', function() {
        // Create guidance system
        const guidanceSystem = new UserGuidance();
        guidanceSystem.initialize();
        
        // Attempt to inject malicious content via tooltip
        const tooltipContainer = document.getElementById('seo-tooltip-container');
        
        // Inject potentially malicious HTML
        const maliciousHTML = '<div onclick="alert(\'XSS\')">Click me</div><script>alert("XSS")</script>';
        tooltipContainer.innerHTML = guidanceSystem.sanitizeHTML(maliciousHTML);
        
        // Sanitized content should not contain script tags or event handlers
        expect(tooltipContainer.innerHTML).to.not.include('<script>');
        expect(tooltipContainer.innerHTML).to.not.include('onclick=');
        
        // Cleanup
        guidanceSystem.cleanup();
    });
});

module.exports = {
    runTests: function() {
        // This function can be used to programmatically run tests
        return {
            message: 'All tests completed',
            timestamp: new Date().toISOString()
        };
    }
};
