import React from "react";
import Divider from '@material-ui/core/Divider';
import { TextField } from '@material-ui/core';
import { IconButton } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import CloseIcon from '@material-ui/icons/Close';
import Button from "@material-ui/core/Button";
import { Route } from 'react-router-dom'
import { Tooltip } from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import Cowboy from "../assets/cowboy-style.png"
import AdamantHeader from "../assets/adamant-header-5.svg"

const ChooseUseCasesDialog = ({ openUseCasesDialog, setOpenUseCasesDialog }) => {

    //onClose={() => setOpenUseCasesDialog(false)}

    return (<>
        <Dialog
            maxWidth={false}
            fullWidth={false}
            open={openUseCasesDialog}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            {/*
            <DialogTitle id="alert-dialog-title">
                <div style={{ display: "inline-flex", width: "100%", verticalAlign: "middle" }}>
                    <div style={{ fontSize: "30px", width: "100%", alignSelf: "center" }}>
                        What would you like to do?
                    </div>
                    <IconButton onClick={() => setOpenUseCasesDialog(false)}><CloseIcon fontSize="large" color="secondary" /></IconButton>
                </div>
            </DialogTitle>
            <Divider />
            */}
            <DialogContent>
                <div style={{ fontSize: "20px", padding: "10px" }}>
                    What would you like to do?
                </div>
                <div style={{ padding: "10px" }}>
                    <Divider />
                </div>
                <div
                    style={{
                        display: "flex",
                        width: "auto",
                        textAlign: "center",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "10px 10px 0px 10px",
                    }}
                >
                    <div style={{ width: "350px" }}>
                        <Tooltip
                            placement="top"
                            title={<h2 style={{ color: "lightblue" }}>Basically closing this dialog if you click here and use Adamant as it is.</h2>}
                        >
                            <Button onClick={() => setOpenUseCasesDialog(false)} variant="contained" style={{ height: "340px", width: "340px" }}>
                                <div>
                                    <div style={{ fontWeight: "bold" }}>
                                        Metadata and schema creation with
                                    </div>
                                    <img
                                        style={{ width: "300px", borderRadius: "5px" }}
                                        alt="header"
                                        src={AdamantHeader}
                                    />
                                </div>
                            </Button>
                        </Tooltip>
                    </div>
                    <div style={{ width: "350px" }}>
                        <Route render={({ history }) => (
                            <Tooltip
                                placement="top"
                                title={<h2 style={{ color: "lightblue" }}>Click here if you'd like to request an analysis.</h2>}
                            >
                                <Button onClick={() => { history.push('/request-job') }} variant="contained" style={{ fontWeight: "bold", height: "165px", width: "340px", marginBottom: "5px" }}>Request an Analysis</Button>
                            </Tooltip>)} />
                        <Route render={({ history }) => (
                            <Tooltip
                                placement="top"
                                title={<h2 style={{ color: "lightblue" }}>If you are an operator, click here to process a request.</h2>}
                            >
                                <Button onClick={() => { history.push('/process-request') }} variant="contained" style={{ fontWeight: "bold", height: "165px", width: "340px", marginTop: "5px" }}>Process a Request</Button></Tooltip>)} />
                    </div>
                </div>
            </DialogContent>
            <DialogActions>
            </DialogActions>
        </Dialog>
    </>);
};

export default ChooseUseCasesDialog;