import React from "react";
import "./styles.css";
import { Route, Switch, Redirect } from "react-router-dom";
import AdamantMain from "./pages/AdamantMain";
import "cors";

export default function App() {


  return (
    /** Use this for deploying on github-page and change the homepage in package.json to http://*.github.io/adamant */
    <div className="the_app">
      <Switch>
        <Redirect exact from="/" to="/adamant" />
        <Route exact path="/adamant" component={AdamantMain}></Route>
      </Switch>
    </div>

    /** Use this for deploying with docker or on localhost and change the homepage in package.json to http://*.github.io/ */
    /*
    <div className="the_app">
      <Switch>
        <Route exact path="/" component={AdamantMain}></Route>
      </Switch>
    </div>
    */
  );
};