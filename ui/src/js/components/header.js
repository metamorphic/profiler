import React from 'react';
import { Link } from 'react-router';

export default class Header extends React.Component {

  render() {
    return (
      <header className="main-header">
        <Link to="/" className="logo">
          <span className="logo-mini"><b>P</b>RO</span>
          <span className="logo-lg"><b>Profiler</b></span>
        </Link>
        <nav className="navbar navbar-static-top" role="navigation">
          {this.props.children}
        </nav>
      </header>
    );
  }
}