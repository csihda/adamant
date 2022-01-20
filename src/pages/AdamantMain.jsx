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
import { Menu, MenuItem } from "@material-ui/core";
import DownloadIcon from "@material-ui/icons/GetApp";
import set from "set-value";
import getValue from "../components/utils/getValue";
import CryptoJS from "crypto-js";
import deleteKeySchema from "../components/utils/deleteKeySchema";
import validateAgainstSchema from "../components/utils/validateAgainstSchema";
import CreateELabFTWExperimentDialog from "../components/CreateELabFTWExperimentDialog";
import { useEffect } from "react";
import createDescriptionList from "../components/utils/createDescriptionList";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import convData2DescList from "../components/utils/convData2DescList";
import preProcessB4DescList from "../components/utils/preProcessB4DescList";
import nicelySort from "../components/utils/nicelySort";
import array2objectAnyOf from "../components/utils/array2objectAnyOf";
import SchemaOne from "../schemas/plasma-mds.json";
import SchemaTwo from "../schemas/pak-schema.json";
import SchemaThree from "../schemas/appj-schema.json";
import SchemaFour from "../schemas/all-types.json";

// function that receive the schema and convert it to Form/json data blueprint
// also to already put the default value to this blueprint
const createFormDataBlueprint = (schemaProperties) => {
  let newObject = {};

  Object.keys(schemaProperties).forEach((item) => {
    if (schemaProperties[item]["type"] !== "object") {
      if (schemaProperties[item]["default"] !== undefined) {
        newObject[item] = schemaProperties[item]["default"];
      } else if (
        (schemaProperties[item]["default"] === undefined) &
        (schemaProperties[item]["enum"] !== undefined)
      ) {
        newObject[item] = schemaProperties[item]["enum"][0];
      } else if (
        (schemaProperties[item]["type"] === "boolean") &
        (schemaProperties[item]["default"] === undefined)
      ) {
        newObject[item] = false;
      }
    } else {
      if (schemaProperties[item]["properties"] !== undefined) {
        newObject[item] = createFormDataBlueprint(
          schemaProperties[item]["properties"]
        );
      }
    }
  });

  return newObject;
};

/*
// function to remove empty artributes
const removeEmpty = (obj) => {
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([_, v]) => (v !== null) & (v !== "") & (v !== {}) & (v !== []))
      .map(([k, v]) => [k, v === Object(v) ? removeEmpty(v) : v])
  );
};
*/

// function to remove empty artributes
const removeEmpty = (obj) => {
  Object.keys(obj).forEach((key) => {
    if (obj[key] && typeof obj[key] === "object") {
      const childObject = removeEmpty(obj[key]);
      if (childObject === undefined) {
        delete obj[key];
      }
    } else if (obj[key] === "" || obj[key] === null || obj[key] === undefined) {
      delete obj[key];
    }
  });
  return Object.keys(obj).length > 0 || obj instanceof Array ? obj : undefined;
};

