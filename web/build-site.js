/* ==========================================================================
   web/build-site.js — assemble the public site in `site/`.

   The published site is not the working tree. It is the cover page and its
   two scripts from `web/`, the mark, the artifact rebuilt from `build/src`,
   and the three printed documents. The PDFs are tracked deliverables in
   `dist/`, so they are copied rather than rebuilt: printing them needs a
   browser the host does not have. The instructor solutions are never copied.

   The layout follows web/build-site.js in signals-and-systems, including its
   removal of the instructor edition from the published artifact.

   Removed, not hidden. In the artifact the instructor material is separated
   from the student material by CSS alone — `body[data-edition=instructor]`
   reveals it — so anything that reaches the file reaches the reader who
   presses `I`. What this script strips from the published copy is:

     · the `src` field of every scene, laboratory item and question, which
       names the source page or the paper question it came from;
     · the `teach` field of every question, which is the teaching note;
     · the edition control itself — the toolbar button, the `I` shortcut,
       and the saved-state path that could restore it.

   This course carries no `{t:'instr'}` content blocks and no help-scene
   "two editions" card: unlike signals-and-systems, its instructor material
   is confined to the `src`/`teach` fields above and the per-question
   teaching-note panel, so those are the only transforms this script needs.

   Nothing in `build/src` is modified and nothing in `dist/` is overwritten.
   The transforms run over the built artifact in memory, one script module at
   a time, so `30_katex.js` and `60_plot.js` are never touched. Every one of
   them asserts its own hit count: a transform that stops matching stops the
   build instead of quietly publishing the material it was meant to remove.

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

/* ------------------------------------------------- 2. scanning primitives */

/* Walks JavaScript from `i`, skipping over string literals, template
   literals and comments, and returns the index just past the construct that
   starts there. Everything below needs this: a scene carries TeX in single
   quotes, and TeX is full of braces and apostrophes that must not be read as
   code. */
function skipAt(s, i) {
  const c = s[i];
  if (c === "'" || c === '"' || c === '`') {
    for (let k = i + 1; k < s.length; k++) {
      if (s[k] === '\\') { k++; continue; }
      if (s[k] === c) return k + 1;
    }
    fail('unterminated string literal at ' + i);
  }
  if (c === '/' && s[i + 1] === '/') {
    const nl = s.indexOf('\n', i);
    return nl === -1 ? s.length : nl + 1;
  }
  if (c === '/' && s[i + 1] === '*') {
    const end = s.indexOf('*/', i + 2);
    return end === -1 ? s.length : end + 2;
  }
  return i + 1;
}

/* The end of the string literal that starts at `i` (which must be a quote). */
function endOfString(s, i) { return skipAt(s, i); }

/* Eat a trailing comma and the whitespace around it, so removing a field
   leaves valid JavaScript behind. */
function eatComma(s, end) {
  let k = end;
  while (k < s.length && /\s/.test(s[k])) k++;
  return s[k] === ',' ? k + 1 : end;
}

/* ------------------------------------------------------ 3. the transforms */

/* Remove `name:'...'` wherever it appears as an object field. */
function stripField(code, name) {
  const re = new RegExp('(^|[{,\\s])' + name + ':\\s*', 'g');
  let out = '', last = 0, hits = 0, m;
  while ((m = re.exec(code)) !== null) {
    const lead = m[1];
    const fieldStart = m.index + lead.length;
    const valStart = m.index + m[0].length;
    /* A scene factory may pass the field through, as `src:cfg.src`; the
       literal at its call site is stripped, so the pass-through goes too. */
    const pass = new RegExp('^[A-Za-z_$][\\w$]*\\.' + name + '(?![\\w$])').exec(code.slice(valStart));
    if (!pass && code[valStart] !== "'") fail(name + ' field is not a plain string literal at ' + valStart);
    const end = eatComma(code, pass ? valStart + pass[0].length : endOfString(code, valStart));
    out += code.slice(last, fieldStart);
    last = end;
    hits++;
    re.lastIndex = end;
  }
  out += code.slice(last);
  return { code: out, hits };
}

/* A replacement that must happen exactly `n` times or the build stops. */
function replaceExactly(text, find, into, n, what) {
  const parts = text.split(find);
  if (parts.length - 1 !== n)
    fail(what + ': expected ' + n + ' occurrence(s), found ' + (parts.length - 1));
  return parts.join(into);
}

