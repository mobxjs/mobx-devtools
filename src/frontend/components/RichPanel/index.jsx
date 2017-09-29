import React from 'react';
import Log from '../Log/index';
import Graph from '../Graph/index';
import MiniBarButton from '../../../shells/react/MiniBar/MiniBarButton';
import Blocker from '../Blocker/index';
import injectStores from '../../../utils/injectStores';

@injectStores('storeMobx', 'storeMobxReact')
export default class RichPanel extends React.Component {
  componentDidMount() {
    document.addEventListener('keydown', this.$handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.$handleKeyDown);
  }

  $handleKeyDown = e => {
    if (!e.metaKey) return;
    switch (e.keyCode) {
      case 75: // k
        e.preventDefault();
        this.handleClearLog();
        break;
      case 76: // l
        e.preventDefault();
        this.handleToggleLogging();
        break;
      case 80: // p
        e.preventDefault();
        this.handleToggleGraph();
        break;
      case 85: // u
        e.preventDefault();
        this.handleToggleUpdates();
        break;
      default:
        break;
    }
  };

  handleToggleUpdates = () => this.props.storeMobxReact.toggleShowingUpdates();
  handleToggleGraph = () => this.props.storeMobxReact.togglePickingDeptreeComponent();
  handleToggleConsoleLogging = () => this.props.storeMobx.toggleConsoleLogging();
  handleToggleLogging = () => this.props.storeMobx.toggleLogging();
  handleClearLog = () => this.props.storeMobx.clearLog();

  render() {
    const {
      logEnabled,
      consoleLogEnabled,
      log,
    } = this.props.storeMobx.state;
    const {
      graphEnabled,
      mobxReactFound,
      updatesEnabled,
    } = this.props.storeMobxReact.state;

    return (
      <div style={{ width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
        {graphEnabled && (
          <Blocker icon="pick" onClick={this.handleToggleGraph}>
            Pick the component
          </Blocker>
        )}

        <div style={{ display: 'flex', flex: '0 0 26px', borderBottom: '1px solid #eee' }}>
          {mobxReactFound && (
            <MiniBarButton
              id="buttonUpdates"
              onToggle={this.handleToggleUpdates}
              active={updatesEnabled}
              hotkey="u"
            />
          )}
          {mobxReactFound && (
            <MiniBarButton
              id="buttonGraph"
              onToggle={this.handleToggleGraph}
              active={graphEnabled}
              hotkey="p"
            />
          )}
          <MiniBarButton
            id="buttonLog"
            active={logEnabled}
            onToggle={this.handleToggleLogging}
            hotkey="l"
          />
          <MiniBarButton
            id="buttonConsoleLog"
            active={consoleLogEnabled}
            onToggle={this.handleToggleConsoleLogging}
          />

          {log.length > 0 && (
            <MiniBarButton
              style={{ marginLeft: 'auto' }}
              id="buttonClear"
              active={false}
              onToggle={this.handleClearLog}
              hotkey="k"
            />
          )}
        </div>

        <Log />

        <Graph />
      </div>
    );
  }
}
