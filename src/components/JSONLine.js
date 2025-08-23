/**
 * @typedef {Object} JSONLineParams
 *  @property {number} level
 *  @property {number} number
 *  @property {boolean} [toggleActive]
 * 
 * @typedef {Object} JSONLineInstance
 *  @property {string} className
 *  @property {number} level
 *  @property {number} number
 *  @property {boolean} showToggle
 *  @property {boolean} toggleActive
 *  @property {Node} toggleIcon
 *  @property {Set<string>} colors
 *  @property {Set<string>} urls
 *  @property {Node} node
 *  @property {Array<Token>} tokens
 *  @property {boolean} isOpenBlock
 *  @property {boolean} isCloseBlock
 */

/**@implements {JSONLineInstance} */
export class JSONLine {

	static className = 'json-line';

	static showNumber = true;
	static showToggle = true;
	static showColors = true;
	static showURLs = true;

	static colors = new Set(['hex', 'rgb', 'rgba', 'hsl', 'hsla', 'named']);
	static urls = new Set(['http', 'https', 'ftp', 'relative', 'mail', 'phone']);

	static toggleIcon = () => document.createTextNode('v');


	#node = null;
	tokens = [];

	parent = null;
	#toggleButton = null;

	isOpenBlock = false;
	isCloseBlock = false;

	/**
	 * @param {JSONLineParams} [params]
	 */
	constructor(params = {}){
		const { 
			level, number, 
			toggleActive = false,
		} = params;

		this.level = level;
		this.number = number;

		this.toggleActive = toggleActive;
	}

	//MARK:Render
	render(){
		if(this.#node){
			this.dispose();
		}

		const $line = document.createElement('div');
		$line.classList.add(JSONLine.className);

		$line.setAttribute('level', this.level);
		$line.style.setProperty('--level', this.level);

		$line.setAttribute('number', this.number);
		$line.style.setProperty('--number', this.number);

		//Render Number
		if(JSONLine.showNumber){

			$line.append( this.#renderLineNumber() );
		}

		//Render Toggle control
		if(JSONLine.showToggle && this.isOpenBlock){

			$line.append(this.#renderToggleControl());
		}

		//Render tokens
		const $content = document.createElement('div');
		$content.classList.add(`${JSONLine.className}-content`);

		for(let i = 0; i < this.tokens.length; i++){

			$content.append( this.#renderToken(this.tokens.at(i)) );
		}

		$line.append($content);

		this.#node = $line;
		return $line;
	}
	//MARK:renderToken
	#renderToken(token = {}){

		const { type, value, tags = [] } = token;

		const $span = document.createElement('span');
		$span.classList.add(`${JSONLine.className}-token`, type);
		$span.setAttribute('tags', tags.join(' '));

		if(JSONLine.showURLs && token.url && JSONLine.urls.has(token.url)){

			$span.append( this.#renderTokenURL(token) );
		}
		else if(JSONLine.showColors && token.color && JSONLine.colors.has(token.color)){

			$span.append( this.#renderTokenColor(token) );
		}
		else {

			$span.textContent = String(value);
		}
		
		return $span;
	}
	#renderTokenURL(token = {}){

		const $anchor = document.createElement('a');
		$anchor.classList.add(`${JSONLine.className}-url`);

		const value = String(token.value);

		$anchor.href = (() => {

			if(token.url === 'domain' || token.url === 'www') return `https://${value}`;

			if(token.url === 'mail' && !value.startsWith('mailto:')) return `mailto:${value}`;

			if(token.url === 'phone' && !value.startsWith('tel:')) return `tel:${value}`;

			return value;
		})();

		if(token.url !== 'relative'){

			$anchor.target = '_blank';
			$anchor.rel = 'noopener noreferrer';
		}

		$anchor.textContent = value;

		return $anchor;
	}
	#renderTokenColor(token = {}){

		const fragment = document.createDocumentFragment();
		const colorPreview = document.createElement('span');

		colorPreview.classList.add(`${JSONLine.className}-color-preview`);
		colorPreview.style.backgroundColor = token.value;

		fragment.append(colorPreview, String(token.value));

		return fragment;
	}
	#renderLineNumber(){

		const $span = document.createElement('span');
		$span.classList.add(`${JSONLine.className}-number`);

		$span.textContent = this.number;

		return $span;
	}


	#renderToggleControl(){

		const $button = document.createElement('button');
		$button.classList.add(`${JSONLine.className}-toggle-button`);
		$button.classList.toggle(`active`, this.toggleActive);

		const $icon = document.createElement('span');
		$icon.classList.add(`${JSONLine.className}-toggle-icon`);

		$icon.append(JSONLine.toggleIcon());
		
		$button.append($icon);
		$button.addEventListener('click', this.#handleToggle);

		this.#toggleButton = $button;
		return $button;
	}

	//MARK:Events
	#handleToggle = (e) => {

		this.toggleActive = !this.toggleActive;

		const button = e.currentTarget;
		button.classList.toggle(`active`);

		this.node.dispatchEvent(new CustomEvent('toggle-lines', {
			detail: { line: this },
			bubbles: true,
			composed: true
		}));
	}

	//MARK:Clear
	dispose(){
		this.#toggleButton?.removeEventListener('click', this.#handleToggle);
		this.#toggleButton = null;

		this.#node?.remove();
		this.#node = null;
	}


	addToken(token = {}){

		if(!this.isOpenBlock){
			this.isOpenBlock = token.type === 'brace-open' || token.type === 'bracket-open';
		}
		if(!this.isCloseBlock){
			this.isCloseBlock = token.type === 'brace-close' || token.type === 'bracket-close';
		}

		this.tokens.push(token);
	}

	//MARK: Getters
	get node(){

		return this.#node;
	}
}