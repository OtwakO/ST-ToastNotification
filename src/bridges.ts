// Adapts global and DOM-event calls to an existing notifier instance.
import type { Notifier, ToastInput } from './toast/notifier';

export const TOAST_EVENT_NAME = 'st-toast:show';

export interface ToastBridgeGlobal {
  STToastNotification?: {
    show(input: ToastInput): unknown;
  };
}

export interface BridgeOptions {
  globalTarget?: typeof globalThis & ToastBridgeGlobal;
  eventTarget?: EventTarget;
}

export function installBridges(
  notifier: Notifier,
  options: BridgeOptions = {},
): () => void {
  const globalTarget = options.globalTarget ??
    (globalThis as typeof globalThis & ToastBridgeGlobal);
  const eventTarget = options.eventTarget ?? document;
  const previousGlobal = globalTarget.STToastNotification;

  globalTarget.STToastNotification = {
    show: (input) => notifier.show(input),
  };

  const handleEvent = (event: Event): void => {
    notifier.show((event as CustomEvent<ToastInput>).detail);
  };
  eventTarget.addEventListener(TOAST_EVENT_NAME, handleEvent);

  return () => {
    eventTarget.removeEventListener(TOAST_EVENT_NAME, handleEvent);
    if (previousGlobal) globalTarget.STToastNotification = previousGlobal;
    else delete globalTarget.STToastNotification;
  };
}
