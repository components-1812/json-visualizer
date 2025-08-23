import esbuild from "esbuild";
import path from "node:path";
import fs from "node:fs";
import {minify} from "html-minifier-terser";

const SOURCE = path.resolve(import.meta.dirname, 'src');
const OUTPUT = path.resolve(import.meta.dirname, 'dist');

const BUILD_ENTRIES = [
    // {   
    //     name: 'JSONVisualizer.min.js',
    //     options: {
    //         entryPoints: [path.join(SOURCE, 'JSONVisualizer.js')],
    //         minify: true,
    //         bundle: true,
    //         sourcemap: false,
    //         target: 'esnext',
    //         outfile: path.join(OUTPUT, 'JSONVisualizer.min.js'),
    //     }
    // },
    // {
    //     name: 'JSONVisualizer.min.css',
    //     options: {
    //         entryPoints: [path.join(SOURCE, 'JSONVisualizer.css')],
    //         minify: true,
    //         outfile: path.join(OUTPUT, 'JSONVisualizer.min.css'),
    //     }
    // },
    // {   
    //     name: 'JSONVisualizerBase.min.js',
    //     options: {
    //         entryPoints: [path.join(SOURCE, 'JSONVisualizerBase.js')],
    //         minify: true,
    //         sourcemap: false,
    //         target: 'esnext',
    //         outfile: path.join(OUTPUT, 'JSONVisualizerBase.min.js'),
    //     }
    // },
    // {   
    //     name: 'JSONTokenizer.min.js',
    //     options: {
    //         entryPoints: [path.join(SOURCE, 'JSONTokenizer.js')],
    //         minify: true,
    //         sourcemap: false,
    //         target: 'esnext',
    //         outfile: path.join(OUTPUT, 'JSONTokenizer.min.js'),
    //     }
    // },
    {   
        name: 'index.js',
        options: {
            entryPoints: [path.join(SOURCE, 'index.js')],
            bundle: true,
            minify: true,
            sourcemap: false,
            target: 'esnext',
            outfile: path.join(OUTPUT, 'index.min.js'),
            plugins: [rawCSSPlugin(), minifyHTMLPlugin()]
        }
    },
];

// Asegurarse de que dist exista
if (!fs.existsSync(OUTPUT)) fs.mkdirSync(OUTPUT);

for (const {name, options} of BUILD_ENTRIES) {
    
    try {
        await esbuild.build(options);

        console.log(`Build success: ${name}`);
    } 
    catch (error) {

        console.log(error);
    }
}



//MARK: Plugins
/**
 *  Support for import ?raw from '.css'
 *  Load the css file and minify it
 */
function rawCSSPlugin(){

    return {
        name: 'raw-css-loader',
        setup(build) {

            build.onResolve({ filter: /\.css\?raw$/  }, (args) => {

                return {
                    path: path.resolve(args.resolveDir, args.path.replace('?raw','')),
                    namespace: 'raw-file'
                };
            });

            build.onLoad({ filter: /.*/, namespace: 'raw-file' }, async (args) => {

                const content = await fs.promises.readFile(args.path, 'utf8');

                // Minify the CSS using esbuild transform API
                const { code } = await esbuild.transform(content, {
                    loader: "css",
                    minify: true
                });

                return {
                    contents: `export default ${JSON.stringify(code)};`,
                    loader: 'js'
                };
            });
        }
    };
};

/**
 *  Minify the HTML inside the JavaScript string literals using the html-minifier library
 */
export function minifyHTMLPlugin() {

    async function minifyHTML(contents) {

        const regex = /\/\*html\*\/\s*`([\s\S]*?)`/g;

        const matchs = [...contents.matchAll(regex)];

        if(matchs.length === 0) return contents;

        for(const match of matchs) {
            
            const [_, html] = match;

            const minified = await minify(html, {
                removeComments: true,
                collapseWhitespace: true,
                collapseInlineTagWhitespace: true,
                removeAttributeQuotes: true,
                collapseBooleanAttributes: true,
            });

            contents = contents.replace('`' + html + '`', '`' + minified + '`');
        }

        return contents;
    }

    async function minifySVG(contents) {

        const regex = /`([^`]*?<svg\b[\s\S]*?<\/svg>[^`]*)`/gi;

        const matchs = [...contents.matchAll(regex)];

        if(matchs.length === 0) return contents;

        for(const match of matchs) {
            
            const [_, html] = match;

            const minified = await minify(html, {
                removeComments: true,
                collapseWhitespace: true,
                collapseInlineTagWhitespace: true,
                removeAttributeQuotes: true,
                collapseBooleanAttributes: true,
            });

            contents = contents.replace('`' + html + '`', '`' + minified + '`');
        }

        return contents;
    }

    return {
        name: 'html-minify',
        setup(build) {
            
            build.onLoad({ filter: /\.js$/ }, async (args) => {

                const fs = await import('node:fs/promises')
                let contents = await fs.readFile(args.path, 'utf8');

                contents = await minifyHTML(contents);
                contents = await minifySVG(contents);

                return { contents, loader: 'default' }
            })
        }
    }
}
