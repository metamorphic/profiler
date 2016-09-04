import React from 'react';

export default class Content extends React.Component {

  render() {
    return (
      <div className="content-wrapper">
        <section className="content">
          {this.props.children}
        </section>
      </div>
    );
  }
}