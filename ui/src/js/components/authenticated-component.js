import React from 'react/addons';
import AppStore from '../stores/app-store';

export default (ComposedComponent) => {

  console.log("Wrapping component with AuthenticatedComponent");

  return class AuthenticatedComponent extends React.Component {

    static willTransitionTo(transition) {
      console.log("calling willTransitionTo on AuthenticatedComponent");
      // This method is called before transitioning to this component.
      // If not logged in, the user will be redirected to the Login page.
      if (!AppStore.isAuthenticated()) {
        transition.redirect('/login', {}, {nextPath: transition.path});
      }
    }

    constructor(props) {
      super(props);
      console.log("New AuthenticatedComponent");
      this.state = this._getLoginState();
    }

    _getLoginState() {
      return {
        authenticated: AppStore.isAuthenticated(),
        user: AppStore.getUser()
      };
    }

    componentDidMount() {
      AppStore.addWatch(this._onChange.bind(this));
    }

    _onChange() {
      this.setState(this._getLoginState());
    }

    componentWillUnmount() {
      AppStore.removeWatch(this._onChange.bind(this));
    }

    render() {
      console.log("Rendering AuthenticatedComponent");
      return (
        <ComposedComponent
          {...this.props}
          user={this.state.user}
          authenticated={this.state.authenticated}/>
      );
    }
  }
}