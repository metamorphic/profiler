import React from 'react';
import { Link } from 'react-router';
import * as AppActions from '../actions/app-actions';
import { Modal } from 'metaform';
import Header from './header';
import Footer from './footer';
import Sidebar from './sidebar';
import $ from 'jquery';

export default class AuthenticatedLayout extends React.Component {

  componentDidMount() {
    let body = document.body;
    body.className = body.className.replace('sidebar-collapse', 'sidebar-mini');
    if ($.AdminLTE) {
      $.AdminLTE.layout.activate();
      $.AdminLTE.pushMenu.activate('[data-toggle="offcanvas"]');
    }
  }

  logout() {
    AppActions.logout();
  }

  render() {
    return (
      <div>
        <Header>
          <a href="#" className="sidebar-toggle" data-toggle="offcanvas" role="button">
            <span className="sr-only">Toggle navigation</span>
          </a>
          <div className="navbar-custom-menu">
            <ul className="nav navbar-nav">
              <li className="dropdown messages-menu">
                <a href="#" className="dropdown-toggle" data-toggle="dropdown">
                  <i className="fa fa-envelope-o"/>
                  <span className="label label-success">4</span>
                </a>
                <ul className="dropdown-menu">
                  <li className="header">You have 4 new analyses</li>
                  <li>
                    <ul className="menu">
                      <li>
                        <a href="#">
                          <h4>
                            test.csv
                            <small><i className="fa fa-clock-o"/> 5 mins</small>
                          </h4>
                          <p>Test message</p>
                        </a>
                      </li>
                    </ul>
                  </li>
                  <li className="footer"><Link to="/grid/table-data-source">See All Analyses</Link></li>
                </ul>
              </li>
              <li className="dropdown user user-menu">
                <a href="#" className="dropdown-toggle" data-toggle="dropdown">
                  <img src="/assets/user2-160x160.jpg" className="user-image" alt="User Image"/>
                  <span className="hidden-xs">Mark Moloney</span>
                </a>
                <ul className="dropdown-menu">
                  <li className="user-header">
                    <img src="/assets/user2-160x160.jpg" className="img-circle" alt="User Image"/>
                    <p>
                      Mark Moloney
                      <small>Member since Nov. 2012</small>
                    </p>
                  </li>
                  <li className="user-footer">
                    <div className="pull-left">
                      <a href="#" className="btn btn-default btn-flat">Profile</a>
                    </div>
                    <div className="pull-right">
                      <Link to="/login" className="btn btn-default btn-flat" onClick={this.logout}>Sign out</Link>
                    </div>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </Header>
        <Sidebar/>
        <div className="content-wrapper">
          {this.props.children}
        </div>
        <Footer/>
      </div>
    );
  }
}