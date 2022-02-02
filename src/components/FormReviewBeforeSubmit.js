import React, { useState } from "react";
import { makeStyles } from '@material-ui/core/styles';
import Divider from '@material-ui/core/Divider';
import { TextField } from '@material-ui/core';
import { IconButton, Button } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import CloseIcon from '@material-ui/icons/Close';
import { Menu, MenuItem } from "@material-ui/core";
const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
    heading: {
        color: 'rgba(82, 94, 103, 1)',
        fontSize: theme.typography.pxToRem(25),
        fontWeight: theme.typography.fontWeightRegular,
    },
}));


const FormReviewBeforeSubmit = ({ onlineMode, openFormReviewDialog, setOpenFormReviewDialog, descriptionList, setOpenFunctions }) => {

    // for dropdown buttons
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    }; //

    return (<>
        <Dialog
            onClose={() => setOpenFormReviewDialog(false)}
            maxWidth="md"
            fullWidth={true}
            open={openFormReviewDialog}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                <div style={{ display: "inline-flex", width: "100%", verticalAlign: "middle" }}>
                    <div style={{ width: "100%", alignSelf: "center" }}>
                        Check your filled form before submitting.
                    </div>
                    <IconButton onClick={() => setOpenFormReviewDialog(false)}><CloseIcon fontSize="large" color="secondary" /></IconButton>
                </div>
            </DialogTitle>
            <Divider />
            <DialogContent>
                <div dangerouslySetInnerHTML={{ __html: descriptionList }}></div>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpenFormReviewDialog(false)} color="secondary">
                    Cancel
                </Button>
                <Button
                    disabled={!onlineMode}
                    style={{ float: "right", marginRight: "5px" }}
                    id="demo-positioned-button"
                    aria-controls={open ? "demo-positioned-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? "true" : undefined}
                    onClick={handleClick}
                    variant="contained"
                    color="primary"
                >
                    Submit
                </Button>
                <Menu
                    id="demo-positioned-menu"
                    aria-labelledby="demo-positioned-button"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: "top",
                        horizontal: "left",
                    }}
                    transformOrigin={{
                        vertical: "top",
                        horizontal: "left",
                    }}
                >
                    <MenuItem onClick={() => {
                        setOpenFunctions.setOpenCreateElabFTWExperimentDialog(true);
                        setOpenFormReviewDialog(false);
                    }} >
                        Create eLabFTW Experiment
                    </MenuItem>
                    <MenuItem >
                        Submit SEM Request Form
                    </MenuItem>
                </Menu>
            </DialogActions>
        </Dialog>
    </>);
};

export default FormReviewBeforeSubmit;