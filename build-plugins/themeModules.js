import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function packTheme(value, shapes = [], indices = new Map()) {
    if (Array.isArray(value)) {
        return [-1, ...value.map((item) => packTheme(item, shapes, indices))];
    }
    if (!value || typeof value !== 'object') return value;
    const keys = Object.keys(value);
    const signature = JSON.stringify(keys);
    if (!indices.has(signature)) {
        indices.set(signature, shapes.length);
        shapes.push(keys);
    }
    return [
        indices.get(signature),
        ...Object.values(value).map((item) => packTheme(item, shapes, indices)),
    ];
}

// Intern repeated encoded subtrees and strings within each chart module.
// Constants contain data only; unpacking each occurrence creates fresh objects.
// Separate bindings let consumers discard data used only by unused theme exports.
function shareThemeValues(values) {
    const counts = new Map();
    function count(value) {
        if (!Array.isArray(value) && typeof value !== 'string') return;
        const key = JSON.stringify(value);
        counts.set(key, (counts.get(key) || 0) + 1);
        if (Array.isArray(value)) value.forEach(count);
    }
    values.forEach(count);

    const shared = [];
    const memo = new Map();
    function intern(value) {
        if (!Array.isArray(value) && typeof value !== 'string') return value;
        const key = JSON.stringify(value);
        if (memo.has(key)) return memo.get(key);
        const packed = Array.isArray(value) ? value.map(intern) : value;
        const uses = counts.get(key);
        const size = emitThemeValue(packed).length;
        const reference = { index: shared.length };
        const name = emitThemeValue(reference);
        let result = packed;
        // Include the constant declaration and reference sizes in the decision.
        if ((uses - 1) * size > uses * name.length + name.length + 8) {
            result = reference;
            shared.push(packed);
        }
        memo.set(key, result);
        return result;
    }
    return { values: values.map(intern), shared };
}

function emitThemeValue(value) {
    if (Array.isArray(value)) return `[${value.map(emitThemeValue).join(',')}]`;
    if (value && typeof value === 'object') return `_s${value.index}`;
    return JSON.stringify(value);
}

// Keep editable JSON as the source of truth; compact only the published modules.
export function generateThemeModule(themes, unpacker) {
    const shapes = [];
    const indices = new Map();
    const entries = Object.entries(themes);
    const { values, shared } = shareThemeValues(
        entries.map(([, theme]) => packTheme(theme, shapes, indices)),
    );
    const namedExports = entries
        .map(([key], i) => (key === 'default' ? null : `_t${i} as ${key}`))
        .filter(Boolean);
    const defaultProperties = entries.map(
        ([key], i) => `${JSON.stringify(key)}:_t${i}`,
    );
    return [
        `import { unpackTheme } from ${JSON.stringify(unpacker)};`,
        `const shapes=${JSON.stringify(shapes)};`,
        ...shared.map((value, i) => `const _s${i}=${emitThemeValue(value)};`),
        ...values.map(
            (value, i) =>
                `const _t${i}=/* @__PURE__ */ unpackTheme(${emitThemeValue(value)},shapes);`,
        ),
        `export {${namedExports}};`,
        `export default {${defaultProperties}};`,
    ].join('\n');
}

export function themeModules(root) {
    const themeDirectory =
        resolve(root, 'src/themes').replaceAll('\\', '/') + '/';
    const unpacker = resolve(root, 'src/unpackTheme.js').replaceAll('\\', '/');
    return {
        name: 'vue-data-ui-theme-modules',
        enforce: 'post',
        apply: 'build',
        transform(_code, id) {
            if (!id.startsWith(themeDirectory) || !id.endsWith('.json')) return;
            return {
                code: generateThemeModule(
                    JSON.parse(readFileSync(id, 'utf8')),
                    unpacker,
                ),
                map: null,
            };
        },
    };
}
