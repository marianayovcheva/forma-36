import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { CommonProps, useId, mergeRefs } from '@contentful/f36-core';
import { Placement, Modifier } from '@popperjs/core';
import { PopoverContextProvider, PopoverContextType } from './PopoverContext';
import { usePopper } from 'react-popper';

export interface PopoverProps extends CommonProps {
  children: React.ReactNode;

  /**
   * Boolean to determine if the Popover should be the same width as
   * the trigger element
   *
   * @default false
   */
  isFullWidth?: boolean;

  /**
   * Boolean to control whether or not the Popover is open
   *
   * @default false
   */
  isOpen?: boolean;

  /**
   * Callback fired when the popover closes
   */
  onClose?: Function;

  /**
   * Determines the preferred position of the Popover. This position is not
   * guaranteed, as the Popover might be moved to fit the viewport
   *
   * @default bottom-start
   */
  placement?: Placement;

  /**
   * Boolean to control if popover is allowed to change its placement automatically
   * based on available space in the viewport.
   *
   * For example:
   * If you set placement prop to bottom, but there isn't enough space to position the popover in that direction,
   * it will change the popper placement to top. As soon as enough space is detected, the placement will be reverted to the defined one.
   *
   * If you want the popover to strictly follow the placement prop you should set this prop to false.
   *
   * @default true
   */
  isAutoalignmentEnabled?: boolean;

  /**
   * Boolean to control whether or not to render the Popover in a React Portal.
   * Rendering content inside a Portal allows the Popover to escape the bounds
   * of its parent while still being positioned correctly. Using a Portal is
   * necessary if an ancestor of the Popover hides overflow.
   *
   * @default true
   */
  usePortal?: boolean;

  /**
   * If true, the popover will close when you blur out it by clicking outside or tabbing out
   *
   * @default true
   */
  closeOnBlur?: boolean;

  /**
   * If true, the popover will close when you hit the Esc key
   *
   * @default true
   */
  closeOnEsc?: boolean;

  /**
   * If true, the popover will be focused after opening
   *
   * @default true
   */
  autoFocus?: boolean;
}

export function Popover(props: PopoverProps) {
  const {
    children,
    isOpen,
    placement = 'bottom-start',
    isFullWidth = false,
    isAutoalignmentEnabled = true,
    usePortal = true,
    closeOnBlur = true,
    closeOnEsc = true,
    onClose,
    autoFocus = true,
  } = props;

  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(
    null,
  );
  const [popoverElement, setPopoverElement] = useState<HTMLElement | null>(
    null,
  );

  const {
    attributes: popperAttributes,
    forceUpdate,
    styles: popperStyles,
  } = usePopper(triggerElement, popoverElement, {
    placement,
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 4],
        },
      },
      {
        ...sameWidth,
        enabled: isFullWidth,
      },
      {
        name: 'preventOverflow',
        enabled: isAutoalignmentEnabled,
        options: {
          mainAxis: true,
        },
      },
      {
        name: 'flip',
        enabled: isAutoalignmentEnabled,
      },
    ],
  });

  useEffect(() => {
    if (isOpen && autoFocus && popoverElement) {
      popoverElement.focus({ preventScroll: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, popoverElement]);

  useEffect(() => {
    if (forceUpdate) {
      forceUpdate();
    }
  }, [children, forceUpdate]);

  const popoverId = useId(null, 'popover-content');
  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  const contextValue: PopoverContextType = useMemo(
    () => ({
      isOpen,
      usePortal,
      getTriggerProps: (_ref = null) => ({
        ref: mergeRefs(setTriggerElement, _ref),
        ['aria-expanded']: Boolean(isOpen),
        ['aria-controls']: popoverId,
      }),
      getPopoverProps: (_props = {}, _ref = null) => ({
        ..._props,
        ...popperAttributes.popper,
        style: {
          ...(_props.style || {}),
          ...popperStyles.popper,
        },
        ref: mergeRefs(setPopoverElement, _ref),
        id: popoverId,
        onBlur: (event: React.FocusEvent<HTMLDivElement>) => {
          if (_props.onBlur) {
            _props.onBlur(event);
          }

          if (!closeOnBlur) {
            return;
          }

          const relatedTarget = event.relatedTarget as Node;

          const targetIsPopover =
            popoverElement === relatedTarget ||
            popoverElement.contains(relatedTarget);
          const targetIsTrigger =
            triggerElement === relatedTarget ||
            triggerElement.contains(relatedTarget);

          if (targetIsPopover || targetIsTrigger) {
            return;
          }

          handleClose();
        },
        onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => {
          if (_props.onKeyDown) {
            _props.onKeyDown(event);
          }

          if (closeOnEsc && event.key === 'Escape') {
            handleClose();
          }
        },
      }),
    }),
    [
      isOpen,
      popperAttributes,
      popperStyles,
      usePortal,
      popoverId,
      closeOnEsc,
      closeOnBlur,
      popoverElement,
      triggerElement,
      handleClose,
    ],
  );

  return (
    <PopoverContextProvider value={contextValue}>
      {children}
    </PopoverContextProvider>
  );
}

/**
 * Sets the popover width to the size of the trigger element.
 */
const sameWidth: Modifier<'sameWidth', any> = {
  name: 'sameWidth',
  enabled: true,
  phase: 'beforeWrite',
  requires: ['computeStyles'],
  fn: ({ state }) => {
    state.styles.popper.width = `${state.rects.reference.width}px`;
  },
  effect: ({ state }) => () => {
    const reference = state.elements.reference as HTMLElement;
    state.elements.popper.style.width = `${reference.offsetWidth}px`;
  },
};