import React from 'react';
import { AppStore } from 'metaform';

export default React.createClass({

  getInitialState() {
    return {message: null};
  },

  componentWillMount() {
    AppStore.addWatch(this._getMessage);
  },

  componentWillUnmount() {
    AppStore.removeWatch(this._getMessage);
  },

  _getMessage() {
    const payload = AppStore.getMessage();
    if (payload) {
      setTimeout(() =>
          this.setState({message: null})
        , 4000);
    }
    return {message: payload};
  },

  closeAlert() {
    this.setState({message: null});
  },

  render() {
    if (this.state.message) {
      if (this.state.message.error) {
        return (
          <div id="alert" className="alert alert-danger" role="alert">
            <button className="close" type="button" aria-label="Close" onClick={this.closeAlert}><span
              aria-hidden="true">&times;</span></button>
            {this.state.message.message}
          </div>
        );
      } else {
        return (
          <div id="alert" className="alert alert-success" role="alert">
            <button className="close" type="button" aria-label="Close" onClick={this.closeAlert}><span
              aria-hidden="true">&times;</span></button>
            {this.state.message.message}
          </div>
        );
      }
    } else {
      return null;
    }
  }
});
