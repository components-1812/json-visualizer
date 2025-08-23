import JSONVisualizerBase from './JSONVisualizerBase.js';
import {JSONLine} from './components/JSONLine.js';
import {JSONBlock} from './components/JSONBlock.js';
import { CopyButton } from './components/CopyButton.js';

class JSONVisualizer extends JSONVisualizerBase {

	#data = null;
	#rootBlock = null;
	#copyButton = null;

	constructor() {
		super();

		this.attachShadow({ mode: 'open' });
		
		this.shadowRoot.innerHTML = /*html*/`
			<div class='JSONVisualizer'></div>
			<slot name='icons'>
				<template>
					${JSONVisualizer.DEFAULT_ICONS['toggle']}
					${JSONVisualizer.DEFAULT_ICONS['copy']}
					${JSONVisualizer.DEFAULT_ICONS['copy-done']}
				</template>
			</slot>
		</div>`;

		//MARK: Styles managment
		this.applyStylesSheets();
	}

	//MARK: callback lifecycle
	static observedAttributes = [
		'json', 'src', 'line-numbers', 'toggle-lines', 'folded-message', 
	];

	attributeChangedCallback(name, oldValue, newValue){

		if(oldValue === newValue || !this.hasAttribute('ready')) return;


		if(name === 'src'){

			this.loadJSON(this.src);
		}
		if(name === 'json'){

			this.renderJSON(this.json);
		}
		if(['line-numbers', 'toggle-lines', 'folded-message'].includes(name)){

			if(this.isConnected) this.updateJSON();
		}
	}

	connectedCallback() {

		if(this.copyButton !== 'none'){

			CopyButton.icons = {
				copy: () => this.getIcon('copy', {clone: true}),
				copyDone: () => this.getIcon('copy-done', {clone: true}),
			};

			this.#copyButton = new CopyButton({
				data: () => this.data?.raw,
			});

			this.shadowRoot.append( this.#copyButton.render() );
		}

		this.addEventListener('toggle-lines', this.#handletoggleLines);

		//MARK: First Render
		if(this.src){

			this.loadJSON(this.src);
		}
		else {

			this.renderJSON(this.json ?? this.textContent);
		}
			
		this.dispatchEvent(new CustomEvent('ready'));
		this.setAttribute('ready', '');
	}

