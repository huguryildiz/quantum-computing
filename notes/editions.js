/* Builds the three document editions that sit beside the lecture notes.

   All three are generated from the content the artifact already carries — the
   exam drills, the glossary and the conventions manifest — so a question id
   means the same thing in every edition, and nothing here is a second copy of
   anything that would have to be kept in step by hand.

     Student_Workbook.html    every question, no answers and no solutions
     Instructor_Solutions.html every question with its full solution, plus provenance
     Formula_Reference.html   the conventions, the summary of formulas, the glossary
     PDF_VERSIONS.md          the version history of the PDFs, as a table

   The renderer, the stylesheet and the KaTeX build are the ones the lecture notes
   use, so the four documents are one typographic family.

     cd notes && node editions.js     ->  ../dist/*.html
     cd build && node pw.js ../notes/topdf.js   renders every one of them to PDF   */
const fs = require('fs'), path = require('path');
const S = p => fs.readFileSync(path.join(__dirname, p), 'utf8');
const B = path.join(__dirname, '..', 'build', 'src');
const R = p => fs.readFileSync(path.join(B, p), 'utf8');
const g = s => s.replace(/<\/script>/gi, '<\\/script>');

/* the exam drills and the glossary, loaded the way the artifact loads them */
const DRILL_FILES = fs.readdirSync(B).filter(f => /^9[2-8]_drill_m\d\.js$/.test(f)).sort();

/* The mark is `assets/icon.svg` and nothing else. It is read here, given
   the class the stylesheet sizes it by, and handed to `render.js` as a global,
   so the artifact, the lecture notes and the three editions all draw the same
   file. */
const MARK = JSON.stringify(
  fs.readFileSync(path.join(__dirname, '..', 'assets', 'icon.svg'), 'utf8').trim()
    .replace(/^<svg /, '<svg class="eelogo" aria-hidden="true" focusable="false" ')
    .replace(/\swidth="\d+"\sheight="\d+"/, ''));

const doc = (title, builder, extra = '') => `<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8">
<meta name="author" content="Hüseyin Uğur Yıldız"><meta name="license" content="CC BY 4.0">
<title>${title}</title>
<style>${R('20_katex.css')}</style>
<style>${S('src/notes.css')}</style>
<style>
.qcard{ break-inside:avoid; margin:0 0 13pt; }
.qcard .qh{ font-family:var(--mono); font-size:8.2pt; letter-spacing:.16em; text-transform:uppercase;
  color:var(--slate); margin-bottom:3pt; }
/* The frame must not rewrite the mathematics a type name carries: uppercase
   would turn a_k into A_K and the tracking would pull an expression apart
   glyph by glyph. Both are reset inside the typeset subtree. */
.qcard .qh .katex{ text-transform:none; letter-spacing:normal; font-size:1.05em; }
.qcard .opts{ margin:5pt 0 0 0; padding:0; list-style:none; }
.qcard .opts li{ margin:2.5pt 0 2.5pt 14pt; text-indent:-14pt; }
.qcard .opts li b{ font-family:var(--mono); font-size:8.6pt; color:var(--slate); }
.qcard .key{ border-left:2px solid var(--accent); padding-left:8pt; margin-top:6pt; }
.qcard .why{ margin-top:4pt; }
.workspace{ border:1px dashed var(--rule2); height:58pt; margin-top:6pt; border-radius:2px; }
/* The worked solution as information cards, the print form of the artifact's
   slide card: a tinted panel with a coloured left edge and a filled tab. */
.qcard.sol{ break-inside:auto; }
.qcard.sol > .qh, .qcard.sol > p, .qcard.sol > .opts{ break-after:avoid; }
.sblk{ --c:var(--slate); margin:8pt 0 0; break-inside:avoid; }
.sblk.ok{ --c:var(--out); } .sblk.warn{ --c:#8A5E12; } .sblk.err{ --c:var(--err); }
.sblk > .tab{ display:inline-block; padding:1.6pt 7pt 1.4pt; background:var(--c); color:#fff;
  border-radius:2px 2px 0 0; font-family:var(--mono); font-size:7.4pt; font-weight:600;
  letter-spacing:.12em; text-transform:uppercase; white-space:nowrap; line-height:1.35; }
.sblk > .tab .katex{ text-transform:none; letter-spacing:normal; }
.scard{ padding:7pt 10pt 6pt; border:0.6pt solid var(--rule2); border-left:2.2pt solid var(--c);
  border-radius:0 2px 2px 2px; background:color-mix(in srgb, var(--c) 4%, #fff); }
.sblk.err .scard{ background:color-mix(in srgb, var(--err) 7%, #fff); }
.scard .nsep{ height:0; border-top:0.6pt solid var(--rule2); margin:5pt 0 4pt; }
.scard .fig, .scard figure{ margin-bottom:0; }
</style></head><body><div id="doc"></div>
<script>${g(R('30_katex.js'))}</script>
<script>${g(R('60_plot.js'))}</script>
<script>window.ICON_SVG=${MARK};</script>
<script>${g(S('src/render.js'))}</script>
<script>${g(R('80_content_core.js'))}</script>
${DRILL_FILES.map(f => `<script>${g(R(f))}</script>`).join('\n')}
${extra}
<script>${builder}</script>
</body></html>`;

