import React from 'react';
import Dropzone from 'dropzone';
import * as AppActions from '../actions/app-actions';
import Alert from './header/header';
import $ from 'jquery';

const url = window.apiBaseURL || '/api';

export default class DropzoneView extends React.Component {

  componentDidMount() {
    Dropzone.autoDiscover = false;
    let viewportElem = this.refs['viewport'].getDOMNode();
    let previewElem = this.refs['dzPreviewContainer'].getDOMNode();
    let dz = new Dropzone(viewportElem, {
      url: url + '/sniff',
      previewsContainer: previewElem,
      maxFilesize: 1,
      clickable: false
    });
    dz
      .on('success', (file, response, e) =>
        AppActions.showAnalysis([response])
      )
      .on('complete', () =>
        setTimeout(() =>
          $(previewElem).hide('slow', () => {
            $(this).empty();
            $(this).show();
          })
        , 5000)
      );
  }

  render() {
    return (
      <section className="content">
        <div className="scroller dropzone" ref="viewport" id="viewport">
          <div className="scroller-inner">
            <Alert/>
            <div className="dropzone-previews" ref="dzPreviewContainer"></div>
            {this.props.children}
          </div>
        </div>
      </section>
    );
  }
}