import React from 'react';
import PropTypes from 'prop-types';
import Player from './Player';
import injectStores from '../../utils/injectStores';

@injectStores({
  subscribe: {
    capabilitiesStore: ['mstFound'],
    mstLoggerStore: ['snapshots', 'patches', 'actions'],
  },
  injectProps: ({ mstLoggerStore, capabilitiesStore }) => ({
    mstFound: capabilitiesStore.mstFound,
    snapshots: mstLoggerStore.snapshots,
    patches: mstLoggerStore.patches,
    actions: mstLoggerStore.actions,
  }),
})
export default class Log extends React.PureComponent {
  static propTypes = {
    mstFound: PropTypes.bool,
    snapshots: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    patches: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    actions: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  };
  render() {
    if (!this.props.mstFound) return null;

    /* eslint-disable react/no-array-index-key */
    return (
      <div
        ref={(el) => {
          this.containerEl = el;
        }}
      >
        <h6>Snapshots:</h6>
        <ul>{this.props.snapshots.map((s, i) => <li key={i}>{JSON.stringify(s)}</li>)}</ul>
        <h6>Patches:</h6>
        <ul>{this.props.patches.map((p, i) => <li key={i}>{JSON.stringify(p)}</li>)}</ul>
        <h6>Actions:</h6>
        <ul>{this.props.actions.map((a, i) => <li key={i}>{JSON.stringify(a)}</li>)}</ul>
        <Player />
      </div>
    );
  }
}