const MODULE_TITLE = `const MT = Object.fromEntries(CONTENT.MODULES.map(m=>[m.id,m.title]));`;
/* A question-type name may carry mathematics — `Inverse transform from a
   rational $X(j\\omega)$` is one — so it goes through the same md() the running
   text uses. Interpolated raw it prints the dollar signs and the backslash on
   the page, which is the R8 failure in the one place nobody proofreads. The
   .qh frame is uppercase mono with wide tracking and both are reset on .katex
   below, so the typeset name keeps its own case and spacing. */
const KIND = `const KIND = (m,k)=>{ const t=(CONTENT.DRILLTYPES[m]||[]).find(x=>x.k===k);
  return t ? renderInline(t.name) : k; };`;
const GROUP = `const BY = {};
  CONTENT.DRILL.forEach(q=>{ (BY[q.module] = BY[q.module] || []).push(q); });
  const MODS = CONTENT.MODULES.map(m=>m.id).filter(id=>BY[id]);`;

/* ---------------------------------------------------------------- workbook */
const workbook = `
${MODULE_TITLE}${KIND}${GROUP}
const B = [
{t:'cover', kicker:'Quantum Computing', text:'Quantum Computing', sub:'Student Workbook', foot:CONTENT.DRILL.length + ' questions &middot; Chapters 1&ndash;6'},
 {t:'page'},
 {t:'title', kicker:'Quantum Computing', text:'Student Workbook',
  sub:'Every question in the course, with no answer and no solution. Work each one on the page, then check it against the artifact or against the instructor edition.',
  meta:[['Contains', CONTENT.DRILL.length + ' questions across ' + MODS.length + ' modules'],
        ['Level','Undergraduate'],
        ['Answers','Not printed in this edition']]},
 {t:'toc', items: MODS.map(id=>[id.replace('M',''), MT[id], BY[id].length + ' questions'])},
 {t:'p', text:CONTENT.META.adapted},
 {t:'h3', text:'How to use it'},
 {t:'p', text:'The questions are in the order the course meets them, and each is labelled with what it asks for. Only the statement and its lettered parts are printed; the reasoning stays for you to supply. The question numbers are shared with every other edition, so D5-04 is the same question in the artifact, in this workbook and in the instructor solutions.'},
 {t:'page'}
];
MODS.forEach((id,i)=>{
  B.push({t:'h1', num:'MODULE ' + id.replace('M',''), text: MT[id]});
  B.push({t:'p', lead:true, text:BY[id].length + ' questions on ' + MT[id].toLowerCase() + '. Write your reasoning in the space under each one.'});
  BY[id].forEach(q=>{
    B.push({t:'raw', html:'<div class="qcard"><div class="qh">' + q.id + ' &middot; ' + KIND(id,q.type) + '</div>'});
    B.push({t:'p', text:q.stem});
    if(q.figure) B.push({t:'fig', svg:q.figure});
    B.push({t:'raw', html:'<ul class="opts">' + (q.parts||[]).map((o,k)=>
      '<li><b>' + 'abcde'[k] + ')</b>&nbsp; ' + renderInline(o) + '</li>').join('') + '</ul>'});
    B.push({t:'raw', html:'<div class="workspace"></div></div>'});
  });
  if(i < MODS.length-1) B.push({t:'page'});
});
B.push({t:'colophon', doc:'Student Workbook'});
renderNotes(B, document.getElementById('doc'));`;

