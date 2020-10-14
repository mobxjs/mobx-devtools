import React from 'react';
import PropTypes from 'prop-types';
import { css, StyleSheet } from 'aphrodite';
import PropVal from './PropVal';

export default class Props extends React.PureComponent {
  static propTypes = {
    props: PropTypes.object,
  };

  render() {
    const { props } = this.props;
    if (!props || typeof props !== 'object') {
      return <span />;
    }

    const names = Object.keys(props).filter((name) => name !== 'children');

    const items = [];

    names.slice(0, 3).forEach((name) => {
      items.push(
        <span key={`prop-${name}`} className={css(styles.prop)}>
          <span className={css(styles.attributeName)}>{name}</span>
          =
          <PropVal val={props[name]} />
        </span>
      );
    });

    if (names.length > 3) {
      items.push(
        <span key="ellipsis" className={css(styles.ellipsis)}>
          …
        </span>
      );
    }
    return <span>{items}</span>;
  }
}

const styles = StyleSheet.create({
  attributeName: {
    color: 'var(--treenode-props-key)',
  },
  ellipsis: {
    color: 'var(--treenode-props-ellipsis)',
  },
  prop: {
    paddingLeft: 5,
    color: 'var(--treenode-props)',
  },
});
