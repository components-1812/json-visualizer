/**
 * @typedef {Object} JSONLineParams
 * @property {number} level
 * @property {number} number
 * @property {string} [className]
 * @property {boolean} [showNumber]
 * @property {boolean} [toggleControl]
 * @property {Node} [toggleIcon]
 * @property {boolean} [isOpenBlock]
 * @property {boolean} [isCloseBlock]
 * @property {Set<string>} [colors] A colors list of color type to render
 */

export class JSONLine {

	#node = null;
	tokens = [];

	toggleActive = false;
	toggleIcon = null;
	#toggleButton = null;

	/**
	 * @param {JSONLineParams} [params]
	 */
	constructor(params = {}){

		const { 
			level, number, 
			className = "json-line", 
			showNumber = false,
			toggleControl = false,
			toggleIcon = null,
			isOpenBlock = false,
			isCloseBlock = false,
			colors = new Set(),
			urls = new Set() 
		} = params;

		/**@type {number} */
		this.level = level;
		/**@type {number} */
		this.number = number;

		/**@type {string} */
		this.className = className;

		/**@type {boolean} */
		this.isOpenBlock = isOpenBlock;
		/**@type {boolean} */
		this.isCloseBlock = isCloseBlock;

		/**@type {boolean} */
		this.showNumber = showNumber;

		/**@type {boolean} */
		this.toggleControl = toggleControl;

		/**@type {Node|null} */
		this.toggleIcon = toggleIcon;

		/**@type {Set<string>} */
		this.colors = colors;

		/**@type {Set<string>} */
		this.urls = urls;
	}

	//MARK:Render
	render(){
		if(this.#node){
			this.dispose();
		}

		this.#node = document.createElement("div");
		this.node.classList.add(this.className);

		this.node.setAttribute("level", this.level);
		this.node.style.setProperty("--level", this.level);

		this.node.setAttribute("number", this.number);
		this.node.style.setProperty("--number", this.number);

		//Render tokens
		const content = document.createElement("div");
		content.classList.add(`${this.className}-content`);

		for(let i = 0; i < this.tokens.length; i++){

			content.append( this.#renderToken(this.tokens.at(i)) );
		}

		this.node.append(content);

		//Render Number
		if(this.showNumber){

			const span = document.createElement("span");
			span.classList.add(`${this.className}-number`);

			span.textContent = this.number;

			this.node.prepend(span);
		}

		//Render Toggle control
		if(this.toggleControl && this.isOpenBlock){

			this.node.insertBefore(this.#renderToggleControl(), content);
		}

		return this.node;
	}
	//MARK:renderToken
	#renderToken(token = {}){
		const { type, value, tags = [] } = token;

		const span = document.createElement("span");
		span.classList.add(`${this.className}-token`);
		span.classList.add(type);
		span.setAttribute("tags", tags.join(" "));

		if(this.urls.size > 0 && token.url && this.urls.has(token.url)){

			const a = document.createElement("a");
			a.classList.add(`${this.className}-url`);

			a.href = (() => {

				if(['domain', 'www'].includes(token.url)) return `https://${value}`;

				if(token.url === 'mail' && !String(value).startsWith('mailto:')) return `mailto:${value}`;

				if(token.url === 'phone' && !String(value).startsWith('tel:')) return `tel:${value}`;

				return String(value);
			})();

			if(token.url !== 'relative'){

				a.target = "_blank";
				a.rel = "noopener noreferrer";
			}
	
			a.textContent = String(value);
			span.append(a);

			return span;
		}
		if(this.colors.size > 0 && token.color && this.colors.has(token.color)){

			const colorPreview = document.createElement("span");
			colorPreview.classList.add(`${this.className}-color-preview`);
			colorPreview.style.backgroundColor = value;

			span.append(colorPreview, String(value));

			return span;	
		}
		
		span.textContent = String(value);
		return span;
	}
	#renderToggleControl(){

		this.#toggleButton = document.createElement("button");
		this.#toggleButton.classList.add(`${this.className}-toggle-button`);
		this.#toggleButton.classList.toggle(`active`, this.toggleActive);

		const icon = document.createElement("span");
		icon.classList.add(`${this.className}-toggle-icon`);

		if(this.toggleIcon){

			icon.append(this.toggleIcon);
		}
		else {

			icon.textContent = "v";
		}

		this.#toggleButton.append(icon);

		this.#toggleButton.addEventListener("click", this.#handleToggle);

		return this.#toggleButton;
	}

	#handleToggle = (e) => {

		this.toggleActive = !this.toggleActive;

		const button = e.currentTarget;

		button.classList.toggle(`active`);

		this.node.dispatchEvent(new CustomEvent("toggle-lines", {
			detail: {
				line: this
			},
			bubbles: true,
			composed: true
		}));
	}

	//MARK:Clear
	dispose(){
		this.clearListeners();
		this.#node?.remove();
		this.#node = null;

		this.tokens = [];
		this.toggleIcon = null;
		this.toggleActive = false;
		this.isOpenBlock = false;
		this.isCloseBlock = false;
	}
	clearListeners(){
		this.#toggleButton?.removeEventListener("click", this.#handleToggle);
		this.#toggleButton = null;
	}	

	addToken(token = {}){

		if(!this.isOpenBlock){
			this.isOpenBlock = ['brace-open', 'bracket-open'].includes(token.type);
		}
		if(!this.isCloseBlock){
			this.isCloseBlock = ['brace-close', 'bracket-close'].includes(token.type);
		}

		this.tokens.push(token);
	}

	//MARK: Getters
	get node(){

		return this.#node;
	}
}