import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { render, unmountComponentAtNode, findDOMNode } from 'react-dom';
import shallowequal from 'shallowequal';
import { css, StyleSheet } from 'aphrodite';
import ContextProvider from '../utils/ContextProvider';
import theme from './theme';

export const availablePlacements = ['top', 'bottom' /* , 'right' */];
const between = (v, min, max) => Math.max(Math.min(v, max), min);
const rectFromEl = el => {
  const rect = el.getBoundingClientRect();
  return {
    bottom: rect.bottom,
    height: rect.height,
    left: rect.left,
    right: rect.right,
    top: rect.top,
    width: rect.width,
  };
};
const ARROW_SIZE = 6;
// const MIN_WIDTH = 250;
const GUTTER = 20;

const popoverStyleForPlacement = placement => {
  switch (placement) {
    case 'top':
      return styles.popoverTop;
    case 'bottom':
      return styles.popoverBottom;
    case 'right':
      return styles.popoverRight;
    default:
      return undefined;
  }
};

const arrowStyleForPlacement = placement => {
  switch (placement) {
    case 'top':
      return styles.arrowTop;
    case 'bottom':
      return styles.arrowBottom;
    case 'right':
      return styles.arrowRight;
    default:
      return undefined;
  }
};

const activeHtmlPortals = [];

class PopoverBubble extends Component {
  static propTypes = {
    placement: PropTypes.oneOf(availablePlacements),
    withArrow: PropTypes.bool.isRequired,
    triggerHtmlElement: PropTypes.instanceOf(window.HTMLElement).isRequired,
    onMouseEnter: PropTypes.func,
    onMouseLeave: PropTypes.func,
    onTouchStart: PropTypes.func,
  };

  state = {
    content: '',
    arrowCoordinates: { left: 0, top: 0 },
    bodyCoordinates: { left: 0, top: 0 },
  };

  componentDidMount() {
    this.reposition();

    // required as some deep children may update after popover shown (DataViewer received data)
    this.$repositionInterval = setInterval(() => this.reposition(), 100);
  }

  componentWillUnmount() {
    clearInterval(this.$repositionInterval);
  }

  calculate([placement, ...nextPlacementsToTry], selfRect, triggerRect) {
    const htmlWidth = window.innerWidth;
    const htmlHeight = window.innerHeight;
    const notLast = nextPlacementsToTry.length > 0;
    const maxHeight = htmlHeight - 2 * GUTTER;
    const maxWidth = htmlWidth - 2 * GUTTER;
    const assumedHeight = Math.min(maxHeight, selfRect.height);
    // const assumedWidth = between(selfRect.width, MIN_WIDTH, maxWidth);

    switch (placement) {
      // case 'right': {
      //   if (notLast && triggerRect.right + assumedWidth + ARROW_SIZE > htmlWidth) {
      //     return this.calculate(nextPlacementsToTry, selfRect, triggerRect);
      //   }
      //   return {
      //     arrowCoordinates: {
      //       left: triggerRect.right + ARROW_SIZE,
      //       top: triggerRect.top + triggerRect.height / 2,
      //     },
      //     bodyCoordinates: {
      //       left: triggerRect.right + ARROW_SIZE,
      //       top: between(
      //         triggerRect.top + (triggerRect.height / 2 - selfRect.height / 2),
      //         htmlWidth - assumedWidth - GUTTER,
      //         htmlWidth - selfRect.width - GUTTER
      //       ),
      //     },
      //     maxWidth: Math.min(maxWidth, htmlWidth - triggerRect.right - ARROW_SIZE - 2 * GUTTER),
      //     maxHeight,
      //     placement,
      //   };
      // }
      case 'top': {
        const hOverlap = triggerRect.top - selfRect.height - ARROW_SIZE < 0;
        if (notLast && hOverlap) {
          return this.calculate(nextPlacementsToTry, selfRect, triggerRect);
        }
        return {
          arrowCoordinates: !hOverlap && {
            left: triggerRect.left + triggerRect.width / 2,
            top: triggerRect.top - ARROW_SIZE,
          },
          bodyCoordinates: {
            left: between(
              triggerRect.left + (triggerRect.width / 2 - selfRect.width / 2),
              GUTTER,
              htmlWidth - GUTTER - selfRect.width,
            ),
            top: hOverlap
              ? htmlHeight - assumedHeight - GUTTER
              : triggerRect.top - selfRect.height - ARROW_SIZE,
          },
          maxWidth,
          maxHeight,
          placement,
        };
      }
      case 'bottom': {
        const hOverlap = triggerRect.bottom + selfRect.height + ARROW_SIZE > htmlHeight;
        if (notLast && hOverlap) {
          return this.calculate(nextPlacementsToTry, selfRect, triggerRect);
        }
        return {
          arrowCoordinates: !hOverlap && {
            left: triggerRect.left + triggerRect.width / 2,
            top: triggerRect.bottom + ARROW_SIZE,
          },
          bodyCoordinates: {
            left: between(
              triggerRect.left + (triggerRect.width / 2 - selfRect.width / 2),
              GUTTER,
              htmlWidth - GUTTER - selfRect.width,
            ),
            top: hOverlap ? htmlHeight - assumedHeight - GUTTER : triggerRect.bottom + ARROW_SIZE,
          },
          maxWidth,
          maxHeight,
          placement,
        };
      }
      default: {
        throw new Error(`Unexpected placement: ${placement}`);
      }
    }
  }

