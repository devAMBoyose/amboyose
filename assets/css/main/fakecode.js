document.addEventListener('DOMContentLoaded', () => {
    const PAIRS = [
        { ta: '#html', out: '#html-hl', lang: 'html' },
        { ta: '#css', out: '#css-hl', lang: 'css' },
        { ta: '#js', out: '#js-hl', lang: 'js' },
    ];

    const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // ultra-light tokenizers (good enough to prove colors are working)
    function colorHTML(s) {
        // comments
        s = s.replace(/&lt;!--[\s\S]*?--&gt;/g, m => `<span class="tok-com">${m}</span>`);
        // strings
        s = s.replace(/"(.*?)"/g, m => `<span class="tok-str">${m}</span>`);
        s = s.replace(/'(.*?)'/g, m => `<span class="tok-str">${m}</span>`);
        // attributes (name=)
        s = s.replace(/(\s)([a-zA-Z_:][-a-zA-Z0-9_:.]*)(=)/g, (_, sp, n, eq) => `${sp}<span class="tok-attr">${n}</span>${eq}`);
        // tags
        s = s.replace(/(&lt;\/?)([a-zA-Z0-9:-]+)(?=[\s&gt;])/g, (_, lt, name) => `${lt}<span class="tok-tag">${name}</span>`);
        return s;
    }

    function colorCSS(s) {
        s = s.replace(/\/\*[\s\S]*?\*\//g, m => `<span class="tok-com">${m}</span>`);
        s = s.replace(/(:\s*)(#[0-9a-fA-F]{3,8}\b)/g, (_, c, val) => `${c}<span class="tok-num">${val}</span>`);
        s = s.replace(/([a-z-]+)(\s*:\s*)/g, (_, prop, sep) => `<span class="tok-prop">${prop}</span>${sep}`);
        s = s.replace(/\b(important)\b/g, `<span class="tok-kw">important</span>`);
        return s;
    }

    function colorJS(s) {
        s = s.replace(/\/\/[^\n]*/g, m => `<span class="tok-com">${m}</span>`);
        s = s.replace(/\/\*[\s\S]*?\*\//g, m => `<span class="tok-com">${m}</span>`);
        s = s.replace(/(["'`])(?:\\.|(?!\1).)*\1/g, m => `<span class="tok-str">${m}</span>`);
        s = s.replace(/\b(const|let|var|function|return|if|else|for|while|class|new|await|async|try|catch|throw)\b/g,
            m => `<span class="tok-kw">${m}</span>`);
        s = s.replace(/\b(\d+(?:\.\d+)?)\b/g, m => `<span class="tok-num">${m}</span>`);
        return s;
    }

    function paint(lang, raw) {
        const safe = esc(raw);
        if (lang === 'html') return colorHTML(safe);
        if (lang === 'css') return colorCSS(safe);
        if (lang === 'js') return colorJS(safe);
        return safe;
    }

    PAIRS.forEach(({ ta, out, lang }) => {
        const textarea = document.querySelector(ta);
        const code = document.querySelector(out);
        const layer = code?.parentElement;

        if (!textarea || !code || !layer) return; // silently skip if markup missing

        const draw = () => { code.innerHTML = paint(lang, textarea.value); };
        const sync = () => {
            layer.scrollTop = textarea.scrollTop;
            layer.scrollLeft = textarea.scrollLeft;
        };

        textarea.addEventListener('input', draw);
        textarea.addEventListener('scroll', sync);
        draw();
        sync();
    });
});