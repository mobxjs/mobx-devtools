import React from 'react';
import { css, StyleSheet } from 'aphrodite';
import PropTypes from 'prop-types';
import Draggable from './Draggable';

function shouldUseVerticalLayout(el) {
  return el.offsetWidth < IS_VERTICAL_BREAKPOINT;
}

const IS_VERTICAL_BREAKPOINT = 400;
const IGONORE_EVENT = Symbol('IGONORE_EVENT');

const dispatchResizeEvent = () => {
  const event = document.createEvent('HTMLEvents');
  event[IGONORE_EVENT] = true;
  event.initEvent('resize', true, false);
  window.dispatchEvent(event);
};

export default class SplitPane extends React.Component {
  static propTypes = {
    initialWidth: PropTypes.number.isRequired,
    initialHeight: PropTypes.number.isRequired,
    left: PropTypes.func.isRequired,
    right: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      moving: false,
      width: props.initialWidth,
      height: props.initialHeight,
    };
  }

  componentDidMount() {
    setTimeout(() => {
      // for css to be injected
      if (this.el) {
        const isVertical = shouldUseVerticalLayout(this.el);

        const width = Math.floor(this.el.offsetWidth * (isVertical ? 0.6 : 0.5));

        window.addEventListener('resize', this.handleResize, false);

        this.setState(
          {
            width: Math.max(250, width),
            height: Math.floor(this.el.offsetHeight * 0.3),
            isVertical,
          },
          dispatchResizeEvent,
        );
      }
    }, 0);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
    clearTimeout(this.resizeTimeout);
  }

  handleResize = (e) => {
    if (e[IGONORE_EVENT]) return;
    if (!this.resizeTimeout) {
      this.resizeTimeout = setTimeout(this.handleResizeTimeout, 50);
    }
  };

  handleResizeTimeout = () => {
    this.resizeTimeout = null;

    this.setState(
      {
        isVertical: shouldUseVerticalLayout(this.el),
      },
      dispatchResizeEvent,
    );
  };

  handleDraggableStart = () => this.setState({ moving: true });

  handleDraggableMove = (x, y) => {
    const rect = this.el.getBoundingClientRect();

    this.setState((prevState) => ({
      width: this.state.isVertical ? prevState.width : Math.floor(rect.left + (rect.width - x)),
      height: !this.state.isVertical ? prevState.height : Math.floor(rect.top + (rect.height - y)),
    }));
  };

  handleDraggableStop = () => this.setState({ moving: false }, dispatchResizeEvent);

  render() {
    const { isVertical } = this.state;
    const { height, width } = this.state;

    return (
      <div
        ref={(el) => {
          this.el = el;
        }}
        className={css(
          styles.container,
          isVertical ? styles.containerVertical : styles.containerHorizontal,
        )}
      >
        <div className={css(styles.leftPaneContent)}>{this.props.left()}</div>
        <div
          style={isVertical ? { height } : { width }}
          className={css(
            styles.container,
            isVertical ? styles.containerVertical : styles.containerHorizontal,
            styles.rightPane,
          )}
        >
          <Draggable
            className={css(
              styles.dragger,
              isVertical ? styles.draggerVertical : styles.draggerHorizontal,
            )}
            onStart={this.handleDraggableStart}
            onMove={this.handleDraggableMove}
            onStop={this.handleDraggableStop}
          >
            <div
              className={css(
                styles.draggerInner,
                isVertical ? styles.draggerInnerVert : styles.draggerInnerHor,
              )}
            />
          </Draggable>
          <div className={css(styles.rightPaneContent)}>{this.props.right()}</div>
        </div>
      </div>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    minWidth: 0,
    flex: 1,
  },
  containerVertical: {
    flexDirection: 'column',
  },
  containerHorizontal: {
    flexDirection: 'row',
  },
  rightPane: {
    flex: 'initial',
    minHeight: 120,
    minWidth: 150,
  },
  rightPaneContent: {
    display: 'flex',
    width: '100%',
  },
  leftPaneContent: {
    display: 'flex',
    minWidth: '30%',
    minHeight: '30%',
    flex: 1,
    overflow: 'hidden',
  },
  dragger: {
    position: 'relative',
    zIndex: 1,
  },
  draggerVertical: {
    padding: '0.25rem 0',
    margin: '-0.25rem 0',
    cursor: 'ns-resize',
  },
  draggerHorizontal: {
    padding: '0 0.25rem',
    margin: '0 -0.25rem',
    cursor: 'ew-resize',
  },
  draggerInner: {
    backgroundColor: 'var(--split-dragger-color)',
    opacity: 0.4,
  },
  draggerInnerVert: {
    height: '1px',
    width: '100%',
  },
  draggerInnerHor: {
    height: '100%',
    width: '1px',
  },
});
