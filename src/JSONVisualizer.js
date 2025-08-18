import {JSONLine} from './JSONLine.js';
import {JSONBlock} from './JSONBlock.js';
import JSONTokenizer from './JSONTokenizer.js';
import { CopyButton } from './CopyButton.js';

export class JSONVisualizer extends HTMLElement {

	static VERSION = '0.0.3';
	static DEFAULT_TAG_NAME = 'custom-json-visualizer';
	static DEFAULT_ICONS = {
		'toggle': `<svg data-name='toggle' width='16' height='16' fill='currentColor' viewBox='0 0 16 16'>
			<path fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708'/>
		</svg>`,
		'copy': `<svg data-name='copy' width='16' height='16' fill='currentColor' viewBox='0 0 16 16'>
			<path d='M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z'/>
			<path d='M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z'/>
		</svg>`,
		'copy-done': `<svg data-name='copy-done' width='16' height='16' fill='currentColor' viewBox='0 0 16 16'>
			<path d='M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0'/>
		</svg>`
	}

	/**
	 * @type {{links:string[], adopted:CSSStyleSheet[], raw:string[]}} Stylesheets to be applied to the component
	 */
	static stylesSheets = {
		links: [],
		adopted: [],
		raw: [],
	};

	/**
	 * Asynchronous function that tokenizes a JSON string.
	 * @async
	 * @param {string} rawJson - The input JSON string.
	 * @returns {Promise<Array<import('./JSONTokenizer.js').Token>>} Array of tokens.
	 */
 	static getTokens = async (rawJson, options = {}) => {

        const tokenizer = new JSONTokenizer(); 

        tokenizer.tokenize(rawJson, options);

        return tokenizer.tokens;
    };

	static defaults = {
		renderDeep: Infinity,
		colors: new Set(['hex', 'rgb', 'rgba', 'hsl', 'hsla', 'named']),
		urls: new Set(['http', 'https', 'ftp', 'www', 'domain', 'relative', 'mail', 'phone']),
		foldedMessage: '\u22ef',
		strict: 'auto'
	}

	#rootBlock = null;
	#copyButton = null;
	#data = null;

