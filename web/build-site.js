/* ==========================================================================
   web/build-site.js — assemble the public site in `site/`.

   The published site is not the working tree. It is the cover page and its
   two scripts from `web/`, the mark, the artifact rebuilt from `build/src`,
   and the three printed documents. The PDFs are tracked deliverables in
   `dist/`, so they are copied rather than rebuilt: printing them needs a
   browser the host does not have. The instructor solutions are never copied.

   The layout follows web/build-site.js in signals-and-systems. That script
   also strips the instructor edition out of the published artifact; this one
   does not yet, so the artifact is published exactly as `dist/` holds it,
   which is what the site published before this directory existed.

     node web/build-site.js        ->  site/
   ========================================================================== */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const SITE = path.join(ROOT, 'site');

const log = m => console.log(m);
const fail = m => { throw new Error('build-site: ' + m); };

/* ---------------------------------------------------------------- 1. build */

log('Building the artifact');
execFileSync(process.execPath, ['build.js'], { cwd: path.join(ROOT, 'build'), stdio: ['ignore', 'pipe', 'inherit'] });

/* --------------------------------------------------------- 2. assemble it */

fs.rmSync(SITE, { recursive: true, force: true });
fs.mkdirSync(SITE, { recursive: true });

const copy = (from, to) => {
  if (!fs.existsSync(from)) fail('missing ' + path.relative(ROOT, from));
  fs.mkdirSync(path.dirname(path.join(SITE, to)), { recursive: true });
  fs.copyFileSync(from, path.join(SITE, to));
  log('  · ' + to + '  ' + (fs.statSync(from).size / 1048576).toFixed(2) + ' MB');
};

log('Assembling site/');
copy(path.join(DIST, 'Quantum_Computing.html'), 'Quantum_Computing.html');
for (const f of ['Lecture_Notes.pdf', 'Student_Workbook.pdf', 'Formula_Reference.pdf'])
  copy(path.join(DIST, f), f);

/* The cover page, its backdrop, Figure 1, and the cover and inside page of
   each PDF, rendered from the PDFs themselves. */
for (const f of ['index.html', 'backdrop.js', 'fig.js'])
  copy(path.join(__dirname, f), f);
copy(path.join(ROOT, 'assets', 'icon.svg'), 'icon.svg');
for (const f of fs.readdirSync(path.join(__dirname, 'img')).filter(f => f.endsWith('.jpg')))
  copy(path.join(__dirname, 'img', f), path.join('img', f));

/* ------------------------------------------------------------ 3. last look */

const published = fs.readdirSync(SITE, { recursive: true })
  .filter(f => fs.statSync(path.join(SITE, f)).isFile()).sort();
const forbidden = published.filter(f => /instructor/i.test(f));
if (forbidden.length) fail('instructor material reached the site: ' + forbidden.join(', '));

log('site/ holds ' + published.length + ' files: ' + published.join(', '));
