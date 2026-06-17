import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  arrow as arrowMiddleware,
  FloatingPortal,
  FloatingArrow,
  useClick,
  useHover,
  useDismiss,
  useInteractions,
} from '@floating-ui/react';

export const availablePlacements = ['top', 'bottom'];

export default function PopoverTrigger({
  content,
  placement = 'bottom',
  withArrow = true,
  requireClick = false,
  shown: controlledShown,
  onShown,
  children,
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isOpen = controlledShown != null ? controlledShown || uncontrolledOpen : uncontrolledOpen;
  const arrowRef = useRef(null);
  const prevOpenRef = useRef(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setUncontrolledOpen,
    placement,
    middleware: [
      offset(8),
      flip({ fallbackPlacements: availablePlacements.filter(p => p !== placement) }),
      shift({ padding: 20 }),
      ...(withArrow ? [arrowMiddleware({ element: arrowRef, padding: 8 })] : []),
    ],
    whileElementsMounted: autoUpdate,
  });

  useEffect(() => {
    if (isOpen && !prevOpenRef.current && onShown) {
      onShown();
    }
    prevOpenRef.current = isOpen;
  }, [isOpen, onShown]);

  const hover = useHover(context, { enabled: !requireClick, delay: { open: 0, close: 50 } });
  const click = useClick(context, { enabled: requireClick });
  const dismiss = useDismiss(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([hover, click, dismiss]);

  const child = React.Children.only(children);

  const setRef = useCallback(
    node => {
      refs.setReference(node);
      const childRef = child.ref;
      if (typeof childRef === 'function') childRef(node);
      else if (childRef) childRef.current = node;
    },
    [refs, child.ref],
  );

  return (
    <>
      {React.cloneElement(child, getReferenceProps({ ref: setRef }))}
      {isOpen && content && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            data-hook="Popover"
            style={{
              ...floatingStyles,
              zIndex: 100000,
              boxSizing: 'border-box',
              border: '1px solid #bbb',
              borderRadius: 3,
              fontSize: 13,
              lineHeight: '16px',
              fontWeight: 'normal',
              background: '#fff',
              color: 'var(--default-text-color)',
              maxHeight: 'calc(100vh - 40px)',
              maxWidth: 'calc(100vw - 40px)',
            }}
            {...getFloatingProps()}
          >
            {withArrow && (
              <FloatingArrow
                ref={arrowRef}
                context={context}
                fill="#fff"
                stroke="#bbb"
                strokeWidth={1}
                width={12}
                height={6}
              />
            )}
            <div style={{ padding: '6px 10px', overflow: 'auto', maxHeight: 'inherit' }}>
              {content}
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  );
}

PopoverTrigger.propTypes = {
  onShown: PropTypes.func,
  children: PropTypes.node,
  placement: PropTypes.oneOf(availablePlacements),
  content: PropTypes.node,
  withArrow: PropTypes.bool,
  requireClick: PropTypes.bool,
  shown: PropTypes.bool,
};
