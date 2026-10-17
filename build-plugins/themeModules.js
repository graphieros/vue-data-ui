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

// Keep editable JSON as the source of truth; compact only the published modules.
export function generateThemeModule(themes, unpacker) {
    const shapes = [];
    const indices = new Map();
    const entries = Object.entries(themes);
    const values = entries.map(([, theme]) =>
        packTheme(theme, shapes, indices),
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
        ...values.map(
            (value, i) =>
                `const _t${i}=/* @__PURE__ */ unpackTheme(${JSON.stringify(value)},shapes);`,
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
