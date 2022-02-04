import React from "react";
import "./styles.css";
import { Route, Switch, Redirect } from "react-router-dom";
import AdamantMain from "./pages/AdamantMain";
import "cors";
import packageJson from "../package.json";

export default function App() {

  // check if adamant endpoint exists in the homepage
  const homepage = packageJson["homepage"];
  const adamantEndpoint = homepage.includes("/adamant")

  if (adamantEndpoint) {
    console.log("/adamant endpoint is detected")
    return (
      /** Use this for if homepage has /adamant endpoint, this is only for deploying on github-page */
      <div className="the_app">
        <Switch>
          <Redirect exact from="/" to="/adamant" />
          <Route exact path="/adamant" component={AdamantMain}></Route>
        </Switch>
      </div>
    );
  } else {
    return (
      <div className="the_app">
        <Switch>
          <Route exact path="/" component={AdamantMain}></Route>
        </Switch>
      </div>
    );
  };
};