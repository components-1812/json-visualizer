import JSONTokenizer from "../../../src/JSONTokenizer.js";

const isNode = typeof process !== 'undefined' && process.versions?.node != null;
const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

async function minifyJSONPerformanceTest(rawJSON, options = {}){

    const {iterations = 1} = options;

    const performance = await (async () => {

        if(isBrowser) return window.performance;

        if(isNode){

            const { performance } = await import('node:perf_hooks');

            return performance;
        }
    })();

    const size = new TextEncoder().encode(rawJSON).length;

    console.log(`Enviroment: ${isNode ? 'Node' : 'Browser'}`);
    console.log(`JSON length: ${rawJSON.length} chars - ${formatBytes(size)}`);
    console.log(`Iterations: ${iterations}`);

    const tokenizer = new JSONTokenizer();

    // Test with strict: true
    let start = performance.now();

    for (let i = 0; i < iterations; i++){

        tokenizer.clearJSON(rawJSON, { strict: true });
    }

    let end = performance.now();

    console.log(`Minify with {strict: true} took ${(end - start).toFixed(2)}ms`);

    // Test with strict: false
    start = performance.now();

    for (let i = 0; i < iterations; i++) {
        tokenizer.clearJSON(rawJSON, { strict: false });
    }

    end = performance.now();

    console.log(`Minify with {strict: false} took ${(end - start).toFixed(2)}ms`);
}


function runTest(options = {}){

    const {size = 100000, iterations = 1} = options;

    const bigJsonArray = Array.from({ length: size }, (_, i) => ({
        id: i,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        active: i % 2 === 0,
        age: 18 + (i % 50),
        tags: [`tag${i % 5}`, `group${i % 10}`],
        meta: {
            score: Math.random() * 100,
            created: new Date().toISOString(),
            preferences: {
                newsletter: i % 3 === 0,
                notifications: i % 5 !== 0
            }
        }
    }));

    const rawJson = JSON.stringify(bigJsonArray, null, 2);

    minifyJSONPerformanceTest(rawJson, { iterations });
}


if(isNode) runTest();
if(isBrowser) window.runTest = runTest;



/**
 * Previous tests
 * 
 * JSON length: 3612135
 * Iterations: 1
 * minify with {strict: true} took 31.56 ms
 * minify with {strict: false} took 261.19 ms
 * 
 * JSON length: 3612235
 * Iterations: 10
 * minify with {strict: true} took 281.03 ms
 * minify with {strict: false} took 2378.56 ms
 * 
 * - With Array in place of `+=` and without regex test
 * 
 * JSON length: 3612191
 * Iterations: 1
 * minify with {strict: true} took 31.83 ms
 * minify with {strict: false} took 139.40 ms
 * 
 * JSON length: 3612168
 * Iterations: 10
 * minify with {strict: true} took 280.93 ms
 * minify with {strict: false} took 1187.29 ms
 */