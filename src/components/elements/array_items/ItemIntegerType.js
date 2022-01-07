import React, { useContext, useState } from 'react'
import TextField from "@material-ui/core/TextField"
import { makeStyles } from '@material-ui/core/styles';
import DeleteIcon from "@material-ui/icons/Delete";
import { IconButton } from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { FormContext } from '../../../FormContext';


const useStyles = makeStyles((theme) => ({
    root: {
        width: 'auto',
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular,
    },
}));

const style = {
    paddingTop: "10px",
    paddingBottom: "10px",
}


const ItemIntegerType = ({ pathSchema, dataInputItems, setDataInputItems, edit, index, field_id, handleDeleteArrayItem }) => {
    const classes = useStyles();
    const [inputValue, setInputValue] = useState("");
    const { handleDataInput } = useContext(FormContext);

    // handle input on change for signed integer
    const handleInputOnChange = (event) => {
        let inputValueVar = inputValue
        inputValueVar = inputValueVar.toString()
        if (event.target.value === ".") {
            return
        }
        if ((event.target.value.at(-1) === '.')) {
            let value = inputValueVar
            setInputValue(value.replace(/ /g, ''))
        } else {
            let value = event.target.value.replace(/(?!^-)[^0-9]/g, "")
            setInputValue(value.replace(/ /g, ''))
        }
    }

    // handle input on blur for signed integer
    const handleInputOnBlur = () => {
        let value = inputValue;
        value = parseInt(value)
        if (!isNaN(value)) {
            setInputValue(value)

            // store it to input data array
            let arr = dataInputItems;
            const items = Array.from(arr);
            items[index] = value;
            setDataInputItems(items);

            // store to form data
            handleDataInput(items, pathSchema, "array")
        }
    }

    return (
        <>
            {index !== undefined ? <div style={{ padding: "5px" }}>
                <Typography className={classes.heading}>{index + 1}.</Typography>
            </div> : null}
            <div style={{ paddingTop: "10px", paddingBottom: "10px", display: 'inline-flex', width: '100%' }}>
                <TextField onBlur={() => handleInputOnBlur()} onChange={e => handleInputOnChange(e)} value={inputValue} fullWidth={true} className={classes.heading} id={field_id} variant="outlined" />
                {edit ? <>
                    <IconButton onClick={() => handleDeleteArrayItem(index)} style={{ marginLeft: "5px", marginTop: "5px", height: "45px" }}><DeleteIcon fontSize="small" color="secondary" /></IconButton></> : null}
            </div>

        </>
    )
};

export default ItemIntegerType;
