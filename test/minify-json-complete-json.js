import {test} from "node:test";
import { JSONTokenizer } from "../src/JSONTokenizer.js";

const TARGETS = [
    { name: 'basic json',  value: { name: "test", value: 123, active: true } },
    { name: 'string with spaces', value: { msg: "  hello   world  ", note: "line 1\nline 2" } },
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
];

test('JSONTokenizer minifyJSON: complete json', async (t) => {

    const tokenizer = new JSONTokenizer();

    for (const target of TARGETS) {

        const {name, value} = target;

        await t.test(name, (t) => {

            const input = JSON.stringify(value, null, 2);
            const expected = JSON.stringify(value);

            let result = null;

            try {

                result = tokenizer._minifyJSON(input);

                t.assert.equal(result, expected);
            }
            catch(err){

                console.log({name, value, result});
                throw err;
            }
        });

        await t.test(`${name} clearJSON`, (t) => {

            const input = JSON.stringify(value, null, 2);
            const expected = JSON.stringify(value);

            let result = null;

            try {

                result = tokenizer.clearJSON(input, {strict: true});
                t.assert.equal(result, expected);

                result = tokenizer.clearJSON(input, {strict: false});
                t.assert.equal(result, expected);

                result = tokenizer.clearJSON(input, {strict: 'auto'});
                t.assert.equal(result, expected);
            }
            catch(err){

                console.log({name, value, result});
                throw err;
            }
        });
    }
});