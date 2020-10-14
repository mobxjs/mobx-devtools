import React from 'react';
import PropTypes from 'prop-types';
import injectStores from '../../../utils/injectStores';

@injectStores({
  subscribe: {
    treeExplorerStore: ['searchText'],
  },
  injectProps: ({ treeExplorerStore }) => ({
    searchText: treeExplorerStore.searchText,
    changeSearch: e => treeExplorerStore.changeSearch(e.target.value),
  }),
})
export default class SearchComponents extends React.PureComponent {
  static propTypes = {
    searchText: PropTypes.string.isRequired,
    changeSearch: PropTypes.func.isRequired,
  };

  render() {
    return (
      <input
        type="search"
        value={this.props.searchText}
        onChange={this.props.changeSearch}
        placeholder="Search (string/regex)"
        style={{
          border: '1px solid rgba(0, 0, 0, 0.12)',
          padding: 3,
          borderRadius: 4,
          width: 133,
        }}
      />
    );
  }
}
