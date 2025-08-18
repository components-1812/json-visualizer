
import {test} from "node:test";
import { JSONTokenizer } from "../src/JSONTokenizer.js";

const TARGETS = [
    { name: 'basic json',  value: { name: "test", value: 123, active: true }},
    { 
        name: 'large json', 
        value: {
            "name": "Alice",
            "age": 30,
            "isStudent": false,
            "courses": [
                {"title": "History I", "credits": 3},
                {"title": "Math II", "credits": 4}
            ],
            "address": {
                "street": "123 Main St",
                "city": "Anytown",
                "zip": "12345"
            },
            "grades": [95, 88, 76, 92],
            "notes": null,
            "isActive": true,
            "gpa": 3.8,
            "startDate": "2020-09-01",
            "lastUpdated": "2023-10-26T10:00:00Z"
        }
    },
    { name: 'string with spaces', value: { msg: "  hello   world  ", note: "line 1\nline 2" }},
    { name: 'string with escaped quotes', value: { quote: 'He said: "hi"', raw: 'Escaped: \\"wow\\"' } },
    { name: 'string with unicode', value: { emoji: "🙂", chinese: "你好" } },
    { name: 'empty object', value: {} },
    { name: 'empty array', value: [] },
    {
        name: 'nested object and array',
        value: {
            user: {
                id: 1,
                name: "Alice",
                tags: ["admin", "editor", "tester"]
            }
        }
    },
    { name: 'long text string', value: { description: " ".repeat(1000) + "end"} },
    { name: 'string with newlines and tabs', value: { text: "line1\n\tline2\n\tline3" } },
    { name: 'escaped quotes', value: { quote: 'She said: "Hello, \\"world\\"!"' } },
    { name: 'unicode', value: { emoji: "🐱‍👤", cyrillic: "привет", chinese: "中文" } },
    { name: 'mixed literals', value: { ok: true, fail: false, empty: null, minus: -42 } },
    { name: 'large numbers', value: { bigInt: String(12345678901234567890n), float: 3.14159265358979323846 } },
    { name: 'boolean values', value: { isTrue: true, isFalse: false } },
    { name: 'null value', value: { emptyValue: null } },
    { name: 'date string', value: { date: "2023-10-26T12:00:00Z" }},
    { name: 'complex nested structure', value: {
        a: { b: { c: { d: { e: { f: "deep" } } } } },
        arr: [1, 2, 3, [4, 5, [6, 7]]],
        mixed: { x: "text", y: 123, z: [true, false, null] }
    }},
    { name: 'special characters', value: { special: "!@#$%^&*()_+-=[]{}|;':\",.<>?/~`" }},
    { name: 'emoji and symbols', value: { emoji: "🚀🌟💻", symbols: "©®™" }},
    { name: 'large array', value: { largeArray: Array.from({ length: 1000 }, (_, i) => i + 1) }},
    { 
        name: 'deeply nested structure', 
        value: {
            level1: {
                level2: {
                    level3: {
                        level4: {
                            level5: {
                                value: "deep value"
                            }
                        }
                    }
                }
            }
        }
    },
    { name: 'boolean and null mixed', value: { isActive: true, isVerified: false, data: null }},
    { 
        name: 'array of objects', 
        value: [
            { id: 1, name: "Item 1" },
            { id: 2, name: "Item 2" },
            { id: 3, name: "Item 3" }
        ]
    },
    { name: 'array of arrays', value: [[1, 2], [3, 4], [5, 6]] },
    { 
        name: 'object with mixed types', 
        value: {
            id: 101,
            name: "Product A",
            price: 29.99,
            inStock: true,
            features: ["durable", "lightweight"],
            details: {
                weight: "1kg",
                dimensions: "10x10x5cm"
            },
            reviews: null
        }
    },
    { name: 'string with escaped backslash at end', value: { path: "C:\\Users\\Test\\" } },
    { name: 'string with escaped quote at end', value: { quote: "He said \"hello\"" } },
    { name: 'string with mixed escapes', value: { text: "line1\\nline2\\t\\\"quote\\\"\\\\backslash" } },
    { name: 'empty string in object', value: { empty: "" } },
    { name: 'empty array in object', value: { emptyArr: [] } },
    { name: 'empty object in object', value: { emptyObj: {} } },
    { name: 'number with decimal and exponent', value: { num: 1.23e-4 } },
    { name: 'number with negative exponent', value: { num: 5.67E-8 } },
    { name: 'boolean true in array', value: [true] },
    { name: 'boolean false in array', value: [false] },
    { name: 'null in array', value: [null] },
    { name: 'string with leading/trailing spaces', value: { text: "  hello  " } },
    { name: 'string with only spaces', value: { text: "   " } },
    { name: 'string with newlines only', value: { text: "\n\n\n" } },
    { name: 'string with tabs only', value: { text: "\t\t\t" } },
    { name: 'string with mixed whitespace', value: { text: " \n\t " } },
];

test('JSONTokenizer minifyJSON: complete json', async (t) => {

    const tokenizer = new JSONTokenizer();

    for (const target of TARGETS) {

        const {name, value} = target;
        const {incomplete, complete} = getIncompleteJSON(value);

        await t.test(`${name}: complete`, (t) => {

            const input = complete.json;
            const expected = complete.minify;
            let result = null;
            
            try {
    
                result = tokenizer._minifyJSON(input);

                t.assert.equal(result, expected);
            }
            catch(err){

                console.log({name, value: input, result, expected});
                throw err;
            }
        });

        await t.test(`${name}: incomplete`, (t) => {

            const input = incomplete.json;
            const expected = incomplete.minify;
            let result = null;
            
            try {
    
                result = tokenizer._minifyJSON(input);

                t.assert.equal(result, expected);
            }
            catch(err){

                console.log({name, value: input, result, expected});
                throw err;
            }
        });

        await t.test(`${name}: clearJSON`, (t) => {

            const input = incomplete.json;
            const expected = incomplete.minify;
            let result = null;
            
            try {
    
                t.assert.throws(() => tokenizer.clearJSON(input, {strict: true}));
                t.assert.doesNotThrow(() => tokenizer.clearJSON(input, {strict: false}));
                t.assert.doesNotThrow(() => tokenizer.clearJSON(input, {strict: 'auto'}));

                result = tokenizer.clearJSON(input);

                t.assert.equal(result, expected);
            }
            catch(err){

                console.log({name, value: input, result, expected});
                throw err;
            }
        })
    }
});


//MARK: getIncompleteJSON
function getIncompleteJSON(obj = {}) {

    const pretty = JSON.stringify(obj, null, 2);
    const minify = JSON.stringify(obj);

    // Random cut point in minified JSON
    const cutIndex = Math.floor(Math.random() * minify.length);

    // Map pretty indexes corresponding to minified indexes
    const minifyToPrettyMap = [];

    let prettyIndex = 0;
    let minifyIndex = 0;

    while (minifyIndex < minify.length && prettyIndex < pretty.length) {

        const minifyChar = minify[minifyIndex];

        // Skip all whitespace in pretty until we match minified char
        while(pretty[prettyIndex] !== minifyChar && /\s/.test(pretty[prettyIndex])){

            prettyIndex++;
        }

        // Now we match the character
        if(pretty[prettyIndex] === minifyChar) {
            
            minifyToPrettyMap.push(prettyIndex);
            minifyIndex++;
        }

        prettyIndex++;
    }

    const incomplete = {
        minify: minify.slice(0, cutIndex),
        json: pretty.slice(0, minifyToPrettyMap[cutIndex] ?? pretty.length)
    };

    return {
        complete: { json: pretty, minify },
        incomplete,
    };
}

