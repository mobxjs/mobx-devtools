/* eslint-disable max-len */

import React from 'react';
import PropTypes from 'prop-types';

export default ({ subscribe, injectProps = () => {}, shouldUpdate }) => (TargetComponent) =>
  class StoreInjectorHOC extends React.Component {
    static contextTypes = {
      stores: PropTypes.object.isRequired,
    };

    componentWillMount() {
      const eventsByStore =
        typeof subscribe === 'function' ? subscribe(this.context.stores, this.props) : subscribe;
      for (const s in eventsByStore) {
        if (Object.prototype.hasOwnProperty.call(eventsByStore, s)) {
          eventsByStore[s].forEach((event) => {
            this.context.stores[s].subscribe(event, this.scheduleUpdate);
          });
        }
      }

      this.eventsByStore = eventsByStore || {};
    }

    componentDidMount() {
      this.$isMounted = true;
    }

    shouldComponentUpdate(nextProps) {
      if (shouldUpdate) {
        return shouldUpdate(nextProps, this.props);
      }
      return false;
    }

    componentWillUpdate(nextProps) {
      if (typeof subscribe !== 'function') return;
      const nextEventsByStore = subscribe(this.context.stores, nextProps);
      Object.keys(this.eventsByStore).forEach((s) => {
        const diff = arrayDiff(nextEventsByStore[s], this.eventsByStore[s]);
        diff.missing.forEach((name) => {
          this.context.stores[s].off(name, this.scheduleUpdate);
        });
        diff.newItems.forEach((name) => {
          this.context.stores[s].on(name, this.scheduleUpdate);
        });
      });
      Object.keys(nextEventsByStore).forEach((s) => {
        if (!Object.prototype.hasOwnProperty.call(this.eventsByStore, s)) {
          nextEventsByStore[s].forEach((name) => {
            this.context.stores[s].on(name, this.scheduleUpdate);
          });
        }
      });
      this.eventsByStore = nextEventsByStore;
    }

    componentWillUnmount() {
      this.$isMounted = false;
      this.disposables.forEach((fn) => fn());
      Object.keys(this.eventsByStore).forEach((s) => {
        this.eventsByStore[s].forEach((name) =>
          this.context.stores[s].off(name, this.scheduleUpdate),
        );
      });
    }

    eventsByStore = {};

    disposables = [];

    scheduleUpdate = () => {
      if (!this.updateTimeout) {
        this.updateTimeout = setTimeout(this.update, 5);
      }
    };

    update = () => {
      this.updateTimeout = undefined;
      if (this.$isMounted) {
        this.forceUpdate();
      }
    };

    render() {
      return <TargetComponent {...injectProps(this.context.stores, this.props)} {...this.props} />;
    }
  };

function arrayDiff(array, oldArray) {
  const names = new Set();
  const missing = [];
  for (let i = 0; i < array.length; i += 1) {
    names.add(array[i]);
  }
  for (let j = 0; j < oldArray.length; j += 1) {
    if (!names.has(oldArray[j])) {
      missing.push(oldArray[j]);
    } else {
      names.delete(oldArray[j]);
    }
  }
  return {
    missing,
    newItems: setToArray(names),
  };
}

function setToArray(set) {
  const res = [];
  for (const val of set) {
    res.push(val);
  }
  return res;
}
