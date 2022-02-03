import React from "react";
import "./styles.css";
import { Route, Switch, Redirect } from "react-router-dom";
import AdamantMain from "./pages/AdamantMain";
import "cors";

export default function App() {


  return (
    /*
    <div className="the_app">
      <Switch>
        <Redirect exact from="/" to="/pbb/adamant" />
        <Route exact path="/pbb/adamant" component={AdamantMain}></Route>
      </Switch>
    </div>
    */
    <div className="the_app">
      <Switch>
        <Route exact path="/" component={AdamantMain}></Route>
      </Switch>
    </div>
  );
};