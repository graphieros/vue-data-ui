const { existsSync, renameSync } = require('node:fs');
const { resolve } = require('path');

const oldName = resolve(__dirname, 'dist/vue-data-ui.css');
const newName = resolve(__dirname, 'dist/style.css');

try {
    if (existsSync(oldName)) {
        renameSync(oldName, newName);
        console.log(`Renamed '${oldName}' to '${newName}' successfully!`);
    } else if (!existsSync(newName)) {
        throw new Error(`Missing built stylesheet: ${newName}`);
    }
} catch (error) {
    console.error(`Error renaming file: ${error.message}`);
}