/* The worked solution is one string of <b>Head.</b> sections (R7). It is
   printed as cards, as the artifact draws it: Given with Find under a hairline,
   Method, one green card per solved part, Check, and the common error. */
function solParts(sol){
  const parts = [];
  sol.split(/(?:<br>)?<b>(Given|Find|Method|Solution(?: — [^<]*)?|Check|Contrast with discrete time)\.<\/b>\s*/)
    .forEach((s,i,a)=>{ if(i%2) parts.push({head:s, html:a[i+1].replace(/(<br>\s*)+$/,'')}); });
  return parts;
}

/* ------------------------------------------------------ instructor solutions */
const solutions = `
${solParts.toString()}
const card = (kind, head, html) => '<div class="sblk ' + kind + '"><span class="tab">' + renderInline(head) + '</span><div class="scard">' + renderInline(html);
${MODULE_TITLE}${KIND}${GROUP}
const B = [
{t:'cover', kicker:'Quantum Computing', text:'Quantum Computing', sub:'Instructor Solutions', foot:'Instructor edition'},
 {t:'page'},
 {t:'title', kicker:'Quantum Computing', text:'Instructor Solutions',
  sub:'Every question with its worked solution, the error it is built to catch, and a teaching note. Not for distribution to students.',
  meta:[['Contains', CONTENT.DRILL.length + ' questions, fully worked'],
        ['Edition', CONTENT.META.version],
        ['Distribution','Instructor only']]},
 {t:'box', kind:'warn', hd:'Instructor edition', html:'This document prints the worked solution and the source pages behind every question. The student workbook contains the same questions with none of it. Question ids are shared, so a number quoted in class resolves in either document.'},
 {t:'p', text:CONTENT.META.adapted},
 {t:'toc', items: MODS.map(id=>[id.replace('M',''), MT[id], BY[id].length + ' questions'])},
 {t:'page'}
];
MODS.forEach((id,i)=>{
  B.push({t:'h1', num:'MODULE ' + id.replace('M',''), text: MT[id]});
  BY[id].forEach(q=>{
    B.push({t:'raw', html:'<div class="qcard sol"><div class="qh">' + q.id + ' &middot; ' + KIND(id,q.type) +
      (q.src ? ' &middot; ref ' + q.src : '') + '</div>'});
    B.push({t:'p', text:q.stem});
    if(q.figure) B.push({t:'fig', svg:q.figure});
    B.push({t:'raw', html:'<ul class="opts">' + (q.parts||[]).map((o,k)=>
      '<li><b>' + 'abcde'[k] + ')</b>&nbsp; ' + renderInline(o) + '</li>').join('') + '</ul>'});
    const parts = solParts(q.sol||'');
    const lastOk = parts.map(p=>p.head.startsWith('Solution')).lastIndexOf(true);
    B.push({t:'raw', html:card('def','Given', parts.filter(p=>p.head==='Given'||p.head==='Find').map(p=>p.html).join('<div class="nsep"></div>')) + '</div></div>'});
    parts.forEach((p,k)=>{
      if(p.head==='Given'||p.head==='Find') return;
      const kind = p.head.startsWith('Solution') ? 'ok' : p.head==='Contrast with discrete time' ? 'warn' : 'def';
      B.push({t:'raw', html:card(kind, p.head, p.html)});
      if(k===lastOk && q.figSol) B.push({t:'fig', svg:q.figSol});
      B.push({t:'raw', html:'</div></div>'});
    });
    if(q.err) B.push({t:'raw', html:card('err','Common error', q.err) + '</div></div>'});
    if(q.teach) B.push({t:'raw', html:'<div class="why"><b>Teaching note.</b> ' + renderInline(q.teach) + '</div>'});
    B.push({t:'raw', html:'</div>'});
  });
  if(i < MODS.length-1) B.push({t:'page'});
});
B.push({t:'colophon', doc:'Instructor Solutions'});
renderNotes(B, document.getElementById('doc'));`;

