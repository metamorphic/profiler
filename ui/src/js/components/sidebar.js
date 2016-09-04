import React from 'react';
import { Link } from 'react-router';

export default class Sidebar extends React.Component {

  render() {
    return (
      <aside className="main-sidebar">
        <section className="sidebar">
          <form action="#" method="get" className="sidebar-form">
            <div className="input-group">
              <input type="text" name="q" className="form-control" placeholder="Search..."/>
          <span className="input-group-btn">
            <button type="submit" name="search" id="search-btn" className="btn btn-flat"><i
              className="fa fa-search"/></button>
          </span>
            </div>
          </form>
          <ul className="sidebar-menu">
            <li className="header">MAIN NAVIGATION</li>
            <li>
              <Link to="/columns" activeClassName="active"><i className="fa fa-shopping-cart"/> <span>Catalog</span></Link>
            </li>
            <li>
              <Link to="/treemap" activeClassName="active"><i className="fa fa-trello"/> <span>Treemap</span></Link>
            </li>
            <li>
              <Link to="/grid/table-data-source" activeClassName="active"><i className="fa fa-database"/> <span>Table Sources</span></Link>
            </li>
            <li>
              <Link to="/grid/table-dataset" activeClassName="active"><i className="fa fa-table"/> <span>Tables</span></Link>
            </li>
            <li>
              <Link to="/grid/file-data-source" activeClassName="active"><i className="fa fa-file-o"/> <span>File Sources</span></Link>
            </li>
            <li>
              <Link to="/grid/file-dataset" activeClassName="active"><i className="fa fa-file-text-o"/> <span>Files</span></Link>
            </li>
            <li>
              <Link to="/grid/tag" activeClassName="active"><i className="fa fa-tags"/> <span>Tags</span></Link>
            </li>
          </ul>
        </section>
      </aside>
    );
  }
}