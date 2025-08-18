
## Tokens

```ts
export type TokenType = 'brace-open' | 'brace-close' | 'bracket-open' | 'bracket-close'
    | 'colon' | 'comma' | 'string' | 'number' | 'boolean' | 'null';

export type TokenTypeTag = 'brace' | 'bracket' | 'colon' | 'comma'
    | 'string' | 'number' | 'boolean' | 'null' | 'false' | 'true'
    | 'open' | 'close';

export type TokenRole = 'key' | 'value' | 'array-value';

export type TokenColor = 'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'named';

export type TokenColorTag = 'color' |'color-hex' | 'color-rgb' | 'color-rgba' 
    | 'color-hsl' | 'color-hsla' | 'color-named';

export type TokenUrl = 'url' | 'http' | 'https' | 'ftp' | 'www' 
    | 'domain' | 'relative' | 'mail' | 'phone';

export type TokenUrlTag = 'url-http' | 'url-https' | 'url-ftp' | 'url-www' 
    | 'url-domain' | 'url-relative' | 'url-mail' | 'url-phone';

export type TokenTag = TokenTypeTag | TokenRole
    | TokenColorTag | TokenUrlTag;

export interface Token {
  type: TokenType;
  value: string | boolean | number | null;
  tags: TokenTag[];
  color?: TokenColor;
  url?: TokenUrl;
}
```

- #### `type`

    The `type` property is required to properly group tokens by line (`JSONLine`) and render the JSON structure correctly.

<br>

- #### `value`

    The parsed `value` of the token. It can be a `string`, `boolean`, `number`, or `null`.

<br>

- #### `tags`

    The `tags` property is used for **highlighting** the JSON. 

    Tokens rendered inside `<span>` elements have a `tags="...token tags..."` attribute, which can be targeted using **CSS** to apply different combinations like: `brace`, `bracket`, `open`, `close`, `url`, `color`, etc.

    ```css
    span[tags~="brace"] { /* all {} */ }
    span[tags~="bracket"] { /* all []*/ }
    span[tags~="brace"][tags~="open"] { /* { */ }
    span[tags~="brace"][tags~="close"] { /* } */ }

    span[tags~="string"][tags~="array-value"] { /* string with color */ }

    span[tags~="color-hex"] { /* color: #fff */ }
    ```

<br>

- #### `color`

    The `color` property marks the string `token` as a **color** so a `color preview` can be rendered

    It also indicates the specific color type (`hex`, `rgb`, `rgba`, `hsl`, `hsla`, `named`) to allow filtering or styling only specific color formats.

    > **Note:**
    >
    > `<span>` Tokens representing colors are marked with `tags="color color-<color type> ..."`

    > **Note:**
    > 
    > The method used to detect color strings is: `JSONTokenizer.prototype._isColor`
    >
    > The color matching patterns are defined in: [`utils/color-patterns.js`](./src/utils/color-patterns.js)

    If you need to change or add new patterns, you can override the static property `JSONTokenizer.COLOR_PATTERNS` while keeping the correct type structure:

    ```js
    JSONTokenizer.COLOR_PATTERNS = {
        PATTERN_NAME: {
            type: 'pattern-name',
            regex: /regex/,
            test(string){ 
                return this.regex.test(string); 
            },
            // Optional: use this if you need to validate numeric ranges for formats like `rgba` or `hsla`
            validRange(string){  
                return true; 
            }
        },
        /*... More patterns ...*/
    }
    ```
    > **Note**:
    >
    > Custom patterns must follow the same structure used internally.
    >
    > The `test` function determines if the string matches, and `validRange` (optional) allows fine-tuning formats that include number ranges.

<br>

- #### `url`

    The `url` property marks the string token as a **URL** so it can be rendered as a clickable link.

    It also indicates the specific URL type (`http`, `https`, `ftp`, `www`, `domain`, `relative`, `mail`, `phone`) to allow filtering or styling of only specific kinds of URLs.

    > **Note:**
    >
    > `<span>` Tokens representing URLs are marked with `tags="url url-<url type> ..."`

    > **Note:**
    > 
    > The method used to detect URLs strings is: `JSONTokenizer.prototype._isURL`
    >
    > The URL matching patterns are defined in: [`utils/url-patterns.js`](./src/utils/url-patterns.js)

    If you need to change or add new patterns, you can override the static property `JSONTokenizer.URL_PATTERNS` while keeping the correct type structure:

    ```js
    JSONTokenizer.URL_PATTERNS = {
        PATTERN_NAME: {
            type: 'pattern-name',
            regex: /regex/,
            test(string){ 
                return this.regex.test(string); 
            }
        },
        /*... More patterns ...*/
    }
    ```

<br><br>

## Using another tokenizer

If you'd like to use a different library to tokenize the JSON, such as `Babel`,

you can override the static method `JSONVisualizer.getTokens`.

```js
import JSONVisualizer from "@components-1812/json-visualizer";

JSONVisualizer.getTokens = async (rawJson) => {

    return [];//Array<Token>
}
```
<br>

### Example using Babel standalone

```js
import JSONVisualizer from "@components-1812/json-visualizer";
import * as Babel from '@babel/standalone';

//Define JSON Tokenizer
JSONVisualizer.getTokens = async (rawJson) => {

    const {parse} = Babel.packages.parser;

    const tokenizer = parse(`(${rawJson})`, { tokens: true });

    const result = tokenizer.tokens.slice(1, -2);

    const tokens = [];
    
    for (let i = 0; i < result.length; i++) {

        const {type, value} = result[i];
        
        if(type.label === '{'){
            tokens.push({type: 'brace-open', value: '{', tags: ['brace']});
        }
        if(type.label === '}'){
            tokens.push({type: 'brace-close', value: '}', tags: ['brace']});
        }
        if(type.label === '['){
            tokens.push({type: 'bracket-open', value: '[', tags: ['bracket']});
        }
        if(type.label === ']'){
            tokens.push({type: 'bracket-close', value: ']', tags: ['bracket']});
        }
        if(type.label === ':'){
            tokens.push({type: 'colon', value: ':', tags: ['colon']});
        }
        if(type.label === ','){
            tokens.push({type: 'comma', value: ',', tags: ['comma']});
        }
        if(type.label === 'string'){
            tokens.push({type: 'string', value: `"${value}"`, tags: ['string']});
        }
        if(type.label === 'num'){
            tokens.push({type: 'number', value: value, tags: ['number']});
        }
        if(type.label === 'false' || type.label === 'true'){
            tokens.push({type: 'boolean', value: value, tags: ['boolean']});
        }
        if(type.label === 'null'){
            tokens.push({type: 'null', value: 'null', tags: ['null']});
        }

        //*Basic token structure without color or URL detection
    }

    return tokens;
}

//Load the stylesheet
JSONVisualizer.stylesSheets.links.push(`path/to/styles.css`);

customElements.define('custom-json-visualizer', JSONVisualizer);
```