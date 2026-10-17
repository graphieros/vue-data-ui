const fs = require('fs');
const path = require('path');
const {
    compactDeclaration,
} = require('./build-plugins/compactDeclarations.cjs');

function copyTypes(typesDir, distTypesDir) {
    fs.mkdirSync(distTypesDir, { recursive: true });
    fs.readdirSync(typesDir).forEach((file) => {
        const srcFile = path.join(typesDir, file);
        const distFile = path.join(distTypesDir, file);
        if (file.endsWith('.d.ts')) {
            fs.writeFileSync(
                distFile,
                compactDeclaration(fs.readFileSync(srcFile, 'utf8'), file),
            );
        } else {
            fs.copyFileSync(srcFile, distFile);
        }
    });
}

if (require.main === module) {
    copyTypes(
        path.resolve(__dirname, 'types'),
        path.resolve(__dirname, 'dist/types'),
    );
    console.log('Types copied successfully.');
}

module.exports = { copyTypes };
