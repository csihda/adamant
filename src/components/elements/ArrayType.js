import React, { useState, useContext, useEffect } from "react";
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Accordion from "@material-ui/core/Accordion";
import { AccordionDetails, AccordionSummary } from '@material-ui/core';
import { Button } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import AddIcon from "@material-ui/icons/AddBox";
import DeleteIcon from "@material-ui/icons/Delete";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { FormContext } from "../../FormContext";
import DragHandleIcon from "@material-ui/icons/DragIndicator";
import deleteKey from "../utils/deleteKey";
import EditElement from "../EditElement";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ArrayItemRenderer from "./ArrayItemRenderer";
import generateUniqueID from "../utils/generateUniqueID";
import { Tooltip } from "@material-ui/core";

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

const ArrayType = ({ field_uri, value, pathFormData, path, pathSchema, field_required, field_key, field_index, edit, field_label, field_description, field_items, field_prefixItems }) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [expand, setExpand] = useState(true); // set to "true" for normally open accordion
    const { updateParent, convertedSchema, handleDataInput, handleDataDelete, handleConvertedDataInput } = useContext(FormContext);
    const [inputItems, setInputItems] = useState([]);
    const [dataInputItems, setDataInputItems] = useState([]);
    // clean up empty strings in the paths
    path = path.split(".")
    path = path.filter(e => e)
    path = path.join(".")
    pathFormData = pathFormData.split(".")
    pathFormData = pathFormData.filter(e => e)
    pathFormData = pathFormData.join(".")

    // This is to expand or contract the accordion, because normally open is used 
    const expandOnChange = () => {
        const value = expand
        setExpand(!value)
    };


    useEffect(() => {
        if (value !== undefined) {
            if (field_prefixItems === undefined & field_items !== undefined) {
                if (Object.keys(field_items).length === 0) {
                    // create field_items if items is empty
                    let items = [];
                    for (let i = 0; i < value.length; i++) {
                        field_items = { type: "string", field_key: `${generateUniqueID()}` }
                        items.push(field_items);
                    }
                    setInputItems(items);
                    setDataInputItems(value);
                } else {
                    // use existing schema if items is not empty
                    let items = [];
                    for (let i = 0; i < value.length; i++) {
                        let newFieldItems = JSON.parse(JSON.stringify(field_items))
                        newFieldItems["field_key"] = generateUniqueID();
                        items.push(newFieldItems);
                    }
                    setInputItems(items);
                    setDataInputItems(value);
                }
            }
        } else {
            setInputItems([]);
            setDataInputItems([])
        }
    }, [value])


    var required;
    if (field_required === undefined) {
        required = false;
    } else if (field_required.includes(field_key)) {
        required = true;
    };

    // update the order in properties on drag end
    const handleOnDragEnd = (result) => {
        if (!result.destination) return;

        // for schema
        let arr = inputItems
        const items = Array.from(arr);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setInputItems(items)

        // for data
        let arr2 = dataInputItems
        const items2 = Array.from(arr2);
        const [reorderedItem2] = items2.splice(result.source.index, 1);
        items2.splice(result.destination.index, 0, reorderedItem2);
        setDataInputItems(items2)

        // for form data
        handleDataInput(items2, pathFormData, "array");

        // conv. schema data
        handleConvertedDataInput(items2, path + ".value", "array")
    }

    // handle delete object UI
    const handleDeleteElement = () => {
        const value = deleteKey(convertedSchema, path)
        updateParent(value)

        handleDataDelete(pathFormData);
    }

    const classes = useStyles();

    // construct UI schema
    let UISchema = {
        "fieldKey": field_key,
        "title": field_label,
        "description": field_description,
        "items": field_items,
        "$id": field_uri,
        "type": "array",
        "value": value
    }

    // handle add array item
    const handleAddArrayItem = () => {
        if (field_prefixItems === undefined & field_items !== undefined) {
            if (Object.keys(field_items).length === 0) {
                // create field_items if items is empty
                field_items = { type: "string", field_key: `${generateUniqueID()}` }
                let arr = inputItems;
                const items = Array.from(arr);
                items.push(field_items);
                setInputItems(items);

                // push a new item for the data
                let arr2 = dataInputItems;
                const items2 = Array.from(arr2);
                items2.push("");
                setDataInputItems(items2)
            } else {
                // use existing schema if items is not empty
                let newFieldItems = JSON.parse(JSON.stringify(field_items))
                newFieldItems["field_key"] = generateUniqueID();
                let arr = inputItems;
                const items = Array.from(arr);
                items.push(newFieldItems);
                setInputItems(items);

                if (["string", "number", "integer", "boolean"].includes(newFieldItems["type"])) {
                    // push a new item for the data
                    let arr2 = dataInputItems;
                    const items2 = Array.from(arr2);
                    items2.push("");
                    setDataInputItems(items2)
                } else if (newFieldItems["type"] === "object") {
                    let arr2 = dataInputItems;
                    const items2 = Array.from(arr2);
                    items2.push({});
                    setDataInputItems(items2)
                }
            }
        }
    }

    // handle delete item
    const handleDeleteArrayItem = (index) => {
        // for schema
        let arr = inputItems
        const items = Array.from(arr);
        items.splice(index, 1);
        setInputItems(items)

        // for data
        let arr2 = dataInputItems;
        const items2 = Array.from(arr2);
        items2.splice(index, 1);
        setDataInputItems(items2)

        // for form data
        handleDataInput(items2, pathFormData, "array");
        // conv. schema data
        handleConvertedDataInput(items2, path + ".value", "array")
    }

    return (<>
        <div style={{ width: "100%", padding: "10px 0px 10px 0px" }}>
            <Accordion expanded={expand} >
                <AccordionSummary
                    expandIcon={
                        <Tooltip placement="top" title={`Collapse/Expand this container"`}>
                            <ExpandMoreIcon />
                        </Tooltip>}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    IconButtonProps={{
                        onClick: expandOnChange
                    }}
                >
                    <div style={{ paddingTop: "10px", paddingBottom: "10px", display: 'inline-flex', width: '100%' }}>
                        <div style={{ width: "100%" }}>
                            <Typography className={classes.heading}>{field_label + (required ? "*" : "")}</Typography>
                            {expand ? <div style={{ color: "gray" }}>
                                {field_description}
                            </div> : null}
                        </div>
                        <div>

                        </div>
                        {edit ? <>
                            <Tooltip placement="top" title={`Edit "${field_label}"`}>
                                <Button onClick={() => setOpenDialog(true)} style={{ marginLeft: "5px" }}><EditIcon color="primary" /></Button>
                            </Tooltip>
                            <Tooltip placement="top" title={`Remove "${field_label}"`}>
                                <Button onClick={() => handleDeleteElement()} style={{ marginLeft: "5px" }}><DeleteIcon color="secondary" /></Button>
                            </Tooltip>
                        </> : null}
                    </div>
                </AccordionSummary>
                <Divider />
                <AccordionDetails>
                    <DragDropContext onDragEnd={handleOnDragEnd}>
                        <Droppable droppableId="subforms">
                            {(provided) => (
                                <div style={{ width: "100%" }}  {...provided.droppableProps} ref={provided.innerRef}>
                                    {Object.keys(inputItems).map((item, index) => {
                                        return (
                                            <Draggable isDragDisabled={false} key={inputItems[index]["field_key"]} draggableId={inputItems[index]["field_key"]} index={index}>
                                                {(provided) => (
                                                    <div {...provided.draggableProps} ref={provided.innerRef}>
                                                        <div style={{ display: "flex" }}>
                                                            <div style={{ width: "20px", marginTop: "10px", height: "30px" }} {...provided.dragHandleProps}>
                                                                <Tooltip placement="top" title={`Drag & drop to adjust the order of this item`}>
                                                                    <DragHandleIcon fontSize="small" />
                                                                </Tooltip>
                                                            </div>
                                                            <ArrayItemRenderer value={value} pathSchema={pathSchema} pathFormData={pathFormData} dataInputItems={dataInputItems} setDataInputItems={setDataInputItems} field_label={field_label} field_items={field_items} edit={true} handleDeleteArrayItem={handleDeleteArrayItem} path={path} fieldIndex={index} fieldkey={inputItems[index]["field_key"]} type={inputItems[index]["type"]} />
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        );
                                    })}
                                    {provided.placeholder}
                                    <div style={{ display: "flex", justifyContent: "right" }}>
                                        <Button onClick={() => { handleAddArrayItem() }} style={{ fontSize: "12px", marginLeft: "5px", marginTop: "5px", height: "45px" }}><AddIcon style={{ paddingRight: "5px" }} fontSize="small" color="primary" /> Add Item</Button>
                                    </div>
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </AccordionDetails>
            </Accordion>
        </div>
        {openDialog ? <EditElement field_uri={field_uri} pathFormData={pathFormData} field_key={field_key} field_index={field_index} openDialog={openDialog} setOpenDialog={setOpenDialog} path={path} UISchema={UISchema} field_required={required} /> : null}
    </>
    );
};

export default ArrayType;