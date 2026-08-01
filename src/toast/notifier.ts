// Owns the lazy Shadow DOM host, generic theme rendering, lifecycle, queue, and announcements.
import { getTheme } from '../themes/catalog';
import { resolveThemeTokens, tokenCssValue, tokenVariableName } from '../themes/resolve';
import type { ThemeTokenValue } from '../themes/types';

export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface NotifierOptions {
  themeId?: string;
  themeOverrides?: Record<string, ThemeTokenValue>;
  durationMs?: number;
  position?: ToastPosition;
  maxVisible?: number;
  zIndex?: number;
}

export interface ResolvedNotifierOptions extends Required<NotifierOptions> {}

export type ToastTone = 'info' | 'success' | 'warning' | 'error';
export type ToastAnnouncement = 'polite' | 'assertive' | 'off';

export interface ToastInput {
  message: string;
  detail?: string;
  tone?: ToastTone;
  durationMs?: number;
  lang?: string;
  announcement?: ToastAnnouncement;
}

export interface ToastHandle {
  readonly id: string;
  readonly closed: Promise<void>;
  dismiss(): void;
}

export interface Notifier {
  show(input: ToastInput): ToastHandle;
  dismissAll(): void;
  destroy(): void;
}

interface ToastRecord {
  id: string;
  input: Required<Pick<ToastInput, 'message' | 'tone' | 'announcement'>> &
    Omit<ToastInput, 'message' | 'tone' | 'announcement'>;
  durationMs: number;
  element?: HTMLElement;
  timer?: ReturnType<typeof setTimeout>;
  resolveClosed: () => void;
  closed: Promise<void>;
  settled: boolean;
}

const toneLabels: Record<ToastTone, string> = {
  info: 'Info',
  success: 'Success',
  warning: 'Warning',
  error: 'Error',
};

export function createNotifier(options: NotifierOptions = {}): Notifier {
  const config = resolveNotifierOptions(options);
  const selectedTheme = getTheme(config.themeId);
  if (!selectedTheme) throw new TypeError(`Unknown theme: ${config.themeId}`);
  const theme = selectedTheme;
  const tokens = resolveThemeTokens(theme, config.themeOverrides);
  let sequence = 0;
  let host: HTMLElement | undefined;
  let stack: HTMLElement | undefined;
  let politeRegion: HTMLElement | undefined;
  let assertiveRegion: HTMLElement | undefined;
  const visible: ToastRecord[] = [];
  const queued: ToastRecord[] = [];

  function ensureDom(): void {
    if (host) return;
    host = document.createElement('div');
    host.dataset.stToastHost = '';
    host.style.position = 'fixed';
    host.style.inset = '0 auto auto 0';
    host.style.width = '100vw';
    host.style.height = '100dvh';
    host.style.maxWidth = '100%';
    host.style.zIndex = String(config.zIndex);
    host.style.pointerEvents = 'none';
    const root = host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = structuralCss(theme.css);
    const nextStack = document.createElement('div');
    nextStack.className = 'stack';
    nextStack.dataset.position = config.position;
    const nextPoliteRegion = document.createElement('div');
    nextPoliteRegion.className = 'live polite';
    nextPoliteRegion.setAttribute('aria-live', 'polite');
    nextPoliteRegion.setAttribute('aria-atomic', 'true');
    const nextAssertiveRegion = document.createElement('div');
    nextAssertiveRegion.className = 'live assertive';
    nextAssertiveRegion.setAttribute('aria-live', 'assertive');
    nextAssertiveRegion.setAttribute('aria-atomic', 'true');
    root.append(style, nextStack, nextPoliteRegion, nextAssertiveRegion);
    for (const [id, value] of Object.entries(tokens)) {
      (root.host as HTMLElement).style.setProperty(
        tokenVariableName(id),
        tokenCssValue(theme, id, value),
      );
    }
    stack = nextStack;
    politeRegion = nextPoliteRegion;
    assertiveRegion = nextAssertiveRegion;
    document.documentElement.append(host);
  }

  function announce(record: ToastRecord): void {
    if (record.input.announcement === 'off') return;
    const region = record.input.announcement === 'assertive' ? assertiveRegion : politeRegion;
    if (!region) return;
    region.textContent = accessibleLabel(record.input);
  }

  function render(record: ToastRecord): void {
    ensureDom();
    const template = document.createElement('template');
    template.innerHTML = theme.template.trim();
    const root = template.content.firstElementChild;
    if (!(root instanceof HTMLElement)) throw new Error(`Theme ${theme.id} has no renderable root`);
    const message = root.querySelector<HTMLElement>('[data-toast-slot="message"]');
    const detail = root.querySelector<HTMLElement>('[data-toast-slot="detail"]');
    if (!message) throw new Error(`Theme ${theme.id} has no message slot`);
    message.textContent = record.input.message;
    if (record.input.lang) message.lang = record.input.lang;
    if (detail) {
      detail.textContent = record.input.detail ?? '';
      detail.toggleAttribute('hidden', !record.input.detail);
      if (record.input.lang) detail.lang = record.input.lang;
    }
    root.dataset.tone = record.input.tone;
    root.style.setProperty('--st-toast-tone', record.input.tone);
    root.setAttribute('role', 'group');
    root.setAttribute('aria-label', accessibleLabel(record.input));
    const toneLabel = root.querySelector<HTMLElement>('[data-toast-slot="tone-label"]');
    if (toneLabel) toneLabel.textContent = toneLabels[record.input.tone];
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.setProperty('--toast-duration', `${record.durationMs}ms`);
    toast.append(root);
    toast.setAttribute('aria-label', accessibleLabel(record.input));
    stack?.append(toast);
    record.element = toast;
    visible.push(record);
    announce(record);
    record.timer = setTimeout(() => dismiss(record), record.durationMs);
  }

  function dismiss(record: ToastRecord): void {
    if (record.settled) return;
    record.settled = true;
    if (record.timer) clearTimeout(record.timer);
    record.element?.remove();
    const visibleIndex = visible.indexOf(record);
    if (visibleIndex >= 0) visible.splice(visibleIndex, 1);
    const queuedIndex = queued.indexOf(record);
    if (queuedIndex >= 0) queued.splice(queuedIndex, 1);
    record.resolveClosed();
    if (visible.length < config.maxVisible) {
      const next = queued.shift();
      if (next) render(next);
    }
  }

  function dismissAll(): void {
    for (const record of [...visible, ...queued]) dismiss(record);
  }

  function destroy(): void {
    dismissAll();
    host?.remove();
    host = undefined;
    stack = undefined;
    politeRegion = undefined;
    assertiveRegion = undefined;
  }

  return {
    show(input) {
      const message = validateInput(input, config);
      let resolveClosed = (): void => undefined;
      const closed = new Promise<void>((resolve) => {
        resolveClosed = resolve;
      });
      const record: ToastRecord = {
        id: `st-toast-${++sequence}`,
        input: {
          ...input,
          message,
          tone: input.tone ?? 'info',
          announcement: input.announcement ?? 'polite',
        },
        durationMs: input.durationMs ?? config.durationMs,
        resolveClosed,
        closed,
        settled: false,
      };
      if (visible.length < config.maxVisible) render(record);
      else queued.push(record);
      return { id: record.id, closed, dismiss: () => dismiss(record) };
    },
    dismissAll,
    destroy,
  };
}

