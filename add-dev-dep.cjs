const fs = require('fs');

fs.readFile('package.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading package.json:', err);
        return;
    }
    let packageJson = JSON.parse(data);

    packageJson.devDependencies = {
        ...packageJson.devDependencies,
        "vue-data-ui": "file:../vue-data-ui"
    };

    fs.writeFile('package.json', JSON.stringify(packageJson, null, 2), 'utf8', (err) => {
        if (err) {
            console.error('Error writing to package.json:', err);
            return;
        }
        console.log('-- DEV MODE : Local vue-data-ui package added successfully --');
    });
});