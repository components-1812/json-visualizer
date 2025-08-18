import {test} from "node:test";
import { JSONTokenizer } from "../src/JSONTokenizer.js";

const TARGETS = [

    //start with http
    { name: 'http', value: 'http://example.com', expected: { isURL: true, type: 'http' } },
    { name: 'https', value: 'https://example.com/path?query=1#section', expected: { isURL: true, type: 'https' } },
    { name: 'ftp', value: 'ftp://ftp.example.com/resource.txt', expected: { isURL: true, type: 'ftp' } },
    { name: 'ftp', value: 'ftp://ftp.example.com', expected: { isURL: true, type: 'ftp' } },
    { name: 'http with path', value: 'http://example.com/path/to/resource', expected: { isURL: true, type: 'http' } },
    { name: 'https with query', value: 'https://example.com?search=query', expected: { isURL: true, type: 'https' } },
    { name: 'http with hash', value: 'http://example.com#section', expected: { isURL: true, type: 'http' } },
    { name: 'https subdomain', value: 'https://sub.domain.com:8080/path', expected: { isURL: true, type: 'https' } },
    { name: 'http with port', value: 'http://localhost:3000/api', expected: { isURL: true, type: 'http' } },
    { name: 'inside ""', value: '"http://localhost:3000/api"', expected: { isURL: false, type: null } },
    { name: 'inside ``', value: '`http://example.com`', expected: { isURL: false, type: null } },
    { name: 'inside \'\'', value: '\'https://example.com\'', expected: { isURL: false, type: null } },
    { name: "inside ''", value: "'http://example.com'", expected: { isURL: false, type: null } },

    // start with www
    { name: 'www', value: 'www.example.com', expected: { isURL: true, type: 'www' }},
    { name: 'www path', value: 'www.example.com/path/to/file.html', expected: { isURL: true, type: 'www' } },
    { name: 'www subdomain', value: 'www.sub.example.com', expected: { isURL: true, type: 'www' } },
    { name: 'www with query', value: 'www.example.com?id=123', expected: { isURL: true, type: 'www' } },

    // domain urls
    { name: 'domain .com', value: 'example.com', expected: { isURL: true, type: 'domain' } },
    { name: 'domain .org', value: 'test.org/page', expected: { isURL: true, type: 'domain' } },
    { name: 'domain .co.uk', value: 'my-site.co.uk', expected: { isURL: true, type: 'domain' } },
    { name: 'domain with path', value: 'domain.net/some/path', expected: { isURL: true, type: 'domain' } },
    { name: 'domain with subdomain', value: 'sub.domain.info', expected: { isURL: true, type: 'domain' } },
    { name: 'domain with numbers', value: '123.abc.xyz', expected: { isURL: true, type: 'domain' } },

    //Images
    { name: 'images src', value: 'https://example.com/image.jpg', expected: { isURL: true, type: 'https' } },
    { name: 'images src with query', value: 'https://example.com/image.jpg?size=large', expected: { isURL: true, type: 'https' } },
    { name: 'images src with hash', value: 'https://example.com/image.jpg#section', expected: { isURL: true, type: 'https' } },
    { name: 'images src with spaces', value: 'https://example.com/image with spaces.jpg', expected: { isURL: false, type: null } },
    { name: 'images src with new line', value: 'https://example.com/image.jpg\n', expected: { isURL: false, type: null } },
    { name: 'images src inside ""', value: '"https://example.com/image.jpg"', expected: { isURL: false, type: null } },
    { name: 'images src inside ``', value: '`https://example.com/image.jpg`', expected: { isURL: false, type: null } },
    { name: 'images src inside \'\'', value: '\'https://example.com/image.jpg\'', expected: { isURL: false, type: null } },

    // invalid urls
    { name: 'not a url', value: 'just a string', expected: { isURL: false, type: null } },
    { name: 'not a url with spaces', value: 'http://exa mple.com', expected: { isURL: false, type: null } },
    { name: 'not a url with new line', value: 'http://example.com\n', expected: { isURL: false, type: null } },

    //Relative URLs
    { name: 'relative path', value: '/path/to/resource', expected: { isURL: true, type: 'relative' }},
    { name: 'relative path with dot', value: './path/to/resource', expected: { isURL: true, type: 'relative'} },
    { name: 'relative path with double dot', value: '../path/to/resource', expected: { isURL: true, type: 'relative'} },
    { name: 'relative path with query', value: '/path?query=test', expected: { isURL: true, type: 'relative'} },
    { name: 'relative path with hash', value: '/path#section', expected: { isURL: true, type: 'relative'} },
    { name: 'relative path with spaces (invalid)', value: '/path to resource', expected: { isURL: false, type: null } },
    { name: 'relative path with new line (invalid)', value: '/path\n', expected: { isURL: false, type: null } },

    //Mails
    { name: 'simple mail', value: 'test@example.com', expected: { isURL: true, type: 'mail' } },
    { name: 'mail with plus', value: 'test+alias@example.com', expected: { isURL: true, type: 'mail' } },
    { name: 'mail with dot', value: 'first.last@sub.example.co.uk', expected: { isURL: true, type: 'mail' } },
    { name: 'mail with mailto', value: 'mailto:test@example.com', expected: { isURL: true, type: 'mail' } },
    { name: 'mail with hyphen', value: 'test-name@example-domain.com', expected: { isURL: true, type: 'mail' } },
    { name: 'mail invalid: no domain', value: 'test@.com', expected: { isURL: false, type: null } },
    { name: 'mail invalid: no top-level domain', value: 'test@example', expected: { isURL: false, type: null } },
    { name: 'mail with subject', value: 'test@example.com?subject=Hello', expected: { isURL: true, type: 'mail' } },
    { name: 'mail with attachment', value: 'test@example.com?attachment=file.txt', expected: { isURL: true, type: 'mail' } },
    { name: 'mail with query', value: 'test@example.com?query=value', expected: { isURL: true, type: 'mail'} },
    { name: 'mail with body', value: 'test@example.com?body=Hello%20World', expected: { isURL: true, type: 'mail' } },
    
    //Phones
    { name: 'simple phone', value: '123-456-7890', expected: { isURL: true, type: 'phone' } },
    { name: 'phone with country code', value: '+1-123-456-7890', expected: { isURL: true, type: 'phone' } },
    { name: 'phone with spaces', value: '123 456 7890', expected: { isURL: true, type: 'phone' } },
    { name: 'phone with parentheses', value: '(123) 456-7890', expected: { isURL: true, type: 'phone' } },
    { name: 'phone with tel:', value: 'tel:+1-123-456-7890', expected: { isURL: true, type: 'phone' } },
    { name: 'phone with mixed separators', value: '+44 (0)20 7946 0958', expected: { isURL: true, type: 'phone' } },
    { name: 'phone with few digits (invalid)', value: '123', expected: { isURL: false, type: null } },
    { name: 'phone with letters (invalid)', value: '123-abc-456', expected: { isURL: false, type: null } },
];


test('JSONTokenizer is-url', async (t) => {

    for (const target of TARGETS) {

        const {name, value, expected} = target;

        await t.test(name, (t) => {

            const tokenizer = new JSONTokenizer();

            const result = tokenizer._isURL(value);

            try {

                t.assert.deepEqual(result, expected);
            }
            catch(err){

                console.log({name, value, result});
                throw err;
            }
        });
    }
});