import {test} from "node:test";
import { JSONTokenizer } from "../src/JSONTokenizer.js";

const TARGETS = [
    {name: 'integer', number: 1812},
    {name: 'negative integer', number: -2085},
    {name: 'real number', number: 3.141592653589793},
    {name: 'negative real number', number: -3853.1415926},
    {name: 'scientific notation', number: 6.022e+23},
    {name: 'negative scientific notation', number: -6.022e-23},
    {name: 'zero', number: 0},
    {name: 'negative zero', number: -0},
    {name: 'negative zero decimal', number: -0.0},
    {name: 'large integer', number: 9007199254740991},
    {name: 'small integer', number: -9007199254740991},
    {name: 'decimal with leading zero', number: 0.123},
    {name: 'decimal with trailing zero', number: 1.0},
    {name: 'scientific notation with positive exponent', number: 1.23e+5},
    {name: 'scientific notation with negative exponent', number: 1.23e-5},
    {name: 'scientific notation with capital E', number: 1.23E+5},
    {name: 'scientific notation with capital E and negative exponent', number: 1.23E-5},
    {name: 'number with many decimal places', number: 0.1234567890123456789},
    {name: 'number with many leading zeros in decimal', number: 0.0000000000000000001},
    {name: 'number with many trailing zeros in decimal', number: 1.0000000000000000000},
    {name: '1.0', number: 1.0},
    {name: '0.5', number: 0.5},
];

test('JSONTokenizer parse-number', async (t) => {

    for (const target of TARGETS) {

        const {name, number} = target;

        await t.test(name, (t) => {
            const rawJSON = JSON.stringify({number});

            const i = rawJSON.indexOf(`:`) + 1;
            const endIndex = rawJSON.lastIndexOf('}') - 1;

            const tokenizer = new JSONTokenizer(); 
            const result = tokenizer._parseNumber(rawJSON, i);

            const expected = { value: number, raw: JSON.stringify(number), endIndex };

            t.assert.equal(rawJSON.at(i), String(number).at(0));
            t.assert.equal(rawJSON.at(result.endIndex), String(number).at(-1));
            t.assert.deepEqual(result, expected);
        });
    }
});

const INCOMPLETE_TARGETS = [
    {
        name: 'incomplete +-', value: '{"number": +1-81+2',
        startIndex: 11
    },
    {
        name: 'incomplete integer with letter', value: '{"number": 123f',
        startIndex: 11
    },
    {
        name: 'incomplete negative integer', value: '{"number": -123d',
        startIndex: 11
    },
    {
        name: 'incomplete real number', value: '{"number": 123.456-',
        startIndex: 11
    },
    {
        name: 'incomplete negative real number', value: '{"number": -123.456+',
        startIndex: 11
    },
    {
        name: 'incomplete scientific notation', value: '{"number": 1.23e"',
        startIndex: 11
    },
    {
        name: 'incomplete negative scientific notation', value: '{"number": -1.2"3e',
        startIndex: 11
    },
];

test('JSONTokenizer parse-number incomplete', async (t) => {

    for (const target of INCOMPLETE_TARGETS) {

        const {name, value, startIndex: i} = target;

        await t.test(name, (t) => {
    
            const tokenizer = new JSONTokenizer(); 
            const result = tokenizer._parseNumber(value, i);

            const expected = null;

            t.assert.deepEqual(result, expected);
        });
    }
});