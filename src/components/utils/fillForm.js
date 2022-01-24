const fillForm = (schemaProp, data) => {
    schemaProp.forEach(element => {
        if (element["type"] === "object") {
            // early exist
            if (data === undefined) {
                return
            } //
            fillForm(element["properties"], data[element["fieldKey"]])
        } else {
            // early exist
            if (data === undefined) {
                return
            } //
            if (data[element["fieldKey"]] !== undefined) {
                element["value"] = data[element["fieldKey"]]
            }
        }
    })
}

export default fillForm;