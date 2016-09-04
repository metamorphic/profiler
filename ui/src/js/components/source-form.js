import React from 'react';
import StoreWatchMixin from '../mixins/store-watch-mixin';
import AppStore from '../stores/app-store';
import * as AppActions from '../actions/app-actions';
import PostgresSourceForm from './postgres-source-form';
import TeradataSourceForm from './teradata-source-form';
import OracleSourceForm from './oracle-source-form';
import FileSourceForm from './file-source-form';
import SparkSourceForm from './spark-source-form';

export default React.createClass({

  mixins: [StoreWatchMixin(getTables)],

  changeSource(sourceId) {
    this.setState({selectedSourceType: sourceId});
  },

  handleTableSourceSubmit(conn) {
    AppActions.getTables(conn)
      .then(() =>
        this.props.onRegister('TABLE', this.state.tables, conn.name)
      );
  },

  handleFileSourceSubmit(response) {
    this.props.onRegister('FILE', response);
  },

  render() {
    let title, form;
    switch (this.state.selectedSourceType) {
      case 0:
        title = 'Postgres Source';
        form = (
          <PostgresSourceForm name="postgres-source" onSubmit={this.handleTableSourceSubmit}/>
        );
        break;
      case 1:
        title = 'Teradata Source';
        form = (
          <TeradataSourceForm name="teradata-source" onSubmit={this.handleTableSourceSubmit}/>
        );
        break;
      case 2:
        title = 'Oracle Source';
        form = (
          <OracleSourceForm name="oracle-source" onSubmit={this.handleTableSourceSubmit}/>
        );
        break;
      case 3:
        title = 'HDFS Source';
        form = (
          <PostgresSourceForm name="hdfs-source" onSubmit={this.handleTableSourceSubmit}/>
        );
        break;
      case 4:
        title = 'Spark Parquet';
        form = (
          <SparkSourceForm name="spark-file-source" onSubmit={this.handleFileSourceSubmit}/>
        );
        break;
      case 5:
        title = 'Delimited File';
        form = (
          <FileSourceForm name="delimited-file-source" onSubmit={this.handleFileSourceSubmit}/>
        );
        break;
      case 6:
        title = 'JSON Document';
        form = (
          <FileSourceForm name="json-file-source" onSubmit={this.handleFileSourceSubmit}/>
        );
    }
    return (
      <div className="miller-columns clearfix">
        <div className="panel panel-default" style={{minWidth: 150}}>
          <ul className="list-group">
            <li className="list-group-item">
              <a href="#" onClick={this.changeSource.bind(this, 0)}>Postgres Database</a>
            </li>
            <li className="list-group-item">
              <a href="#" onClick={this.changeSource.bind(this, 1)}>Teradata Database</a>
            </li>
            <li className="list-group-item">
              <a href="#" onClick={this.changeSource.bind(this, 2)}>Oracle Database</a>
            </li>
            <li className="list-group-item">
              <a href="#" onClick={this.changeSource.bind(this, 3)}>HDFS</a>
            </li>
            <li className="list-group-item">
              <a href="#" onClick={this.changeSource.bind(this, 4)}>Spark Parquet</a>
            </li>
            <li className="list-group-item">
              <a href="#" onClick={this.changeSource.bind(this, 5)}>Delimited File</a>
            </li>
            <li className="list-group-item">
              <a href="#" onClick={this.changeSource.bind(this, 6)}>JSON File</a>
            </li>
          </ul>
        </div>
        <div className="panel panel-default" style={{minWidth: 418, height: 502}}>
          <div className="panel-heading">{title}</div>
          <div className="panel-body">
            {form}
          </div>
        </div>
      </div>
    );
  }
});

function getTables() {
  return {
    tables: AppStore.getTables(),
    selectedSourceType: 0
  };
}
