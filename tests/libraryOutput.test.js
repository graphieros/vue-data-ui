// @vitest-environment node
import { beforeAll, describe, expect, test } from 'vitest';
import { rolldown } from 'rolldown';
import config from '../vite.config';

const { minify, comments } = config.build.rolldownOptions.output;

async function bundleModules(sources, input, output = {}) {
    const bundle = await rolldown({
        input,
        plugins: [
            {
                name: 'in-memory-library-fixture',
                resolveId: (id) => id.replace(/^\.\//, ''),
                load: (id) => sources[id],
            },
        ],
    });
    try {
        const result = await bundle.generate({ format: 'es', ...output });
        return Object.fromEntries(
            result.output
                .filter((file) => file.type === 'chunk')
                .map((file) => [file.fileName, file.code]),
        );
    } finally {
        await bundle.close();
    }
}

describe('published library output', () => {
    let library;
    beforeAll(async () => {
        library = await bundleModules(
            {
                entry: `
                    /*! @license library-output-test */
                    export const used = 42;
                    export const unused = /* @__PURE__ */ globalThis.makeFeature('UNUSED_FEATURE');
                    export function loadFeature() { return import('./feature'); }
                `,
                feature: `export const feature = 'LAZY_FEATURE';`,
            },
            'entry',
            { minify, comments, entryFileNames: 'library.js' },
        );
    });

    test('preserves purity annotations, license comments and lazy exports', () => {
        expect(library['library.js']).toMatch(/[@#]__PURE__/);
        expect(library['library.js']).toContain('@license library-output-test');
        expect(library['library.js']).toContain('loadFeature');
        expect(Object.keys(library)).toHaveLength(2);
    });

    test('consumers eliminate unused pure initializers and lazy features', async () => {
        const output = await bundleModules(
            {
                ...library,
                consumer: `import { used } from './library.js'; console.log(used);`,
            },
            'consumer',
        );
        const code = Object.values(output).join('\n');
        expect(code).toContain('42');
        expect(code).not.toContain('UNUSED_FEATURE');
        expect(code).not.toContain('LAZY_FEATURE');
        expect(code).not.toContain('makeFeature');
        expect(Object.keys(output)).toHaveLength(1);
    });

    test('the unused-initializer check detects lost annotations', async () => {
        const stripped = Object.fromEntries(
            Object.entries(library).map(([name, code]) => [
                name,
                code.replace(/\/\*\s*[@#]__PURE__\s*\*\//g, ''),
            ]),
        );
        const output = await bundleModules(
            {
                ...stripped,
                consumer: `import { used } from './library.js'; console.log(used);`,
            },
            'consumer',
        );
        expect(Object.values(output).join('\n')).toContain('UNUSED_FEATURE');
    });
});
