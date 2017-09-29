import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MiniBarButton from './MiniBarButton';
import * as styles from './styles/index';
import injectStores from '../../../utils/injectStores';

@injectStores('storeMobx', 'storeMobxReact')
export default class MiniBar extends Component {
  static propTypes = {
    position: PropTypes.shape({
      top: PropTypes.string,
      bottom: PropTypes.string,
      left: PropTypes.string,
      right: PropTypes.string
    })
  };

  static defaultProps = {
    position: {
      top: '0px',
      right: '20px'
    }
  };

  handleToggleUpdates = () => this.props.storeMobxReact.toggleShowingUpdates();
  handleToggleGraph = () => this.props.storeMobxReact.togglePickingDeptreeComponent();
  handleToggleConsoleLogging = () => this.props.storeMobx.toggleConsoleLogging();

  render() {
    const { position } = this.props;
    const { storeMobx, storeMobxReact } = this.props;

    const additionalMiniPanelStyles = {};
    additionalMiniPanelStyles.top = position.top;
    additionalMiniPanelStyles.right = position.right;
    additionalMiniPanelStyles.bottom = position.bottom;
    additionalMiniPanelStyles.left = position.left;

    return (
      <div style={Object.assign({}, styles.panel, additionalMiniPanelStyles)}>
        <MiniBarButton
          id="buttonUpdates"
          onToggle={this.handleToggleUpdates}
          active={storeMobxReact.state.updatesEnabled}
        />
        <MiniBarButton
          id="buttonGraph"
          onToggle={this.handleToggleGraph}
          active={storeMobxReact.state.graphEnabled}
        />
        <MiniBarButton
          id="buttonConsoleLog"
          active={storeMobx.state.consoleLogEnabled}
          onToggle={this.handleToggleConsoleLogging}
        />
      </div>
    );
  }
}
