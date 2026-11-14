// @vitest-environment node
import { resolve } from 'node:path';
import ts from 'typescript';
import { expect, test } from 'vitest';

test(
    'World custom formatter context supports country/point discrimination from root and subpath types',
    { timeout: 30000 },
    () => {
        const root = process.cwd();
        const fixture = resolve(root, '__world_formatter_consumer__.ts');
        const source = `
        import type {VueUiWorldConfig,VueUiWorldPoint,VueUiWorldDatapoint} from 'vue-data-ui';
        import type {VueUiWorldConfig as SubpathConfig} from 'vue-data-ui/vue-ui-world';
        const config:VueUiWorldConfig={style:{chart:{tooltip:{customFormat:({kind,datapoint,series,config})=>{
            if(kind==='point') {
                const point:VueUiWorldPoint=datapoint;
                const points:VueUiWorldPoint[]=series;
                // @ts-expect-error Countries alone have ISO codes.
                datapoint.code;
                return point.coordinates.join(',')+points.length;
            }
            const country:VueUiWorldDatapoint=datapoint;
            const countries:VueUiWorldDatapoint[]=series;
            return country.code+countries.length;
        }}}}};
        const subpath:SubpathConfig=config;
    `;
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
        const host = ts.createCompilerHost(options),
            getSourceFile = host.getSourceFile.bind(host);
        host.getSourceFile = (file, ...args) =>
            file === fixture
                ? ts.createSourceFile(
                      file,
                      source,
                      ts.ScriptTarget.Latest,
                      true,
                  )
                : getSourceFile(file, ...args);
        const diagnostics = ts.getPreEmitDiagnostics(
            ts.createProgram([fixture], options, host),
        );
        expect(
            diagnostics.map((d) =>
                ts.flattenDiagnosticMessageText(d.messageText, '\n'),
            ),
        ).toEqual([]);
    },
);
