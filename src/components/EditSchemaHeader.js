import React, { useContext, useState } from 'react'
import TextField from "@material-ui/core/TextField"
import { Button } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import Divider from '@material-ui/core/Divider';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import { FormContext } from '../FormContext';
import { IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';


const EditSchemaHeader = ({ schemaID, title, description, schemaURI, openDialog, setOpenDialog }) => {

    const [_schemaID, _setSchemaID] = useState(schemaID);
    const [_title, _setTitle] = useState(title);
    const [_description, _setDescription] = useState(description);
    const [_schemaURI, _setSchemaURI] = useState(schemaURI);
    const { updateParent, convertedSchema } = useContext(FormContext);




    // save the change and update the UI
    const handleUpdateSchemaOnClick = () => {

        if (_schemaURI === undefined) {
            delete convertedSchema["$schema"]
        } else if (_schemaURI.replace(/\s+/g, '') === "") {
            delete convertedSchema["$schema"]
        } else {
            convertedSchema["$schema"] = _schemaURI
        };

        if (_schemaID === undefined) {
            delete convertedSchema["id"]
        } else if (_schemaID.replace(/\s+/g, '') === "") {
            delete convertedSchema["id"]
        } else {
            convertedSchema["id"] = _schemaID
        };

        if (_title === undefined) {
            delete convertedSchema["title"]
        } else if (_title.replace(/\s+/g, '') === "") {
            delete convertedSchema["title"]
        } else {
            convertedSchema["title"] = _title
        };

        if (_description === undefined) {
            delete convertedSchema["description"]
        } else if (_description.replace(/\s+/g, '') === "") {
            delete convertedSchema["description"]
        } else {
            convertedSchema["description"] = _description
        };

        updateParent(convertedSchema)
        setOpenDialog(false)
    }

    // change descriptor value
    const handleChangeUISchema = (event, keyword) => {

        switch (keyword) {
            case 'title':
                return _setTitle(event.target.value)
            case 'description':
                return _setDescription(event.target.value)
            case 'id':
                return _setSchemaID(event.target.value)
            case 'uri':
                return _setSchemaURI(event.target.value)
            default:
                return null;
        }
    }

    // cancel editing
    const handleCancelEdit = () => {
        _setDescription(description);
        _setSchemaID(schemaID);
        _setSchemaURI(schemaURI);
        _setTitle(title);
        setOpenDialog(false)
    }

    return (
        <><Dialog
            open={openDialog}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                <div style={{ display: "inline-flex", width: "100%", verticalAlign: "middle" }}>
                    <EditIcon fontSize="large" color="primary" style={{ alignSelf: "center" }} />
                    <div style={{ width: "100%", alignSelf: "center" }}>
                        Edit schema "{title}"
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
                            <TextField margin='normal' onChange={event => handleChangeUISchema(event, "uri")} style={{ marginTop: "20px" }} defaultValue={schemaURI} variant="outlined" fullWidth={true} label={"Schema URI"} />
                            <TextField margin='normal' onChange={event => handleChangeUISchema(event, "id")} style={{ marginTop: "10px" }} defaultValue={schemaID} variant="outlined" fullWidth={true} label={"Schema ID"} />
                            <TextField margin='normal' onChange={event => handleChangeUISchema(event, "title")} style={{ marginTop: "10px" }} defaultValue={title} variant="outlined" fullWidth={true} label={"Schema Title"} />
                            <TextField margin='normal' onChange={event => handleChangeUISchema(event, "description")} style={{ marginTop: "10px" }} defaultValue={description} variant="outlined" fullWidth={true} label={"Schema Description"} multiline rows={3} />
                        </FormControl>
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
        </Dialog>
        </>

    )
};

export default EditSchemaHeader;