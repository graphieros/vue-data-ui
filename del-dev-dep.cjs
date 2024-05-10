const fs = require('fs');

function removeKey(obj, key) {
    const { [key]: omit, ...rest } = obj;
    return rest;
}
fs.readFile('package.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading package.json:', err);
        return;
    }

    let packageJson = JSON.parse(data);

    const keyToRemove = "vue-data-ui";

    if (packageJson.devDependencies && packageJson.devDependencies[keyToRemove]) {
        packageJson.devDependencies = removeKey(packageJson.devDependencies, keyToRemove);

        fs.writeFile('package.json', JSON.stringify(packageJson, null, 2), 'utf8', (err) => {
            if (err) {
                console.error('Error writing to package.json:', err);
                return;
            }
            console.log('-- BUILD : Removed local vue-data-ui dev dependency before build --');
        });
    } else {
        console.log(`Key '${keyToRemove}' not found in devDependencies.`);
    }
});