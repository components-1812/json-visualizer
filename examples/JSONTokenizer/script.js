import { debounce, editorKeydownHandler } from "./utils.js";

const MODE = 'development';

const SOURCES = {
    development: {
        JSONVisualizer: '../../src/JSONVisualizer.js',
        JSONVisualizerCSS: '../../src/JSONVisualizer.css'
    },
    production: {
        JSONVisualizer: "https://cdn.jsdelivr.net/npm/@components-1812/json-visualizer@0.0.3/src/JSONVisualizer.min.js",
        JSONVisualizerCSS: 'https://cdn.jsdelivr.net/npm/@components-1812/json-visualizer@0.0.3/src/JSONVisualizer.min.css'
    }
}

const {JSONVisualizer} = await import(SOURCES[MODE].JSONVisualizer);
const JSONVisualizerCSS = SOURCES[MODE].JSONVisualizerCSS;

console.log('MODE:', MODE);
console.log(JSONVisualizer);
console.log(JSONVisualizerCSS);

JSONVisualizer.define('custom-json-visualizer', {
    links: [JSONVisualizerCSS]
});


const $editor = document.querySelector('#editor');
const $visualizer = document.querySelector('custom-json-visualizer');


const generateTokens = debounce(async () => {

    const tokens = await JSONVisualizer.getTokens($editor.value, {
        detectColor: true,
        detectURL: true,
        strict: 'auto'
    });

    $visualizer.renderJSON(tokens);

}, 500);

$editor.addEventListener('keydown', editorKeydownHandler);

$editor.addEventListener('input', () => {

    console.log('change:', $editor.value);

    generateTokens();
});