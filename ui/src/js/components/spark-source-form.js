import React from 'react';

export default class SparkSourceForm extends React.Component {

  constructor() {
    super();
    this.state = {
      form: {
        name: null,
        serverType: 'SPARK',
        serverVersion: '1.5.1',
        host: 'local[4]',
        dbName: null,
        username: null,
        password: null
      }
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(key, event) {
    let form = this.state.form;
    form[key] = event.target.value;
    this.setState({form: form});
  }

  handleSubmit() {
    this.props.onSubmit(this.state.form);
  }

  render() {
    return (
      <form id={this.props.name + '-form'} ref={this.props.name + '-form'} role="form" className="form-horizontal">
        <div className="form-group">
          <label htmlFor="source-name" className="col-sm-4 control-label">Source Name</label>
          <div className="col-sm-8">
            <input className="form-control" id="source-name"
                   name="name" placeholder="Source Name" value={this.state.form.name}
                   onChange={this.handleChange.bind(this, 'name')}/>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="master" className="col-sm-4 control-label">Master</label>
          <div className="col-sm-8">
            <input className="form-control" id="master"
                   name="master" placeholder="Master" value={this.state.form.host}
                   onChange={this.handleChange.bind(this, 'host')}/>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="filepath" className="col-sm-4 control-label">File path</label>
          <div className="col-sm-8">
            <input className="form-control" id="filepath"
                   name="dbName" placeholder="File path" value={this.state.form.dbName}
                   onChange={this.handleChange.bind(this, 'dbName')}/>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="username" className="col-sm-4 control-label">User Name</label>
          <div className="col-sm-8">
            <input className="form-control" id="username"
                   name="username" placeholder="User name" value={this.state.form.username}
                   onChange={this.handleChange.bind(this, 'username')}/>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="password" className="col-sm-4 control-label">Password</label>
          <div className="col-sm-8">
            <input className="form-control" id="password"
                   name="password" placeholder="Password" value={this.state.form.password}
                   onChange={this.handleChange.bind(this, 'password')}/>
          </div>
        </div>
        <div className="form-group">
          <div className="col-sm-offset-4 col-sm-8">
            <button ref="submitBtn" type="button" className="btn btn-default"
                    onClick={this.handleSubmit} data-loading-text="Connecting..."
                    autoComplete="off">Register</button>
          </div>
        </div>
      </form>
    );
  }
}