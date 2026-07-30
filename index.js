const M = "st-toast:show";
function q(e, t = {}) {
  const o = t.globalTarget ?? globalThis, i = t.eventTarget ?? document, a = o.STToastNotification;
  o.STToastNotification = {
    show: (d) => e.show(d)
  };
  const l = (d) => {
    e.show(d.detail);
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
function k(e = {}) {
  const t = {
    ...c,
    ...e,
    preset: "whisper"
  };
  if (h("primary", t.primary), h("accent1", t.accent1), h("accent2", t.accent2), h("accent3", t.accent3), h("foreground", t.foreground), h("mutedForeground", t.mutedForeground), N("titleFontSizePx", t.titleFontSizePx), N("detailFontSizePx", t.detailFontSizePx), !Number.isFinite(t.durationMs) || t.durationMs <= 0)
    throw new RangeError("durationMs must be greater than 0");
  if (!Number.isInteger(t.maxVisible) || t.maxVisible <= 0)
    throw new RangeError("maxVisible must be a positive integer");
  if (!Number.isInteger(t.zIndex) || t.zIndex < 0)
    throw new RangeError("zIndex must be a non-negative integer");
  return t;
}
function h(e, t) {
  if (!/^#[0-9a-f]{6}$/i.test(t))
    throw new TypeError(`${e} must be a six-digit hex color`);
}
function N(e, t) {
  if (!Number.isFinite(t) || t <= 0)
    throw new RangeError(`${e} must be a finite number greater than 0`);
}
const A = {
  info: "Info",
  success: "Success",
  warning: "Warning",
  error: "Error"
};
function H(e = {}) {
  const t = k(e);
  let o = 0, i, a, l, d;
  const m = [], b = [];
  function u() {
    if (i) return;
    i = document.createElement("div"), i.dataset.stToastHost = "", i.style.position = "fixed", i.style.inset = "0 auto auto 0", i.style.width = "100vw", i.style.height = "100dvh", i.style.maxWidth = "100%", i.style.zIndex = String(t.zIndex), i.style.pointerEvents = "none";
    const n = i.attachShadow({ mode: "open" });
    n.innerHTML = `<style>${O(t)}</style><div class="stack" data-position="${t.position}"></div><div class="live polite" aria-live="polite" aria-atomic="true"></div><div class="live assertive" aria-live="assertive" aria-atomic="true"></div>`, a = n.querySelector(".stack"), l = n.querySelector(".polite"), d = n.querySelector(".assertive"), document.documentElement.append(i);
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
    if (g >= 0 && b.splice(g, 1), n.resolveClosed(), m.length < t.maxVisible) {
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
      const s = L(n, t);
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
        durationMs: n.durationMs ?? t.durationMs,
        resolveClosed: g,
        closed: p,
        settled: !1
      };
      return m.length < t.maxVisible ? $(f) : b.push(f), {
        id: f.id,
        closed: p,
        dismiss: () => x(f)
      };
    },
    dismissAll: P,
    destroy: C
  };
}
function L(e, t) {
  if (typeof e.message != "string" || e.message.trim() === "")
    throw new TypeError("message must be a non-empty string");
  const o = e.durationMs ?? t.durationMs;
  if (!Number.isFinite(o) || o <= 0)
    throw new RangeError("durationMs must be greater than 0");
  return e.message.trim();
}
function I(e) {
  return `${A[e.tone ?? "info"]}: ${e.message}${e.detail ? `. ${e.detail}` : ""}`;
}
function O(e) {
  return `:host{all:initial}.stack{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;gap:8px;padding:68px 17px;box-sizing:border-box;pointer-events:none}.stack[data-position^="bottom"]{justify-content:flex-end;padding-bottom:24px}.stack[data-position$="left"]{align-items:flex-start}.stack[data-position$="right"]{align-items:flex-end}.toast{opacity:0;animation:whisper-life var(--toast-duration) ease-in-out both;max-width:min(440px,calc(100vw - 34px));color:${e.foreground}}.toast-inner{position:relative;display:grid;place-items:center;min-width:min(380px,calc(100vw - 34px));min-height:48px;padding:11px 76px;box-sizing:border-box}.toast-inner::before{content:"";position:absolute;z-index:-1;inset:-6px -12px;border-radius:13px 13px 18px 18px;background:radial-gradient(ellipse at 50% 130%,${e.accent1}33,transparent 64%),radial-gradient(ellipse at 50% -45%,${e.accent2}17,transparent 58%),linear-gradient(110deg,${e.accent3}0a,transparent 34%,transparent 66%,${e.accent3}08),${e.primary}f5;box-shadow:0 10px 26px #0006,0 2px 7px #0004,inset 0 1px ${e.accent2}0b;mask-image:linear-gradient(90deg,transparent,#000 28%,#000 72%,transparent)}.copy{position:relative;width:100%;text-align:center}.copy::before,.copy::after{content:"";position:absolute;top:50%;width:48px;height:1px}.copy::before{right:calc(100% + 12px);background:linear-gradient(90deg,transparent,${e.accent1}9e)}.copy::after{left:calc(100% + 12px);background:linear-gradient(90deg,${e.accent1}9e,transparent)}.title{font-family:Georgia,serif;font-size:${e.titleFontSizePx}px;font-style:italic;letter-spacing:.025em}.detail{margin-top:3px;color:${e.mutedForeground};font-family:Georgia,serif;font-size:${e.detailFontSizePx}px;letter-spacing:.06em}.title:lang(zh-CN),.detail:lang(zh-CN){font-family:"Noto Sans SC Variable","Microsoft YaHei","PingFang SC",sans-serif;font-style:normal;font-weight:600;letter-spacing:.04em}.title:lang(zh-TW),.title:lang(zh-HK),.title:lang(zh-Hant),.detail:lang(zh-TW),.detail:lang(zh-HK),.detail:lang(zh-Hant){font-family:"Noto Sans TC Variable","Microsoft JhengHei","PingFang TC",sans-serif;font-style:normal;font-weight:600;letter-spacing:.04em}.live{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}@keyframes whisper-life{0%,100%{opacity:0}8%,82%{opacity:1}}@media(prefers-reduced-motion:reduce){.toast{animation:none;opacity:1}}`;
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
function _(e) {
  const t = D(e[E]) ? e[E] : {}, o = {
    preset: t.preset === "whisper" ? "whisper" : r.preset,
    primary: y(t.primary, r.primary),
    accent1: y(t.accent1, r.accent1),
    accent2: y(t.accent2, r.accent2),
    accent3: y(t.accent3, r.accent3),
    foreground: y(t.foreground, r.foreground),
    mutedForeground: y(
      t.mutedForeground,
      r.mutedForeground
    ),
    titleFontSizePx: T(
      t.titleFontSizePx,
      r.titleFontSizePx
    ),
    detailFontSizePx: T(
      t.detailFontSizePx,
      r.detailFontSizePx
    ),
    durationMs: T(t.durationMs, r.durationMs),
    position: R.includes(t.position) ? t.position : r.position,
    maxVisible: T(t.maxVisible, r.maxVisible)
  };
  let i = o;
  try {
    k(o);
  } catch {
    i = { ...r };
  }
  return e[E] = i, i;
}
function D(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
function y(e, t) {
  return typeof e == "string" ? e : t;
}
function T(e, t) {
  return typeof e == "number" ? e : t;
}
function j(e, t = document.querySelector("#extensions_settings2")) {
  if (!t) throw new Error("SillyTavern extension settings panel was not found");
  const o = _(e.extensionSettings), i = W(o);
  t.append(i);
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
    x && (x.value = u.value), e.saveSettingsDebounced(), d();
  };
  return i.addEventListener("input", m), i.querySelector('[data-action="preview"]')?.addEventListener("click", () => {
    a.show({
      message: "Memory recalled",
      detail: "This moment will be remembered.",
      tone: "info"
    });
  }), i.querySelector('[data-action="reset"]')?.addEventListener("click", () => {
    Object.assign(o, r), V(i, o), e.saveSettingsDebounced(), d();
  }), () => {
    i.removeEventListener("input", m), l(), a.destroy(), i.remove();
  };
}
function W(e) {
  const t = document.createElement("section");
  return t.dataset.stToastSettings = "", t.className = "st-toast-settings", t.innerHTML = `<div class="inline-drawer"><div class="inline-drawer-toggle inline-drawer-header"><b>Toast Notifications</b><div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div></div><div class="inline-drawer-content"><label>Preset<select name="preset"><option value="whisper">Whisper</option></select></label><div class="st-toast-color-grid">${w("Primary", "primary")}${w("Accent 1", "accent1")}${w("Accent 2", "accent2")}${w("Accent 3", "accent3")}${w("Text", "foreground")}${w("Muted text", "mutedForeground")}</div>${z("Title size", "titleFontSizePx", 10, 24)}${z("Detail size", "detailFontSizePx", 8, 18)}${z("Duration", "durationMs", 1e3, 1e4, 100)}${z("Maximum visible", "maxVisible", 1, 6)}<label>Position<select name="position"><option value="top-left">Top left</option><option value="top-center">Top center</option><option value="top-right">Top right</option><option value="bottom-left">Bottom left</option><option value="bottom-center">Bottom center</option><option value="bottom-right">Bottom right</option></select></label><div class="st-toast-actions"><button type="button" class="menu_button" data-action="preview">Preview</button><button type="button" class="menu_button" data-action="reset">Reset</button></div></div></div>`, V(t, e), t;
}
function w(e, t) {
  return `<label>${e}<input type="color" name="${t}"></label>`;
}
function z(e, t, o, i, a = 1) {
  return `<label>${e}<input type="range" name="${t}" min="${o}" max="${i}" step="${a}"><output data-output="${t}"></output></label>`;
}
function V(e, t) {
  for (const [o, i] of Object.entries(t)) {
    const a = e.querySelector(
      `[name="${o}"]`
    );
    a && (a.value = String(i));
    const l = e.querySelector(`[data-output="${o}"]`);
    l && (l.value = String(i));
  }
}
let F;
function B() {
  F?.(), F = j(SillyTavern.getContext());
}
function G() {
  F?.(), F = void 0;
}
export {
  B as onActivate,
  G as onDisable
};
