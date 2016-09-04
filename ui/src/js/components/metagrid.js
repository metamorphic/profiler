import React from 'react';
import { History, Link } from 'react-router';
import { global, Grid, Modal, Truncated } from 'metaform';
import pluralize from 'pluralize';
import bootstrap from 'bootstrap';
import AppStore from '../stores/app-store';
import * as AppActions from '../actions/app-actions';
import TableSelectionForm from './table-selection-form';
import ConfirmationDialog from './confirmation-dialog';

export default React.createClass({

  mixins: [History],

  fetchAnalysis(id) {
    AppActions.fetchAnalysis(id)
      .then(() => {
        const response = AppStore.getAnalysis();
        if (response && response.length &&
            response[0].columns && response[0].columns.length &&
            response[0].columns[0].metricsMap &&
            Object.keys(response[0].columns[0].metricsMap).length) {
          //Router.environment.defaultEnvironment.navigate('/');
          this.history.pushState(null, '/');
        } else {
          // present confirmation to do analysis
          const doAnalysis = () =>
            AppActions.getTablesForDataSource(id)
              .then(this.selectTables);
          const container = document.getElementById('modals');
          const dialog = (
            <ConfirmationDialog message="This source has not been analysed. Perform analysis?"
                                onConfirm={doAnalysis}/>
          );
          React.render(dialog, container);
          $('#modal1').on('hidden.bs.modal', () =>
            React.unmountComponentAtNode(container)
          ).modal('show');
        }
      });
  },

  selectTables() {
    const response = AppStore.getTables();
    const tables = response.tables;
    const tableDataSourceId = response.tableDataSourceId;
    const container = document.getElementById('modals');
    const form = (
      <Modal id="modal1" title="Select Tables">
        <TableSelectionForm tables={tables} onSubmit={this.submitTablesForAnalysis.bind(this, tableDataSourceId)}/>
      </Modal>
    );
    React.render(form, container);
    $('#modal1').on('hidden.bs.modal', () =>
      React.unmountComponentAtNode(container)
    ).modal('show');
  },

  submitTablesForAnalysis(tableDataSourceId, tables) {
    AppActions.analyzeTables(tableDataSourceId, tables)
      .then(() => {
        $('#modal1').modal('hide');
        Router.environment.defaultEnvironment.navigate('/');
      });
  },

  render() {
    let computedColumns = null, sortBy = null, order = null, view = null;
    let filter = this.props.params.filter || 'filter';
    let name = this.props.params.name || 'data-source';
    let nameColumn = 'name';
    let editable = false;
    let projection = ['name', 'description'];
    let url = pluralize(name);

    if (name == 'file-data-source') {
      filter = filter || 'filter';
      projection = ['name', 'analysisStatus', 'description'];
      computedColumns = {
        description: {
          compute: (row) =>
            (
              <Truncated text={row.description}/>
            )
        }
      };
    } else if (name === 'table-data-source') {
      view = 'grid';
      projection = ['name', 'serverType', 'serverVersion', 'analysisStatus', 'description'];
      editable = true;
      computedColumns = {
        description: {
          compute: (row) =>
            (
              <Truncated text={row.description}/>
            )
        },
        actions: [
          (row) =>
            ({
              title: 'Show Analysis',
              iconClassName: 'fa fa-bar-chart',
              onClick: this.fetchAnalysis.bind(this, row.id)
            })
        ]
      };
    } else if (name === 'table-dataset') {
      view = 'grid';
      projection = ['name', 'namespace', 'analysisStatus', 'description', 'drilldown'];
      computedColumns = {
        description: {
          compute: (row) =>
            (
              <Truncated text={row.description}/>
            )
        },
        drilldown: {
          compute: (row) =>
            (
              <Link to={'/grid/table-column/' + row.name + '/by-dataset-and-filter/datasetId=' + row.id}
                    title="Show Columns"><span className="fa fa-columns" aria-hidden="true"/>
              </Link>
            )
        }
      };
    } else if (name === 'file-dataset') {
      view = 'grid';
      projection = ['id', 'name', 'namespace', 'analysisStatus', 'description', 'drilldown'];
      computedColumns = {
        description: {
          compute: (row) =>
            (
              <Truncated text={row.description}/>
            )
        },
        drilldown: {
          compute: (row) =>
            (
              <Link to={'/grid/file-column/' + row.name + '/by-dataset-and-filter/datasetId=' + row.id}
                    title="Show Columns"><span className="fa fa-columns" aria-hidden="true"/>
              </Link>
            )
        }
      };
    } else if (name === 'table-column') {
      view = 'grid';
      projection = ['name', 'columnIndex', 'dataTypeName', 'analysisStatus', 'description'];
      sortBy = 'columnIndex';
    } else if (name === 'file-column') {
      view = 'grid';
      projection = ['name', 'columnIndex', 'dataTypeName', 'analysisStatus', 'description'];
      sortBy = 'columnIndex';
    } else if (name === 'tag') {
      view = 'grid';
      projection = ['name'];
      editable = true;
    }
    global.router = this.history;

    return (
      <Grid ref="grid1" source={'$ds1url/' + url} entity={name}
            projection={projection} nameColumn={nameColumn}
            sortBy={sortBy} order={order} view={view}
            parent={this.props.params.parentName} filter={filter} filterParam={this.props.params.filterParam}
            computedColumns={computedColumns} editable={editable}/>
    );
  }
});