// SillyTavern extension entry point using only the stable global context API.
import { startSillyTavernAdapter } from './adapter';

interface SillyTavernGlobal {
  getContext(): {
    extensionSettings: Record<string, unknown>;
    saveSettingsDebounced(): void;
  };
}

declare const SillyTavern: SillyTavernGlobal;

let cleanup: (() => void) | undefined;

export function onActivate(): void {
  cleanup?.();
  cleanup = startSillyTavernAdapter(SillyTavern.getContext());
}

export function onDisable(): void {
  cleanup?.();
  cleanup = undefined;
}
