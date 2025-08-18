

const URL_PATTERNS = {
    HTTP: {
        type: 'http',
        regex: /^http:\/\/[^\s"'`<>()]+$/,
        test(string = ''){
            return this.regex.test(string);
        }
    },
    HTTPS: {
        type: 'https',
        regex: /^https:\/\/[^\s"'`<>()]+$/,
        test(string = ''){
            return this.regex.test(string);
        }
    },
    FTP: {
        type: 'ftp',
        regex: /^ftp:\/\/[^\s"'`<>()]+$/,
        test(string = ''){
            return this.regex.test(string);
        }
    },
    WWW: {
        type: 'www',
        regex: /^www\.[^\s"'`<>()]+$/,
        test(string = ''){
            return this.regex.test(string);
        }
    },
    DOMAIN: {
        type: 'domain',
        regex: /^[a-z0-9.-]+\.[a-z]{2,}(\/[^\s"'`<>()]*)?$/i,
        test(string = ''){
            return this.regex.test(string);
        }
    },
    RELATIVE: {
        type: 'relative',
        regex: /^(\.{1,2}\/|\/)[^\s"'`<>()]+$/,
        test(string = ''){
            return this.regex.test(string);
        }
    },
    MAIL: {
        type: 'mail',
        regex: /^(?:mailto:)?[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}(?:\?[^\s"'`<>()]+)?$/i,
        test(string = ''){
            return this.regex.test(string);
        }
    },
    PHONE: {
        type: 'phone',
        regex: /^(?:tel:)?\+?[\d\s-]*?(?:\(\d{1,4}\))?[\d\s-]{5,}$/,
        test(string = ''){
            return this.regex.test(string);
        }
    },
};

export { URL_PATTERNS };
export default URL_PATTERNS;