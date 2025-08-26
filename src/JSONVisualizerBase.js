import JSONTokenizer from './JSONTokenizer.js';

class JSONVisualizerBase extends HTMLElement {

    //MARK: Constants
    static VERSION = '0.0.3';
	static DEFAULT_TAG_NAME = 'custom-json-visualizer';
	static DEFAULT_ICONS = {
		'toggle': /*svg*/`<svg data-name='toggle' width='16' height='16' fill='currentColor' viewBox='0 0 16 16'>
			<path fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708'/>
		</svg>`,
		'copy': /*svg*/`<svg data-name='copy' width='16' height='16' fill='currentColor' viewBox='0 0 16 16'>
			<path d='M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z'/>
			<path d='M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z'/>
		</svg>`,
		'copy-done': /*svg*/`<svg data-name='copy-done' width='16' height='16' fill='currentColor' viewBox='0 0 16 16'>
			<path d='M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0'/>
		</svg>`
	};

    //MARK: DEfine the custom element
    /**
     * Define the custom element and add stylesheets to it if not already defined.
     * @param {string} [tagName=Offcanvas.DEFAULT_TAG_NAME] - The tag name to define the custom element.
     * @param {{links:string[], adopted:CSSStyleSheet[], raw:string[]}} [stylesSheets={}] - An object with stylesheets to add to the element. It contains three properties: `links`, `adopted`, and `raw`.
     * @returns {void}
     */
    static define(tagName = this.DEFAULT_TAG_NAME, stylesSheets = {}){

        if(!window.customElements.get(tagName)){

            const {links, adopted, raw} = stylesSheets;

            if(Array.isArray(links)) this.stylesSheets.links.push(...links);
            if(Array.isArray(adopted)) this.stylesSheets.adopted.push(...adopted);
            if(Array.isArray(raw)) this.stylesSheets.raw.push(...raw);

            window.customElements.define(tagName, this);
        }
        else {
            console.warn(`Custom element with tag name "${tagName}" is already defined.`);
        }
    };

    //MARK: Styles managment
    /**
	 * @type {{links:string[], adopted:CSSStyleSheet[], raw:string[]}} Stylesheets to be applied to the component
	 */
	static stylesSheets = {
		links: [],
		adopted: [],
		raw: [],
	};

    /**
     * Applies the given stylesheets to the component.
     * @param {{links:string[], adopted:CSSStyleSheet[], raw:string[]}} [stylesSheets=this.constructor.stylesSheets] 
     * - An object with stylesheets to be applied to the component. It contains three properties: `links`, `adopted`, and `raw`.
     * @returns {void}
     * @fires ready-links
     */
    applyStylesSheets(stylesSheets = {}){

        //Add new styles
        for(const key of ['links', 'adopted', 'raw']) {
            if(Array.isArray(stylesSheets[key])){
                this.constructor.stylesSheets[key].push(...stylesSheets[key]);
            }
        }

        //Get styles
        const {links, adopted, raw} = this.constructor.stylesSheets;

        const $styles = document.createElement('div');
        $styles.classList.add('styles');
        $styles.style.display = 'none';

        //Links
        const linksPromises = links.map((styleSheet) => {

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = styleSheet;

            const { promise, resolve, reject } = Promise.withResolvers();

            //If it's already loaded (rare in shadow DOM, but possible)
            if(link.sheet){
                resolve({ link, href: styleSheet, status: 'loaded' });
            }
            else {
                link.addEventListener('load', () => resolve({ link, href: styleSheet, status: 'loaded' }));
                link.addEventListener('error', () => reject({ link, href: styleSheet, status: 'error' }));
            }

            $styles.append(link);

            return promise;
        });

        this.removeAttribute('ready-links');

        Promise.allSettled(linksPromises).then((results) => {

            this.dispatchEvent(
                new CustomEvent('ready-links', {
                    detail: { results: results.map((r) => r.value || r.reason) },
                })
            );

            this.setAttribute('ready-links', '');
        });

        //Raw css
        raw.forEach((style) => {

            const styleElement = document.createElement('style');
            styleElement.textContent = style;

            $styles.append(styleElement);
        });

        //Clear previous styles
        this.shadowRoot.querySelector('.styles')?.remove();

        //Add new styles
        this.shadowRoot.prepend($styles);
        
        //Adopted
        this.shadowRoot.adoptedStyleSheets = adopted;
    };

    //MARK: Tokenizer
	/**
	 * Default tokenizer implementation.
	 * Used internally as `JSONVisualizer.getTokens` if no custom function is assigned.
	 * @param {string} rawJson - The raw JSON input string.
	 * @param {object} [options] - Optional tokenizer configuration.
	 * @returns {Promise<Array<import('./JSONTokenizer.js').Token>>} Array of tokens.
	 */
	static defaultTokenizer = async (rawJson, options = {}) => {

		const tokenizer = new JSONTokenizer();

		tokenizer.tokenize(rawJson, options);

		return tokenizer.tokens;
	};

	/**
	 * Current tokenizer function.
	 * By default, it points to {@link JSONVisualizer.defaultTokenizer},
	 * but it can be reassigned to provide a custom implementation.
	 * @param {string} rawJson - The raw JSON input string.
	 * @param {object} [options] - Optional tokenizer configuration.
	 * @returns {Promise<Array<import('./JSONTokenizer.js').Token>>} Array of tokens.
	 */
	static getTokens = this.defaultTokenizer;

