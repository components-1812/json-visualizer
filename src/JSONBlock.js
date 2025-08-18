export class JSONBlock {

	#node = null;

	/**@type {Array<JSONLine | JSONBlock>} */
	content = [];

	/**@type {JSONLine} */
	openLine = null;
	/**@type {JSONLine} */
	closeLine = null;

	/**@type {boolean} */
	folded = false;

	constructor(params = {}){

		const {className = 'json-block', level = 0, showContent = true, foldedMessage = '', folded = false} = params;

		this.className = className;
		this.level = level;
		this.showContent = showContent;
		this.foldedMessage = foldedMessage;

		this.folded = folded;
	}

	//MARK:Render
	render(){
		if(this.#node){
			this.dispose();
		}

		this.#node = document.createElement("div");
		this.node.classList.add(this.className);

		this.node.setAttribute('level', this.level);
		this.node.style.setProperty('--level', this.level);

		if(this.folded) this.node.setAttribute("folded", "");
		
		if(this.foldedMessage && this.foldedMessage !== 'none'){

			const message = this.foldedMessage.includes('{content_length}') ? 
				this.foldedMessage.replace('{content_length}', this.content.length) : 
				this.foldedMessage;

			this.node.style.setProperty('--json-folded-message-content', `"${message}"`);
		}

		//
		if(this.openLine){

			this.node.append( this.openLine.render() );
		}
		
		//Render Content
		const content = document.createElement("div");
		content.classList.add(`${this.className}-content`);

		this.node.append(content);

		if(this.showContent) this.renderContent();

		//
		if(this.closeLine){

			this.node.append( this.closeLine.render() );
		}

		return this.node;
	}
	renderContent(){

		this.showContent = true;

		const fragment = document.createDocumentFragment();

		for(let i = 0; i < this.content.length; i++){
	
			fragment.append( this.content.at(i).render() );
		}

		this.node?.querySelector(`.${this.className}-content`).append(fragment);
	}

	//MARK:Fold and Unfold
	fold(){

		this.folded = true;
		this.node?.setAttribute("folded", "");
	}
	unfold(){

		this.folded = false;
		this.node?.removeAttribute("folded");
	}

	//MARK:Clear
	dispose(){
		this.openLine?.dispose();
		this.closeLine?.dispose();

		for(let i = 0; i < this.content.length; i++){

			this.content.at(i).dispose();
		}
		
		this.#node?.remove();
		this.#node = null;

		this.openLine = null;
		this.closeLine = null;
		this.content = [];
		this.folded = false;
	}

	//MARK: Getters
	get node(){

		return this.#node;
	}
}