	constructor() {
		super();

		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<div class='JSONVisualizer'></div>
			<slot name='icons'>
				<template>
					${JSONVisualizer.DEFAULT_ICONS['toggle']}
					${JSONVisualizer.DEFAULT_ICONS['copy']}
					${JSONVisualizer.DEFAULT_ICONS['copy-done']}
				</template>
			</slot>
		`;

		//MARK: Styles managment
		Promise.allSettled(
			JSONVisualizer.stylesSheets.links.map((styleSheet) => {
				const link = document.createElement('link');
				link.rel = 'stylesheet';
				link.href = styleSheet;

				const { promise, resolve, reject } = Promise.withResolvers();

				link.addEventListener('load', () => resolve({ link, href: styleSheet, status: 'loaded' }));
				link.addEventListener('error', () => reject({ link, href: styleSheet, status: 'error' }));

				this.shadowRoot.prepend(link);

				return promise;
			})
		).then((results) => {
			this.dispatchEvent(
				new CustomEvent('ready-links', {
					detail: { results: results.map((r) => r.value || r.reason) },
				})
			);

			this.setAttribute('ready-links', '');
		});

		JSONVisualizer.stylesSheets.raw.forEach((style) => {
			const styleElement = document.createElement('style');
			styleElement.textContent = style;
			this.shadowRoot.prepend(styleElement);
		});

		this.shadowRoot.adoptedStyleSheets = JSONVisualizer.stylesSheets.adopted;
	}

	//MARK: callback lifecycle
	static observedAttributes = ['json', 'src'];

	attributeChangedCallback(name, oldValue, newValue){

		if(name === 'src' && newValue !== oldValue){

			this.loadJSON(newValue);
		}
		if(name === 'json' && newValue !== oldValue){

			this.renderJSON(newValue);
		}
		
	}

	connectedCallback() {

		if(!this.getAttribute('src') && !this.getAttribute('json')){

			this.json = this.textContent;
		}

		if(this.copyButton !== 'none'){

			this.#copyButton = new CopyButton({
				data: () => this.data,
				icons: {
					copy: this.getIcon('copy', {clone: true}),
					copyDone: this.getIcon('copy-done', {clone: true})
				}
			});

			this.shadowRoot.append( this.#copyButton.render() );
		}
		this.addEventListener('toggle-lines', this.#handletoggleLines);

		this.dispatchEvent(new CustomEvent('ready'));
		this.setAttribute('ready', '');
	}

  	disconnectedCallback(){

		this.#copyButton?.dispose();
		this.#copyButton = null;

		this.clearJSON();

		this.clearListeners();
	}

  	//MARK: loadJSON
	async loadJSON(src, options = {}){

		const { method, } = options;

		try {

			const response = await fetch(src, {
				method: method || 'GET',
			});

			if(response.ok){

				const result = await response.json();

				this.json = result;
			}
		} 
		catch (error) {
			
		}
	}

	//MARK: createJSONLines
	/**
	 * 
	 * @param {string} rawJSON 
	 * @param {{colors:Set<string>}} options 
	 * @returns 
	 */
	async #createJSONLines(rawJSON, options = {}){

		if (!JSONVisualizer.getTokens) {
			console.warn(`JSONVisualizer.getTokens is not defined. Please ensure that the JSONTokenizer`);
			return;
		}

		const { colors = this.colors, urls = this.urls } = options;

		const lines = [];

		const tokens = await JSONVisualizer.getTokens(rawJSON, {
			detectColor: colors.size > 0,
			detectURL: urls.size > 0,
			strict: this.strict
		});

		let currentLine = null;
		let level = 0;
		let lineNumber = 1;
		
    	for (let i = 0; i < tokens.length; i++) {

			const token = tokens.at(i);

			if(['brace-close', 'bracket-close'].includes(token.type)){

				level--;

				//Se asegura de que } y ] siempre esten en una nueva linea
				const previousToken = tokens.at(i - 1);

				if ( !['brace-open', 'bracket-open', 'comma'].includes(previousToken?.type) ) {

					currentLine = null;
				}
			};

			//Crear una nueva linea si no existe
			if(!currentLine) {

				currentLine = new JSONLine({ level, number: lineNumber++, colors, urls});

				lines.push(currentLine);
			}

			currentLine.addToken(token);

			if(['brace-close', 'bracket-close'].includes(token.type)) {

				const nextToken = tokens.at(i + 1);

				if (nextToken?.type === 'comma') {

					//Agregar la coma en la misma línea
					currentLine.addToken(nextToken);

					//Saltar el token de coma y crear una nueva linea
					i++;
					currentLine = null; continue;
				}
      		}

			if(['brace-open', 'bracket-open'].includes(token.type)){

				level++;
			};

			//Crea un nueva linea
			if(['brace-open','brace-close','bracket-open','bracket-close','comma'].includes(token.type)){

				currentLine = null;
			}
    	}

		return lines;
	}
	//MARK: RenderJSON
  	async renderJSON(rawJSON, config = {}) {
		if (!rawJSON) {
			console.warn(`No JSON provided to renderJSON method.`);
			return;
		}

		console.log('render json');

		this.clearJSON();

		const {
			lineNumbers = this.lineNumbers !== 'none', 
			toggleLines = this.toggleLines !== 'none', 
			renderDeep = this.renderDeep,
			colors = this.colors,
			urls = this.urls,
		} = config;
		
		//Create Lines
		const lines = await this.#createJSONLines(rawJSON, {colors, urls});

		const blocksStack = [];

		for(let i = 0; i < lines.length; i++){

			const line = lines.at(i);

			line.showNumber = lineNumbers;

			if(line.isOpenBlock){

				const block = new JSONBlock({
					level: line.level,
					showContent: line.level < renderDeep,
					foldedMessage: this.foldedMessage
				});

				block.openLine = line;
				line.block = block;

				//If the content not show, init folded
				block.folded = !block.showContent;

				if(toggleLines){

					line.toggleControl = true;
					line.toggleActive = !block.showContent;
					line.toggleIcon = this.getIcon('toggle', {clone: true});
				}
				
				blocksStack.push(block);
				continue;
			}
			if(line.isCloseBlock){

				const block = blocksStack.pop();
				block.closeLine = line;
				line.block = block;

				// estamos dentro de otro bloque → anidarlo
				if (blocksStack.length > 0) {
	
					blocksStack.at(-1).content.push(block);
				}
				else {
					this.#rootBlock = block;
				}

				continue;
			}

			const currentBlock = blocksStack.at(-1);

			line.block = currentBlock;
			currentBlock?.content.push(line);
		}

		//For incomplete JSON
		if(!this.#rootBlock && blocksStack.length > 0){

			while(blocksStack.length > 1){

				const block = blocksStack.pop();
				blocksStack.at(-1).content.push(block);
			}

			this.#rootBlock = blocksStack.at(0);
		}

		this.shadowRoot.querySelector('.JSONVisualizer').append( this.#rootBlock.render() );

		//Line number width
		if(lineNumbers){
			const minWidth = `${String(lines.length).length}ch`;
			this.shadowRoot.querySelector('.JSONVisualizer').style.setProperty('--line-number-min-width', minWidth);
		}
		
		this.setAttribute('ready-json', '');
		this.dispatchEvent(new CustomEvent('ready-json'));
  	}
	getIcon(name, {clone = false} = {}){

		const slot = this.shadowRoot.querySelector(`slot[name='icons']`);

		const defaultIcons = slot.querySelector('template').content;
		const icons = slot.assignedNodes().at(0)?.content;

		const icon = icons?.querySelector(`[data-name='${name}']`) ?? defaultIcons.querySelector(`[data-name='${name}']`);

		return clone ? icon.cloneNode(true) : icon;
	}

	//MARK: Clear
	clearJSON(){
		this.removeAttribute('ready-json');
		this.#rootBlock?.dispose();
		this.#rootBlock = null;
	}
	clearListeners(){

		this.removeEventListener('toggle-lines', this.#handletoggleLines);
	}

	//MARK: Toggle Lines
	#handletoggleLines = (e) => {
		const {line} = e.detail;

		if(!line.block.showContent){

			line.block.renderContent();
			line.block.folded && line.block.unfold();
		}
		else {

			line.block.folded ? line.block.unfold() : line.block.fold();
		}
	}

	//MARK: Getters and Setters
	set lineNumbers(value) {
		value ? this.setAttribute('line-numbers', '') : this.removeAttribute('line-numbers');
	}
	get lineNumbers() {
		return this.getAttribute('line-numbers');
	}

	set toggleLines(value) {
		value ? this.setAttribute('toggle-lines', '') : this.removeAttribute('toggle-lines');
	}
	get toggleLines() {
		return this.getAttribute('toggle-lines');
	}

	set indentationGuidesLines(value) {
		value ? this.setAttribute('indentation-guides-lines', '') : this.removeAttribute('indentation-guides-lines');
	}
	get indentationGuidesLines() {
		return this.getAttribute('indentation-guides-lines');
	}

	set copyButton(value) {
		value ? this.setAttribute('copy-button', '') : this.removeAttribute('copy-button');
	}
	get copyButton() {
		return this.getAttribute('copy-button');
	}

	set foldedMessage(value) {
		value ? this.setAttribute('folded-message', value) : this.removeAttribute('folded-message');
	}
	get foldedMessage() {
		return this.getAttribute('folded-message') ?? JSONVisualizer.defaults.foldedMessage;
	}


	set renderDeep(value){
		value ? this.setAttribute('render-deep', value) : this.removeAttribute('render-deep');
	}
	get renderDeep(){

		const value = this.getAttribute('render-deep');

		if(!value || Number.isNaN(Number(value))) return JSONVisualizer.defaults.renderDeep;

		return Number(value);
	}

	//MARK:colors
	/** @param {string | Array<string> | Set<string> | null} value */
	set colors(value){

		if(value == null) return this.removeAttribute('colors');

		if(typeof value === 'string') this.setAttribute('colors', value);

		if(Array.isArray(value) || value instanceof Set){

			const items = [...value].map(c => c.trim())
				.filter(c => c && JSONVisualizer.defaults.colors.has(c));

			return this.setAttribute('colors', items.join(','));
		}
	}
	/** @return {Set<string>} */
	get colors(){
		const value = this.getAttribute('colors');

		if (!value || value === 'all') return JSONVisualizer.defaults.colors;
		if(value === 'none') return new Set();

		return new Set(value.split(',')
			.map(c => c.trim())
			.filter(c => c && JSONVisualizer.defaults.colors.has(c))
		);
	}

	//MARK:urls
	/** @param {string | Array<string> | Set<string> | null} value */
	set urls(value){
		if(value == null) return this.removeAttribute('urls');

		if(typeof value === 'string') this.setAttribute('urls', value);

		if(Array.isArray(value) || value instanceof Set){

			const items = [...value].map(u => u.trim())
				.filter(u => u && JSONVisualizer.defaults.urls.has(u));

			return this.setAttribute('urls', items.join(','));
		}
	}
	/** @return {Set<string>} */
	get urls(){
		const value = this.getAttribute('urls');

		if (!value || value === 'all') return JSONVisualizer.defaults.urls;
		if(value === 'none') return new Set();

		return new Set(value.split(',')
			.map(u => u.trim())
			.filter(u => u && JSONVisualizer.defaults.urls.has(u))
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

		return JSONVisualizer.defaults.strict;
	}

	//MARK:src
	set src(value){
		value ? this.setAttribute('src', value) : this.removeAttribute('src');
	}
	get src(){
		return this.getAttribute('src');
	}

	//MARK:json and data
	set json(value) {

		if (value == null) {
			this.removeAttribute('json');
			this.#data = null;
			return;
		}

		if (typeof value === 'string') {

			try {
				this.#data = JSON.parse(value);
				this.setAttribute('json', JSON.stringify(this.#data));
			} 
			catch {
				// Si no es JSON válido, lo guardamos como string puro
				this.#data = value;
				this.setAttribute('json', value);
			}
		} 
		else if (typeof value === 'object') {

			this.#data = value;
			this.setAttribute('json', JSON.stringify(this.#data));
		} 
		else {
			throw new TypeError('json must be a string or object');
		}
	}
	get json() {
		return {raw: this.getAttribute('json'), parsed: this.#data };
	}
	get data() {
		return this.#data;
	}
}

export default JSONVisualizer;