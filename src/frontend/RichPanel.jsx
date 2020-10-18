import React from 'react';
import PropTypes from 'prop-types';
import TabChanges from './TabChanges';
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
    mstLoggerStore: ['mstLogEnabled'],
  },
  injectProps: ({
    actionsLoggerStore,
    updatesHighlighterStore,
    capabilitiesStore,
    mstLoggerStore,
  }) => ({
    mobxReactFound: capabilitiesStore.mobxReactFound,
    mstFound: capabilitiesStore.mstFound,
    recordingActions: actionsLoggerStore.logEnabled,
    showingUpdates: updatesHighlighterStore.updatesEnabled,
    mstLogEnabled: mstLoggerStore.mstLogEnabled,
  }),
})
export default class RichPanel extends React.Component {
  static propTypes = {
    mobxReactFound: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
    mstFound: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
    recordingActions: PropTypes.bool,
    showingUpdates: PropTypes.bool,
    mstLogEnabled: PropTypes.bool,
  };

  componentWillMount() {
    this.setState({ activeTab: this.getAvailableTabs()[0] });
    preferences.get('lastTab').then(({ lastTab = 'changes' }) => {
      if (lastTab) {
        if (this.getAvailableTabs().includes(lastTab)) {
          this.setState({ activeTab: lastTab });
        } else {
          this.setState({ preferredTab: lastTab });
        }
      }
    });
  }

  componentWillUpdate(nextProps) {
    if (
      this.state.preferredTab &&
      this.state.activeTab !== this.state.preferredTab &&
      this.getAvailableTabs(nextProps).includes(this.state.preferredTab)
    ) {
      // eslint-disable-next-line react/no-will-update-set-state
      this.setState({ activeTab: this.state.preferredTab });
    }
  }

  getAvailableTabs(props = this.props) {
    return [props.mstFound && 'mst', 'changes', props.mobxReactFound && 'performance'].filter(
      t => t,
    );
  }

  handleTabChage = tab => {
    this.setState({ activeTab: tab, preferredTab: tab });
    preferences.set({ lastTab: tab });
  };

  renderContent() {
    switch (this.state.activeTab) {
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
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <MainMenu
          availableTabs={availableTabs}
          activeTab={this.state.activeTab}
          onTabChange={this.handleTabChage}
          processingTabs={[
            this.props.recordingActions && 'changes',
            this.props.showingUpdates && 'performance',
            this.props.mstLogEnabled && 'mst',
          ]}
        />

        {this.renderContent()}

        <ContextMenu />
      </div>
    );
  }
}