/* -------------------------------------------------------- formula reference */
const reference = `
const B = [
{t:'cover', kicker:'Quantum Computing', text:'Quantum Computing', sub:'Formula and Notation Reference', foot:'Conventions &middot; formulas &middot; notation'},
 {t:'page'},
 {t:'title', kicker:'Quantum Computing', text:'Formula and Notation Reference',
  sub:'The conventions used throughout the course, every formula it establishes, and every symbol it defines. Nothing here is derived; the derivations are in the lecture notes.',
  meta:[['Contains','Conventions, formulas, notation'],
        ['Edition', CONTENT.META.version],
        ['Companion','Lecture notes, Chapters 1 to 6']]},
 {t:'h3', text:'How to read it'},
 {t:'p', text:'Part 1 states the four conventions this course fixes and the two expressions everything else is built on. Part 2 is the summary of formulas, in the order the course establishes them. Part 3 defines every symbol. Nothing here is derived: where a result needs an argument, the argument is in the lecture notes chapter named beside it.'},
 {t:'p', text:CONTENT.META.adapted},
 {t:'page'},
 {t:'h1', num:'PART 1', text:'Conventions'},
 {t:'p', lead:true, text:'These hold everywhere in the course, without local variation. The first two are the ones that fail silently. A wrong qubit order does not make a result approximately wrong \u2014 it names a different state, and every number after it is quietly wrong. A phase dropped in the wrong place removes the only mechanism any algorithm here has.'},
 {t:'table', head:['Convention','Statement'], rows:[
   ['Qubit order','A register of $n$ qubits is written $|q_{n-1}\\\\ldots q_1q_0\\\\rangle$, and entry $x$ of its column of amplitudes is the amplitude of $|x\\\\rangle$ with $x$ read as a binary number. Circuit drawings put $q_0$ at the top. Test it before trusting any two-qubit result: prepare $|10\\\\rangle$, apply $X$ to the qubit you mean, and print all four amplitudes.'],
   ['Global and relative phase','$e^{i\\\\gamma}|\\\\psi\\\\rangle$ is the same state as $|\\\\psi\\\\rangle$, and the phase may always be dropped. $\\\\alpha|0\\\\rangle+e^{i\\\\varphi}\\\\beta|1\\\\rangle$ is <b>not</b> the same state as $\\\\alpha|0\\\\rangle+\\\\beta|1\\\\rangle$, and that phase may never be dropped. Interference is entirely a statement about the second kind.'],
   ['The inner product','$\\\\langle u|v\\\\rangle=\\\\sum_k u_k^{*}v_k$: the conjugate sits on the first argument and on nothing else. In NumPy that is <code>np.vdot(u, v)</code> and never <code>np.dot</code>. Matrix products act on a ket from right to left, so the gate written last in a product is the one applied first.'],
   ['Units and logarithms','$\\\\hbar=1$, so a Hamiltonian is measured in angular frequency and evolution is $U(t)=e^{-iHt}$. Where a physical energy is meant, the units are written out. $\\\\log$ without a base means base two, so every entropy and every bit count is in bits.'],
   ['States and operators','$|\\\\psi\\\\rangle$ is a pure state and $\\\\rho$ a density operator, both normalised: $\\\\langle\\\\psi|\\\\psi\\\\rangle=1$ and $\\\\operatorname{Tr}\\\\rho=1$. $A^{\\\\dagger}$ is the conjugate transpose, $I$ the identity, and $X$, $Y$, $Z$ the three Pauli operators, also written $\\\\sigma_x$, $\\\\sigma_y$, $\\\\sigma_z$.'],
   ['Exact against sampled','$p$ is an exact Born probability and $\\\\hat p=K/N$ is an estimate from $N$ shots of the same circuit. The two differ by about $1/(2\\\\sqrt N)$ at worst, so a quoted frequency always carries its shot count.'],
   ['Oracles and cost','$U_f|x\\\\rangle|y\\\\rangle=|x\\\\rangle|y\\\\oplus f(x)\\\\rangle$ is one query. A query count is not a runtime, and a resource claim names five things: the task, the input model, the accuracy, the hardware model, and the classical baseline.']
 ]},
 {t:'eqbox', cap:'The two expressions the whole course rests on',
  tex:['p(n)=\\\\left|\\\\langle n|\\\\psi\\\\rangle\\\\right|^{2}',
       '|\\\\psi(t)\\\\rangle = U(t)\\\\,|\\\\psi(0)\\\\rangle, \\\\qquad U(t)=e^{-iHt}'],
  after:'The first is the Born rule, and it is the only place a state becomes a number an instrument can print. The second is closed-system evolution, and every gate in the course is this expression for some $H$ and some $t$. Measurement and evolution are the two things the postulates license; everything in Part 2 is one of them carrying more structure.'},
 {t:'page'},
 {t:'h1', num:'PART 2', text:'Summary of formulas'}
];
/* Appendix A of the lecture notes is this part, verbatim: one source, not two. */
const APP = CA.slice(CA.findIndex(b=>b.t==='h1' && /APPENDIX/.test(b.num||'')) + 1);
B.push.apply(B, APP.filter(b=>b.t!=='title'));
B.push({t:'page'});
B.push({t:'h1', num:'PART 3', text:'Notation'});
B.push({t:'p', lead:true, text:'Every symbol the course defines, with the chapter that defines it. A symbol is never reused for a second meaning.'});
B.push({t:'table', head:['Symbol','Meaning'], rows: Object.keys(CONTENT.GLOSS).map(k=>{
  const e = CONTENT.GLOSS[k];
  return ['$' + (e.s||'').replace(/\\$/g,'') + '$', e.d||''];
})});
B.push({t:'colophon', doc:'Formula and Notation Reference'});
renderNotes(B, document.getElementById('doc'));`;

