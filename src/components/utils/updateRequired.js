/*
Function to add or remove "required" flag for a specific field
*/


// get json value given path
const getValue = (json, path) => {
    let jsonData = JSON.parse(JSON.stringify(json))
    path = path.split('.')
    let tempValue = jsonData
    for (let i = 0; i < path.length; i++) {
        tempValue = tempValue[path[i]]
    }
    return tempValue
}

const updateRequired = ({ selectedType, path, requiredChecked, field_id, convertedSchema }) => {

    if (selectedType === "object") {
        requiredChecked = false
    }

    const set = require("set-value");

    let newPath = path.split('.')
    newPath.pop()
    newPath.pop()
    newPath = newPath.join('.')
    const immediateValue = getValue(convertedSchema, newPath)
    if (immediateValue !== undefined) {
        // check if there is required array
        if (immediateValue["required"] !== undefined) {
            let requiredArray = immediateValue["required"]
            if (requiredChecked) {
                requiredArray.push(field_id)
                requiredArray = [...new Set(requiredArray)]
                set(convertedSchema, newPath + ".required", requiredArray)
            } else {
                // check if the field id exists
                if (requiredArray.includes(field_id)) {
                    requiredArray = requiredArray.filter(item => item !== field_id)
                    set(convertedSchema, newPath + ".required", requiredArray)

                    if (requiredArray.length === 0) {
                        delete immediateValue["required"]
                        set(convertedSchema, newPath, immediateValue)
                    }
                }
            }
        } else {
            if (requiredChecked) {
                let requiredArray = [`${field_id}`]
                set(convertedSchema, newPath + ".required", requiredArray)
            }
        }
    } else {
        // check if there is required array
        if (convertedSchema["required"] !== undefined) {
            let requiredArray = convertedSchema["required"]
            if (requiredChecked) {
                requiredArray.push(field_id)
                requiredArray = [...new Set(requiredArray)]
                convertedSchema["required"] = requiredArray
            } else {
                // check if the field id exists
                if (requiredArray.includes(field_id)) {
                    requiredArray = requiredArray.filter(item => item !== field_id)
                    convertedSchema["required"] = requiredArray
                    if (requiredArray.length === 0) {
                        delete convertedSchema["required"]
                    }
                }
            }
        } else {
            if (requiredChecked) {
                let requiredArray = [`${field_id}`]
                convertedSchema["required"] = requiredArray
            }
        }

    }

    return convertedSchema;
}

export default updateRequired;