import React, { useContext, useState } from 'react'
import TextField from "@material-ui/core/TextField"
import { makeStyles } from '@material-ui/core/styles';
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

const EditElement = ({ enumerated, field_enumerate, field_required, field_id, UISchema, path, pathSchema, openDialog, setOpenDialog, defaultValue }) => {

    const [selectedType, setSelectedType] = useState(UISchema["type"])
    const [title, setTitle] = useState(UISchema["title"])
    const [fieldId, setFieldId] = useState(UISchema["fieldId"])
    const [description, setDescription] = useState(UISchema["description"])
    const [defValue, setDefValue] = useState(defaultValue)
    const { updateParent, convertedSchema, updateFormDataId } = useContext(FormContext);
    const [requiredChecked, setRequiredChecked] = useState(field_required === undefined ? false : field_required)
    const [enumChecked, setEnumChecked] = useState(enumerated === undefined ? false : enumerated)
    const [enumList, setEnumList] = useState(field_enumerate === undefined ? [] : field_enumerate);

    let tempUISchema = JSON.parse(JSON.stringify(UISchema))

    let notImplemented = false;
    if (!["string", "number", "integer", "object", "array", "boolean"].includes(UISchema["type"])) {
        notImplemented = true;
    }


    const datatypes = ["string", "number", "integer", "object", "array", "boolean"]


    const handleOnChangeListField = (event) => {
        setEnumList(event.target.value);
    }

    // save the change and update the UI
    const handleUpdateSchemaOnClick = () => {
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

        // check if fieldId already exist
        let existed = checkIfFieldIDExist(convertedSchema, path, fieldId)
        if (UISchema["fieldId"] !== fieldId) {
            if (existed) {
                alert("Field ID already exists!")
                return
            }
        }

        if (fieldId === undefined | fieldId.replace(/\s+/g, '') === "") {
            alert("Field ID must be defined!")
            return
        }

        tempUISchema["fieldId"] = fieldId;
        tempUISchema["type"] = selectedType;
        if (title !== undefined) { tempUISchema["title"] = title }
        if (description !== undefined) { tempUISchema["description"] = description }

        if (tempUISchema["type"] === "object" & tempUISchema["properties"] === undefined) {
            tempUISchema["properties"] = []
        }
        if (tempUISchema["type"] === "array" & tempUISchema["items"] === undefined) {
            tempUISchema["items"] = {}
        }
        if (!["string", "integer", "number"].includes(tempUISchema["type"])) {
            setEnumChecked(false);
        }
        const set = require("set-value");
        set(convertedSchema, path, tempUISchema)
        // update the required value
        const newConvertedSchema = updateRequired({ selectedType, path, requiredChecked, field_id, convertedSchema })
        // update enum
        if (["string", "integer", "number"].includes(tempUISchema["type"]) & enumChecked) {
            let newList = enumList

            switch (tempUISchema["type"]) {
                case 'string':
                    if (Array.isArray(newList)) {
                        set(newConvertedSchema, path + ".enumerate", newList)
                    } else {
                        newList = newList.replace(/\s*,\s*/g, ",")
                        set(newConvertedSchema, path + ".enumerate", newList.split(","))
                    }
                case 'integer':
                    if (Array.isArray(newList)) {
                        let parsed = newList.map(function (item) {
                            return parseInt(item, 10);
                        })
                        set(newConvertedSchema, path + ".enumerate", parsed)
                    } else {
                        newList = newList.replace(/\s*,\s*/g, ",")
                        let parsed = newList.split(",").map(function (item) {
                            return parseInt(item, 10);
                        })
                        set(newConvertedSchema, path + ".enumerate", parsed)
                    }
                case 'number':
                    if (Array.isArray(newList)) {
                        let parsed = newList.map(function (item) {
                            return parseFloat(item, 10);
                        })
                        set(newConvertedSchema, path + ".enumerate", parsed)
                    } else {
                        newList = newList.replace(/\s*,\s*/g, ",")
                        let parsed = newList.split(",").map(function (item) {
                            return parseFloat(item, 10);
                        })
                        set(newConvertedSchema, path + ".enumerate", parsed)
                    }
            }
        }
        // update main component
        updateParent(newConvertedSchema)
        setOpenDialog(false)

        //* update form data if fieldId change
        // update pathSchema with new fieldId
        updateFormDataId(field_id, fieldId, pathSchema, defaultValue)

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
                return setFieldId(event.target.value.replace(/ /g, "_"))
            case 'defaultValue':
                return setDefValue(event.target.value)
            default:
                return null;
        }
    }

    // cancel editing
    const handleCancelEdit = () => {
        tempUISchema = JSON.parse(JSON.stringify(UISchema))
        setOpenDialog(false)
        setEnumList(field_enumerate)
        setDefValue(defaultValue)
        setSelectedType(UISchema["type"])
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
        <>
            {notImplemented ?
                <Dialog
                    open={openDialog}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        <div style={{ display: "inline-flex", width: "100%", verticalAlign: "middle" }}>
                            <EditIcon fontSize="large" color="primary" style={{ alignSelf: "center" }} />
                            <div style={{ width: "100%", alignSelf: "center" }}>
                                Edit "{tempUISchema["title"]}"
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
                            Save
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
                            <EditIcon fontSize="large" color="primary" style={{ alignSelf: "center" }} />
                            <div style={{ width: "100%", alignSelf: "center" }}>
                                Edit "{tempUISchema["title"]}"
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
                                    <TextField margin="normal" required onChange={event => handleChangeUISchema(event, "fieldId")} style={{ marginTop: "20px" }} defaultValue={field_id} variant="outlined" fullWidth={true} label={"Field ID or Key"} helperText='A unique json key or id for this field. Usually short and no spaces (use "_" instead). Spaces are replaced automatically with "_" upon saving.' />
                                    <TextField margin="normal" onChange={event => handleChangeUISchema(event, "title")} style={{ marginTop: "10px" }} defaultValue={tempUISchema["title"]} variant="outlined" fullWidth={true} label={"Field Title"} helperText='Label or title of the field. For a field that requires a unit, the unit can be placed within a square bracket, e,g., "Chamber Pressure [Pa]".' />
                                    <TextField margin="normal" onChange={event => handleChangeUISchema(event, "description")} style={{ marginTop: "10px" }} defaultValue={tempUISchema["description"]} variant="outlined" fullWidth={true} label={"Field Description"} multiline rows={3} helperText='A detailed description of the field, how the input should be formated, etc.' />
                                    <TextField
                                        margin="normal"
                                        helperText='Data type of the field input.'
                                        onChange={event => handleChangeUISchema(event, "type")}
                                        style={{ marginTop: "10px" }}
                                        defaultValue={tempUISchema["type"]}
                                        select
                                        fullWidth={true}
                                        id={field_id}
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
                                    {["string", "integer", "number"].includes(selectedType) ?
                                        <>
                                            <FormControlLabel control={<Checkbox onChange={() => handleEnumBoxOnChange()} checked={enumChecked} />} label="Enumerated. Choose from an available list of inputs." />
                                            <div style={{ marginTop: "10px", marginBottom: "10px" }}>
                                                {enumChecked ? <TextField defaultValue={enumList !== undefined ? enumList : ""} onChange={handleOnChangeListField} variant="outlined" fullWidth={true} label="Enumerate List" multiline rows={4} helperText="A list of inputs separated by commas, e,g.: item 1, item 2, item 3. Make sure that the item data type matches the field input data type. Invalid items will be replaced with NaN upon saving." /> : null}
                                            </div>
                                        </> : null}
                                </FormControl>
                                <div style={{ paddingTop: "10px", paddingBottom: "10px" }}>
                                    <FormControl component="validation-related">
                                        <FormLabel style={{ color: "#01579b" }} component="legend">Validation Related:</FormLabel>
                                    </FormControl>
                                    <FormGroup>
                                        {selectedType === "array" ?
                                            <FormControlLabel control={<Checkbox onChange={() => handleCheckBoxOnChange()} checked={requiredChecked} />} label="Required. Checked means the field must be filled." />
                                            : null}
                                        {selectedType !== "object" & selectedType !== "array" & selectedType !== "boolean" ?
                                            <>
                                                <FormControlLabel control={<Checkbox onChange={() => handleCheckBoxOnChange()} checked={requiredChecked} />} label="Required. Checked means the field must be filled." />
                                                <TextField margin='normal' onChange={event => handleChangeUISchema(event, "defaultValue")} style={{ marginTop: "10px" }} defaultValue={defaultValue} variant="outlined" fullWidth={true} label={"Field Default Value"} helperText="Initial value of the field." />
                                            </>
                                            : null}
                                        {selectedType === "boolean" ?
                                            <>
                                                <TextField
                                                    margin='normal'
                                                    onChange={event => handleChangeUISchema(event, "defaultValue")}
                                                    style={{ marginTop: "20px" }}
                                                    defaultValue={defaultValue !== undefined ? defaultValue : ""}
                                                    select
                                                    fullWidth={true}
                                                    id={field_id}
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
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>}
        </>

    )
};

export default EditElement;