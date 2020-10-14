import React from 'react';
import PropTypes from 'prop-types';
import { css, StyleSheet } from 'aphrodite';
import PreviewValue from '../PreviewValue';
import { symbols } from '../../Bridge';

const truncate = (str) => (str.length > 40 ? `${str.slice(0, 40)}…` : str);

export default class DataItem extends React.Component {
  static propTypes = {
    startOpen: PropTypes.bool,
    name: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    path: PropTypes.array.isRequired,
    editable: PropTypes.bool,
    getValueByPath: PropTypes.func.isRequired,
    change: PropTypes.func,
    inspect: PropTypes.func,
    stopInspecting: PropTypes.func,
    showMenu: PropTypes.func,
    ChildDataView: PropTypes.func.isRequired,
    ChildDataItem: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = { open: Boolean(this.props.startOpen) };
  }

  componentWillMount() {
    this.value = this.props.getValueByPath(this.props.path);
    if (this.state.open && this.value && this.value[symbols.inspected] === false) {
      this.setState({ open: false });
    } else if (!this.state.open && this.value && this.value[symbols.inspected] === true) {
      this.setState({ open: true });
    }
  }

  componentWillReceiveProps(nextProps) {
    this.value = nextProps.getValueByPath(nextProps.path);
    if (this.state.open && this.value && this.value[symbols.inspected] === false) {
      this.setState({ open: false });
    } else if (!this.state.open && this.value && this.value[symbols.inspected] === true) {
      this.setState({ open: true });
    }
  }

  toggleOpen = () => {
    if (this.state.open) {
      this.setState({ open: false });
      if (this.value && this.value[symbols.inspected] === true) {
        this.props.stopInspecting(this.props.path);
      }
    } else {
      this.setState({ open: true });
      if (this.value && this.value[symbols.inspected] === false) {
        this.props.inspect(this.props.path);
      }
    }
  };

  toggleBooleanValue = (e) => {
    this.props.change(this.props.path, e.target.checked);
  };

  isSimple() {
    const { value } = this;
    const otype = typeof value;
    return (
      value instanceof Date ||
      otype === 'number' ||
      otype === 'string' ||
      value === null ||
      value === undefined ||
      otype === 'boolean'
    );
  }

  isDeptreeNode() {
    const { value } = this;
    return value && value[symbols.type] === 'deptreeNode';
  }

  handleContextMenu = (e) => {
    if (typeof this.props.showMenu === 'function') {
      this.props.showMenu(e, this.value, this.props.path);
    }
  };

  renderOpener() {
    if (this.isSimple()) {
      if (typeof this.value === 'boolean' && this.props.editable) {
        return (
          <input
            checked={this.value}
            onChange={this.toggleBooleanValue}
            className={css(styles.toggler)}
            type="checkbox"
          />
        );
      }
      return null;
    }
    if (this.isDeptreeNode() && this.value.dependencies.length === 0) return null;
    return (
      <div onClick={this.toggleOpen} className={css(styles.opener)}>
        {this.state.open ? (
          <span className={css(styles.expandedArrow)} />
        ) : (
          <span className={css(styles.collapsedArrow)} />
        )}
      </div>
    );
  }

  render() {
    const { value } = this;
    const complex = !this.isSimple();

    return (
      <li>
        <div className={css(styles.head)}>
          {this.renderOpener()}
          <div
            className={css([styles.name, complex && styles.nameComplex])}
            onClick={this.toggleOpen}
          >
            {truncate(this.props.name)}:
          </div>
          <div onContextMenu={this.handleContextMenu} className={css(styles.preview)}>
            <PreviewValue
              editable={this.props.editable && this.isSimple()}
              path={this.props.path}
              data={value}
              change={this.props.change}
            />
          </div>
        </div>
        {complex && this.state.open && (
          <div className={css(styles.children)}>
            <this.props.ChildDataView
              value={value}
              path={this.props.path}
              getValueByPath={this.props.getValueByPath}
              inspect={this.props.inspect}
              stopInspecting={this.props.stopInspecting}
              change={this.props.change}
              showMenu={this.props.showMenu}
              ChildDataView={this.props.ChildDataView}
              ChildDataItem={this.props.ChildDataItem}
            />
          </div>
        )}
      </li>
    );
  }
}

const styles = StyleSheet.create({
  children: {},

  opener: {
    cursor: 'pointer',
    marginLeft: -10,
    paddingRight: 3,
    position: 'absolute',
    top: 4,
  },

  toggler: {
    left: -15,
    position: 'absolute',
    top: -1,
  },

  head: {
    display: 'flex',
    position: 'relative',
  },

  value: {},

  name: {
    color: 'var(--dataview-preview-key)',
    margin: '2px 3px',
  },

  nameComplex: {
    cursor: 'pointer',
  },
  preview: {
    display: 'flex',
    margin: '2px 3px',
    whiteSpace: 'pre',
    wordBreak: 'break-word',
    flex: 1,
    color: 'var(--dataview-preview-value)',
    cursor: 'default',
  },

  collapsedArrow: {
    borderColor: 'transparent transparent transparent var(--dataview-arrow)',
    borderStyle: 'solid',
    borderWidth: '4px 0 4px 7px',
    display: 'inline-block',
    marginLeft: 1,
    verticalAlign: 'top',
  },

  expandedArrow: {
    borderColor: 'var(--dataview-arrow) transparent transparent transparent',
    borderStyle: 'solid',
    borderWidth: '7px 4px 0 4px',
    display: 'inline-block',
    marginTop: 1,
    verticalAlign: 'top',
  },
});
