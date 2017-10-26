import React from 'react';
import PropTypes from 'prop-types';
import Graph from '../../../src/frontend/Graph';
import injectStores from '../../../src/utils/injectStores';
import ModalContainer from '../../../src/frontend/ModalContainer';

@injectStores({
  subscribe: {
    updatesHighlighterStore: ['dependencyTree'],
  },
  injectProps: ({ updatesHighlighterStore }) => ({
    dependencyTree: updatesHighlighterStore.dependencyTree,
    clearDeptree() {
      updatesHighlighterStore.clearDeptree();
    },
  }),
})
export default class ModalGraph extends React.Component {
  static propTypes = {
    dependencyTree: PropTypes.object,
    clearDeptree: PropTypes.func.isRequired,
  };

  render() {
    if (!this.props.dependencyTree) return null;
    return (
      <ModalContainer onOverlayClick={this.props.clearDeptree}>
        <div style={styles.graph}>
          <span style={styles.close} onClick={this.props.clearDeptree}>
            ×
          </span>
          <Graph dependencyTree={this.props.dependencyTree} />
        </div>
      </ModalContainer>
    );
  }
}
const styles = {
  graph: {
    background: 'white',
    padding: '4%',
  },
  close: {
    color: 'rgba(0, 0, 0, 0.2)',
    fontSize: '36px',
    position: 'absolute',
    top: '5px',
    right: '5px',
    width: '40px',
    height: '40px',
    lineHeight: '34px',
    textAlign: 'center',
    cursor: 'pointer',
    zIndex: 1,
  },
};
