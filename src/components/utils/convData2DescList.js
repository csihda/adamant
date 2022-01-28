import object2array from "./object2array";

const convData2DescList = (convDataProp) => {
    let someObject = {};
    convDataProp.forEach((item) => {
        const fieldkey = item["fieldKey"];
        const type = item["type"];

        if (type === "object") {
            someObject[fieldkey] = convData2DescList(item["properties"])
        } else {
            if (item["value"] !== undefined) {
                // for now skip value that has object type in it
                if (Array.isArray(item["value"])) {
                    if (typeof (item["value"][0]) === "object") {
                        console.log("convData2DescList is skipped for this field:", item["title"])
                    }
                } else {
                    someObject[fieldkey] = { value: item["value"] }
                    someObject[fieldkey]["label"] = item["title"]
                    someObject[fieldkey]["key"] = item["fieldKey"]
                    someObject[fieldkey]["$id"] = item["$id"]
                }
            }
        }
    });
    return someObject;
};

export default convData2DescList;