const AdamantMain = () => {
  // state management
  const [disable, setDisable] = useState(true);
  const [schemaMessage, setSchemaMessage] = useState(null);
  const [schemaValidity, setSchemaValidity] = useState(false);
  const [schema, setSchema] = useState(null);
  const [schemaIntermediate, setSchemaIntermediate] = useState(null);
  const [renderReady, setRenderReady] = useState(false);
  const [editMode, setEditMode] = useState(true);
  const [schemaList, setSchemaList] = useState([]);
  const [schemaNameList, setSchemaNameList] = useState([]);
  const [selectedSchemaName, setSelectedSchemaName] = useState("");
  const [originalSchema, setOriginalSchema] = useState();
  const [inputMode, setInputMode] = useState(false);
  const [convertedSchema, setConvertedSchema] = useState(null);
  const [createScratchMode, setCreateScratchMode] = useState(false);
  const [jsonData, setJsonData] = useState({});
  const [descriptionList, setDescriptionList] = useState("");
  const [schemaWithValues, setSchemaWithValues] = useState({});
  const [token, setToken] = useState("");
  const [eLabURL, setELabURL] = useState("");
  const [experimentTitle, setExperimentTitle] = useState("");
  const [onlineMode, setOnlineMode] = useState(false);
  const [tags, setTags] = useState([]);
  const [retrievedTags, setRetrievedTags] = useState([]);
  // for dropdown buttons
  const [anchorEl, setAnchorEl] = useState(null);
  const [openSubmitDialog, setOpenSubmitDialog] = useState(false);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  }; //

  // check if the front-end is connected to backend at all
  useEffect(() => {
    let $ = require("jquery");
    $.ajax({
      type: "GET",
      url: "/adamant/api/check_mode",
      success: function () {
        console.log("Connection to server is established. Online mode");
        setOnlineMode(true);
        toast.success("Connection to server is established. Online mode.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
          progress: undefined,
        });
      },
      error: function () {
        console.log("Unable to establish connection to server. Offline mode");
        setOnlineMode(false);

        // use available schema as a place holder
        setSchemaNameList([
          "",
          "plasma-mds.json",
          "pak-schema.json",
          "appj-schema.json",
          "all-types.json",
        ]);
        setSchemaList([null, SchemaOne, SchemaTwo, SchemaThree, SchemaFour]);

        toast.warning(
          "Unable to establish connection to server. Offline mode.",
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: false,
            progress: undefined,
          }
        );
      },
    });
  }, []);

  // get schemas from server when onlinemode is true
  useEffect(() => {
    // if online mode then get available schemas from server
    if (onlineMode === true) {
      // use available schema as a place holder
      setSchemaNameList([
        "",
        "plasma-mds.json",
        "pak-schema.json",
        "appj-schema.json",
        "all-types.json",
      ]);
      setSchemaList([null, SchemaOne, SchemaTwo, SchemaThree, SchemaFour]);
    }
  }, [onlineMode]);

  // handle select schema on change
  const handleSelectSchemaOnChange = (event) => {
    // first reset states
    setRenderReady(false);
    setDisable(true);
    setCreateScratchMode(false);
    setJsonData({});
    //

    console.log("selected schema:", event.target.value);
    setSelectedSchemaName(event.target.value);

    let selectedSchema = schemaList[schemaNameList.indexOf(event.target.value)];

    // reset everything when selectedSchema is empty
    if (selectedSchema === null) {
      setDisable(true);
      setRenderReady(false);
      setSchema(null);
      setSchemaValidity(false);
      setSchemaMessage();
      setCreateScratchMode(false);
      setJsonData({});
      return;
    }

    // convert selectedSchema schema to iterable array properties
    let convertedSchema = JSON.parse(JSON.stringify(selectedSchema));
    try {
      convertedSchema["properties"] = object2array(
        selectedSchema["properties"]
      );

      // update states
      setSchemaValidity(true);
      setSchemaMessage(`${event.target.value} is a valid schema`);
      setSchema(selectedSchema);
      let oriSchema = JSON.parse(JSON.stringify(selectedSchema));
      setOriginalSchema(oriSchema);
      setSchemaWithValues(JSON.parse(JSON.stringify(oriSchema)));
      setConvertedSchema(convertedSchema);
      setEditMode(true);

      // create form data
      let formData = createFormDataBlueprint(selectedSchema["properties"]);
      setJsonData(formData);
    } catch (error) {
      console.log(error);
      // update states
      setSchemaValidity(false);
      setSchemaMessage(`${event.target.value} is invalid`);
      setSchema(null);
    }
  };

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
          setSchemaMessage(`${schemaFile[0]["name"]} is a valid schema`);
          setSchema(obj);
          let oriSchema = JSON.parse(JSON.stringify(obj));
          setOriginalSchema(oriSchema);
          setSchemaWithValues(JSON.parse(JSON.stringify(oriSchema)));
          setConvertedSchema(convertedSchema);
          setEditMode(true);

          // create form data
          let formData = createFormDataBlueprint(obj["properties"]);
          setJsonData(formData);
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
      // update states
      setRenderReady(false);
      setDisable(true);
      setCreateScratchMode(false);
      setJsonData({});
      setSelectedSchemaName("");
    },
    [setRenderReady]
  );
  //

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
    setJsonData({});
    setSelectedSchemaName("");

    let schemaBlueprint = {
      $schema: "http://json-schema.org/draft-04/schema#",
      properties: {},
      type: "object",
    };
    const obj = JSON.parse(JSON.stringify(schemaBlueprint));

    // create form data again
    let formData = createFormDataBlueprint(obj["properties"]);
    setJsonData(formData);

    // convert obj schema to iterable array properties
    let convertedSchema = JSON.parse(JSON.stringify(obj));
    convertedSchema["properties"] = object2array(obj["properties"]);

    // update states
    setCreateScratchMode(true);
    setSchema(obj);
    let oriSchema = JSON.parse(JSON.stringify(obj));
    setOriginalSchema(oriSchema);
    setSchemaWithValues(JSON.parse(JSON.stringify(oriSchema)));
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

    // update intermediate schema
    const updatedSchema2 = JSON.parse(JSON.stringify(newValue));
    const tempSchema2 = JSON.parse(JSON.stringify(newValue));
    updatedSchema2["properties"] = array2objectAnyOf(tempSchema2["properties"]);
    setSchemaIntermediate(updatedSchema2);
  };

  // revert all changes to the schema
  const revertAllChanges = () => {
    const value = { ...originalSchema };
    // convert obj schema to iterable array properties
    let convertedSchema = JSON.parse(JSON.stringify(value));
    convertedSchema["properties"] = object2array(value["properties"]);
    setConvertedSchema(convertedSchema);
    setSchema(value);
    setSchemaWithValues(value);
    setDescriptionList("");

    // create form data again
    let formData = createFormDataBlueprint(value["properties"]);
    setJsonData(formData);
  };

  // handle data input on blur
  const handleDataInput = (event, path, type) => {
    let jData = { ...jsonData };
    let value;
    if (["string", "number", "integer", "boolean"].includes(type)) {
      if (["number", "integer", "boolean"].includes(type)) {
        value = event;
      } else {
        value = event.target.value;
      }
    } else if (type === "array") {
      value = event;
    }
    set(jData, path, value);
    console.log("Current form data    (jData):", jData);
    setJsonData(jData);
  };
  //

  // handle data input on blur to convertedSchema
  const handleConvertedDataInput = (event, path, type) => {
    let convSchemaData = { ...convertedSchema };
    let value;
    if (["string", "number", "integer", "boolean"].includes(type)) {
      if (["number", "integer", "boolean"].includes(type)) {
        value = event;
      } else {
        value = event.target.value;
      }
    } else if (type === "array") {
      value = event;
    }
    set(convSchemaData, path, value);
    setConvertedSchema(convSchemaData);
    //console.log(convSchemaData);

    // convert to form data
    /*
    console.log(
      "Current form data (convData):",
      convData2FormData(
        JSON.parse(JSON.stringify(convSchemaData["properties"]))
      )
    );
    */
  };

  // delete data in jsonData when the field in schema is deleted
  const handleDataDelete = (path) => {
    let jData = { ...jsonData };
    let value = deleteKeySchema(jData, path);
    setJsonData(value);
    console.log("Current form data:", value);
  };

  // update form data id if a fieldId changes, simply delete key value pair of the oldfieldid from jsonData
  const updateFormDataId = (
    oldFieldId,
    newFieldId,
    pathFormData,
    defaultValue
  ) => {
    if (oldFieldId === newFieldId) {
      return;
    }
    if (defaultValue === undefined) {
      let jData = { ...jsonData };
      jData = deleteKeySchema(jData, pathFormData);
      setJsonData(jData);
      console.log("Current form data:", jData);
    } else {
      let newPathFormData = pathFormData.split(".");
      newPathFormData.pop();
      newPathFormData.push(newFieldId);

      let jData = { ...jsonData };
      let value = getValue(jData, pathFormData);
      set(jData, newPathFormData, value);
      jData = deleteKeySchema(jData, pathFormData);
      setJsonData(jData);
      console.log("Current form data:", jData);
    }
  };

  // handle download json schema
  const handleDownloadJsonSchema = () => {
    let content = { ...schema };

    // calculate hash for the content
    // calculate hash using CryptoJS
    let sha256_hash = CryptoJS.SHA256(JSON.stringify(content));

    let a = document.createElement("a");
    let file = new Blob([JSON.stringify(content)], {
      type: "application/json",
    });
    a.href = URL.createObjectURL(file);
    a.download = `jsonschema-${sha256_hash}.json`;
    a.click();

    handleClose();
  };

  // handle download json schema
  const handleDownloadFormData = () => {
    let content = { ...jsonData };
    let contentSchema = { ...schema };

    // get rid of empty values in content
    content = removeEmpty(content);
    if (content === undefined) {
      content = {};
    }
    console.log("content", content);

    //
    // validate jsonData against its schema before download
    //
    const [valid, validation] = validateAgainstSchema(content, contentSchema);
    if (!valid) {
      let errorMessages = "";
      for (let i = 0; i < validation.errors.length; i++) {
        let currentMessage = validation.errors[i].message + ".";
        errorMessages += currentMessage + "\n";
      }
      errorMessages = errorMessages.split("\n");
      toast.error(
        <>
          <div>
            <strong>Form data is not valid.</strong>
          </div>
          <div style={{ paddingBottom: "10px" }}>Check your inputs!</div>
          {errorMessages.map((item) => {
            return <div>{item}</div>;
          })}
        </>,
        {
          position: "top-right",
          autoClose: 10000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
          progress: undefined,
        }
      );
      return;
    }

    // calculate hash for the content
    // calculate hash using CryptoJS
    let sha256_hash = CryptoJS.SHA256(JSON.stringify(content));

    let a = document.createElement("a");
    let file = new Blob([JSON.stringify(content)], {
      type: "application/json",
    });
    a.href = URL.createObjectURL(file);
    a.download = `formdata-${sha256_hash}.json`;
    a.click();

    handleClose();
  };

  // handle download json schema
  const handleDownloadDescriptionList = () => {
    let content = { ...jsonData };
    let contentSchema = { ...schema };

    // get rid of empty values in content
    content = removeEmpty(content);
    if (content === undefined) {
      content = {};
    }

    //
    // validate jsonData against its schema before download
    //
    const [valid, validation] = validateAgainstSchema(content, contentSchema);
    if (!valid) {
      let errorMessages = "";
      for (let i = 0; i < validation.errors.length; i++) {
        let currentMessage = validation.errors[i].message + ".";
        errorMessages += currentMessage + "\n";
      }
      errorMessages = errorMessages.split("\n");
      toast.error(
        <>
          <div>
            <strong>Form data is not valid.</strong>
          </div>
          <div style={{ paddingBottom: "10px" }}>Check your inputs!</div>
          {errorMessages.map((item) => {
            return <div>{item}</div>;
          })}
        </>,
        {
          position: "top-right",
          autoClose: 10000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
          progress: undefined,
        }
      );
      return;
    }
    // Create elab ftw description list and store it to the description list state
    let convSch = { ...convertedSchema };
    let cleaned = removeEmpty(convData2DescList(convSch["properties"]));
    if ((cleaned === undefined) | (cleaned === {})) {
      toast.error(
        <>
          <div>
            <strong>
              Unable to download. Form data is not valid. Maybe empty?
            </strong>
          </div>
          <div style={{ paddingBottom: "10px" }}>Check your inputs!</div>
        </>,
        {
          position: "top-right",
          autoClose: 10000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
          progress: undefined,
        }
      );
      return;
    }
    let preProcessed = preProcessB4DescList(cleaned, cleaned, schema, []);
    //console.log(preProcessed);
    let nicelySorted = nicelySort(preProcessed);
    let descList = createDescriptionList(nicelySorted);
    let descListHeading = `<h1><strong>${convSch["title"]}</strong></h1>\n`;
    descListHeading += descList;
    descListHeading += `<div> This experiment template was generated with <span><a title=https://github.com/csihda/adamant href=https://github.com/csihda/adamant>ADAMANT v0.0.1</a></span> </div>`;
    console.log("created description list:\n", descListHeading);
    setDescriptionList(descList);

    let sha256_hash = CryptoJS.SHA256(descListHeading);
    let a = document.createElement("a");
    let file = new Blob([descListHeading], {
      type: "text/plain",
    });
    a.href = URL.createObjectURL(file);
    a.download = `desclist-${sha256_hash}.tpl`;
    a.click();

    handleClose();
  };

  // get available tags from elabftw
  const getTagsELabFTW = () => {
    var $ = require("jquery");
    $.ajax({
      type: "POST",
      url: "/adamant/api/get_tags",
      dataType: "json",
      data: {
        eLabURL: eLabURL,
        eLabToken: token,
      },
      success: function (status) {
        console.log("Tags retrieved successfully");
        //let arr = [];
        //for (let i = 0; i < status.length; i++) {
        //  arr.push(status[i]["tag"]);
        //}
        setRetrievedTags(status);
        toast.success(`Successfully retrieved the tags!`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
          progress: undefined,
        });
      },
      error: function (status) {
        console.log("Failed to retrieve tags");
        console.log(status);
        toast.error(`Failed to get the tags!\nMaybe wrong url or token?`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
          progress: undefined,
        });
      },
    });
  };

  // create an experiment in elabftw based on the schema and data
  const createExperimentELabFTW = () => {
    // validate the data first using ajv
    let content = { ...jsonData };
    let contentSchema = { ...schema };

    // get rid of empty values in content
    content = removeEmpty(content);
    if (content === undefined) {
      content = {};
    }
    //console.log("content", content);

    //
    // validate jsonData against its schema before submission
    //
    const [valid, validation] = validateAgainstSchema(
      content,
      JSON.parse(JSON.stringify(contentSchema))
    );
    if (!valid) {
      let errorMessages = "";
      for (let i = 0; i < validation.errors.length; i++) {
        let currentMessage = validation.errors[i].message + ".";
        errorMessages += currentMessage + "\n";
      }
      errorMessages = errorMessages.split("\n");
      toast.error(
        <>
          <div>
            <strong>Form data is not valid.</strong>
          </div>
          <div style={{ paddingBottom: "10px" }}>Check your inputs!</div>
          {errorMessages.map((item) => {
            return <div>{item}</div>;
          })}
        </>,
        {
          position: "top-right",
          autoClose: 10000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
          progress: undefined,
        }
      );
      // clear states
      setToken("");
      setExperimentTitle("");
      setTags([]);
      return;
    }

    // call create experiment api
    console.log("tags:", tags);
    var $ = require("jquery");
    $.ajax({
      type: "POST",
      url: "/adamant/api/create_experiment",
      async: false,
      dataType: "json",
      data: {
        javascript_data: JSON.stringify(content),
        schema: JSON.stringify(contentSchema),
        eLabURL: eLabURL,
        eLabToken: token,
        title: experimentTitle,
        body: descriptionList,
        tags: JSON.stringify(tags),
      },
      success: function (status) {
        console.log("SUCCESS");
        console.log(status);

        // close submit dialog
        setOpenSubmitDialog(false);
        toast.success(
          `Successfully created an experiment with id: ${status["experimentId"]}!`,
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: false,
            progress: undefined,
          }
        );

        // clear states
        setToken("");
        setExperimentTitle("");
        setRetrievedTags([]);
        setTags([]);
      },
      error: function (status) {
        console.log("ERROR");
        console.log(status);

        // close submit dialog
        setOpenSubmitDialog(false);
        toast.error(
          `Failed to create an experiment!\nMaybe wrong url or token?`,
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: false,
            progress: undefined,
          }
        );
        // clear states
        setToken("");
        setExperimentTitle("");
        setRetrievedTags([]);
        setTags([]);
      },
    });
  };

  const handleOnClickProceedButton = () => {
    // Create elab ftw description list and store it to the description list state
    let convSch = { ...convertedSchema };
    let cleaned = removeEmpty(convData2DescList(convSch["properties"]));
    //console.log(cleaned);
    if ((cleaned === undefined) | (cleaned === {})) {
      toast.error(
        <>
          <div>
            <strong>
              Unable to proceed. Form data is not valid. Maybe empty?
            </strong>
          </div>
          <div style={{ paddingBottom: "10px" }}>Check your inputs!</div>
        </>,
        {
          position: "top-right",
          autoClose: 10000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
          progress: undefined,
        }
      );
      return;
    }
    let preProcessed = preProcessB4DescList(cleaned, cleaned, schema, []);
    //console.log(preProcessed);
    let nicelySorted = nicelySort(preProcessed);
    let descList = createDescriptionList(nicelySorted);
    let descListHeading = `<h1><strong>${convSch["title"]}</strong></h1>\n`;
    descListHeading += descList;
    descListHeading += `<div> This experiment template was generated with <span ><a title=https://github.com/csihda/adamant href=https://github.com/csihda/adamant>ADAMANT v0.0.1</a></span> </div>`;
    console.log("created description list:\n", descListHeading);
    setDescriptionList(descListHeading);

    // validate the data first using ajv
    let content = { ...jsonData };
    let contentSchema = { ...schema };

    // get rid of empty values in content
    content = removeEmpty(content);
    if (content === undefined) {
      content = {};
    }
    //console.log("content", content);

    //
    // validate jsonData against its schema before submission
    //
    const [valid, validation] = validateAgainstSchema(content, contentSchema);
    if (!valid) {
      let errorMessages = "";
      for (let i = 0; i < validation.errors.length; i++) {
        let currentMessage = validation.errors[i].message + ".";
        errorMessages += currentMessage + "\n";
      }
      errorMessages = errorMessages.split("\n");
      toast.error(
        <>
          <div>
            <strong>Form data is not valid.</strong>
          </div>
          <div style={{ paddingBottom: "10px" }}>Check your inputs!</div>
          {errorMessages.map((item) => {
            return <div>{item}</div>;
          })}
        </>,
        {
          position: "top-right",
          autoClose: 10000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
          progress: undefined,
        }
      );
      // clear states
      setToken("");
      setExperimentTitle("");
      setTags([]);
      return;
    } else {
      setOpenSubmitDialog(true);
    }
  };

  return (
    <>
      <FormContext.Provider
        value={{
          updateParent,
          convertedSchema,
          handleDataInput,
          updateFormDataId,
          handleDataDelete,
          handleConvertedDataInput,
        }}
      >
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
                onChange={(event) => handleSelectSchemaOnChange(event)}
                style={{ width: "220px", marginLeft: "10px" }}
                fullWidth={false}
                value={selectedSchemaName}
                select
                id={"select-schema"}
                label={"Select existing schema"}
                variant="outlined"
                SelectProps={{ native: true }}
              >
                {schemaNameList.map((content, index) => (
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
                CREATE FROM SCRATCH
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
            <div style={{ width: "100%", display: "inline-block" }}>
              <Button
                onClick={() => toEditMode()}
                style={{ float: "left", marginRight: "5px" }}
                variant="outlined"
              >
                Back to Edit Mode
              </Button>
              <Button
                disabled={!onlineMode}
                onClick={() => handleOnClickProceedButton()}
                style={{ float: "right" }}
                variant="contained"
                color="primary"
              >
                Proceed
              </Button>
              <Button
                style={{ float: "right", marginRight: "5px" }}
                id="demo-positioned-button"
                aria-controls={open ? "demo-positioned-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                onClick={handleClick}
              >
                <DownloadIcon /> Download Schema/Data
              </Button>
              <Menu
                id="demo-positioned-menu"
                aria-labelledby="demo-positioned-button"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
              >
                <MenuItem onClick={handleDownloadJsonSchema}>
                  Download JSON Schema
                </MenuItem>
                <MenuItem onClick={handleDownloadFormData}>
                  Download JSON Data
                </MenuItem>
                <MenuItem onClick={handleDownloadDescriptionList}>
                  Download Description List
                </MenuItem>
              </Menu>
            </div>
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
      <CreateELabFTWExperimentDialog
        setTags={setTags}
        tags={tags}
        setRetrievedTags={setRetrievedTags}
        retrievedTags={retrievedTags}
        setExperimentTitle={setExperimentTitle}
        createExperimentELabFTW={createExperimentELabFTW}
        setToken={setToken}
        token={token}
        setELabURL={setELabURL}
        eLabURL={eLabURL}
        setOpenSubmitDialog={setOpenSubmitDialog}
        openSubmitDialog={openSubmitDialog}
        getTagsELabFTW={getTagsELabFTW}
      />
      <ToastContainer />
    </>
  );
};

export default AdamantMain;
