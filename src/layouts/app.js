import React, {Component} from 'react'
import { Route, Switch,Router } from 'react-router-dom';
import GuestLayout from './layout_guest'
import Login from '../pages/Signup/login.js'
import history from '../history';
// import './app.css'
import PrivateRoute from '../components/privateroute';
class App extends Component {
  render () {
    return (
      <Router history={history}>
         <Switch >
          <Route path="/login" component={Login} />
          <PrivateRoute path="/" component={GuestLayout} />
        </Switch>
      </Router>
     
    )
  };
}

export default App