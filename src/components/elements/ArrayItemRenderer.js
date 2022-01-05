import React from 'react';
import ItemIntegerType from './array_items/ItemIntegerType';
import ItemNumberType from './array_items/ItemNumberType';
import ItemStringType from "./array_items/ItemStringType";
import ItemObjectType from "./array_items/ItemObjectType";


const ElementRenderer = ({ field_label, field_items, path, type, edit, fieldIndex, fieldId, enumerate, handleDeleteArrayItem, properties }) => {

    switch (type) {
        case 'string':
            return (<ItemStringType
                path={path + "." + fieldIndex}
                index={fieldIndex}
                field_id={fieldId}
                handleDeleteArrayItem={handleDeleteArrayItem}
                edit={edit}
                field_type={type}
            />)
        case 'number':
            return (<ItemNumberType
                path={path + "." + fieldIndex}
                index={fieldIndex}
                field_id={fieldId}
                handleDeleteArrayItem={handleDeleteArrayItem}
                edit={edit}
                field_type={type}
            />)
        case 'integer':
            return (<ItemIntegerType
                path={path + "." + fieldIndex}
                index={fieldIndex}
                field_id={fieldId}
                handleDeleteArrayItem={handleDeleteArrayItem}
                edit={edit}
                field_type={type}
            />)
        case 'object':
            return (<ItemObjectType
                field_label={field_label}
                path={path + "." + fieldIndex}
                index={fieldIndex}
                field_id={fieldId}
                handleDeleteArrayItem={handleDeleteArrayItem}
                edit={edit}
                field_type={type}
                field_items={field_items}
            />)

        default:
            return null;
    }


}

export default ElementRenderer;
