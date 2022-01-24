const convData2DescList = (convDataProp) => {
    let someObject = {};
    convDataProp.forEach((item) => {
        const fieldkey = item["fieldKey"];
        const type = item["type"];

        if (type === "object") {
            someObject[fieldkey] = convData2DescList(item["properties"])
        } else {
            if (item["value"] !== undefined) {
                someObject[fieldkey] = { value: item["value"] }
                someObject[fieldkey]["label"] = item["title"]
                someObject[fieldkey]["key"] = item["fieldKey"]
                someObject[fieldkey]["$id"] = item["$id"]
            }
        }
    });
    return someObject;
};

export default convData2DescList;