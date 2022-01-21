const fillForm = (schemaProp, data) => {
    schemaProp.forEach(element => {
        if (element["type"] === "object") {
            // early exist
            if (data === undefined) {
                return
            } //
            fillForm(element["properties"], data[element["fieldId"]])
        } else {
            // early exist
            if (data === undefined) {
                return
            } //
            if (data[element["fieldId"]] !== undefined) {
                element["value"] = data[element["fieldId"]]
            }
        }
    })
}

export default fillForm;