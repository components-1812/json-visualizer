import JSONVisualizer from "./JSONVisualizer.js";

const VERSION = "0.0.3";
const TAG_NAME = 'custom-json-visualizer';

//Define the custom element
if(!customElements.get(TAG_NAME)){

    customElements.define(TAG_NAME, JSONVisualizer);
}
else {

    console.warn(`Custom element with tag name "${TAG_NAME}" is already defined.`);
}

export {JSONVisualizer, TAG_NAME, VERSION}
export default JSONVisualizer;