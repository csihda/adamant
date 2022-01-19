const convData2DescList = (convDataProp) => {
    let someObject = {};
    convDataProp.forEach((item) => {
        const fieldId = item["fieldId"];
        const type = item["type"];

        if (type === "object") {
            someObject[fieldId] = convData2DescList(item["properties"])
        } else {
            if (item["value"] !== undefined) {
                someObject[fieldId] = { value: item["value"] }
                someObject[fieldId]["label"] = item["title"]
                someObject[fieldId]["key"] = item["fieldId"]
                someObject[fieldId]["$id"] = item["$id"]
            }
        }
    });
    return someObject;
};

export default convData2DescList;