const TestRunner = (() => {
  const suites = [];
  let currentSuite = null;

  function describe(name, fn) {
    const suite = { name, tests: [], beforeEachFn: null };
    suites.push(suite);
    const prev = currentSuite;
    currentSuite = suite;
    fn();
    currentSuite = prev;
  }

  function beforeEach(fn) {
    if (currentSuite) currentSuite.beforeEachFn = fn;
  }

  function it(name, fn) {
    if (currentSuite) currentSuite.tests.push({ name, fn });
  }

  function expect(actual) {
    return {
      toBe(expected) {
        if (actual !== expected) {
          throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
        }
      },
      toEqual(expected) {
        const a = JSON.stringify(actual);
        const b = JSON.stringify(expected);
        if (a !== b) {
          throw new Error(`Expected ${b}, got ${a}`);
        }
      },
      toBeTruthy() {
        if (!actual) {
          throw new Error(`Expected truthy, got ${JSON.stringify(actual)}`);
        }
      },
      toBeFalsy() {
        if (actual) {
          throw new Error(`Expected falsy, got ${JSON.stringify(actual)}`);
        }
      },
      toBeGreaterThan(expected) {
        if (!(actual > expected)) {
          throw new Error(`Expected ${actual} > ${expected}`);
        }
      },
      toBeLessThan(expected) {
        if (!(actual < expected)) {
          throw new Error(`Expected ${actual} < ${expected}`);
        }
      },
      toThrow() {
        if (typeof actual !== 'function') {
          throw new Error('Expected a function');
        }
        let threw = false;
        try { actual(); } catch (e) { threw = true; }
        if (!threw) {
          throw new Error('Expected function to throw');
        }
      },
      toContain(expected) {
        if (typeof actual === 'string') {
          if (!actual.includes(expected)) {
            throw new Error(`Expected "${actual}" to contain "${expected}"`);
          }
        } else if (Array.isArray(actual)) {
          if (!actual.includes(expected)) {
            throw new Error(`Expected array to contain ${JSON.stringify(expected)}`);
          }
        }
      },
      toBeInstanceOf(expected) {
        if (!(actual instanceof expected)) {
          throw new Error(`Expected instance of ${expected.name}`);
        }
      },
      toBeNull() {
        if (actual !== null) {
          throw new Error(`Expected null, got ${JSON.stringify(actual)}`);
        }
      },
      not: {
        toBe(expected) {
          if (actual === expected) {
            throw new Error(`Expected ${JSON.stringify(actual)} not to be ${JSON.stringify(expected)}`);
          }
        },
        toBeNull() {
          if (actual === null) {
            throw new Error('Expected non-null');
          }
        },
        toBeTruthy() {
          if (actual) {
            throw new Error(`Expected falsy, got ${JSON.stringify(actual)}`);
          }
        }
      }
    };
  }

  async function run() {
    const results = [];

    for (const suite of suites) {
      const suiteResult = { name: suite.name, tests: [] };

      for (const test of suite.tests) {
        if (suite.beforeEachFn) {
          try { await suite.beforeEachFn(); } catch (e) { /* ignore setup errors */ }
        }

        try {
          await test.fn();
          suiteResult.tests.push({ name: test.name, passed: true });
        } catch (error) {
          suiteResult.tests.push({ name: test.name, passed: false, error: error.message });
        }
      }

      results.push(suiteResult);
    }

    return results;
  }

  function render(results) {
    const container = document.getElementById('test-results');
    if (!container) return;

    let totalPassed = 0;
    let totalFailed = 0;
    let html = '';

    for (const suite of results) {
      html += `<div class="suite"><h2>${suite.name}</h2>`;
      for (const test of suite.tests) {
        if (test.passed) {
          totalPassed++;
          html += `<div class="test pass">&#10003; ${test.name}</div>`;
        } else {
          totalFailed++;
          html += `<div class="test fail">&#10007; ${test.name}<div class="error">${test.error}</div></div>`;
        }
      }
      html += '</div>';
    }

    const summary = `<div class="summary ${totalFailed ? 'has-failures' : ''}">${totalPassed} passed, ${totalFailed} failed</div>`;
    container.innerHTML = summary + html;
  }

  return { describe, it, expect, beforeEach, run, render };
})();

if (typeof window !== 'undefined') {
  window.describe = TestRunner.describe;
  window.it = TestRunner.it;
  window.expect = TestRunner.expect;
  window.beforeEach = TestRunner.beforeEach;
}
