import React, { useContext, useState, useEffect } from 'react'
import { Checkbox, FormLabel, FormHelperText, FormControl } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from "@material-ui/icons/Delete";
import { IconButton } from '@material-ui/core';
import EditElement from '../EditElement';
import { FormContext } from '../../FormContext';
import deleteKey from '../utils/deleteKey';
import { Tooltip } from '@material-ui/core';
import getValue from '../utils/getValue';
import set from 'set-value';

const useStyles = makeStyles((theme) => ({
    root: {
        width: 'auto',
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular,
    },
}));

const style = {
    paddingTop: "10px",
    paddingBottom: "10px",
}


const BooleanType = ({ field_uri, withinArray, value, dataInputItems, setDataInputItems, path, pathFormData, field_required, field_index, edit, field_key, field_label, field_description, defaultValue }) => {
    //const [descriptionText, setDescriptionText] = useState(field_description);
    const [openDialog, setOpenDialog] = useState(false);
    const { updateParent, convertedSchema, handleDataInput, handleDataDelete, handleConvertedDataInput } = useContext(FormContext);
    const [inputValue, setInputValue] = useState(value !== undefined ? value : typeof (defaultValue) === "boolean" ? defaultValue : false);
    //const [required, setRequired] = useState(false)
    const classes = useStyles();

    useEffect(() => {
        if (value === undefined) {
            setInputValue(false)
        } else {
            setInputValue(value)
        }
    }, [value])

    // clean up empty strings in the paths
    path = path.split(".")
    path = path.filter(e => e)
    path = path.join(".")
    pathFormData = pathFormData.split(".")
    pathFormData = pathFormData.filter(e => e)
    pathFormData = pathFormData.join(".")

    var required
    if (field_required === undefined) {
        required = false;
    } else if (field_required.includes(field_key)) {
        required = true;
    };

    // construct UI schema
    let UISchema = {
        "fieldKey": field_key,
        "title": field_label,
        "description": field_description,
        "$id": field_uri,
        "type": "boolean",
        "value": value
    }

    // handle delete field UI
    const handleDeleteElement = () => {
        let value = deleteKey(convertedSchema, path)
        // delete the field key in required array if applicable        
        let pathArr = path.split(".")
        if (pathArr.length <= 2) {
            if (value["required"] !== undefined) {
                let index = value["required"].indexOf(field_key)
                if (index !== -1) {
                    value["required"].splice(index, 1)
                }
            }
        } else {
            pathArr.pop()
            pathArr.pop()
            let val = getValue(value, pathArr.join("."))
            if (val["required"] !== undefined) {
                let index = val["required"].indexOf(field_key)
                if (index !== -1) {
                    let newPath = pathArr.join(".") + ".required"
                    val["required"].splice(index, 1)
                    if (val["required"].length === 0) {
                        value = deleteKey(value, newPath)
                    } else {
                        set(value, newPath, val["required"])
                    }
                }
            }
        }

        updateParent(value)
        handleDataDelete(pathFormData);
    }

    // handle input on change for checkbox (boolean type: checked is true unchecked is false)
    const handleInputOnChange = () => {
        let value = inputValue
        if (withinArray !== undefined & withinArray) {
            let newPathFormData = pathFormData.split(".");
            newPathFormData.pop()
            newPathFormData = newPathFormData.join(".")

            let newPath = path.split(".")
            newPath.pop()
            newPath = newPath.join(".")

            let arr = dataInputItems;
            const items = Array.from(arr);
            items[field_index][field_key] = !value;
            setDataInputItems(items);

            setInputValue(!value)
            handleDataInput(items, newPathFormData, "boolean")
            handleConvertedDataInput(items, newPath + ".value", "boolean")

        } else {
            setInputValue(!value)
            handleDataInput(!value, pathFormData, "boolean")
            handleConvertedDataInput(!value, path + ".value", "boolean")
        }
    }

    // if boolean field is newly created then store a false input data already to the form data
    useEffect(() => {
        if (defaultValue === undefined) {
            if (withinArray !== undefined & withinArray === true) {
                let newPathFormData = pathFormData.split(".");
                newPathFormData.pop()
                newPathFormData = newPathFormData.join(".")

                let newPath = path.split(".")
                newPath.pop()
                newPath = newPath.join(".")

                let arr = dataInputItems;
                const items = Array.from(arr);
                items[field_index][field_key] = false;
                setDataInputItems(items);

                handleDataInput(items, newPathFormData, "boolean")
                handleConvertedDataInput(items, newPath + ".value", "boolean")
            }
            else {
                handleDataInput(false, pathFormData, "boolean")
                handleConvertedDataInput(false, path + ".value", "boolean")
            }
        } else {
            if (withinArray !== undefined & withinArray === true) {
                let newPathFormData = pathFormData.split(".");
                newPathFormData.pop()
                newPathFormData = newPathFormData.join(".")

                let newPath = path.split(".")
                newPath.pop()
                newPath = newPath.join(".")

                let arr = dataInputItems;
                const items = Array.from(arr);
                items[field_index][field_key] = defaultValue;
                setDataInputItems(items);

                handleDataInput(items, newPathFormData, "boolean")
                handleConvertedDataInput(items, newPath + ".value", "boolean")
            }
            else {
                handleDataInput(defaultValue, pathFormData, "boolean")
                handleConvertedDataInput(defaultValue, path + ".value", "boolean")
            }
        }
    }, [])


    return (
        <>
            <div style={{ paddingTop: "10px", paddingBottom: "10px", display: 'inline-flex', alignItems: "center", width: '100%' }}>
                <div style={{ paddingLeft: "15px", width: "100%" }}>
                    <FormControl >
                        <FormLabel>{field_label === undefined ? "" : field_label + ":"}</FormLabel>
                        <div style={{ textAlign: "center", width: "100%" }}>
                            <Checkbox onChange={() => handleInputOnChange()} checked={inputValue} />
                        </div>
                        <FormHelperText>{field_description}</FormHelperText>
                    </FormControl>
                </div>
                {edit ? <>
                    <Tooltip placement="top" title={`Edit field "${field_label}"`}>
                        <IconButton onClick={() => setOpenDialog(true)} style={{ marginLeft: "5px", marginTop: "5px", height: "45px" }}>
                            <EditIcon fontSize="small" color="primary" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip placement="top" title={`Remove field "${field_label}"`}>
                        <IconButton onClick={() => handleDeleteElement()} style={{ marginLeft: "5px", marginTop: "5px", height: "45px" }}>
                            <DeleteIcon fontSize="small" color="secondary" />
                        </IconButton>
                    </Tooltip>
                </> : null}
            </div>
            {openDialog ? <EditElement field_uri={field_uri} pathFormData={pathFormData} defaultValue={defaultValue} field_key={field_key} field_index={field_index} openDialog={openDialog} setOpenDialog={setOpenDialog} path={path} UISchema={UISchema} field_required={required} /> : null}
        </>
    )
};

export default BooleanType;