/* ------------------------------------- 4. sanitise the artifact in memory */

log('Removing the instructor edition from the published artifact');

let art = fs.readFileSync(path.join(DIST, 'Quantum_Computing.html'), 'utf8');

/* `build/build.js` labels every script module it concatenates, so the module
   boundaries survive into the built file. The content transforms are applied
   to the modules that carry authored content and to nothing else — KaTeX and
   the plotting library are left exactly as built. */
const MODULE_RE = /(<script>\n\/\* ==== )([0-9A-Za-z_.]+\.js)( ==== \*\/\n)([\s\S]*?)(\n<\/script>)/g;
const CONTENT_MODULE = /^(7|8|9)[0-9]_/;

let srcFields = 0, teachFields = 0, seen = 0;

art = art.replace(MODULE_RE, (whole, open, name, mid, body, close) => {
  if (!CONTENT_MODULE.test(name)) return whole;
  seen++;
  let r = stripField(body, 'src');   srcFields   += r.hits;  body = r.code;
  r = stripField(body, 'teach');     teachFields += r.hits;  body = r.code;
  return open + name + mid + body + close;
});

if (seen < 20) fail('found only ' + seen + ' content modules in the built artifact');
if (srcFields < 200) fail('found only ' + srcFields + ' src fields');
if (teachFields < 50) fail('found only ' + teachFields + ' teaching notes');

/* The edition control. Removing the data is what matters; removing the
   control is what stops a reader from looking for it. */
art = replaceExactly(art,
  `      <button id="btn-edition" data-act="edition" title="Student / instructor (I)">Student</button>\n`,
  '', 1, 'toolbar edition button');

art = replaceExactly(art,
  `        case 'i': case 'I': toggleEdition(); break;\n`,
  '', 1, 'I keyboard shortcut');

/* A reader whose device already holds `edition:'instructor'` from an earlier
   visit would otherwise come back into a mode that no longer has content. */
art = replaceExactly(art,
  `      edition: saved.edition || 'student',`,
  `      edition: 'student',`,
  1, 'saved edition restore');

/* The `src` reference shown beside the pager in instructor mode, and the
   toolbar button's own label logic, now read a mode nothing can enter — left
   in place, since with the button gone and `S.edition` pinned to 'student'
   they are dead branches that never draw a character on the page. */

/* With the button, the shortcut and the saved state gone, the toggle can
   still be reached from a console. It is emptied so the mode cannot be
   entered at all, rather than entered and found empty. */
art = replaceExactly(art,
  `  function toggleEdition(){ state.edition = state.edition==='student'?'instructor':'student'; applyBodyFlags(); persist(); onRender(); }`,
  `  function toggleEdition(){ /* the published copy has one edition */ }`,
  1, 'edition toggle');

/* Belt and braces: this course's scene content carries no `{t:'instr'}`
   block, but the generic block renderer is registered all the same, shared
   machinery from the engine. Emptied here so a block that some later edit
   introduces still cannot reach the page. */
art = replaceExactly(art,
  `    instr:   b => \`<div class="instr"><div class="instr-panel">
        <span class="note-h">\${md(b.head||'Instructor note')}</span>\${symLinks(md(b.html))}</div></div>\`,`,
  `    instr:   () => '',`,
  1, 'instructor block renderer');

/* The teaching note behind each question is gone with its `teach` field, so
   the branch that would have drawn it is emptied too — otherwise the words
   survive in the renderer and turn up in a source search. */
art = replaceExactly(art,
  '${q.teach?`<div class="instr"><div class="instr-panel"><span class="note-h">Teaching note</span>${md(q.teach)}</div></div>`:\'\'}',
  '', 1, 'question teaching-note renderer');

/* The "How to Use This Course" help scene named the edition among its four
   ways to read the artifact. On the published copy there is one edition, so
   the card says what is actually true of it. */
art = replaceExactly(art,
  `      {t:'small', html:'<b>Normal</b>, <b>lecture</b>, <b>self-study</b>, and <b>student</b> or <b>instructor</b>. The controls are along the top, and the choice is remembered.'}`,
  `      {t:'small', html:'<b>Normal</b>, <b>lecture</b>, and <b>self-study</b>. The controls are along the top, and the choice is remembered.'}`,
  1, 'help scene reading-modes card');

