const convData2FormData = (convDataProp) => {
    var someObject = {};
    convDataProp.forEach((item) => {
        const tempKey = item["fieldKey"];
        delete item["fieldKey"];
        const tempElements = item;
        someObject[tempKey] = tempElements;
        if (someObject[tempKey]["value"] === undefined & someObject[tempKey]["type"] !== "object") {
            delete someObject[tempKey]
        } else {
            someObject[tempKey] = tempElements;
            Object.keys(tempElements).forEach((item) => {
                if (item === "properties") {
                    // some recursion
                    someObject[tempKey] = convData2FormData(
                        someObject[tempKey]["properties"]
                    );
                }
                if (item === "value") {
                    let value = someObject[tempKey]["value"]
                    delete someObject[tempKey]
                    someObject[tempKey] = value
                }
            });
        }
    });
    return someObject;
};

export default convData2FormData;