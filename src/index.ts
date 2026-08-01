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
export { installBridges, TOAST_EVENT_NAME } from './bridges';
export type { BridgeOptions, ToastBridgeGlobal } from './bridges';
export { getTheme, listThemes, themeCatalog } from './themes/catalog';
export { resolveThemeTokens, tokenVariableName } from './themes/resolve';
export type {
  ColorToken,
  NumericToken,
  SelectToken,
  BooleanToken,
  ThemeCatalog,
  ThemeManifest,
  ThemePack,
  ThemeTokenDefinition,
  ThemeTokenValue,
} from './themes/types';
export type {
  NotifierOptions,
  ResolvedNotifierOptions,
  ToastPosition,
} from './toast/notifier';
export type {
  Notifier,
  ToastAnnouncement,
  ToastHandle,
  ToastInput,
  ToastTone,
} from './toast/notifier';
