// Verifies external invocation bridges through their documented public surfaces.
import { afterEach, describe, expect, it } from 'vitest';

import { installBridges, type ToastBridgeGlobal } from './bridges';
import type { Notifier, ToastInput } from './toast/notifier';

function createSpyNotifier(): { notifier: Notifier; shown: ToastInput[] } {
  const shown: ToastInput[] = [];
  return {
    shown,
    notifier: {
      show(input) {
        shown.push(input);
        return { id: 'test', closed: Promise.resolve(), dismiss() {} };
      },
      dismissAll() {},
      destroy() {},
    },
  };
}

afterEach(() => {
  delete (globalThis as typeof globalThis & ToastBridgeGlobal).STToastNotification;
});

describe('installBridges', () => {
  it('exposes a namespaced global show function and restores the previous value on cleanup', () => {
    const { notifier, shown } = createSpyNotifier();
    const target = globalThis as typeof globalThis & ToastBridgeGlobal;
    const previous = { show: () => undefined };
    target.STToastNotification = previous;

    const cleanup = installBridges(notifier, { globalTarget: target, eventTarget: document });
    target.STToastNotification?.show({ message: 'From global', tone: 'success' });

    expect(shown).toEqual([{ message: 'From global', tone: 'success' }]);
    cleanup();
    expect(target.STToastNotification).toBe(previous);
  });

  it('translates the st-toast:show custom event and removes its listener on cleanup', () => {
    const { notifier, shown } = createSpyNotifier();
    const cleanup = installBridges(notifier, {
      globalTarget: globalThis as typeof globalThis & ToastBridgeGlobal,
      eventTarget: document,
    });

    document.dispatchEvent(
      new CustomEvent('st-toast:show', {
        detail: { message: 'From event', detail: 'Remembered', lang: 'en' },
      }),
    );
    expect(shown).toEqual([
      { message: 'From event', detail: 'Remembered', lang: 'en' },
    ]);

    cleanup();
    document.dispatchEvent(
      new CustomEvent('st-toast:show', { detail: { message: 'Ignored' } }),
    );
    expect(shown).toHaveLength(1);
  });
});
