/* eslint-disable max-len */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default (...requiredStores) => (TargetComponent) => class StoreInjectorHOC extends Component {

  disposables = [];

  static contextTypes = {
    stores: PropTypes.object.isRequired
  };

  componentDidMount() {
    requiredStores.forEach(k =>
      this.disposables.push(
        this.context.stores[k].subscibeUpdates(() => this.setState({}))
      )
    );
  }

  componentWillUnmount() {
    this.disposables.forEach(fn => fn());
  }

  render() {
    const injected = {};
    requiredStores.forEach(k => {
      injected[k] = this.context.stores[k];
    });
    return (
      <TargetComponent {...injected} {...this.props} />
    );
  }
};
