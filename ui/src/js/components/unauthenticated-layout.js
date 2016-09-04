import React from 'react';
import Header from './header';
import Content from './content';
import Footer from './footer';

export default class UnauthenticatedLayout extends React.Component {

  componentDidMount() {
    let body = document.body;
    body.className = body.className.replace('sidebar-mini', 'sidebar-collapse');
  }

  render() {
    return (
      <div>
        <Header/>
        <Content>{this.props.children}</Content>
        <Footer/>
      </div>
    );
  }
}