/* The help overlay's shortcut list named the same removed toggle. */
art = replaceExactly(art,
  `['L','Lecture ⇄ self-study'],['I','Student ⇄ instructor edition'],['R','Reduced motion'],`,
  `['L','Lecture ⇄ self-study'],['R','Reduced motion'],`,
  1, 'help-screen shortcut line');

/* Nothing that names the removed edition may survive as something a reader
   can see. What is left after the transforms above is code and comments —
   a default-state field and its comment, a state comment, a CSS rule and a
   stylesheet comment, an emptied toggle, and dead `S.edition==='instructor'`
   checks that now always read false — none of which puts a character on the
   page. Each is listed here by its own signature rather than waved through
   by keyword, so a new occurrence anywhere else stops the build. */
const RESIDUE = [
  /kept for the instructor edition \*\//,              /* stylesheet comment      */
  /instructor-only material/,                          /* stylesheet section head */
  /body\[data-edition=instructor\]/,                    /* rules that select nothing */
  /'student' \| 'instructor'/,                          /* state field comments    */
  /the published copy has one edition/,                 /* the emptied toggle      */
  /S\.edition==='instructor'/,                           /* checks that stay false  */
  /HANDOFF = \[.*btn-edition.*\]/                        /* dead chrome-handoff id  */
];
const leaks = [];
const lower = art.toLowerCase();
for (const word of ['instructor', 'teaching note']) {
  let from = 0, i;
  while ((i = lower.indexOf(word, from)) !== -1) {
    const around = art.slice(Math.max(0, i - 70), i + 70).replace(/\s+/g, ' ');
    if (!RESIDUE.some(r => r.test(around))) leaks.push(around);
    from = i + word.length;
  }
}
if (leaks.length) {
  console.error(leaks.slice(0, 5).join('\n---\n'));
  fail(leaks.length + ' reference(s) to the instructor edition survived');
}

log('  · ' + srcFields + ' source references, ' + teachFields
    + ' teaching notes removed from ' + seen + ' content modules');

/* --------------------------------------------------------- 5. assemble it */

fs.rmSync(SITE, { recursive: true, force: true });
fs.mkdirSync(SITE, { recursive: true });

const copy = (from, to) => {
  if (!fs.existsSync(from)) fail('missing ' + path.relative(ROOT, from));
  fs.mkdirSync(path.dirname(path.join(SITE, to)), { recursive: true });
  fs.copyFileSync(from, path.join(SITE, to));
  log('  · ' + to + '  ' + (fs.statSync(from).size / 1048576).toFixed(2) + ' MB');
};

log('Assembling site/');
fs.writeFileSync(path.join(SITE, 'Quantum_Computing.html'), art);
log('  · Quantum_Computing.html  ' + (art.length / 1048576).toFixed(2) + ' MB  (sanitised)');
for (const f of ['Lecture_Notes.pdf', 'Student_Workbook.pdf', 'Formula_Reference.pdf'])
  copy(path.join(DIST, f), f);

/* The cover page, its backdrop, Figure 1, and the cover and inside page of
   each PDF, rendered from the PDFs themselves. */
for (const f of ['index.html', 'backdrop.js', 'fig.js'])
  copy(path.join(__dirname, f), f);
copy(path.join(ROOT, 'assets', 'icon.svg'), 'icon.svg');
for (const f of fs.readdirSync(path.join(__dirname, 'img')).filter(f => f.endsWith('.jpg')))
  copy(path.join(__dirname, 'img', f), path.join('img', f));

/* The Python runtime for the code pages' Run button, fetched and checked
   against pinned hashes by web/pyodide.js. */
execFileSync(process.execPath, [path.join(__dirname, 'pyodide.js'), path.join(SITE, 'pyodide')],
  { stdio: ['ignore', 'inherit', 'inherit'] });

/* ------------------------------------------------------------ 6. last look */

const published = fs.readdirSync(SITE, { recursive: true })
  .filter(f => !f.startsWith('pyodide') && fs.statSync(path.join(SITE, f)).isFile()).sort();
const forbidden = published.filter(f => /instructor/i.test(f));
if (forbidden.length) fail('instructor material reached the site: ' + forbidden.join(', '));

log('site/ holds ' + published.length + ' files: ' + published.join(', '));
