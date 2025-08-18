import COLOR_PATTERNS from "./utils/color-patterns.js";
import URL_PATTERNS from "./utils/url-patterns.js";


/**
 * @typedef {'brace-open' | 'brace-close' | 'bracket-open' | 'bracket-close' | 'colon' | 'comma' | 'string' | 'number' | 'boolean' | 'null'} TokenType
 * @typedef {'brace' | 'bracket' | 'colon' | 'comma' | 'string' | 'number' | 'boolean' | 'null' | 'false'  | 'true' | 'open' | 'close'} TokenTypeTag
 * @typedef {'key' | 'value' | 'array-value'} TokenRole
 * @typedef {'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'named'} TokenColor
 * @typedef {'color-hex' | 'color-rgb' | 'color-rgba' | 'color-hsl' | 'color-hsla' | 'color-named'} TokenColorTag
 * @typedef {'http' | 'https' | 'ftp' | 'www' | 'domain' | 'relative' | 'mail' | 'phone'} TokenUrl
 * @typedef {'url-http' | 'url-https' | 'url-ftp' | 'url-www' | 'url-domain' | 'url-relative' | 'url-mail' | 'url-phone'} TokenUrlTag
 * @typedef {TokenTypeTag | TokenRole | TokenColorTag | TokenUrlTag } TokenTag
 * 
 * @typedef {Object} Token
 * @property {TokenType} type
 *     The specific type of the token, representing different JSON syntax elements.
 * @property {string | boolean | number | null} value
 *     The actual value of the token. This can be any JSON value.
 * @property {Array<TokenTag>} tags
 *     A list of additional tags that describe the token's role or category.
 * @property {TokenColor} [color]
 *     The color type if the token represents a color value.
 * @property {TokenUrl} [url]
 *     The URL type if the token represents a URL.
 */


//MARK: JSONTokenizer
export class JSONTokenizer {

    static version = "0.0.3";

    static URL_PATTERNS = URL_PATTERNS;
    static COLOR_PATTERNS = COLOR_PATTERNS;

    /**
     * @type {Token[]}
     */
    tokens = [];

    constructor(){}

