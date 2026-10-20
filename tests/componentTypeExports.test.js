// @vitest-environment node
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { expect, test } from 'vitest';

const root = fileURLToPath(new URL('../', import.meta.url));
const parse = (file) =>
    ts.createSourceFile(
        file,
        readFileSync(file, 'utf8'),
        ts.ScriptTarget.Latest,
        true,
    );
const modules = readdirSync(resolve(root, 'types'))
    .filter((name) => name.startsWith('vue-ui-') && name.endsWith('.d.ts'))
    .map((file) => ({ file, source: parse(resolve(root, 'types', file)) }))
    .filter(({ source }) => source.statements.every(ts.isExportDeclaration));

test.each(modules)(
    '$file preserves the runtime entry point exports',
    ({ file, source }) => {
        const entry = parse(
            resolve(root, 'src/entries', file.replace('.d.ts', '.js')),
        );
        const names = (statements) =>
            statements.flatMap(
                (statement) =>
                    statement.exportClause?.elements?.map(
                        (element) => element.name.text,
                    ) ?? [],
            );
        const values = source.statements.filter(
            (statement) => !statement.isTypeOnly,
        );
        expect(names(values).sort()).toEqual(names(entry.statements).sort());
        for (const statement of source.statements) {
            expect(statement.moduleSpecifier.text).toBe('vue-data-ui');
        }
    },
);

// Full TypeScript compilation can exceed Vitest's 5s default under parallel load.
test(
    'subpath constructors, props, slots, events and exposed instances match the root types',
    { timeout: 30_000 },
    () => {
        expect(modules.length).toBeGreaterThan(0);
        const fixture = resolve(root, '__component_types_consumer__.ts');
        const lines = [
            'type Equal<A,B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;',
            'type Expect<T extends true> = T;',
            "import Carousel from 'vue-data-ui/vue-ui-carousel-table';",
            "import Stackbar from 'vue-data-ui/vue-ui-stackbar';",
            "import type { VueUiResetActionSlotProps } from 'vue-data-ui';",
            "type Caption = NonNullable<InstanceType<typeof Carousel>['$slots']['caption']>;",
            'type CaptionArguments = Expect<Equal<Parameters<Caption>, []>>;',
            "type ResetAction = NonNullable<InstanceType<typeof Stackbar>['$slots']['reset-action']>;",
            'type ResetArguments = Expect<Equal<Parameters<ResetAction>, [props: VueUiResetActionSlotProps]>>;',
        ];
        modules.forEach(({ file, source }, index) => {
            const values = source.statements.find(
                (statement) => !statement.isTypeOnly,
            );
            const name = values.exportClause.elements.find(
                (element) => element.name.text !== 'default',
            ).name.text;
            lines.push(
                `import Default${index}, { ${name} as Named${index} } from 'vue-data-ui/${file.replace('.d.ts', '')}';`,
            );
            lines.push(
                `import { ${name} as Root${index} } from 'vue-data-ui';`,
            );
            lines.push(
                `type Default${index}Check = Expect<Equal<typeof Default${index}, typeof Root${index}>>;`,
            );
            lines.push(
                `type Named${index}Check = Expect<Equal<typeof Named${index}, typeof Root${index}>>;`,
            );
            for (const part of ['', "['$props']", "['$slots']", "['$emit']"]) {
                lines.push(
                    `type Check${index}_${lines.length} = Expect<Equal<InstanceType<typeof Default${index}>${part}, InstanceType<typeof Root${index}>${part}>>;`,
                );
            }
        });
        const options = {
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
        };
        const host = ts.createCompilerHost(options);
        const getSourceFile = host.getSourceFile.bind(host);
        host.getSourceFile = (file, ...args) =>
            file === fixture
                ? ts.createSourceFile(
                      file,
                      lines.join('\n'),
                      ts.ScriptTarget.Latest,
                      true,
                  )
                : getSourceFile(file, ...args);
        const program = ts.createProgram([fixture], options, host);
        expect(
            ts
                .getPreEmitDiagnostics(program)
                .map((diagnostic) =>
                    ts.flattenDiagnosticMessageText(
                        diagnostic.messageText,
                        '\n',
                    ),
                ),
        ).toEqual([]);
    },
);
