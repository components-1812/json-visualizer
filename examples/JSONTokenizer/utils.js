export function debounce(fn, delay) {

    let timeout;

    return (...args) => {

        clearTimeout(timeout);

        timeout = setTimeout(() => fn(...args), delay);
    };
};

export function editorKeydownHandler(e) {

    const editor = e.currentTarget;

    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const value = editor.value;

    // Tabulación
    if (e.key === 'Tab') {

        e.preventDefault();

        const tabSize = 4;
        editor.value = value.slice(0, start) + ' '.repeat(tabSize) + value.slice(end);
        editor.selectionStart = editor.selectionEnd = start + tabSize;

        return;
    }
    // Autocompletar
    if(['{', '[', '(', '"', "'"].includes(e.key)){

        e.preventDefault();

        let insert = '';
        let move = 1;

        // Pares a autocompletar
        switch(e.key) {
            case '{': insert = '{}'; break;
            case '[': insert = '[]'; break;
            case '(': insert = '()'; break;
            case '"': insert = '""'; break;
            case "'": insert = "''"; break;
        }

        editor.value = value.slice(0, start) + insert + value.slice(end);
        editor.selectionStart = editor.selectionEnd = start + move;

        return;
    }
}