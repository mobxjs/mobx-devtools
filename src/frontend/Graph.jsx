import React from 'react';
import PropTypes from 'prop-types';
import { css, StyleSheet } from 'aphrodite';

TreeItem.propTypes = {
  dependencies: PropTypes.array,
  isLast: PropTypes.bool,
  isRoot: PropTypes.bool,
  name: PropTypes.string,
};

function TreeItem({
  dependencies, isLast, isRoot, name,
}) {
  return (
    <div className={css(styles.item)}>
      <span className={css(styles.box, isRoot && styles.box.root)}>{name}</span>
      {dependencies && (
        <div className={css(styles.tree)}>
          {dependencies.map((d, i) => (
            <TreeItem
              key={d.name}
              dependencies={d.dependencies}
              isLast={i === dependencies.length - 1}
            />
          ))}
        </div>
      )}
      {!isRoot && <span className={css(styles.itemHorisontalDash)} />}
      {!isRoot && (
        <span className={css(styles.itemVericalStick, isLast && styles.itemVericalStick.short)} />
      )}
    </div>
  );
}

Graph.propTypes = {
  dependencyTree: PropTypes.shape({
    dependencies: PropTypes.array,
    name: PropTypes.string,
  }),
};

export default function Graph({ dependencyTree }) {
  if (!dependencyTree) return null;
  return (
    <div style={styles.root}>
      <TreeItem
        key={dependencyTree.name}
        dependencies={dependencyTree.dependencies}
        isLast
        isRoot
      />
    </div>
  );
}

const styles = StyleSheet.create({
  tree: {
    position: 'relative',
    paddingLeft: '20px',
  },

  root: { paddingLeft: 0 },

  item: {
    position: 'relative',
  },

  box: {
    padding: '4px 10px',
    background: 'rgba(0, 0, 0, 0.05)',
    display: 'inline-block',
    marginBottom: '8px',
    color: '#000',
    root: {
      fontSize: '15px',
      fontWeight: 'bold',
      padding: '6px 13px',
    },
  },

  itemHorisontalDash: {
    position: 'absolute',
    left: '-12px',
    borderTop: '1px solid rgba(0, 0, 0, 0.2)',
    top: '14px',
    width: '12px',
    height: '0',
  },

  itemVericalStick: {
    position: 'absolute',
    left: '-12px',
    borderLeft: '1px solid rgba(0, 0, 0, 0.2)',
    height: '100%',
    width: 0,
    top: '-8px',
    short: {
      height: '23px',
    },
  },
});
