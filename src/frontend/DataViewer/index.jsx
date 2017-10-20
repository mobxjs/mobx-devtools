import React from 'react';
import PropTypes from 'prop-types';
import DataView from './DataView';
import DataItem from './DataItem';

DataViewer.propTypes = {
  decorator: PropTypes.func,
};

export default function DataViewer({ decorator, ...otherProps }) {
  const WrappedDataView = decorator(DataView);
  const WrappedDataItem = decorator(DataItem);

  return (
    <WrappedDataView
      {...otherProps}
      ChildDataItem={WrappedDataItem}
      ChildDataView={WrappedDataView}
    />
  );
}
