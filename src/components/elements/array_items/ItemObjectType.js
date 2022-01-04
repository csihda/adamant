import React, { useContext, useState } from 'react'
import TextField from "@material-ui/core/TextField"
import { makeStyles } from '@material-ui/core/styles';
import { IconButton } from '@material-ui/core';
import { Typography } from '@material-ui/core';
import ElementRenderer from "../../ElementRenderer";
import Divider from '@material-ui/core/Divider';
import Accordion from "@material-ui/core/Accordion";
import { AccordionDetails, AccordionSummary } from '@material-ui/core';
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { Button } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import AddIcon from "@material-ui/icons/AddBox";
import DeleteIcon from "@material-ui/icons/Delete";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { FormContext } from "../../../FormContext"
import DragHandleIcon from "@material-ui/icons/DragIndicator";
import deleteKey from "../../utils/deleteKey";


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

const style = {
    paddingTop: "10px",
    paddingBottom: "10px",
}


const ItemObjectType = ({ path, field_required, field_items, field_type, edit, index, field_id, handleDeleteArrayItem }) => {
    const [expand, setExpand] = useState(true); // set to "true" for normally open accordion
    const { updateParent, convertedSchema } = useContext(FormContext);
    let field_properties = field_items["properties"]

    // This is to expand or contract the accordion, because normally open is used 
    const expandOnChange = () => {
        const value = expand
        setExpand(!value)
    };


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
                        <div style={{ width: "100%", justifySelf: "center" }}>
                            ITEM {index + 1}
                        </div>
                        {edit ? <Button onClick={() => handleDeleteArrayItem(index)} style={{ marginLeft: "5px" }}><DeleteIcon color="secondary" /></Button> : null}
                    </div>
                </AccordionSummary>
                <Divider />
                <AccordionDetails>
                    <div style={{ width: "100%" }}>
                        {Object.keys(field_properties).map((item, index) => {
                            let tempField = field_properties[item]
                            if (tempField["enum"]) {
                                tempField["enumerate"] = tempField["enum"]
                            }
                            return (
                                <div style={{ display: "flex" }}>
                                    <ElementRenderer path={path + ".properties"} fieldId={item} fieldIndex={index} elementRequired={field_required} edit={false} field={tempField} />
                                </div>
                            )
                        })
                        }
                    </div>
                </AccordionDetails>
            </Accordion>
        </div >
    </>);

};

export default ItemObjectType;