  reposition = () => {
    const { triggerHtmlElement, placement } = this.props;
    const selfRect = rectFromEl(this.el);
    const triggerRect = rectFromEl(triggerHtmlElement);
    if (
      shallowequal(triggerRect, this.$previousTriggerRect) &&
      shallowequal(selfRect, this.$previousSelfRect)
    ) {
      return;
    }
    this.$previousTriggerRect = triggerRect;
    this.$previousSelfRect = selfRect;
    const placements = [placement, ...availablePlacements.filter(p => p !== placement)];
    this.setState(this.calculate(placements, selfRect, triggerRect));
  };

  render() {
    const { withArrow, onMouseEnter, onMouseLeave, onTouchStart } = this.props;
    const { content } = this.state;
    const { arrowCoordinates, bodyCoordinates, maxWidth, maxHeight, placement } = this.state;

    return (
      <div className={css(theme.default)}>
        {withArrow && arrowCoordinates && (
          <div
            className={css(styles.arrow, arrowStyleForPlacement(placement))}
            style={{ top: arrowCoordinates.top, left: arrowCoordinates.left }}
          />
        )}
        <div
          className={css(styles.popover, popoverStyleForPlacement(placement))}
          style={{
            top: bodyCoordinates.top,
            left: bodyCoordinates.left,
            maxWidth,
            maxHeight,
          }}
          ref={el => {
            this.el = el;
          }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onTouchStart={onTouchStart}
        >
          {content}
        </div>
      </div>
    );
  }
}

// eslint-disable-next-line react/no-multi-comp
export default class PopoverTrigger extends Component {
  static propTypes = {
    onShown: PropTypes.func,
    children: PropTypes.node,
    placement: PropTypes.oneOf(availablePlacements),
    content: PropTypes.node,
    withArrow: PropTypes.bool.isRequired,
    requireClick: PropTypes.bool.isRequired,
    shown: PropTypes.bool,
  };

  static defaultProps = {
    placement: 'bottom',
    requireClick: false,
    withArrow: true,
  };

  static contextTypes = {
    stores: PropTypes.object.isRequired,
  };

  state = {
    shown: false,
  };

  componentDidMount() {
    if (this.props.shown) {
      this.show();
    }
  }

  componentWillUpdate(nextProps, nextState) {
    if (
      !nextState.shown &&
      !nextProps.requireClick &&
      (nextState.hovered || nextState.bubbleHovered || nextProps.shown)
    ) {
      this.show(nextState);
    }
    setTimeout(() => {
      if (
        this.state.shown &&
        !this.props.requireClick &&
        !this.state.hovered &&
        !this.state.bubbleHovered &&
        !this.props.shown
      ) {
        this.hide();
      }
    }, 50);
  }

  componentDidUpdate() {
    const { content } = this.props;
    if (this.popup) {
      this.popup.reposition();
      this.popup.setState({ content });
    }
  }

  componentWillUnmount() {
    this.hide();
  }

  htmlPortal = document.createElement('div');

  popup = undefined;

  handleMouseEnter = e => {
    if (this.props.children.props.onMouseEnter) this.props.children.props.onMouseEnter(e);
    this.setState({ hovered: true });
  };

  handleMouseLeave = e => {
    if (this.props.children.props.onMouseLeave) this.props.children.props.onMouseLeave(e);
    this.setState({ hovered: false });
  };

  handleBubbleMouseEnter = () => {
    this.setState({ bubbleHovered: true });
  };

  handleBubbleMouseLeave = () => {
    this.setState({ bubbleHovered: false });
  };

  handleClick = e => {
    if (this.props.children.props.onClick) this.props.children.props.onClick(e);
    if (this.props.requireClick) {
      e.stopPropagation();
      if (this.state.shown) {
        this.hide();
      } else {
        this.show();
      }
    }
  };

