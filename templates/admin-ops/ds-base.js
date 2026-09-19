// Loads this design system into the template. In a consuming project, point
// `base` at the bound DS folder relative to this file — one line to edit.
(() => {
  const base = '../..';

  // ── Cache coherence ───────────────────────────────────────────────────────
  // _ds_bundle.js and tailwind/agniui.css are ONE UNIT: a utility class name
  // emitted by the bundle is meaningless without its rule in the CSS. If the
  // browser serves a cached bundle against fresh CSS (or vice versa), elements
  // whose classes have no matching rule collapse to content height with NO
  // error — a 38px button silently became 21px exactly this way.
  //
  // Both files therefore share one cache-bust token. Date.now() guarantees they
  // are always fetched as a pair; a production build should swap this for the
  // build hash so the pair stays cacheable but never mismatched.
  const V = Date.now();
  const bust = (p) => base + '/' + p + '?v=' + V;

  // Token CSS + base styles (styles.css @imports the whole token closure).
  // agniui.css MUST follow styles.css: it carries the compiled Tailwind
  // utilities that migrated components (core/Button onward) render with.
  for (const p of ["styles.css", "tailwind/agniui.css"]) {
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = bust(p);
    document.head.appendChild(l);
  }

  // Load the DS bundle SYNCHRONOUSLY via document.write so window.<Namespace>
  // is fully populated before admin.app.jsx is evaluated by <x-import>.
  document.write('<script src="' + bust('_ds_bundle.js') + '"><\/script>');

  // ── Drift alarm ───────────────────────────────────────────────────────────
  // Make the silent failure loud. Probes a utility the current components
  // depend on; if agniui.css is stale or missing the rule resolves to nothing.
  //
  // The probe must NOT assert a literal pixel value. Tranche 2 moved the whole
  // control family off literal heights onto h-control-*, so nothing emits
  // h-[38px] any more — and h-control legitimately computes 33.25px at
  // data-scale="sm", which is what this scaffold runs at. Assert instead that
  // h-control resolves to the same height as --density-control-h: true at every
  // density and scale, false the moment the rule is missing.
  window.addEventListener('load', () => {
    const probe = document.createElement('div');
    probe.className = 'h-control';
    probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none';
    document.body.appendChild(probe);
    const ruler = document.createElement('div');
    ruler.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;height:var(--density-control-h)';
    document.body.appendChild(ruler);
    const got = getComputedStyle(probe).height;
    const want = getComputedStyle(ruler).height;
    probe.remove(); ruler.remove();
    const ok = parseFloat(got) > 0 && got === want;
    if (!ok) {
      console.error(
        '[AgniUI] tailwind/agniui.css is stale, missing, or out of step with ' +
        '_ds_bundle.js (h-control resolved to ' + got + ', expected ' + want + '). ' +
        'Components will render with collapsed sizing. ' +
        'Regenerate it: add the component to MIGRATED[] in tailwind/build.html, ' +
        'open that page, and copy window.__AGNIUI_CSS into tailwind/agniui.css.'
      );
    }
    // Catch the specific symptom too: a DS control that collapsed to text height.
    const collapsed = [...document.querySelectorAll('button[class*="bg-"]')]
      .filter((b) => b.offsetHeight > 0 && b.offsetHeight < 24);
    if (collapsed.length) {
      console.error(
        '[AgniUI] ' + collapsed.length + ' control(s) collapsed below 24px — a ' +
        'utility class with no matching rule in agniui.css. First:',
        collapsed[0].className
      );
    }
  });
})();
