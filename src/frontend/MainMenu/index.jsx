import React from 'react';
import PropTypes from 'prop-types';
import { css, StyleSheet } from 'aphrodite';
import Tab from './MainMenuTab';

const getTitle = type => {
  switch (type) {
    case 'changes':
      return 'Changes';
    case 'performance':
      return 'Performance';
    case 'mst':
      return 'MST';
    default:
      return type;
  }
};

MainMenu.propTypes = {
  availableTabs: PropTypes.arrayOf(PropTypes.string).isRequired,
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
  processingTabs: PropTypes.array.isRequired,
};

export default function MainMenu({ availableTabs, activeTab, onTabChange, processingTabs }) {
  return (
    <div className={css(styles.container)} data-test="MainMenu">
      {availableTabs.map(type => (
        <Tab
          key={type}
          type={type}
          active={activeTab === type}
          onClick={() => onTabChange(type)} // eslint-disable-line react/jsx-no-bind
          processing={processingTabs.includes(type)}
        >
          {getTitle(type)}
        </Tab>
      ))}
    </div>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: '0 0 auto',
    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
    padding: '0 10px',
  },
});
