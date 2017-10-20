import React from 'react';
import PropTypes from 'prop-types';
import { css, StyleSheet } from 'aphrodite';
import injectStores from '../../utils/injectStores';
import Checkbox from './Checkbox';

@injectStores({
  subscribe: {
    updatesHighlighterStore: ['updatesEnabled', 'updatesFilterByDuration'],
  },
  injectProps: ({ updatesHighlighterStore }) => ({
    updatesEnabled: updatesHighlighterStore.updatesEnabled,
    updatesFilterByDuration: updatesHighlighterStore.updatesFilterByDuration,
    toggleShowingUpdates() {
      updatesHighlighterStore.toggleShowingUpdates();
    },
    toggleFastUpdates() {
      const { updatesFilterByDuration } = updatesHighlighterStore;
      updatesHighlighterStore.setUpdatesFilterByDuration({
        ...updatesFilterByDuration,
        fast: !updatesFilterByDuration.fast,
      });
    },
    toggleMediumUpdates() {
      const { updatesFilterByDuration } = updatesHighlighterStore;
      updatesHighlighterStore.setUpdatesFilterByDuration({
        ...updatesFilterByDuration,
        medium: !updatesFilterByDuration.medium,
      });
    },
    toggleSlowUpdates() {
      const { updatesFilterByDuration } = updatesHighlighterStore;
      updatesHighlighterStore.setUpdatesFilterByDuration({
        ...updatesFilterByDuration,
        slow: !updatesFilterByDuration.slow,
      });
    },
  }),
})
export default class TabPerformance extends React.PureComponent {
  static propTypes = {
    updatesEnabled: PropTypes.bool,
    toggleShowingUpdates: PropTypes.func.isRequired,
    toggleFastUpdates: PropTypes.func.isRequired,
    toggleMediumUpdates: PropTypes.func.isRequired,
    toggleSlowUpdates: PropTypes.func.isRequired,
    updatesFilterByDuration: PropTypes.shape({
      slow: PropTypes.bool,
      medium: PropTypes.bool,
      fast: PropTypes.bool,
    }).isRequired,
  };

  shownAllUpdates() {
    const { slow, medium, fast } = this.props.updatesFilterByDuration;
    return slow && medium && fast;
  }

  render() {
    const { updatesEnabled, updatesFilterByDuration } = this.props;
    return (
      <div>
        <div className={css(styles.panelBody)}>
          <div className={css(styles.block)}>
            <div className={css(styles.blockHeding)}>Show updates</div>
            <label>
              <Checkbox
                checked={updatesEnabled}
                indeterminate={updatesEnabled && !this.shownAllUpdates()}
                onClick={this.props.toggleShowingUpdates}
              />
              Any
            </label>
            <div className={css(styles.filterCheckboxes)}>
              <div>
                <label>
                  <Checkbox
                    checked={updatesFilterByDuration.fast}
                    onChange={this.props.toggleFastUpdates}
                  />
                  Fast
                </label>
              </div>
              <div>
                <label>
                  <Checkbox
                    checked={updatesFilterByDuration.medium}
                    onChange={this.props.toggleMediumUpdates}
                  />
                  Medium
                </label>
              </div>
              <div>
                <label>
                  <Checkbox
                    checked={updatesFilterByDuration.slow}
                    onChange={this.props.toggleSlowUpdates}
                  />
                  Slow
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const styles = StyleSheet.create({
  panelBody: {
    padding: '15px 10px',
  },
  block: {
    padding: '10px',
    background: '#f7f7f7',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
    userSelect: 'none',
  },
  blockHeding: {
    fontSize: 17,
    color: 'var(--lighter-text-color)',
    fontWeight: 500,
    marginBottom: 5,
  },
  filterCheckboxes: {
    marginLeft: 10,
  },
});
