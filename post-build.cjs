const { renameSync } = require("node:fs");
const { resolve } = require("path");

const oldName = resolve(__dirname, "dist/vue-data-ui.css");
const newName = resolve(__dirname, "dist/style.css");

try {
  renameSync(oldName, newName);
  console.log(`Renamed '${oldName}' to '${newName}' successfully!`);
} catch (error) {
  console.error(`Error renaming file: ${error.message}`);
}