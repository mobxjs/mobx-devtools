import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { css, StyleSheet } from 'aphrodite';
import { symbols } from '../Bridge';
import flash from './TabComponents/TreeView/flash';

const BAD_INPUT = Symbol('bad input');

export default class PreviewValue extends React.PureComponent {
  static propTypes = {
    data: PropTypes.any,
  };

  render() {
    if (
      !this.props.data ||
      this.props.data instanceof Date ||
      typeof this.props.data !== 'object'
    ) {
      return <PreviewSimpleValue {...this.props} />;
    }
    return <PreviewComplexValue {...this.props} />;
  }
}

class PreviewSimpleValue extends React.PureComponent { // eslint-disable-line react/no-multi-comp
  static propTypes = {
    change: PropTypes.func,
    data: PropTypes.any,
    path: PropTypes.array.isRequired,
    editable: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.state = {
      text: '',
      editing: false,
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.editing && !prevState.editing) {
      this.selectAll();
    }
    if (!this.state.editing && this.props.data !== prevProps.data) {
      // eslint-disable-next-line react/no-find-dom-node
      flash(ReactDOM.findDOMNode(this), '#FFFF00', 'transparent', 1);
    }
  }

  handleChange = (e) => {
    this.setState({
      text: e.target.value,
    });
  };

  handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      this.submit(true);
      this.setState({
        editing: false,
      });
    }
    if (e.key === 'Escape') {
      this.setState({
        editing: false,
      });
    }
  };

  handleSubmit = () => this.submit(false);

  submit(editing) {
    if (this.state.text === valueToText(this.props.data)) {
      this.setState({
        editing,
      });
      return;
    }
    const value = textToValue(this.state.text);
    if (value === BAD_INPUT) {
      this.setState({
        text: valueToText(this.props.data),
        editing,
      });
      return;
    }
    this.props.change(this.props.path, value);
    this.setState({
      editing,
    });
  }

  handleStartEditing = () => {
    if (this.props.editable) {
      this.setState({
        editing: true,
        text: valueToText(this.props.data),
      });
    }
  };

  selectAll() {
    const input = this.input;
    if (this.state.text.match(/^".*"$/)) {
      input.selectionStart = 1;
      input.selectionEnd = input.value.length - 1;
    } else {
      input.selectionStart = 0;
      input.selectionEnd = input.value.length;
    }
  }

  render() {
    const { editable } = this.props;
    const { editing, text } = this.state;

    if (editing) {
      return (
        <input
          autoFocus
          ref={(i) => { this.input = i; }}
          className={css(styles.input)}
          onChange={this.handleChange}
          onBlur={this.handleSubmit}
          onKeyDown={this.handleKeyDown}
          value={text}
        />
      );
    }

    let { data } = this.props;

    if (typeof data === 'string' && data.length > 200) {
      data = `${data.slice(0, 200)}…`;
    }

    return (
      <div
        onClick={this.handleStartEditing}
        className={css(
          styles.simple,
          editable && styles.simpleEditable,
          typeof data === 'string' && styles.simpleString,
          typeof data === 'undefined' && styles.simpleUndefined
        )}
      >
        {valueToText(data)}
      </div>
    );
  }
}

class PreviewComplexValue extends React.PureComponent { // eslint-disable-line react/no-multi-comp
  static propTypes = {
    data: PropTypes.any,
    displayName: PropTypes.string,
  };

  render() {
    const { data } = this.props;
    const mobxObject = data[symbols.mobxObject];
    if (Array.isArray(data)) {
      return (
        <span className={css(styles.previewComplex)}>
          {this.props.displayName || 'Array'}[{data.length}]
        </span>
      );
    }
    switch (data[symbols.type]) {
      case 'serializationError':
        return <span className={css(styles.previewError)}>SerializerError</span>;

      case 'deptreeNode':
        return <span className={css(styles.previewDeptreeNode)}>{data[symbols.name]}</span>;

      case 'function':
        return (
          <span className={css(styles.previewComplex, mobxObject && styles.mobxObject)}>
            {this.props.displayName || data[symbols.name] || 'fn'}()
          </span>
        );
      case 'object':
      case 'map':
        return (
          <span className={css(styles.previewComplex, mobxObject && styles.mobxObject)}>
            {`${this.props.displayName || data[symbols.name]}{…}`}
          </span>
        );
      case 'date':
        return (
          <span className={css(styles.previewComplex)}>
            {this.props.displayName || data[symbols.name]}
          </span>
        );
      case 'symbol':
        return (
          <span className={css(styles.previewComplex)}>
            {this.props.displayName || data[symbols.name]}
          </span>
        );
      case 'iterator':
        return (
          <span className={css(styles.previewComplex)}>
            {`${this.props.displayName || data[symbols.name]}(…)`}
          </span>
        );

      case 'array_buffer':
      case 'data_view':
      case 'array':
      case 'typed_array':
        return (
          <span className={css(styles.previewComplex, mobxObject && styles.mobxObject)}>
            {`${this.props.displayName || data[symbols.name]}[${data[symbols.meta].length}]`}
          </span>
        );

      case undefined:
      case null:
        return (
          <span className={css(styles.previewComplex)}>{this.props.displayName || '{…}'}</span>
        );
      default:
        return null;
    }
  }
}

function textToValue(txt) {
  if (!txt.length) {
    return BAD_INPUT;
  }
  if (txt === 'undefined') {
    return undefined;
  }
  try {
    return JSON.parse(txt);
  } catch (e) {
    return BAD_INPUT;
  }
}

function valueToText(value) {
  if (value === undefined) {
    return 'undefined';
  } else if (typeof value === 'number') {
    return value.toString();
  } else if (value instanceof Date) {
    return value.toString();
  }
  return JSON.stringify(value);
}

const styles = StyleSheet.create({
  input: {
    flex: 1,
    minWidth: 50,
    boxSizing: 'border-box',
    border: 'none',
    padding: 0,
    outline: 'none',
    fontFamily: 'var(--font-family-monospace)',
  },
  simple: {
    display: 'inline-flex',
    flex: 1,
    whiteSpace: 'nowrap',
    cursor: 'default',
    color: 'var(--dataview-preview-value-primitive)',
  },
  mobxObject: {
    color: 'var(--primary-color)',
  },
  simpleString: {
    color: 'var(--dataview-preview-value-primitive-string)',
  },
  simpleUndefined: {
    color: 'var(--dataview-preview-value-primitive-undefined)',
  },
  simpleEditable: {
    cursor: 'default',
  },
  previewComplex: {
    color: 'var(--dataview-preview-value-complex)',
  },
  previewDeptreeNode: {
    color: 'var(--primary-color)',
  },
  previewError: {
    backgroundColor: '#ef383b',
    color: '#fff',
    paddingLeft: 3,
    paddingRight: 3,
    borderRadius: 2,
  },
});
