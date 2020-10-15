import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, css } from 'aphrodite';

export default class TabsMenu extends React.PureComponent {
  static propTypes = {
    tabs: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.any,
        title: PropTypes.string,
      }),
    ).isRequired,
    currentTabId: PropTypes.any,
    onChange: PropTypes.func.isRequired,
  };

  tabRenderer = ({ id, title }) => (
    <div
      key={id}
      // eslint-disable-next-line react/jsx-no-bind
      onClick={() => this.props.onChange(id)}
      className={css(styles.tab, this.props.currentTabId === id && styles.tabActive)}
      title={title}
    >
      {title}
    </div>
  );

  render() {
    return <div className={css(styles.tabs)}>{this.props.tabs.map(this.tabRenderer)}</div>;
  }
}

const styles = StyleSheet.create({
  tabs: {
    flex: '0 0 auto',
    display: 'flex',
    padding: '5px 5px 0',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderBottom: '1px solid #ddd',
    cursor: 'default',
    userSelect: 'none',
  },
  tab: {
    padding: '3px 5px',
    borderColor: 'transparent',
    borderStyle: 'solid',
    borderWidth: '1px 1px 0',
    fontSize: 13,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  tabActive: {
    borderColor: '#ddd',
    cursor: 'default',
    backgroundColor: '#fff',
  },
});
