#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const ts = require("typescript");

const rootDirectory = process.cwd();
const declarationFilePath = path.resolve(rootDirectory, "types/vue-data-ui.d.ts");

const RED = "\x1b[31m";
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";

function formatDiagnostic(diagnostic) {
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");

    if (!diagnostic.file || typeof diagnostic.start !== "number") {
        return message;
    }

    const position = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
    const filePath = path.relative(rootDirectory, diagnostic.file.fileName);

    return `${filePath}:${position.line + 1}:${position.character + 1} - ${message}`;
}

function main() {
    if (!fs.existsSync(declarationFilePath)) {
        throw new Error(`Missing file: ${declarationFilePath}`);
    }

    const compilerOptions = {
        noEmit: true,
        strict: true,
        skipLibCheck: false,
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        lib: ["lib.es2022.d.ts", "lib.dom.d.ts"],
        esModuleInterop: true,
        allowSyntheticDefaultImports: true
    };

    const program = ts.createProgram({
        rootNames: [declarationFilePath],
        options: compilerOptions
    });

    const diagnostics = ts.getPreEmitDiagnostics(program).filter(diagnostic => {
        if (!diagnostic.file) {
            return true;
        }

        return path.resolve(diagnostic.file.fileName) === declarationFilePath;
    });

    if (diagnostics.length === 0) {
        console.log("✅ types/vue-data-ui.d.ts is valid");
        process.exit(0);
    }

    console.error(`❌ ${RED}${BOLD}Found ${diagnostics.length} type error(s) in types/vue-data-ui.d.ts:${RESET}\n`);

    for (const diagnostic of diagnostics) {
        console.error(`😱 ${RED}${formatDiagnostic(diagnostic)}${RESET}`);
        console.error("");
    }

    process.exit(1);
}

try {
    main();
} catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
}