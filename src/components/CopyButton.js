

export class CopyButton {

    static className = "copy-button";
    static icons = {
        copy: () => document.createTextNode("Copy"),
        copyDone: () => document.createTextNode("Done"),
    };
    static showDoneTimeout = 1000;

    #node = null;

    constructor(params = {}){

        const {
            data = null,
        } = params;

        this.data = data;
    }

    render(){
        this.#node = document.createElement("button");
        this.#node.classList.add(CopyButton.className);

        //Copy Icon
        const copyIcon = document.createElement("div");
        copyIcon.classList.add("copy-icon");

        copyIcon.append(CopyButton.icons.copy());

        //Copy Done Icon
        const copyDoneIcon = document.createElement("div");
        copyDoneIcon.classList.add("copy-done-icon");

        copyDoneIcon.append(CopyButton.icons.copyDone())

        this.#node.append(copyIcon, copyDoneIcon);

        //Listeners
        this.#node.addEventListener("click", this.#handleCopy);

        return this.#node;
    }

    #handleCopy = (e) => {

        const data = (typeof this.data === 'function') ? this.data() : this.data?.current;

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
                    
                }, CopyButton.showDoneTimeout);
                
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
        this.#node?.removeEventListener("click", this.#handleCopy);
        this.#node?.remove();
        this.#node = null;
    }

    //MARK: Getters
    get node(){

        return this.#node;
    }
}