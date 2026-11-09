import { readFileSync, readdirSync } from 'node:fs';
import { parse } from '@vue/compiler-sfc';
import { baseParse } from '@vue/compiler-dom';
import { expect, test } from 'vitest';
import { useConfig } from '../src/useConfig';
const components = readdirSync('src/components').filter((name) =>
    name.endsWith('.vue'),
);
const configs = useConfig();
for (const filename of components) {
    const source = readFileSync(`src/components/${filename}`, 'utf8');
    if (!source.includes('<A11yDataTable')) continue;
    test(`${filename} defaults to no hidden table and gates its creation on includeTable`, () => {
        const key = filename.replace('.vue', '').replaceAll('-', '_');
        expect(configs[key].a11y.includeTable).toBe(false);
        const { descriptor } = parse(source);
        const ast = baseParse(descriptor.template.content);
        let found = false;
        function visit(node) {
            if (node.tag === 'A11yDataTable') {
                found = true;
                const condition = node.props.find(
                    (prop) => prop.type === 7 && prop.name === 'if',
                );
                expect(condition.exp.content.trim()).toMatch(
                    /^FINAL_CONFIG\.a11y\.includeTable\s*&&/,
                );
            }
            node.children?.forEach(visit);
        }
        visit(ast);
        expect(found).toBe(true);
    });
}
