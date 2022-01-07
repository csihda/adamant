import React, { useState, useContext } from "react";
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
import { IconButton } from "@material-ui/core";
import { TextField } from "@material-ui/core";
import ElementRenderer from "../ElementRenderer";

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

const AnyOfKeyword = ({ pathSchema, path, field_required, field_id, field_index, edit, field_label, field_description, field_prefixItems, anyOf_list }) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [expand, setExpand] = useState(true); // set to "true" for normally open accordion
    const { updateParent, convertedSchema, handleDataInput, handleDataDelete } = useContext(FormContext);
    const [field_items, setField_items] = useState(Array.isArray(anyOf_list) & anyOf_list[0]["type"] === "array" ? anyOf_list[0]["items"] : anyOf_list[0])
    const [globalIndex, setGlobalIndex] = useState(0);
    const [inputItems, setInputItems] = useState([]);
    const [dataInputItems, setDataInputItems] = useState([]);


    // This is to expand or contract the accordion, because normally open is used 
    const expandOnChange = () => {
        const value = expand
        setExpand(!value)
    };

    let schemaList = Array(anyOf_list.length).fill().map((x, i) => i)

    // select existing schema option from anyOf list
    const handleChooseAnyOfSchema = (event) => {
        // reset states
        setDataInputItems([]);
        setInputItems([]);

        // get rid of the current value
        handleDataDelete(pathSchema)

        const index = parseInt(event.target.value)
        setGlobalIndex(index)
        if (anyOf_list[index]["type"] === "array") {
            setField_items(anyOf_list[index]["items"])
        } else {
            setField_items(anyOf_list[index])
        }
    }

    var required;
    if (field_required === undefined) {
        required = false;
    } else if (field_required.includes(field_id)) {
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
        handleDataInput(items2, pathSchema, "array");
    }

    // handle delete object UI
    const handleDeleteElement = () => {
        const value = deleteKey(convertedSchema, path)
        updateParent(value)

        handleDataDelete(pathSchema);
    }


    const classes = useStyles();

    /*
    // construct UI schema
    let UISchema = {
        "fieldId": field_id,
        "title": field_label,
        "description": field_description,
        "items": field_items,
        "type": [anyOf_list[globalIndex]["type"]]
    }*/

    let UISchema = {
        "fieldId": field_id,
        "title": field_label,
        "description": field_description,
        "items": field_items,
        "type": "anyOf"
    }

    // handle add array item
    const handleAddArrayItem = () => {
        if (field_prefixItems === undefined & field_items !== undefined) {
            if (Object.keys(field_items).length === 0) {
                // create field_items if items is empty
                field_items = { type: "string", field_id: `${generateUniqueID()}` }
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
                newFieldItems["field_id"] = generateUniqueID();
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
        handleDataInput(items2, pathSchema, "array");
    }

    return (<>
        <div style={{ width: "100%", padding: "10px 0px 10px 0px" }}>
            <Accordion expanded={expand} >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
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
                        {edit ? <><Button onClick={() => setOpenDialog(true)} style={{ marginLeft: "5px" }}><EditIcon color="primary" /></Button>
                            <Button onClick={() => handleDeleteElement()} style={{ marginLeft: "5px" }}><DeleteIcon color="secondary" /></Button></> : null}
                    </div>
                </AccordionSummary>
                <Divider />
                <TextField
                    onChange={(event) => handleChooseAnyOfSchema(event)}
                    style={{ width: "220px", marginLeft: "10px", marginTop: "20px" }}
                    fullWidth={false}
                    select
                    id={"select-schema"}
                    label={"Choose a subschema"}
                    SelectProps={{ native: true }}
                >
                    {schemaList.map((content, index) => (
                        <option key={index} value={content}>
                            {content}
                        </option>
                    ))}
                </TextField>
                {anyOf_list[globalIndex]["type"] === "array" ?
                    <AccordionDetails>
                        <DragDropContext onDragEnd={handleOnDragEnd}>
                            <Droppable droppableId="subforms">
                                {(provided) => (
                                    <div style={{ width: "100%" }}  {...provided.droppableProps} ref={provided.innerRef}>
                                        {Object.keys(inputItems).map((item, index) => {
                                            return (
                                                <Draggable key={inputItems[index]["field_id"]} draggableId={inputItems[index]["field_id"]} index={index}>
                                                    {(provided) => (
                                                        <div {...provided.draggableProps} ref={provided.innerRef}>
                                                            <div style={{ display: "flex" }}>
                                                                <div style={{ width: "20px", marginTop: "10px", height: "30px" }} {...provided.dragHandleProps}>
                                                                    <DragHandleIcon fontSize="small" />
                                                                </div>
                                                                {/*
                                                                <ArrayItemRenderer field_label={field_label} field_items={inputItems[index]} edit={true} handleDeleteArrayItem={handleDeleteArrayItem} path={path + ".properties"} fieldIndex={index} fieldId={inputItems[index]["field_id"]} type={inputItems[index]["type"]} />
                                                                */}

                                                                <ArrayItemRenderer pathSchema={pathSchema} dataInputItems={dataInputItems} setDataInputItems={setDataInputItems} field_label={field_label} field_items={field_items} edit={true} handleDeleteArrayItem={handleDeleteArrayItem} path={path + ".properties"} fieldIndex={index} fieldId={inputItems[index]["field_id"]} type={inputItems[index]["type"]} />
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            );
                                        })}
                                        {provided.placeholder}
                                        <div style={{ display: "flex", justifyContent: "right" }}>
                                            <IconButton onClick={() => { handleAddArrayItem() }} style={{ marginLeft: "5px", marginTop: "5px", height: "45px" }}><AddIcon fontSize="small" color="primary" /></IconButton>
                                        </div>
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </AccordionDetails>
                    :
                    <div style={{ padding: "10px" }}>
                        <ElementRenderer path={path} fieldId={field_id} fieldIndex={0} elementRequired={field_required} edit={false} field={field_items} />
                    </div>}
            </Accordion>
        </div>
        {openDialog ? <EditElement anyOf_list={anyOf_list} pathSchema={pathSchema} field_id={field_id} field_index={field_index} openDialog={openDialog} setOpenDialog={setOpenDialog} path={path} UISchema={UISchema} field_required={required} /> : null}
    </>
    );
};

export default AnyOfKeyword;