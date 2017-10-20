import React from 'react';
import PropTypes from 'prop-types';
import TabChanges from './TabChanges';
import TabComponents from './TabComponents';
import TabPerformance from './TabPerformance';
import TabMST from './TabMST';
import MainMenu from './MainMenu';
import injectStores from '../utils/injectStores';
import ContextMenu from './ContextMenu';
import preferences from '../preferences';

@injectStores({
  subscribe: {
    updatesHighlighterStore: ['updatesEnabled'],
    actionsLoggerStore: ['logEnabled'],
    capabilitiesStore: ['mstFound', 'mobxReactFound'],
  },
  injectProps: ({
    actionsLoggerStore,
    updatesHighlighterStore,
    capabilitiesStore,
  }) => ({
    mobxReactFound: capabilitiesStore.mobxReactFound,
    mstFound: capabilitiesStore.mstFound,
    recordingActions: actionsLoggerStore.logEnabled,
    showingUpdates: updatesHighlighterStore.updatesEnabled,
  }),
})
export default class RichPanel extends React.Component {
  static propTypes = {
    mobxReactFound: PropTypes.bool,
    mstFound: PropTypes.bool,
    recordingActions: PropTypes.bool,
    showingUpdates: PropTypes.bool,
  };

  componentWillMount() {
    this.setState({ activeTab: this.getAvailableTabs()[0] });
    preferences.get('activeTab').then(({ activeTab }) => {
      if (activeTab) this.setState({ activeTab });
    });
  }

  getAvailableTabs() {
    return [
      this.props.mobxReactFound && 'components',
      this.props.mstFound && __DEV__ && 'mst',
      'changes',
      this.props.mobxReactFound && 'performance',
    ].filter(t => t);
  }

  handleTabChage = (activeTab) => {
    this.setState({ activeTab });
    preferences.set({ activeTab });
  };

  renderContent() {
    switch (this.state.activeTab) {
      case 'components':
        return <TabComponents />;
      case 'changes':
        return <TabChanges />;
      case 'mst':
        return <TabMST />;
      case 'performance':
        return <TabPerformance />;
      default:
        return null;
    }
  }

  render() {
    const availableTabs = this.getAvailableTabs();

    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <MainMenu
          availableTabs={availableTabs}
          activeTab={this.state.activeTab}
          onTabChange={this.handleTabChage}
          processingTabs={[
            this.props.recordingActions && 'changes',
            this.props.showingUpdates && 'performance',
          ]}
        />

        {this.renderContent()}

        <ContextMenu />
      </div>
    );
  }
}
