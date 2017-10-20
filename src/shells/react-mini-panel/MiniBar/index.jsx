import React from 'react';
import PropTypes from 'prop-types';
import MiniBarButton from './MiniBarButton';
import * as styles from './styles';
import injectStores from '../../../utils/injectStores';

@injectStores({
  subscribe: {
    updatesHighlighterStore: ['updatesEnabled', 'graphEnabled'],
    actionsLoggerStore: ['consoleLogEnabled'],
  },
  injectProps: ({ actionsLoggerStore, updatesHighlighterStore }) => ({
    updatesEnabled: updatesHighlighterStore.updatesEnabled,
    graphEnabled: false,
    consoleLogEnabled: actionsLoggerStore.consoleLogEnabled,
    togglePickingDeptreeComponent() {
      console.warn('This button doesn\'t work. Sorry.'); // eslint-disable-line no-console
    },
    toggleShowingUpdates() {
      updatesHighlighterStore.toggleShowingUpdates();
    },
    toggleConsoleLogging() {
      actionsLoggerStore.toggleConsoleLogging();
    },
  }),
})
export default class MiniBar extends React.PureComponent {
  static propTypes = {
    updatesEnabled: PropTypes.bool,
    graphEnabled: PropTypes.bool,
    consoleLogEnabled: PropTypes.bool,
    toggleShowingUpdates: PropTypes.func.isRequired,
    togglePickingDeptreeComponent: PropTypes.func.isRequired,
    toggleConsoleLogging: PropTypes.func.isRequired,
    position: PropTypes.shape({
      top: PropTypes.string,
      bottom: PropTypes.string,
      left: PropTypes.string,
      right: PropTypes.string,
    }),
  };

  static defaultProps = {
    position: {
      top: '0px',
      right: '20px',
    },
  };

  render() {
    const { position } = this.props;

    const additionalMiniPanelStyles = {};
    additionalMiniPanelStyles.top = position.top;
    additionalMiniPanelStyles.right = position.right;
    additionalMiniPanelStyles.bottom = position.bottom;
    additionalMiniPanelStyles.left = position.left;

    return (
      <div style={Object.assign({}, styles.panel, additionalMiniPanelStyles)}>
        <MiniBarButton
          id="buttonUpdates"
          onToggle={this.props.toggleShowingUpdates}
          active={this.props.updatesEnabled}
        />
        <MiniBarButton
          id="buttonGraph"
          onToggle={this.props.togglePickingDeptreeComponent}
          active={this.props.graphEnabled}
        />
        <MiniBarButton
          id="buttonConsoleLog"
          active={this.props.consoleLogEnabled}
          onToggle={this.props.toggleConsoleLogging}
        />
      </div>
    );
  }
}