const OUT = path.join(__dirname, '..', 'dist');
fs.mkdirSync(OUT, { recursive: true });
const write = (name, html) => {
  fs.writeFileSync(path.join(OUT, name), html);
  console.log(name.padEnd(30), (html.length / 1048576).toFixed(2) + ' MB');
};
write('Student_Workbook.html', doc('Quantum Computing — Student Workbook', workbook));
write('Instructor_Solutions.html', doc('Quantum Computing — Instructor Solutions', solutions));
write('Formula_Reference.html', doc('Quantum Computing — Formula and Notation Reference', reference,
  `<script>${g(S('src/ca.js'))}</script>`));

/* The version history of the PDFs, as a table beside them. The rows are read
   from DOC_HISTORY in render.js, the list each PDF prints on its last page, so
   the two cannot disagree. */
const HIST = require('vm').runInNewContext(
  S('src/render.js').match(/window\.DOC_HISTORY\s*=\s*(\[[\s\S]*?\]);/)[1]);
write('PDF_VERSIONS.md', '# PDF version history\n\n' +
  'Applies to Lecture_Notes.pdf, Student_Workbook.pdf, Instructor_Solutions.pdf and Formula_Reference.pdf. Newest first.\n\n' +
  '| Version | Date | Description |\n| --- | --- | --- |\n' +
  HIST.map(r => '| ' + r.join(' | ') + ' |').join('\n') + '\n');
