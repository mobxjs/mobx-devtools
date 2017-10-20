import React from 'react';
import PropTypes from 'prop-types';
import { css, StyleSheet } from 'aphrodite';
import SecondaryPanel from '../SecondaryPanel';
import ButtonRecord from '../SecondaryPanel/ButtonRecord';
import ButtonClear from '../SecondaryPanel/ButtonClear';
import Log from './Log';
import injectStores from '../../utils/injectStores';

@injectStores({
  subscribe: {
    actionsLoggerStore: ['logEnabled', 'log'],
  },
  injectProps: ({ actionsLoggerStore }) => ({
    logEnabled: actionsLoggerStore.logEnabled,
    logItemsIds: actionsLoggerStore.logItemsIds,
    clearLog() {
      actionsLoggerStore.clearLog();
    },
    toggleLogging() {
      actionsLoggerStore.toggleLogging();
    },
  }),
})
export default class TabChanges extends React.PureComponent {
  static propTypes = {
    logEnabled: PropTypes.bool.isRequired,
    logItemsIds: PropTypes.array.isRequired,
    clearLog: PropTypes.func.isRequired,
    toggleLogging: PropTypes.func.isRequired,
  };

  render() {
    return (
      <div className={css(styles.panel)}>
        <SecondaryPanel>
          <ButtonRecord
            active={this.props.logEnabled}
            onClick={this.props.toggleLogging}
            showTipStartRecoding={!this.props.logEnabled && this.props.logItemsIds.length === 0}
          />
          <ButtonClear onClick={this.props.clearLog} />
        </SecondaryPanel>
        <Log />
      </div>
    );
  }
}

const styles = StyleSheet.create({
  panel: {
    flex: '1 1 auto',
    display: 'flex',
    flexDirection: 'column',
  },
  panelBody: {
    display: 'flex',
    flex: '1 1 auto',
  },
  leftPane: {
    width: '100%',
    flex: '1 1 auto',
  },
  rightPane: {
    width: '100%',
    flex: '1 1 auto',
    padding: 10,
  },
});
