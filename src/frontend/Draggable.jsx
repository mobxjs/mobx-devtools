import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';

export default class Draggable extends React.Component {
  static propTypes = {
    onStart: PropTypes.func.isRequired,
    onStop: PropTypes.func.isRequired,
    onMove: PropTypes.func.isRequired,
    className: PropTypes.string,
    style: PropTypes.object,
    children: PropTypes.node,
  };

  onMove = (evt) => {
    evt.preventDefault();
    this.props.onMove(evt.pageX, evt.pageY);
  };

  onUp = (evt) => {
    evt.preventDefault();
    // eslint-disable-next-line react/no-find-dom-node
    const doc = ReactDOM.findDOMNode(this).ownerDocument;
    doc.removeEventListener('mousemove', this.onMove);
    doc.removeEventListener('mouseup', this.onUp);
    this.props.onStop();
  };

  startDragging = (evt) => {
    evt.preventDefault();
    // eslint-disable-next-line react/no-find-dom-node
    const doc = ReactDOM.findDOMNode(this).ownerDocument;
    doc.addEventListener('mousemove', this.onMove);
    doc.addEventListener('mouseup', this.onUp);
    this.props.onStart();
  };

  render() {
    return (
      <div
        style={this.props.style}
        className={this.props.className}
        onMouseDown={this.startDragging}
      >
        {this.props.children}
      </div>
    );
  }
}