    //MARK: tokenize
    /**
     * 
     * @param {String} rawJSON 
     * @returns 
     */
    tokenize(rawJson, options = {}){

        const {detectURL = false, detectColor = true, strict = false} = options;

        const minifyJson = this.clearJSON(rawJson, {strict});

        this.tokens = [];

        let contextStack = [];
        let role = 'key';
        let i = 0;
        let iterations = 0;
        const maxIterations = minifyJson.length;

        while(i < minifyJson.length){

            iterations++;

            if(iterations > maxIterations){
                
                throw new Error(`Infinite loop detected while tokenizing JSON. Check the input: ${minifyJson}`);
            }

            const char = minifyJson[i];
            const currentContext = contextStack.at(-1);

            if(char === '{'){   
                contextStack.push('{');

                this.tokens.push({ type: 'brace-open', value: char, tags: ['brace', 'open'] });

                role = 'key';

                i++; continue;
            }
            if(char === '}'){   
                contextStack.pop();

                this.tokens.push({ type: 'brace-close', value: char, tags: ['brace', 'close'] });

                i++; continue;
            }
            if(char === '['){   
                contextStack.push('[');

                this.tokens.push({ type: 'bracket-open', value: char, tags: ['bracket', 'open'] });

                role = 'array-value';

                i++; continue;
            }
            if(char === ']'){   
                contextStack.pop();

                this.tokens.push({ type: 'bracket-close', value: char, tags: ['bracket', 'close'] });

                i++; continue;
            }
            if(char === ','){

                this.tokens.push({ type: 'comma', value: char, tags: ['comma'] });

                role = currentContext === '{' ? 'key' : 'array-value';

                i++; continue;
            }
            if(char === ':'){

                this.tokens.push({ type: 'colon', value: char, tags: ['colon'] });

                role = 'value';

                i++; continue;
            }
            //Detecta el inicio del string
            if(char === '"'){

                const result = this._parseString(minifyJson, i);

                if(result){

                    const { value, endIndex } = result;
    
                    const token = { type: 'string', value, tags: ['string', role] };
    
                    if(detectURL){
                        const result = this._isURL(value);
    
                        if(result.isURL){
                            token.tags.push(`url-${result.type}`);
                            token.url = result.type;
                        }
                    }
                    if(detectColor){
                        const result = this._isColor(value);
    
                        if(result.isColor){
                            token.tags.push(`color-${result.type}`);
                            token.color = result.type;
                        }
                    }
    
                    this.tokens.push({ type: 'string-open', value: char, tags: ['string', 'open', role] });
                    this.tokens.push(token);
                    this.tokens.push({ type: 'string-close', value: char, tags: ['string', 'close', role] });
    
                    i = endIndex + 1; continue;
                }
            }
            //Boleanos
            if(char === 't' || char === 'f'){

                const result = this._parseBoolean(minifyJson, i);

                if(result){

                    const { value, endIndex } = result;

                    this.tokens.push({ type: 'boolean', value, tags: ['boolean', role, value ? 'true' : 'false'] });
    
                    i = endIndex + 1; continue;
                }
            }
            //Null
            if(char === 'n'){
                
                const result = this._parseNull(minifyJson, i);

                if(result){
                    
                    const { value, endIndex } = result;

                    this.tokens.push({ type: 'null', value, tags: ['null', role] });
    
                    i = endIndex + 1; continue;
                }
            }
            //Numeros
            if (/[0-9\-]/.test(char)) {

                const result = this._parseNumber(minifyJson, i);

                if(result){

                    const { value, endIndex } = result;
    
                    this.tokens.push({ type: 'number', value, tags: ['number', role] });
    
                    i = endIndex + 1; continue;
                }
            }

            //Unknown value if noone othe _parse function works
            const { value, endIndex } = this._parseUnknown(minifyJson, i);

            this.tokens.push({ type: 'unknown', value, tags: ['unknown', role] });

            i = endIndex + 1;
        }   
    }

    //MARK: cleanJSON
    /**
     * 
     * @param {String} rawJSON 
     * @param {{strict:Boolean|'auto'}} options
     * @returns {String} A minified JSON string
     */
    clearJSON(rawJson, options = {}){

        if(typeof rawJson?.valueOf() !== 'string'){
            
           throw new Error('Invalid JSON input. Expected a string.');
        }

        const {strict = 'auto'} = options;

        if(strict === true) return JSON.stringify(JSON.parse(rawJson));

        if(strict === false) return this._minifyJSON(rawJson);

        if(strict === 'auto'){

            try {

                return JSON.stringify(JSON.parse(rawJson));
            } 
            catch (err) {

                return this._minifyJSON(rawJson);
            }
        }

        throw new Error("Invalid 'strict' option. Expected true, false, or 'auto'.");
    }


