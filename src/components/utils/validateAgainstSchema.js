// validate form data against its schema using the Ajv package

//
// TO DO: since AJV does not really check the nested schemas easily, we must then implement a recursion to check every object type that has subschemas
//      : for both formData and schema

import Ajv from "ajv";
import Ajv04 from "ajv-draft-04";
import deleteKeySchema from "./deleteKeySchema";

const validateAgainstSchema = (formData, schema) => {

    if (schema["$schema"] !== undefined) {
        if (schema["$schema"].includes("draft-04")) {
            console.log("draft-04 is detected")
            const ajv = new Ajv04({ schemaId: "id", allErrors: true });

            const validate = ajv.compile(schema);
            const valid = validate(formData)

            return [valid, validate];
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

            return [valid, validate];
        }
    } else if (schema["schema"] !== undefined) {
        const ajv = new Ajv({ allErrors: true });
        const validate = ajv.compile(schema);
        const valid = validate(formData)

        return [valid, validate];
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

        return [valid, validate];
    }
}

export default validateAgainstSchema;