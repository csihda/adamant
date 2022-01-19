import React from 'react';
import ItemIntegerType from './array_items/ItemIntegerType';
import ItemNumberType from './array_items/ItemNumberType';
import ItemStringType from "./array_items/ItemStringType";
import ItemObjectType from "./array_items/ItemObjectType";


const ArrayItemRenderer = ({ value, pathSchema, pathFormData, dataInputItems, setDataInputItems, field_label, field_items, path, type, edit, fieldIndex, fieldId, enumerate, handleDeleteArrayItem, properties }) => {

    switch (type) {
        case 'string':
            return (<ItemStringType
                value={value}
                setDataInputItems={setDataInputItems}
                pathFormData={pathFormData}
                pathSchema={pathSchema + ".value"}
                dataInputItems={dataInputItems}
                path={path}
                index={fieldIndex}
                field_id={fieldId}
                handleDeleteArrayItem={handleDeleteArrayItem}
                edit={edit}
                field_type={type}
            />)
        case 'number':
            return (<ItemNumberType
                value={value}
                path={path}
                pathFormData={pathFormData}
                pathSchema={pathSchema + ".value"}
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
                value={value}
                path={path}
                pathFormData={pathFormData}
                pathSchema={pathSchema + ".value"}
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
                pathFormData={pathFormData}
                pathSchema={pathSchema + ".value"}
                path={path}
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
