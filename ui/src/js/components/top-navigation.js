import React from 'react';
import { Link } from 'react-router';

export default class TopNavigation extends React.Component {

  render() {
    return (
      <div className="view-icons">
        <Link to="/columns">
          <img src="/assets/list-view2.png" width="24px" height="24px"
               style={{marginRight: 6}}
               title="Statistics View"/>
        </Link>
        <Link to="/treemap">
          <img src="/assets/treemap-view.png" width="24px" height="24px"
               title="Treemap View"/>
        </Link>
      </div>
    );
  }
}