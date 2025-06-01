// convert-json.js
const fs = require('fs');
const util = require('util');

/**
 * Converts a JSON file to a JS file that declares a const variable
 * and exports it as default, formatting as JS code.
 *
 * @example
 * // From the command line, run:
 * // $ node convert-json.cjs src/resources/worldGeo.json src/resources/worldGeo.js worldGeo
 *
 * // This will read 'src/resources/worldGeo.json', generate:
 * // const worldGeo = { ... };
 * // export default worldGeo;
 * // and write it to 'src/resources/worldGeo.js'
 *
 * @param {string} inputJSONPath
 * @param {string} outputJSPath
 * @param {string} [variableName='data']
 */
function convertJSON(inputJSONPath, outputJSPath, variableName = 'data') {
    const jsonContent = fs.readFileSync(inputJSONPath, 'utf-8');
    const parsed = JSON.parse(jsonContent);

    const jsLikeString = util.inspect(parsed, {
        depth: null,
        compact: true,
        maxArrayLength: null,
        breakLength: 1000000,
        sorted: false,
        colors: false,
        quoteStyle: 'single',
    });

    const jsContent =
        `const ${variableName} = ${jsLikeString};\n\nexport default ${variableName};\n`;

    fs.writeFileSync(outputJSPath, jsContent, 'utf-8');
}

if (require.main === module) {
    const [, , inputJSONPath, outputJSPath, variableName = 'data'] = process.argv;

    if (!inputJSONPath || !outputJSPath) {
        console.log('Usage: node convert-json.js <input.json> <output.js> [variableName]');
        process.exit(1);
    }

    convertJSON(inputJSONPath, outputJSPath, variableName);
}

module.exports = { convertJSON };
