import React from 'react';
import StringType from "./elements/StringType";
import NumberType from "./elements/NumberType";
import ObjectType from './elements/ObjectType';
import IntegerType from './elements/IntegerType';
import BooleanType from './elements/BooleanType';
import ArrayType from './elements/ArrayType';


const ElementRenderer = ({ path, elementRequired, fieldId, fieldIndex, edit, field: { type, title, description, properties, required, enumerate, items, defaultValue, } }) => {

    switch (type) {
        case 'string':
            return (<StringType
                path={path + "." + fieldIndex}
                field_id={fieldId}
                field_index={fieldIndex}
                field_label={title}
                field_description={description}
                field_required={elementRequired}
                field_enumerate={enumerate}
                defaultValue={defaultValue}
                edit={edit}
            />)
        case 'number':
            return (<NumberType
                path={path + "." + fieldIndex}
                field_id={fieldId}
                field_index={fieldIndex}
                field_label={title}
                field_description={description}
                field_required={elementRequired}
                field_enumerate={enumerate}
                defaultValue={defaultValue}
                edit={edit}
            />)
        case 'integer':
            return (<IntegerType
                path={path + "." + fieldIndex}
                field_id={fieldId}
                field_index={fieldIndex}
                field_label={title}
                field_description={description}
                field_required={elementRequired}
                field_enumerate={enumerate}
                defaultValue={defaultValue}
                edit={edit}
            />)
        case 'boolean':
            return (<BooleanType
                path={path + "." + fieldIndex}
                field_id={fieldId}
                field_index={fieldIndex}
                field_label={title}
                field_description={description}
                field_required={elementRequired}
                defaultValue={defaultValue}
                edit={edit}
            />)
        case 'array':
            return (<ArrayType
                path={path + "." + fieldIndex}
                field_id={fieldId}
                field_label={title}
                field_description={description}
                field_required={elementRequired}
                field_items={items}
                edit={edit}
            />)
        case 'object':
            return (<ObjectType
                path={path + "." + fieldIndex}
                field_id={fieldId}
                field_label={title}
                field_description={description}
                field_required={required}
                field_properties={properties}
                edit={edit}
            />)

        default:
            return null;
    }


}

export default ElementRenderer;