	//MARK: Default values
    static defaults = {
		renderDeep: Infinity,
		colors: new Set(['hex', 'rgb', 'rgba', 'hsl', 'hsla', 'named']),
		urls: new Set(['http', 'https', 'ftp', 'www', 'domain', 'relative', 'mail', 'phone']),
		foldedMessage: '\u22ef',
		strict: 'auto'
	};

    //MARK: Constructor
    constructor() {
        super();

        this.attachShadow({ mode: 'open' });
    }

    //MARK: Getters and Setters
    set lineNumbers(value) {

		(!value || value === 'none') ? this.setAttribute('line-numbers', 'none') : this.removeAttribute('line-numbers');
	}
	get lineNumbers() {
		return this.getAttribute('line-numbers') !== 'none';
	}

    set toggleLines(value) {

		(!value || value === 'none') ? this.setAttribute('toggle-lines', 'none') : this.removeAttribute('toggle-lines');
	}
	get toggleLines() {
		return this.getAttribute('toggle-lines') !== 'none';
	}

	set indentationGuidesLines(value) {

		(!value || value === 'none') ? this.setAttribute('indentation-guides-lines', 'none') : this.removeAttribute('indentation-guides-lines');
	}
	get indentationGuidesLines() {
		return this.getAttribute('indentation-guides-lines') !== 'none';
	}

	set copyButton(value) {

		(!value || value === 'none') ? this.setAttribute('copy-button', 'none') : this.removeAttribute('copy-button');
	}
	get copyButton() {
		return this.getAttribute('copy-button') !== 'none';
	}


    set renderDeep(value){
		const number = Number(value);

		!Number.isNaN(number) ? this.setAttribute('render-deep', value) : this.removeAttribute('render-deep');
	}
	get renderDeep(){

		const value = this.getAttribute('render-deep');

		if(!value || Number.isNaN(Number(value))) return this.constructor.defaults.renderDeep;

		return Number(value);
	}

	set foldedMessage(value) {
		value ? this.setAttribute('folded-message', value) : this.removeAttribute('folded-message');
	}
	get foldedMessage() {
		return this.getAttribute('folded-message') ?? this.constructor.defaults.foldedMessage;
	}

	//MARK:colors
	/** @param {string | Array<string> | Set<string> | null} value */
	set colors(value){

		if(value == null) return this.removeAttribute('colors');

		if(typeof value === 'string') this.setAttribute('colors', value);

		if(Array.isArray(value) || value instanceof Set){

            const allowedTypes = this.constructor.defaults.colors;

			const items = [...value].map(c => c.trim())
				.filter(c => allowedTypes.has(c));

			return this.setAttribute('colors', items.join(','));
		}
	}
	/** @return {Set<string>} */
	get colors(){
		const value = this.getAttribute('colors');

		if (!value || value === 'all') return this.constructor.defaults.colors;

		if(value === 'none') return new Set();

		return new Set(value.split(',')
			.map(c => c.trim())
			.filter(c => this.constructor.defaults.colors.has(c))
		);
	}

	//MARK:urls
	/** @param {string | Array<string> | Set<string> | null} value */
	set urls(value){

		if(value == null) return this.removeAttribute('urls');

		if(typeof value === 'string') this.setAttribute('urls', value);

		if(Array.isArray(value) || value instanceof Set){

            const allowedTypes = this.constructor.defaults.urls;

			const items = [...value].map(u => u.trim())
				.filter(u => allowedTypes.has(u));

			return this.setAttribute('urls', items.join(','));
		}
	}
	/** @return {Set<string>} */
	get urls(){
		const value = this.getAttribute('urls');

		if (!value || value === 'all') return this.constructor.defaults.urls;

		if(value === 'none') return new Set();

		return new Set(value.split(',')
			.map(u => u.trim())
			.filter(u => this.constructor.defaults.urls.has(u))
		);
	}

	set strict(value){
		value ? this.setAttribute('strict', value) : this.removeAttribute('strict');
	}
	/**@returns {boolean | 'auto'} */
	get strict(){

		const value = this.getAttribute('strict')?.toLowerCase();

		if (!value && this.hasAttribute('strict')) return true;
		
		if(value === 'none' || value === 'false') return false;
		if(value === 'true') return true;

		return this.constructor.defaults.strict;
	}

    //MARK:src
	set src(value){
		typeof value === 'string' ? this.setAttribute('src', value) : this.removeAttribute('src');
	}
	get src(){
		return this.getAttribute('src');
	}

	//MARK:json and data
	set json(value) {

		if(value == null) {

			this.removeAttribute('json');
		}
		else if(typeof value === 'string') {

			try {
                const minified = JSON.stringify(JSON.parse(value));
				
				this.setAttribute('json', minified);
			} 
			catch {
				// Si no es JSON válido, lo guardamos como string puro
				this.setAttribute('json', value);
			}
		} 
		else if(typeof value === 'object') {

			this.setAttribute('json', JSON.stringify(value));
		} 
		else {
            throw new TypeError('json must be a string or object');
        }
	}
	get json() {
		return this.getAttribute('json');
	}
}

export { JSONVisualizerBase };
export default JSONVisualizerBase;
