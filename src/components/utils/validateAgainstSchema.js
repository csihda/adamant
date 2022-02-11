// validate form data against its schema using the Ajv package

//
// TO DO: since AJV does not really check the nested schemas easily, we must then implement a recursion to check every object type that has subschemas
//      : for both formData and schema

import Ajv from "ajv";
import Ajv04 from "ajv-draft-04";
import deleteKeySchema from "./deleteKeySchema";
import getValueInSchemaFullPath from "./getValueInSchemaFullPath";

const messageLookUpTable = (field_label, keyword, message) => {
    switch (keyword) {
        case 'required':
            return `'${field_label}' field must be filled (required)`
        default:
            return (`Input for '${field_label}' field ` + message)
    }
}

const createBetterValidationMessages = (validate, schema) => {
    let errors = validate.errors
    if (errors === null) {
        return []
    }
    let messages = []

    errors.forEach(error => {
        // get real path
        let path = error.schemaPath
        path = path.substring(2)
        path = path.split("/")
        path.pop()
        if (error.keyword === "required") {
            path.push("properties")
            path.push(error.params.missingProperty)
        }
        path = path.join(".")

        let field_label = getValueInSchemaFullPath(schema, path)["title"]

        let errorMessage = messageLookUpTable(field_label, error.keyword, error.message)
        messages.push(
            { "path": path, "field_label": field_label, "message": errorMessage }
        )

    })

    return messages
}

const validateAgainstSchema = (formData, schema) => {

    if (schema["$schema"] !== undefined) {
        if (schema["$schema"].includes("draft-04")) {
            console.log("draft-04 is detected")
            const ajv = new Ajv04({ schemaId: "id", allErrors: true });

            const validate = ajv.compile(schema);
            const valid = validate(formData)

            let messages = createBetterValidationMessages(validate, schema)
            return [valid, messages];
        } else {
            const ajv = new Ajv({ allErrors: true });
            /*
            if (schema["$schema"] !== undefined) {
                schema = deleteKeySchema(schema, "$schema")
            }
            if (schema["id"] !== undefined) {
                schema = deleteKeySchema(schema, "id")
            }
            */


            const validate = ajv.compile(schema);
            const valid = validate(formData)

            let messages = createBetterValidationMessages(validate, schema)
            return [valid, messages];
        }
    } else if (schema["schema"] !== undefined) {
        const ajv = new Ajv({ allErrors: true });
        const validate = ajv.compile(schema);
        const valid = validate(formData)

        let messages = createBetterValidationMessages(validate, schema)
        return [valid, messages];
    } else {
        const ajv = new Ajv({ allErrors: true });
        if (schema["$schema"] !== undefined) {
            schema = deleteKeySchema(schema, "$schema")
        }
        if (schema["id"] !== undefined) {
            schema = deleteKeySchema(schema, "id")
        }


        const validate = ajv.compile(schema);
        const valid = validate(formData)

        let messages = createBetterValidationMessages(validate, schema)
        return [valid, messages];
    }
}

export default validateAgainstSchema;