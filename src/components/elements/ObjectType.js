import React, { useState, useContext } from "react";
import { makeStyles } from '@material-ui/core/styles';
import ElementRenderer from "../ElementRenderer";
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Accordion from "@material-ui/core/Accordion";
import { AccordionDetails, AccordionSummary } from '@material-ui/core';
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { Button } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import AddIcon from "@material-ui/icons/AddBox";
import DeleteIcon from "@material-ui/icons/Delete";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { FormContext } from "../../FormContext";
import DragHandleIcon from "@material-ui/icons/DragIndicator";
import deleteKey from "../utils/deleteKey";
import EditElement from "../EditElement";
import AddElement from "../AddElement";


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

const ObjectType = ({ path, pathSchema, field_required, field_id, field_index, edit, field_label, field_description, field_properties }) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [openDialogAddElement, setOpenDialogAddElement] = useState(false);
    const [expand, setExpand] = useState(true); // set to "true" for normally open accordion
    const { updateParent, convertedSchema, handleDataDelete } = useContext(FormContext);

    // This is to expand or contract the accordion, because normally open is used 
    const expandOnChange = () => {
        const value = expand
        setExpand(!value)
    };

    // update the order in properties on drag end
    const handleOnDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(field_properties);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        const set = require("set-value");
        let value = { ...convertedSchema }
        set(convertedSchema, path + ".properties", items)
        updateParent(value);
    }

    // handle delete object UI
    const handleDeleteElement = () => {
        const value = deleteKey(convertedSchema, path)
        updateParent(value)

        handleDataDelete(pathSchema);
    }

    // construct UI schema
    let UISchema = {
        "fieldId": field_id,
        "title": field_label,
        "description": field_description,
        "properties": field_properties,
        "type": "object"
    }

    // default schema for add new element
    let defaultSchema = {}

    const classes = useStyles();

    return (<>
        <div style={{ width: "100%", padding: "10px 0px 10px 0px" }}>
            <Accordion expanded={expand} >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    style={{ height: "auto" }}
                    IconButtonProps={{
                        onClick: expandOnChange
                    }}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <div style={{ paddingTop: "10px", paddingBottom: "10px", display: 'inline-flex', width: '100%' }}>
                        <div style={{ width: "100%" }}>
                            <Typography className={classes.heading}>{field_label}</Typography>
                            {expand ? <div style={{ color: "gray" }}>
                                {field_description}
                            </div> : null}
                        </div>
                        <div>

                        </div>
                        {edit ? <><Button onClick={() => setOpenDialog(true)} style={{ marginLeft: "5px" }}><EditIcon color="primary" /></Button>
                            <Button onClick={() => handleDeleteElement()} style={{ marginLeft: "5px" }}><DeleteIcon color="secondary" /></Button></> : null}
                    </div>
                </AccordionSummary>
                <Divider />
                <AccordionDetails>
                    <DragDropContext onDragEnd={handleOnDragEnd}>
                        <Droppable droppableId="subforms">
                            {(provided) => (
                                <div style={{ width: "100%" }}  {...provided.droppableProps} ref={provided.innerRef}>
                                    {Object.keys(field_properties).map((item, index) => {
                                        return (
                                            <Draggable isDragDisabled={!edit} key={field_properties[item]["fieldId"]} draggableId={field_properties[item]["fieldId"]} index={index}>
                                                {(provided) => (
                                                    <div {...provided.draggableProps} ref={provided.innerRef}>
                                                        <div style={{ display: "flex" }}>
                                                            {edit ? <div style={{ width: "20px", marginTop: "10px", height: "30px" }} {...provided.dragHandleProps}>
                                                                <DragHandleIcon fontSize="small" />
                                                            </div> : null}
                                                            <ElementRenderer path={path + ".properties"} pathSchema={pathSchema} fieldId={field_properties[item]["fieldId"]} fieldIndex={item} elementRequired={field_required} edit={edit} field={field_properties[item]} />
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        );
                                    })}
                                    {provided.placeholder}
                                    {edit ? <div style={{ display: "flex", justifyContent: "right" }}>
                                        <Button onClick={() => setOpenDialogAddElement(true)} style={{ marginLeft: "5px" }}><AddIcon color="primary" /> ADD ELEMENT</Button>
                                    </div> : null}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </AccordionDetails>
            </Accordion>
        </div>
        {openDialog ? <EditElement pathSchema={pathSchema} field_id={field_id} field_index={field_index} openDialog={openDialog} setOpenDialog={setOpenDialog} path={path} UISchema={UISchema} /> : null}
        {openDialogAddElement ? <AddElement openDialog={openDialogAddElement} setOpenDialog={setOpenDialogAddElement} path={path} defaultSchema={defaultSchema} UISchema={UISchema} /> : null}
    </>);
};

export default ObjectType;