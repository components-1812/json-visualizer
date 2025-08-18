import {test} from "node:test";
import { JSONTokenizer } from "../src/JSONTokenizer.js";

const TARGETS = [
    {name: 'basic string', value: {message: 'hello world'}},
    {name: 'empty string', value: {message: ''}},
    {name: 'string with spaces', value: {message: '  hello world  '}},
    {name: 'string with numbers', value: {message: '12345'}},
    {name: 'string with special characters', value: {message: '!@#$%^&*()_+-='}},
    {name: 'string with unicode characters', value: {message: '你好世界'}},
    {name: 'string with escaped quote', value: {message: 'hello \\"world\\""'}},
    {name: 'string with escaped backslash', value: {message: 'hello \\\\world\\\\'}},
    {name: 'string with escaped newline', value: {message: 'hello \\nworld'}},
    {name: 'string with escaped tab', value: {message: 'hello \\tworld'}},
    {name: 'long string', value: {message: 'a'.repeat(1000)}},
    {name: 'string with mixed content', value: {message: 'Hello 123 !@# 你好 \\" \\\\ \\n \\t World.'}},
    {name: 'string with emoji', value: {message: 'hello 👋 world 🌍'}},
    {name: 'string with leading/trailing spaces', value: {message: '  trimmed  '}},
    {name: 'string with multiple escaped characters', value: {message: 'line1\\nline2\\t\\\"quote\\\"\\\\backslash'}},
    {name: 'string with control characters', value: {message: 'null\\u0000backspace\\u0008formfeed\\u000c'}},
    {name: 'string with complex unicode escape', value: {message: 'smiley\\uD83D\\uDE00'}},
    {name: 'string with mixed case', value: {message: 'HeLlO wOrLd'}},
    {name: 'string with numbers and symbols', value: {message: 'Price: $12.99!'}},
    {name: 'string with only spaces', value: {message: '   '}},
    {name: 'string with only escaped characters', value: {message: '\\n\\t\\r\\b\\f\\\\\\\"\\/'}},
    {name: 'string with escaped unicode', value: {message: 'Euro sign: \\u20AC'}},
    {name: 'string with surrogate pairs', value: {message: 'Astral plane character: \\uD800\\uDC00'}},
    {name: 'string with mixed valid and invalid escapes (should parse valid)', value: {message: 'valid\\n\\xinvalid'}}, // JSON.parse handles invalid escapes by ignoring them or throwing, depending on context. Here, it should parse the valid part.
    {name: 'string with backslashes not for escape', value: {message: 'C:\\Users\\Name\\File.txt'}},
    {name: 'string with URL', value: {message: 'https://example.com?param=value&another=param'}},
    {name: 'string with HTML entities', value: {message: '&amp;&lt;&gt;&quot;'}},
    {name: 'string with leading escaped quote', value: {message: '\\"start'}},
    {name: 'string with trailing escaped quote', value: {message: 'end\\"'}},
    {name: 'string with escaped slash', value: {message: 'path\\/to\\/file'}},
    {name: 'string with multiple consecutive escaped characters', value: {message: 'a\\\\\\\"b'}},
    {name: 'string with only one character', value: {message: 'a'}},
    {name: 'json in json', value: {message: '{"key": "value"}'}},
    {name: 'message with quotes', value: {message: 'This is a string with "escaped quotes" and a newline\n character.'}},

]


test('JSONTokenizer parse-string', async (t) => {

    for (const target of TARGETS) {

        const {name, value} = target;

        await t.test(name, (t) => {

            const rawJSON = JSON.stringify(value);
            const i = rawJSON.indexOf(`:"`) + 1;
            const endIndex = rawJSON.lastIndexOf(`"`);

            const tokenizer = new JSONTokenizer();

            const result = tokenizer._parseString(rawJSON, i);
            const expected = { 
                value: value.message, 
                raw: rawJSON.slice(i, endIndex + 1),
                endIndex 
            };

            try {
                
                t.assert.equal(rawJSON.at(i), '"');
                t.assert.equal(rawJSON.at(result.endIndex), '"');
                t.assert.deepEqual(result, expected);
            } 
            catch (error) {
                console.log({name, value, result, expected});
                throw error;
            }

        });
    }
});


const INCOMPLETE_TARGETS = [
    {
        name: 'incomplete basic json', value: '{"message', 
        starIndex: 1 
    },
    {
        name: 'incomplete json with missing quote', value: '{"message": "hello world', 
        starIndex: 12,
    },
    {
        name: 'incomplete json with escaped quote', value: '{"message": "hello \\"world',
        starIndex: 12,
    },
    {
        name: 'incomplete json with escaped backslash', value: '{"message": "hello \\\\world',
        starIndex: 12,
    },
    {
        name: 'incomplete json with unicode character', value: '{"message": "你好世界',
        starIndex: 12,
    },
    {
        name: 'incomplete json with special characters', value: '{"message": "!@#$%^&*()_+-=',
        starIndex: 12,
    },
];

test('JSONTokenizer parse-string incomplete', async (t) => {

    for (const target of INCOMPLETE_TARGETS) {

        const {name, value, starIndex: i} = target;

        await t.test(name, (t) => {

            const rawJSON = value;
            const endIndex = value.length;

            const tokenizer = new JSONTokenizer();

            const result = tokenizer._parseString(rawJSON, i);

            const expected = null;

            try {
                
                t.assert.equal(rawJSON.at(i), '"');
                t.assert.deepEqual(result, expected);
            } 
            catch (error) {

                console.log({name, value, result, expected});
                throw error;
            }
        });
    }
});