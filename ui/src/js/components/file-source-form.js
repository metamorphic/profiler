import React from 'react';
import Dropzone from 'dropzone';

const url = window.apiBaseURL || '/api';

export default class FileSourceForm extends React.Component {

  componentDidMount() {
    const dz1 = this.refs.dz1.getDOMNode();
    const previewElem = this.refs.dzPreviewContainer.getDOMNode();
    let dz = new Dropzone(dz1, {
      url: url + '/sniff',
      previewsContainer: previewElem,
      maxFilesize: 1
    });
    dz.on('success', (file, response, e) =>
      this.props.onSubmit(response)
    );
  }

  render() {
    // can't use a fallback element in dropzone
    // dropzone will remove it if not required,
    // which causes an Invariant Violation when
    // React tries to find it on unmounting.
    return (
      <div className="file-chooser-component">
        <form className="dropzone" ref="dz1">
          <div className="dz-message">
            <a href="#">Browse</a> this computer
          </div>
          <div className="dropzone-previews" ref="dzPreviewContainer"></div>
        </form>
      </div>
    );
  }
}