function resolveNotifierOptions(options: NotifierOptions): ResolvedNotifierOptions {
  const resolved = {
    themeId: options.themeId ?? getTheme()?.id ?? '',
    themeOverrides: options.themeOverrides ?? {},
    durationMs: options.durationMs ?? 3600,
    position: options.position ?? 'top-center',
    maxVisible: options.maxVisible ?? 3,
    zIndex: options.zIndex ?? 2147483646,
  } as ResolvedNotifierOptions;
  if (!Number.isFinite(resolved.durationMs) || resolved.durationMs <= 0) {
    throw new RangeError('durationMs must be greater than 0');
  }
  if (!Number.isInteger(resolved.maxVisible) || resolved.maxVisible <= 0) {
    throw new RangeError('maxVisible must be a positive integer');
  }
  if (!Number.isInteger(resolved.zIndex) || resolved.zIndex < 0) {
    throw new RangeError('zIndex must be a non-negative integer');
  }
  if (!getTheme(resolved.themeId)) throw new TypeError(`Unknown theme: ${resolved.themeId}`);
  return resolved;
}

function validateInput(input: ToastInput, config: ResolvedNotifierOptions): string {
  if (typeof input.message !== 'string' || input.message.trim() === '') {
    throw new TypeError('message must be a non-empty string');
  }
  const duration = input.durationMs ?? config.durationMs;
  if (!Number.isFinite(duration) || duration <= 0) throw new RangeError('durationMs must be greater than 0');
  return input.message.trim();
}

function accessibleLabel(input: Pick<ToastInput, 'message' | 'detail' | 'tone'>): string {
  return `${toneLabels[input.tone ?? 'info']}: ${input.message}${input.detail ? `. ${input.detail}` : ''}`;
}

function structuralCss(themeCss: string): string {
  return `:host{all:initial}${themeCss}.toast{opacity:0;animation:st-toast-life var(--toast-duration) ease-in-out both;max-width:min(440px,calc(100vw - 34px));}.stack{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;gap:8px;padding:68px 17px;box-sizing:border-box;pointer-events:none}.stack[data-position^="bottom"]{justify-content:flex-end;padding-bottom:24px}.stack[data-position$="left"]{align-items:flex-start}.stack[data-position$="right"]{align-items:flex-end}.live{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}@keyframes st-toast-life{0%,100%{opacity:0}8%,82%{opacity:1}}@media(prefers-reduced-motion:reduce){.toast{animation:none;opacity:1}}`;
}
