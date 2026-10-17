// @vitest-environment node
import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { rolldown } from 'rolldown';
import {
    generateThemeModule,
    packTheme,
    themeModules,
} from '../build-plugins/themeModules';
import { unpackTheme } from '../src/unpackTheme';

const directory = new URL('../src/themes/', import.meta.url);
const files = readdirSync(directory).filter((name) => name.endsWith('.json'));
const moduleUrl = (code) =>
    `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
const unpacker = moduleUrl(
    readFileSync(new URL('../src/unpackTheme.js', import.meta.url), 'utf8'),
);

function assertIndependentObjects(value, seen = new Set()) {
    if (!value || typeof value !== 'object') return;
    expect(seen.has(value)).toBe(false);
    seen.add(value);
    Object.values(value).forEach((child) =>
        assertIndependentObjects(child, seen),
    );
}

describe('published theme modules', () => {
    test.each(files)(
        'preserves all values, key order and named export identity in %s',
        async (name) => {
            const original = JSON.parse(
                readFileSync(new URL(name, directory), 'utf8'),
            );
            const code = generateThemeModule(original, unpacker);
            const result = await import(/* @vite-ignore */ moduleUrl(code));
            expect(result.default).toEqual(original);
            expect(JSON.stringify(result.default)).toBe(
                JSON.stringify(original),
            );
            expect(Object.keys(result).sort()).toEqual(
                Object.keys(original).sort(),
            );
            for (const key of Object.keys(original).filter(
                (key) => key !== 'default',
            )) {
                expect(result[key]).toBe(result.default[key]);
            }
            assertIndependentObjects(result.default);
        },
    );

    test('keeps arrays, empty values and repeated objects independent', () => {
        const original = {
            first: { colors: ['#FFFFFF', null, false, -1], nested: {} },
            second: { colors: ['#FFFFFF', null, false, -1], nested: {} },
        };
        const shapes = [];
        const encoded = packTheme(original, shapes);
        const first = unpackTheme(encoded, shapes);
        const second = unpackTheme(encoded, shapes);
        expect(first).toEqual(original);
        first.first.colors.push('changed');
        first.first.nested.color = 'changed';
        expect(first.second).toEqual(original.second);
        expect(second).toEqual(original);
        expect(unpackTheme(encoded, shapes)).toEqual(original);
    });

    test('preserves own __proto__ properties without changing prototypes', () => {
        const original = JSON.parse('{"__proto__":{"color":"red"}}');
        const shapes = [];
        const result = unpackTheme(packTheme(original, shapes), shapes);
        expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
        expect(Object.hasOwn(result, '__proto__')).toBe(true);
        expect(result).toEqual(original);
    });

    test('consumers can eliminate unused themes and their reconstruction calls', async () => {
        const sources = {
            entry: `import { minimal } from 'themes'; console.log(minimal);`,
            themes: generateThemeModule(
                {
                    default: {},
                    minimal: { color: 'USED_THEME' },
                    dark: { color: 'UNUSED_THEME' },
                },
                'unpacker',
            ),
            unpacker: readFileSync(
                new URL('../src/unpackTheme.js', import.meta.url),
                'utf8',
            ),
        };
        const bundle = await rolldown({
            input: 'entry',
            plugins: [
                {
                    name: 'theme-tree-shaking-fixture',
                    resolveId: (id) => id,
                    load: (id) => sources[id],
                },
            ],
        });
        try {
            const { output } = await bundle.generate({ format: 'es' });
            const code = output.map((file) => file.code || '').join('\n');
            expect(code).toContain('USED_THEME');
            expect(code).not.toContain('UNUSED_THEME');
        } finally {
            await bundle.close();
        }
    });

    test('leaves raw imports, other JSON files and component code alone', () => {
        const plugin = themeModules(process.cwd());
        for (const path of [
            '/package.json',
            '/src/themes/vue_ui_donut.json?raw',
            '/src/themes/vue_ui_donut.json?url',
            '/src/components/vue-ui-donut.vue',
        ]) {
            expect(
                plugin.transform('unchanged', process.cwd() + path),
            ).toBeUndefined();
        }
    });
});
