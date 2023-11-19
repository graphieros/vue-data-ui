const fs = require("fs");
const path = require("path");

const currentDir = path.dirname(require.main.filename);

function deleteFolderRecursive(path) {
    if (fs.existsSync(path) && fs.lstatSync(path).isDirectory()) {
        fs.readdirSync(path).forEach(function (file, index) {
            let curPath = path + "/" + file;

            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });

        console.log(`Deleting directory "${path}"...`);
        fs.rmdirSync(path);
    }
}

deleteFolderRecursive(`${currentDir}\\node_modules\\vue-data-ui`);
deleteFolderRecursive(`${currentDir}\\node_modules\\.vite`);
deleteFolderRecursive('dist');