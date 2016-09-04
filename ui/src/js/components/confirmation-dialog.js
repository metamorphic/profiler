import React from 'react';
import { Modal } from 'metaform';

export default class ConfirmationDialog extends React.Component {

  static propTypes = {
    title: React.PropTypes.string,
    message: React.PropTypes.string.isRequired,
    onConfirm: React.PropTypes.func
  };

  render() {
    return (
      <Modal id="modal1" title={this.props.title || 'Confirm'}>
        <p>{this.props.message}</p>
        <button type="button" className="btn btn-default"
                style={{marginRight: 10}} data-dismiss="modal">Cancel</button>
        <button type="button" className="btn btn-primary" onClick={this.props.onConfirm}>OK</button>
      </Modal>
    );
  }
}
