import React from 'react';
import { History } from 'react-router';
import AppStore from '../stores/app-store';
import * as AppActions from '../actions/app-actions';

export default React.createClass({

  mixins: [History, React.addons.LinkedStateMixin],

  getInitialState() {
    return {
      user: '',
      password: ''
    };
  },

  componentWillMount() {
    AppStore.addWatch(this._onChange);
  },

  componentWillUnmount() {
    AppStore.removeWatch(this._onChange);
  },

  _onChange() {
    if (AppStore.isAuthenticated()) {
      this.history.replaceState(null, '/');
    }
  },

  login(ev) {
    ev.preventDefault();
    AppActions.login({username: this.state.user, password: this.state.password})
      .catch(err => {
        console.log("Error logging in", err);
        alert("There is an error logging in");
      });
  },

  render() {
    return (
      <div className="login jumbotron center-block">
        <h1>Login</h1>
        <form role="form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input type="text" valueLink={this.linkState('user')} className="form-control" placeholder="Username"/>
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="text" valueLink={this.linkState('password')} className="form-control" placeholder="Password"/>
          </div>
          <button type="submit" className="btn btn-default" onClick={this.login}>Submit</button>
        </form>
      </div>
    );
  }
})