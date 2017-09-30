import React, { Component } from 'react';
import injectStores from '../../../utils/injectStores';

@injectStores('storeMST')
export default class Log extends Component {

  render() {
    const { mstFound, snapshots, patches, actions } = this.props.storeMST.state;
    console.log(this.props.storeMST.state)
    if (!mstFound) return null;
    return (
      <div
        ref={el => {
          this.containerEl = el;
        }}
      >
        <h6>Snapshots:</h6>
        <ul>{snapshots.map((s, i) => <li key={i}>{JSON.stringify(s)}</li>)}</ul>
        <h6>Patches:</h6>
        <ul>{patches.map((p, i) => <li key={i}>{JSON.stringify(p)}</li>)}</ul>
        <h6>Actions:</h6>
        <ul>{actions.map((a, i) => <li key={i}>{JSON.stringify(a)}</li>)}</ul>
      </div>
    );
  }
}
