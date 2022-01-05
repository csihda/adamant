import React, { useContext, useState } from 'react'
import TextField from "@material-ui/core/TextField"
import { makeStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import AddIcon from "@material-ui/icons/AddBox";
import Divider from '@material-ui/core/Divider';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import { FormContext } from '../FormContext';
import { Checkbox } from '@material-ui/core';
import { FormGroup } from '@material-ui/core';
import updateRequired from './utils/updateRequired';
import getValue from './utils/getValue';
import checkIfFieldIDExist from './utils/checkIfFieldIDExist';
import { IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';


const AddElement = ({ enumerated, field_enumerate, field_required, defaultSchema, path, openDialog, setOpenDialog, UISchema, schemaTitle }) => {

    const [selectedType, setSelectedType] = useState("string")
    const [fieldId, setFieldId] = useState(undefined)
    const [title, setTitle] = useState(undefined)
    const [description, setDescription] = useState(undefined)
    const { updateParent, convertedSchema } = useContext(FormContext);
    const [requiredChecked, setRequiredChecked] = useState(field_required === undefined ? false : field_required)
    const [enumChecked, setEnumChecked] = useState(enumerated === undefined ? false : enumerated)
    const [enumList, setEnumList] = useState(field_enumerate === undefined ? [] : field_enumerate.join(","));

    let tempUISchema = JSON.parse(JSON.stringify(defaultSchema))


    const datatypes = ["string", "number", "integer", "object", "array", "boolean"]


    const handleOnChangeListField = (event) => {
        setEnumList(event.target.value);
    }

    // save the change and update the UI
    const handleUpdateSchemaOnClick = () => {
        // check if fieldId already exist
        if (checkIfFieldIDExist(convertedSchema, path, fieldId)) {
            alert("Field ID already exists!")
            return
        }

        tempUISchema["fieldId"] = fieldId;
        tempUISchema["type"] = selectedType;
        if (title !== undefined) { tempUISchema["title"] = title }
        if (description !== undefined) { tempUISchema["description"] = description }

        if (fieldId === undefined) {
            alert("Field ID must be defined!")
            return
        }

        if (typeof (fieldId) === "string" & fieldId.replace(/\s+/g, '') === "") {
            alert("Field ID must be defined!")
            return
        }

        if (tempUISchema["type"] === "object") {
            tempUISchema["properties"] = []
        }
        if (tempUISchema["type"] === "array") {
            tempUISchema["items"] = {}
        }
        if (tempUISchema["type"] !== "string") {
            setEnumChecked(false);
        }

        if (path !== undefined) {
            const set = require("set-value");

            let properties = getValue(convertedSchema, path)["properties"]
            properties.push(tempUISchema)
            set(convertedSchema, path + ".properties", properties)

            // create a new path to the new element
            path = path + ".properties." + (properties.length - 1).toString()
            let field_id = fieldId
            // update the required value
            const newConvertedSchema = updateRequired({ selectedType, path, requiredChecked, field_id, convertedSchema })
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
            let field_id = fieldId
            // update the required value
            const newConvertedSchema = updateRequired({ selectedType, path, requiredChecked, field_id, convertedSchema })
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

    // change descriptor value
    const handleChangeUISchema = (event, keyword) => {

        switch (keyword) {
            case 'type':
                return setSelectedType(event.target.value)
            case 'title':
                return setTitle(event.target.value)
            case 'description':
                return setDescription(event.target.value)
            case 'fieldId':
                return setFieldId(event.target.value)
            default:
                return null;
        }
    }

    // cancel editing
    const handleCancelEdit = () => {
        tempUISchema = JSON.parse(JSON.stringify(defaultSchema))
        setOpenDialog(false)
        setEnumList(field_enumerate)
        setSelectedType("string")
    }

    // handle field id on change
    const handleOnBlurFieldId = (event) => {
        setFieldId(event.target.value)
        tempUISchema["fieldId"] = event.target.value
    }

    // handle change required check box
    const handleCheckBoxOnChange = () => {
        setRequiredChecked(prev => !prev)
    }

    // handle change required check box
    const handleEnumBoxOnChange = () => {
        setEnumChecked(prev => !prev)
    }

    return (
        <><Dialog
            open={openDialog}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                <div style={{ display: "inline-flex", width: "100%", verticalAlign: "middle" }}>
                    <AddIcon fontSize="large" color="primary" style={{ alignSelf: "center" }} />
                    <div style={{ width: "100%", alignSelf: "center" }}>
                        Add Element in "{UISchema !== undefined ? UISchema["title"] : schemaTitle}"
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
                            <TextField inputProps={{ maxLength: 12 }} required onBlur={event => handleOnBlurFieldId(event)} onChange={event => handleChangeUISchema(event, "fieldId")} style={{ marginTop: "20px" }} defaultValue={tempUISchema["fieldId"]} variant="outlined" fullWidth={true} label={"Field ID or Key"} />
                            <TextField onChange={event => handleChangeUISchema(event, "title")} style={{ marginTop: "10px" }} defaultValue={tempUISchema["title"]} variant="outlined" fullWidth={true} label={"Field Title"} />
                            <TextField onChange={event => handleChangeUISchema(event, "description")} style={{ marginTop: "10px" }} defaultValue={tempUISchema["description"]} variant="outlined" fullWidth={true} label={"Field Description"} multiline rows={3} />
                            <TextField
                                onChange={event => handleChangeUISchema(event, "type")}
                                style={{ marginTop: "10px" }}
                                defaultValue={selectedType}
                                select
                                fullWidth={true}
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
                            {selectedType === "string" ?
                                <>
                                    <FormControlLabel control={<Checkbox onChange={() => handleEnumBoxOnChange()} checked={enumChecked} />} label="Enumerated" />
                                    <div style={{ marginTop: "10px", marginBottom: "10px" }}>
                                        {enumChecked ? <TextField defaultValue={enumList !== undefined ? enumList : ""} onChange={handleOnChangeListField} variant="outlined" fullWidth={true} label="Enumerate List" multiline rows={4} /> : null}
                                    </div>
                                </> : null}
                        </FormControl>
                    </div>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => handleCancelEdit()} color="secondary">
                    Cancel
                </Button>
                <Button onClick={() => handleUpdateSchemaOnClick()} color="primary" autoFocus>
                    ADD
                </Button>
            </DialogActions>
        </Dialog>
        </>

    )
};

export default AddElement;