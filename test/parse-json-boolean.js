import {test} from "node:test";
import { JSONTokenizer } from "../src/JSONTokenizer.js";

const TARGETS = [
    {name: 'true', value: {boolean: true}},
    {name: 'false', value: {boolean: false}},
];


test('JSONTokenizer parse-boolean', async (t) => {

    for (const target of TARGETS) {

        const {name, value} = target;

        await t.test(name, (t) => {

            const rawJSON = JSON.stringify(value);
            const i = rawJSON.indexOf(`:`) + 1;
            const endIndex = rawJSON.lastIndexOf('e');

            const tokenizer = new JSONTokenizer();

            const result = tokenizer._parseBoolean(rawJSON, i);

            const expected = { value: value.boolean, raw: JSON.stringify(value.boolean), endIndex };

            t.assert.ok( ['t', 'f'].includes(rawJSON.at(i)) );
            t.assert.equal(rawJSON.at(result.endIndex), 'e');
            t.assert.deepEqual(result, expected);
        });
    }

});

const INCOMPLETE_TARGETS = [
    {
        name: 'incomplete tru', value: '{"boolean": tru', 
        startIndex: 12
    },
    {
        name: 'incomplete tr', value: '{"boolean": tr',
        startIndex: 12,
    },
    {
        name: 'incomplete fal', value: '{"boolean": fal',
        startIndex: 12,
    },
    {
        name: 'incomplete fals', value: '{"boolean": fals',
        startIndex: 12,
    },
    {
        name: 'incomplete falsed', value: '{"boolean": falsed',
        startIndex: 12,
    },
    {
        name: 'incomplete false"', value: '{"boolean": false"',
        startIndex: 12,
    },
    {
        name: 'incomplete false45', value: '{"boolean": false45',
        startIndex: 12,
    },
];

test('JSONTokenizer parse-boolean incomplete', async (t) => {

    for (const target of INCOMPLETE_TARGETS) {

        const {name, value, startIndex: i} = target;

        await t.test(name, (t) => {

            const rawJSON = value;

            const tokenizer = new JSONTokenizer();

            const result = tokenizer._parseBoolean(rawJSON, i);

            const expected = null;

            t.assert.ok( ['t', 'f'].includes(rawJSON.at(i)) );
            t.assert.deepEqual(result, expected);
        });
    }

});


test('JSONTokenizer parse-boolean: null', (t) => {

    const example = { "null-value": null };
    const rawJSON = JSON.stringify(example);

    const i = rawJSON.indexOf(`:n`) + 1;
    const endIndex = i + 3;

    const tokenizer = new JSONTokenizer();

    const result = tokenizer._parseNull(rawJSON, i);
    const expected = { value: null, raw: 'null', endIndex };

    t.assert.equal(rawJSON.at(i), 'n');
    t.assert.equal(rawJSON.at(result.endIndex), 'l');
    t.assert.deepEqual(result, expected);
});


test('JSONTokenizer parse-boolean: null incomplete', async (t) => {

    const TARGETS = [
        {
            name: 'incomplete nu', value: '{"null-value": nu', 
            startIndex: 18
        },
        {
            name: 'incomplete nul', value: '{"null-value": nul', 
            startIndex: 18
        },
        {
            name: 'incomplete n', value: '{"null-value": n', 
            startIndex: 18
        },
        {
            name: 'incomplete NULL', value: '{"null-value": NULL', 
            startIndex: 18
        },
        {
            name: 'incomplete Null', value: '{"null-value": Null', 
            startIndex: 18
        },
        
    ];

    for (const target of TARGETS) {

        const {name, value, startIndex: i} = target;

        await test(name, (t) => {

            const rawJSON = JSON.stringify(value);
    
            const tokenizer = new JSONTokenizer();
        
            const result = tokenizer._parseNull(rawJSON, i);
            const expected = null;

            t.assert.equal(rawJSON.at(i).toLowerCase(), 'n');
            t.assert.deepEqual(result, expected);
        })
    }
});


