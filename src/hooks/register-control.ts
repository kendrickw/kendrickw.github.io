import React from 'react';
import { useEventListener } from 'usehooks-ts';

/** User control events */
export interface ControlEvent {
  left: boolean;
  right: boolean;
  jump: boolean;
}

interface RegisterControlOpt {
  onKeyDown?: (evt: KeyboardEvent) => void;
  onKeyUp?: (evt: KeyboardEvent) => void;
}

/**
 * Register key presses and translate them to control events
 *
 * - Left: left arrow
 * - Right: right arrow
 * - Jump: space or up arrow
 */
export function useRegisterControl(opt?: RegisterControlOpt) {
  const controlRef = React.useRef<ControlEvent>({
    left: false,
    right: false,
    jump: false,
  });

  const updateControl = React.useCallback(
    (key: keyof ControlEvent, state: boolean) => {
      controlRef.current[key] = state;
    },
    []
  );

  const handleKeyPress = React.useCallback(
    (evt: KeyboardEvent, state: boolean) => {
      switch (evt.key) {
        case 'ArrowRight':
          updateControl('right', state);
          break;
        case 'ArrowLeft':
          updateControl('left', state);
          break;
        case 'ArrowUp':
        case ' ':
          updateControl('jump', state);
          break;
      }
    },
    [updateControl]
  );

  const handleKeyDown = React.useCallback(
    (evt: KeyboardEvent) => {
      opt?.onKeyDown?.(evt);
      handleKeyPress(evt, true);
    },
    [opt, handleKeyPress]
  );

  const handleKeyUp = React.useCallback(
    (evt: KeyboardEvent) => {
      opt?.onKeyUp?.(evt);
      handleKeyPress(evt, false);
    },
    [opt, handleKeyPress]
  );

  useEventListener('keydown', handleKeyDown);
  useEventListener('keyup', handleKeyUp);

  return [controlRef, updateControl] as const;
}
