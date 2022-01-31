import React, { useState, useContext } from "react";
import { FormLabel, FormHelperText, FormControl } from '@material-ui/core';


const AnyOfKeywordPlaceHolder = ({ field_label, field_description }) => {
    const [descriptionText, setDescriptionText] = useState(field_description)


    return (<>
        <div style={{ paddingTop: "10px", paddingLeft: "15px", width: "100%" }}>
            <FormControl >
                <FormLabel>{field_label === undefined ? "" : field_label + ":"}</FormLabel>
                <div style={{ paddingBottom: "5px", paddingTop: "10px", textAlign: "center", width: "100%" }}>
                    "AnyOf" keyword is not yet implemented.
                </div>
                <FormHelperText>{descriptionText}</FormHelperText>
            </FormControl>
        </div>
    </>
    );
};

export default AnyOfKeywordPlaceHolder;