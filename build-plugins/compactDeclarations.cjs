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
    return source.replace(/^[\t ]+/gm, (indentation, offset) => {
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
}

module.exports = { compactDeclaration };
