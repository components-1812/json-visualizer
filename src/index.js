import JSONVisualizer from "./JSONVisualizer.js";
import JSONVisualizerRawCSS from "./JSONVisualizer.css?raw";

//Add styles
const JSONVisualizerCSS = new CSSStyleSheet();
JSONVisualizerCSS.replaceSync(JSONVisualizerRawCSS);

//Define
JSONVisualizer.define(JSONVisualizer.DEFAULT_TAG_NAME, { 
    adopted: [JSONVisualizerCSS]
});


export {JSONVisualizer}
export default JSONVisualizer;
