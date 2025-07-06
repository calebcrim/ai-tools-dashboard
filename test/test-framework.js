/**
 * Custom Test Framework with Strict Output Monitoring
 * Follows all specified testing rules
 */

class TestRunner {
    static suites = [];
    static currentSuite = null;
    static results = {
        passed: 0,
        failed: 0,
        running: 0
    };
    static consoleCapture = [];
    static originalConsole = {};
    
    /**
     * Initialize console capture to monitor all output
     * RULE: All console output must be captured and verified
     */
    static initializeConsoleCapture() {
        const methods = ['log', 'warn', 'error', 'info', 'debug'];
        
        methods.forEach(method => {
            this.originalConsole[method] = console[method];
            console[method] = (...args) => {
                const entry = {
                    type: method,
                    message: args.join(' '),
                    timestamp: new Date().toISOString(),
                    stack: new Error().stack
                };
                
                this.consoleCapture.push(entry);
                this.updateConsoleDisplay(entry);
                
                // Still output to original console for debugging
                this.originalConsole[method](...args);
            };
        });
    }
    
    static updateConsoleDisplay(entry) {
        const consoleContent = document.getElementById('console-content');
        if (consoleContent) {
            const entryEl = document.createElement('div');
            entryEl.className = `console-entry ${entry.type}`;
            entryEl.textContent = `[${entry.type.toUpperCase()}] ${entry.message}`;
            consoleContent.appendChild(entryEl);
            consoleContent.scrollTop = consoleContent.scrollHeight;
        }
    }
    
    /**
     * Define a test suite
     */
    static describe(name, fn) {
        const suite = {
            name,
            tests: [],
            beforeEach: null,
            afterEach: null,
            beforeAll: null,
            afterAll: null
        };
        
        this.currentSuite = suite;
        this.suites.push(suite);
        
        // Clear console capture for this suite
        this.consoleCapture = [];
        
        fn();
        
        this.currentSuite = null;
    }
    
    /**
     * Define a test case
     */
    static test(name, fn) {
        if (!this.currentSuite) {
            throw new Error('test() must be called within describe()');
        }
        
        this.currentSuite.tests.push({ name, fn });
    }
    
    /**
     * Lifecycle hooks
     */
    static beforeEach(fn) {
        if (this.currentSuite) {
            this.currentSuite.beforeEach = fn;
        }
    }
    
    static afterEach(fn) {
        if (this.currentSuite) {
            this.currentSuite.afterEach = fn;
        }
    }
    
    static beforeAll(fn) {
        if (this.currentSuite) {
            this.currentSuite.beforeAll = fn;
        }
    }
    
    static afterAll(fn) {
        if (this.currentSuite) {
            this.currentSuite.afterAll = fn;
        }
    }
    
    /**
     * Run all test suites
     */
    static async run() {
        this.initializeConsoleCapture();
        const resultsContainer = document.getElementById('test-results');
        
        for (const suite of this.suites) {
            const suiteEl = document.createElement('div');
            suiteEl.className = 'test-suite';
            suiteEl.innerHTML = `<h2>${suite.name}</h2>`;
            resultsContainer.appendChild(suiteEl);
            
            // Run beforeAll
            if (suite.beforeAll) {
                await suite.beforeAll();
            }
            
            // Run each test
            for (const test of suite.tests) {
                const testEl = document.createElement('div');
                testEl.className = 'test-case running';
                testEl.innerHTML = `
                    <span>${test.name}</span>
                    <span class="test-status">Running...</span>
                `;
                suiteEl.appendChild(testEl);
                
                this.updateStats();
                this.results.running++;
                
                // Clear console capture before each test
                const captureStart = this.consoleCapture.length;
                
                try {
                    // Run beforeEach
                    if (suite.beforeEach) {
                        await suite.beforeEach();
                    }
                    
                    // Run test
                    await test.fn();
                    
                    // Check for unexpected console output
                    const testOutput = this.consoleCapture.slice(captureStart);
                    const unexpectedOutput = testOutput.filter(entry => 
                        entry.type === 'error' || 
                        entry.type === 'warn'
                    );
                    
                    if (unexpectedOutput.length > 0) {
                        throw new Error(
                            `Test produced unexpected console output:\n` +
                            unexpectedOutput.map(e => `${e.type}: ${e.message}`).join('\n')
                        );
                    }
                    
                    // Test passed
                    testEl.className = 'test-case pass';
                    testEl.querySelector('.test-status').textContent = '✓ Passed';
                    this.results.passed++;
                    
                } catch (error) {
                    // Test failed
                    testEl.className = 'test-case fail';
                    testEl.querySelector('.test-status').textContent = '✗ Failed';
                    this.results.failed++;
                    
                    // Add error output
                    const outputEl = document.createElement('div');
                    outputEl.className = 'test-output';
                    outputEl.textContent = error.stack || error.message;
                    testEl.appendChild(outputEl);
                    
                } finally {
                    // Run afterEach
                    if (suite.afterEach) {
                        await suite.afterEach();
                    }
                    
                    this.results.running--;
                    this.updateStats();
                }
            }
            
            // Run afterAll
            if (suite.afterAll) {
                await suite.afterAll();
            }
        }
        
        // Final report
        this.generateReport();
    }
    