  	disconnectedCallback(){

		this.#copyButton?.dispose();
		this.#copyButton = null;

		this.clearJSON();
		this.clearListeners();
		this.removeAttribute('ready');
		this.removeAttribute('ready-json');
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

				this.renderJSON(result);
			}
		} 
		catch (error) {
			
		}
	}

	//MARK: groupTokensByLine
	/**
	 * 
	 * @param {} tokens
	 * @returns 
	 */
	async #groupTokensByLine(tokens = []){

		const lines = [];

		let currentLine = null, lineNumber = 1, level = 0;
		
    	for(let i = 0; i < tokens.length; i++) {

			const token = tokens.at(i);

			if(token.type === 'brace-close' || token.type === 'bracket-close') {

				level--;

				//Se asegura de que } y ] siempre esten en una nueva linea
				const previousToken = tokens.at(i - 1);

				if( !['brace-open', 'bracket-open', 'comma'].includes(previousToken?.type) ) {

					currentLine = null;
				}
			};

			//Crear una nueva linea si no existe
			if(!currentLine) {

				currentLine = new JSONLine({ level, number: lineNumber++});

				lines.push(currentLine);
			}

			currentLine.addToken(token);

			if(token.type === 'brace-close' || token.type === 'bracket-close') {

				const nextToken = tokens.at(i + 1);

				if (nextToken?.type === 'comma') {

					//Agregar la coma en la misma línea
					currentLine.addToken(nextToken);

					//Saltar el token de coma y crear una nueva linea
					currentLine = null;
					i++; continue;
				}
      		}

			if(token.type === 'brace-open' || token.type === 'bracket-open'){

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
  	async renderJSON(json) {

		if(typeof json !== 'string' && typeof json !== 'object')
			throw new Error("No JSON provided to renderJSON method.");

		console.log('render json');
		this.removeAttribute('ready-json');

		//Parse JSON
		let raw = null, parsed = null;

		if(typeof json === 'string'){

			raw = json;

			try {
				parsed = JSON.parse(json);
			} 
			catch (error){}
		}
		else {
			parsed = json;
			raw = JSON.stringify(json);
		}

		//Configiguration
		JSONLine.showNumber = this.lineNumbers;
		JSONLine.showToggle = this.toggleLines;
		JSONLine.showColors = this.colors.size > 0;
		JSONLine.showURLs = this.urls.size > 0;
		JSONLine.colors = this.colors;
		JSONLine.urls = this.urls;
		JSONLine.toggleIcon = () => this.getIcon('toggle', {clone: true});

		JSONBlock.showFoldedMessage = this.foldedMessage !== 'none';
		JSONBlock.foldedMessage = this.foldedMessage;

		//Clear previous JSON	
		if(this.#rootBlock) this.clearJSON();

		//Get JSON Tokens
		const tokens = await (JSONVisualizer.getTokens ?? JSONVisualizer.defaultTokenizer)
		.call(this, raw, {
			detectColor: this.colors.size > 0,
			detectURL: this.urls.size > 0,
			strict: this.strict
		});
		
		//Create Lines
		const lines = await this.#groupTokensByLine(tokens);

		const blockStack = [];
		let rootBlock = null;

		for(let i = 0; i < lines.length; i++){

			const line = lines.at(i);

			if(line.isOpenBlock){

				const block = new JSONBlock({
					level: line.level,
					showContent: line.level < this.renderDeep
				});

				block.append(line);

				//If the content not show, init folded
				block.folded = !block.showContent;
				line.toggleActive = !block.showContent;
				
				blockStack.push(block);
				continue;
			}
			if(line.isCloseBlock){

				const block = blockStack.pop();

				block.append(line);

				//estamos dentro de otro bloque → anidarlo
				if (blockStack.length > 0) {
	
					blockStack.at(-1).append(block);
				}
				else {
					rootBlock = block;
				}

				continue;
			}

			blockStack.at(-1)?.append(line);
		}

		//For incomplete JSON
		if(!rootBlock && blockStack.length > 0){

			while(blockStack.length > 1){

				const block = blockStack.pop();
				blockStack.at(-1).append(block);
			}

			rootBlock = blockStack.at(0);
		}

		this.shadowRoot.querySelector('.JSONVisualizer').append( rootBlock.render() );

		//Line number width
		if(this.lineNumbers){
			const minWidth = `${String(lines.length).length}ch`;
			this.shadowRoot.querySelector('.JSONVisualizer').style.setProperty('--line-number-min-width', minWidth);
		}
		
		this.#rootBlock = rootBlock;
		this.#data = { raw,parsed };

		this.setAttribute('ready-json', '');
		this.dispatchEvent(new CustomEvent('ready-json'));
  	}
	updateJSON(){
		
		if(!this.getAttribute('ready-json'))
			throw new Error('JSON not rendered yet.');

		console.log('update json');
		
		this.removeAttribute('ready-json');

		this.#rootBlock.dispose();

		JSONLine.showNumber = this.lineNumbers;
		JSONLine.showToggle = this.toggleLines;
		JSONLine.showColors = this.colors.size > 0;
		JSONLine.showURLs = this.urls.size > 0;
		JSONLine.colors = this.colors;
		JSONLine.urls = this.urls;
		JSONLine.toggleIcon = () => this.getIcon('toggle', {clone: true});

		JSONBlock.showFoldedMessage = this.foldedMessage !== 'none';
		JSONBlock.foldedMessage = this.foldedMessage;

		this.shadowRoot.querySelector('.JSONVisualizer').append( this.rootBlock.render() );
	}
	clearJSON(){
		this.removeAttribute('ready-json');
		this.#rootBlock?.dispose();
		this.#rootBlock = null;
	}

	//MARK: Get Icon
	getIcon(name, {clone = false} = {}){

		const slot = this.shadowRoot.querySelector(`slot[name='icons']`);

		const defaultIcons = slot.querySelector('template').content;
		const icons = slot.assignedNodes().at(0)?.content;

		const icon = icons?.querySelector(`[data-name='${name}']`) ?? defaultIcons.querySelector(`[data-name='${name}']`);

		return clone ? icon.cloneNode(true) : icon;
	}

	//MARK: Clear
	
	clearListeners(){

		this.removeEventListener('toggle-lines', this.#handletoggleLines);
	}

	//MARK: Toggle Lines
	#handletoggleLines = (e) => {
		const {line} = e.detail;
		const block = line.parent;

		if(!block || !(block instanceof JSONBlock)) return;

		console.log('toggle lines');

		if(!block.showContent){

			block.renderContent();
			block.folded && line.block.unfold();
		}
		else {
			block.folded ? block.unfold() : block.fold();
		}
	}

	//MARK: Getters
	get data(){ return this.#data; }
}

export { JSONVisualizer };
export default JSONVisualizer;