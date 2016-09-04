import React from 'react';

export default class Mailbox extends React.Component {

  render() {
    const requests = this.props.requests;
    if (requests && requests.length) {
      return (
          <div className="clearfix">
            <div className="mailbox pull-right">
              <h1>
                <a href="#mailbox-items"
                   aria-expanded="true" aria-controls="mailbox-items">Analysis Requests Inbox</a>
              </h1>
              <div className="collapse in" id="mailbox-items">
                <table>
                  <tbody>
                  {requests.map((req, i) =>
                    (
                        <tr key={'req-' + i}>
                          <td>
                            <a href="#" onClick={self.props.onSelect.bind(null, req.sourceName)}>{req.sourceName}</a>
                          </td>
                          <td>{req.analysisStatus}</td>
                        </tr>
                    )
                  )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
      );
    } else {
      return (
          <p>No pending requests</p>
      );
    }
  }
}