import React, { useContext, useState, useEffect } from 'react'
import TextField from "@material-ui/core/TextField";
import { makeStyles } from '@material-ui/core/styles';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from "@material-ui/icons/Delete";
import { IconButton } from '@material-ui/core';
import EditElement from '../EditElement';
import { FormContext } from '../../FormContext';
import deleteKey from '../utils/deleteKey';
import getUnit from '../utils/getUnit';
import { InputAdornment } from '@material-ui/core';


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


const IntegerType = ({ field_uri, value, dataInputItems, setDataInputItems, withinArray, defaultValue, path, pathFormData, field_required, field_index, edit, field_id, field_label, field_description, field_enumerate }) => {
    //const [descriptionText, setDescriptionText] = useState(field_description);
    const [openDialog, setOpenDialog] = useState(false);
    const { updateParent, convertedSchema, handleDataInput, handleDataDelete, handleConvertedDataInput } = useContext(FormContext);
    const [inputValue, setInputValue] = useState(defaultValue !== undefined & value === undefined ? defaultValue : value === undefined ? "" : value)// useState(defaultValue !== undefined ? defaultValue : value);
    //const [required, setRequired] = useState(false)
    const classes = useStyles();

    useEffect(() => {
        if (value === undefined) {
            setInputValue("")
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

    let unit = getUnit(field_label)

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
        "type": "integer",
        "value": value
    }

    // handle delete field UI
    const handleDeleteElement = () => {
        const value = deleteKey(convertedSchema, path)
        updateParent(value)

        handleDataDelete(pathFormData);
    }

    // handle input on change for signed integer
    const handleInputOnChange = (event) => {
        let inputValueVar
        if (inputValue === undefined) {
            inputValueVar = ""
        } else {
            inputValueVar = inputValue
        }
        inputValueVar = inputValueVar.toString()
        if (event.target.value === ".") {
            return
        }
        if ((event.target.value.at(-1) === '.')) {
            let value = inputValueVar
            setInputValue(value.replace(/ /g, ''))
        } else {
            let value = event.target.value.replace(/(?!^-)[^0-9]/g, "")
            setInputValue(value.replace(/ /g, ''))
        }
    }

    // handle input on blur for signed integer
    const handleInputOnBlur = () => {

        if (withinArray !== undefined & withinArray) {

            let value = inputValue;
            value = parseInt(value)
            if (!isNaN(value)) {
                setInputValue(value)
                // store in jData
                let newPathFormData = pathFormData.split(".");
                newPathFormData.pop()
                newPathFormData = newPathFormData.join(".")

                let newPath = path.split(".")
                newPath.pop()
                newPath = newPath.join(".")

                let arr = dataInputItems;
                const items = Array.from(arr);
                items[field_index][field_id] = value;
                setDataInputItems(items);

                // store to the main form data
                handleDataInput(items, newPathFormData, "integer")
                // conv. schema data
                handleConvertedDataInput(items, newPath + ".value", "integer")
            }
        } else {
            let value = inputValue;
            value = parseInt(value)
            if (!isNaN(value)) {
                setInputValue(value)
                // store in jData
                handleDataInput(parseInt(inputValue), pathFormData, "integer")
                // conv. schema data
                handleConvertedDataInput(parseInt(inputValue), path + ".value", "integer")
            }
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
            items[field_index][field_id] = (defaultValue === undefined ? field_enumerate[0] : defaultValue);
            setDataInputItems(items);

            // store to the main form data
            let event = {
                "target": {
                    "value":
                        items
                }
            }
            handleDataInput(event, newPathFormData, "integer")
            // conv. schema data
            handleConvertedDataInput(field_enumerate[0], newPath + ".value", "integer")
            // update field value
            setInputValue(field_enumerate[0])
        } else if (field_enumerate !== undefined & withinArray === undefined) {
            // conv. schema data
            handleConvertedDataInput(field_enumerate[0], path + ".value", "integer")
            // update field value
            setInputValue(field_enumerate[0])
        } else if (field_enumerate === undefined & withinArray === undefined & defaultValue !== undefined) {
            // conv. schema data
            handleConvertedDataInput(defaultValue, path + ".value", "integer")
            // update field value
            setInputValue(defaultValue)
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
            handleDataInput(event, newPathFormData, "integer")
            // conv. schema data
            handleConvertedDataInput(defaultValue, newPath + ".value", "integer")
            // update field value
            setInputValue(defaultValue)
        }
    }, [])

    if (field_enumerate === undefined) {

        return (
            <>
                <div style={{ paddingTop: "10px", paddingBottom: "10px", display: 'inline-flex', width: '100%' }}>
                    <TextField onBlur={() => handleInputOnBlur()} onChange={e => handleInputOnChange(e)} value={inputValue === undefined ? defaultValue : inputValue} required={required} helperText={field_description} fullWidth={true} className={classes.heading} id={field_id} label={field_label} variant="outlined" InputProps={{
                        endAdornment: <InputAdornment position="start">{unit}</InputAdornment>,
                    }} />
                    {edit ? <><IconButton onClick={() => setOpenDialog(true)} style={{ marginLeft: "5px", marginTop: "5px", height: "45px" }}><EditIcon fontSize="small" color="primary" /></IconButton>
                        <IconButton onClick={() => handleDeleteElement()} style={{ marginLeft: "5px", marginTop: "5px", height: "45px" }}><DeleteIcon fontSize="small" color="secondary" /></IconButton></> : null}
                </div>
                {openDialog ? <EditElement field_uri={field_uri} pathFormData={pathFormData} field_enumerate={field_enumerate} enumerated={enumerated} defaultValue={defaultValue} field_id={field_id} field_index={field_index} openDialog={openDialog} setOpenDialog={setOpenDialog} path={path} UISchema={UISchema} field_required={required} /> : null}
            </>
        )
    } else {
        return (
            <>
                <div style={{ paddingTop: "10px", paddingBottom: "10px", display: 'inline-flex', width: '100%' }}>
                    <TextField
                        select
                        onBlur={() => handleInputOnBlur()}
                        onChange={e => handleInputOnChange(e)}
                        value={inputValue === undefined ? defaultValue : inputValue}
                        required={required}
                        helperText={field_description}
                        fullWidth={true}
                        className={classes.heading}
                        id={field_id}
                        label={field_label}
                        variant="outlined"
                        InputProps={{
                            endAdornment: <InputAdornment position="start">{unit}</InputAdornment>,
                        }}
                        SelectProps={{
                            native: true,
                        }}>
                        {
                            field_enumerate.map((content, index) => (
                                <option key={index} value={content}>
                                    {content}
                                </option>
                            ))
                        }
                    </TextField>
                    {edit ? <><IconButton onClick={() => setOpenDialog(true)} style={{ marginLeft: "5px", marginTop: "5px", height: "45px" }}><EditIcon fontSize="small" color="primary" /></IconButton>
                        <IconButton onClick={() => handleDeleteElement()} style={{ marginLeft: "5px", marginTop: "5px", height: "45px" }}><DeleteIcon fontSize="small" color="secondary" /></IconButton></> : null}
                </div>
                {openDialog ? <EditElement field_uri={field_uri} pathFormData={pathFormData} field_enumerate={field_enumerate} enumerated={enumerated} defaultValue={defaultValue} field_id={field_id} field_index={field_index} openDialog={openDialog} setOpenDialog={setOpenDialog} path={path} UISchema={UISchema} field_required={required} /> : null}
            </>
        )
    }
};

export default IntegerType;
