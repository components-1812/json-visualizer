import JSONVisualizer from "./JSONVisualizer.js";
import JSONVisualizerRawCSS from "./JSONVisualizer.css?raw";

const VERSION = "0.0.3";
const TAG_NAME = 'custom-json-visualizer';

//Add styles
const JSONVisualizerCSS = new CSSStyleSheet();

JSONVisualizerCSS.replaceSync(JSONVisualizerRawCSS);

JSONVisualizer.stylesSheets.adopted.push(JSONVisualizerCSS);

//Define the custom element
if(!customElements.get(TAG_NAME)){

    customElements.define(TAG_NAME, JSONVisualizer);
}
else {

    console.warn(`Custom element with tag name "${TAG_NAME}" is already defined.`);
}

export {JSONVisualizer, TAG_NAME, VERSION}
export default JSONVisualizer;
