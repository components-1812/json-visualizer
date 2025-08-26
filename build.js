import build from "@components-1812/build-tools";
import {HtmlMinifier, RawCSSLoader} from "@components-1812/build-tools/plugins";
import path from "node:path";

const SOURCE = path.resolve(import.meta.dirname, 'src');
const OUTPUT = path.resolve(import.meta.dirname, 'dist');

const BUILD_ENTRIES = [
    {   
        name: 'JSONVisualizer.min.js',
        options: {
            entryPoints: ['JSONVisualizer.js'],
            minify: true,
            bundle: true,
            sourcemap: false,
            target: 'esnext',
            outfile: 'JSONVisualizer.min.js',
            plugins: [HtmlMinifier({svg: true})]
        }
    },
    {
        name: 'JSONVisualizer.min.css',
        options: {
            entryPoints: ['JSONVisualizer.css'],
            minify: true,
            outfile: 'JSONVisualizer.min.css',
        }
    },
    {   
        name: 'JSONVisualizerBase.min.js',
        options: {
            entryPoints: ['JSONVisualizerBase.js'],
            minify: true,
            sourcemap: false,
            target: 'esnext',
            outfile: 'JSONVisualizerBase.min.js',
            plugins: [HtmlMinifier({svg: true})]
        }
    },
    {   
        name: 'JSONTokenizer.min.js',
        options: {
            entryPoints: ['JSONTokenizer.js'],
            minify: true,
            sourcemap: false,
            target: 'esnext',
            outfile: 'JSONTokenizer.min.js',
        }
    },
    {   
        name: 'index.js',
        options: {
            entryPoints: ['index.js'],
            bundle: true,
            minify: true,
            sourcemap: false,
            target: 'esnext',
            outfile: 'index.min.js',
            plugins: [RawCSSLoader(), HtmlMinifier({svg: true})]
        }
    },
];


await build({
    entries: BUILD_ENTRIES,
    output: OUTPUT,
    source: SOURCE
});