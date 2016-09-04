import React from 'react';
import StoreWatchMixin from '../mixins/store-watch-mixin';
import AppStore from '../stores/app-store';
import * as AppActions from '../actions/app-actions';
import TopNavigation from './top-navigation';

export default React.createClass({

  mixins: [StoreWatchMixin(getTreemap)],

  componentDidMount() {
    AppActions.getTreemap();
  },

  componentWillUpdate(nextProps, nextState) {
    if (CarrotSearchFoamTree.supported) {
      new CarrotSearchFoamTree({
        id: 'treemap',
        dataObject: nextState.dataObject
      });
    } else {
      console.log('FoamTree not supported');
    }
  },

  render() {
    return (
      <div className="treemap-view">
        <TopNavigation/>
        <fieldset>
          <legend>Treemap</legend>
          <div id="treemap"/>
          <p>
            Relative size is determine by number of items.
          </p>
        </fieldset>
      </div>
    );
  }
});

function getTreemap() {
  return {
    dataObject: {
      groups: AppStore.getTreemap()
    }
  }
}
