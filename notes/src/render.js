/* Lecture notes — block renderer */
(function(){
  /* Mathematics that does not parse is reported to the console before it falls
     back, so that a broken formula shows up in the build instead of on the page. */
  const OPT={strict:false,macros:{'\\d':'\\mathrm{d}','\\Ev':'\\mathcal{E}\\mathrm{v}','\\Od':'\\mathcal{O}\\mathrm{d}'}};
  const T=(s,d)=>{ try{ return katex.renderToString(s,Object.assign({displayMode:!!d,throwOnError:true},OPT)); }
      catch(e){ console.error('NOTES: mathematics is not valid TeX: '+s+' — '+e.message);
                try{ return katex.renderToString(s,Object.assign({displayMode:!!d,throwOnError:false},OPT)); }
                catch(e2){ return '<code>'+s+'</code>'; } } };
  /* Mathematics first, then a `code` span. The glossary the editions print
     writes a NumPy call in backticks, and without the second rule they reach the
     printed page as backticks. */
  const md = t => String(t==null?'':t)
      .replace(/\$\$([^$]+)\$\$/g,(m,a)=>T(a,true))
      .replace(/\$([^$]+)\$/g,(m,a)=>T(a,false))
      .replace(/`([^`\n]+)`/g,(m,a)=>'<code>'+a+'</code>');

  /* One version history for every printed document, newest first. It is set as
     a table on the last page of each. Add a row here for each new release. */
  window.DOC_HISTORY = [
    ['v1.0', '31 August 2026', 'First edition.']
  ];

  /* The mark comes from `assets/icon.svg`, injected by whichever builder
     made this page. One drawing, every document. */
  const LOGO = window.ICON_SVG || '';

  /* Cover artwork in page millimetres (210 x 297). A Bloch sphere of the
     course, seen from a little above the equator: five latitudes and six
     meridians, front halves bright and back halves faint, the z axis through
     |0> and |1>, and one state vector (coral) at theta = 58 deg, phi = 35 deg.
     The amber trail is the tip precessing down from near |0> to that state,
     with a dot at every equal step of time, as the old fringe carried stems. */
  const COVER_ART = ()=>{
    const f=v=>v.toFixed(2), f3=v=>v.toFixed(3), D=Math.PI/180;
    const xc=105, yc=171, R=52, el=20*D, ce=Math.cos(el), se=Math.sin(el);
    /* orthographic view: x to the right, z up, y toward the reader, tilted by el */
    const P=(x,y,z)=>[xc+x, yc+y*se-z*ce, y*ce+z*se];
    const onS=(th,ph)=>P(R*Math.sin(th)*Math.cos(ph), R*Math.sin(th)*Math.sin(ph), R*Math.cos(th));
    /* Everything is plain vector with constant-opacity strokes, so PDF viewers
       draw the cover at once (no masks, blur filters or translucent gradients).
       A curve is split where it passes behind the sphere; the glow is a stack
       of wide faint strokes. */
    const runs=pts=>{ const out=[]; let cur=null;
      pts.forEach(q=>{ const fr=q[2]>=0; if(!cur||cur.fr!==fr){ if(cur) cur.p.push(q); cur={fr,p:cur?[cur.p[cur.p.length-1],q]:[q]}; out.push(cur); } else cur.p.push(q); });
      return out; };
    const d=p=>p.map((q,k)=>(k?'L':'M')+f3(q[0])+' '+f3(q[1])).join('');
    const GLOW=[[5,.05],[3.8,.07],[2.8,.09],[1.9,.11],[1.2,.13]];
    const curve=(pts,col,w,oF,oB,glow)=>runs(pts).map(r=>{ const o=r.fr?oF:oB, g=r.fr?glow:0;
      return (g?GLOW.map(([gw,k])=>`<path d="${d(r.p)}" stroke="${col}" stroke-opacity="${f3(g*k)}" stroke-width="${gw}"/>`).join(''):'')+
        `<path d="${d(r.p)}" stroke="${col}" stroke-opacity="${f3(o)}" stroke-width="${w}"${r.fr?'':' stroke-dasharray="1.2 1.4"'}/>`; }).join('');
    const ring=g=>{ const a=[]; for(let k=0;k<=240;k++) a.push(g(2*Math.PI*k/240)); return a; };
    let art='';
    /* the outline is the silhouette, always in front */
    const rim=ring(t=>[xc+R*Math.cos(t), yc+R*Math.sin(t), 1]);
    art+=curve(rim,'#8AD6E0',.5,.95,.95,.55);
    for(const th of [30,60,90,120,150]) art+=curve(ring(ph=>onS(th*D,ph)),'#8AD6E0',th===90?.42:.26,th===90?.8:.5,.16,th===90?.25:0);
    for(const ph of [0,30,60,90,120,150]) art+=curve(ring(t=>onS(t,ph*D)),'#8AD6E0',.24,.42,.14,0);
    /* the z axis, past both poles */
    const z1=P(0,0,1.16*R), z0=P(0,0,-1.16*R), n=P(0,0,R), s_=P(0,0,-R);
    art+=`<path d="M${f(z0[0])} ${f(z0[1])}L${f(z1[0])} ${f(z1[1])}" stroke="#C9D4DE" stroke-opacity=".35" stroke-width=".25" stroke-dasharray="1.6 1.6"/>`;
    art+=`<circle cx="${f(n[0])}" cy="${f(n[1])}" r="1.3" fill="#8AD6E0"/><circle cx="${f(s_[0])}" cy="${f(s_[1])}" r="1.1" fill="#8AD6E0" fill-opacity=".45"/>`;
    /* the precession trail: theta from 6 deg to 58 deg while phi makes three turns */
    const thS=58*D, phS=35*D, trail=[], dots=[];
    for(let k=0;k<=360;k++){ const t=k/360; trail.push(onS(6*D+(thS-6*D)*t, phS-6*Math.PI*(1-t))); }
    for(let k=0;k<=36;k++){ const t=k/36; dots.push([onS(6*D+(thS-6*D)*t, phS-6*Math.PI*(1-t)),t]); }
    art+=curve(trail,'#E0B070',.36,.78,.26,.3);
    art+=dots.map(([q,t])=>`<circle cx="${f(q[0])}" cy="${f(q[1])}" r="${q[2]>=0?.75:.55}" fill="#F2B48A" fill-opacity="${f3((q[2]>=0?.35:.15)+.6*t*(q[2]>=0?1:.4))}"/>`).join('');
    /* the state vector, from the centre to the tip */
    const tip=onS(thS,phS), o=P(0,0,0);
    art+=GLOW.map(([gw,k])=>`<path d="M${f(o[0])} ${f(o[1])}L${f(tip[0])} ${f(tip[1])}" stroke="#E09A6A" stroke-opacity="${f3(.6*k)}" stroke-width="${gw}" stroke-linecap="round"/>`).join('');
    art+=`<path d="M${f(o[0])} ${f(o[1])}L${f(tip[0])} ${f(tip[1])}" stroke="#F2B48A" stroke-width=".7" stroke-linecap="round"/>`;
    art+=`<circle cx="${f(o[0])}" cy="${f(o[1])}" r=".9" fill="#F2B48A"/><circle cx="${f(tip[0])}" cy="${f(tip[1])}" r="3.2" fill="#E09A6A" fill-opacity=".18"/><circle cx="${f(tip[0])}" cy="${f(tip[1])}" r="1.7" fill="#F7D2B6"/>`;
    /* the background grid, fading toward the edges of the page */
    const vw=y=>{ const st=[[0,.25],[148.5,.6],[237.6,1],[297,.2]]; for(let i=1;i<st.length;i++) if(y<=st[i][0]){ const [t0,v0]=st[i-1],[t1,v1]=st[i]; return v0+(v1-v0)*(y-t0)/(t1-t0); } return .2; };
    let grid='';
    for(let x=0;x<=210;x+=7.5) for(let y=0;y<297;y+=15)
      grid+=`<line x1="${x}" y1="${y}" x2="${x}" y2="${Math.min(297,y+15)}" stroke-opacity="${f3(.075*vw(y+7.5))}"/>`;
    for(let y=0;y<=297;y+=7.5) grid+=`<line x1="0" y1="${f(y)}" x2="210" y2="${f(y)}" stroke-opacity="${f3(.075*vw(y))}"/>`;
    return `<svg class="cv-art" viewBox="0 0 210 297" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
<defs>
<radialGradient id="cv-bg" cx="50%" cy="56%" r="75%"><stop offset="0" stop-color="#173C5E"/><stop offset=".55" stop-color="#0F2640"/><stop offset="1" stop-color="#08121E"/></radialGradient>
</defs>
<rect width="210" height="297" fill="url(#cv-bg)"/>
<g stroke="#9FB6CC" stroke-width=".18">${grid}</g>
<g fill="none" stroke-linejoin="round" stroke-linecap="round">
${art}
</g>
</svg>`;
  };

  /* State of one renderNotes call: the open chapter and section, the sections
     of each chapter for the contents, and the numbered figures and tables. */
  let S = null;
  const pg = id => `<span class="pg" data-target="${id}"></span>`;
  /* A list entry is the caption's first sentence: the caption explains the
     figure, the list only names it. The cut is made in the source text and
     never inside $...$, so no formula is split. `short` overrides it. */
  const firstSentence = s => { s=String(s); let m=false;
    for(let i=0;i<s.length;i++){ if(s[i]==='$') m=!m;
      else if(!m && s[i]==='.' && (i===s.length-1 || s[i+1]===' ')) return s.slice(0,i+1); }
    return s; };
  const caption = (it, kind) => {
    if(!S || !S.captions || !S.ch) return {id:'', html:it.cap?`<figcaption>${md(it.cap)}</figcaption>`:''};
    const L = kind==='Figure' ? S.lof : S.lot, n = L.filter(e=>e.ch===S.ch).length + 1,
          num = S.ch+'.'+n, id = (kind==='Figure'?'fig-':'tab-')+S.ch+'-'+n;
    if(!it.cap) console.warn('NOTES: '+kind+' '+num+' has no caption');
    L.push({ch:S.ch, num, id, text: it.short || (it.cap ? firstSentence(it.cap) : S.sec)});
    return {id:` id="${id}"`, html:`<figcaption><span class="fl">${kind} ${num}</span>${it.cap?' '+md(it.cap):''}</figcaption>`};
  };
  /* Callout and worked-example icons: one 24-unit stroke set, drawn in the
     colour of the title they sit in. */
  const ICONS = {
    note: '<circle cx="12" cy="12" r="9.5"/><path d="M12 11v6M12 7.6v.01"/>',
    warn: '<path d="M12 3.6 2.6 20h18.8z"/><path d="M12 10v4.6M12 17.4v.01"/>',
    err:  '<circle cx="12" cy="12" r="9.5"/><path d="m8.6 8.6 6.8 6.8m0-6.8-6.8 6.8"/>',
    ok:   '<circle cx="12" cy="12" r="9.5"/><path d="m7.6 12.4 3 3 5.8-6.2"/>',
    ex:   '<path d="M4 20h4L19.2 8.8l-4-4L4 16z"/><path d="m13.4 6.6 4 4"/>'
  };
  const ico = k => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${ICONS[k]}</svg>`;

  const R = {
    page:   ()=>'</div><div class="page">',
    title:  b=>`<div class="title"><div class="mark">${LOGO}</div><p class="kicker">${md(b.kicker)}</p>
       <h1 class="doc">${md(b.text)}</h1>${b.sub?`<p class="lead">${md(b.sub)}</p>`:''}
       ${b.meta?`<div class="meta">${b.meta.map(([k,v])=>`<div><b>${md(k)}</b>${md(v)}</div>`).join('')}</div>`:''}
       <div class="title-credit">© 2026 <a href="https://huguryildiz.com/">Hüseyin Uğur Yıldız</a> · <a href="https://huguryildiz.com/">huguryildiz.com</a><br>
       Adapted from <a href="https://github.com/AlexKrasnok/quantum-computing-lectures">Quantum Computing Lectures</a> by Aleksandr Krasnok · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></div></div>`,
    /* The front cover is a full-bleed page of its own (named page `cover`, no
       margins, so no running footer). Its artwork is drawn from the functions it
       shows: the interference fringe, its samples, and the other outcome behind it. */
    cover:  b=>`<div class="cover">${COVER_ART()}
       <div class="cv-top"><div class="mark">${LOGO}</div><p class="kicker">${md(b.kicker)}</p></div>
       <div class="cv-title"><h1 class="doc">${md(b.text)}</h1><div class="cv-rule"></div>
       ${b.sub?`<p class="cv-sub">${md(b.sub)}</p>`:''}</div>
       <div class="cv-author"><p class="cv-name">Hüseyin Uğur Yıldız</p>
       <p>IEEE Senior Member</p><p>Associate Professor of Electrical and Electronics Engineering</p>
       <p>TED University, Ankara, Türkiye</p></div>
       <div class="cv-foot">${b.foot?`<div class="cv-ed">${md(b.foot)}</div>`:''}
       <div class="cv-credit">© 2026 <a href="https://huguryildiz.com/">huguryildiz.com</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></div></div></div>`,
    /* Last-page colophon: document name, version, licence. */
    colophon: b=>`<div class="colophon"><div class="mark">${LOGO}</div>
       <p class="cl-doc">Quantum Computing &middot; ${md(b.doc)}</p>
       <table class="cl-hist"><tr><th>Version</th><th>Date</th><th>Changes</th></tr>${
         window.DOC_HISTORY.map(([v,d,c])=>`<tr><td>${md(v)}</td><td>${md(d)}</td><td>${md(c)}</td></tr>`).join('')}</table>
       <p>© 2026 <a href="https://huguryildiz.com/">huguryildiz.com</a> · Adapted from <a href="https://github.com/AlexKrasnok/quantum-computing-lectures">Quantum Computing Lectures</a> by Aleksandr Krasnok · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></p></div>`,
    /* A numbered heading opens a chapter: its key is the last word of `num`
       (CHAPTER 1 -> 1, APPENDIX A -> A), its id is `ch-<key>`, and the figure
       and table counters restart. A numbered h2 gets the id `sec-<num>`. The
       contents rows, the lists and the PDF bookmarks all point at these ids. */
    h1:     b=>{ let num='', id='';
       if(b.num){ const w=String(b.num).trim().split(/\s+/), k=w.pop();
         if(S){ S.ch=k; S.sec=b.text; S.secs[k]=[]; S.chs.push({k,w:w.join(' '),text:b.text}); }
         id=` id="ch-${k}"`; num=`<span class="num"><span class="w">${md(w.join(' '))}</span><span class="k">${md(k)}</span></span>`; }
       return `<h1${b.num?' class="ch"':''}${id}>${num}${md(b.text)}</h1>${b.rule!==false?'<hr class="thick">':''}`; },
    h2:     b=>{ if(S){ S.sec=b.text; if(b.num&&S.ch) S.secs[S.ch].push({num:b.num,text:b.text}); }
       return `<h2${b.num?` id="sec-${b.num}"`:''}>${b.num?`<span class="num">${b.num}</span>`:''}${md(b.text)}</h2>`; },
    h3:     b=>`<h3>${md(b.text)}</h3>`,
    p:      b=>`<p${b.lead?' class="lead"':''}>${md(b.text)}</p>`,
    ul:     b=>`<ul>${b.items.map(i=>`<li>${md(i)}</li>`).join('')}</ul>`,
    ol:     b=>`<ol>${b.items.map(i=>`<li>${md(i)}</li>`).join('')}</ol>`,
    eq:     b=>`<div class="eq ${b.big?'big':''}">${T(b.tex,true)}</div>`,
    eqbox:  b=>`<div class="eqbox">${b.cap?`<div class="cap">${md(b.cap)}</div>`:''}
       ${(Array.isArray(b.tex)?b.tex:[b.tex]).map(t=>`<div class="eq ${b.big?'big':''}">${T(t,true)}</div>`).join('')}
       ${b.after?`<div class="after">${md(b.after)}</div>`:''}</div>`,
    box:    b=>{ const i=ico(ICONS[b.kind]?b.kind:'note'), body=md(b.html);
       return `<div class="box ${b.kind||''}">${b.hd?`<span class="t">${i}${md(b.hd)}</span>${body}`:body.replace('<span class="t">','<span class="t">'+i)}</div>`; },
    ex:     b=>`<div class="ex"><div class="h">${ico('ex')}${md(b.hd||'Example')}</div><dl>${
       b.rows.map(([k,v])=>`<dt>${md(k)}</dt><dd>${md(v)}</dd>`).join('')}</dl></div>`,
    fig:    b=>{ const c=caption(b,'Figure');
       return `<figure${c.id}>${typeof b.svg==='function'?b.svg():b.svg}
       ${c.html}</figure>`; },
    figrow: b=>`<div class="figrow ${b.n===3?'three':'two'}">${b.items.map(it=>{ const c=caption(it,'Figure');
       return `<figure${c.id}>${typeof it.svg==='function'?it.svg():it.svg}${c.html}</figure>`; }).join('')}</div>`,
    /* A table's caption sits above it, as a table's caption does in print. */
    table:  b=>{ const c=caption(b,'Table'), t=`<table>${b.head?`<tr>${b.head.map(h=>`<th>${md(h)}</th>`).join('')}</tr>`:''}
       ${b.rows.map(r=>`<tr>${r.map(c=>`<td>${md(c)}</td>`).join('')}</tr>`).join('')}</table>`;
       return c.html?`<figure class="tbl"${c.id}>${c.html}${t}</figure>`:t; },
    /* A contents row is number, title, summary and — where the same material is
       developed at length in the course textbook — an anchor into it. The anchor
       always carries its `NC` marker: these chapter numbers and the textbook's do
       not agree, and a bare section mark would read as one of these.
       The anchor is written before the summary so that grid auto-placement puts
       it on the title line; the summary then spans the two columns beneath.
       Each row links to its chapter and carries an empty page-number slot that
       notes/topdf.js fills when it prints; the sections of the chapter are
       listed under it once the whole document has been rendered. */
    toc:    b=>`<div class="toc"><!--TOCFRONT-->${b.items.map(([n,t,s,a])=>{ const k=String(n).trim();
       return `<div class="c"><div class="n">${md(n)}</div><a class="t" href="#ch-${k}">${md(t)}</a>${
         `<div class="a">${a?md(a).replace(/NC\s+CH[\d.]+/g, m=>`<span class="ax">${m}</span>`):''}</div>`}${pg('ch-'+k)}<div class="s">${md(s)}</div><!--TOCSEC:${k}--></div>`; }).join('')}</div>`,
    lists:  ()=>'<!--LISTS-->',
    hr:     ()=>'<hr>',
    q:      b=>`<div class="q"><span class="n">${b.n}</span> ${md(b.text)}${
       b.ans?`<div class="ans">Answer: ${md(b.ans)}</div>`:''}</div>`,
    raw:    b=>b.html
  };

  /* The three document editions build their own blocks from CONTENT, so they need
     the same inline renderer the block types use. One renderer, one behaviour. */
  window.renderInline = md;

  /* With `captions` on (the lecture notes), every figure and table inside a
     chapter is numbered by chapter, and a List of Figures and a List of Tables
     are set on their own pages between the contents and Chapter 1. */
  window.renderNotes = function(blocks, host, opts){
    opts = opts || {};
    S = {captions:!!opts.captions, ch:null, sec:'', chs:[], secs:{}, lof:[], lot:[]};
    const first = blocks.findIndex(b=>b.t==='h1' && b.num);
    if(S.captions && first>0) blocks = blocks.slice(0,first).concat([{t:'lists'},{t:'page'}], blocks.slice(first));
    let html = '<div class="page">' + blocks.map(b=>{
      const f=R[b.t]; return f?f(b):'';
    }).join('') + '</div>';
    const row = (cls,n,text,id) => `<a class="${cls}" href="#${id}"><span class="ln">${n}</span><span class="lt">${md(text)}</span><span class="ld"></span>${pg(id)}</a>`;
    const list = (L,id,title) => `<h1 id="${id}">${title}</h1><hr class="thick"><div class="lol">${S.chs.map(c=>{
      const e=L.filter(x=>x.ch===c.k); return e.length?`<div class="lg">${md(c.w)} ${md(c.k)} &middot; ${md(c.text)}</div>`+
        e.map(x=>row('lr',x.num,x.text,x.id)).join(''):''; }).join('')}</div>`;
    const front = [S.lof.length&&['lof','List of Figures'], S.lot.length&&['lot','List of Tables']].filter(Boolean);
    html = html
      .replace(/<!--TOCSEC:([^>]*?)-->/g, (m,k)=>(S.secs[k]||[]).map(x=>row('sr',x.num,x.text,'sec-'+x.num)).join(''))
      .replace('<!--TOCFRONT-->', S.captions ? front.map(([id,t])=>
        `<div class="c fm"><div class="n"></div><a class="t" href="#${id}">${t}</a><div class="a"></div>${pg(id)}</div>`).join('') : '')
      .replace('<!--LISTS-->', front.map(([id,t])=>list(id==='lof'?S.lof:S.lot,id,t)).join(R.page()));
    host.innerHTML = html;
    S = null;
  };
})();
