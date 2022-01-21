import React, { useContext, useEffect, useState } from 'react'
import TextField from "@material-ui/core/TextField"
import { makeStyles } from '@material-ui/core/styles';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from "@material-ui/icons/Delete";
import { IconButton } from '@material-ui/core';
import EditElement from '../EditElement';
import { FormContext } from '../../FormContext';
import deleteKey from '../utils/deleteKey';


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


const StringType = ({ field_uri, dataInputItems, setDataInputItems, withinArray, path, pathFormData, field_required, field_index, edit, field_id, field_label, field_description, field_enumerate, defaultValue, value }) => {

    //const [descriptionText, setDescriptionText] = useState(field_description);
    const [openDialog, setOpenDialog] = useState(false);
    const { updateParent, convertedSchema, handleDataInput, handleDataDelete, handleConvertedDataInput } = useContext(FormContext);
    const [fieldValue, setFieldValue] = useState(defaultValue !== undefined ? defaultValue : value !== undefined ? value : "")
    //const [required, setRequired] = useState(false)
    const classes = useStyles();

    useEffect(() => {
        if (value === undefined) {
            setFieldValue("")
        } else {
            setFieldValue(value)
        }
    }, [value])

    const handleOnChange = (event) => {
        setFieldValue(event.target.value)
    }


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
    } else if (field_required.includes(field_id)) {
        required = true;
    };

    var enumerated
    if (field_enumerate === undefined) {
        enumerated = false;
    } else {
        enumerated = true;
    }

    // construct UI schema
    let UISchema = {
        "fieldId": field_id,
        "title": field_label,
        "description": field_description,
        "$id": field_uri,
        "type": "string",
        "value": value,
    }

    // handle delete field UI
    const handleDeleteElement = () => {
        const value = deleteKey(convertedSchema, path)
        updateParent(value)

        handleDataDelete(pathFormData);
    }

    // handle on blur
    const handleOnBlur = (event, pathFormData, type) => {
        if (withinArray !== undefined & withinArray) {
            let newPathFormData = pathFormData.split(".");
            newPathFormData.pop()
            newPathFormData = newPathFormData.join(".")

            let newPath = path.split(".")
            newPath.pop()
            newPath = newPath.join(".")

            let arr = dataInputItems;
            const items = Array.from(arr);
            items[field_index][field_id] = event.target.value;
            setDataInputItems(items);

            // store to the main form data
            let value = {
                "target": {
                    "value":
                        items
                }
            }
            handleDataInput(value, newPathFormData, "string")
            // conv. schema data
            handleConvertedDataInput(value, newPath + ".value", "string")

            // update field value
            setFieldValue(event.target.value)
        } else {
            handleDataInput(event, pathFormData, type)
            // conv. schema data
            handleConvertedDataInput(event, path + ".value", "string")
            // update field value
            setFieldValue(event.target.value)
        }
    }


    // if enumerate and no defaultValue then already store the first enumerate value to form data
    // this is for any enumerate in a subschema (e.g., in anyOf), for the rest of enumerate is taken care of in AdamantMain.jsx
    useEffect(() => {
        if (field_enumerate !== undefined & withinArray !== undefined & withinArray === true) {
            let newPathFormData = pathFormData.split(".");
            newPathFormData.pop()
            newPathFormData = newPathFormData.join(".")

            let newPath = path.split(".")
            newPath.pop()
            newPath = newPath.join(".")

            let arr = dataInputItems;
            const items = Array.from(arr);
            items[field_index][field_id] = field_enumerate[0];
            setDataInputItems(items);

            // store to the main form data
            let event = {
                "target": {
                    "value":
                        items
                }
            }
            handleDataInput(event, newPathFormData, "string")
            // conv. schema data
            handleConvertedDataInput(event, newPath + ".value", "string")
            // update field value
            setFieldValue(field_enumerate[0])
        } else if (field_enumerate !== undefined & withinArray === undefined) {
            // store to the main form data
            let event = {
                "target": {
                    "value":
                        field_enumerate[0]
                }
            }
            handleDataInput(event, pathFormData, "string")
            // conv. schema data
            handleConvertedDataInput(event, path + ".value", "string")
            // update field value
            setFieldValue(field_enumerate[0])
        } else if (field_enumerate === undefined & withinArray === undefined & defaultValue !== undefined) {
            // store to the main form data
            let event = {
                "target": {
                    "value":
                        defaultValue
                }
            }
            handleDataInput(event, pathFormData, "string")
            // conv. schema data
            handleConvertedDataInput(event, path + ".value", "string")
            // update field value
            setFieldValue(defaultValue)
        } else if (field_enumerate === undefined & withinArray !== undefined & defaultValue !== undefined) {
            let newPathFormData = pathFormData.split(".");
            newPathFormData.pop()
            newPathFormData = newPathFormData.join(".")

            let newPath = path.split(".")
            newPath.pop()
            newPath = newPath.join(".")

            let arr = dataInputItems;
            const items = Array.from(arr);
            items[field_index][field_id] = defaultValue;
            setDataInputItems(items);

            // store to the main form data
            let event = {
                "target": {
                    "value":
                        items
                }
            }
            handleDataInput(event, newPathFormData, "string")
            // conv. schema data
            handleConvertedDataInput(event, newPath + ".value", "string")
            // update field value
            setFieldValue(defaultValue)
        }
    }, [])

    if (field_enumerate === undefined) {
        return (
            <>
                <div style={{ paddingTop: "10px", paddingBottom: "10px", display: 'inline-flex', width: '100%' }}>
                    <TextField onBlur={(event) => handleOnBlur(event, pathFormData, "string")} required={required} helperText={field_description} onChange={(event) => { handleOnChange(event) }} value={fieldValue} fullWidth={true} className={classes.heading} id={field_id} label={field_label} variant="outlined" />
                    {edit ? <><IconButton onClick={() => setOpenDialog(true)} style={{ marginLeft: "5px", marginTop: "5px", height: "45px" }}><EditIcon fontSize="small" color="primary" /></IconButton>
                        <IconButton onClick={() => handleDeleteElement()} style={{ marginLeft: "5px", marginTop: "5px", height: "45px" }}><DeleteIcon fontSize="small" color="secondary" /></IconButton></> : null}
                </div>
                {openDialog ? <EditElement field_uri={field_uri} pathFormData={pathFormData} defaultValue={defaultValue} enumerated={enumerated} field_enumerate={field_enumerate} field_id={field_id} field_index={field_index} openDialog={openDialog} setOpenDialog={setOpenDialog} path={path} UISchema={UISchema} field_required={required} /> : null}
            </>
        )
    } else {
        return (
            <>
                <div style={{ paddingTop: "10px", paddingBottom: "10px", display: 'inline-flex', width: '100%' }}>
                    < TextField
                        onBlur={(event) => handleOnBlur(event, pathFormData, "string")}
                        onChange={event => handleOnChange(event)}
                        required={required}
                        select
                        fullWidth={true}
                        className={classes.heading}
                        id={field_id}
                        label={field_label}
                        variant="outlined"
                        SelectProps={{
                            native: true,
                        }
                        }
                        helperText={field_description}
                        value={fieldValue === undefined ? defaultValue : fieldValue}
                    >
                        {
                            field_enumerate.map((content, index) => (
                                <option key={index} value={content}>
                                    {content}
                                </option>
                            ))
                        }
                    </TextField >
                    {edit ? <><IconButton onClick={() => setOpenDialog(true)} style={{ marginLeft: "5px", marginTop: "5px", height: "45px" }}><EditIcon fontSize="small" color="primary" /></IconButton>
                        <IconButton onClick={() => handleDeleteElement()} style={{ marginLeft: "5px", marginTop: "5px", height: "45px" }}><DeleteIcon fontSize="small" color="secondary" /></IconButton></> : null}
                </div >
                {openDialog ? <EditElement field_uri={field_uri} pathFormData={pathFormData} enumerated={enumerated} defaultValue={defaultValue} field_enumerate={field_enumerate} field_id={field_id} field_index={field_index} openDialog={openDialog} setOpenDialog={setOpenDialog} path={path} UISchema={UISchema} field_required={required} /> : null}
            </>
        )
    }
};

export default StringType;
