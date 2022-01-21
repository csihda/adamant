const fillForm = (schemaProp, data) => {
    schemaProp.forEach(element => {
        if (element["type"] === "object") {
            fillForm(element["properties"], data[element["fieldId"]])
        } else {
            if (data[element["fieldId"]] !== undefined) {
                element["value"] = data[element["fieldId"]]
            }
        }
    })
}

export default fillForm;