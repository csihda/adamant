import React, { useContext, useState, useCallback, useEffect } from "react";
//import { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ElementRenderer from "./ElementRenderer";
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import { Button } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import AddIcon from "@material-ui/icons/AddBox";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { FormContext } from '../FormContext';
import DragHandleIcon from "@material-ui/icons/DragIndicator";
import UploadDataIcon from '@mui/icons-material/UploadFile';
import { ReactComponent as JsonIcon } from '../assets/json-file-svgrepo-com.svg'
import RevertIvon from "@material-ui/icons/History";
import AddElement from "./AddElement";
import EditSchemaHeader from "./EditSchemaHeader";
import JSONSchemaViewerDialog from "./JSONSchemaViewerDialog";
import { Tooltip } from "@material-ui/core";
import { useDropzone } from "react-dropzone";
import { ToastContainer, toast } from "react-toastify";
import fillForm from "./utils/fillForm";

const checkFormDataValidity = (file) => {
    let validity = false
    let message = `INVALID TYPE!\n Form data must be of a json file type.`
    if (file[0].type === "application/json") {
        validity = true;
        message = "Form data is of a valid file type."
    }
    return [validity, message]
}

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

const FormRenderer = ({ revertAllChanges, schema, edit, originalSchema }) => {
    const { updateParent, convertedSchema, implementedFieldTypes } = useContext(FormContext);
    const [openDialogAddElement, setOpenDialogAddElement] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [openSchemaViewer, setOpenSchemaViewer] = useState(false);
    const [receivedData, setReceivedData] = useState()

    const classes = useStyles();

    // browse or drag&drop schema file
    const onDrop = useCallback(
        (acceptedFile) => {
            // process the schema, validation etc
            let validity = checkFormDataValidity(acceptedFile);
            if (validity[0] === false) {
                toast.error(
                    <div><strong>{validity[1]}</strong></div>,
                    {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: false,
                        progress: undefined,
                    }
                );
            } else {
                // read file and update receivedData
                const reader = new FileReader();
                reader.onabort = () => console.log("file reading was aborted");
                reader.onerror = () => console.log("file reading has failed");
                reader.onload = () => {
                    const binaryStr = reader.result;
                    const obj = JSON.parse(binaryStr);
                    setReceivedData(obj)
                }
                reader.readAsText(acceptedFile[0]);
            };
        },
        []
    );
    //

    // basically fill the form with the recieved data everytime we receive the data
    useEffect(() => {
        if (receivedData !== undefined) {
            let newValue = { ...convertedSchema };

            //fills this converted schema with the received data
            console.log("before filling:\n", JSON.parse(JSON.stringify(newValue)))
            fillForm(newValue["properties"], receivedData);
            console.log("filled form:\n", newValue);

            updateParent(newValue);
        }
    }, [receivedData])

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        multiple: false,
    });

    // deconstruct
    const { properties, title, description, required, $schema, id } = schema ?? {}

    // update the order in properties on drag end
    const handleOnDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(properties);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        let value = { ...convertedSchema };
        value["properties"] = items;
        updateParent(value);
    }

    /*
    console.log("converted:", convertedSchema)
    let deconvertedSchema = JSON.parse(JSON.stringify(convertedSchema))
    deconvertedSchema["properties"] = array2object(convertedSchema["properties"])
    console.log("deconverted:", deconvertedSchema)
    */

    // default schema for add new element
    let defaultSchema = {}

    return (<>
        <div style={{ width: "100%", paddingLeft: "10px", paddingRight: "10px" }}>
            <div style={{ paddingTop: "10px", paddingBottom: "10px", display: 'inline-flex', width: '100%' }}>
                <Typography className={classes.heading} style={{ width: "100%" }}>{title}</Typography>
                <Tooltip placement="top" title="View JSON Schema for this form">
                    <Button onClick={() => setOpenSchemaViewer(true)} style={{ marginLeft: "5px" }}><JsonIcon style={{ height: "22px" }} /></Button>
                </Tooltip>
                <Tooltip placement="top" title="Upload input data for this form">
                    <Button style={{ marginLeft: "5px" }}{...getRootProps()}>
                        <input {...getInputProps()} />
                        <UploadDataIcon />
                    </Button>
                </Tooltip>
                {edit ? <>
                    <Tooltip placement="top" title="Edit json schema header">
                        <Button onClick={() => setOpenDialog(true)} style={{ marginLeft: "5px" }}>
                            <EditIcon color="primary" />
                        </Button>
                    </Tooltip>
                    <Tooltip placement="top" title="Revert all changes made to this form">
                        <Button onClick={() => revertAllChanges()} style={{ marginLeft: "5px" }}>
                            <RevertIvon color="primary" />
                        </Button>
                    </Tooltip>
                </> : null}
            </div>
            <Divider />
            <Typography>{description}</Typography>
            <DragDropContext onDragEnd={handleOnDragEnd}>
                <Droppable droppableId="forms">
                    {(provided) => (
                        <form {...provided.droppableProps} ref={provided.innerRef}>
                            {Object.keys(properties).map((item, index) => {
                                return (
                                    <Draggable isDragDisabled={!edit} key={properties[item]["fieldKey"]} draggableId={properties[item]["fieldKey"]} index={index}>
                                        {(provided) => (
                                            <div {...provided.draggableProps} ref={provided.innerRef}>
                                                <div style={{ display: "flex" }}>
                                                    {edit ? <div style={{ width: "20px", marginTop: "10px", height: "30px" }} {...provided.dragHandleProps}>
                                                        <Tooltip placement="top" title={`Drag & drop to adjust the order of this field`}>
                                                            <DragHandleIcon fontSize="small" />
                                                        </Tooltip>
                                                    </div> : null}
                                                    <ElementRenderer schema={schema} path={"properties"} pathSchema={"properties"} fieldkey={properties[item]["fieldKey"]} fieldIndex={item} elementRequired={required} edit={edit} field={properties[item]} />
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                );
                            })}
                            {provided.placeholder}
                            {edit ? <div style={{ display: "flex", justifyContent: "right" }}>
                                <Tooltip placement="top" title={`Add a new element/field to this schema`}>
                                    <Button onClick={() => setOpenDialogAddElement(true)} style={{ marginLeft: "5px" }}><AddIcon color="primary" /> ADD ELEMENT</Button>
                                </Tooltip>
                            </div> : null}
                        </form>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
        {openDialogAddElement ? <AddElement openDialog={openDialogAddElement} setOpenDialog={setOpenDialogAddElement} defaultSchema={defaultSchema} schemaTitle={title} /> : null}
        {openDialog ? <EditSchemaHeader schemaID={id} title={title} description={description} schemaURI={$schema} openDialog={openDialog} setOpenDialog={setOpenDialog} /> : null}
        {openSchemaViewer ? <JSONSchemaViewerDialog
            openSchemaViewer={openSchemaViewer}
            setOpenSchemaViewer={setOpenSchemaViewer}
            jsonschema={originalSchema}
        /> : null}
        <ToastContainer />
    </>);
};

export default FormRenderer;