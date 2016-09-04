import React from 'react/addons';
import { Router, Route } from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory';
import AppStore from '../stores/app-store';
import AuthenticatedLayout from './authenticated-layout';
import UnauthenticatedLayout from './unauthenticated-layout';
import DropzoneView from './dropzone-view';
import Home from './home';
import Metagrid from './metagrid';
import ColumnList from './column-list';
import Treemap from './treemap';
import Login from './login';

function ensureAuthenticated(nextState, replaceState) {
  if (!localStorage.getItem('auth-token')) {
    replaceState(null, '/login');
  }
}

export default class App extends React.Component {

  render() {
    return (
      <Router history={createBrowserHistory()}>
        <Route component={AuthenticatedLayout} onEnter={ensureAuthenticated}>
          <Route component={DropzoneView}>
            <Route path="/" component={Home}/>
            <Route path="/grid/:name/:parentName/:filter/:filterParam" component={Metagrid}/>
            <Route path="/grid/:name" component={Metagrid}/>
          </Route>
          <Route path="/columns" component={ColumnList}/>
          <Route path="/treemap" component={Treemap}/>
        </Route>
        <Route component={UnauthenticatedLayout}>
          <Route path="/login" component={Login}/>
          <Route path="*" component={Login}/>
        </Route>
      </Router>
    );
  }
}