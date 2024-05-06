const fs = require("fs");
const path = require("path");

// Get the directory path of the current module
const currentDir = path.dirname(require.main.filename);

// Resolve the paths to the types and dist directories
const typesDir = path.resolve(currentDir, "documentation");
const distDir = path.resolve(currentDir, "dist");

// Create dist directory if it doesn't exist
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Resolve the path to the dist/types directory
const distTypesDir = path.join(distDir, "documentation");

// Create dist/types directory if it doesn't exist
if (!fs.existsSync(distTypesDir)) {
  fs.mkdirSync(distTypesDir);
}

// Copy .d.ts files from types directory to dist/types directory
fs.readdirSync(typesDir).forEach((file) => {
  const srcFile = path.join(typesDir, file);
  const distFile = path.join(distTypesDir, file);

  fs.copyFileSync(srcFile, distFile);
});

console.log("Doc directory copied successfully.");
