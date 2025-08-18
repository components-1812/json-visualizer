import {test} from "node:test";
import { JSONTokenizer } from "../src/JSONTokenizer.js";

const TARGETS = [
    {
        name: 'basic number', 
        json: {number: 1812}, 
        expected: [
            {type: 'brace-open', value: '{', tags: ['brace', 'brace-open'] },
            {type: 'string-open', value: '"', tags: ['string', 'open', 'key']},
            {type: 'string', value: 'number', tags: ['string', 'key'] },
            {type: 'string-close', value: '"', tags: ['string', 'close', 'key'] },
            {type: 'colon', value: ':', tags: ['colon'] },
            {type: 'number', value: 1812, tags: ['number', 'value'] },
            {type: 'brace-close', value: '}', tags: ['brace', 'brace-close'] },
        ] 
    },
    {
        name: 'basic string', 
        json: {message: 'hello world'}, 
        expected: [
            {type: 'brace-open', value: '{', tags: ['brace', 'brace-open'] },
            {type: 'string-open', value: '"', tags: ['string', 'open', 'key']},
            {type: 'string', value: 'message', tags: ['string', 'key'] },
            {type: 'string-close', value: '"', tags: ['string', 'close', 'key'] },
            {type: 'colon', value: ':', tags: ['colon'] },
            {type: 'string-open', value: '"', tags: ['string', 'open', 'value']},
            {type: 'string', value: 'hello world', tags: ['string', 'value'] },
            {type: 'string-close', value: '"', tags: ['string', 'close', 'value'] },
            {type: 'brace-close', value: '}', tags: ['brace', 'brace-close'] },
        ] 
    },
    {
        name: 'basic boolean true', 
        json: {flag: true}, 
        expected: [
            {type: 'brace-open', value: '{', tags: ['brace', 'brace-open'] },
            {type: 'string-open', value: '"', tags: ['string', 'open', 'key']},
            {type: 'string', value: 'flag', tags: ['string', 'key'] },
            {type: 'string-close', value: '"', tags: ['string', 'close', 'key'] },
            {type: 'colon', value: ':', tags: ['colon'] },
            {type: 'boolean', value: true, tags: ['boolean', 'value', 'true'] },
            {type: 'brace-close', value: '}', tags: ['brace', 'brace-close'] },
        ] 
    },
    {
        name: 'basic boolean false', 
        json: {flag: false}, 
        expected: [
            {type: 'brace-open', value: '{', tags: ['brace', 'brace-open'] },
            {type: 'string-open', value: '"', tags: ['string', 'open', 'key']},
            {type: 'string', value: 'flag', tags: ['string', 'key'] },
            {type: 'string-close', value: '"', tags: ['string', 'close', 'key'] },
            {type: 'colon', value: ':', tags: ['colon'] },
            {type: 'boolean', value: false, tags: ['boolean', 'value', 'false'] },
            {type: 'brace-close', value: '}', tags: ['brace', 'brace-close'] },
        ] 
    },
    {
        name: 'basic null', 
        json: {data: null}, 
        expected: [
            {type: 'brace-open', value: '{', tags: ['brace', 'brace-open'] },
            {type: 'string-open', value: '"', tags: ['string', 'open', 'key']},
            {type: 'string', value: 'data', tags: ['string', 'key'] },
            {type: 'string-close', value: '"', tags: ['string', 'close', 'key'] },
            {type: 'colon', value: ':', tags: ['colon'] },
            {type: 'null', value: null, tags: ['null', 'value'] },
            {type: 'brace-close', value: '}', tags: ['brace', 'brace-close'] },
        ] 
    },
    {
        name: 'empty object', 
        json: {}, 
        expected: [
            {type: 'brace-open', value: '{', tags: ['brace', 'brace-open'] },
            {type: 'brace-close', value: '}', tags: ['brace', 'brace-close'] },
        ] 
    },
    {
        name: 'empty array', 
        json: [], 
        expected: [
            {type: 'bracket-open', value: '[', tags: ['bracket', 'bracket-open'] },
            {type: 'bracket-close', value: ']', tags: ['bracket', 'bracket-close'] },
        ]
    },
    {
        name: 'array of numbers', 
        json: [1, 2, 3], 
        expected: [
            {type: 'bracket-open', value: '[', tags: ['bracket', 'bracket-open'] },
            {type: 'number', value: 1, tags: ['number', 'array-value'] },
            {type: 'comma', value: ',', tags: ['comma'] },
            {type: 'number', value: 2, tags: ['number', 'array-value'] },
            {type: 'comma', value: ',', tags: ['comma'] },
            {type: 'number', value: 3, tags: ['number', 'array-value'] },
            {type: 'bracket-close', value: ']', tags: ['bracket', 'bracket-close'] },
        ]
    },
    {
        name: 'array of strings', 
        json: ["a", "b", "c"], 
        expected: [
            {type: 'bracket-open', value: '[', tags: ['bracket', 'bracket-open'] },
            {type: 'string-open', value: '"', tags: ['string', 'open', 'array-value']},
            {type: 'string', value: 'a', tags: ['string', 'array-value'] },
            {type: 'string-close', value: '"', tags: ['string', 'close', 'array-value'] },
            {type: 'comma', value: ',', tags: ['comma'] },
            {type: 'string-open', value: '"', tags: ['string', 'open', 'array-value']},
            {type: 'string', value: 'b', tags: ['string', 'array-value'] },
            {type: 'string-close', value: '"', tags: ['string', 'close', 'array-value'] },
            {type: 'comma', value: ',', tags: ['comma'] },
            {type: 'string-open', value: '"', tags: ['string', 'open', 'array-value']},
            {type: 'string', value: 'c', tags: ['string', 'array-value'] },
            {type: 'string-close', value: '"', tags: ['string', 'close', 'array-value']},
            {type: 'bracket-close', value: ']', tags: ['bracket', 'bracket-close'] },
        ]
    },
    {
        name: 'nested object',
        json: { "a": { "b": 1 } },
        expected: [
            { type: 'brace-open', value: '{', tags: ['brace', 'brace-open'] },
            { type: 'string-open', value: '"', tags: ['string', 'open', 'key'] },
            { type: 'string', value: 'a', tags: ['string', 'key'] },
            { type: 'string-close', value: '"', tags: ['string', 'close', 'key'] },
            { type: 'colon', value: ':', tags: ['colon'] },
            { type: 'brace-open', value: '{', tags: ['brace', 'brace-open'] },
            { type: 'string-open', value: '"', tags: ['string', 'open', 'key'] },
            { type: 'string', value: 'b', tags: ['string', 'key'] },
            { type: 'string-close', value: '"', tags: ['string', 'close', 'key'] },
            { type: 'colon', value: ':', tags: ['colon'] },
            { type: 'number', value: 1, tags: ['number', 'value'] },
            { type: 'brace-close', value: '}', tags: ['brace', 'brace-close'] },
            { type: 'brace-close', value: '}', tags: ['brace', 'brace-close'] },
        ]
    },
    {
        name: 'object with multiple properties',
        json: { "name": "test", "value": 123, "active": true },
        expected: [
            { type: 'brace-open', value: '{', tags: ['brace', 'brace-open'] },
            { type: 'string-open', value: '"', tags: ['string', 'open', 'key'] },
            { type: 'string', value: 'name', tags: ['string', 'key'] },
            { type: 'string-close', value: '"', tags: ['string', 'close', 'key'] },
            { type: 'colon', value: ':', tags: ['colon'] },
            { type: 'string-open', value: '"', tags: ['string', 'open', 'value'] },
            { type: 'string', value: 'test', tags: ['string', 'value'] },
            { type: 'string-close', value: '"', tags: ['string', 'close', 'value'] },
            { type: 'comma', value: ',', tags: ['comma'] },
            { type: 'string-open', value: '"', tags: ['string', 'open', 'key'] },
            { type: 'string', value: 'value', tags: ['string', 'key'] },
            { type: 'string-close', value: '"', tags: ['string', 'close', 'key'] },
            { type: 'colon', value: ':', tags: ['colon'] },
            { type: 'number', value: 123, tags: ['number', 'value'] },
            { type: 'comma', value: ',', tags: ['comma'] },
            { type: 'string-open', value: '"', tags: ['string', 'open', 'key'] },
            { type: 'string', value: 'active', tags: ['string', 'key'] },
            { type: 'string-close', value: '"', tags: ['string', 'close', 'key'] },
            { type: 'colon', value: ':', tags: ['colon'] },
            { type: 'boolean', value: true, tags: ['boolean', 'value', 'true'] },
            { type: 'brace-close', value: '}', tags: ['brace', 'brace-close'] },
        ]
    },
];

//MARK: TEST tokenize
test('JSONTokenizer tokenize', async (t) => {

    for (const target of TARGETS) {

        const {name, json, expected} = target;

        await t.test(name, (t) => {

            const tokenizer = new JSONTokenizer(); 
            tokenizer.tokenize(JSON.stringify(json));

            t.assert.deepEqual(tokenizer.tokens, expected);
        });
    }
});