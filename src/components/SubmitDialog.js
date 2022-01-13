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
import { IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';


const SubmitDialog = ({ setTags, setExperimentTitle, setToken, token, setOpenSubmitDialog, openSubmitDialog, createExperimentELabFTW }) => {

    // cancel submit
    const handleCancelEdit = () => {
        setOpenSubmitDialog(false)
    }

    return (
        <><Dialog
            open={openSubmitDialog}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                <div style={{ display: "inline-flex", width: "100%", verticalAlign: "middle" }}>
                    <div style={{ width: "100%", alignSelf: "center" }}>
                        Create eLabFTW Experiment
                    </div>
                    <IconButton onClick={() => handleCancelEdit()}><CloseIcon fontSize="large" color="secondary" /></IconButton>
                </div>
            </DialogTitle>
            <Divider />
            <DialogContent>
                <DialogContentText id="alert-dialog-description" component="span">
                    <div>
                        <FormControl component="widget-type">
                            <FormLabel style={{ color: "#01579b" }} component="legend">eLabFTW</FormLabel>
                            <TextField margin='normal' onChange={event => setToken(event.target.value)} style={{ marginTop: "20px" }} variant="outlined" fullWidth={true} label={"eLabFTW Token"} />
                            <TextField margin='normal' onBlur={event => setExperimentTitle(event.target.value)} style={{ marginTop: "10px" }} variant="outlined" fullWidth={true} label={"Title"} />
                            <TextField margin='normal' style={{ marginTop: "10px" }} variant="outlined" fullWidth={true} label={"Tags"} />
                        </FormControl>
                    </div>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => handleCancelEdit()} color="secondary">
                    Cancel
                </Button>
                <Button disabled={token.trim() === "" | token === undefined ? true : false} onClick={() => createExperimentELabFTW()} color="primary" autoFocus>
                    Create Experiment
                </Button>
            </DialogActions>
        </Dialog>
        </>

    )
};

export default SubmitDialog;