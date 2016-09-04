import React from 'react';
import numeral from 'numeral';
import StoreWatchMixin from '../mixins/store-watch-mixin';
import AppStore from '../stores/app-store';
import * as AppActions from '../actions/app-actions';
import { Modal } from 'metaform';
import SourceForm from './source-form';
import TableSelectionForm from './table-selection-form';
import ConfirmationDialog from './confirmation-dialog';
import TopNavigation from './top-navigation';
import Mailbox from './mailbox';

const TOP_5_LABEL = 'Top 5';

export default React.createClass({

  mixins: [StoreWatchMixin(getAnalysis)],

  componentDidMount() {
    console.log('Mounting home component');
    AppActions.subscribe('/topic/analysis', this.state.requests);
  },

  componentWillUnmount() {
    AppActions.disconnect();
  },

  changeColumn(columnIndex) {
    this.setState({selectedColumnIndex: columnIndex})
  },

  changeDataset(datasetIndex) {
    this.setState({
      selectedAnalysisIndex: datasetIndex,
      selectedColumnIndex: 0
    });
  },

  newSource() {
    const container = document.getElementById('modals');
    const form = (
      <Modal id="modal1" title="Register Source">
        <SourceForm onRegister={this.handleRegister}/>
      </Modal>
    );
    React.render(form, container);
    $('#modal1').on('hidden.bs.modal', () =>
      React.unmountComponentAtNode(container)
    ).modal('show');
  },

  handleRegister(responseType, response, sourceName) {
    if (responseType === 'TABLE') {
      if (response.error) {
        $('#modal1').modal('hide');
        setTimeout(() => this.confirmReanalysis(response), 500);
      } else {
        this.selectTables(response, sourceName);
      }
    } else {
      AppActions.showAnalysis([response])
        .then(() => $('#modal1').modal('hide'));
    }
  },

  confirmReanalysis(response) {
    const redoAnalysis = () => {
      $('#modal1').modal('hide');
      setTimeout(() => this.selectTables(response), 500);
    };
    const container = document.getElementById('modals');
    const dialog = (
      <ConfirmationDialog message="This source has already been analysed. Perform analysis again?"
                          onConfirm={redoAnalysis}/>
    );
    React.render(dialog, container);
    $('#modal1').on('hidden.bs.modal', () =>
      React.unmountComponentAtNode(container)
    ).modal('show');
  },

  selectTables(response, sourceName) {
    const tables = response.tables;
    const container = document.getElementById('modals');
    const form = (
      <Modal id="modal1" title="Select Tables">
        <TableSelectionForm tables={tables}
                            onSubmit={this.submitTablesForAnalysis.bind(this, response.tableDataSourceId, sourceName)}/>
      </Modal>
    );
    React.render(form, container);
    $('#modal1').on('hidden.bs.modal', () =>
      React.unmountComponentAtNode(container)
    ).modal('show');
  },

  submitTablesForAnalysis(tableDataSourceId, sourceName, tables) {
    AppActions.analyzeTables(tableDataSourceId, tables)
      .then(function () {
        $('#modal1').modal('hide');
      });
    //this.stompClient.send('/app/table-analysis-request', {}, JSON.stringify({
    //  dataSourceId: tableDataSourceId,
    //  tables: tables
    //}));
    let requests = this.state.requests;
    requests[sourceName] = {sourceName: sourceName, analysisStatus: 'PENDING'};
    this.setState({requests: requests});
    $('#modal1').modal('hide');
  },

  handleMailboxSelect(sourceName) {
    const request = this.state.requests[sourceName];
    if (request && request.analysisStatus === 'READY') {
      this.setState({analysis: request.datasets});
    }
  },

  render() {
    const newSourceBtn = (
      <button type="button" className="btn btn-default" onClick={this.newSource}
              style={{marginBottom: 20}}>New Source</button>
    );
    let requests = [];
    for (let key in this.state.requests) {
      requests.push(this.state.requests[key]);
    }
    if (this.state.analysis) {
      const analysis = this.state.analysis[this.state.selectedAnalysisIndex];

      let top5;
      const selectedColumn = analysis.columns[this.state.selectedColumnIndex];
      if (selectedColumn.dataType === 'NVARCHAR') {
        const filtered = values(selectedColumn.metricsMap)
            .filter((metric) => metric.name === TOP_5_LABEL);
          if (filtered.length) {
            top5 = filtered[0].value
              .map((tf) =>
                (
                  <li className="list-group-item term clearfix">
                    <label>{tf.term}</label>
                    <div>{tf.frequency}</div>
                  </li>
                )
              );
          } else {
            top5 = (
              <li className="list-group-item">NA</li>
            );
          }
      } else {
        top5 = (
          <li className="list-group-item">NA</li>
        );
      }

      const millerColumns = (
        <div className="miller-columns">
          <div className="panel panel-default">
            <div className="panel-heading">Columns</div>
            <ul className="list-group">
              {analysis.columns
                .sort((a, b) => a.columnIndex - b.columnIndex)
                .map((column, i) =>
                  (
                    <li className="list-group-item">
                      <a href="#" onClick={this.changeColumn.bind(this, i)}>{column.name}</a>
                    </li>
                  )
                )}
            </ul>
          </div>
          <div className="panel panel-default">
            <div className="panel-heading">{analysis.columns[this.state.selectedColumnIndex].name} &gt; Measures</div>
            <ul className="list-group">
              {values(analysis.columns[this.state.selectedColumnIndex].metricsMap)
                .filter((metric) => metric.name !== TOP_5_LABEL)
                .map((metric) => {
                  let v = metric.value;
                  if (v && !isNaN(v) && v.toString().indexOf('.') !== -1) {
                    v = numeral(v).format('0.000');
                  }
                  if (Array.isArray(v) && v.length && v[0].hasOwnProperty('term')) {
                    return (
                      <li className="list-group-item">
                        <label>{metric.name} (first 10)</label>
                        <ul className="list-group">
                          {v.slice(0, 10).map(x =>
                            (
                              <li className="list-group-item term clearfix">
                                <label>{x.term}</label>
                                <div>{x.frequency}</div>
                              </li>
                            )
                          )}
                        </ul>
                      </li>
                    );
                  } else {
                    return (
                      <li className="list-group-item">
                        <label>{metric.name}</label>
                        <span>{v}</span>
                      </li>
                    );
                  }
                })}
            </ul>
          </div>
          <div className="panel panel-default">
            <div className="panel-heading">{analysis.columns[this.state.selectedColumnIndex].name} &gt; Top 5</div>
            <ul className="list-group">
              {top5}
            </ul>
          </div>
        </div>
      );

      const sidepanel = (
        <div className="col-md-2">
          {newSourceBtn}
          {this.state.analysis.map((dataset, i) =>
            (
              <div>
                <a href="#" onClick={this.changeDataset.bind(this, i)}>{dataset.name}</a>
              </div>
            )
          )}
        </div>
      );

      if (analysis.datasetType === 'FILE') {
        return (
          <div className="home row">
            {sidepanel}
            <div className="col-md-10">
              <Mailbox requests={requests} onSelect={this.handleMailboxSelect}/>
              <form className="form-horizontal analysis-results">
                <TopNavigation/>
                <fieldset>
                  <legend>Analysis of {analysis.name}</legend>
                  <div className="container-fluid">
                    <div className="col-lg-4">
                      <div className="form-group">
                        <label className="control-label col-xs-5">Total rows</label>
                        <div className="col-xs-7">
                          <p className="form-control-static">
                            {values(analysis.columns[0].metricsMap)
                                .filter((metric) => metric.name === "Row count")[0].value
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-4">
                      <div className="form-group">
                        <label className="control-label col-xs-5">Column delimiter</label>
                        <div className="col-xs-7">
                          <p className="form-control-static">{analysis.fileParameters.columnDelimiter}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="container-fluid">
                    <div className="col-lg-4">
                      <div className="form-group">
                        <label className="control-label col-xs-5">Total columns</label>
                        <div className="col-xs-7">
                          <p className="form-control-static">{analysis.columns.length}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-4">
                      <div className="form-group">
                        <label className="control-label col-xs-5">Header</label>
                        <div className="col-xs-7">
                          <p className="form-control-static">{analysis.fileParameters.header ? 'YES' : 'NO'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="container-fluid">
                    <div className="col-lg-4">
                      <div className="form-group">
                        <label className="control-label col-xs-5">File type</label>
                        <div className="col-xs-7">
                          <p className="form-control-static">{analysis.fileType}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-4">
                      <div className="form-group">
                        <label className="control-label col-xs-5">Line terminator</label>
                        <div className="col-xs-7">
                          <p className="form-control-static">{analysis.fileParameters.lineTerminator}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </fieldset>
              </form>
              {millerColumns}
            </div>
          </div>
        );
      } else {
        return (
          <div className="home row">
            {sidepanel}
            <div className="col-md-10">
              <Mailbox requests={requests} onSelect={this.handleMailboxSelect}/>
              <form className="form-horizontal analysis-results">
                <TopNavigation/>
                <fieldset>
                  <legend>Analysis of {analysis.name}</legend>
                  <div className="container-fluid">
                    <div className="col-lg-4">
                      <div className="form-group">
                        <label className="control-label col-xs-5">Total rows</label>
                        <div className="col-xs-7">
                          <p className="form-control-static">
                            {values(analysis.columns[0].metricsMap)
                                .filter((metric) => metric.name === "Row count")[0].value
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-4">
                      <div className="form-group">
                        <label className="control-label col-xs-5"/>
                        <div className="col-xs-7">
                          <p className="form-control-static"/>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="container-fluid">
                    <div className="col-lg-4">
                      <div className="form-group">
                        <label className="control-label col-xs-5">Total columns</label>
                        <div className="col-xs-7">
                          <p className="form-control-static">{analysis.columns.length}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-4">
                      <div className="form-group">
                        <label className="control-label col-xs-5"/>
                        <div className="col-xs-7">
                          <p className="form-control-static"/>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="container-fluid">
                    <div className="col-lg-4">
                      <div className="form-group">
                        <label className="control-label col-xs-5"/>
                        <div className="col-xs-7">
                          <p className="form-control-static"/>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-4">
                      <div className="form-group">
                        <label className="control-label col-xs-5"/>
                        <div className="col-xs-7">
                          <p className="form-control-static"/>
                        </div>
                      </div>
                    </div>
                  </div>
                </fieldset>
              </form>
              {millerColumns}
            </div>
          </div>
        );
      }
    } else {
      return (
        <div className="home row">
          <div className="col-md-2">
            {newSourceBtn}
          </div>
          <div className="col-md-10">
            <Mailbox requests={requests} onSelect={this.handleMailboxSelect}/>
            <div className="well">Please drop in a file to profile</div>
          </div>
        </div>
      );
    }
  }
});

function getAnalysis() {
  return {
    requests: AppStore.getRequests(),
    analysis: AppStore.getAnalysis(),
    selectedAnalysisIndex: 0,
    selectedColumnIndex: 0
  };
}

function values(obj) {
  let values = [];
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      values.push(obj[key]);
    }
  }
  return values;
}
