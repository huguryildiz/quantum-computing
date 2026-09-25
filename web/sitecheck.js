/* ==========================================================================
   web/sitecheck.js — what the published site actually renders.

   `build-site.js` assembles `site/`. This opens it in a browser and checks the
   pages it produces: the artifact loads and every scene draws without an
   error, the row of facts on the cover agrees with what the artifact holds,
   every link on the cover reaches a file, every document image loads, and
   Figure 1 and the backdrop run without an error.

   Run it the way the other Playwright gates are run:
       node web/build-site.js && cd build && node pw.js ../web/sitecheck.js
   ========================================================================== */

const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');
const path = require('path');
const fs = require('fs');

const SITE = path.join(__dirname, '..', 'site');
/* The cover links to clean addresses (/notes, not a file name), and
   vercel.json is what maps them onto files; resolve them the same way. */
const REWRITE = Object.fromEntries(
  JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'vercel.json'), 'utf8')).rewrites
    .map(r => [r.source, r.destination]));
const url = f => 'file://' + path.join(SITE, f);
const problems = [];
const note = m => console.log('  ' + m);

(async () => {
  const browser = await chromium.launch();
  let facts = {};

  /* ---------------------------------------------------- the artifact ---- */
  {
    const page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(url('Quantum_Computing.html'));
    await page.waitForTimeout(1200);

    const scenes = await page.evaluate(() => APP.scenes().map(s => ({ id: s.id, steps: s.steps || 0 })));
    facts = await page.evaluate(() => ({
      modules: CONTENT.MODULES.length,
      scenes: APP.scenes().length,
      labs: APP.scenes().filter(s => /-lab-[a-z][0-9]?$/.test(s.id)).length,
      questions: CONTENT.DRILL.length
    }));
    note('artifact loaded · ' + scenes.length + ' scenes');
    let katex = 0;
    for (const s of scenes) {
      await page.evaluate(([id, st]) => { APP.goId(id, st); }, [s.id, s.steps]);
      await page.waitForTimeout(6);
      katex += await page.evaluate(() => document.getElementById('scene-host').querySelectorAll('.katex-error').length);
    }
    if (katex) problems.push(katex + ' KaTeX errors in the artifact');
    if (errors.length) problems.push('artifact console: ' + errors.slice(0, 3).join(' | '));
    await page.close();
  }

  /* ------------------------------------------------------- the cover ---- */
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(url('index.html'), { waitUntil: 'load' });
    await page.waitForTimeout(600);

    /* Figure 1 at each step of the story */
    for (const f of [0.1, 0.5, 0.95]) {
      await page.evaluate(f => { const t = document.getElementById('track');
        window.scrollTo(0, t.offsetTop + f * (t.offsetHeight - innerHeight)); }, f);
      await page.waitForTimeout(250);
    }
    const cover = await page.evaluate(() => ({
      facts: Object.fromEntries([...document.querySelectorAll('[data-fact]')].map(e => [e.dataset.fact, +e.textContent])),
      links: [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')),
      images: [...document.querySelectorAll('img')].map(i => [i.getAttribute('src'), i.complete && i.naturalWidth > 0]),
      wide: document.documentElement.scrollWidth > innerWidth + 1,
      backdrop: !!document.getElementById('backdrop').getContext('webgl')
    }));
    if (w === 1440) {
      for (const k of Object.keys(facts))
        if (cover.facts[k] !== facts[k]) problems.push(`cover says ${cover.facts[k]} ${k}, the artifact holds ${facts[k]}`);
      for (const h of cover.links) {
        if (/^(https?:|#)/.test(h)) continue;
        const f = REWRITE[h] || h;
        if (!fs.existsSync(path.join(SITE, f))) problems.push('cover link does not resolve: ' + h);
      }
      note('cover facts ' + JSON.stringify(cover.facts));
    }
    /* lazy images load once scrolled to */
    await page.evaluate(() => document.getElementById('documents').scrollIntoView());
    await page.waitForTimeout(500);
    const broken = await page.evaluate(() => [...document.querySelectorAll('img')]
      .filter(i => !(i.complete && i.naturalWidth > 0)).map(i => i.getAttribute('src')));
    if (broken.length) problems.push(`at ${w}px, images that did not load: ${broken.join(', ')}`);
    if (cover.wide) problems.push(`at ${w}px the cover scrolls sideways`);
    if (errors.length) problems.push(`cover console at ${w}px: ${errors.slice(0, 3).join(' | ')}`);
    note(`cover at ${w}px · ${cover.images.length} images · webgl ${cover.backdrop}`);
    await page.close();
  }

  await browser.close();
  if (problems.length) { console.log('\nSITE PROBLEMS: ' + problems.length); problems.forEach(p => console.log('  - ' + p)); process.exit(1); }
  console.log('\nSITE: no problems');
})();
