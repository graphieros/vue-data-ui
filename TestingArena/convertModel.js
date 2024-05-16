export default function convertArrayToObject(configArray) {
    const resultObject = {};

    configArray.forEach(({ key, def }) => {
        const keys = key.split('.');
        let currentObject = resultObject;

        keys.forEach((nestedKey, index) => {
            if (!currentObject.hasOwnProperty(nestedKey)) {
                if (index === keys.length - 1) {
                    currentObject[nestedKey] = def;
                } else {
                    currentObject[nestedKey] = {};
                }
            }
            currentObject = currentObject[nestedKey];
        });
    });

    return resultObject;
}