    //MARK: Parse Functions
    /**
     * @param {String} rawJson A raw json string
     * @param {number} startIndex The index of the opening `"` character
     * @returns {{value:string, raw:string, endIndex:number}} endIndex is the index of the `"` that closes the string
     */
    _parseString(rawJson, startIndex){

        let i = startIndex + 1;

        while(i < rawJson.length){

            //Omitimos los escapes de con \\
            if(rawJson.at(i) === '\\'){

                i += 2; continue;
            }

            //Detecta el final del string
            if(rawJson.at(i) === '"') break;
            
            i++;
        }

        const endIndex = i;
        let raw = rawJson.slice(startIndex, endIndex + 1);

        try {
            const value = JSON.parse(raw);

            return { value, raw, endIndex }
        } 
        catch (error) {
      
            return null;
        }
    }
    /**
     * @param {String} rawJson 
     * @param {number} startIndex The index of the first character of the number: `0-9` or `-`
     * @returns {{value:number, endIndex:number}} endIndex is the index of the last character of the number
     */
    _parseNumber(rawJson, startIndex){

        let i = startIndex;

        // Recorre mientras sea parte de un número
        while(i < rawJson.length && !this._isDelimiter(rawJson[i])){

            i++;
        }

        const raw = rawJson.slice(startIndex, i);
        const value = Number(raw);

        if(!Number.isNaN(value)){

            return { value, raw, endIndex: i - 1 };
        }
        else {

            return null;
        }
    }
    /**
     * @param {String} rawJson A raw json string
     * @param {number} startIndex The start index of `t` or `f` of `true` or `false` to extract
     * @returns {value:string, raw:string, endIndex:number} endIndex is the index of the last character of the token: `e`
     */
    _parseBoolean(rawJson, startIndex){

        if(rawJson.startsWith('true', startIndex) && this._isDelimiter(rawJson[startIndex + 4])){

            return { value: true, raw: 'true', endIndex: startIndex + 3 };  
        }
        if(rawJson.startsWith('false', startIndex) && this._isDelimiter(rawJson[startIndex + 5])){

            return { value: false, raw: 'false', endIndex: startIndex + 4 };
        }

        return null;
    }
    /**
     * @param {*} rawJson A raw json string
     * @param {*} startIndex The start index of `n` of `null` to extract
     * @returns {{value:null, raw:string, endIndex:number}} endIndex is the index of the last character of the token: `l`
     */
    _parseNull(rawJson, startIndex){

        if(rawJson.startsWith('null', startIndex) && this._isDelimiter(rawJson[startIndex + 4])){

            return { value: null, raw: 'null', endIndex: startIndex + 3 };
        }

        return null;
    }
    _parseUnknown(rawJson, startIndex){

        let i = startIndex;
        const raw = [];

        while(i < rawJson.length){
            
            if(!this._isDelimiter(rawJson[i])){
                 
                raw.push(rawJson[i]);
                i++;
            }
            else {
                break;
            }
        }

        return { value: raw.join(''), raw: raw.join(''), endIndex: i - 1 };
    }
    _isDelimiter(char = ''){

        return char === ',' || char === '}' || char === ']';
    }

    /** MARK: _isURL
     * 
     * @param {string} string 
     * @returns {{isURL:boolean, type: 'http' | 'https' | 'ftp' | 'www' | 'domain' | 'relative' | 'mail' | 'phone' | null}} type is the URL type if `isURL` is true
     */
    _isURL(string = ''){

        if(!string) return { isURL: false, type: null};
        if(typeof string !== 'string') return { isURL: false, type: null };
        
        for (const url of Object.values(JSONTokenizer.URL_PATTERNS)){

            if(url.test(string)){

                return { isURL: true, type: url.type };
            }
        }

        return { isURL: false, type: null };
    }

    /** MARK:_isColor
     * @param {string} string 
     * @returns {{isColor:boolean, type:'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'named' | null}} type is the color type if `isColor` is true
     */
    _isColor(string = ''){

        if(!string) return { isColor: false, type: null };
        if(typeof string !== 'string') return { isColor: false, type: null };

        for(const color of Object.values(JSONTokenizer.COLOR_PATTERNS)){

            if(color.test(string)){

                if(color.validRange && !color.validRange(string)){

                    return { isColor: false, type: null };
                }

                return { isColor: true, type: color.type };
            }
        }

        return { isColor: false, type: null };
    }

    _minifyJSON(rawJson) {

        if(typeof rawJson?.valueOf() !== 'string') throw new Error('Invalid JSON input. Expected a string.')
        if(rawJson.length === 0) return '';

        let result = [];
        let inString = false;
        let escape = false;
        const length = rawJson.length;

        for (let i = 0; i < length; i++) {

            const char = rawJson[i];

            if(inString){

                result.push(char);

                //Reset escape
                if(escape){

                    escape = false;
                }
                else {

                    if(char === '\\') escape = true;
                    if(char === '"') inString = false;
                }
            } 
            else {

                //
                if(char !== ' ' && char !== '\n' && char !== '\t' && char !== '\r') result.push(char);
                
                if(char === '"') inString = true;
            }
        }

        return result.join('');
    }

}

export default JSONTokenizer;