    static updateStats() {
        document.getElementById('stat-running').textContent = `Running: ${this.results.running}`;
        document.getElementById('stat-passed').textContent = `Passed: ${this.results.passed}`;
        document.getElementById('stat-failed').textContent = `Failed: ${this.results.failed}`;
    }
    
    static generateReport() {
        const total = this.results.passed + this.results.failed;
        const successRate = total > 0 ? (this.results.passed / total * 100).toFixed(1) : 0;
        
        console.log('='.repeat(60));
        console.log('TEST SUITE COMPLETED');
        console.log('='.repeat(60));
        console.log(`Total Tests: ${total}`);
        console.log(`Passed: ${this.results.passed}`);
        console.log(`Failed: ${this.results.failed}`);
        console.log(`Success Rate: ${successRate}%`);
        console.log('='.repeat(60));
    }
}

/**
 * Assertion utilities with output validation
 */
class Assert {
    static equal(actual, expected, message = '') {
        if (actual !== expected) {
            throw new Error(
                message || `Expected ${expected} but got ${actual}`
            );
        }
    }
    
    static deepEqual(actual, expected, message = '') {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
            throw new Error(
                message || `Objects are not equal:\nActual: ${JSON.stringify(actual, null, 2)}\nExpected: ${JSON.stringify(expected, null, 2)}`
            );
        }
    }
    
    static ok(value, message = '') {
        if (!value) {
            throw new Error(message || `Expected truthy value but got ${value}`);
        }
    }
    
    static notOk(value, message = '') {
        if (value) {
            throw new Error(message || `Expected falsy value but got ${value}`);
        }
    }
    
    static includes(array, item, message = '') {
        if (!array.includes(item)) {
            throw new Error(
                message || `Expected array to include ${item}`
            );
        }
    }
    
    static throws(fn, expectedError, message = '') {
        try {
            fn();
            throw new Error(message || 'Expected function to throw');
        } catch (error) {
            if (expectedError && !error.message.includes(expectedError)) {
                throw new Error(
                    message || `Expected error containing "${expectedError}" but got "${error.message}"`
                );
            }
        }
    }
    
    /**
     * Special assertion for validating console output
     * RULE: Test output must be pristine
     */
    static noConsoleErrors(consoleCapture) {
        const errors = consoleCapture.filter(entry => entry.type === 'error');
        if (errors.length > 0) {
            throw new Error(
                `Unexpected console errors:\n${errors.map(e => e.message).join('\n')}`
            );
        }
    }
    
    static noConsoleWarnings(consoleCapture) {
        const warnings = consoleCapture.filter(entry => entry.type === 'warn');
        if (warnings.length > 0) {
            throw new Error(
                `Unexpected console warnings:\n${warnings.map(e => e.message).join('\n')}`
            );
        }
    }
}

// Make test utilities globally available
window.describe = TestRunner.describe.bind(TestRunner);
window.test = TestRunner.test.bind(TestRunner);
window.beforeEach = TestRunner.beforeEach.bind(TestRunner);
window.afterEach = TestRunner.afterEach.bind(TestRunner);
window.beforeAll = TestRunner.beforeAll.bind(TestRunner);
window.afterAll = TestRunner.afterAll.bind(TestRunner);
window.assert = Assert;
window.TestRunner = TestRunner;