  handleFinishInteractionAnywhere = e => {
    const clickInsideTrigger = this.triggerEl && this.triggerEl.contains(e.target);
    const clickInsideHtmlPortal = activeHtmlPortals.find(p => p.contains(e.target)) !== undefined;
    if (clickInsideTrigger === false && clickInsideHtmlPortal === false) {
      document.removeEventListener('touchstart', this.handleFinishInteractionAnywhere, true);
      document.removeEventListener('click', this.handleFinishInteractionAnywhere, true);
      this.hide();
    }
  };

  show = (state = this.state) => {
    this.triggerEl = findDOMNode(this); // eslint-disable-line react/no-find-dom-node
    if (!(this.triggerEl instanceof window.HTMLElement)) return;
    if (!state.shown) {
      const { placement, content, withArrow } = this.props;
      if (!content) {
        return;
      }
      document.body.appendChild(this.htmlPortal);
      activeHtmlPortals.push(this.htmlPortal);

      render(
        <ContextProvider stores={this.context.stores}>
          <PopoverBubble
            ref={el => {
              this.popup = el;
            }}
            placement={placement}
            withArrow={withArrow}
            triggerHtmlElement={this.triggerEl}
            onMouseEnter={this.handleBubbleMouseEnter}
            onMouseLeave={this.handleBubbleMouseLeave}
            onTouchStart={this.handleBubbleMouseEnter}
          />
        </ContextProvider>,
        this.htmlPortal,
      );

      this.popup.setState({ content });

      document.addEventListener('touchstart', this.handleFinishInteractionAnywhere, true);
      document.addEventListener('click', this.handleFinishInteractionAnywhere, true);

      window.addEventListener('resize', this.popup.reposition);
      document.addEventListener('scroll', this.popup.reposition, true);

      this.setState({ shown: true }, this.props.onShown);
    }
  };

  hide = (state = this.state) => {
    if (state.shown) {
      if (this.triggerEl) {
        this.triggerEl.removeEventListener('mouseleave', this.handleMouseLeave, true);
        this.triggerEl = undefined;
      }
      document.body.removeChild(this.htmlPortal);
      const idx = activeHtmlPortals.indexOf(this.htmlPortal);
      if (idx !== -1) activeHtmlPortals.splice(idx, 1);
      window.removeEventListener('resize', this.popup.reposition);
      document.removeEventListener('scroll', this.popup.reposition, true);
      unmountComponentAtNode(this.htmlPortal);
      this.popup = undefined;
      this.setState({ shown: false });
    }
  };

  render() {
    const { children } = this.props;
    return React.cloneElement(React.Children.only(children), {
      onMouseEnter: this.handleMouseEnter,
      onMouseLeave: this.handleMouseLeave,
      onTouchStart: this.handleMouseEnter,
      onClick: this.handleClick,
    });
  }
}

const styles = StyleSheet.create({
  popover: {
    position: 'fixed',
    boxSizing: 'border-box',
    zIndex: 100000,
    border: '1px solid',
    padding: '6px 10px',
    borderRadius: 3,
    fontSize: 13,
    lineHeight: '16px',
    fontWeight: 'normal',
    background: '#fff',
    borderColor: '#bbb',
    color: 'var(--default-text-color)',
    overflow: 'auto',
  },

  arrow: {
    position: 'fixed',
    width: 0,
    height: 0,
    zIndex: 100001,

    background: '#fff',
    borderColor: '#fff',
    color: 'white',
    opacity: 0.9,

    ':before': {
      content: '""',
      position: 'absolute',
      width: 0,
      height: 0,
      borderStyle: 'solid',
      borderColor: 'transparent',
    },
    ':after': {
      content: '""',
      position: 'absolute',
      width: 0,
      height: 0,
      borderStyle: 'solid',
      borderColor: 'transparent',
    },
  },

  arrowTop: {
    ':before': {
      borderWidth: '7px 6px 0',
      transform: 'translateX(-50%)',
      borderTopColor: '#ddd',
    },

    ':after': {
      borderWidth: '6px 5px 0',
      transform: 'translate(-50%, -1px)',
      borderTopColor: '#fff',
    },
  },

  arrowBottom: {
    ':before': {
      borderWidth: '0 6px 7px',
      transform: 'translate(-50%, -7px)',
      borderBottomColor: '#ddd',
    },
    ':after': {
      borderWidth: '0 5px 6px',
      transform: 'translate(-50%, -5px)',
      borderBottomColor: '#fff',
    },
  },

  arrowRight: {
    ':before': {
      borderWidth: '6px 7px 6px 0',
      transform: 'translate(-7px, -50%)',
      borderRightColor: '#ddd',
    },

    ':after': {
      borderWidth: '5px 6px 5px 0',
      transform: 'translate(-5px, -50%)',
      borderRightColor: '#fff',
    },
  },
});
