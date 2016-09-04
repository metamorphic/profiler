import React from 'react';
import AppStore from '../stores/app-store';

export default function (callback) {
  const uid = shortUid();
  const fName = uid + '_onChange';
  let ret = {

    getInitialState() {
      return callback(this);
    },

    componentWillMount() {
      AppStore.addWatch(this[fName]);
    },

    componentWillUnmount() {
      AppStore.removeWatch(this[fName]);
    }
  };
  ret[fName] = function () { this.setState(callback(this)) };
  return ret;
};

function shortUid() {
  return ('0000' + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4);
}
