import React, { useCallback, useState } from "react";
//import { makeStyles } from "@material-ui/core/styles";
import { useDropzone } from "react-dropzone";
import HeaderImage from "../assets/header-image.png";
import FormRenderer from "../components/FormRenderer";
import Button from "@material-ui/core/Button";
import { TextField } from "@material-ui/core";
import Divider from "@material-ui/core/Divider";
import { FormContext } from "../FormContext";
import JSONSchemaViewer from "../components/JSONSchemaViewer";
import array2object from "../components/utils/array2object";
import object2array from "../components/utils/object2array";

const AdamantMain = () => {
  // state management
  const [disable, setDisable] = useState(true);
  const [schemaMessage, setSchemaMessage] = useState(null);
  const [schemaValidity, setSchemaValidity] = useState(false);
  const [schema, setSchema] = useState(null);
  const [renderReady, setRenderReady] = useState(false);
  const [editMode, setEditMode] = useState(true);
  const [schemaFile, setSchemaFile] = useState();
  const [originalSchema, setOriginalSchema] = useState();
  const [inputMode, setInputMode] = useState(false);
  const [convertedSchema, setConvertedSchema] = useState(null);
  const [createScratchMode, setCreateScratchMode] = useState(false);

  // place holders
  let schemaList = [
    "",
    "SEM-request-form",
    "Plasma-MDS",
    "unreasonably long title lalalala...",
  ];

  // function to check if the file accepted is of json format and json schema valid
  const checkSchemaValidity = (schemaFile) => {
    // place holder
    if (schemaFile[0]["type"] === "application/json") {
      // read the file with FileReadr API
      const reader = new FileReader();
      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = () => {
        const binaryStr = reader.result;
        const obj = JSON.parse(binaryStr);

        // convert obj schema to iterable array properties
        let convertedSchema = JSON.parse(JSON.stringify(obj));
        try {
          convertedSchema["properties"] = object2array(obj["properties"]);

          // update states
          setSchemaValidity(true);
          setSchemaMessage(`${schemaFile[0]["name"]} is valid`);
          setSchema(obj);
          let oriSchema = JSON.parse(JSON.stringify(obj));
          setOriginalSchema(oriSchema);
          setConvertedSchema(convertedSchema);
          setEditMode(true);
        } catch (error) {
          console.log(error);
          // update states
          setSchemaValidity(false);
          setSchemaMessage(`${schemaFile[0]["name"]} is invalid`);
          setSchema(null);
        }
      };
      reader.readAsText(schemaFile[0]);
    } else {
      // update states
      setSchemaValidity(false);
      setSchemaMessage(`${schemaFile[0]["name"]} is of incorrect file type`);
      setSchema(null);
    }
  };

  // browse or drag&drop schema file
  const onDrop = useCallback(
    (acceptedFile) => {
      // process the schema, validation etc
      checkSchemaValidity(acceptedFile);

      // store schema file in the state
      setSchemaFile(acceptedFile);
      // update states
      setRenderReady(false);
      setDisable(true);
      setCreateScratchMode(false);
    },
    [setRenderReady]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  // render on-click handle
  const renderOnClick = () => {
    setDisable(false);
    setRenderReady(true);
  };

  // clear schema on-click handle
  const clearSchemaOnClick = () => {
    setDisable(true);
    setRenderReady(false);
    setSchema(null);
    setSchemaValidity(false);
    setSchemaMessage();
    setCreateScratchMode(false);
  };

  // create new schema from scratch
  const createSchemaFromScratch = () => {
    // update browse schema render states
    setSchemaValidity(false);
    setSchemaMessage();

    let schemaBlueprint = { properties: {}, type: "object" };
    const obj = JSON.parse(JSON.stringify(schemaBlueprint));

    // convert obj schema to iterable array properties
    let convertedSchema = JSON.parse(JSON.stringify(obj));
    convertedSchema["properties"] = object2array(obj["properties"]);

    // update states
    setCreateScratchMode(true);
    setSchema(obj);
    let oriSchema = JSON.parse(JSON.stringify(obj));
    setOriginalSchema(oriSchema);
    setConvertedSchema(convertedSchema);
    setEditMode(true);

    setDisable(false);
    setRenderReady(true);
  };

  // compile on-click handle
  const compileOnClick = () => {
    const value = schema;
    setInputMode(true);
    setSchema(value);
    setEditMode(false);
    setDisable(true);
  };

  // return to edit mode handle
  const toEditMode = () => {
    const value = schema;
    setInputMode(false);
    setSchema(value);
    setEditMode(true);
    setDisable(false);
  };

  // update parent (re-render everything)
  const updateParent = (value) => {
    const newValue = { ...value };

    // update original schema
    const updatedSchema = JSON.parse(JSON.stringify(newValue));
    const tempSchema = JSON.parse(JSON.stringify(newValue));
    updatedSchema["properties"] = array2object(tempSchema["properties"]);

    setConvertedSchema(newValue);
    setSchema(updatedSchema);
  };

  // revert all changes to the schema
  const revertAllChanges = () => {
    const value = { ...originalSchema };
    // convert obj schema to iterable array properties
    let convertedSchema = JSON.parse(JSON.stringify(value));
    convertedSchema["properties"] = object2array(value["properties"]);
    setConvertedSchema(convertedSchema);
    setSchema(value);
  };

  return (
    <>
      <FormContext.Provider value={{ updateParent, convertedSchema }}>
        <div style={{ paddingBottom: "5px" }}>
          <img
            style={{ width: "100%", borderRadius: "5px" }}
            alt="header"
            src={HeaderImage}
          />
          {!inputMode ? (
            <div
              style={{
                display: "flex",
                width: "100%",
                textAlign: "left",
                padding: "10px 10px 0px 10px",
              }}
            >
              <Button variant="contained" color="primary" {...getRootProps()}>
                <input {...getInputProps()} />
                {isDragActive ? "Drop here" : "Browse Schema"}
              </Button>
              <div
                style={{
                  paddingLeft: "10px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                OR
              </div>
              <TextField
                style={{ width: "220px", marginLeft: "10px" }}
                fullWidth={false}
                select
                id={"select-schema"}
                label={"Select existing schema"}
                variant="outlined"
                SelectProps={{ native: true }}
              >
                {schemaList.map((content, index) => (
                  <option key={index} value={content}>
                    {content}
                  </option>
                ))}
              </TextField>
              <div
                style={{
                  paddingLeft: "10px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                OR
              </div>
              <Button
                onClick={() => createSchemaFromScratch()}
                style={{
                  marginLeft: "10px",
                  marginRight: "10px",
                }}
                variant="contained"
                color="primary"
              >
                CREATE SCHEMA/FORM
              </Button>
            </div>
          ) : null}
        </div>
        {!inputMode ? (
          <div
            style={{
              paddingLeft: "10px",
              display: "flex",
              width: "100%",
              textAlign: "left",
            }}
          >
            {schemaValidity === true ? (
              <>
                <div
                  style={{
                    paddingRight: "10px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "green",
                  }}
                >
                  {schemaMessage}. You can now render the form.
                </div>
                <Button
                  style={{ marginRight: "5px" }}
                  onClick={() => renderOnClick()}
                  variant="outlined"
                >
                  Render
                </Button>
                <Button
                  onClick={() => clearSchemaOnClick()}
                  variant="outlined"
                  color="secondary"
                >
                  Clear
                </Button>
              </>
            ) : (
              <>
                <div
                  style={{
                    paddingRight: "10px",
                    paddingTop: "10px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "red",
                  }}
                >
                  {schemaMessage}
                </div>
              </>
            )}
            {createScratchMode === true ? (
              <>
                <div
                  style={{
                    paddingRight: "10px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "green",
                  }}
                >
                  Create from scratch mode. You can now start editing.
                </div>
                <Button
                  onClick={() => clearSchemaOnClick()}
                  variant="outlined"
                  color="secondary"
                >
                  Clear
                </Button>
              </>
            ) : null}
          </div>
        ) : null}
        <div style={{ padding: "10px" }}>
          <Divider />
        </div>
        {renderReady === true ? (
          <FormRenderer
            revertAllChanges={revertAllChanges}
            schema={convertedSchema}
            edit={editMode}
          />
        ) : null}
        {renderReady === true ? <JSONSchemaViewer jsonschema={schema} /> : null}
        <div
          style={{
            padding: "10px 10px",
            display: "flex",
            justifyContent: "right",
          }}
        >
          {inputMode ? (
            <>
              <Button
                onClick={() => toEditMode()}
                style={{ marginRight: "5px" }}
                variant="outlined"
              >
                Back to Edit Mode
              </Button>
              <Button variant="contained" color="primary">
                Proceed
              </Button>
            </>
          ) : (
            <Button
              disabled={disable}
              onClick={() => compileOnClick()}
              variant="contained"
              color="primary"
            >
              Compile
            </Button>
          )}
        </div>
        <div style={{ padding: "5px" }}>ADAMANT v0.0.1</div>
      </FormContext.Provider>
    </>
  );
};

export default AdamantMain;
