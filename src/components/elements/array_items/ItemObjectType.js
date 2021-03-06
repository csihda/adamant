import React, { useState } from 'react'
import ElementRenderer from "../../ElementRenderer";
import Divider from '@material-ui/core/Divider';
import Accordion from "@material-ui/core/Accordion";
import { AccordionDetails, AccordionSummary } from '@material-ui/core';
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { Button } from '@material-ui/core';
import DeleteIcon from "@material-ui/icons/Delete";

const ItemObjectType = ({ path, dataInputItems, setDataInputItems, field_label, pathFormData, field_required, field_items, field_type, edit, index, field_key, handleDeleteArrayItem }) => {
    const [expand, setExpand] = useState(dataInputItems[index]["adamant-ui-specific-expand"] === undefined ? true : dataInputItems[index]["adamant-ui-specific-expand"]); // set to "true" for normally open accordion
    let objectIndex = index;
    let field_properties = field_items["properties"]
    let withinArray = true;
    let withinObject = true;


    // This is to expand or contract the accordion, because normally open is used 
    const expandOnChange = () => {
        const value = expand
        setExpand(!value)

        let newVal = [...dataInputItems]
        newVal[index]["adamant-ui-specific-expand"] = !value

        setDataInputItems(newVal)
    };

    //const classes = useStyles();

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
                            if (tempField["default"]) {
                                tempField["defaultValue"] = tempField["default"]
                            }
                            return (
                                <div key={item} style={{ display: "flex" }}>
                                    <ElementRenderer withinObject={withinObject} path={path} pathFormData={pathFormData} withinArray={withinArray} dataInputItems={dataInputItems} setDataInputItems={setDataInputItems} fieldkey={item} fieldIndex={objectIndex} elementRequired={field_items["required"]} edit={false} field={tempField} />
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
