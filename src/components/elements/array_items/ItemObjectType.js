import React, { useContext, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import ElementRenderer from "../../ElementRenderer";
import Divider from '@material-ui/core/Divider';
import Accordion from "@material-ui/core/Accordion";
import { AccordionDetails, AccordionSummary } from '@material-ui/core';
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { Button } from '@material-ui/core';
import DeleteIcon from "@material-ui/icons/Delete";
import { FormContext } from "../../../FormContext"


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


const ItemObjectType = ({ dataInputItems, setDataInputItems, field_label, pathSchema, field_required, field_items, field_type, edit, index, field_id, handleDeleteArrayItem }) => {
    const [expand, setExpand] = useState(true); // set to "true" for normally open accordion
    const { updateParent, convertedSchema } = useContext(FormContext);
    let objectIndex = index;
    let field_properties = field_items["properties"]
    let withinArray = true;

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
                            {field_label + " #" + parseInt(index + 1)}
                        </div>
                        {edit ? <Button onClick={() => handleDeleteArrayItem(index)} style={{ marginLeft: "5px" }}><DeleteIcon color="secondary" /></Button> : null}
                    </div>
                </AccordionSummary>
                <Divider />
                <AccordionDetails>
                    <div style={{ width: "100%" }}>
                        {Object.keys(field_properties).map((item, index) => {
                            let tempField = JSON.parse(JSON.stringify(field_properties[item]));
                            if (tempField["enum"]) {
                                tempField["enumerate"] = tempField["enum"]
                            }
                            return (
                                <div key={item} style={{ display: "flex" }}>
                                    <ElementRenderer pathSchema={pathSchema} withinArray={withinArray} dataInputItems={dataInputItems} setDataInputItems={setDataInputItems} fieldId={item} fieldIndex={objectIndex} elementRequired={field_required} edit={false} field={tempField} />
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
