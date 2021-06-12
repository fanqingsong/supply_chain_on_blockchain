import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { DeviceList } from "./pages/DeviceList";
import { UserList } from "./pages/UserConfig";
import { Supplier } from "./pages/Supplier";
import { Manufacturer } from "./pages/Manufacturer";
import { Tracker } from "./pages/Tracker";

const Routes = () => {
  return (
    <Switch>
      <Route path="/userconfig" exact>
        <UserList />
      </Route>
      <Route path="/supplier" exact>
        <Supplier />
      </Route>
      <Route path="/manufacturer" exact>
        <Manufacturer />
      </Route>
      <Route path="/tracker" exact>
        <Tracker />
      </Route>
      <Redirect to="/userconfig" />
    </Switch>
  );
};

export default Routes;
