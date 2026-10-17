// @vitest-environment node
import {
    mkdtempSync,
    readdirSync,
    readFileSync,
    writeFileSync,
    mkdirSync,
    rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import ts from 'typescript';
import { describe, expect, test } from 'vitest';
import { compactDeclaration } from '../build-plugins/compactDeclarations.cjs';
import { copyTypes } from '../copy-types.cjs';

const directory = new URL('../types/', import.meta.url);
const files = readdirSync(directory).filter((name) => name.endsWith('.d.ts'));
const printer = ts.createPrinter();
const parse = (text, name = 'fixture.d.ts') =>
    ts.createSourceFile(name, text, ts.ScriptTarget.Latest, true);

describe('published declaration compaction', () => {
    test.each(files)(
        'preserves TypeScript declarations and documentation in %s',
        (name) => {
            const source = readFileSync(new URL(name, directory), 'utf8');
            const compact = compactDeclaration(source, name);
            expect(printer.printFile(parse(compact, name))).toBe(
                printer.printFile(parse(source, name)),
            );
            expect(parse(compact, name).parseDiagnostics).toEqual([]);
            expect(compact.split('\n')).toHaveLength(source.split('\n').length);
            expect(compactDeclaration(compact, name)).toBe(compact);
            expect(Buffer.byteLength(compact)).toBeLessThanOrEqual(
                Buffer.byteLength(source),
            );
        },
    );

    test('preserves template literal types, escaped string continuations, docs and directives', () => {
        const source = [
            '    /// <reference lib="es2022" />',
            '    // Keep adjacent comments before the documentation.',
            '    /**',
            '     * Documentation with significant indentation:',
            '     *     const example = "keep me";',
            '     * @deprecated Prefer the newer overload.',
            '     */',
            '    export type Template<T extends string> = `start',
            '        literal indentation ${T}',
            '        end`;',
            '    export type Continued = "start\\',
            '        end";',
            '    export interface Example {',
            '        value: Template<"test">;',
            '    }',
            '    // Final comment.',
            '',
        ].join('\r\n');
        const compact = compactDeclaration(source);
        expect(compact).toContain(
            '        literal indentation ${T}\r\n        end`',
        );
        expect(compact).toContain('"start\\\r\n        end"');
        expect(compact).toContain('     *     const example = "keep me";');
        expect(compact).toContain('    /// <reference lib="es2022" />');
        expect(compact).toContain('\r\nvalue: Template<"test">;');
        expect(printer.printFile(parse(compact))).toBe(
            printer.printFile(parse(source)),
        );
        expect(parse(compact).parseDiagnostics).toEqual([]);
    });

    test('compacts copied declarations without editing source files or other copied assets', () => {
        const temporary = mkdtempSync(join(tmpdir(), 'vue-data-ui-type-copy-'));
        try {
            const source = join(temporary, 'source');
            const output = join(temporary, 'package/dist/types');
            mkdirSync(source);
            const declaration =
                'export interface Example {\n    value: string;\n}\n';
            const asset = Buffer.from([0, 10, 32, 255]);
            writeFileSync(join(source, 'example.d.ts'), declaration);
            writeFileSync(join(source, 'asset.bin'), asset);
            copyTypes(source, output);
            expect(readFileSync(join(output, 'example.d.ts'), 'utf8')).toBe(
                'export interface Example {\nvalue: string;\n}\n',
            );
            expect(readFileSync(join(source, 'example.d.ts'), 'utf8')).toBe(
                declaration,
            );
            expect(readFileSync(join(output, 'asset.bin'))).toEqual(asset);
        } finally {
            rmSync(temporary, { recursive: true, force: true });
        }
    });
});
