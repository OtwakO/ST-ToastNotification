const M = "st-toast:show";
function q(t, e = {}) {
  const o = e.globalTarget ?? globalThis, i = e.eventTarget ?? document, a = o.STToastNotification;
  o.STToastNotification = {
    show: (d) => t.show(d)
  };
  const l = (d) => {
    t.show(d.detail);
  };
  return i.addEventListener(M, l), () => {
    i.removeEventListener(M, l), a ? o.STToastNotification = a : delete o.STToastNotification;
  };
}
const c = {
  preset: "whisper",
  primary: "#141214",
  accent1: "#e0ccaa",
  accent2: "#f3e6cf",
  accent3: "#eedcbe",
  foreground: "#f5f0e8",
  mutedForeground: "#d8cec0",
  titleFontSizePx: 14,
  detailFontSizePx: 10,
  durationMs: 3600,
  position: "top-center",
  maxVisible: 3,
  zIndex: 2147483646
};
function k(t = {}) {
  const e = {
    ...c,
    ...t,
    preset: "whisper"
  };
  if (h("primary", e.primary), h("accent1", e.accent1), h("accent2", e.accent2), h("accent3", e.accent3), h("foreground", e.foreground), h("mutedForeground", e.mutedForeground), N("titleFontSizePx", e.titleFontSizePx), N("detailFontSizePx", e.detailFontSizePx), !Number.isFinite(e.durationMs) || e.durationMs <= 0)
    throw new RangeError("durationMs must be greater than 0");
  if (!Number.isInteger(e.maxVisible) || e.maxVisible <= 0)
    throw new RangeError("maxVisible must be a positive integer");
  if (!Number.isInteger(e.zIndex) || e.zIndex < 0)
    throw new RangeError("zIndex must be a non-negative integer");
  return e;
}
function h(t, e) {
  if (!/^#[0-9a-f]{6}$/i.test(e))
    throw new TypeError(`${t} must be a six-digit hex color`);
}
function N(t, e) {
  if (!Number.isFinite(e) || e <= 0)
    throw new RangeError(`${t} must be a finite number greater than 0`);
}
const A = {
  info: "Info",
  success: "Success",
  warning: "Warning",
  error: "Error"
};
function H(t = {}) {
  const e = k(t);
  let o = 0, i, a, l, d;
  const m = [], b = [];
  function u() {
    if (i) return;
    i = document.createElement("div"), i.dataset.stToastHost = "", i.style.position = "fixed", i.style.inset = "0", i.style.zIndex = String(e.zIndex), i.style.pointerEvents = "none";
    const n = i.attachShadow({ mode: "open" });
    n.innerHTML = `<style>${O(e)}</style><div class="stack" data-position="${e.position}"></div><div class="live polite" aria-live="polite" aria-atomic="true"></div><div class="live assertive" aria-live="assertive" aria-atomic="true"></div>`, a = n.querySelector(".stack"), l = n.querySelector(".polite"), d = n.querySelector(".assertive"), document.body.append(i);
  }
  function S(n) {
    if (n.input.announcement === "off") return;
    const s = n.input.announcement === "assertive" ? d : l;
    s && (s.textContent = I(n.input));
  }
  function $(n) {
    u();
    const s = document.createElement("div");
    s.className = "toast", s.dataset.tone = n.input.tone, s.style.setProperty("--toast-duration", `${n.durationMs}ms`), s.setAttribute("role", "group"), s.setAttribute("aria-label", I(n.input));
    const g = document.createElement("div");
    g.className = "toast-inner";
    const p = document.createElement("div");
    p.className = "copy";
    const f = document.createElement("div");
    if (f.className = "title", f.textContent = n.input.message, n.input.lang && (f.lang = n.input.lang), p.append(f), n.input.detail) {
      const v = document.createElement("div");
      v.className = "detail", v.textContent = n.input.detail, n.input.lang && (v.lang = n.input.lang), p.append(v);
    }
    g.append(p), s.append(g), a?.append(s), n.element = s, m.push(n), S(n), n.timer = setTimeout(() => x(n), n.durationMs);
  }
  function x(n) {
    if (n.settled) return;
    n.settled = !0, n.timer && clearTimeout(n.timer), n.element?.remove();
    const s = m.indexOf(n);
    s >= 0 && m.splice(s, 1);
    const g = b.indexOf(n);
    if (g >= 0 && b.splice(g, 1), n.resolveClosed(), m.length < e.maxVisible) {
      const p = b.shift();
      p && $(p);
    }
  }
  function P() {
    for (const n of [...m, ...b]) x(n);
  }
  function C() {
    P(), i?.remove(), i = void 0, a = void 0, l = void 0, d = void 0;
  }
  return {
    show(n) {
      const s = L(n, e);
      let g = () => {
      };
      const p = new Promise((v) => {
        g = v;
      }), f = {
        id: `st-toast-${++o}`,
        input: {
          ...n,
          message: s,
          tone: n.tone ?? "info",
          announcement: n.announcement ?? "polite"
        },
        durationMs: n.durationMs ?? e.durationMs,
        resolveClosed: g,
        closed: p,
        settled: !1
      };
      return m.length < e.maxVisible ? $(f) : b.push(f), {
        id: f.id,
        closed: p,
        dismiss: () => x(f)
      };
    },
    dismissAll: P,
    destroy: C
  };
}
function L(t, e) {
  if (typeof t.message != "string" || t.message.trim() === "")
    throw new TypeError("message must be a non-empty string");
  const o = t.durationMs ?? e.durationMs;
  if (!Number.isFinite(o) || o <= 0)
    throw new RangeError("durationMs must be greater than 0");
  return t.message.trim();
}
function I(t) {
  return `${A[t.tone ?? "info"]}: ${t.message}${t.detail ? `. ${t.detail}` : ""}`;
}
function O(t) {
  return `:host{all:initial}.stack{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;gap:8px;padding:68px 17px;box-sizing:border-box;pointer-events:none}.stack[data-position^="bottom"]{justify-content:flex-end;padding-bottom:24px}.stack[data-position$="left"]{align-items:flex-start}.stack[data-position$="right"]{align-items:flex-end}.toast{opacity:0;animation:whisper-life var(--toast-duration) ease-in-out both;max-width:min(440px,calc(100vw - 34px));color:${t.foreground}}.toast-inner{position:relative;display:grid;place-items:center;min-width:min(380px,calc(100vw - 34px));min-height:48px;padding:11px 76px;box-sizing:border-box}.toast-inner::before{content:"";position:absolute;z-index:-1;inset:-6px -12px;border-radius:13px 13px 18px 18px;background:radial-gradient(ellipse at 50% 130%,${t.accent1}33,transparent 64%),radial-gradient(ellipse at 50% -45%,${t.accent2}17,transparent 58%),linear-gradient(110deg,${t.accent3}0a,transparent 34%,transparent 66%,${t.accent3}08),${t.primary}f5;box-shadow:0 10px 26px #0006,0 2px 7px #0004,inset 0 1px ${t.accent2}0b;mask-image:linear-gradient(90deg,transparent,#000 28%,#000 72%,transparent)}.copy{position:relative;width:100%;text-align:center}.copy::before,.copy::after{content:"";position:absolute;top:50%;width:48px;height:1px}.copy::before{right:calc(100% + 12px);background:linear-gradient(90deg,transparent,${t.accent1}9e)}.copy::after{left:calc(100% + 12px);background:linear-gradient(90deg,${t.accent1}9e,transparent)}.title{font-family:Georgia,serif;font-size:${t.titleFontSizePx}px;font-style:italic;letter-spacing:.025em}.detail{margin-top:3px;color:${t.mutedForeground};font-family:Georgia,serif;font-size:${t.detailFontSizePx}px;letter-spacing:.06em}.title:lang(zh-CN),.detail:lang(zh-CN){font-family:"Noto Sans SC Variable","Microsoft YaHei","PingFang SC",sans-serif;font-style:normal;font-weight:600;letter-spacing:.04em}.title:lang(zh-TW),.title:lang(zh-HK),.title:lang(zh-Hant),.detail:lang(zh-TW),.detail:lang(zh-HK),.detail:lang(zh-Hant){font-family:"Noto Sans TC Variable","Microsoft JhengHei","PingFang TC",sans-serif;font-style:normal;font-weight:600;letter-spacing:.04em}.live{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}@keyframes whisper-life{0%,100%{opacity:0}8%,82%{opacity:1}}@media(prefers-reduced-motion:reduce){.toast{animation:none;opacity:1}}`;
}
const E = "st_toast_notification", r = {
  preset: "whisper",
  primary: c.primary,
  accent1: c.accent1,
  accent2: c.accent2,
  accent3: c.accent3,
  foreground: c.foreground,
  mutedForeground: c.mutedForeground,
  titleFontSizePx: c.titleFontSizePx,
  detailFontSizePx: c.detailFontSizePx,
  durationMs: c.durationMs,
  position: c.position,
  maxVisible: c.maxVisible
}, R = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right"
];
function _(t) {
  const e = D(t[E]) ? t[E] : {}, o = {
    preset: e.preset === "whisper" ? "whisper" : r.preset,
    primary: y(e.primary, r.primary),
    accent1: y(e.accent1, r.accent1),
    accent2: y(e.accent2, r.accent2),
    accent3: y(e.accent3, r.accent3),
    foreground: y(e.foreground, r.foreground),
    mutedForeground: y(
      e.mutedForeground,
      r.mutedForeground
    ),
    titleFontSizePx: T(
      e.titleFontSizePx,
      r.titleFontSizePx
    ),
    detailFontSizePx: T(
      e.detailFontSizePx,
      r.detailFontSizePx
    ),
    durationMs: T(e.durationMs, r.durationMs),
    position: R.includes(e.position) ? e.position : r.position,
    maxVisible: T(e.maxVisible, r.maxVisible)
  };
  let i = o;
  try {
    k(o);
  } catch {
    i = { ...r };
  }
  return t[E] = i, i;
}
function D(t) {
  return typeof t == "object" && t !== null && !Array.isArray(t);
}
function y(t, e) {
  return typeof t == "string" ? t : e;
}
function T(t, e) {
  return typeof t == "number" ? t : e;
}
function j(t, e = document.querySelector("#extensions_settings2")) {
  if (!e) throw new Error("SillyTavern extension settings panel was not found");
  const o = _(t.extensionSettings), i = B(o);
  e.append(i);
  let a, l;
  const d = () => {
    a?.destroy(), l?.(), a = H(o), l = q(a);
  };
  d();
  const m = (b) => {
    const u = b.target;
    if (!(u instanceof HTMLInputElement || u instanceof HTMLSelectElement))
      return;
    const S = u.name;
    if (!Object.hasOwn(o, S)) return;
    const $ = u.type === "range" ? Number(u.value) : u.value;
    Object.assign(o, { [S]: $ });
    const x = i.querySelector(
      `[data-output="${u.name}"]`
    );
    x && (x.value = u.value), t.saveSettingsDebounced(), d();
  };
  return i.addEventListener("input", m), i.querySelector('[data-action="preview"]')?.addEventListener("click", () => {
    a.show({
      message: "Memory recalled",
      detail: "This moment will be remembered.",
      tone: "info"
    });
  }), i.querySelector('[data-action="reset"]')?.addEventListener("click", () => {
    Object.assign(o, r), V(i, o), t.saveSettingsDebounced(), d();
  }), () => {
    i.removeEventListener("input", m), l(), a.destroy(), i.remove();
  };
}
function B(t) {
  const e = document.createElement("section");
  return e.dataset.stToastSettings = "", e.className = "st-toast-settings", e.innerHTML = `<div class="inline-drawer"><div class="inline-drawer-toggle inline-drawer-header"><b>Toast Notifications</b><div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div></div><div class="inline-drawer-content"><label>Preset<select name="preset"><option value="whisper">Whisper</option></select></label><div class="st-toast-color-grid">${w("Primary", "primary")}${w("Accent 1", "accent1")}${w("Accent 2", "accent2")}${w("Accent 3", "accent3")}${w("Text", "foreground")}${w("Muted text", "mutedForeground")}</div>${z("Title size", "titleFontSizePx", 10, 24)}${z("Detail size", "detailFontSizePx", 8, 18)}${z("Duration", "durationMs", 1e3, 1e4, 100)}${z("Maximum visible", "maxVisible", 1, 6)}<label>Position<select name="position"><option value="top-left">Top left</option><option value="top-center">Top center</option><option value="top-right">Top right</option><option value="bottom-left">Bottom left</option><option value="bottom-center">Bottom center</option><option value="bottom-right">Bottom right</option></select></label><div class="st-toast-actions"><button type="button" class="menu_button" data-action="preview">Preview</button><button type="button" class="menu_button" data-action="reset">Reset</button></div></div></div>`, V(e, t), e;
}
function w(t, e) {
  return `<label>${t}<input type="color" name="${e}"></label>`;
}
function z(t, e, o, i, a = 1) {
  return `<label>${t}<input type="range" name="${e}" min="${o}" max="${i}" step="${a}"><output data-output="${e}"></output></label>`;
}
function V(t, e) {
  for (const [o, i] of Object.entries(e)) {
    const a = t.querySelector(
      `[name="${o}"]`
    );
    a && (a.value = String(i));
    const l = t.querySelector(`[data-output="${o}"]`);
    l && (l.value = String(i));
  }
}
let F;
function W() {
  F?.(), F = j(SillyTavern.getContext());
}
function G() {
  F?.(), F = void 0;
}
export {
  W as onActivate,
  G as onDisable
};
