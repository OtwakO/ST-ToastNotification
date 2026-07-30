// Exposes the portable notifier factory and a convenient lazy singleton.
import {
  createNotifier,
  type Notifier,
  type ToastHandle,
  type ToastInput,
} from './toast/notifier';

let singleton: Notifier | undefined;

export const toast: Notifier = {
  show(input: ToastInput): ToastHandle {
    singleton ??= createNotifier();
    return singleton.show(input);
  },
  dismissAll(): void {
    singleton?.dismissAll();
  },
  destroy(): void {
    singleton?.destroy();
    singleton = undefined;
  },
};

export { createNotifier };
export { resolveWhisperOptions, whisperDefaults } from './themes/whisper';
export type {
  NotifierOptions,
  ResolvedNotifierOptions,
  ToastPosition,
} from './themes/whisper';
export type {
  Notifier,
  ToastAnnouncement,
  ToastHandle,
  ToastInput,
  ToastTone,
} from './toast/notifier';
