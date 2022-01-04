import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
//import { HashRouter as Router } from "react-router-dom";
import App from "./App";
import CssBaseline from "@material-ui/core/CssBaseline";

const rootElement = document.getElementById("root");
ReactDOM.render(
  <React.StrictMode>
    <Router>
      <CssBaseline />
      <App />
    </Router>
  </React.StrictMode>,
  rootElement
);
