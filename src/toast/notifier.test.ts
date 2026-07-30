// Exercises notifier behavior only through the exported factory and returned handles.
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createNotifier } from './notifier';

afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});

describe('createNotifier', () => {
  it('creates no DOM until a valid toast is shown, then renders text in one open shadow root', () => {
    const notifier = createNotifier();
    expect(document.body.children).toHaveLength(0);
    expect(() => notifier.show({ message: '   ' })).toThrow(
      'message must be a non-empty string',
    );
    expect(document.body.children).toHaveLength(0);

    notifier.show({
      message: '<strong>Memory recalled</strong>',
      detail: '<em>A detail resurfaced</em>',
      tone: 'success',
      lang: 'zh-CN',
    });

    expect(document.body.children).toHaveLength(1);
    const root = document.body.firstElementChild?.shadowRoot;
    expect(root).not.toBeNull();
    expect(root?.querySelectorAll('.toast')).toHaveLength(1);
    expect(root?.querySelector('.title')?.textContent).toBe(
      '<strong>Memory recalled</strong>',
    );
    expect(root?.querySelector('.detail')?.textContent).toBe(
      '<em>A detail resurfaced</em>',
    );
    expect(root?.querySelector('strong')).toBeNull();
    expect(root?.querySelector('.toast')?.getAttribute('data-tone')).toBe(
      'success',
    );
    expect(root?.querySelector('.toast')?.getAttribute('aria-label')).toBe(
      'Success: <strong>Memory recalled</strong>. <em>A detail resurfaced</em>',
    );
    expect(root?.querySelector('.title')?.getAttribute('lang')).toBe('zh-CN');
  });

  it('keeps a FIFO queue, supports dismissal, and resolves each closed promise', async () => {
    vi.useFakeTimers();
    const notifier = createNotifier({ maxVisible: 1, durationMs: 1000 });
    const first = notifier.show({ message: 'First' });
    const second = notifier.show({ message: 'Second' });
    const root = document.body.firstElementChild?.shadowRoot;

    expect(root?.querySelectorAll('.toast')).toHaveLength(1);
    expect(root?.querySelector('.title')?.textContent).toBe('First');

    first.dismiss();
    await first.closed;
    expect(root?.querySelectorAll('.toast')).toHaveLength(1);
    expect(root?.querySelector('.title')?.textContent).toBe('Second');

    await vi.advanceTimersByTimeAsync(1000);
    await second.closed;
    expect(root?.querySelectorAll('.toast')).toHaveLength(0);
  });

  it('dismisses all work and destroys its host without leaving queued toasts behind', async () => {
    vi.useFakeTimers();
    const notifier = createNotifier({ maxVisible: 1 });
    const first = notifier.show({ message: 'First' });
    const second = notifier.show({ message: 'Second' });

    notifier.destroy();

    await Promise.all([first.closed, second.closed]);
    expect(document.body.children).toHaveLength(0);
    await vi.runAllTimersAsync();
    expect(document.body.children).toHaveLength(0);
  });

  it('exposes polite, assertive, and off announcement behavior', () => {
    const notifier = createNotifier();
    notifier.show({ message: 'Saved', announcement: 'assertive' });
    notifier.show({ message: 'Quiet', announcement: 'off' });
    const root = document.body.firstElementChild?.shadowRoot;

    expect(root?.querySelector('.assertive')?.textContent).toBe('Info: Saved');
    expect(root?.querySelector('.polite')?.textContent).toBe('');
    expect(root?.querySelector('.assertive')?.getAttribute('aria-live')).toBe(
      'assertive',
    );
  });

  it('uses only opacity for Whisper animation and exposes reduced-motion CSS', () => {
    const notifier = createNotifier();
    notifier.show({ message: 'Sharp text' });
    const css = document.body.firstElementChild?.shadowRoot?.querySelector('style')
      ?.textContent;

    expect(css).toContain(
      '@keyframes whisper-life{0%,100%{opacity:0}8%,82%{opacity:1}}',
    );
    expect(css).toContain('@media(prefers-reduced-motion:reduce)');
    expect(css).not.toMatch(/transform|filter|blur|text-shadow/);
  });
});
