import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { DeviceList } from "./pages/DeviceList";
import { UserList } from "./pages/UserConfig";
import { Supplier } from "./pages/Supplier";
import { Manufacturer } from "./pages/Manufacturer";
import { Customer } from "./pages/Customer";
import { Overview } from "./pages/Overview";

const Routes = () => {
  return (
    <Switch>
      <Route path="/overview" exact>
        <Overview />
      </Route>
      <Route path="/userconfig" exact>
        <UserList />
      </Route>
      <Route path="/supplier" exact>
        <Supplier />
      </Route>
      <Route path="/manufacturer" exact>
        <Manufacturer />
      </Route>
      <Route path="/customer" exact>
        <Customer />
      </Route>
      <Redirect to="/overview" />
    </Switch>
  );
};

export default Routes;
