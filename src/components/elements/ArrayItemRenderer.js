import React from 'react';
import ItemIntegerType from './array_items/ItemIntegerType';
import ItemNumberType from './array_items/ItemNumberType';
import ItemStringType from "./array_items/ItemStringType";
import ItemObjectType from "./array_items/ItemObjectType";


const ArrayItemRenderer = ({ pathSchema, dataInputItems, setDataInputItems, field_label, field_items, path, type, edit, fieldIndex, fieldId, enumerate, handleDeleteArrayItem, properties }) => {

    switch (type) {
        case 'string':
            return (<ItemStringType
                setDataInputItems={setDataInputItems}
                pathSchema={pathSchema}
                dataInputItems={dataInputItems}
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
                pathSchema={pathSchema}
                setDataInputItems={setDataInputItems}
                dataInputItems={dataInputItems}
                index={fieldIndex}
                field_id={fieldId}
                handleDeleteArrayItem={handleDeleteArrayItem}
                edit={edit}
                field_type={type}
            />)
        case 'integer':
            return (<ItemIntegerType
                path={path + "." + fieldIndex}
                pathSchema={pathSchema}
                setDataInputItems={setDataInputItems}
                dataInputItems={dataInputItems}
                index={fieldIndex}
                field_id={fieldId}
                handleDeleteArrayItem={handleDeleteArrayItem}
                edit={edit}
                field_type={type}
            />)
        case 'object':
            return (<ItemObjectType
                setDataInputItems={setDataInputItems}
                dataInputItems={dataInputItems}
                field_label={field_label}
                pathSchema={pathSchema}
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

export default ArrayItemRenderer;
