

export class CopyButton {

    #node = null;

    constructor(params = {}){

        const {
            className = "copy-button",
            icons = null,
            data = null,
            showDoneTimeout = 1000
        } = params;

        this.className = className;
        this.icons = icons;
        this.data = data;
        this.showDoneTimeout = showDoneTimeout;
    }

    render(){
        this.#node = document.createElement("button");
        this.#node.classList.add(this.className);

        //Copy Icon
        const copyIcon = document.createElement("div");
        copyIcon.classList.add("copy-icon");

        this.icons?.copy ? copyIcon.append(this.icons.copy) : copyIcon.textContent = "Copy";

        this.#node.append(copyIcon);

        //Copy Done Icon
        const copyDoneIcon = document.createElement("div");
        copyDoneIcon.classList.add("copy-done-icon");

        this.icons?.copyDone ? copyDoneIcon.append(this.icons.copyDone) : copyDoneIcon.textContent = "Done";

        this.#node.append(copyDoneIcon);

        //Listeners
        this.#node.addEventListener("click", this.#handleCopy);

        return this.#node;
    }

    #handleCopy = (e) => {

        const data = typeof this.data === 'function' ? this.data() : this.data?.current;

        if(data){

            const button = e.currentTarget;

            navigator.clipboard.writeText(
                typeof data === "string" ? data : JSON.stringify(data, null, 2)
            )
            .then(() => {

                button.setAttribute("copy-done", "");
                button.disabled = true;

                setTimeout(() => {

                    button.removeAttribute("copy-done");
                    button.disabled = false;
                    
                }, this.showDoneTimeout);
                
                button.dispatchEvent(new CustomEvent("copy-done", { 
                    detail: { data },
                    bubbles: true,
                    composed: true 
                }));
                console.log("JSON copied to clipboard");
            })
            .catch((error) => {
                console.error("Failed to copy JSON:", error);
            });
        }
    }

    dispose(){
        this.clearListeners();
        this.#node?.remove();
        this.#node = null;
    }

    clearListeners(){
        this.#node?.removeEventListener("click", this.#handleCopy);
    }

    //MARK: Getters
    get node(){

        return this.#node;
    }
}