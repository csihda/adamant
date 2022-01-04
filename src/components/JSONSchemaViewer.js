import React, { useState } from "react";
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Accordion from "@material-ui/core/Accordion";
import { AccordionDetails, AccordionSummary } from '@material-ui/core';
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
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


const JSONSchemaViewer = ({ jsonschema }) => {
    //console.log("path:", path)
    const [expand, setExpand] = useState(false); // set to "true" for normally open accordion

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
                    IconButtonProps={{
                        onClick: expandOnChange
                    }}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <div style={{ paddingTop: "10px", paddingBottom: "10px", display: 'inline-flex', width: '100%' }}>
                        <div>
                            <Typography className={classes.heading}>JSON Schema Viewer</Typography>
                        </div>
                    </div>
                </AccordionSummary>
                <Divider />
                <AccordionDetails>
                    <div >
                        <pre style={{ overflowX: "auto", whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
                            {JSON.stringify(jsonschema, null, 2)}
                        </pre>
                    </div>
                </AccordionDetails>
            </Accordion>
        </div>
    </>);
};

export default JSONSchemaViewer;