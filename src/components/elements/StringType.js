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


const StringType = ({ dataInputItems, setDataInputItems, withinArray, path, pathSchema, field_required, field_index, edit, field_id, field_label, field_description, field_enumerate, defaultValue }) => {
    //const [descriptionText, setDescriptionText] = useState(field_description);
    const [openDialog, setOpenDialog] = useState(false);
    const { updateParent, convertedSchema, handleDataInput, handleDataDelete } = useContext(FormContext);
    //const [required, setRequired] = useState(false)
    const classes = useStyles();

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
        "type": "string"
    }

    // handle delete field UI
    const handleDeleteElement = () => {
        const value = deleteKey(convertedSchema, path)
        updateParent(value)

        handleDataDelete(pathSchema);
    }

    // handle on blur
    const handleOnBlur = (event, pathSchema, type) => {
        if (withinArray !== undefined & withinArray) {
            let newPathSchema = pathSchema.split(".");
            newPathSchema.pop()
            newPathSchema = newPathSchema.join(".")

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
            handleDataInput(value, newPathSchema, "string")
        } else {
            handleDataInput(event, pathSchema, type)
        }
    }

    /* maybe not need this, already handled in AdamantMain.jsx
    // if enumerate and no defaultValue then already store the first enumerate value to form data
    useEffect(() => {
        if (field_enumerate !== undefined & defaultValue === undefined & withinArray === undefined) {
            let event = {
                "target": {
                    "value":
                        field_enumerate[0]
                }
            }
            handleDataInput(event, pathSchema, "string")
        } else if (field_enumerate !== undefined & withinArray !== undefined & withinArray === true) {
            let newPathSchema = pathSchema.split(".");
            newPathSchema.pop()
            newPathSchema = newPathSchema.join(".")
            console.log(newPathSchema)
            let arr = dataInputItems;
            const items = Array.from(arr);
            items[field_index][field_id] = field_enumerate[0];
            setDataInputItems(items);
            console.log(items)

            // store to the main form data
            let event = {
                "target": {
                    "value":
                        items
                }
            }
            handleDataInput(event, newPathSchema, "string")
        }
    }, [])
    */

    if (field_enumerate === undefined) {
        return (
            <>
                <div style={{ paddingTop: "10px", paddingBottom: "10px", display: 'inline-flex', width: '100%' }}>
                    <TextField onBlur={(event) => handleOnBlur(event, pathSchema, "string")} required={required} helperText={field_description} defaultValue={defaultValue} fullWidth={true} className={classes.heading} id={field_id} label={field_label} variant="outlined" />
                    {edit ? <><IconButton onClick={() => setOpenDialog(true)} style={{ marginLeft: "5px", marginTop: "5px", height: "45px" }}><EditIcon fontSize="small" color="primary" /></IconButton>
                        <IconButton onClick={() => handleDeleteElement()} style={{ marginLeft: "5px", marginTop: "5px", height: "45px" }}><DeleteIcon fontSize="small" color="secondary" /></IconButton></> : null}
                </div>
                {openDialog ? <EditElement pathSchema={pathSchema} defaultValue={defaultValue} enumerated={enumerated} field_enumerate={field_enumerate} field_id={field_id} field_index={field_index} openDialog={openDialog} setOpenDialog={setOpenDialog} path={path} UISchema={UISchema} field_required={required} /> : null}
            </>
        )
    } else {
        return (
            <>
                <div style={{ paddingTop: "10px", paddingBottom: "10px", display: 'inline-flex', width: '100%' }}>
                    < TextField
                        onBlur={(event) => handleOnBlur(event, pathSchema, "string")}
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
                        defaultValue={defaultValue}
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
                {openDialog ? <EditElement pathSchema={pathSchema} enumerated={enumerated} defaultValue={defaultValue} field_enumerate={field_enumerate} field_id={field_id} field_index={field_index} openDialog={openDialog} setOpenDialog={setOpenDialog} path={path} UISchema={UISchema} field_required={required} /> : null}
            </>
        )
    }
};

export default StringType;
