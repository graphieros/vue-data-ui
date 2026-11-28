const ts = require('typescript');

// Remove indentation only. Newlines, token separators, comments and literals stay intact.
function compactDeclaration(source, fileName = 'declaration.d.ts') {
    const file = ts.createSourceFile(
        fileName,
        source,
        ts.ScriptTarget.Latest,
        true,
    );
    const protectedRanges = [];
    const protectComment = (pos, end) => {
        protectedRanges.push([pos, end]);
    };

    function visit(node) {
        if (
            ts.isStringLiteralLike(node) ||
            ts.isTemplateExpression(node) ||
            ts.isTemplateLiteralTypeNode(node)
        ) {
            protectedRanges.push([node.getStart(file), node.end]);
        }
        ts.forEachLeadingCommentRange(source, node.pos, protectComment);
        ts.forEachTrailingCommentRange(source, node.end, protectComment);
        ts.forEachChild(node, visit);
    }
    visit(file);
    protectedRanges.sort((a, b) => a[0] - b[0]);

    let rangeIndex = 0;
    const unindented = source.replace(/^[\t ]+/gm, (indentation, offset) => {
        while (
            rangeIndex < protectedRanges.length &&
            protectedRanges[rangeIndex][1] <= offset
        ) {
            rangeIndex += 1;
        }
        const range = protectedRanges[rangeIndex];
        return range && range[0] <= offset + indentation.length
            ? indentation
            : '';
    });
    return tightenSpacing(unindented);
}

// Punctuation that never needs surrounding spaces in declaration syntax.
const PUNCTUATION = new Set(':;,{}()[]<>|&=?');

// Drop spaces and tabs next to punctuation, and trailing spaces, outside of
// strings, template literals and comments. Newlines and line-start
// indentation stay intact.
function tightenSpacing(source) {
    let out = '';
    // Last character written. Reading out[out.length - 1] would force V8 to
    // flatten the concatenated string on every whitespace run (quadratic).
    let last;
    const write = (text) => {
        if (text) {
            out += text;
            last = text[text.length - 1];
        }
    };
    let i = 0;
    let braceDepth = 0;
    const templateDepths = [];

    const copyQuoted = (quote) => {
        let j = i + 1;
        while (j < source.length && source[j] !== quote) {
            if (source[j] === '\\') j++;
            j++;
        }
        write(source.slice(i, j + 1));
        i = j + 1;
    };

    // Copies template text up to the closing backtick or the next `${`.
    const copyTemplateText = () => {
        let j = i;
        while (j < source.length) {
            if (source[j] === '\\') {
                j += 2;
                continue;
            }
            if (source[j] === '`') {
                write(source.slice(i, j + 1));
                i = j + 1;
                return;
            }
            if (source[j] === '$' && source[j + 1] === '{') {
                write(source.slice(i, j + 2));
                i = j + 2;
                templateDepths.push(braceDepth);
                return;
            }
            j++;
        }
        write(source.slice(i));
        i = source.length;
    };

    while (i < source.length) {
        const c = source[i];
        if (c === '"' || c === "'") {
            copyQuoted(c);
        } else if (c === '`') {
            write(c);
            i++;
            copyTemplateText();
        } else if (c === '/' && source[i + 1] === '/') {
            let j = source.indexOf('\n', i);
            if (j === -1) j = source.length;
            write(source.slice(i, j));
            i = j;
        } else if (c === '/' && source[i + 1] === '*') {
            let j = source.indexOf('*/', i + 2);
            j = j === -1 ? source.length : j + 2;
            write(source.slice(i, j));
            i = j;
        } else if (c === '{') {
            braceDepth++;
            write(c);
            i++;
        } else if (c === '}') {
            write(c);
            i++;
            if (
                templateDepths.length &&
                templateDepths[templateDepths.length - 1] === braceDepth
            ) {
                templateDepths.pop();
                copyTemplateText();
            } else {
                braceDepth--;
            }
        } else if (c === ' ' || c === '\t') {
            let j = i;
            while (source[j] === ' ' || source[j] === '\t') j++;
            const previous = last;
            const next = source[j];
            const atLineStart = previous === undefined || previous === '\n';
            const atLineEnd =
                next === undefined || next === '\n' || next === '\r';
            const optional =
                !atLineStart &&
                (atLineEnd ||
                    PUNCTUATION.has(previous) ||
                    PUNCTUATION.has(next));
            if (!optional) write(source.slice(i, j));
            i = j;
        } else {
            write(c);
            i++;
        }
    }
    return out;
}

module.exports = { compactDeclaration };
