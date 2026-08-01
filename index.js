const L = "st-toast:show";
function _(e, t = {}) {
  const n = t.globalTarget ?? globalThis, o = t.eventTarget ?? document, i = n.STToastNotification;
  n.STToastNotification = {
    show: (s) => e.show(s)
  };
  const r = (s) => {
    e.show(s.detail);
  };
  return o.addEventListener(L, r), () => {
    o.removeEventListener(L, r), i ? n.STToastNotification = i : delete n.STToastNotification;
  };
}
const D = "whisper", G = { whisper: { schemaVersion: 1, id: "whisper", name: "Whisper", description: "A quiet typographic memory cue.", tokens: { primary: { type: "color", label: "Primary", default: "#141214", legacyKeys: ["primary"], used: !0 }, secondary: { type: "color", label: "Secondary", default: "#242124", used: !1 }, accent1: { type: "color", label: "Accent 1", default: "#e0ccaa", legacyKeys: ["accent1"], used: !0 }, accent2: { type: "color", label: "Accent 2", default: "#f3e6cf", legacyKeys: ["accent2"], used: !0 }, accent3: { type: "color", label: "Accent 3", default: "#eedcbe", legacyKeys: ["accent3"], used: !0 }, accent4: { type: "color", label: "Accent 4", default: "#c9b99f", used: !1 }, accent5: { type: "color", label: "Accent 5", default: "#a9987d", used: !1 }, accent6: { type: "color", label: "Accent 6", default: "#877861", used: !1 }, foreground: { type: "color", label: "Text", default: "#f5f0e8", legacyKeys: ["foreground"], used: !0 }, mutedForeground: { type: "color", label: "Muted text", default: "#d8cec0", legacyKeys: ["mutedForeground"], used: !0 }, titleFontSizePx: { type: "range", label: "Title size", default: 14, min: 10, max: 24, step: 1, unit: "px", legacyKeys: ["titleFontSizePx"] }, detailFontSizePx: { type: "range", label: "Detail size", default: 10, min: 8, max: 18, step: 1, unit: "px", legacyKeys: ["detailFontSizePx"] } }, template: `<div data-toast-root>
  <div class="toast-inner">
    <div class="copy">
      <div data-toast-slot="message"></div>
      <div data-toast-slot="detail"></div>
    </div>
  </div>
</div>
`, css: `[data-toast-root] {
  position: relative;
  display: grid;
  place-items: center;
  min-width: min(380px, calc(100vw - 20px));
  min-height: 48px;
  padding: 11px 76px;
  box-sizing: border-box;
  color: var(--st-token-foreground);
}

[data-toast-root]::before {
  content: "";
  position: absolute;
  z-index: -1;
  inset: -6px -12px;
  border-radius: 13px 13px 18px 18px;
  background:
    radial-gradient(ellipse at 50% 130%, color-mix(in srgb, var(--st-token-accent1) 20%, transparent), transparent 64%),
    radial-gradient(ellipse at 50% -45%, color-mix(in srgb, var(--st-token-accent2) 9%, transparent), transparent 58%),
    linear-gradient(110deg, color-mix(in srgb, var(--st-token-accent3) 4%, transparent), transparent 34%, transparent 66%, color-mix(in srgb, var(--st-token-accent3) 3%, transparent)),
    color-mix(in srgb, var(--st-token-primary) 96%, transparent);
  box-shadow: 0 10px 26px #0006, 0 2px 7px #0004,
    inset 0 1px color-mix(in srgb, var(--st-token-accent2) 4%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 28%, #000 72%, transparent);
}

[data-toast-root] .copy {
  position: relative;
  width: 100%;
  text-align: center;
}

[data-toast-root] .copy::before,
[data-toast-root] .copy::after {
  content: "";
  position: absolute;
  top: 50%;
  width: 48px;
  height: 1px;
}

[data-toast-root] .copy::before {
  right: calc(100% + 12px);
  background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--st-token-accent1) 62%, transparent));
}

[data-toast-root] .copy::after {
  left: calc(100% + 12px);
  background: linear-gradient(90deg, color-mix(in srgb, var(--st-token-accent1) 62%, transparent), transparent);
}

[data-toast-root] [data-toast-slot="message"] {
  font-family: Georgia, serif;
  font-size: var(--st-token-title-font-size-px);
  font-style: italic;
  letter-spacing: .025em;
}

[data-toast-root] [data-toast-slot="detail"] {
  margin-top: 3px;
  color: var(--st-token-muted-foreground);
  font-family: Georgia, serif;
  font-size: var(--st-token-detail-font-size-px);
  letter-spacing: .06em;
}

[data-toast-root] [data-toast-slot="message"]:lang(zh-CN),
[data-toast-root] [data-toast-slot="detail"]:lang(zh-CN) {
  font-family: "Noto Sans SC Variable", "Microsoft YaHei", "PingFang SC", sans-serif;
  font-style: normal;
  font-weight: 600;
  letter-spacing: .04em;
}

[data-toast-root] [data-toast-slot="message"]:lang(zh-TW),
[data-toast-root] [data-toast-slot="message"]:lang(zh-HK),
[data-toast-root] [data-toast-slot="message"]:lang(zh-Hant),
[data-toast-root] [data-toast-slot="detail"]:lang(zh-TW),
[data-toast-root] [data-toast-slot="detail"]:lang(zh-HK),
[data-toast-root] [data-toast-slot="detail"]:lang(zh-Hant) {
  font-family: "Noto Sans TC Variable", "Microsoft JhengHei", "PingFang TC", sans-serif;
  font-style: normal;
  font-weight: 600;
  letter-spacing: .04em;
}
` } }, U = {
  defaultThemeId: D,
  themes: G
}, E = U;
function v(e) {
  const t = e ?? E.defaultThemeId;
  return E.themes[t];
}
function W() {
  return Object.values(E.themes).map(({ id: e, name: t, description: n }) => ({
    id: e,
    name: t,
    description: n
  }));
}
function q(e, t = {}) {
  for (const n of Object.keys(t))
    if (!e.tokens[n]) throw new TypeError(`Unknown theme token: ${n}`);
  return Object.fromEntries(
    Object.entries(e.tokens).map(([n, o]) => [
      n,
      Y(n, o, t[n] ?? o.default)
    ])
  );
}
function Y(e, t, n) {
  if (t.type === "color") {
    if (typeof n != "string" || !/^#[0-9a-f]{6}$/i.test(n))
      throw new TypeError(`${e} must be a six-digit hex color`);
    return n;
  }
  if (t.type === "boolean") {
    if (typeof n != "boolean") throw new TypeError(`${e} must be boolean`);
    return n;
  }
  if (t.type === "select") {
    if (typeof n != "string" || !t.options.some((o) => o.value === n))
      throw new TypeError(`${e} must be one of the declared options`);
    return n;
  }
  if (typeof n != "number" || !Number.isFinite(n) || n < t.min || n > t.max)
    throw new RangeError(`${e} must be within its declared bounds`);
  return n;
}
function J(e) {
  return `--st-token-${e.replace(/[A-Z]/g, (t) => `-${t.toLowerCase()}`)}`;
}
function Z(e, t, n) {
  const o = e.tokens[t];
  if (!o) throw new TypeError(`Unknown theme token: ${t}`);
  return (o.type === "range" || o.type === "number") && o.unit ? `${n}${o.unit}` : String(n);
}
const K = {
  info: "Info",
  success: "Success",
  warning: "Warning",
  error: "Error"
};
function Q(e = {}) {
  const t = X(e), n = v(t.themeId);
  if (!n) throw new TypeError(`Unknown theme: ${t.themeId}`);
  const o = n, i = q(o, t.themeOverrides);
  let r = 0, s, m, c, d;
  const h = [], g = [];
  function u() {
    if (s) return;
    s = document.createElement("div"), s.dataset.stToastHost = "", s.style.position = "fixed", s.style.inset = "0 auto auto 0", s.style.width = "100vw", s.style.height = "100dvh", s.style.maxWidth = "100%", s.style.zIndex = String(t.zIndex), s.style.pointerEvents = "none";
    const a = s.attachShadow({ mode: "open" }), b = document.createElement("style");
    b.textContent = te(o.css);
    const l = document.createElement("div");
    l.className = "stack", l.dataset.position = t.position;
    const p = document.createElement("div");
    p.className = "live polite", p.setAttribute("aria-live", "polite"), p.setAttribute("aria-atomic", "true");
    const f = document.createElement("div");
    f.className = "live assertive", f.setAttribute("aria-live", "assertive"), f.setAttribute("aria-atomic", "true"), a.append(b, l, p, f);
    for (const [T, x] of Object.entries(i))
      a.host.style.setProperty(
        J(T),
        Z(o, T, x)
      );
    m = l, c = p, d = f, document.documentElement.append(s);
  }
  function y(a) {
    if (a.input.announcement === "off") return;
    const b = a.input.announcement === "assertive" ? d : c;
    b && (b.textContent = N(a.input));
  }
  function k(a) {
    u();
    const b = document.createElement("template");
    b.innerHTML = o.template.trim();
    const l = b.content.firstElementChild;
    if (!(l instanceof HTMLElement)) throw new Error(`Theme ${o.id} has no renderable root`);
    const p = l.querySelector('[data-toast-slot="message"]'), f = l.querySelector('[data-toast-slot="detail"]');
    if (!p) throw new Error(`Theme ${o.id} has no message slot`);
    p.textContent = a.input.message, a.input.lang && (p.lang = a.input.lang), f && (f.textContent = a.input.detail ?? "", f.toggleAttribute("hidden", !a.input.detail), a.input.lang && (f.lang = a.input.lang)), l.dataset.tone = a.input.tone, l.style.setProperty("--st-toast-tone", a.input.tone), l.setAttribute("role", "group"), l.setAttribute("aria-label", N(a.input));
    const T = l.querySelector('[data-toast-slot="tone-label"]');
    T && (T.textContent = K[a.input.tone]);
    const x = document.createElement("div");
    x.className = "toast", x.style.setProperty("--toast-duration", `${a.durationMs}ms`), x.append(l), x.setAttribute("aria-label", N(a.input)), m?.append(x), a.element = x, h.push(a), y(a), a.timer = setTimeout(() => O(a), a.durationMs);
  }
  function O(a) {
    if (a.settled) return;
    a.settled = !0, a.timer && clearTimeout(a.timer), a.element?.remove();
    const b = h.indexOf(a);
    b >= 0 && h.splice(b, 1);
    const l = g.indexOf(a);
    if (l >= 0 && g.splice(l, 1), a.resolveClosed(), h.length < t.maxVisible) {
      const p = g.shift();
      p && k(p);
    }
  }
  function C() {
    for (const a of [...h, ...g]) O(a);
  }
  function B() {
    C(), s?.remove(), s = void 0, m = void 0, c = void 0, d = void 0;
  }
  return {
    show(a) {
      const b = ee(a, t);
      let l = () => {
      };
      const p = new Promise((T) => {
        l = T;
      }), f = {
        id: `st-toast-${++r}`,
        input: {
          ...a,
          message: b,
          tone: a.tone ?? "info",
          announcement: a.announcement ?? "polite"
        },
        durationMs: a.durationMs ?? t.durationMs,
        resolveClosed: l,
        closed: p,
        settled: !1
      };
      return h.length < t.maxVisible ? k(f) : g.push(f), { id: f.id, closed: p, dismiss: () => O(f) };
    },
    dismissAll: C,
    destroy: B
  };
}
function X(e) {
  const t = {
    themeId: e.themeId ?? v()?.id ?? "",
    themeOverrides: e.themeOverrides ?? {},
    durationMs: e.durationMs ?? 3600,
    position: e.position ?? "top-center",
    maxVisible: e.maxVisible ?? 3,
    zIndex: e.zIndex ?? 2147483646
  };
  if (!Number.isFinite(t.durationMs) || t.durationMs <= 0)
    throw new RangeError("durationMs must be greater than 0");
  if (!Number.isInteger(t.maxVisible) || t.maxVisible <= 0)
    throw new RangeError("maxVisible must be a positive integer");
  if (!Number.isInteger(t.zIndex) || t.zIndex < 0)
    throw new RangeError("zIndex must be a non-negative integer");
  if (!v(t.themeId)) throw new TypeError(`Unknown theme: ${t.themeId}`);
  return t;
}
function ee(e, t) {
  if (typeof e.message != "string" || e.message.trim() === "")
    throw new TypeError("message must be a non-empty string");
  const n = e.durationMs ?? t.durationMs;
  if (!Number.isFinite(n) || n <= 0) throw new RangeError("durationMs must be greater than 0");
  return e.message.trim();
}
function N(e) {
  return `${K[e.tone ?? "info"]}: ${e.message}${e.detail ? `. ${e.detail}` : ""}`;
}
function te(e) {
  return `:host{all:initial}${e}.toast{opacity:0;animation:st-toast-life var(--toast-duration) ease-in-out both;max-width:min(440px,calc(100vw - 34px));}.stack{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;gap:8px;padding:68px 17px;box-sizing:border-box;pointer-events:none}.stack[data-position^="bottom"]{justify-content:flex-end;padding-bottom:24px}.stack[data-position$="left"]{align-items:flex-start}.stack[data-position$="right"]{align-items:flex-end}.live{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}@keyframes st-toast-life{0%,100%{opacity:0}8%,82%{opacity:1}}@media(prefers-reduced-motion:reduce){.toast{animation:none;opacity:1}}`;
}
const j = "st_toast_notification", V = 2, ne = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right"
], w = {
  themeId: E.defaultThemeId,
  behavior: {
    durationMs: 3600,
    position: "top-center",
    maxVisible: 3
  }
};
function oe(e) {
  const t = S(e[j]), n = t?.version === V ? ae(t) : se(t);
  return e[j] = n, n;
}
function ae(e) {
  const t = A(e.themeId) ?? w.themeId, n = R(S(e.behavior));
  return {
    version: V,
    themeId: t,
    behavior: n,
    themeOverrides: ie(e.themeOverrides)
  };
}
function se(e) {
  const t = A(e?.themeId ?? e?.preset) ?? w.themeId, n = v(t) ?? v(), o = {};
  if (n) {
    const i = {};
    for (const [s, m] of Object.entries(n.tokens)) {
      const d = [s, ...m.legacyKeys ?? []].find((h) => Object.hasOwn(e ?? {}, h));
      d && e && (i[s] = e[d]);
    }
    const r = F(n.id, i);
    Object.keys(r).length > 0 && (o[n.id] = r);
  }
  return {
    version: V,
    themeId: n?.id ?? w.themeId,
    behavior: R(e),
    themeOverrides: o
  };
}
function R(e) {
  const t = P(e?.durationMs, w.behavior.durationMs), n = P(e?.maxVisible, w.behavior.maxVisible);
  return {
    durationMs: Number.isFinite(t) && t > 0 ? t : w.behavior.durationMs,
    position: ne.includes(e?.position) ? e?.position : w.behavior.position,
    maxVisible: Number.isInteger(n) && n > 0 ? n : w.behavior.maxVisible
  };
}
function ie(e) {
  const t = {}, n = S(e);
  if (!n) return t;
  for (const [o, i] of Object.entries(n)) {
    const r = S(i);
    A(o) && r && (t[o] = F(o, r));
  }
  return t;
}
function F(e, t) {
  const n = v(e);
  if (!n) return {};
  const o = {};
  for (const [i, r] of Object.entries(t))
    if (n.tokens[i])
      try {
        q(n, { [i]: r }), o[i] = r;
      } catch {
      }
  return o;
}
function A(e) {
  return typeof e == "string" && v(e) ? v(e)?.id : void 0;
}
function P(e, t) {
  return typeof e == "number" ? e : t;
}
function S(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e) ? e : void 0;
}
function re(e, t = document.querySelector("#extensions_settings2")) {
  if (!t) throw new Error("SillyTavern extension settings panel was not found");
  const n = oe(e.extensionSettings), o = le(n);
  t.append(o);
  let i, r;
  const s = () => {
    i?.destroy(), r?.(), i = Q({
      themeId: n.themeId,
      themeOverrides: n.themeOverrides[n.themeId] ?? {},
      ...n.behavior
    }), r = _(i);
  };
  s();
  const m = (g) => {
    const u = g.target;
    if (!(u instanceof HTMLInputElement || u instanceof HTMLSelectElement)) return;
    const y = u.name;
    if (y === "themeId")
      n.themeId = u.value, z(o, n);
    else if (ue(n.themeId, y)) {
      const k = me(u);
      n.themeOverrides[n.themeId] ??= {}, n.themeOverrides[n.themeId][y] = k, H(o, y, u.value);
    } else if (y in n.behavior) {
      const k = u.type === "range" || u.type === "number" ? Number(u.value) : u.value;
      Object.assign(n.behavior, { [y]: k }), H(o, y, u.value);
    } else
      return;
    e.saveSettingsDebounced(), s();
  }, c = () => {
    i?.show({
      message: "Memory recalled",
      detail: "This moment will be remembered.",
      tone: "info"
    });
  }, d = () => {
    delete n.themeOverrides[n.themeId], z(o, n), e.saveSettingsDebounced(), s();
  }, h = (g) => {
    const u = g.target;
    u instanceof HTMLButtonElement && (u.matches('[data-action="preview"]') && c(), u.matches('[data-action="reset"]') && d());
  };
  return o.addEventListener("input", m), o.addEventListener("change", m), o.addEventListener("click", h), () => {
    o.removeEventListener("input", m), o.removeEventListener("change", m), o.removeEventListener("click", h), r?.(), i?.destroy(), o.remove();
  };
}
function le(e) {
  const t = document.createElement("section");
  return t.dataset.stToastSettings = "", t.className = "st-toast-settings", t.innerHTML = '<div class="inline-drawer"><div class="inline-drawer-toggle inline-drawer-header"><b>Toast Notifications</b><div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div></div><div class="inline-drawer-content"><div class="st-toast-settings-content" data-settings-content></div></div></div>', z(t, e), t;
}
function z(e, t) {
  const n = e.querySelector("[data-settings-content]");
  if (!n) return;
  const o = v(t.themeId) ?? v(), i = W().map(({ id: c, name: d }) => `<option value="${I(c)}">${$(d)}</option>`).join(""), r = o ? Object.entries(o.tokens).map(([c, d]) => ce(c, d, t)).join("") : "";
  n.innerHTML = `<label>Theme<select name="themeId">${i}</select></label><div class="st-toast-color-grid">${r}</div>${de(t)}<div class="st-toast-actions"><button type="button" class="menu_button" data-action="preview">Preview</button><button type="button" class="menu_button" data-action="reset">Reset theme</button></div>`;
  const s = n.querySelector('[name="themeId"]');
  s && (s.value = t.themeId);
  const m = n.querySelector('[name="position"]');
  if (m && (m.value = t.behavior.position), o)
    for (const [c, d] of Object.entries(o.tokens)) {
      if (d.type !== "select") continue;
      const h = n.querySelector(`[name="${c}"]`), g = t.themeOverrides[t.themeId]?.[c] ?? d.default;
      h && (h.value = String(g));
    }
}
function ce(e, t, n) {
  const o = n.themeOverrides[n.themeId]?.[e] ?? t.default, i = I(e), r = $(t.label);
  if (t.type === "color") {
    const c = t.used === !1;
    return `<label class="${c ? "st-toast-token-unused" : ""}"><span>${r}${c ? '<small class="st-toast-token-status">Unused by this theme</small>' : ""}</span><input type="color" name="${i}" value="${I(String(o))}" ${c ? 'disabled aria-disabled="true"' : ""}></label>`;
  }
  if (t.type === "boolean")
    return `<label>${r}<input type="checkbox" name="${i}" ${o ? "checked" : ""}></label>`;
  if (t.type === "select") {
    const c = t.options.map((d) => `<option value="${I(d.value)}">${$(d.label)}</option>`).join("");
    return `<label>${r}<select name="${i}">${c}</select></label>`;
  }
  const s = t.type === "range" ? "range" : "number", m = t.unit ? ` (${$(t.unit)})` : "";
  return `<label>${r}${m}<input type="${s}" name="${i}" min="${t.min}" max="${t.max}" step="${t.step}" value="${o}"><output data-output="${i}">${o}</output></label>`;
}
function de(e) {
  const { durationMs: t, maxVisible: n, position: o } = e.behavior;
  return `<label>Duration (ms)<input type="range" name="durationMs" min="1000" max="10000" step="100" value="${t}"><output data-output="durationMs">${t}</output></label><label>Maximum visible<input type="range" name="maxVisible" min="1" max="6" step="1" value="${n}"><output data-output="maxVisible">${n}</output></label><label>Position<select name="position"><option value="top-left">Top left</option><option value="top-center">Top center</option><option value="top-right">Top right</option><option value="bottom-left">Bottom left</option><option value="bottom-center">Bottom center</option><option value="bottom-right">Bottom right</option></select></label>`;
}
function ue(e, t) {
  return !!v(e)?.tokens[t];
}
function me(e) {
  return e instanceof HTMLInputElement && e.type === "checkbox" ? e.checked : e instanceof HTMLInputElement && (e.type === "range" || e.type === "number") ? Number(e.value) : e.value;
}
function H(e, t, n) {
  const o = e.querySelector(`[data-output="${t}"]`);
  o && (o.value = n);
}
function $(e) {
  return e.replace(/[&<>'"]/g, (t) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[t] ?? t);
}
function I(e) {
  return $(e);
}
let M;
function pe() {
  M?.(), M = re(SillyTavern.getContext());
}
function fe() {
  M?.(), M = void 0;
}
export {
  pe as onActivate,
  fe as onDisable
};
