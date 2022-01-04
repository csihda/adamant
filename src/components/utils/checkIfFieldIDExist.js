import getValue from "./getValue";
const checkIfFieldIDExist = (schema, path, fieldId) => {
    let result
    if (path === undefined) {
        let value = schema["properties"]
        value.forEach(element => {
            if (element["fieldId"] === fieldId) {
                return result = true;
            }
        });
    } else {

        let value = getValue(schema, path)["properties"]

        if (value === undefined) {
            let newPath = path.split(".")
            newPath.pop()
            newPath = newPath.join(".")
            let value = getValue(schema, newPath)
            value.forEach(element => {
                if (element["fieldId"] === fieldId) {
                    return result = true;
                }
            });
        } else {
            value.forEach(element => {
                if (element["fieldId"] === fieldId) {
                    return result = true;
                }
            });
        }
    }

    if (result) {
        return true
    } else {
        return false
    }

}

export default checkIfFieldIDExist;