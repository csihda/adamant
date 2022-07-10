import React, { useContext, useEffect, useState, useCallback } from 'react'
import TextField from "@material-ui/core/TextField"
//import { makeStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import Divider from '@material-ui/core/Divider';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import checkIfFieldIDExist from './utils/checkIfFieldIDExist';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import { FormContext } from '../FormContext';
import { Checkbox } from '@material-ui/core';
import { FormGroup } from '@material-ui/core';
import updateRequired from './utils/updateRequired';
import { IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import AddIcon from "@material-ui/icons/AddBox";
import getValue from './utils/getValue';
import { useDropzone } from "react-dropzone";
import object2array from './utils/object2array';

/*const useStyles = makeStyles((theme) => ({
    root: {
        width: 'auto',
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular,
    },
})); */


const EditElement = ({ editOrAdd, field_uri, enumerated, field_enumerate, field_required, field_key, UISchema, path, pathFormData, openDialog, setOpenDialog, defaultValue, field_label }) => {

    const [selectedType, setSelectedType] = useState(UISchema !== undefined ? UISchema["type"] : "string")
    const [title, setTitle] = useState(UISchema !== undefined ? UISchema["title"] : "")
    const [fieldkey, setFieldKey] = useState(UISchema !== undefined ? UISchema["fieldKey"] : "")
    const [fieldUri, setFieldUri] = useState(UISchema !== undefined ? UISchema["$id"] : "")
    const [description, setDescription] = useState(UISchema !== undefined ? UISchema["description"] : "")
    const [defValue, setDefValue] = useState(defaultValue !== undefined ? defaultValue : "")
    const { updateParent, convertedSchema, updateFormDataId, schemaSpecification } = useContext(FormContext);
    const [requiredChecked, setRequiredChecked] = useState(field_required === undefined ? false : field_required)
    const [enumChecked, setEnumChecked] = useState(enumerated === undefined ? false : enumerated)
    const [enumList, setEnumList] = useState(field_enumerate === undefined ? [] : field_enumerate);
    const [arrayItemType, setArrayItemType] = useState("string")
    const [arrayMinMaxItem, setArrayMinMaxItem] = useState(["None", "None"])
    const [numberMinMaxValue, setNumberMinMaxValue] = useState(["None", "None"])
    const [charMinMaxLengthValue, setCharMinMaxLengthValue] = useState(["None", "None"])
    const [charMinMaxHelperText, setCharMinMaxHelperText] = useState("Set the minimum and maximum length allowed for this string input.")
    const [arrayMinMaxHelperText, setArrayMinMaxHelperText] = useState("Set the minimum and maximum values of the items allowed for this array field.")
    const [numberMinMaxValueHelperText, setNumberMinMaxValueHelpertext] = useState("Set the minimum and maximum values of this field.")
    const [arrayUniqueItems, setArrayUniqueItems] = useState(UISchema !== undefined ? (UISchema["uniqueItems"] !== undefined ? UISchema["uniqueItems"] : false) : false)
    const [subSchemaValidity, setSubSchemaValidity] = useState(false);
    const [convertedSubSchema, setConvertedSubSchema] = useState({})
    const [subSchemaFilename, setSubSchemaFilename] = useState("")
    const [activeSubSchemaButton, setActiveSubSchemaButton] = useState("") 

    let arrayItemTypeList = ["string", "number", "integer"]
    if (UISchema !== undefined) {
        if (UISchema["items"] !== undefined) {
            if (UISchema["items"]["type"] === "object") {
                arrayItemTypeList = ["string", "number", "integer", "object"]
            }
        }
    }


    useEffect(() => {
        if (field_uri !== undefined){
            setFieldUri(field_uri)
        }
        else if (UISchema["$id"] !== undefined) {
            setFieldUri(UISchema["$id"])
        }
        else {
            setFieldUri("")
        }
        // for array
        if (UISchema !== undefined) {
            if (UISchema["type"] === "array") {
                let value = [...arrayMinMaxItem]
                if (UISchema["minItems"] !== undefined) {
                    value[0] = UISchema["minItems"]
                }
                if (UISchema["maxItems"] !== undefined) {
                    value[1] = UISchema["maxItems"]
                }
                if (UISchema["items"] === undefined) {
                    UISchema["items"] = { "type": "string" }
                }
                if (arrayUniqueItems) {
                    UISchema["uniqueItems"] = arrayUniqueItems
                }
                else {
                    delete UISchema["uniqueItems"]
                }
                setArrayMinMaxItem(value)
            }
        }

        // for numeric types
        if (UISchema !== undefined) {
            if (["number", "integer"].includes(UISchema["type"])) {
                let value = [...numberMinMaxValue]
                if (UISchema["minimum"] !== undefined) {
                    value[0] = UISchema["minimum"]
                }
                if (UISchema["maximum"] !== undefined) {
                    value[1] = UISchema["maximum"]
                }
                setNumberMinMaxValue(value)
            }
        }

        // for string type
        if (UISchema !== undefined) {
            if (UISchema["type"] === "string") {
                let value = [...charMinMaxLengthValue]
                if (UISchema["minLength"] !== undefined) {
                    value[0] = UISchema["minLength"]
                }
                if (UISchema["maxLength"] !== undefined) {
                    value[1] = UISchema["maxLength"]
                }
                setCharMinMaxLengthValue(value)
            }
        }
    }, [])


    let tempUISchema
    if (editOrAdd !== undefined && editOrAdd === "add") {
        UISchema = {
            "type": "string",
            "fieldKey": "",
            "title": "",
            "description": ""
        }
        tempUISchema = {
            "type": "string",
            "fieldKey": "",
            "title": "",
            "description": ""
        }
    } else {
        tempUISchema = JSON.parse(JSON.stringify(UISchema))
    }

    let notImplemented = false;
    if (UISchema !== undefined) {
        if (!["string", "number", "integer", "object", "array", "boolean", "fileupload (string)"].includes(UISchema["type"])) {
            notImplemented = true;
        }
    }


    let datatypes = ["string", "number", "integer", "object", "array", "boolean", "fileupload (string)"]



    const handleOnChangeListField = (event) => {
        setEnumList(event.target.value);
    }

    // save the change and update the UI
    const handleUpdateSchemaOnClick = () => {
        // do this if add
        if (editOrAdd === "add") {
            // update default value
            if (defValue === undefined & defaultValue === undefined) {
                // do nothing
            } else if (defValue.toString().replace(/\s+/g, '') === "" & defaultValue === undefined) {
                // do nothing
            } else if (selectedType === "boolean" & defValue.toString().replace(/\s+/g, '') === "" & defaultValue === undefined) {
                // do nothing
            } else if (selectedType === "boolean" & defValue.toString().replace(/\s+/g, '') !== "" & defaultValue !== undefined) {
                tempUISchema["defaultValue"] = (defValue === "true")
            } else if (defValue.toString().replace(/\s+/g, '') === "") {
                delete tempUISchema["defaultValue"]
            }
            else {
                tempUISchema["defaultValue"] = defValue
            };

            // check if fieldkey already exist
            if (checkIfFieldIDExist(convertedSchema, path, fieldkey)) {
                alert("Field Keyword already exists!")
                return
            }

            tempUISchema["fieldKey"] = fieldkey;
            if (fieldUri !== undefined) {
                if (fieldUri.toString().replace(/\s+/g, '') !== "") {
                    tempUISchema["$id"] = fieldUri
                }
            }
            tempUISchema["type"] = selectedType;
            if (title !== undefined) { tempUISchema["title"] = title }
            if (description !== undefined) { tempUISchema["description"] = description }

            if (fieldkey === undefined) {
                alert("Field Keyword must be defined!")
                return
            }

            if (typeof (fieldkey) === "string" & fieldkey.replace(/\s+/g, '') === "") {
                alert("Field Keyword must be defined!")
                return
            }
            
            if (tempUISchema["type"] === "object") {
                if (subSchemaValidity) {
                    tempUISchema["properties"] = convertedSubSchema["properties"]
                } else {
                    tempUISchema["properties"] = []
                }

                // check required
                try {
                    tempUISchema["required"] = convertedSubSchema["required"]
                } catch (error) {
                    console.log(error)
                }
            }
            // more validation keywords for array
            if (tempUISchema["type"] === "array") {
                if (arrayItemType === "string") {
                    tempUISchema["items"] = { "type": "string" }
                }
                if (arrayItemType === "integer") {
                    tempUISchema["items"] = { "type": "integer" }
                }
                if (arrayItemType === "number") {
                    tempUISchema["items"] = { "type": "number" }
                }
                if (arrayMinMaxItem[0] !== "None") {
                    tempUISchema["minItems"] = arrayMinMaxItem[0]
                } else {
                    delete tempUISchema["minItems"]
                }
                if (arrayMinMaxItem[1] !== "None") {
                    tempUISchema["maxItems"] = arrayMinMaxItem[1]
                } else {
                    delete delete tempUISchema["maxItems"]
                }

                if (arrayUniqueItems) {
                    tempUISchema["uniqueItems"] = arrayUniqueItems
                }
                else {
                    delete tempUISchema["uniqueItems"]
                }
            }
            // more validation keywords for numeric types
            if (["number", "integer"].includes(tempUISchema["type"])) {
                // delete all unrelated keywords
                delete tempUISchema["items"]
                delete tempUISchema["minItems"]
                delete tempUISchema["maxItems"]
                delete tempUISchema["uniqueItems"]
                delete tempUISchema["properties"]
                delete tempUISchema["maximum"]
                delete tempUISchema["minimum"]
                if (numberMinMaxValue[0] !== "None") {
                    tempUISchema["minimum"] = numberMinMaxValue[0]
                } else {
                    delete tempUISchema["minimum"]
                }
                if (numberMinMaxValue[1] !== "None") {
                    tempUISchema["maximum"] = numberMinMaxValue[1]
                } else {
                    delete tempUISchema["maximum"]
                }
            }
            // more validation keywords for string
            if (tempUISchema["type"] === "string") {
                // delete all unrelated keywords
                delete tempUISchema["items"]
                delete tempUISchema["minItems"]
                delete tempUISchema["maxItems"]
                delete tempUISchema["uniqueItems"]
                delete tempUISchema["properties"]
                delete tempUISchema["maximum"]
                delete tempUISchema["minimum"]
                if (charMinMaxLengthValue[0] !== "None") {
                    tempUISchema["minLength"] = charMinMaxLengthValue[0]
                } else {
                    delete tempUISchema["minLength"]
                }
                if (charMinMaxLengthValue[1] !== "None") {
                    tempUISchema["maxLength"] = charMinMaxLengthValue[1]
                } else {
                    delete tempUISchema["maxLength"]
                }
            }

            if (tempUISchema["type"] !== "string") {
                setEnumChecked(false);
            }

            if (selectedType === "fileupload (string)" && schemaSpecification === "http://json-schema.org/draft-04/schema#") {
                delete tempUISchema["contentEncoding"]
            }

            // for fileupload
            if (selectedType === "fileupload (string)") {
                // set type to string
                tempUISchema["type"] = "string"
                // set the encoding type
                tempUISchema["contentEncoding"] = "base64"
                // delete all unrelated keywords
                delete tempUISchema["items"]
                delete tempUISchema["minItems"]
                delete tempUISchema["maxItems"]
                delete tempUISchema["uniqueItems"]
                delete tempUISchema["maxLength"]
                delete tempUISchema["minLength"]
                delete tempUISchema["enumerate"]
                delete tempUISchema["enum"]
                delete tempUISchema["properties"]
                delete tempUISchema["maximum"]
                delete tempUISchema["minimum"]
            }

            if (path !== undefined) {
                const set = require("set-value");

                let properties = getValue(convertedSchema, path)["properties"]
                properties.push(tempUISchema)
                set(convertedSchema, path + ".properties", properties)

                // create a new path to the new element
                path = path + ".properties." + (properties.length - 1).toString()
                let field_key = fieldkey
                // update the required value
                const newConvertedSchema = updateRequired({ selectedType, path, requiredChecked, field_key, convertedSchema })
                // update enum
                if (tempUISchema["type"] === "string" & enumChecked) {
                    let newList = enumList
                    if (Array.isArray(newList)) {
                        set(newConvertedSchema, path + ".enumerate", newList)
                    } else {
                        newList = newList.replace(/\s*,\s*/g, ",")
                        set(newConvertedSchema, path + ".enumerate", newList.split(","))
                    }

                }

                updateParent(newConvertedSchema)
                setOpenDialog(false)
            } else {
                const set = require("set-value");
                let properties = convertedSchema["properties"]
                properties.push(tempUISchema)
                convertedSchema["properties"] = properties

                // create a new path to the new element
                path = "properties." + (properties.length - 1).toString()
                let field_key = fieldkey
                // update the required value
                let newConvertedSchema = updateRequired({ selectedType, path, requiredChecked, field_key, convertedSchema })
                // update enum
                if (tempUISchema["type"] === "string" & enumChecked) {
                    let newList = enumList
                    if (Array.isArray(newList)) {
                        set(newConvertedSchema, path + ".enumerate", newList)
                    } else {
                        newList = newList.replace(/\s*,\s*/g, ",")
                        set(newConvertedSchema, path + ".enumerate", newList.split(","))
                    }

                }

                updateParent(newConvertedSchema)
                setOpenDialog(false)
            }
        }
        else {
            // and do this if edit

            // update default value
            if (defValue === undefined & defaultValue === undefined) {
                // do nothing
            } else if (defValue.toString().replace(/\s+/g, '') === "" & defaultValue === undefined) {
                // do nothing
            } else if (selectedType === "boolean" & defValue.toString().replace(/\s+/g, '') === "" & defaultValue === undefined) {
                // do nothing
            } else if (selectedType === "boolean" & defValue.toString().replace(/\s+/g, '') !== "" & defaultValue !== undefined) {
                tempUISchema["defaultValue"] = (defValue === "true")
            } else if (defValue.toString().replace(/\s+/g, '') === "") {
                delete tempUISchema["defaultValue"]
            }
            else {
                tempUISchema["defaultValue"] = defValue
            };

            // check if fieldkey already exist
            let existed = checkIfFieldIDExist(convertedSchema, path, fieldkey)
            if (UISchema["fieldKey"] !== fieldkey) {
                if (existed) {
                    alert("Field Keyword already exists!")
                    return
                }
            }

            if (fieldkey === undefined | fieldkey.replace(/\s+/g, '') === "") {
                alert("Field Keyword must be defined!")
                return
            }

            tempUISchema["fieldKey"] = fieldkey;
            if (fieldUri !== undefined) {
                if (fieldUri.toString().replace(/\s+/g, '') !== "") {
                    tempUISchema["$id"] = fieldUri
                }
            }
            tempUISchema["type"] = selectedType;
            if (title !== undefined) { tempUISchema["title"] = title }
            if (description !== undefined) { tempUISchema["description"] = description }

            if (tempUISchema["type"] === "object" & tempUISchema["properties"] === undefined) {
                tempUISchema["properties"] = []
            }
            if (tempUISchema["type"] === "object" & subSchemaValidity) {
                tempUISchema["properties"] = convertedSubSchema["properties"]
                // check required
                try {
                    console.log(convertedSchema["required"])
                    tempUISchema["required"] = convertedSubSchema["required"]
                } catch (error) {
                    console.log(error)
                }
            }

            // more validation keywords for array
            if (tempUISchema["type"] === "array") {
                if (arrayItemType === "string") {
                    tempUISchema["items"] = { "type": "string" }
                }
                if (arrayItemType === "integer") {
                    tempUISchema["items"] = { "type": "integer" }
                }
                if (arrayItemType === "number") {
                    tempUISchema["items"] = { "type": "number" }
                }
                if (arrayMinMaxItem[0] !== "None") {
                    tempUISchema["minItems"] = arrayMinMaxItem[0]
                } else {
                    delete tempUISchema["minItems"]
                }
                if (arrayMinMaxItem[1] !== "None") {
                    tempUISchema["maxItems"] = arrayMinMaxItem[1]
                } else {
                    delete delete tempUISchema["maxItems"]
                }

                if (arrayUniqueItems) {
                    tempUISchema["uniqueItems"] = arrayUniqueItems
                }
                else {
                    delete tempUISchema["uniqueItems"]
                }
            }
            // more validation keywords for numeric types
            if (["number", "integer"].includes(tempUISchema["type"])) {
                // delete all unrelated keywords
                delete tempUISchema["items"]
                delete tempUISchema["minItems"]
                delete tempUISchema["maxItems"]
                delete tempUISchema["uniqueItems"]
                delete tempUISchema["properties"]
                delete tempUISchema["maximum"]
                delete tempUISchema["minimum"]
                if (numberMinMaxValue[0] !== "None") {
                    tempUISchema["minimum"] = numberMinMaxValue[0]
                } else {
                    delete tempUISchema["minimum"]
                }
                if (numberMinMaxValue[1] !== "None") {
                    tempUISchema["maximum"] = numberMinMaxValue[1]
                } else {
                    delete delete tempUISchema["maximum"]
                }
            }
            // more validation keywords for string
            if (tempUISchema["type"] === "string") {
                // delete all unrelated keywords
                delete tempUISchema["items"]
                delete tempUISchema["minItems"]
                delete tempUISchema["maxItems"]
                delete tempUISchema["uniqueItems"]
                delete tempUISchema["properties"]
                delete tempUISchema["maximum"]
                delete tempUISchema["minimum"]
                if (charMinMaxLengthValue[0] !== "None") {
                    tempUISchema["minLength"] = charMinMaxLengthValue[0]
                } else {
                    delete tempUISchema["minLength"]
                }
                if (charMinMaxLengthValue[1] !== "None") {
                    tempUISchema["maxLength"] = charMinMaxLengthValue[1]
                } else {
                    delete tempUISchema["maxLength"]
                }
            }


            if (!["string", "integer", "number"].includes(tempUISchema["type"])) {
                setEnumChecked(false);
            }

            // get rid of array-specific keywords if selectedType is not array
            if (selectedType !== "array" & tempUISchema["items"] !== undefined) {
                delete tempUISchema["items"]
                delete tempUISchema["minItems"]
                delete tempUISchema["maxItems"]
                delete tempUISchema["uniqueItems"]
            }

            // for fileupload
            if (selectedType === "fileupload (string)") {
                // set type to string
                tempUISchema["type"] = "string"
                // set the encoding type
                tempUISchema["contentEncoding"] = "base64"
                // delete all unrelated keywords
                delete tempUISchema["items"]
                delete tempUISchema["minItems"]
                delete tempUISchema["maxItems"]
                delete tempUISchema["uniqueItems"]
                delete tempUISchema["maxLength"]
                delete tempUISchema["minLength"]
                delete tempUISchema["enumerate"]
                delete tempUISchema["enum"]
                delete tempUISchema["properties"]
                delete tempUISchema["maximum"]
                delete tempUISchema["minimum"]
            }

            const set = require("set-value");
            set(convertedSchema, path, tempUISchema)
            // update the required value
            let newConvertedSchema = updateRequired({ selectedType, path, requiredChecked, field_key, convertedSchema })
            //console.log("stuff:", newConvertedSchema)
            // update enum
            if (["string", "integer", "number"].includes(tempUISchema["type"]) & enumChecked) {
                let newList = enumList

                // use if else statements instead of switch case statements for this case
                if (tempUISchema["type"] === "string") {
                    if (Array.isArray(newList)) {
                        set(newConvertedSchema, path + ".enumerate", newList)
                    } else {
                        newList = newList.replace(/\s*,\s*/g, ",")
                        let parsed = newList.split(",").map(function (item) {
                            return item.toString();
                        })
                        set(newConvertedSchema, path + ".enumerate", parsed.filter(x => x.toString() !== "NaN"))
                        //console.log("stuff:", newConvertedSchema)
                    }
                } else if (tempUISchema["type"] === "number") {
                    if (Array.isArray(newList)) {
                        let parsed = newList.map(function (item) {
                            return parseFloat(item, 10);
                        })
                        set(newConvertedSchema, path + ".enumerate", parsed.filter(x => x.toString() !== "NaN"))
                    } else {
                        newList = newList.replace(/\s*,\s*/g, ",")
                        let parsed = newList.split(",").map(function (item) {
                            return parseFloat(item, 10);
                        })
                        set(newConvertedSchema, path + ".enumerate", parsed.filter(x => x.toString() !== "NaN"))
                    }
                } else if (tempUISchema["type"] === "integer") {
                    if (Array.isArray(newList)) {
                        let parsed = newList.map(function (item) {
                            return parseInt(item, 10);
                        })
                        set(newConvertedSchema, path + ".enumerate", parsed.filter(x => x.toString() !== "NaN"))
                    } else {
                        newList = newList.replace(/\s*,\s*/g, ",")
                        let parsed = newList.split(",").map(function (item) {
                            return parseInt(item, 10);
                        })
                        set(newConvertedSchema, path + ".enumerate", parsed.filter(x => x.toString() !== "NaN"))
                    }
                }
            }
            // update main component
            updateParent(newConvertedSchema)
            setOpenDialog(false)

            //* update form data if fieldkey change
            // update pathFormData with new fieldkey
            updateFormDataId(field_key, fieldkey, pathFormData, defaultValue)
        }
    }

    // change descriptor value
    const handleChangeUISchema = (event, keyword) => {
        switch (keyword) {
            case 'type':
                return setSelectedType(event.target.value)
            case 'title':
                return setTitle(event.target.value)
            case 'description':
                return setDescription(event.target.value)
            case 'fieldKey':
                return setFieldKey(event.target.value.replace(/ /g, "_"))
            case 'defaultValue':
                return setDefValue(event.target.value)
            case '$id':
                return setFieldUri(event.target.value)
            case 'id':
                return setFieldUri(event.target.value)
            case 'itemType':
                return setArrayItemType(event.target.value)
            default:
                return null;
        }
    }


    // handleChange MinMax array item
    const handleMinMaxArrayItem = (event, field) => {
        let value = [...arrayMinMaxItem]
        switch (field) {
            case 'max':
                value[1] = (Number.isNaN(parseInt(event.target.value.replace("None", ""))) ? "None" : parseInt(event.target.value.replace("None", "")))
                value[1] = (value[1] === 0 ? "None" : value[1])
                //console.log(value)
                return setArrayMinMaxItem(value);
            case 'min':
                value[0] = (Number.isNaN(parseInt(event.target.value.replace("None", ""))) ? "None" : parseInt(event.target.value.replace("None", "")))
                return setArrayMinMaxItem(value);
            default:
                return null;
        }
    }

    const handleMinMaxArrayItemOnBlur = (event, keyword) => {
        let value = [...arrayMinMaxItem]

        // early exit
        if (value[0] === "None" && value[1] === "None") {
            console.log("Doing nothing because the inputs have not changed.")
            return
        }
        switch (keyword) {
            case 'min':
                if (value[0] >= value[1]) {
                    console.log("min value cannot be greater than max value")
                    setArrayMinMaxHelperText(<div style={{ color: "#f44336" }}>minItems value cannot be greater or equal than maxItems value. minItems value was changed to 'None'.</div>)
                    value[0] = "None"
                    return setArrayMinMaxItem(value);
                } else {
                    setArrayMinMaxHelperText("Set the minimum and maximum values of the items allowed for this array field.")
                    return setArrayMinMaxItem(value);
                }
            case 'max':
                if (value[0] >= value[1]) {
                    console.log("min value cannot be greater than max value")
                    setArrayMinMaxHelperText(<div style={{ color: "#f44336" }}>minItems value cannot be greater or equal than maxItems value. maxItems value was changed to 'None'.</div>)
                    value[1] = "None"
                    return setArrayMinMaxItem(value);
                } else {
                    setArrayMinMaxHelperText("Set the minimum and maximum values of the items allowed for this array field.")
                    return setArrayMinMaxItem(value);
                }
            default:
                return null;
        }
    }

    // handleChange MinMax array item
    const handleMinMaxValue = (event, minMax) => {
        let value = [...numberMinMaxValue]
        switch (minMax) {
            case 'max-integer':
                if (event.target.value.replace("None", "") === "-") {
                    console.log(event.target.value)
                    value[1] = event.target.value.replace("None", "")
                    return setNumberMinMaxValue(value)
                } else {
                    value[1] = (Number.isNaN(parseInt(event.target.value.replace("None", ""))) ? "None" : parseInt(event.target.value.replace("None", "")))
                    return setNumberMinMaxValue(value);
                }
            case 'min-integer':
                if (event.target.value.replace("None", "") === "-") {
                    console.log(event.target.value)
                    value[0] = event.target.value.replace("None", "")
                    return setNumberMinMaxValue(value)
                } else {
                    value[0] = (Number.isNaN(parseInt(event.target.value.replace("None", ""))) ? "None" : parseInt(event.target.value.replace("None", "")))
                    return setNumberMinMaxValue(value);
                }
            // for now number is the same as integer
            case 'max-number':
                if (event.target.value.replace("None", "") === "-") {
                    console.log(event.target.value)
                    value[1] = event.target.value.replace("None", "")
                    return setNumberMinMaxValue(value)
                } else {
                    value[1] = (Number.isNaN(parseInt(event.target.value.replace("None", ""))) ? "None" : parseInt(event.target.value.replace("None", "")))
                    return setNumberMinMaxValue(value);
                }
            case 'min-number':
                if (event.target.value.replace("None", "") === "-") {
                    console.log(event.target.value)
                    value[0] = event.target.value.replace("None", "")
                    return setNumberMinMaxValue(value)
                } else {
                    value[0] = (Number.isNaN(parseInt(event.target.value.replace("None", ""))) ? "None" : parseInt(event.target.value.replace("None", "")))
                    return setNumberMinMaxValue(value);
                }
            default:
                return null;
        }
    }

    const handleMinMaxValueOnBlur = (event, minMax) => {
        let value = [...numberMinMaxValue]

        // early exit
        if (value[0] === "None" && value[1] === "None") {
            console.log("Doing nothing because the inputs have not changed.")
            return
        }

        switch (minMax) {
            case 'min-integer':
                if (value[0] >= value[1]) {
                    console.log("min value cannot be greater than max value")
                    setNumberMinMaxValueHelpertext(<div style={{ color: "#f44336" }}>Min. value cannot be greater or equal than max. value. Min. value was changed to 'None'.</div>)
                    value[0] = "None"
                    return setNumberMinMaxValue(value);
                } else {
                    setNumberMinMaxValueHelpertext("Set the minimum and maximum values of this field.")
                    return setNumberMinMaxValue(value);
                }
            case 'min-number':
                if (value[0] >= value[1]) {
                    console.log("min value cannot be greater than max value")
                    setNumberMinMaxValueHelpertext(<div style={{ color: "#f44336" }}>Min. value cannot be greater or equal than max. value. Min. value was changed to 'None'.</div>)
                    value[0] = "None"
                    return setNumberMinMaxValue(value);
                } else if (value.includes("None")) {
                    return setNumberMinMaxValueHelpertext("Set the minimum and maximum values of this field.")
                }
                else {
                    setNumberMinMaxValueHelpertext("Set the minimum and maximum values of this field.")
                    return setNumberMinMaxValue(value);
                }
            case 'max-integer':
                if (value[0] >= value[1]) {
                    console.log("min value cannot be greater than max value")
                    setNumberMinMaxValueHelpertext(<div style={{ color: "#f44336" }}>Min. value cannot be greater or equal than max. value.  Max. value was changed to 'None'.</div>)
                    value[1] = "None"
                    return setNumberMinMaxValue(value);
                } else {
                    setNumberMinMaxValueHelpertext("Set the minimum and maximum values of this field.")
                    return setNumberMinMaxValue(value);
                }
            case 'max-number':
                if (value[0] >= value[1]) {
                    console.log("min value cannot be greater than max value")
                    setNumberMinMaxValueHelpertext(<div style={{ color: "#f44336" }}>Min. value cannot be greater or equal than max. value. Max. value was changed to 'None'.</div>)
                    value[1] = "None"
                    return setNumberMinMaxValue(value);
                } else if (value.includes("None")) {
                    return setNumberMinMaxValueHelpertext("Set the minimum and maximum values of this field.")
                }
                else {
                    setNumberMinMaxValueHelpertext("Set the minimum and maximum values of this field.")
                    return setNumberMinMaxValue(value);
                }
            default:
                return null;
        }
    }

    // handleChange MinMax length for string
    const handleMinMaxCharLength = (event, field) => {
        let value = [...charMinMaxLengthValue]
        switch (field) {
            case 'maxLength':
                value[1] = (Number.isNaN(parseInt(event.target.value.replace("None", ""))) ? "None" : parseInt(event.target.value.replace("None", "")))
                value[1] = (value[1] === 0 ? "None" : value[1])
                //console.log(value)
                return setCharMinMaxLengthValue(value);
            case 'minLength':
                value[0] = (Number.isNaN(parseInt(event.target.value.replace("None", ""))) ? "None" : parseInt(event.target.value.replace("None", "")))
                return setCharMinMaxLengthValue(value);
            default:
                return null;
        }
    }
    const handleMinMaxCharLengthOnBlur = (event, keyword) => {
        let value = [...charMinMaxLengthValue]

        // early exit
        if (value[0] === "None" && value[1] === "None") {
            console.log("Doing nothing because the inputs have not changed.")
            return
        }

        switch (keyword) {
            case 'minLength':
                if (value[0] >= value[1]) {
                    console.log("min value cannot be greater than max value")
                    setCharMinMaxHelperText(<div style={{ color: "#f44336" }}>minLength value cannot be greater or equal than maxLength value.</div>)
                    value[0] = "None"
                    return setCharMinMaxLengthValue(value);
                } else {
                    setCharMinMaxHelperText("Set the minimum and maximum length allowed for this string input.")
                    return setCharMinMaxLengthValue(value);
                }
            case 'maxLength':
                if (value[0] >= value[1]) {
                    console.log("min value cannot be greater than max value")
                    setCharMinMaxHelperText(<div style={{ color: "#f44336" }}>minLength value cannot be greater or equal than maxLength value.</div>)
                    value[1] = "None"
                    return setCharMinMaxLengthValue(value);
                } else {
                    setCharMinMaxHelperText("Set the minimum and maximum length allowed for this string input.")
                    return setCharMinMaxLengthValue(value);
                }
            default:
                return null;
        }
    }

    // cancel editing
    const handleCancelEdit = () => {
        if (editOrAdd !== undefined && editOrAdd === "add") {
            setOpenDialog(false)
        }
        else {
            tempUISchema = JSON.parse(JSON.stringify(UISchema))
            setOpenDialog(false)
            setEnumList(field_enumerate)
            setDefValue(defaultValue)
            setSelectedType(UISchema["type"])
        }
    }

    // handle change required check box
    const handleCheckBoxOnChange = () => {
        setRequiredChecked(prev => !prev)
    }

    // handle change required check box
    const handleEnumBoxOnChange = () => {
        setEnumChecked(prev => !prev)
    }

    // handle change uniqueItems check box
    const handleUniqueItemsCheckBoxOnChange = () => {
        setArrayUniqueItems(prev => !prev)
    }

    // function to check if the file accepted is of json format and json schema valid
    const checkSubSchemaValidity = (schemaFile) => {
        // place holder
        if (schemaFile[0]["type"] === "application/json") {
            // read the file with FileReadr API
            const reader = new FileReader();
            reader.onabort = () => console.log("file reading was aborted");
            reader.onerror = () => console.log("file reading has failed");
            reader.onload = () => {
            const binaryStr = reader.result;
            const obj = JSON.parse(binaryStr);

            // convert obj schema to iterable array properties
            let convertedSchema = JSON.parse(JSON.stringify(obj));
            try {
                convertedSchema["properties"] = object2array(obj["properties"]);
                console.log("Converted Schema:", convertedSchema)
                setConvertedSubSchema(convertedSchema)
                // update states
                setSubSchemaValidity(true);
                setSubSchemaFilename(schemaFile[0]["name"])
                console.log("Subschema is valid")

                const copiedObj = JSON.parse(JSON.stringify(obj))

                //alert(activeSubSchemaButton)
                if (activeSubSchemaButton === "subschema") {
                    Object.keys(copiedObj).forEach(key => {
                        if (key === "id"){
                            //return setSelectedType(event.target.value)
                            //setFieldUri(obj[key])
                            //alert(key)
                            //let event = {target: {value: copiedObj[key]}}
                            //handleChangeUISchema(event, key)
                            setFieldUri(copiedObj[key])
                        }
                        if (key === "$id"){
                            //let event = {target: {value: copiedObj[key]}}
                            //handleChangeUISchema(event, key)
                            setFieldUri(copiedObj[key])
                        }
                        if (key === "title"){
                            //setTitle(obj[key])
                            let event = {target: {value: copiedObj[key]}}
                            handleChangeUISchema(event, key)
                        }
                        if (key === "description"){
                            //setDescription(obj[key])
                            let event = {target: {value: copiedObj[key]}}
                            handleChangeUISchema(event, key)
                        }
                    })
                }

            } catch (error) {
                console.log(error);
                alert(`${schemaFile[0]["name"]} is invalid!`)
                // update states
                setSubSchemaValidity(false);
                setSubSchemaFilename(schemaFile[0]["name"])
                }
            };
            reader.readAsText(schemaFile[0]);
        } else {
            // update states
            alert(`${schemaFile[0]["name"]} is invalid!`)
            setSubSchemaValidity(false);
            setSubSchemaFilename(schemaFile[0]["name"])
        }
    };


    // browse or drag&drop schema file
    const onDrop = useCallback(
        (acceptedFile) => {
            // process the schema, validation etc
            checkSubSchemaValidity(acceptedFile);

        // store schema file in the state
        // update states
        // setRenderReady(false);
        // setDisable(true);
        // setCreateScratchMode(false);
        // setJsonData({});
        // setSelectedSchemaName("");
        },
        [activeSubSchemaButton]
    );
    // for upload subschema
    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        multiple: false,
    });

    return (
        <>
            {notImplemented ?
                <Dialog
                    open={openDialog}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        <div style={{ display: "inline-flex", width: "100%", verticalAlign: "middle" }}>
                            {editOrAdd === "add" ? <AddIcon fontSize="large" color="primary" style={{ alignSelf: "center" }} /> : <EditIcon fontSize="large" color="primary" style={{ alignSelf: "center" }} />}
                            <div style={{ width: "100%", alignSelf: "center" }}>
                                {editOrAdd === "add" ? `Add element in "${field_label}"` : `Edit "${tempUISchema["title"]}"`}
                            </div>
                            <IconButton onClick={() => handleCancelEdit()}><CloseIcon fontSize="large" color="secondary" /></IconButton>
                        </div>
                    </DialogTitle>
                    <Divider />
                    <DialogContent>
                        We are sorry! Editing feature for the "{UISchema["type"]}" type/keyword is not yet implemented.
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => handleCancelEdit()} color="secondary">
                            Cancel
                        </Button>
                        <Button disabled onClick={() => handleUpdateSchemaOnClick()} color="primary" autoFocus>
                            {editOrAdd === "add" ? "Add" : "Save"}
                        </Button>
                    </DialogActions>
                </Dialog>
                :
                <Dialog
                    open={openDialog}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        <div style={{ display: "inline-flex", width: "100%", verticalAlign: "middle" }}>
                            {editOrAdd === "add" ? <AddIcon fontSize="large" color="primary" style={{ alignSelf: "center" }} /> : <EditIcon fontSize="large" color="primary" style={{ alignSelf: "center" }} />}
                            <div style={{ width: "100%", alignSelf: "center" }}>
                                {editOrAdd === "add" ? `Add element in "${field_label}"` : `Edit "${tempUISchema["title"]}"`}
                            </div>
                            <IconButton onClick={() => handleCancelEdit()}><CloseIcon fontSize="large" color="secondary" /></IconButton>
                        </div>
                    </DialogTitle>
                    <Divider />
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description" component="span">
                            <div>
                                <FormControl component="widget-type">
                                    <FormLabel style={{ color: "#01579b" }} component="legend">Basic Descriptors:</FormLabel>
                                    <TextField margin="normal" required onChange={event => handleChangeUISchema(event, "fieldKey")} style={{ marginTop: "20px" }} value={fieldkey} variant="outlined" fullWidth={true} label={"Field Keyword"} helperText='A unique json keyword for this field. Usually short and has no spaces (use "_" instead). Spaces are replaced automatically with "_" upon saving.' />
                                    <TextField margin="normal" onChange={event => handleChangeUISchema(event, "$id")} style={{ marginTop: "10px" }} value={fieldUri} variant="outlined" fullWidth={true} label={"Field ID/URI"} helperText='ID or URI for this field if available.' />
                                    <TextField margin="normal" onChange={event => handleChangeUISchema(event, "title")} style={{ marginTop: "10px" }} value={title} variant="outlined" fullWidth={true} label={"Field Title"} helperText='Label or title of the field. For a field that requires a unit, the unit can be placed within a square bracket, e,g., "Chamber Pressure [Pa]".' />
                                    <TextField margin="normal" onChange={event => handleChangeUISchema(event, "description")} style={{ marginTop: "10px" }} value={description} variant="outlined" fullWidth={true} label={"Field Description"} multiline rows={3} helperText='A detailed description of the field, how the input should be formated, etc.' />
                                    <div style={{ paddingTop: "10px", paddingBottom: "10px" }}>
                                        <FormControl component="validation-related">
                                            <FormLabel style={{ color: "#01579b" }} component="legend">Validation Related:</FormLabel>
                                        </FormControl>
                                    </div>
                                    <TextField
                                        margin="normal"
                                        helperText='Data type of the field input.'
                                        onChange={event => handleChangeUISchema(event, "type")}
                                        style={{ marginTop: "10px" }}
                                        defaultValue={tempUISchema["type"]}
                                        select
                                        fullWidth={true}
                                        id={field_key}
                                        label={"Field Data Type"}
                                        variant="outlined"
                                        SelectProps={{
                                            native: true,
                                        }}
                                    >
                                        {datatypes.map((content, index) => (
                                            <option key={index} value={content}>
                                                {content}
                                            </option>
                                        ))}
                                    </TextField>
                                    {["number", "integer"].includes(selectedType) ?
                                        <>
                                            <div style={{ display: "flex" }}>
                                                <TextField onFocus={() => setNumberMinMaxValueHelpertext("Set the minimum and maximum values of this field.")} value={numberMinMaxValue[0]} onBlur={(event) => { handleMinMaxValueOnBlur(event, "min-" + selectedType) }} onChange={event => handleMinMaxValue(event, "min-" + selectedType)} margin="normal" fullWidth variant='outlined' label="Minimum Value" />
                                                <div style={{ paddingLeft: "10px" }}></div>
                                                <TextField onFocus={() => setNumberMinMaxValueHelpertext("Set the minimum and maximum values of this field.")} value={numberMinMaxValue[1]} onBlur={(event) => { handleMinMaxValueOnBlur(event, "max-" + selectedType) }} onChange={event => handleMinMaxValue(event, "max-" + selectedType)} margin="normal" fullWidth variant='outlined' label="Maximum Value" />
                                            </div>
                                            <div style={{ color: "gray", fontSize: "12px", paddingLeft: "11px", paddingRight: "11px" }}>{numberMinMaxValueHelperText}</div>
                                        </>
                                        : null}
                                    {selectedType === "string" ?
                                        <>
                                            <div style={{ display: "flex" }}>
                                                <TextField onFocus={() => setCharMinMaxHelperText("Set the minimum and maximum length allowed for this string input.")} value={charMinMaxLengthValue[0]} onBlur={(event) => { handleMinMaxCharLengthOnBlur(event, "minLength") }} onChange={event => handleMinMaxCharLength(event, "minLength")} margin="normal" fullWidth variant='outlined' label="Minimum Character Length" />
                                                <div style={{ paddingLeft: "10px" }}></div>
                                                <TextField onFocus={() => setCharMinMaxHelperText("Set the minimum and maximum length allowed for this string input.")} value={charMinMaxLengthValue[1]} onBlur={(event) => { handleMinMaxCharLengthOnBlur(event, "maxLength") }} onChange={event => handleMinMaxCharLength(event, "maxLength")} margin="normal" fullWidth variant='outlined' label="Maximum Character Length" />
                                            </div>
                                            <div style={{ color: "gray", fontSize: "12px", paddingLeft: "11px", paddingRight: "11px" }}>{charMinMaxHelperText}</div>
                                        </>
                                        : null}
                                    {["string", "integer", "number"].includes(selectedType) ?
                                        <>
                                            <FormControlLabel control={<Checkbox onChange={() => handleEnumBoxOnChange()} checked={enumChecked} />} label="Enumerated. Provide a list of possible inputs for this field." />
                                            <div style={{ marginLeft: "32px", marginTop: "0px", marginBottom: "10px" }}>
                                                {enumChecked ? <TextField defaultValue={enumList !== undefined ? enumList : ""} onChange={handleOnChangeListField} variant="outlined" fullWidth={true} label="Enumerate List" multiline rows={2} helperText="A list of inputs separated by commas, e,g.: item 1, item 2, item 3. Make sure that the item data type matches the field input data type. Invalid items will be not saved." /> : <Divider />}
                                            </div>
                                        </> : null}
                                </FormControl>
                                <div style={{ paddingBottom: "10px" }}>
                                    <FormGroup>
                                        {selectedType === "array" ?
                                            <>
                                                <TextField
                                                    margin="normal"
                                                    helperText={'Data type of the array items.'}
                                                    onChange={event => handleChangeUISchema(event, "itemType")}
                                                    style={{ marginTop: "10px" }}
                                                    defaultValue={tempUISchema["items"] !== undefined ? tempUISchema["items"]["type"] : "string"}
                                                    select
                                                    fullWidth={true}
                                                    id={field_key}
                                                    label={"Item Data Type"}
                                                    variant="outlined"
                                                    SelectProps={{
                                                        native: true,
                                                    }}
                                                >
                                                    {arrayItemTypeList.map((content, index) => (
                                                        <option key={index} value={content}>
                                                            {content}
                                                        </option>
                                                    ))}
                                                </TextField>
                                                <div style={{ display: "flex" }}>
                                                    <TextField value={arrayMinMaxItem[0]} onChange={event => handleMinMaxArrayItem(event, "min")} onBlur={event => { handleMinMaxArrayItemOnBlur(event, "min") }} margin="normal" fullWidth variant='outlined' label="Min. Array Items" />
                                                    <div style={{ paddingLeft: "10px" }}></div>
                                                    <TextField value={arrayMinMaxItem[1]} onChange={event => handleMinMaxArrayItem(event, "max")} onBlur={event => { handleMinMaxArrayItemOnBlur(event, "max") }} margin="normal" fullWidth variant='outlined' label="Max. Array items" />
                                                </div>
                                                <div style={{ color: "gray", fontSize: "12px", paddingLeft: "11px", paddingRight: "11px", paddingBottom: "10px" }}>{arrayMinMaxHelperText}</div>
                                                <FormControlLabel control={<Checkbox onChange={() => handleUniqueItemsCheckBoxOnChange()} checked={arrayUniqueItems} />} label="Input items must be unique." />
                                                <FormControlLabel control={<Checkbox onChange={() => handleCheckBoxOnChange()} checked={requiredChecked} />} label="Required. Checked means the field must be filled." />
                                            </>
                                            : null}
                                        {selectedType === "object" ? <>
                                        <div style={{ display: "flex", width:"100%", justifyContent:"center" }}>
                                            <div onClick={()=> setActiveSubSchemaButton("subschema")} style={{paddingRight:"5px", width:"100%"}}><Button fullWidth={true} size="small" color="primary" variant="outlined" {...getRootProps()}> <input {...getInputProps()} />Upload a subschema</Button></div>
                                            <Button fullWidth={true} size="small" color="primary" variant="outlined" {...getRootProps()}> <input {...getInputProps()} />Upload schema properties</Button>
                                        </div>
                                        {subSchemaValidity ? <div style={{color:"green", fontSize: "9pt", paddingLeft:"13px", paddingTop:"5px", paddingBottom:"5px"}}>{subSchemaFilename} is valid.</div>:null}
                                        <div style={{fontSize: "9pt", paddingLeft:"13px", paddingTop:"5px", paddingBottom:"5px"}}>Upload a subschema or schema properties for this object by clicking on the corresponding button above.</div>
                                        </>: null}
                                        {selectedType === "object" ? <FormControlLabel control={<Checkbox onChange={() => handleCheckBoxOnChange()} checked={requiredChecked} />} label="Required. Checked means the field must be filled." /> : null}
                                        {selectedType !== "object" & selectedType !== "array" & selectedType !== "boolean" ?
                                            <>
                                                <FormControlLabel control={<Checkbox onChange={() => handleCheckBoxOnChange()} checked={requiredChecked} />} label="Required. Checked means the field must be filled." />
                                                <div style={{ paddingTop: "15px", paddingBottom: "0px" }}>
                                                    <FormControl component="misc-keywords">
                                                        <FormLabel style={{ color: "#01579b" }} component="legend">Misc.:</FormLabel>
                                                    </FormControl>
                                                </div>
                                                {selectedType === "fileupload (string)" ? null : <TextField margin='normal' onChange={event => handleChangeUISchema(event, "defaultValue")} style={{ marginTop: "10px" }} defaultValue={defaultValue} variant="outlined" fullWidth={true} label={"Field Default Value"} helperText="Initial value of the field." />}
                                            </>
                                            : null}
                                        {selectedType === "boolean" ?
                                            <>
                                                <div style={{ paddingTop: "15px", paddingBottom: "0px" }}>
                                                    <FormControl component="misc-keywords">
                                                        <FormLabel style={{ color: "#01579b" }} component="legend">Misc.:</FormLabel>
                                                    </FormControl>
                                                </div>
                                                <TextField
                                                    margin='normal'
                                                    onChange={event => handleChangeUISchema(event, "defaultValue")}
                                                    style={{ marginTop: "10px" }}
                                                    defaultValue={defaultValue !== undefined ? defaultValue : ""}
                                                    select
                                                    fullWidth={true}
                                                    id={field_key}
                                                    label={"Boolean Field Default Value"}
                                                    variant="outlined"
                                                    SelectProps={{
                                                        native: true,
                                                    }}
                                                >
                                                    {["", "true", "false"].map((content, index) => (
                                                        <option key={index} value={content}>
                                                            {content}
                                                        </option>
                                                    ))}
                                                </TextField>
                                            </>
                                            : null}
                                    </FormGroup>
                                </div>
                            </div>
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => handleCancelEdit()} color="secondary">
                            Cancel
                        </Button>
                        <Button onClick={() => handleUpdateSchemaOnClick()} color="primary" autoFocus>
                            {editOrAdd === "add" ? "Add" : "Save"}
                        </Button>
                    </DialogActions>
                </Dialog>}
        </>

    )
};

export default EditElement;