import React from 'react';
import PropTypes from 'prop-types';
import { css, StyleSheet } from 'aphrodite';
import PreviewValue from '../PreviewValue';
import injectStores from '../../utils/injectStores';
import Popover from '../Popover';
import DataViewer from '../DataViewer/index';

ChangeDataViewerPopover.propTypes = {
  className: PropTypes.string,
  displayName: PropTypes.string,
  path: PropTypes.array.isRequired,
  getValueByPath: PropTypes.func,
  inspect: PropTypes.func,
  stopInspecting: PropTypes.func,
  showMenu: PropTypes.func,
};

export default function ChangeDataViewerPopover({
  className,
  displayName,
  path,
  getValueByPath,
  inspect,
  stopInspecting,
  showMenu,
}) {
  const value = getValueByPath(path);
  const otype = typeof value;
  if (
    otype === 'number' ||
    otype === 'string' ||
    value === null ||
    value === undefined ||
    otype === 'boolean'
  ) {
    return <PreviewValue data={value} className={className} path={path} />;
  }

  const dataViewer = (
    <DataViewer
      path={path}
      getValueByPath={getValueByPath}
      inspect={inspect}
      stopInspecting={stopInspecting}
      showMenu={showMenu}
      decorator={injectStores({
        subscribe: (stores, props) => ({
          actionsLoggerStore: [`inspected--${props.path.join('/')}`],
        }),
        shouldUpdate: () => true,
      })}
    />
  );

  return (
    <Popover
      requireClick
      content={dataViewer}
      onShown={() => inspect(path)} // eslint-disable-line react/jsx-no-bind
    >
      <span
        className={`${css(styles.trigger)} ${className}`}
        // eslint-disable-next-line react/jsx-no-bind
        onContextMenu={e => {
          if (typeof showMenu === 'function') {
            showMenu(e, undefined, path);
          }
        }}
      >
        <PreviewValue data={value} displayName={displayName} path={path} />
      </span>
    </Popover>
  );
}

const styles = StyleSheet.create({
  trigger: {
    paddingLeft: 3,
    paddingRight: 3,
    borderRadius: 2,
    cursor: 'pointer',
    ':hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.08)',
    },
  },
});
