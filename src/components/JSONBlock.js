export class JSONBlock {

	static className = 'json-block';
	static showFoldedMessage = true;
	static foldedMessage = '...';

	static foldedMessageVars = {
		'{content_length}': (block) => block.content.length,
	};

	#node = null;
	parent = null;

	/**@type {Array<JSONLine | JSONBlock>} */
	content = [];

	constructor(params = {}){

		const {level = 0, showContent = true, folded = false} = params;

		this.level = level;
		this.showContent = showContent;

		this.folded = folded;
	}

	//MARK:Render
	render(){
		if(this.#node) this.dispose();
		
		const $block = document.createElement('div');
		$block.classList.add(JSONBlock.className);

		$block.setAttribute('level', this.level);
		$block.style.setProperty('--level', this.level);

		$block.toggleAttribute('folded', this.folded);

		//Render Folded Message
		if(JSONBlock.showFoldedMessage){

			let message = JSONBlock.foldedMessage;
			
			for(const key in JSONBlock.foldedMessageVars){

				message = message.replace(key, JSONBlock.foldedMessageVars[key](this));
			}

			$block.style.setProperty('--json-folded-message-content', `'${message}'`);
		}

		//Render Content
		if(this.content.length > 0){

			//First Line
			$block.append( this.content.at(0).render() );

			//Render Content
			const $content = document.createElement('div');
			$content.classList.add(`${JSONBlock.className}-content`);

			if(this.showContent){

				for(let i = 1; i < this.content.length - 1; i++){
	
					$content.append( this.content.at(i).render() );
				}
			} 

			$block.append($content);

			//Last Line
			$block.append( this.content.at(-1).render() );
		}
		
		this.#node = $block;
		return $block;
	}
	renderContent(){

		this.showContent = true;

		const fragment = document.createDocumentFragment();

		for(let i = 1; i < this.content.length - 1; i++){
	
			fragment.append( this.content.at(i).render() );
		}

		this.node?.querySelector(`.${JSONBlock.className}-content`).append(fragment);
	}

	//MARK: Add Line
	append(child){

		child.parent = this;
		this.content.push(child);
	}

	//MARK:Fold and Unfold
	fold(){

		this.folded = true;
		this.node?.toggleAttribute('folded', this.folded);
	}
	unfold(){

		this.folded = false;
		this.node?.toggleAttribute('folded', this.folded);
	}
	toggle(force){

		if(force != null){
			this.folded = force;
		}
		else{
			this.folded = !this.folded;
		}
		
		this.node?.toggleAttribute('folded', this.folded);
	}

	//MARK:Clear
	dispose(){

		for(let i = 0; i < this.content.length; i++){

			this.content.at(i).dispose();
		}
		
		this.#node?.remove();
		this.#node = null;

		this.showContent = false;
		this.content = [];
		this.folded = false;
		this.parent = null;
	}

	//MARK: Getters
	get node(){

		return this.#node;
	}
}
