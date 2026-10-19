// @vitest-environment node
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { expect, test } from 'vitest';

// Full TypeScript compilation can exceed Vitest's 5s default under parallel load.
test(
    'all published declaration modules resolve their types without skipLibCheck',
    { timeout: 30_000 },
    () => {
        const root = fileURLToPath(new URL('../', import.meta.url));
        const files = readdirSync(resolve(root, 'types'))
            .filter((file) => file.endsWith('.d.ts'))
            .map((file) => resolve(root, 'types', file));
        const program = ts.createProgram(files, {
            strict: true,
            noEmit: true,
            skipLibCheck: false,
            target: ts.ScriptTarget.ES2022,
            module: ts.ModuleKind.ESNext,
            moduleResolution: ts.ModuleResolutionKind.Bundler,
            types: [],
            paths: {
                'vue-data-ui': [resolve(root, 'types/vue-data-ui.d.ts')],
                'vue-data-ui/*': [resolve(root, 'types/*.d.ts')],
            },
        });
        const diagnostics = ts
            .getPreEmitDiagnostics(program)
            .map((diagnostic) => {
                const location =
                    diagnostic.file && diagnostic.start !== undefined
                        ? `${diagnostic.file.fileName}:${diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start).line + 1}: `
                        : '';
                return (
                    location +
                    ts.flattenDiagnosticMessageText(
                        diagnostic.messageText,
                        '\n',
                    )
                );
            });
        expect(diagnostics).toEqual([]);
    },
);
