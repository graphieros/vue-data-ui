const { existsSync, renameSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');

const oldName = resolve(__dirname, 'dist/vue-data-ui.css');
const newName = resolve(__dirname, 'dist/style.css');

if (existsSync(oldName)) {
    try {
        renameSync(oldName, newName);
        console.log(`Renamed '${oldName}' to '${newName}' successfully!`);
    } catch (error) {
        console.error(`Error renaming file: ${error.message}`);
    }
} else if (!existsSync(newName)) {
    throw new Error(`Missing built stylesheet: ${newName}`);
}

const content = `declare const css: string;\nexport default css;`;
for (const ext of ['d.css', 'css.d']) {
    writeFileSync(resolve(__dirname, `dist/style.${ext}.ts`), content, 'utf-8');
}
