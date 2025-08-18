

const NAMED_COLORS = new Set([
    'aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure', 'beige', 'bisque',
    'black', 'blanchedalmond', 'blue', 'blueviolet', 'brown', 'burlywood', 'cadetblue',
    'chartreuse', 'chocolate', 'coral', 'cornflowerblue', 'cornsilk', 'crimson', 'cyan',
    'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgreen', 'darkgrey',
    'darkkhaki', 'darkmagenta', 'darkolivegreen', 'darkorange', 'darkorchid', 'darkred',
    'darksalmon', 'darkseagreen', 'darkslateblue', 'darkslategray', 'darkslategrey',
    'darkturquoise', 'darkviolet', 'deeppink', 'deepskyblue', 'dimgray', 'dimgrey',
    'dodgerblue', 'firebrick', 'floralwhite', 'forestgreen', 'fuchsia', 'gainsboro',
    'ghostwhite', 'gold', 'goldenrod', 'gray', 'grey', 'green', 'greenyellow', 'honeydew',
    'hotpink', 'indianred', 'indigo', 'ivory', 'khaki', 'lavender', 'lavenderblush',
    'lawngreen', 'lemonchiffon', 'lightblue', 'lightcoral', 'lightcyan',
    'lightgoldenrodyellow', 'lightgray', 'lightgreen', 'lightgrey', 'lightpink',
    'lightsalmon', 'lightseagreen', 'lightskyblue', 'lightslategray', 'lightslategrey',
    'lightsteelblue', 'lightyellow', 'lime', 'limegreen', 'linen', 'magenta', 'maroon',
    'mediumaquamarine', 'mediumblue', 'mediumorchid', 'mediumpurple', 'mediumseagreen',
    'mediumslateblue', 'mediumspringgreen', 'mediumturquoise', 'mediumvioletred',
    'midnightblue', 'mintcream', 'mistyrose', 'moccasin', 'navajowhite', 'navy',
    'oldlace', 'olive', 'olivedrab', 'orange', 'orangered', 'orchid', 'palegoldenrod',
    'palegreen', 'paleturquoise', 'palevioletred', 'papayawhip', 'peachpuff', 'peru',
    'pink', 'plum', 'powderblue', 'purple', 'rebeccapurple', 'red', 'rosybrown',
    'royalblue', 'saddlebrown', 'salmon', 'sandybrown', 'seagreen', 'seashell', 'sienna',
    'silver', 'skyblue', 'slateblue', 'slategray', 'slategrey', 'snow', 'springgreen',
    'steelblue', 'tan', 'teal', 'thistle', 'tomato', 'transparent', 'turquoise', 'violet',
    'wheat', 'white', 'whitesmoke', 'yellow', 'yellowgreen'
]);


/* MARK: COLORS
 * Collection of regex patterns and validators for valid CSS color formats.
 * Supports HEX (3, 4, 6, and 8 digits), RGB, RGBA, HSL, and HSLA.
 * Each entry includes tags and an optional `validRange()` method to ensure values fall within valid numeric ranges.
 */
const COLOR_PATTERNS = {
    HEX: {
        type: 'hex',
        regex: /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/,
        test(color = ''){
            return this.regex.test(color);
        }
    },
    RGB: {
        type: 'rgb',
        regex: /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i,
        test(color = ''){
            return this.regex.test(color);
        },
        validRange(color = ''){
            const match = color.match(this.regex);

            if (!match) return false;

            const [, r, g, b] = match;

            const R = Number(r), G = Number(g), B = Number(b);

            return (
                R >= 0 && R <= 255 &&
                G >= 0 && G <= 255 &&
                B >= 0 && B <= 255
            );
        }
    },
    RGBA: {
        type: 'rgba',
        regex: /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0|1|0?\.\d+)\s*\)$/i,
        test(color = ''){
            return this.regex.test(color);
        },
        validRange(color = ''){
            const match = color.match(this.regex);

            if (!match) return false;

            const [, r, g, b, a] = match;

            const R = Number(r), G = Number(g), B = Number(b), A = Number(a);

            return (
                R >= 0 && R <= 255 &&
                G >= 0 && G <= 255 &&
                B >= 0 && B <= 255 &&
                A >= 0 && A <= 1
            );
        }
    },
    HSL: {
        type: 'hsl',
        regex: /^hsl\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)$/i,
        test(color = ''){
            return this.regex.test(color);
        },
        validRange(color = ''){

            const match = color.match(this.regex);

            if (!match) return false;

            const [, h, s, l] = match;

            const H = Number(h), S = Number(s), L = Number(l);

            return (
                H >= 0 && H <= 360 &&
                S >= 0 && S <= 100 &&
                L >= 0 && L <= 100
            );
        }
    },
    HSLA: {
        type: 'hsla',
        regex: /^hsla\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*,\s*(0|1|0?\.\d+)\s*\)$/i,
        test(color = ''){
            return this.regex.test(color);
        },
        validRange(color = ''){

            const match = color.match(this.regex);

            if (!match) return false;
            
            const [, h, s, l, a] = match;

            const H = Number(h), S = Number(s), L = Number(l), A = Number(a);

            return (
                H >= 0 && H <= 360 &&
                S >= 0 && S <= 100 &&
                L >= 0 && L <= 100 &&
                A >= 0 && A <= 1
            );
        }
    },
    NAMED_COLORS: {
        type: 'named',
        test(color = ''){

            if(typeof CSS !== 'undefined' && CSS.supports){

                return CSS.supports('color', color);
            }
            else {

                return NAMED_COLORS.has(color.toLowerCase());
            }
        }
    }
}

export { COLOR_PATTERNS, NAMED_COLORS };
export default COLOR_PATTERNS;


