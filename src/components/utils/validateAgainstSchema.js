// validate form data against its schema using the Ajv package

//
// TO DO: since AJV does not really check the nested schemas easily, we must then implement a recursion to check every object type that has subschemas
//      : for both formData and schema

import Ajv from "ajv";
import deleteKeySchema from "./deleteKeySchema";

const validateAgainstSchema = (formData, schema) => {
    const ajv = new Ajv({ allErrors: true });

    if (schema["$schema"] !== undefined) {
        schema = deleteKeySchema(schema, "$schema")
    }
    if (schema["id"] !== undefined) {
        schema = deleteKeySchema(schema, "id")
    }

    const validate = ajv.compile(schema);
    const valid = validate(formData)

    return [valid, validate];
}

export default validateAgainstSchema;