import React from "react";
import { Route, Redirect } from "react-router-dom";
import { getAuth } from '../components/auth';

function PrivateRoute({ component: Component, ...rest }) {
  const isAuthenticated = getAuth();
  return (
    <Route
      {...rest}
      render={props =>
        isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
}

export default PrivateRoute;