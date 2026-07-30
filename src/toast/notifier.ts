// Owns the lazy Shadow DOM host, toast lifecycle, queue, and announcements.
import {
  resolveWhisperOptions,
  type NotifierOptions,
  type ResolvedNotifierOptions,
} from '../themes/whisper';

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
  const config = resolveWhisperOptions(options);
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
    host.style.inset = '0';
    host.style.zIndex = String(config.zIndex);
    host.style.pointerEvents = 'none';
    const root = host.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>${whisperCss(config)}</style><div class="stack" data-position="${config.position}"></div><div class="live polite" aria-live="polite" aria-atomic="true"></div><div class="live assertive" aria-live="assertive" aria-atomic="true"></div>`;
    stack = root.querySelector('.stack') as HTMLElement;
    politeRegion = root.querySelector('.polite') as HTMLElement;
    assertiveRegion = root.querySelector('.assertive') as HTMLElement;
    document.body.append(host);
  }

  function announce(record: ToastRecord): void {
    if (record.input.announcement === 'off') return;
    const region =
      record.input.announcement === 'assertive' ? assertiveRegion : politeRegion;
    if (!region) return;
    region.textContent = accessibleLabel(record.input);
  }

  function render(record: ToastRecord): void {
    ensureDom();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.dataset.tone = record.input.tone;
    toast.style.setProperty('--toast-duration', `${record.durationMs}ms`);
    toast.setAttribute('role', 'group');
    toast.setAttribute('aria-label', accessibleLabel(record.input));

    const inner = document.createElement('div');
    inner.className = 'toast-inner';
    const copy = document.createElement('div');
    copy.className = 'copy';
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = record.input.message;
    if (record.input.lang) title.lang = record.input.lang;
    copy.append(title);
    if (record.input.detail) {
      const detail = document.createElement('div');
      detail.className = 'detail';
      detail.textContent = record.input.detail;
      if (record.input.lang) detail.lang = record.input.lang;
      copy.append(detail);
    }
    inner.append(copy);
    toast.append(inner);
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
      return {
        id: record.id,
        closed,
        dismiss: () => dismiss(record),
      };
    },
    dismissAll,
    destroy,
  };
}

function validateInput(input: ToastInput, config: ResolvedNotifierOptions): string {
  if (typeof input.message !== 'string' || input.message.trim() === '') {
    throw new TypeError('message must be a non-empty string');
  }
  const duration = input.durationMs ?? config.durationMs;
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new RangeError('durationMs must be greater than 0');
  }
  return input.message.trim();
}

function accessibleLabel(input: Pick<ToastInput, 'message' | 'detail' | 'tone'>): string {
  return `${toneLabels[input.tone ?? 'info']}: ${input.message}${input.detail ? `. ${input.detail}` : ''}`;
}

function whisperCss(config: ResolvedNotifierOptions): string {
  return `:host{all:initial}.stack{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;gap:8px;padding:68px 17px;box-sizing:border-box;pointer-events:none}.stack[data-position^="bottom"]{justify-content:flex-end;padding-bottom:24px}.stack[data-position$="left"]{align-items:flex-start}.stack[data-position$="right"]{align-items:flex-end}.toast{opacity:0;animation:whisper-life var(--toast-duration) ease-in-out both;max-width:min(440px,calc(100vw - 34px));color:${config.foreground}}.toast-inner{position:relative;display:grid;place-items:center;min-width:min(380px,calc(100vw - 34px));min-height:48px;padding:11px 76px;box-sizing:border-box}.toast-inner::before{content:"";position:absolute;z-index:-1;inset:-6px -12px;border-radius:13px 13px 18px 18px;background:radial-gradient(ellipse at 50% 130%,${config.accent1}33,transparent 64%),radial-gradient(ellipse at 50% -45%,${config.accent2}17,transparent 58%),linear-gradient(110deg,${config.accent3}0a,transparent 34%,transparent 66%,${config.accent3}08),${config.primary}f5;box-shadow:0 10px 26px #0006,0 2px 7px #0004,inset 0 1px ${config.accent2}0b;mask-image:linear-gradient(90deg,transparent,#000 28%,#000 72%,transparent)}.copy{position:relative;width:100%;text-align:center}.copy::before,.copy::after{content:"";position:absolute;top:50%;width:48px;height:1px}.copy::before{right:calc(100% + 12px);background:linear-gradient(90deg,transparent,${config.accent1}9e)}.copy::after{left:calc(100% + 12px);background:linear-gradient(90deg,${config.accent1}9e,transparent)}.title{font-family:Georgia,serif;font-size:${config.titleFontSizePx}px;font-style:italic;letter-spacing:.025em}.detail{margin-top:3px;color:${config.mutedForeground};font-family:Georgia,serif;font-size:${config.detailFontSizePx}px;letter-spacing:.06em}.title:lang(zh-CN),.detail:lang(zh-CN){font-family:"Noto Sans SC Variable","Microsoft YaHei","PingFang SC",sans-serif;font-style:normal;font-weight:600;letter-spacing:.04em}.title:lang(zh-TW),.title:lang(zh-HK),.title:lang(zh-Hant),.detail:lang(zh-TW),.detail:lang(zh-HK),.detail:lang(zh-Hant){font-family:"Noto Sans TC Variable","Microsoft JhengHei","PingFang TC",sans-serif;font-style:normal;font-weight:600;letter-spacing:.04em}.live{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}@keyframes whisper-life{0%,100%{opacity:0}8%,82%{opacity:1}}@media(prefers-reduced-motion:reduce){.toast{animation:none;opacity:1}}`;
}
