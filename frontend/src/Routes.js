import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { DeviceList } from "./pages/DeviceList";
import { Supplier } from "./pages/Supplier";
import { Manufacturer } from "./pages/Manufacturer";
import { Tracker } from "./pages/Tracker";

const Routes = () => {
  return (
    <Switch>
      <Route path="/supplier" exact>
        <Supplier />
      </Route>
      <Route path="/manufacturer" exact>
        <Manufacturer />
      </Route>
      <Route path="/tracker" exact>
        <Tracker />
      </Route>
      <Redirect to="/supplier" />
    </Switch>
  );
};

export default Routes;
