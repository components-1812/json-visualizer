import {test} from "node:test";
import { JSONTokenizer } from "../src/JSONTokenizer.js";

const TARGETS = [
    { name: 'full hex color', value: '#ff00ff', expected: { isColor: true, type: 'hex' } },
    { name: 'short hex color', value: '#f0f', expected: { isColor: true, type: 'hex' } },
    { name: 'rgb color', value: 'rgb(255, 0, 255)', expected: { isColor: true, type: 'rgb' } },
    { name: 'rgba color', value: 'rgba(255, 0, 255, 0.5)', expected: { isColor: true, type: 'rgba' } },
    { name: 'hsl color', value: 'hsl(300, 100%, 50%)', expected: { isColor: true, type: 'hsl' } },
    { name: 'hsla color', value: 'hsla(300, 100%, 50%, 0.5)', expected: { isColor: true, type: 'hsla' } },
    { name: 'invalid hex color', value: '#ff00fg', expected: { isColor: false, type: null } },
    { name: 'invalid rgb color', value: 'rgb(255, 0, 256)', expected: { isColor: false, type: null } },
    { name: 'invalid rgba color', value: 'rgba(255, 0, 255)', expected: { isColor: false, type: null } },
    { name: 'invalid hsl color', value: 'hsl(300, 101%, 50%)', expected: { isColor: false, type: null } },
    { name: 'invalid hsla color', value: 'hsla(300, 100%, 50%)', expected: { isColor: false, type: null } },
    { name: 'empty string', value: '', expected: { isColor: false, type: null } },
    { name: 'string with spaces', value: '  #f0f  ', expected: { isColor: false, type: null } },
    { name: 'string with new line', value: '\n#f0f\n', expected: { isColor: false, type: null } },
    { name: 'inside ""', value: '"#ff00ff"', expected: { isColor: false, type: null } },
    { name: 'inside ``', value: '`rgb(255, 0, 255)`', expected: { isColor: false, type: null } },
    { name: "inside ''", value: "'hsl(300, 100%, 50%)'", expected: { isColor: false, type: null } },
    { name: 'hex with alpha', value: '#ff00ff80', expected: { isColor: true, type: 'hex' } },
    { name: 'rgb with spaces', value: 'rgb( 255, 0, 255 )', expected: { isColor: true, type: 'rgb' } },
    { name: 'rgba with 0 alpha', value: 'rgba(255, 0, 255, 0)', expected: { isColor: true, type: 'rgba' } },
    { name: 'rgba with 1 alpha', value: 'rgba(255, 0, 255, 1)', expected: { isColor: true, type: 'rgba' } },
    { name: 'hsl with spaces', value: 'hsl( 300, 100%, 50% )', expected: { isColor: true, type: 'hsl' } },
    { name: 'hsla with 0 alpha', value: 'hsla(300, 100%, 50%, 0)', expected: { isColor: true, type: 'hsla' } },
    { name: 'hsla with 1 alpha', value: 'hsla(300, 100%, 50%, 1)', expected: { isColor: true, type: 'hsla' } },
    { name: 'rgb with float alpha', value: 'rgba(10, 20, 30, 0.123)', expected: { isColor: true, type: 'rgba' } },
    { name: 'hsl with float alpha', value: 'hsla(10, 20%, 30%, 0.123)', expected: { isColor: true, type: 'hsla' } },
    { name: 'rgb with uppercase', value: 'RGB(255, 0, 255)', expected: { isColor: true, type: 'rgb' } },
    { name: 'hsl with uppercase', value: 'HSL(300, 100%, 50%)', expected: { isColor: true, type: 'hsl' } },
    { name: 'rgba with uppercase', value: 'RGBA(255, 0, 255, 0.5)', expected: { isColor: true, type: 'rgba' } },
    { name: 'hsla with uppercase', value: 'HSLA(300, 100%, 50%, 0.5)', expected: { isColor: true, type: 'hsla' } },
    { name: 'hex without #', value: 'ff00ff', expected: { isColor: false, type: null } },
    { name: 'rgb without rgb()', value: '255, 0, 255', expected: { isColor: false, type: null } },
    { name: 'hsl without hsl()', value: '300, 100%, 50%', expected: { isColor: false, type: null } },
    { name: 'random string', value: 'not a color', expected: { isColor: false, type: null } },
    { name: 'number', value: 12345, expected: { isColor: false, type: null } },
    { name: 'null', value: null, expected: { isColor: false, type: null } },
    { name: 'boolean', value: true, expected: { isColor: false, type: null } },
    { name: 'object', value: {}, expected: { isColor: false, type: null } },
    { name: 'array', value: [], expected: { isColor: false, type: null } },
    { name: 'function', value: () => {}, expected: { isColor: false, type: null } },
    { name: 'undefined', value: undefined, expected: { isColor: false, type: null } },
    { name: 'named color: red', value: 'red', expected: { isColor: true, type: 'named' } },
    { name: 'named color: blue', value: 'blue', expected: { isColor: true, type: 'named' } },
    { name: 'named color: green', value: 'green', expected: { isColor: true, type: 'named' } },
    { name: 'named color: transparent', value: 'transparent', expected: { isColor: true, type: 'named' } },
    { name: 'named color: rebeccapurple', value: 'rebeccapurple', expected: { isColor: true, type: 'named' } },
    { name: 'invalid named color', value: 'notacolorname', expected: { isColor: false, type: null } },
];



test('JSONTokenizer is-color', async (t) => {

    for (const target of TARGETS) {

        const {name, value, expected} = target;

        await t.test(name, (t) => {

            const tokenizer = new JSONTokenizer();

            const result = tokenizer._isColor(value);

            try {

                t.assert.deepEqual(result, expected);
            }
            catch(err){

                console.log({name, value, result, expected});
                throw err;
            }
        });
    }
});