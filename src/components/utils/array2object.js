// convert iterable array to json schema properties
const array2object = (propert) => {
    var someObject = {};
    propert.forEach((item) => {
        const tempKey = item["fieldId"];
        delete item["fieldId"];
        const tempElements = item;
        someObject[tempKey] = tempElements;
        Object.keys(tempElements).forEach((item) => {
            // change "enumerate" to "enum"
            if (item === "enumerate") {
                const enumContent = JSON.parse(
                    JSON.stringify(someObject[tempKey]["enumerate"])
                );
                delete someObject[tempKey]["enumerate"];
                someObject[tempKey]["enum"] = enumContent;
            }
            if (item === "defaultValue") {
                const enumContent = JSON.parse(
                    JSON.stringify(someObject[tempKey]["defaultValue"])
                );
                delete someObject[tempKey]["defaultValue"];
                someObject[tempKey]["default"] = enumContent;
            }
            if (item === "properties") {
                // some recursion
                someObject[tempKey]["properties"] = array2object(
                    someObject[tempKey]["properties"]
                );
            }
        });
    });
    return someObject;
};

export default array2object;