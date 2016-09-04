import React from 'react';

export default class UserPanel extends React.Component {

  render() {
    return (
      <div className="user-panel">
        <div className="pull-left image">
          <img src="/assets/user2-160x160.jpg" className="img-circle" alt="User Image"/>
        </div>
        <div className="pull-left info">
          <p>Mark Moloney</p>
          <a href="#"><i className="fa fa-circle text-success"/> Online</a>
        </div>
      </div>
    );
  }
}