/* ==========================================================================
   Module 4 — The Bloch sphere and quantum gates.

   One qubit, drawn, and every operation on it as a motion of that drawing.
   Chapters 1 to 3 built the algebra; this chapter gives it a picture, and the
   picture is exact rather than a mnemonic: a pure state of one qubit is a
   point of a sphere, a mixed state is a point inside it, and every gate that
   can act on one qubit is a rotation of that sphere and nothing else.

   Four things in here are the ones students get wrong, and each has a scene.
   The half angle is not a normalisation trick: two states at right angles on
   the sphere overlap, and two states that are opposite on the sphere are the
   ones that are orthogonal. A global phase moves nothing and a relative phase
   moves everything, and the two look identical in a formula until the picture
   is drawn. A circuit is read from left to right and its matrices multiply
   from right to left, so the gate written last in a product is applied first.
   And the qubit ordering, fixed in chapter 3, is where a two-qubit gate goes
   silently wrong: the wrong ordering does not make a result approximately
   wrong, it names a different state.

   Every figure that carries an angle, a circle or a rotation is drawn in an
   isotropic frame — the same number of pixels to the unit on both axes — and
   the ratio is written in the comment above the figure. A right angle drawn in
   an anisotropic frame is a lie, and a Bloch sphere drawn as an ellipse is a
   lie about the one object this chapter exists to explain.
   ========================================================================== */
(function(){
const P = PLOT, C = P.COL;
const R2 = Math.SQRT1_2;
const D2R = Math.PI/180;

/* ---- the drawing convention every sphere in this chapter uses -------------
   A point of the ball is drawn at

       (x, y, z)  ->  (x + 0.42 y,  z + 0.24 y).

   So the plane of the page is the x-z plane and it is drawn undistorted:
   every angle read inside that plane is the true angle, and the great circle
   through |0>, |+>, |1> and |-> is a genuine circle rather than an ellipse.
   The y direction is foreshortened to about half its length and drawn up and
   to the right, which is what turns the equator into an ellipse — correctly,
   because a circle seen at an angle is an ellipse. Every frame below is
   isotropic, so the circle is round on the page as well as in the data. */
const KY = 0.42, KZ = 0.24;
const pj = (x,y,z) => [x + KY*y, z + KZ*y];

/* The outline: the great circle in the plane of the page. */
function rim(a, col, w){
  const p=[]; for(let i=0;i<=220;i++){ const s=2*Math.PI*i/220; p.push([Math.cos(s),Math.sin(s)]); }
  a.poly(p,{color:col||C.grid,width:w||1.6});
}
/* The equator, drawn where the convention puts it. */
function equator(a, col){
  const p=[]; for(let i=0;i<=220;i++){ const t=2*Math.PI*i/220;
    p.push(pj(Math.cos(t),Math.sin(t),0)); }
  a.poly(p,{color:col||C.rule,width:1.1,dash:'4 4'});
}
/* The three axes of the ball, out to the radius given. */
function axes3(a, r){
  a.poly([[0,-r],[0,r]],{color:C.rule,width:1.1});
  a.poly([[-r,0],[r,0]],{color:C.rule,width:1.1});
  a.poly([[0,0],pj(0,r,0)],{color:C.rule,width:1.1});
}
/* An arm from the centre to a Bloch vector, with a dot on the end. */
function arm(a, v, col, w){
  const q = pj(v[0],v[1],v[2]);
  a.poly([[0,0],q],{color:col,width:w||2.6});
  a.point(q[0],q[1],{color:col,r:6});
  return q;
}

/* ---------------------------------------------------------------- figures --
   Each is a function, so the palette is the one in force when it is drawn. */

/* The chapter as a change of description: an algebraic object on the left, the
   same object as a motion on the right. */
function figOpen(){
  return P.blocks({w:760,h:236,items:[
    {t:'box',x:40,y:40,w:190,h:60,label:'\\alpha|0\\rangle+\\beta|1\\rangle',tex:true,fs:16,color:C.in},
    {t:'arrow',x1:230,y1:70,x2:320,y2:70},
    {t:'box',x:320,y:40,w:190,h:60,label:'\\text{a point of a sphere}',tex:true,fs:14,color:C.out},
    {t:'box',x:40,y:140,w:190,h:60,label:'U,\\quad U^{\\dagger}U=I',tex:true,fs:16,color:C.h},
    {t:'arrow',x1:230,y1:170,x2:320,y2:170},
    {t:'box',x:320,y:140,w:190,h:60,label:'\\text{a rotation of it}',tex:true,fs:14,color:C.out},
    {t:'text',x:640,y:76,label:'nothing new is assumed here',fs:12},
    {t:'text',x:640,y:100,label:'both lines are chapter 2 again',fs:12},
    {t:'text',x:640,y:176,label:'and the drawing is exact,',fs:12},
    {t:'text',x:640,y:200,label:'not a picture of the algebra',fs:12}
  ]});
}

/* ---- the frame every sphere and every disc in this chapter is drawn in ----
   440 px over an x span of 5.50 and 216 px over a y span of 2.70: both exactly
   80 px to the unit, so the great circle in the plane of the page is a genuine
   circle and every angle read inside that plane is the true angle.

   The frame is far wider than the ball needs, and that is deliberate. A square
   figure fills its whole column and squeezes the text beside it; three scenes
   of chapter 3 fell below the layout floor for exactly that reason. The ball
   sits at the left of the frame and the space to its right is empty. */
const sph = () => P.Axes({w:492,h:268,xr:[-1.85,3.65],yr:[-1.35,1.35],
  pad:{l:26,r:26,t:26,b:26}, xticksOverride:[], yticksOverride:[],
  grid:false, zeroAxes:false, arrows:false});

/* A flat disc for a view down the z axis, in the same frame and at the same
   80 px to the unit, so the circle is round there as well. */
function disc(a){
  const r=[]; for(let i=0;i<=220;i++){ const s=2*Math.PI*i/220;
    r.push([Math.cos(s),Math.sin(s)]); }
  a.poly(r,{color:C.grid,width:1.6});
  a.poly([[-1.24,0],[1.24,0]],{color:C.rule,width:1.1});
  a.poly([[0,-1.24],[0,1.24]],{color:C.rule,width:1.1});
  return a;
}

/* The sphere, the two angles, and one state on it. */
function figSphere(){
  const a = sph();
  rim(a); equator(a); axes3(a,1.22);
  const th = 60*D2R, ph = 135*D2R;
  const v = [Math.sin(th)*Math.cos(ph), Math.sin(th)*Math.sin(ph), Math.cos(th)];
  /* the meridian the state sits on, from the north pole down through it */
  const mer=[]; for(let i=0;i<=120;i++){ const s=Math.PI*i/120;
    mer.push(pj(Math.sin(s)*Math.cos(ph), Math.sin(s)*Math.sin(ph), Math.cos(s))); }
  a.poly(mer,{color:C.dec.mid,width:1.4});
  const q = arm(a, v, C.in);
  /* the polar angle, drawn as an arc from the axis to the arm */
  const arc=[]; for(let i=0;i<=40;i++){ const s=th*i/40;
    arc.push(pj(0.34*Math.sin(s)*Math.cos(ph), 0.34*Math.sin(s)*Math.sin(ph), 0.34*Math.cos(s))); }
  a.poly(arc,{color:C.h,width:1.8});
  a.note(0.12,0.44,'\\theta',{fs:14,color:C.h,tex:true});
  /* the azimuth, drawn in the equatorial plane */
  const az=[]; for(let i=0;i<=40;i++){ const t=ph*i/40; az.push(pj(0.46*Math.cos(t),0.46*Math.sin(t),0)); }
  a.poly(az,{color:C.mid,width:1.8});
  a.note(0.32,0.16,'\\varphi',{fs:14,color:C.mid,tex:true});
  /* Every name sits outside the rim except the two angles, which are the only
     things drawn near the centre. */
  a.note(0,1.28,'|0\\rangle',{fs:13.5,color:C.ink,anchor:'middle',tex:true});
  a.note(0,-1.28,'|1\\rangle',{fs:13.5,color:C.ink,anchor:'middle',dy:14,tex:true});
  a.note(1.30,0,'x',{fs:13,color:C.muted,dy:20,tex:true});
  /* The vertical axis is named just clear of the rim on the left, where the
     meridian and the state arm never reach. Naming it out at the far left,
     level with the centre, would put it on the -x arm instead. */
  a.note(-0.16,1.04,'z',{fs:13,color:C.muted,anchor:'end',tex:true});
  const yq = pj(0,1.32,0);
  a.note(yq[0],yq[1],'y',{fs:13,color:C.muted,dx:8,dy:4,tex:true});
  a.note(q[0],q[1],'|\\psi(\\theta,\\varphi)\\rangle',{fs:13.5,color:C.in,dx:-10,dy:-10,anchor:'end',tex:true});
  return a.svg();
}

/* The six states a first course keeps returning to, on one sphere. */
function figCardinal(){
  const a = sph();
  rim(a); equator(a); axes3(a,1.22);
  const six = [
    [[0,0,1],  '|0\\rangle',    C.in,   0,-26,'middle'],
    [[0,0,-1], '|1\\rangle',    C.in,   0, 34,'middle'],
    [[1,0,0],  '|{+}\\rangle',  C.out, 12, 20,'start'],
    [[-1,0,0], '|{-}\\rangle',  C.out,-12, 20,'end'],
    [[0,1,0],  '|{+}i\\rangle', C.mid, 14,-8,'start'],
    [[0,-1,0], '|{-}i\\rangle', C.mid,-14, 12,'end']
  ];
  six.forEach(([v,l,col,dx,dy,an])=>{
    const q = pj(v[0],v[1],v[2]);
    a.poly([[0,0],q],{color:col,width:1.8});
    a.point(q[0],q[1],{color:col,r:6});
    a.note(q[0],q[1],l,{fs:13.5,color:col,dx,dy,anchor:an,tex:true});
  });
  a.note(1.80,0.70,'\\pm\\hat{z}: \\text{ the }Z\\text{ basis}',{fs:12.5,color:C.in,tex:true});
  a.note(1.80,0.30,'\\pm\\hat{x}: \\text{ the }X\\text{ basis}',{fs:12.5,color:C.out,tex:true});
  a.note(1.80,-0.10,'\\pm\\hat{y}: \\text{ the }Y\\text{ basis}',{fs:12.5,color:C.mid,tex:true});
  return a.svg();
}

/* Two states at an angle on the sphere, and the probability of telling them
   apart. The half angle is the whole content: the overlap is one at zero, one
   half at a right angle, and zero only at the far side. */
function figHalf(){
  const a = P.Axes({w:560,h:250,xr:[0,180],yr:[0,1.12],
    xlabel:'\\Theta\\,(\\text{degrees})', ylabel:'|\\langle\\chi|\\psi\\rangle|^{2}',
    pad:{l:66,r:24,t:30,b:46}, xtarget:4, ytarget:4});
  a.curve(d => Math.cos(d*D2R/2)**2, {color:C.in, width:2.4});
  a.hline(0.5,{color:C.rule,width:1.2,dash:'4 4'});
  a.point(90,0.5,{color:C.h,r:6});
  /* Past 100 degrees the curve is below 0.42, so the upper-right corner is
     empty and both names go there. */
  a.note(100,0.62,'\\text{a right angle: a coin}',{fs:12,color:C.h,tex:true});
  a.point(180,0,{color:C.out,r:6});
  a.note(178,0,'\\text{opposite}',{fs:12.5,color:C.out,dx:-6,dy:-26,anchor:'end',tex:true});
  return a.svg();
}

/* Global against relative phase, seen from above the north pole. The global
   phase leaves the point where it was; the relative phase turns it. */
function figGlobal(){
  const a = disc(sph());
  a.poly([[0,0],[1,0]],{color:C.in,width:2.6});
  a.point(1,0,{color:C.in,r:7});
  const f = 70*D2R;
  a.poly([[0,0],[Math.cos(f),Math.sin(f)]],{color:C.out,width:2.6});
  a.point(Math.cos(f),Math.sin(f),{color:C.out,r:7});
  const arc=[]; for(let i=0;i<=40;i++){ const t=f*i/40; arc.push([0.42*Math.cos(t),0.42*Math.sin(t)]); }
  a.poly(arc,{color:C.h,width:1.8});
  a.note(0.52,0.16,'\\varphi',{fs:14,color:C.h,tex:true});
  a.note(1.32,0,'x',{fs:13,color:C.muted,dy:20,tex:true});
  a.note(0,1.30,'y',{fs:13,color:C.muted,anchor:'middle',tex:true});
  a.note(1.55,0.86,'|\\psi\\rangle \\text{ and } e^{i\\gamma}|\\psi\\rangle',{fs:13,color:C.in,tex:true});
  a.note(1.55,0.46,'\\text{one point, every } \\gamma',{fs:12.5,color:C.in,tex:true});
  a.note(1.55,-0.06,'\\text{turned by } \\varphi',{fs:13,color:C.out,tex:true});
  a.note(1.55,-0.46,'\\text{a different state}',{fs:12.5,color:C.out,tex:true});
  return a.svg();
}

/* The double cover: the amplitude a rotation about z leaves behind, against
   the turn. It reaches minus one at a full turn of the vector and only returns
   at two of them. */
function figCover(){
  const a = P.Axes({w:560,h:250,xr:[0,4],yr:[-1.25,1.25],
    xlabel:'\\alpha/\\pi', ylabel:'\\langle\\psi|R_{z}(\\alpha)|\\psi\\rangle',
    pad:{l:78,r:24,t:30,b:46}, xtarget:4, ytarget:4});
  a.curve(u => Math.cos(Math.PI*u/2), {color:C.in, width:2.4});
  a.point(2,-1,{color:C.err,r:6});
  a.note(2.08,-1,'\\text{a full turn gives } -I',{fs:12.5,color:C.err,dy:18,tex:true});
  a.point(4,1,{color:C.out,r:6});
  a.note(3.92,1,'\\text{two turns give } I',{fs:12.5,color:C.out,dy:-10,anchor:'end',tex:true});
  return a.svg();
}

/* A rotation about a tilted axis: the axis, the vector, and the circle the
   vector is carried around. */
function figRot(){
  const a = sph();
  rim(a); axes3(a,1.20);
  const b = 35*D2R;
  const n = [Math.sin(b),0,Math.cos(b)];
  const e1 = [Math.cos(b),0,-Math.sin(b)], e2 = [0,1,0];
  const nq = pj(1.32*n[0],1.32*n[1],1.32*n[2]);
  a.poly([[0,0],nq],{color:C.h,width:2.4});
  a.note(nq[0],nq[1],'\\mathbf{n}',{fs:14,color:C.h,dx:6,dy:-6,tex:true});
  const r = [1,0,0];
  const dot = r[0]*n[0]+r[1]*n[1]+r[2]*n[2];
  const sin = Math.sqrt(Math.max(0,1-dot*dot));
  const at = s => [0,1,2].map(k => dot*n[k] + sin*(Math.cos(s)*e1[k] + Math.sin(s)*e2[k]));
  const orb=[]; for(let i=0;i<=200;i++){ const s=2*Math.PI*i/200;
    const p=at(s); orb.push(pj(p[0],p[1],p[2])); }
  /* The orbit is the claim of the figure, so it is drawn in the amber of
     its own axis rather than in the low-opacity fill tone. */
  a.poly(orb,{color:C.h,width:1.5,dash:'5 4'});
  arm(a, r, C.in);
  const rp = at(120*D2R);
  const q2 = pj(rp[0],rp[1],rp[2]);
  arm(a, rp, C.out);
  a.note(1.02,0,'\\mathbf{r}',{fs:14,color:C.in,dx:8,dy:20,tex:true});
  a.note(q2[0],q2[1],'\\mathbf{r}^{\\prime}',{fs:14,color:C.out,dx:8,dy:-6,tex:true});
  a.note(1.75,0.60,'\\text{the vector is carried}',{fs:12.5,color:C.muted,tex:true});
  a.note(1.75,0.20,'\\text{round the axis by } \\alpha',{fs:12.5,color:C.muted,tex:true});
  a.note(1.75,-0.26,'\\text{its length cannot change}',{fs:12.5,color:C.muted,tex:true});
  return a.svg();
}

/* What the three Pauli gates do, as half turns about the three axes. */
function figPauli(){
  const a = sph();
  rim(a); equator(a); axes3(a,1.22);
  /* Z is the half turn about z: it fixes the poles and swaps |+> and |->. */
  a.poly([[0,0],[1,0]],{color:C.out,width:2.4});
  a.point(1,0,{color:C.out,r:6});
  a.poly([[0,0],[-1,0]],{color:C.out,width:2.4,dash:'5 4'});
  a.point(-1,0,{color:C.out,r:6});
  a.note(1,0,'|{+}\\rangle',{fs:13,color:C.out,dx:8,dy:22,tex:true});
  a.note(-1,0,'|{-}\\rangle',{fs:13,color:C.out,dx:-8,dy:22,anchor:'end',tex:true});
  /* X is the half turn about x: it fixes |+> and |-> and swaps the poles. */
  a.poly([[0,0],[0,1]],{color:C.in,width:2.4});
  a.point(0,1,{color:C.in,r:6});
  a.poly([[0,0],[0,-1]],{color:C.in,width:2.4,dash:'5 4'});
  a.point(0,-1,{color:C.in,r:6});
  a.note(0,1.28,'|0\\rangle',{fs:13,color:C.in,anchor:'middle',tex:true});
  a.note(0,-1.28,'|1\\rangle',{fs:13,color:C.in,anchor:'middle',dy:14,tex:true});
  /* Each line is in the colour of the pair it names, not of the axis, because
     the colour on the page marks the two states that move. */
  a.note(1.75,0.66,'X\\text{ turns about }x\\text{: it swaps}',{fs:12.5,color:C.in,tex:true});
  a.note(1.75,0.26,'|0\\rangle \\leftrightarrow |1\\rangle',{fs:12.5,color:C.in,tex:true});
  a.note(1.75,-0.22,'Z\\text{ turns about }z\\text{: it swaps}',{fs:12.5,color:C.out,tex:true});
  a.note(1.75,-0.62,'|{+}\\rangle \\leftrightarrow |{-}\\rangle',{fs:12.5,color:C.out,tex:true});
  return a.svg();
}

/* The Hadamard as a half turn about the diagonal axis. The axis really is at
   45 degrees, which is only true because the frame is isotropic. */
function figHad(){
  const a = sph();
  rim(a); axes3(a,1.20);
  a.poly([[-1.30*R2,-1.30*R2],[1.30*R2,1.30*R2]],{color:C.h,width:2.4});
  a.note(1.30*R2,1.30*R2,'\\frac{\\hat{x}+\\hat{z}}{\\sqrt2}',{fs:13,color:C.h,dx:6,dy:-4,tex:true});
  a.poly([[0,0],[0,1]],{color:C.in,width:2.6});
  a.point(0,1,{color:C.in,r:6});
  a.note(0,1.28,'|0\\rangle',{fs:13,color:C.in,anchor:'middle',tex:true});
  a.poly([[0,0],[1,0]],{color:C.out,width:2.6});
  a.point(1,0,{color:C.out,r:6});
  a.note(1,0,'|{+}\\rangle',{fs:13,color:C.out,dx:8,dy:24,tex:true});
  /* the half turn takes the top of the circle round to the right of it */
  const sw=[]; for(let i=0;i<=40;i++){ const t=Math.PI/2*(1-i/40);
    sw.push([1.12*Math.cos(t),1.12*Math.sin(t)]); }
  a.poly(sw,{color:C.mid,width:1.6,dash:'3 4'});
  a.note(1.80,0.44,'\\text{a half turn about}',{fs:12.5,color:C.muted,tex:true});
  a.note(1.80,0.04,'\\text{the diagonal exchanges}',{fs:12.5,color:C.muted,tex:true});
  a.note(1.80,-0.36,'x \\text{ and } z',{fs:12.5,color:C.muted,tex:true});
  return a.svg();
}

/* The phase gates, seen from above: each is a turn about z by its own angle. */
function figPhaseGate(){
  const a = disc(sph());
  const put = (deg, lab, col, dx, dy, an) => {
    const t = deg*D2R, x = Math.cos(t), y = Math.sin(t);
    a.poly([[0,0],[x,y]],{color:col,width:2.4});
    a.point(x,y,{color:col,r:6});
    a.note(x,y,lab,{fs:13,color:col,dx,dy,anchor:an,tex:true});
  };
  put(0,   '|{+}\\rangle',    C.in,  10, 24,'start');
  put(45,  'T|{+}\\rangle',   C.mid, 10, -6,'start');
  put(90,  'S|{+}\\rangle',   C.out,  0,-12,'middle');
  put(180, 'Z|{+}\\rangle',   C.err,-10, 24,'end');
  a.note(1.32,0,'x',{fs:13,color:C.muted,dy:-10,tex:true});
  a.note(1.90,-0.50,'\\text{every phase gate is a}',{fs:12.5,color:C.muted,tex:true});
  a.note(1.90,-0.90,'\\text{turn about } z',{fs:12.5,color:C.muted,tex:true});
  return a.svg();
}

/* A box diagram has no axes to stretch, so when a slide grows its figure into
   the spare height of the column, the diagram keeps its size and is centred in
   the taller frame. Chapter 3's helper, extended for circuits: a wire here is
   drawn with absolute commands (`M60,50 H250`, `M180,52 V120`), so every
   absolute y in a path moves by the same amount, and not only the first point.
   The lowercase commands are relative and need nothing. */
function growBlocks(spec){
  const h1 = P.hOverride;
  if(!h1 || h1 <= spec.h) return P.blocks(spec);
  const dy = (h1 - spec.h) / 2;
  const items = spec.items.map(it => {
    const o = Object.assign({}, it);
    ['y','y1','y2'].forEach(k => { if(o[k] != null) o[k] += dy; });
    if(o.t === 'line' && o.d) o.d = o.d
      .replace(/([ML])\s*([-\d.]+),([-\d.]+)/g, (m,c,x,y) => `${c}${x},${+y + dy}`)
      .replace(/V\s*([-\d.]+)/g, (m,y) => `V${+y + dy}`);
    return o;
  });
  return P.blocks({w:spec.w, h:h1, items:items});
}

/* A circuit runs left to right and its matrices multiply right to left. The
   whole figure exists to put those two orders side by side. Drawn 560 px wide,
   because a 760 px box diagram prints its labels too small in the narrow
   column of a slide. */
function figTime(){
  return growBlocks({w:560,h:196,items:[
    {t:'line',d:'M40,74 H520',color:C.rule},
    {t:'box',x:110,y:50,w:70,h:48,label:'U_{1}',tex:true,fs:16,color:C.in},
    {t:'box',x:245,y:50,w:70,h:48,label:'U_{2}',tex:true,fs:16,color:C.h},
    {t:'box',x:380,y:50,w:70,h:48,label:'U_{3}',tex:true,fs:16,color:C.out},
    {t:'text',x:40,y:30,anchor:'start',label:'time runs this way',fs:13},
    {t:'arrow',x1:200,y1:26,x2:320,y2:26},
    {t:'text',x:280,y:144,label:'|\\psi_{\\text{out}}\\rangle = U_{3}\\,U_{2}\\,U_{1}\\,|\\psi_{\\text{in}}\\rangle',tex:true,fs:19},
    {t:'text',x:280,y:182,label:'the gate written last is applied first',fs:13}
  ]});
}

/* Any one-qubit gate as three turns: spin, tilt, spin. */
function figEuler(){
  return growBlocks({w:580,h:176,items:[
    {t:'box',x:10,y:40,w:110,h:54,label:'R_{z}(\\lambda)',tex:true,fs:16,color:C.in},
    {t:'arrow',x1:120,y1:67,x2:150,y2:67},
    {t:'box',x:150,y:40,w:110,h:54,label:'R_{y}(\\theta)',tex:true,fs:16,color:C.h},
    {t:'arrow',x1:260,y1:67,x2:290,y2:67},
    {t:'box',x:290,y:40,w:110,h:54,label:'R_{z}(\\phi)',tex:true,fs:16,color:C.in},
    {t:'arrow',x1:400,y1:67,x2:430,y2:67},
    {t:'box',x:430,y:40,w:140,h:54,label:'e^{i\\alpha}',tex:true,fs:16,color:C.mid},
    {t:'text',x:65,y:122,label:'spin',fs:13},
    {t:'text',x:205,y:122,label:'tilt',fs:13},
    {t:'text',x:345,y:122,label:'spin again',fs:13},
    {t:'text',x:500,y:122,label:'unobservable',fs:13},
    {t:'text',x:290,y:162,label:'three angles fix the rotation; the fourth number is a phase',fs:12.5}
  ]});
}

/* The one-qubit gate a compiler actually calibrates, with each entry named. */
function figU(){
  return growBlocks({w:560,h:232,items:[
    {t:'box',x:110,y:44,w:170,h:66,label:'\\cos\\frac{\\theta}{2}',tex:true,fs:17,color:C.in},
    {t:'box',x:280,y:44,w:170,h:66,label:'-e^{i\\lambda}\\sin\\frac{\\theta}{2}',tex:true,fs:17,color:C.mid},
    {t:'box',x:110,y:110,w:170,h:66,label:'e^{i\\phi}\\sin\\frac{\\theta}{2}',tex:true,fs:17,color:C.mid},
    {t:'box',x:280,y:110,w:170,h:66,label:'e^{i(\\phi+\\lambda)}\\cos\\frac{\\theta}{2}',tex:true,fs:17,color:C.in},
    {t:'text',x:195,y:34,label:'|0\\rangle',tex:true,fs:14},
    {t:'text',x:365,y:34,label:'|1\\rangle',tex:true,fs:14},
    {t:'text',x:100,y:82,anchor:'end',label:'\\langle 0|',tex:true,fs:14},
    {t:'text',x:100,y:148,anchor:'end',label:'\\langle 1|',tex:true,fs:14},
    {t:'text',x:280,y:212,label:'one tilt angle and two phases fill the four entries',fs:13}
  ]});
}

/* Why a classical gate cannot be run backwards, and what fixes it. */
function figRev(){
  return growBlocks({w:560,h:180,items:[
    {t:'box',x:50,y:40,w:120,h:64,label:'\\mathrm{AND}',tex:true,fs:16,color:C.err},
    {t:'text',x:40,y:62,anchor:'end',label:'a',tex:true,fs:15},
    {t:'text',x:40,y:94,anchor:'end',label:'b',tex:true,fs:15},
    {t:'arrow',x1:170,y1:72,x2:214,y2:72},
    {t:'text',x:224,y:77,anchor:'start',label:'ab',tex:true,fs:15},
    {t:'text',x:110,y:136,label:'four inputs, two outputs',fs:13},
    {t:'text',x:110,y:162,label:'two inputs are erased',fs:13,color:C.err},
    {t:'box',x:340,y:40,w:120,h:64,label:'\\mathrm{CNOT}',tex:true,fs:16,color:C.out},
    {t:'text',x:330,y:62,anchor:'end',label:'a',tex:true,fs:15},
    {t:'text',x:330,y:94,anchor:'end',label:'b',tex:true,fs:15},
    {t:'arrow',x1:460,y1:58,x2:494,y2:58},
    {t:'arrow',x1:460,y1:88,x2:494,y2:88},
    {t:'text',x:502,y:63,anchor:'start',label:'a',tex:true,fs:15},
    {t:'text',x:502,y:93,anchor:'start',label:'a\\oplus b',tex:true,fs:15},
    {t:'text',x:400,y:136,label:'four inputs, four outputs',fs:13},
    {t:'text',x:400,y:162,label:'a relabelling, so it undoes itself',fs:13,color:C.out}
  ]});
}

/* Computing into an ancilla, copying the answer out, and running the work
   backwards so nothing is left entangled. */
function figUncompute(){
  return growBlocks({w:560,h:196,items:[
    {t:'line',d:'M40,46 H540',color:C.rule},
    {t:'line',d:'M40,92 H540',color:C.rule},
    {t:'line',d:'M40,138 H540',color:C.rule},
    {t:'text',x:30,y:51,anchor:'end',label:'x',tex:true,fs:15},
    {t:'text',x:30,y:97,anchor:'end',label:'0',tex:true,fs:15},
    {t:'text',x:30,y:143,anchor:'end',label:'y',tex:true,fs:15},
    {t:'box',x:80,y:28,w:100,h:82,label:'V_{f}',tex:true,fs:16,color:C.h},
    {t:'box',x:240,y:74,w:100,h:82,label:'\\mathrm{copy}',tex:true,fs:15,color:C.mid},
    {t:'box',x:400,y:28,w:100,h:82,label:'V_{f}^{\\dagger}',tex:true,fs:16,color:C.h},
    {t:'text',x:130,y:184,label:'compute',fs:13},
    {t:'text',x:290,y:184,label:'copy out',fs:13},
    {t:'text',x:450,y:184,label:'uncompute',fs:13}
  ]});
}

/* Two qubits: which entry belongs to which pair of bits, and what a gate on
   one of them alone looks like. */
function figOrder(){
  const rows = [['|00\\rangle','c_{0}'],['|01\\rangle','c_{1}'],
                ['|10\\rangle','c_{2}'],['|11\\rangle','c_{3}']];
  const items = [];
  rows.forEach(([k,c],i)=>{
    const y = 30 + i*44;
    items.push({t:'text',x:90,y:y+28,anchor:'end',label:k,tex:true,fs:15});
    items.push({t:'box',x:104,y:y,w:86,h:38,label:c,tex:true,fs:15,
      color:i===2?C.out:C.mid});
  });
  items.push({t:'text',x:147,y:20,label:'x = 2q_{1}+q_{0}',tex:true,fs:14});
  items.push({t:'text',x:390,y:52,label:'\\left(I\\otimes X\\right)|10\\rangle = |11\\rangle',tex:true,fs:16});
  items.push({t:'text',x:390,y:82,label:'acts on the right qubit',fs:13});
  items.push({t:'text',x:390,y:136,label:'\\left(X\\otimes I\\right)|10\\rangle = |00\\rangle',tex:true,fs:16});
  items.push({t:'text',x:390,y:166,label:'acts on the left qubit',fs:13});
  items.push({t:'text',x:280,y:228,label:'same gate, two different states',fs:13,color:C.err});
  return growBlocks({w:560,h:244,items});
}

/* The controlled-NOT: the circuit symbol, and the permutation it performs. */
function figCnot(){
  const items = [
    {t:'line',d:'M50,56 H230',color:C.rule},
    {t:'line',d:'M50,124 H230',color:C.rule},
    {t:'line',d:'M140,56 V124',color:C.h},
    {t:'text',x:40,y:61,anchor:'end',label:'q_{0}',tex:true,fs:15},
    {t:'text',x:40,y:129,anchor:'end',label:'q_{1}',tex:true,fs:15},
    {t:'text',x:140,y:176,label:'the filled dot is the control',fs:13}
  ];
  const maps = [['|00\\rangle','|00\\rangle'],['|01\\rangle','|11\\rangle'],
                ['|10\\rangle','|10\\rangle'],['|11\\rangle','|01\\rangle']];
  maps.forEach(([a,b],i)=>{
    const y = 44 + i*42;
    items.push({t:'text',x:380,y,anchor:'end',label:a,tex:true,fs:15});
    items.push({t:'arrow',x1:392,y1:y-5,x2:446,y2:y-5});
    items.push({t:'text',x:458,y,anchor:'start',label:b,tex:true,fs:15});
  });
  items.push({t:'text',x:280,y:218,label:'the left digit flips exactly when the right one is one',fs:13});
  return growBlocks({w:560,h:234,items:items.concat([
    {t:'dot',x:140,y:56,r:7,color:C.h},
    {t:'line',d:'M126,124 a14,14 0 1,0 28,0 a14,14 0 1,0 -28,0',color:C.h},
    {t:'line',d:'M140,110 V138',color:C.h},
    {t:'line',d:'M126,124 H154',color:C.h}
  ])});
}

/* The controlled-Z, and the one identity that turns it into a CNOT. */
function figCz(){
  return growBlocks({w:560,h:200,items:[
    {t:'line',d:'M40,50 H200',color:C.rule},
    {t:'line',d:'M40,112 H200',color:C.rule},
    {t:'line',d:'M120,50 V112',color:C.h},
    {t:'dot',x:120,y:50,r:7,color:C.h},
    {t:'dot',x:120,y:112,r:7,color:C.h},
    {t:'text',x:120,y:152,label:'two dots, no target',fs:13},
    {t:'text',x:385,y:58,label:'\\mathrm{CZ} = \\operatorname{diag}(1,1,1,-1)',tex:true,fs:16},
    {t:'text',x:385,y:112,label:'= (H\\otimes I)\\,\\mathrm{CNOT}_{0\\to 1}\\,(H\\otimes I)',tex:true,fs:15},
    {t:'text',x:385,y:152,label:'a Hadamard on each side of the target',fs:13},
    {t:'text',x:280,y:188,label:'exchanging the two wires changes nothing',fs:13}
  ]});
}

/* SWAP out of three CNOTs, with the alternating control. */
function figSwap(){
  const wire = y => ({t:'line',d:`M50,${y} H500`,color:C.rule});
  const dot = (x,y) => ({t:'dot',x,y,r:7,color:C.h});
  const targ = (x,y) => ([{t:'line',d:`M${x-14},${y} a14,14 0 1,0 28,0 a14,14 0 1,0 -28,0`,color:C.h},
                          {t:'line',d:`M${x},${y-14} V${y+14}`,color:C.h},
                          {t:'line',d:`M${x-14},${y} H${x+14}`,color:C.h}]);
  const link = (x) => ({t:'line',d:`M${x},50 V120`,color:C.h});
  return growBlocks({w:560,h:180,items:[wire(50),wire(120),
    link(150),dot(150,50),...targ(150,120),
    link(275),dot(275,120),...targ(275,50),
    link(400),dot(400,50),...targ(400,120),
    {t:'text',x:40,y:55,anchor:'end',label:'q_{0}',tex:true,fs:15},
    {t:'text',x:40,y:125,anchor:'end',label:'q_{1}',tex:true,fs:15},
    {t:'text',x:512,y:55,anchor:'start',label:'q_{1}',tex:true,fs:15},
    {t:'text',x:512,y:125,anchor:'start',label:'q_{0}',tex:true,fs:15},
    {t:'text',x:275,y:166,label:'the middle one runs the other way',fs:13}
  ]});
}

/* How much entanglement one CNOT makes, against the state it is handed. */
function figEntangle(){
  const h = l => (l<=0||l>=1) ? 0 : -l*Math.log2(l) - (1-l)*Math.log2(1-l);
  const a = P.Axes({w:560,h:250,xr:[0,180],yr:[0,1.14],
    xlabel:'\\theta\\,(\\text{degrees})', ylabel:'S(\\rho_{A})\\,(\\text{bits})',
    pad:{l:74,r:24,t:30,b:46}, xtarget:4, ytarget:4});
  a.curve(d => h(Math.cos(d*D2R/2)**2), {color:C.in, width:2.4});
  a.point(0,0,{color:C.out,r:6});
  a.point(180,0,{color:C.out,r:6});
  a.point(90,1,{color:C.h,r:6});
  a.note(90,1,'\\text{one ebit}',{fs:12.5,color:C.h,anchor:'middle',dy:-12,tex:true});
  /* The curve is below 0.36 for every angle under 30 degrees, so the strip
     the name sits in is empty. */
  a.note(6,0.56,'\\text{a product}',{fs:12,color:C.out,tex:true});
  return a.svg();
}

/* What a universal set is, and what the word does not promise. Two rows, one
   claim each, so every arrow points right. */
function figUniv(){
  return growBlocks({w:560,h:210,items:[
    {t:'box',x:20,y:30,w:250,h:58,label:'\\text{one-qubit gates} + \\mathrm{CNOT}',tex:true,fs:15,color:C.in},
    {t:'arrow',x1:270,y1:59,x2:320,y2:59},
    {t:'box',x:320,y:30,w:220,h:58,label:'\\text{every unitary, exactly}',tex:true,fs:15,color:C.out},
    {t:'box',x:20,y:116,w:250,h:58,label:'H,\\;S,\\;T,\\;\\mathrm{CNOT}',tex:true,fs:15,color:C.mid},
    {t:'arrow',x1:270,y1:145,x2:320,y2:145},
    {t:'box',x:320,y:116,w:220,h:58,label:'\\text{every unitary, to }\\varepsilon',tex:true,fs:15,color:C.out},
    {t:'text',x:280,y:200,label:'a finite set buys accuracy with length',fs:13}
  ]});
}

/* The chapter as one ladder: a point, a rotation, a sequence, a pair. */
function figLadder(){
  return P.blocks({w:760,h:190,items:[
    {t:'box',x:20,y:44,w:150,h:60,label:'\\text{a point}',tex:true,fs:14,color:C.in},
    {t:'arrow',x1:170,y1:74,x2:216,y2:74},
    {t:'box',x:216,y:44,w:150,h:60,label:'\\text{a rotation}',tex:true,fs:14,color:C.h},
    {t:'arrow',x1:366,y1:74,x2:412,y2:74},
    {t:'box',x:412,y:44,w:150,h:60,label:'\\text{a sequence}',tex:true,fs:14,color:C.mid},
    {t:'arrow',x1:562,y1:74,x2:608,y2:74},
    {t:'box',x:608,y:44,w:132,h:60,label:'\\text{a pair}',tex:true,fs:14,color:C.out},
    {t:'text',x:95,y:130,label:'one qubit, drawn',fs:12},
    {t:'text',x:291,y:130,label:'one gate, as a motion',fs:12},
    {t:'text',x:487,y:130,label:'many gates, in order',fs:12},
    {t:'text',x:674,y:130,label:'and the entangling gate',fs:12},
    {t:'text',x:380,y:168,label:'each step is the one before it, applied to one more thing',fs:12}
  ]});
}

const SC = [

/* ---------------------------------------------------------------- 4.0.1 -- */
{ id:'m4-open', module:'M4', nav:'One qubit, drawn', title:'Everything one qubit can be, on one sphere',
  objective:'Say what the chapter turns into a picture, and what that picture is exact about.',
  keywords:'bloch sphere overview module 4 rotation gate picture geometry one qubit introduction',
  src:'L7 · pure qubit states and the Bloch sphere', steps:2, blocks:[
  {t:'eyebrow', text:'Module 4 · The Bloch sphere and quantum gates'},
  {t:'title', text:'Everything one qubit can be, on one sphere'},
  {t:'lede', text:'Three chapters of algebra have said what a qubit state is and what may be done to it. This chapter says the same things again as a drawing, and the drawing loses nothing: every pure state of one qubit is a point of a sphere, every mixed state a point inside it, and every gate a rotation.'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Two amplitudes with two complex numbers in them look like four real parameters. Normalisation removes one, and the fact that a global phase is not physical removes another. Two are left, and two angles are exactly what it takes to name a point on a sphere.</p>'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>The same counting works for the gates. A two-by-two unitary has four real parameters; one of them is a global phase nobody can see, and the three that remain are exactly the three that name a rotation of a sphere — an axis, which takes two, and an angle.</p>'},
      {t:'note', kind:'def', head:'What the picture is for', html:'It is not a memory aid. Chapter 5 chooses gate sequences and chapter 6 makes amplitudes cancel, and both are much easier to reason about when a gate is a motion you can see. The exercise of this chapter is to stop translating and start reading the picture directly.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figOpen(),
      caption:'The two translations this chapter installs. The left column is chapter 2 written out; the right column is the same statement as geometry. Nothing is approximated in either arrow.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'The sphere is for one qubit and stops there', html:'There is no picture like this for two qubits. Two qubits need six real parameters for a pure state and fifteen for a mixed one, and no drawing carries that. Everything in the second half of this chapter — the entangling gates — is therefore done in algebra, and the sphere is used only for what each qubit does alone.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 4.1.1 -- */
{ id:'m4-sphere', module:'M4', nav:'The sphere and the half angle', title:'The two angles of a qubit, and why one of them is halved',
  objective:'Write a pure qubit state in its two angles and give the Bloch vector it names.',
  keywords:'bloch sphere polar azimuthal angle theta phi half angle parameterisation pure state north south pole',
  src:'L7 · pure qubit states and the Bloch sphere', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 4 · The Bloch sphere'},
  {t:'title', text:'The two angles of a qubit, and why one of them is halved'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, svg:()=>figSphere(),
      caption:'One state on the sphere. The page is the $x$&#8211;$z$ plane, drawn undistorted, so $\\theta$ is drawn at its real size. The north pole is $|0\\rangle$ and the south pole is $|1\\rangle$.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'At a pole the azimuth means nothing', html:'At $\\theta=0$ the state is $|0\\rangle$ for every $\\varphi$, because $\\sin 0=0$ leaves nothing for the phase to multiply. Like longitude at the North Pole, $\\varphi$ is not defined there.'}]},
  ], right:[
    {t:'eq', key:true, label:'Two angles', tex:'\\begin{aligned} |\\psi\\rangle &= \\cos\\tfrac{\\theta}{2}\\,|0\\rangle + e^{i\\varphi}\\sin\\tfrac{\\theta}{2}\\,|1\\rangle \\\\ \\mathbf{r} &= \\left(\\sin\\theta\\cos\\varphi,\\;\\sin\\theta\\sin\\varphi,\\;\\cos\\theta\\right) \\end{aligned}',
      note:'A global phase makes the first amplitude real, so two real numbers are left: $0\\le\\theta\\le\\pi$ and $0\\le\\varphi<2\\pi$. The vector $\\mathbf{r}$ holds the three Pauli means and has length one. The angle is halved because $|\\psi\\rangle$ and $-|\\psi\\rangle$ are the same state.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} \\theta = 60^{\\circ},\\ \\varphi = 135^{\\circ}: \\quad |\\psi\\rangle &= 0.8660\\,|0\\rangle + 0.5\\,e^{i3\\pi/4}|1\\rangle \\\\ \\mathbf{r} &= (-0.6124,\\ 0.6124,\\ 0.5) \\end{aligned}',
        note:'$0.6124^{2}+0.6124^{2}+0.5^{2}=1$, so the point is on the surface. And $p(0)=\\cos^{2}30^{\\circ}=0.75$, which is $\\tfrac12(1+r_{z})$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$|\\psi\\rangle=\\tfrac12|0\\rangle+\\tfrac{\\sqrt3}{2}|1\\rangle$.<div class="nsep"></div>What is $r_{z}$?',
        ask:{key:'m4-sphere', choices:['$-0.5$','$0.5$','$0.866$'], answer:0,
          why:'$r_{z}=|c_{0}|^{2}-|c_{1}|^{2}=0.25-0.75=-0.5$. The state is below the equator, at $\\theta=120^{\\circ}$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 4.1.2 -- */
{ id:'m4-cardinal', module:'M4', nav:'The six states', title:'Six states worth knowing by their positions',
  objective:'Place the six eigenstates of the Pauli operators on the sphere and read a Bloch vector back into a state.',
  keywords:'cardinal states eigenstates pauli plus minus plus i basis axes positions poles equator six points',
  src:'L7 · computational, X and Y basis states', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 4 · The Bloch sphere'},
  {t:'title', text:'Six states worth knowing by their positions'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, svg:()=>figCardinal(),
      caption:'The six states. The frame is isotropic, so a pair that looks opposite on the page is opposite in the data.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Superposition depends on the basis', html:'$|{+}\\rangle$ is a superposition in the $Z$ basis and an eigenstate in the $X$ basis. "The qubit is in a superposition" says nothing until the basis is named.'}]},
  ], right:[
    {t:'eq', key:true, label:'Six states', tex:'\\begin{aligned}|0\\rangle,\\;|1\\rangle \\;&\\longleftrightarrow\\; \\pm\\hat{z} \\\\ |{+}\\rangle,\\;|{-}\\rangle \\;&\\longleftrightarrow\\; \\pm\\hat{x} \\\\ |{+}i\\rangle,\\;|{-}i\\rangle \\;&\\longleftrightarrow\\; \\pm\\hat{y}\\end{aligned}',
      note:'The two eigenstates of each Pauli operator sit at the two ends of one axis. Each pair is one measurement basis. The two states of a pair are orthogonal, and the next slide shows that orthogonal states are opposite points.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} \\mathbf{r} = (0,-1,0): \\quad \\theta &= 90^{\\circ},\\ \\varphi = 270^{\\circ} \\\\ |\\psi\\rangle &= \\tfrac{1}{\\sqrt2}\\left(|0\\rangle - i|1\\rangle\\right) = |{-}i\\rangle \\end{aligned}',
        note:'Length one, so the state is pure. $\\langle Y\\rangle=-1$ and $\\langle X\\rangle=\\langle Z\\rangle=0$: a $Y$ reading is certain and the other two are fair coins.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'A qubit is reported at $\\mathbf{r}=(-1,\\,0,\\,0)$.<div class="nsep"></div>Which state is it?',
        ask:{key:'m4-cardinal', choices:['$|{-}\\rangle$','$|1\\rangle$','$|{-}i\\rangle$'], answer:0,
          why:'$-\\hat{x}$ is $\\theta=90^{\\circ}$, $\\varphi=180^{\\circ}$, so the state is $\\tfrac{1}{\\sqrt2}(|0\\rangle-|1\\rangle)=|{-}\\rangle$. $|1\\rangle$ is at $-\\hat{z}$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 4.1.3 -- */
{ id:'m4-overlap', module:'M4', nav:'Angles and overlaps', title:'Opposite means orthogonal, and a right angle means a coin',
  objective:'Use the overlap formula to turn an angle on the sphere into a probability.',
  keywords:'overlap fidelity angle between bloch vectors antipodal orthogonal half angle distinguishability coin',
  src:'L7 · pure qubit states and the Bloch sphere', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 4 · The Bloch sphere'},
  {t:'title', text:'Opposite means orthogonal, and a right angle means a coin'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figHalf(),
      caption:'The overlap against the angle on the sphere. It is one half at a right angle and zero only at the far side.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'A right angle is not orthogonality', html:'Two states are orthogonal, and can be told apart in one reading, exactly when their points are <b>opposite</b>. Two points at a right angle are as hard to tell apart as a coin toss.'}]},
  ], right:[
    {t:'eq', key:true, label:'Overlap', tex:'\\left|\\langle\\chi|\\psi\\rangle\\right|^{2} = \\frac{1+\\mathbf{r}\\cdot\\mathbf{s}}{2} = \\cos^{2}\\frac{\\Theta}{2}',
      note:'For two pure states with Bloch vectors $\\mathbf{r}$ and $\\mathbf{s}$ at an angle $\\Theta$. It comes from chapter 3: the overlap is $\\operatorname{Tr}(\\rho_{\\psi}\\rho_{\\chi})$, and multiplying out $\\tfrac12(I+\\mathbf{r}\\cdot\\boldsymbol\\sigma)$ and $\\tfrac12(I+\\mathbf{s}\\cdot\\boldsymbol\\sigma)$ leaves the dot product.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} |0\\rangle \\text{ and } |{+}\\rangle: \\quad \\mathbf{r}\\cdot\\mathbf{s} &= 0 \\\\ \\left|\\langle {+}|0\\rangle\\right|^{2} &= \\tfrac12(1+0) = 0.5 \\end{aligned}',
        note:'Directly, $\\langle {+}|0\\rangle=1/\\sqrt2$, and its square is $0.5$. For $|0\\rangle$ and $|1\\rangle$, at $\\Theta=180^{\\circ}$, the formula gives $\\tfrac12(1-1)=0$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'Two pure states have $\\mathbf{r}=(0,\\,0,\\,1)$ and $\\mathbf{s}=(0.6,\\,0,\\,0.8)$.<div class="nsep"></div>What is $|\\langle\\chi|\\psi\\rangle|^{2}$?',
        ask:{key:'m4-overlap', choices:['$0.9$','$0.8$','$0.64$'], answer:0,
          why:'$\\mathbf{r}\\cdot\\mathbf{s}=0.8$, so the overlap is $\\tfrac12(1+0.8)=0.9$. $0.8$ is $\\cos\\Theta$, not the overlap.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 4.1.4 -- */
{ id:'m4-glob', module:'M4', nav:'Global against relative phase', title:'One phase moves nothing, the other moves everything',
  objective:'Say which phase changes the Bloch vector and demonstrate it on a pair of states.',
  keywords:'global phase relative phase azimuth unobservable interference distinguishable density operator picture',
  src:'L7 · global phase, relative phase and the double cover', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 4 · The Bloch sphere'},
  {t:'title', text:'One phase moves nothing, the other moves everything'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, svg:()=>figGlobal(),
      caption:'The equator, seen from above the north pole. A global phase leaves the teal point where it is. A relative phase $\\varphi$ carries it round by exactly $\\varphi$.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'A control makes a global phase relative', html:'Apply the phase only in the branch where a control qubit is $|1\\rangle$. Now it sits <b>between two branches</b>, and the control can see it. Every algorithm in chapter 6 uses this move.'}]},
  ], right:[
    {t:'eq', key:true, label:'Two phases', tex:'\\begin{aligned} e^{i\\gamma}|\\psi\\rangle \\;&\\longmapsto\\; \\text{the same } \\mathbf{r} \\\\ \\cos\\tfrac{\\theta}{2}|0\\rangle + e^{i\\varphi}\\sin\\tfrac{\\theta}{2}|1\\rangle \\;&\\longmapsto\\; \\text{turned by } \\varphi \\text{ about } z \\end{aligned}',
      note:'A global phase leaves $\\rho$ unchanged, so it leaves the point unchanged. A phase between the two amplitudes moves the point round the equator by that angle. At $\\varphi=\\pi$ it has carried $|{+}\\rangle$ all the way to $|{-}\\rangle$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} |{+}\\rangle,\\ i|{+}\\rangle \\;&\\longmapsto\\; \\mathbf{r} = (1,0,0) \\\\ |{-}\\rangle \\;&\\longmapsto\\; \\mathbf{r} = (-1,0,0) \\end{aligned}',
        note:'$i|{+}\\rangle$ multiplies both amplitudes by $i$; $|{-}\\rangle$ multiplies only the second by $-1$. An $X$ reading tells $|{+}\\rangle$ from $|{-}\\rangle$ every time, and never tells $|{+}\\rangle$ from $i|{+}\\rangle$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$|{+}i\\rangle=\\tfrac{1}{\\sqrt2}\\left(|0\\rangle+i|1\\rangle\\right)$.<div class="nsep"></div>Which state is the same state as $|{+}i\\rangle$?',
        ask:{key:'m4-glob', choices:['$\\tfrac{1}{\\sqrt2}\\left(i|0\\rangle-|1\\rangle\\right)$','$\\tfrac{1}{\\sqrt2}\\left(|0\\rangle-i|1\\rangle\\right)$','$\\tfrac{1}{\\sqrt2}\\left(i|0\\rangle+|1\\rangle\\right)$'], answer:0,
          why:'Take out $i$: $i|0\\rangle-|1\\rangle=i\\left(|0\\rangle+i|1\\rangle\\right)$, a global phase. The third is $i\\left(|0\\rangle-i|1\\rangle\\right)$, which is $|{-}i\\rangle$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 4.1.5 -- */
{ id:'m4-cover', module:'M4', nav:'Two turns to come back', title:'The state needs two full turns and the vector needs one',
  objective:'Show that a full rotation returns minus the identity and say when that sign is observable.',
  keywords:'double cover su2 so3 spinor two pi rotation minus identity four pi controlled phase observable',
  src:'L7 · global phase, relative phase and the double cover', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 4 · The Bloch sphere'},
  {t:'title', text:'The state needs two full turns and the vector needs one'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figCover(),
      caption:'What is left of the state after a turn about its own axis. After one full turn the state carries the sign $-1$ and is still the same state. After two full turns the gate is the identity.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'A $2\\pi$ turn is not nothing for a gate', html:'It changes nothing for <b>that qubit alone</b>. Inside a larger circuit it is $-I$, and $-I$ on one branch of a superposition is a sign that survives into the interference.'}]},
  ], right:[
    {t:'eq', key:true, label:'A full turn', tex:'\\begin{aligned} R_{\\mathbf{n}}(\\alpha) &= \\cos\\tfrac{\\alpha}{2}\\,I - i\\sin\\tfrac{\\alpha}{2}\\,\\mathbf{n}\\cdot\\boldsymbol\\sigma \\\\ R_{\\mathbf{n}}(2\\pi) &= -I, \\qquad R_{\\mathbf{n}}(4\\pi) = +I \\end{aligned}',
      note:'The angle is halved inside, so a turn of $2\\pi$ on the sphere is a turn of $\\pi$ in the amplitudes. The Bloch vector is back after $2\\pi$; the state has a minus sign and returns only after $4\\pi$. $U$ and $-U$ turn the sphere the same way: the map from gates to rotations is two to one.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} R_{z}(2\\pi)\\,|{+}\\rangle &= -|{+}\\rangle \\\\ \\text{controlled:} \\quad |{+}\\rangle_{t}\\,|{+}\\rangle_{c} &\\longmapsto |{+}\\rangle_{t}\\,|{-}\\rangle_{c} \\end{aligned}',
        note:'Alone, nothing measurable changes: $-|{+}\\rangle$ has the same $\\rho$. Apply the same gate to a target $t$ only in the $|1\\rangle$ branch of a control $c$ in $|{+}\\rangle$, and the control turns into $|{-}\\rangle$, which an $X$ reading sees.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The gate $R_{x}(6\\pi)$.<div class="nsep"></div>What is it?',
        ask:{key:'m4-cover', choices:['$-I$','$I$','$-iX$'], answer:0,
          why:'$\\cos 3\\pi=-1$ and $\\sin 3\\pi=0$. Three full turns are an odd number of turns, so the sign is $-1$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- code --- */
{ id:'m4-code-sphere', module:'M4', nav:'Code · The Bloch sphere', title:'The Bloch sphere in code',
  objective:'Turn a state into its Bloch vector and back, compute an overlap from two vectors, and compare a global with a relative phase.',
  keywords:'code qiskit numpy program bloch vector angles overlap global phase relative phase run',
  slide:true, steps:0, budget:'a code page: the programs print their own results', blocks:[
  {t:'eyebrow', text:'Module 4 · The Bloch sphere'},
  {t:'title', text:'The Bloch sphere in code'},
  {t:'raw', html:()=>CODEBANK.page('m4-code-sphere')}
]},

/* ---------------------------------------------------------------- 4.2.1 -- */
{ id:'m4-rot', module:'M4', nav:'Every gate is a rotation', title:'Every one-qubit gate is a rotation, and here is its axis',
  objective:'Write a one-qubit unitary as a rotation and read its axis and angle.',
  keywords:'rotation operator exponential pauli axis angle generator half angle unitary one qubit gate geometry',
  src:'L7 · single-qubit gates as rotations', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 4 · Single-qubit gates as rotations'},
  {t:'title', text:'Every one-qubit gate is a rotation, and here is its axis'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, svg:()=>figRot(),
      caption:'A rotation about a tilted axis. The vector goes round the amber circle and keeps its angle to the axis, so its length never changes. That is unitarity, drawn.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'The angle in the matrix is half the turn', html:'$R_{z}(\\pi)$ contains $\\cos(\\pi/2)$ and $\\sin(\\pi/2)$, and it turns the vector by a <b>half</b> turn. Reading the number inside the cosine as the angle on the sphere is wrong by a factor of two.'}]},
  ], right:[
    {t:'eq', key:true, label:'Rotation operator', tex:'\\begin{aligned} R_{\\mathbf{n}}(\\alpha) &= e^{-i\\alpha\\,\\mathbf{n}\\cdot\\boldsymbol\\sigma/2} \\\\ &= \\cos\\tfrac{\\alpha}{2}\\,I - i\\sin\\tfrac{\\alpha}{2}\\,\\mathbf{n}\\cdot\\boldsymbol\\sigma \\end{aligned}',
      note:'Because $(\\mathbf{n}\\cdot\\boldsymbol\\sigma)^{2}=I$, the even terms of the series give the cosine and the odd terms give the sine. The gate turns $\\mathbf{r}$ about $\\mathbf{n}$ by $\\alpha$. Every two-by-two unitary is $e^{i\\gamma}R_{\\mathbf{n}}(\\alpha)$ for some phase, axis and angle.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} R_{z}(90^{\\circ}): \\quad (1,0,0) &\\longmapsto (0,1,0) \\\\ R_{z}(\\tfrac{\\pi}{2})\\,|{+}\\rangle &= e^{-i\\pi/4}\\,\\tfrac{1}{\\sqrt2}\\left(|0\\rangle+i|1\\rangle\\right) \\end{aligned}',
        note:'A quarter turn about $z$ carries $|{+}\\rangle$ to the $+\\hat{y}$ point. By matrices, $R_{z}(\\pi/2)=\\operatorname{diag}(e^{-i\\pi/4},e^{i\\pi/4})$, and the result is $|{+}i\\rangle$ up to a global phase.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$R_{z}(90^{\\circ})$ is applied to $|{+}i\\rangle$.<div class="nsep"></div>Which state comes out?',
        ask:{key:'m4-rot', choices:['$|{-}\\rangle$','$|{-}i\\rangle$','$|{+}\\rangle$'], answer:0,
          why:'A quarter turn about $z$ carries $+\\hat{y}$ to $-\\hat{x}$, which is $|{-}\\rangle$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 4.2.2 -- */
{ id:'m4-pauli', module:'M4', nav:'The Pauli gates', title:'The three Pauli gates, as three half turns',
  objective:'Give the axis and angle of each Pauli gate and its action on the six cardinal states.',
  keywords:'pauli gates X Y Z bit flip phase flip half turn axis fixed points eigenstates action',
  src:'L7 · the X, Y and Z gates', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 4 · Single-qubit gates as rotations'},
  {t:'title', text:'The three Pauli gates, as three half turns'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, svg:()=>figPauli(),
      caption:'Two half turns. $X$ turns about the horizontal axis and exchanges the poles. $Z$ turns about the vertical axis and exchanges $|{+}\\rangle$ and $|{-}\\rangle$.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'"$X$ is a bit flip" is half the story', html:'$X$ flips $|0\\rangle$ and $|1\\rangle$ and leaves $|{+}\\rangle$ and $|{-}\\rangle$ where they are. $Z$ does nothing to $|0\\rangle$ or $|1\\rangle$. Which gate looks like a flip depends on the basis.'}]},
  ], right:[
    {t:'eq', key:true, label:'Half turns', tex:'R_{x}(\\pi) = -iX, \\qquad R_{y}(\\pi) = -iY, \\qquad R_{z}(\\pi) = -iZ',
      note:'At $\\alpha=\\pi$ the cosine vanishes. So each Pauli gate is a <b>half turn about its own axis</b>, up to a phase nobody can see. A half turn fixes the two points on the axis and sends every other point to the far side.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'X|{-}\\rangle = X\\,\\tfrac{1}{\\sqrt2}\\left(|0\\rangle-|1\\rangle\\right) = \\tfrac{1}{\\sqrt2}\\left(-|0\\rangle+|1\\rangle\\right) = -|{-}\\rangle',
        note:'$|{-}\\rangle$ is at $-\\hat{x}$, on the axis of the turn, so it cannot move. The minus sign is a global phase, as the picture says.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$Z$ is applied to $|{+}i\\rangle$.<div class="nsep"></div>Which state comes out?',
        ask:{key:'m4-pauli', choices:['$|{-}i\\rangle$','$|{+}i\\rangle$','$|{-}\\rangle$'], answer:0,
          why:'A half turn about $z$ sends $+\\hat{y}$ to $-\\hat{y}$. By matrices, $Z\\tfrac{1}{\\sqrt2}(|0\\rangle+i|1\\rangle)=\\tfrac{1}{\\sqrt2}(|0\\rangle-i|1\\rangle)$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 4.2.3 -- */
{ id:'m4-had', module:'M4', nav:'The Hadamard', title:'The Hadamard: one half turn about a diagonal axis',
  objective:'Give the Hadamard as a rotation and use it to exchange the two bases.',
  keywords:'hadamard gate superposition basis change diagonal axis half turn self inverse HXH HZH conjugation',
  src:'L7 · the Hadamard gate', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 4 · Single-qubit gates as rotations'},
  {t:'title', text:'The Hadamard: one half turn about a diagonal axis'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, svg:()=>figHad(),
      caption:'The axis of the Hadamard sits at $45^{\\circ}$ between $x$ and $z$. The half turn about it carries $|0\\rangle$ to $|{+}\\rangle$.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'$H$ does not create superpositions', html:'It makes one from $|0\\rangle$ and removes one from $|{+}\\rangle$: $H|{+}\\rangle=|0\\rangle$. It is its own inverse, so it only swaps the two bases.'}]},
  ], right:[
    {t:'eq', key:true, label:'Hadamard', tex:'\\begin{aligned} H &= \\tfrac{1}{\\sqrt2}\\begin{bmatrix}1&1\\\\1&-1\\end{bmatrix} = \\frac{X+Z}{\\sqrt2} \\\\ HXH &= Z, \\qquad HZH = X, \\qquad HYH = -Y \\end{aligned}',
      note:'A gate of the form $\\mathbf{n}\\cdot\\boldsymbol\\sigma$ is a half turn about $\\mathbf{n}$, so $H$ is a half turn about $(\\hat{x}+\\hat{z})/\\sqrt2$. It swaps $x$ with $z$ and reverses $y$. So measuring $X$ is the same as applying $H$ and then measuring $Z$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} H: \\quad (0,1,0) &\\longmapsto (0,-1,0) \\\\ H|{+}i\\rangle &= e^{i\\pi/4}\\,\\tfrac{1}{\\sqrt2}\\left(|0\\rangle - i|1\\rangle\\right) \\end{aligned}',
        note:'$|{+}i\\rangle$ is on the $y$ axis, which the turn reverses. By matrices, $H|{+}i\\rangle=\\tfrac12\\left[(1+i)|0\\rangle+(1-i)|1\\rangle\\right]$, which is $|{-}i\\rangle$ up to a global phase.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'A state has $\\mathbf{r}=(0.6,\\,0,\\,0.8)$, and $H$ is applied.<div class="nsep"></div>What is the new Bloch vector?',
        ask:{key:'m4-had', choices:['$(0.8,\\,0,\\,0.6)$','$(0.6,\\,0,\\,-0.8)$','$(-0.6,\\,0,\\,0.8)$'], answer:0,
          why:'$H$ swaps the $x$ and $z$ components and reverses $y$, so $(0.6,0,0.8)$ becomes $(0.8,0,0.6)$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 4.2.4 -- */
{ id:'m4-phase', module:'M4', nav:'Phase gates', title:'The phase gates: turning the equator by a chosen angle',
  objective:'Write the phase gate family and place S and T inside it.',
  keywords:'phase gate P S T gate quarter turn eighth turn clifford non clifford diagonal z rotation equator',
  src:'L7 · the phase, S and T gates', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 4 · Single-qubit gates as rotations'},
  {t:'title', text:'The phase gates: turning the equator by a chosen angle'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, svg:()=>figPhaseGate(),
      caption:'The equator seen from above, with $|{+}\\rangle$ carried round by $T$, by $S$ and by $Z$. The angles on the page are the angles in the data.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'No effect on $|0\\rangle$ or $|1\\rangle$', html:'Both poles sit on the axis of the turn, so a phase gate never changes a $Z$ probability. Its effect shows only after a later gate, usually a Hadamard, moves the state off the axis.'}]},
  ], right:[
    {t:'eq', key:true, label:'Phase gates', tex:'\\begin{aligned} P(\\varphi) &= \\begin{bmatrix}1&0\\\\0&e^{i\\varphi}\\end{bmatrix} = e^{i\\varphi/2}\\,R_{z}(\\varphi) \\\\ S &= P\\!\\left(\\tfrac{\\pi}{2}\\right), \\quad T = P\\!\\left(\\tfrac{\\pi}{4}\\right), \\quad S^{2}=Z, \\quad T^{2}=S \\end{aligned}',
      note:'A phase gate is a turn about $z$ by $\\varphi$, with a global phase nobody can see. $S$ is a quarter turn and $T$ an eighth. $S$ is a Clifford gate and cheap to correct; $T$ is not, which is why the last section of the chapter singles it out.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} T|{+}\\rangle &= \\tfrac{1}{\\sqrt2}\\left(|0\\rangle + e^{i\\pi/4}|1\\rangle\\right) \\\\ \\mathbf{r} &= (0.7071,\\ 0.7071,\\ 0) \\end{aligned}',
        note:'Here $\\theta=90^{\\circ}$ and $\\varphi=45^{\\circ}$. The length is still one, and $r_{z}=0$, so a $Z$ reading is still a fair coin, as a turn about $z$ requires.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$S$ is applied three times to $|{+}\\rangle$.<div class="nsep"></div>Which state comes out?',
        ask:{key:'m4-phase', choices:['$|{-}i\\rangle$','$|{+}i\\rangle$','$|{-}\\rangle$'], answer:0,
          why:'Three quarter turns are $270^{\\circ}$, which carries $+\\hat{x}$ to $-\\hat{y}$. By matrices, $S^{3}=\\operatorname{diag}(1,-i)$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- code --- */
{ id:'m4-code-rotations', module:'M4', nav:'Code · Gates as rotations', title:'Gates as rotations in code',
  objective:'Build a rotation from its exponential, check the Pauli gates as half turns, and follow the phase gates round the equator.',
  keywords:'code qiskit numpy program rotation exponential eigh pauli half turn hadamard phase gate S T run',
  slide:true, steps:0, budget:'a code page: the programs print their own results', blocks:[
  {t:'eyebrow', text:'Module 4 · Single-qubit gates as rotations'},
  {t:'title', text:'Gates as rotations in code'},
  {t:'raw', html:()=>CODEBANK.page('m4-code-rotations')}
]},

/* ---------------------------------------------------------------- 4.3.1 -- */
{ id:'m4-time', module:'M4', nav:'The order gates compose in', title:'A circuit reads left to right and its matrices multiply right to left',
  objective:'Convert a drawn gate sequence into the correct matrix product.',
  keywords:'circuit order matrix multiplication right to left composition time order non commuting gates sequence',
  src:'L7 · the quantum circuit model', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 4 · Composing gates'},
  {t:'title', text:'A circuit reads left to right and its matrices multiply right to left'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figTime(),
      caption:'The same three gates in the two orders they are written in. A ket is acted on from the left, so the product is read backwards.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Test the rule on gates that do not commute', html:'$HZH=X$ reads the same in both directions, so it cannot catch a wrong order. Test with $S$ and $H$, which do not commute.'}]},
  ], right:[
    {t:'eq', key:true, label:'Order', tex:'U_{1} \\text{ first},\\; U_{2} \\text{ next},\\; U_{3} \\text{ last} \\quad\\Longrightarrow\\quad U = U_{3}\\,U_{2}\\,U_{1}',
      note:'A matrix acts on the ket to its right, so the first gate stands next to the ket and is written <b>last</b>. Gates on different qubits commute, $(A\\otimes I)(I\\otimes B)=(I\\otimes B)(A\\otimes I)$; only gates that share a qubit have an order to respect.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} H \\text{ then } S: \\quad SH|0\\rangle &= S|{+}\\rangle = |{+}i\\rangle \\\\ S \\text{ then } H: \\quad HS|0\\rangle &= H|0\\rangle = |{+}\\rangle \\end{aligned}',
        note:'The same two gates in two orders give $\\mathbf{r}=(0,1,0)$ and $\\mathbf{r}=(1,0,0)$: two different states, at a right angle on the sphere.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$X$ is applied to $|0\\rangle$, and then $H$.<div class="nsep"></div>Which product, and which state?',
        ask:{key:'m4-time', choices:['$HX|0\\rangle=|{-}\\rangle$','$XH|0\\rangle=|{+}\\rangle$','$HX|0\\rangle=|{+}\\rangle$'], answer:0,
          why:'$X$ runs first, so it stands next to the ket: $HX$. $X|0\\rangle=|1\\rangle$ and $H|1\\rangle=|{-}\\rangle$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 4.3.2 -- */
{ id:'m4-euler', module:'M4', nav:'Three turns are enough', title:'Any one-qubit gate in three turns and a phase',
  objective:'Decompose a one-qubit unitary into two z rotations and one y rotation.',
  keywords:'euler decomposition zyz rotation three angles universal one qubit synthesis native gate set compiler',
  src:'L7 · arbitrary single-qubit gates and Euler angles', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 4 · Composing gates'},
  {t:'title', text:'Any one-qubit gate in three turns and a phase'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figEuler(),
      caption:'The three turns and the phase, in the order they run. The matrix product has $R_{z}(\\lambda)$ on the right, because it is applied first.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Keep the phase if the gate is controlled', html:'Without $e^{i\\alpha}$ the gate acts the same on one qubit. Under a control the dropped phase becomes relative between two branches, and the circuit is wrong.'}]},
  ], right:[
    {t:'eq', key:true, label:'ZYZ form', tex:'U = e^{i\\alpha}\\,R_{z}(\\phi)\\,R_{y}(\\theta)\\,R_{z}(\\lambda)',
      note:'Spin about $z$, tilt about $y$, spin about $z$ again, and one phase. A two-by-two unitary has four real parameters and the form has four numbers, so none is spare. A compiler uses this identity to reach any gate from a few calibrated rotations.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} H &= e^{i\\pi/2}\\,R_{y}(\\tfrac{\\pi}{2})\\,R_{z}(\\pi) \\\\ &= i\\cdot\\tfrac{1}{\\sqrt2}\\begin{bmatrix}1&-1\\\\1&1\\end{bmatrix}(-iZ) = \\tfrac{1}{\\sqrt2}\\begin{bmatrix}1&1\\\\1&-1\\end{bmatrix} \\end{aligned}',
        note:'$|H_{00}|=1/\\sqrt2=\\cos(\\theta/2)$ gives $\\theta=\\pi/2$. Matching the phases of the first column and the sign in the first row gives $\\lambda=\\pi$, $\\phi=0$ and $\\alpha=\\pi/2$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The gate $X$ is written in the ZYZ form.<div class="nsep"></div>What is $\\theta$?',
        ask:{key:'m4-euler', choices:['$\\pi$','$\\pi/2$','$0$'], answer:0,
          why:'$|X_{00}|=0=\\cos(\\theta/2)$, so $\\theta=\\pi$. Indeed $X=e^{i\\pi/2}R_{y}(\\pi)R_{z}(\\pi)$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 4.3.3 -- */
{ id:'m4-ugate', module:'M4', nav:'The gate a machine takes', title:'The three-parameter gate an instruction set actually offers',
  objective:'Read the standard three-parameter gate matrix and recover the named gates from it.',
  keywords:'u gate three parameters theta phi lambda instruction set native gate qiskit parameterised unitary',
  src:'L7 · arbitrary single-qubit gates and Euler angles', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 4 · Composing gates'},
  {t:'title', text:'The three-parameter gate an instruction set actually offers'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figU(),
      caption:'The four entries. The first column is the state the gate prepares from $|0\\rangle$; the second is what it does to $|1\\rangle$.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Libraries fix the phase differently', html:'Two programs can print two matrices for one rotation, differing by $e^{i\\alpha}$. When copying a gate, compare what it does to $|0\\rangle$ and to $|1\\rangle$, not the entries.'}]},
  ], right:[
    {t:'eq', key:true, label:'Three-parameter gate', tex:'U(\\theta,\\phi,\\lambda) = \\begin{bmatrix} \\cos\\frac{\\theta}{2} & -e^{i\\lambda}\\sin\\frac{\\theta}{2} \\\\[2pt] e^{i\\phi}\\sin\\frac{\\theta}{2} & e^{i(\\phi+\\lambda)}\\cos\\frac{\\theta}{2}\\end{bmatrix}',
      note:'The ZYZ form written as one matrix, with the global phase fixed by a convention. Applied to $|0\\rangle$ it gives $\\cos\\frac{\\theta}{2}|0\\rangle+e^{i\\phi}\\sin\\frac{\\theta}{2}|1\\rangle$, so $\\theta$ and $\\phi$ are the Bloch angles of the state it prepares.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} U\\!\\left(\\tfrac{\\pi}{2},0,\\pi\\right) &= \\tfrac{1}{\\sqrt2}\\begin{bmatrix}1 & -e^{i\\pi}\\\\ e^{i0} & e^{i\\pi}\\end{bmatrix} = \\tfrac{1}{\\sqrt2}\\begin{bmatrix}1&1\\\\1&-1\\end{bmatrix} = H \\\\ X &= U(\\pi,0,\\pi), \\qquad P(\\varphi) = U(0,\\varphi,0) \\end{aligned}',
        note:'Every named gate of the chapter is a setting of the three dials. The columns are orthonormal for every setting, so every setting is a valid gate.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$U(\\pi/2,\\,\\pi/2,\\,0)$ is applied to $|0\\rangle$.<div class="nsep"></div>Which state comes out?',
        ask:{key:'m4-ugate', choices:['$|{+}i\\rangle$','$|{+}\\rangle$','$|{-}i\\rangle$'], answer:0,
          why:'The first column is $\\cos\\frac{\\pi}{4}|0\\rangle+e^{i\\pi/2}\\sin\\frac{\\pi}{4}|1\\rangle=\\tfrac{1}{\\sqrt2}(|0\\rangle+i|1\\rangle)$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 4.L1 --- */
{ id:'m4-lab-g', module:'M4', nav:'Laboratory G', title:'Laboratory G · A gate sequence, and the vector it moves',
  objective:'Let the reader build a single-qubit sequence and follow the Bloch vector through it.',
  keywords:'laboratory gate sequence bloch vector path intermediate states net rotation axis angle composition order',
  steps:0, slide:true, blocks:[
  {t:'eyebrow', text:'Module 4 · Composing gates'},
  {t:'title', text:'Laboratory G · A gate sequence, and the vector it moves'},
  {t:'small', html:'Build a sequence by pressing gates and watch where the Bloch vector goes. The left panel is the sphere with the path on it; the right panel is the three components against the step number, so every intermediate state can be read exactly. Find a pair of gates whose order changes the answer, and a sequence of four or more whose net effect is still one rotation.'},
  {t:'lab', id:'G'}
]},

/* ---------------------------------------------------------------- code --- */
{ id:'m4-code-compose', module:'M4', nav:'Code · Composing gates', title:'Composing gates in code',
  objective:'Multiply gates in the order they run, recover the Euler angles of a gate, and build the named gates from the three-parameter gate.',
  keywords:'code qiskit numpy program circuit order matrix product euler zyz angles u gate run',
  slide:true, steps:0, budget:'a code page: the programs print their own results', blocks:[
  {t:'eyebrow', text:'Module 4 · Composing gates'},
  {t:'title', text:'Composing gates in code'},
  {t:'raw', html:()=>CODEBANK.page('m4-code-compose')}
]},

/* ---------------------------------------------------------------- 4.4.1 -- */
{ id:'m4-rev', module:'M4', nav:'Reversible embeddings', title:'A classical gate that throws information away cannot be unitary',
  objective:'Embed an irreversible Boolean function and a half adder in reversible gates, and state the extra wires they require.',
  keywords:'reversible computation irreversible AND XOR half adder sum carry landauer erasure bijection cnot toffoli embedding classical logic',
  src:'L7 · classical logic, information loss and reversible embeddings', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 4 · Reversible embeddings'},
  {t:'title', text:'A classical gate that throws information away cannot be unitary'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figRev(),
      caption:'Two kinds of classical gate. AND erases two of its four inputs; CNOT only relabels them. A quantum gate has to be of the second kind.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Erasing a bit costs energy', html:'Landauer\u2019s argument ties the erasure of one bit to a minimum heat of $k_{B}T\\ln 2$. Inside a quantum circuit erasure is not allowed at all, because a unitary cannot erase.'}]},
  ], right:[
    {t:'eq', key:true, label:'Reversible embedding', tex:'\\begin{aligned} (a,\\,b) \\;&\\longmapsto\\; (a,\\;a\\oplus b) \\\\ |x\\rangle|y\\rangle \\;&\\longmapsto\\; |x\\rangle\\,|y\\oplus f(x)\\rangle \\end{aligned}',
      note:'AND sends four inputs to two outputs, so it cannot be undone and no unitary does it. The fix keeps the input beside the answer. The first line is its own inverse: it is the CNOT. The second works for any $f$, and chapter 6 calls it an oracle.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} \\text{half adder:} \\quad (a,b,0,0) \\;&\\longmapsto\\; (a,\\,b,\\,a\\oplus b,\\,ab) \\\\ \\text{two CNOTs write } a\\oplus b, &\\quad \\text{one Toffoli writes } ab \\end{aligned}',
        note:'Both inputs are kept, so every output names its input. Run the gates backwards: the Toffoli clears $ab$, the CNOTs clear $a\\oplus b$, and all four wires return to $(a,b,0,0)$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The Toffoli $|a\\,b\\,c\\rangle\\mapsto|a\\,b,\\;c\\oplus ab\\rangle$ acts on $|1\\,1\\,1\\rangle$.<div class="nsep"></div>What comes out?',
        ask:{key:'m4-rev', choices:['$|1\\,1\\,0\\rangle$','$|1\\,1\\,1\\rangle$','$|0\\,0\\,1\\rangle$'], answer:0,
          why:'$ab=1$, so the third bit is $1\\oplus 1=0$. A target that is not cleared first gets the answer added, not written.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 4.4.2 -- */
{ id:'m4-toffoli', module:'M4', nav:'Ancillas and uncomputing', title:'Ancillas, and why the workings have to be cleaned up',
  objective:'Explain uncomputation and say what goes wrong when a workspace is left dirty.',
  keywords:'toffoli ancilla uncompute garbage entangled workspace interference reversible circuit clean up bennett',
  src:'L7 · classical logic, information loss and reversible embeddings', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 4 · Reversible embeddings'},
  {t:'title', text:'Ancillas, and why the workings have to be cleaned up'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figUncompute(),
      caption:'Compute, copy out, uncompute. The work is done twice, and the middle wire is clean at the end. Every oracle in chapter 6 is assumed to be built this way.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'A dirty ancilla fails silently', html:'No error, the state is normalised, and the circuit runs. What is lost is the cancellation every algorithm in chapter 6 needs, and the output looks like noise.'}]},
  ], right:[
    {t:'eq', key:true, label:'Uncompute', tex:'\\begin{aligned} V_{f}:\\quad \\sum_{x} c_{x}\\,|x\\rangle|0\\rangle \\;&\\longmapsto\\; \\sum_{x} c_{x}\\,|x\\rangle\\,|g(x)\\rangle \\\\ V_{f}^{\\dagger}\\,(\\text{copy})\\,V_{f}:\\quad |x\\rangle|0\\rangle|y\\rangle \\;&\\longmapsto\\; |x\\rangle|0\\rangle|y\\oplus f(x)\\rangle \\end{aligned}',
      note:'Extra qubits for the workings are <b>ancillas</b>, and they start in $|0\\rangle$. After $V_{f}$ each branch leaves a different value $g(x)$ there, so the register is entangled with the workings. Copying the answer out and running $V_{f}$ backwards returns the ancilla to $|0\\rangle$ in every branch.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} \\tfrac{1}{\\sqrt2}\\left(|0\\rangle+|1\\rangle\\right)|0\\rangle \\;&\\longmapsto\\; \\tfrac{1}{\\sqrt2}\\left(|0\\rangle|0\\rangle + |1\\rangle|1\\rangle\\right) \\\\ \\rho_{\\text{register}} &= I/2 \\end{aligned}',
        note:'The ancilla holds $g(x)=x$. Apply $H$ to the register and read it: with a clean ancilla the answer is $0$ every time; with this one it is a fair coin. Nothing was measured, and the interference is gone.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The register is $\\tfrac{1}{\\sqrt2}(|0\\rangle+|1\\rangle)$ and the ancilla holds $g(x)=0$ for both $x$. Then $H$ is applied to the register.<div class="nsep"></div>What is $p(0)$?',
        ask:{key:'m4-toffoli', choices:['$1$','$0.5$','$0$'], answer:0,
          why:'The ancilla is $|0\\rangle$ in both branches, so the two are not entangled. The register is still $|{+}\\rangle$, and $H|{+}\\rangle=|0\\rangle$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- code --- */
{ id:'m4-code-reversible', module:'M4', nav:'Code · Reversible embeddings', title:'Reversible embeddings in code',
  objective:'Count what AND erases, build a half adder from CNOTs and a Toffoli, and compare a dirty ancilla with a clean one.',
  keywords:'code qiskit numpy program reversible and cnot toffoli half adder ancilla uncompute run',
  slide:true, steps:0, budget:'a code page: the programs print their own results', blocks:[
  {t:'eyebrow', text:'Module 4 · Reversible embeddings'},
  {t:'title', text:'Reversible embeddings in code'},
  {t:'raw', html:()=>CODEBANK.page('m4-code-reversible')}
]},

/* ---------------------------------------------------------------- 4.5.1 -- */
{ id:'m4-order', module:'M4', nav:'Which qubit is which', title:'Two qubits, and the ordering a gate is silently wrong about',
  objective:'Apply a one-qubit gate to a named qubit of a pair without ambiguity.',
  keywords:'qubit order convention tensor product significant bit index kron identity gate wrong qubit silent error',
  src:'L7 · qubit and bit-order conventions', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 4 · Two-qubit gates'},
  {t:'title', text:'Two qubits, and the ordering a gate is silently wrong about'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figOrder(),
      caption:'The four entries and their bit strings, and one gate applied to each qubit of $|10\\rangle$. One answer is $|11\\rangle$ and the other is $|00\\rangle$.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Test the order when a state moves', html:'Whenever a state or a gate moves between programs, prepare $|10\\rangle$, apply $X$ to the qubit you mean, and print the four amplitudes. It is the only reliable test.'}]},
  ], right:[
    {t:'eq', key:true, label:'Placement', tex:'\\begin{aligned} &|q_{1}q_{0}\\rangle, \\qquad x = 2q_{1}+q_{0} \\\\ &\\text{on } q_{0}: \\; I\\otimes A, \\qquad \\text{on } q_{1}: \\; A\\otimes I \\end{aligned}',
      note:'Chapter 3 fixed the order: the higher-numbered qubit is on the left, and entry $x$ of the column is the amplitude of the string $x$. Both placements are valid four-by-four gates and they do different things. A wrong choice gives a normalised state for a different experiment.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} (I\\otimes X)\\,|10\\rangle &= |11\\rangle \\\\ (X\\otimes I)\\,|10\\rangle &= |00\\rangle \\end{aligned}',
        note:'$|10\\rangle$ is the column $(0,0,1,0)$. $I\\otimes X$ flips $q_{0}$ and gives entry $3$; $X\\otimes I$ flips $q_{1}$ and gives entry $0$. The untouched qubit keeps its value, and that names which qubit moved.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$H$ is applied to $q_{1}$ of $|01\\rangle$.<div class="nsep"></div>Which entries of the column are non-zero?',
        ask:{key:'m4-order', choices:['$c_{1}$ and $c_{3}$','$c_{0}$ and $c_{1}$','$c_{2}$ and $c_{3}$'], answer:0,
          why:'$H\\otimes I$ turns the left bit into $0$ or $1$ and keeps $q_{0}=1$: the strings are $01$ and $11$, entries $1$ and $3$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 4.5.2 -- */
{ id:'m4-cnot', module:'M4', nav:'The controlled-NOT', title:'The controlled-NOT, and why the control is not a spectator',
  objective:'Write the CNOT matrix for a stated control and target and use it in both bases.',
  keywords:'cnot controlled not gate control target matrix permutation phase kickback X basis conjugation entangling',
  src:'L7 · the CNOT gate', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 4 · Two-qubit gates'},
  {t:'title', text:'The controlled-NOT, and why the control is not a spectator'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figCnot(),
      caption:'The circuit symbol and the permutation it performs. $q_{0}$ is drawn at the top, so this is $\\mathrm{CNOT}_{0\\to 1}$: the filled dot is the control and the crossed circle the target.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Phase kickback, three chapters early', html:'The target was prepared in an eigenstate of $X$, so the gate wrote a phase onto the control instead. Chapter 6 uses exactly this, on a larger register.'}]},
  ], right:[
    {t:'eq', key:true, label:'CNOT', tex:'\\begin{aligned} &|c\\rangle|t\\rangle \\;\\longmapsto\\; |c\\rangle\\,|c\\oplus t\\rangle \\\\ &\\mathrm{CNOT}_{0\\to 1} = \\begin{bmatrix}1&0&0&0\\\\0&0&0&1\\\\0&0&1&0\\\\0&1&0&0\\end{bmatrix}, \\quad \\mathrm{CNOT}_{1\\to 0} = \\begin{bmatrix}1&0&0&0\\\\0&1&0&0\\\\0&0&0&1\\\\0&0&1&0\\end{bmatrix} \\end{aligned}',
      note:'The subscript reads control to target, in the basis order $|00\\rangle,|01\\rangle,|10\\rangle,|11\\rangle$. The first exchanges the second and fourth basis states, the second exchanges the third and fourth. A CNOT matrix without a named control and target is not yet a gate.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\mathrm{CNOT}_{0\\to 1}:\\quad |{-}\\rangle\\otimes\\left(\\alpha|0\\rangle+\\beta|1\\rangle\\right) \\;\\longmapsto\\; |{-}\\rangle\\otimes\\left(\\alpha|0\\rangle-\\beta|1\\rangle\\right)',
        note:'The target $q_{1}$ is in $|{-}\\rangle$. In the $|1\\rangle$ branch of the control the gate applies $X$, and $X|{-}\\rangle=-|{-}\\rangle$. The target comes out unchanged and the <b>control</b> has been hit with $Z$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$\\mathrm{CNOT}_{1\\to 0}$ acts on $|1\\rangle\\otimes|{+}\\rangle$, with $q_{1}=|1\\rangle$ the control.<div class="nsep"></div>What comes out?',
        ask:{key:'m4-cnot', choices:['$|1\\rangle\\otimes|{+}\\rangle$, unchanged','$|1\\rangle\\otimes|{-}\\rangle$','$\\tfrac{1}{\\sqrt2}\\left(|00\\rangle+|11\\rangle\\right)$'], answer:0,
          why:'The control is $1$, so $X$ acts on $q_{0}$, and $X|{+}\\rangle=|{+}\\rangle$. Flipping the target changes nothing.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 4.5.3 -- */
{ id:'m4-cz', module:'M4', nav:'The controlled-Z', title:'The controlled-Z: the same gate with no target',
  objective:'Write CZ and convert between it and CNOT with one Hadamard.',
  keywords:'controlled z gate cz symmetric diagonal locally equivalent hadamard conjugation native gate hardware',
  src:'L7 · the controlled-Z gate', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 4 · Two-qubit gates'},
  {t:'title', text:'The controlled-Z: the same gate with no target'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figCz(),
      caption:'Two dots and no target, which is how the symmetry is drawn. Exchanging the two wires leaves the picture and the matrix unchanged; that is not true of the CNOT.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'A diagonal gate is not harmless', html:'It changes no $Z$ probability, so it looks inert. But its phase is relative between branches, and one later Hadamard turns it into a difference in probability.'}]},
  ], right:[
    {t:'eq', key:true, label:'Controlled-Z', tex:'\\begin{aligned} \\mathrm{CZ} &= \\operatorname{diag}(1,\\,1,\\,1,\\,-1) \\\\ &= \\left(H\\otimes I\\right)\\,\\mathrm{CNOT}_{0\\to 1}\\,\\left(H\\otimes I\\right) \\end{aligned}',
      note:'It multiplies $|11\\rangle$ by $-1$ and moves no probability. It is symmetric in its two qubits, so "the control" is a habit, not a fact. $HXH=Z$ turns the flip on the target $q_{1}$ into a sign, so a machine with one of the two gates has both.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} \\mathrm{CZ}\\,|{+}\\rangle|{+}\\rangle &= \\tfrac12\\left(|00\\rangle+|01\\rangle+|10\\rangle-|11\\rangle\\right) \\\\ c_{0}c_{3}-c_{1}c_{2} &= -\\tfrac14-\\tfrac14 = -\\tfrac12 \\ne 0 \\end{aligned}',
        note:'Only the last term changes sign. The product test of chapter 3 fails, so the state is entangled: a gate that moves no probability at all has entangled two qubits.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$\\mathrm{CZ}$ acts on $|1\\rangle\\otimes|{+}\\rangle$.<div class="nsep"></div>What comes out?',
        ask:{key:'m4-cz', choices:['$|1\\rangle\\otimes|{-}\\rangle$','$|1\\rangle\\otimes|{+}\\rangle$','an entangled state'], answer:0,
          why:'$q_{1}=1$, so $Z$ acts on $q_{0}$ and turns $|{+}\\rangle$ into $|{-}\\rangle$. With a definite control the output is still a product.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 4.5.4 -- */
{ id:'m4-swap', module:'M4', nav:'The SWAP', title:'SWAP: three entangling gates to move nothing',
  objective:'Write the SWAP gate and build it from three CNOTs.',
  keywords:'swap gate exchange qubits three cnots connectivity routing transpilation coupling map cost depth',
  src:'L7 · the SWAP gate', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 4 · Two-qubit gates'},
  {t:'title', text:'SWAP: three entangling gates to move nothing'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figSwap(),
      caption:'The three gates, with the middle one running the other way. The alternation makes the product an exchange rather than a repeated flip.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Why SWAP costs real gates', html:'On a chip, only neighbours can interact. A compiler moves a qubit along the chip with SWAPs, and each is three CNOTs with real error. If only the names need exchanging, renumber instead: that is free.'}]},
  ], right:[
    {t:'eq', key:true, label:'SWAP', tex:'\\begin{aligned} \\mathrm{SWAP}\\,|q_{1}q_{0}\\rangle &= |q_{0}q_{1}\\rangle, \\qquad \\mathrm{SWAP} = \\begin{bmatrix}1&0&0&0\\\\0&0&1&0\\\\0&1&0&0\\\\0&0&0&1\\end{bmatrix} \\\\ \\mathrm{SWAP} &= \\mathrm{CNOT}_{0\\to 1}\\;\\mathrm{CNOT}_{1\\to 0}\\;\\mathrm{CNOT}_{0\\to 1} \\end{aligned}',
      note:'SWAP exchanges the middle two entries. It sends products to products, so it creates no entanglement. When CNOT is the native two-qubit gate, one SWAP costs three of them.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'|10\\rangle \\;\\xrightarrow{\\;0\\to 1\\;}\\; |10\\rangle \\;\\xrightarrow{\\;1\\to 0\\;}\\; |11\\rangle \\;\\xrightarrow{\\;0\\to 1\\;}\\; |01\\rangle',
        note:'In the order the gates run. The first has its control on $q_{0}=0$ and does nothing. The second flips $q_{0}$. The third flips $q_{1}$. The pair has been exchanged.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'SWAP acts on $|{+}\\rangle\\otimes|0\\rangle$, with $q_{1}$ in $|{+}\\rangle$.<div class="nsep"></div>What comes out?',
        ask:{key:'m4-swap', choices:['$\\tfrac{1}{\\sqrt2}\\left(|00\\rangle+|01\\rangle\\right)$','$\\tfrac{1}{\\sqrt2}\\left(|00\\rangle+|10\\rangle\\right)$','$\\tfrac{1}{\\sqrt2}\\left(|00\\rangle+|11\\rangle\\right)$'], answer:0,
          why:'The two qubits change places: $|0\\rangle\\otimes|{+}\\rangle$, which has $q_{1}=0$ in both terms. The input was $\\tfrac{1}{\\sqrt2}(|00\\rangle+|10\\rangle)$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- code --- */
{ id:'m4-code-twoqubit', module:'M4', nav:'Code · Two-qubit gates', title:'Two-qubit gates in code',
  objective:'Place a one-qubit gate on a named qubit, print the two CNOT matrices, and build CZ and SWAP from CNOTs.',
  keywords:'code qiskit numpy program qubit order kron cnot matrix control target cz swap run',
  slide:true, steps:0, budget:'a code page: the programs print their own results', blocks:[
  {t:'eyebrow', text:'Module 4 · Two-qubit gates'},
  {t:'title', text:'Two-qubit gates in code'},
  {t:'raw', html:()=>CODEBANK.page('m4-code-twoqubit')}
]},

/* ---------------------------------------------------------------- 4.6.1 -- */
{ id:'m4-entangle', module:'M4', nav:'Which gates entangle', title:'What a local gate cannot do, and what one CNOT can',
  objective:'Say why local gates cannot entangle and how much entanglement one CNOT makes.',
  keywords:'entangling gate local unitary schmidt coefficients invariant bell state preparation ebit cnot hadamard',
  src:'L7 · local gates, entangling gates and universality', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 4 · Entanglement from a gate'},
  {t:'title', text:'What a local gate cannot do, and what one CNOT can'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figEntangle(),
      caption:'How much entanglement one CNOT makes, against the tilt $\\theta$ of the control. Zero at both ends, where the input is a basis state, and one bit in the middle.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'A circuit is not proof of entanglement', html:'On real hardware the output is entangled only if the gates were good enough. Showing it needs readings in more than one basis, with the uncertainty reported.'}]},
  ], right:[
    {t:'eq', key:true, label:'Local gates', tex:'\\left(U_{A}\\otimes U_{B}\\right)\\sum_{k}\\sqrt{\\lambda_{k}}\\,|u_{k}\\rangle|v_{k}\\rangle = \\sum_{k}\\sqrt{\\lambda_{k}}\\,\\left(U_{A}|u_{k}\\rangle\\right)\\left(U_{B}|v_{k}\\rangle\\right)',
      note:'A local gate turns the two Schmidt bases of chapter 3 and leaves the $\\lambda_{k}$ alone, so the entropy cannot change. <b>No one-qubit work creates entanglement.</b> A gate that acts on both qubits at once is needed, and one CNOT is enough.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} |00\\rangle \\;\\xrightarrow{\\;I\\otimes R_{y}(\\theta)\\;}\\; &\\cos\\tfrac{\\theta}{2}|00\\rangle + \\sin\\tfrac{\\theta}{2}|01\\rangle \\\\ \\xrightarrow{\\;\\mathrm{CNOT}_{0\\to 1}\\;}\\; &\\cos\\tfrac{\\theta}{2}|00\\rangle + \\sin\\tfrac{\\theta}{2}|11\\rangle \\end{aligned}',
        note:'At $\\theta=90^{\\circ}$ this is $|\\Phi^{+}\\rangle$ and $S=1$ bit. At $\\theta=60^{\\circ}$, $\\lambda=0.75$ and $0.25$, so $S=0.8113$ bits. At $\\theta=0$ the same gate makes a product: a gate is entangling if it entangles <b>some</b> input.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'At $\\theta=60^{\\circ}$, a Hadamard is added on each qubit after the CNOT.<div class="nsep"></div>What is $S(\\rho_{A})$ now?',
        ask:{key:'m4-entangle', choices:['$0.8113$ bits, unchanged','$1$ bit','$0$ bits'], answer:0,
          why:'$H\\otimes H$ is a local gate, so the Schmidt coefficients $0.75$ and $0.25$ do not change, and neither does $S$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- 4.L2 --- */
{ id:'m4-lab-h', module:'M4', nav:'Laboratory H', title:'Laboratory H · The Bell circuit, and both halves of what it makes',
  objective:'Let the reader run the Bell circuit and watch the joint state and both reduced states.',
  keywords:'laboratory bell circuit hadamard cnot joint state reduced states entropy four bell states input bits',
  steps:0, slide:true, blocks:[
  {t:'eyebrow', text:'Module 4 · Entanglement from a gate'},
  {t:'title', text:'Laboratory H · The Bell circuit, and both halves of what it makes'},
  {t:'small', html:'Two input bits, one tilt and one phase, and the circuit of the last scene. The left panel is the joint state at the chosen stage, drawn as the four amplitudes; the right panel is the entanglement against the tilt. The readout carries both reduced states. Three things to find: the four input bit patterns give the four Bell states, the phase control moves the joint state without changing the entanglement at all, and there is exactly one tilt at which the output is a product.'},
  {t:'lab', id:'H'}
]},

/* ---------------------------------------------------------------- code --- */
{ id:'m4-code-entangle', module:'M4', nav:'Code · Entanglement from a gate', title:'Entanglement from a gate in code',
  objective:'Measure the entanglement one CNOT makes against the tilt it is handed, and check that a local gate cannot change it.',
  keywords:'code qiskit numpy program cnot entanglement entropy schmidt local gate bell states run',
  slide:true, steps:0, budget:'a code page: the programs print their own results', blocks:[
  {t:'eyebrow', text:'Module 4 · Entanglement from a gate'},
  {t:'title', text:'Entanglement from a gate in code'},
  {t:'raw', html:()=>CODEBANK.page('m4-code-entangle')}
]},

/* ---------------------------------------------------------------- 4.7.1 -- */
{ id:'m4-univ', module:'M4', nav:'Universality', title:'What a universal gate set promises, and what it does not',
  objective:'State a universal gate set and say what universality costs in circuit length.',
  keywords:'universal gate set clifford T solovay kitaev approximation exact synthesis discrete continuous cost',
  src:'L7 · local gates, entangling gates and universality', steps:3, slide:true, blocks:[
  {t:'eyebrow', text:'Module 4 · Universality'},
  {t:'title', text:'What a universal gate set promises, and what it does not'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>figUniv(),
      caption:'The two claims. The exact one needs every one-qubit gate; the approximate one needs four gates and a length budget. Both need one entangling gate.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Universal does not mean fast', html:'Every unitary can be approximated, but almost none by a <b>short</b> circuit: a generic $n$-qubit unitary needs a circuit exponential in $n$. Universality makes a machine programmable, not fast.'}]},
  ], right:[
    {t:'eq', key:true, label:'Two statements', tex:'\\begin{aligned} \\left\\{\\text{one-qubit gates}\\right\\} \\cup \\left\\{\\mathrm{CNOT}\\right\\} \\;&\\Longrightarrow\\; \\text{every unitary, exactly} \\\\ \\left\\{H,\\;S,\\;T,\\;\\mathrm{CNOT}\\right\\} \\;&\\Longrightarrow\\; \\text{every unitary, to any } \\varepsilon > 0 \\end{aligned}',
      note:'Four fixed gates make only countably many circuits, and the unitaries are not countable, so the second claim can only be approximate. The Solovay&#8211;Kitaev result says the length grows like a power of $\\log(1/\\varepsilon)$: accuracy is bought with depth.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Example', tex:'\\begin{aligned} S\\,X\\,S^{\\dagger} &= Y \\\\ T\\,X\\,T^{\\dagger} &= \\tfrac{1}{\\sqrt2}\\left(X+Y\\right) \\end{aligned}',
        note:'$H$, $S$ and CNOT send Pauli operators to Pauli operators. They form the Clifford group, and Clifford circuits can be simulated classically. $T$ sends $X$ to a mixture of two Paulis: it is the cheapest gate that leaves the group.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'A machine offers only $H$, $S$ and CNOT.<div class="nsep"></div>Is its gate set universal?',
        ask:{key:'m4-univ', choices:['No: every circuit is a Clifford circuit','Yes, exactly','Yes, to any accuracy'], answer:0,
          why:'Every product of these gates sends Paulis to Paulis, so no circuit can come close to $T$. Adding $T$ is what makes the set universal.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- code --- */
{ id:'m4-code-univ', module:'M4', nav:'Code · Universality', title:'Universality in code',
  objective:'Approximate a rotation with a word in H and T, watch the error fall as the word grows, and see T leave the Clifford group.',
  keywords:'code qiskit numpy program clifford T approximation error solovay kitaev universality run',
  slide:true, steps:0, budget:'a code page: the programs print their own results', blocks:[
  {t:'eyebrow', text:'Module 4 · Universality'},
  {t:'title', text:'Universality in code'},
  {t:'raw', html:()=>CODEBANK.page('m4-code-univ')}
]},

/* ---------------------------------------------------------------- 4.8.1 -- */
{ id:'m4-synth', module:'M4', nav:'Summary', title:'What this chapter leaves you with',
  objective:'Collect the objects this chapter added and the four errors it exists to prevent.',
  keywords:'summary module 4 review bloch sphere rotation gates euler cnot cz swap order universality clifford',
  steps:2, blocks:[
  {t:'eyebrow', text:'Module 4 · Summary'},
  {t:'title', text:'What this chapter leaves you with'},
  {t:'fig', frame:true, svg:()=>figLadder(),
    caption:'The chapter as one ladder. A qubit becomes a point, a gate becomes a motion of that point, a circuit becomes a sequence of motions, and a pair needs one gate that no sequence of single motions can imitate.'},
  {t:'grid', cols:4, gap:'20px', items:[
    [{t:'card', head:'The picture', items:[
      {t:'small', html:'$\\cos\\frac{\\theta}{2}|0\\rangle+e^{i\\varphi}\\sin\\frac{\\theta}{2}|1\\rangle$ sits at $\\mathbf{r}=(\\sin\\theta\\cos\\varphi,\\sin\\theta\\sin\\varphi,\\cos\\theta)$. Opposite points are orthogonal states: $|\\langle\\chi|\\psi\\rangle|^{2}=\\cos^{2}(\\Theta/2)$.'}]}],
    [{t:'card', head:'One-qubit gates', items:[
      {t:'small', html:'$R_{\\mathbf{n}}(\\alpha)$ turns $\\mathbf{r}$ about $\\mathbf{n}$ by $\\alpha$. Each Pauli is a half turn, $H$ a half turn about $(\\hat{x}+\\hat{z})/\\sqrt2$, $P(\\varphi)$ a turn about $z$. Three turns and a phase reach every gate.'}]}],
    [{t:'card', head:'Two qubits', items:[
      {t:'small', html:'$|q_{1}q_{0}\\rangle$ with $x=2q_{1}+q_{0}$; a gate on one qubit is $A\\otimes I$ or $I\\otimes A$. CNOT permutes, CZ writes a phase, SWAP costs three CNOTs, and a circuit reads left to right while its matrices multiply right to left.'}]}],
    [{t:'card', head:'What is enough', items:[
      {t:'small', html:'No local gate changes the Schmidt coefficients, so one entangling gate is needed and one is enough. Every one-qubit gate plus CNOT is exactly universal; $H,S,T$ and CNOT reach any accuracy, paid for in depth.'}]}]
  ]},
  {t:'reveal', at:1, items:[
    {t:'grid', cols:2, gap:'24px', items:[
      [{t:'note', kind:'ok', head:'Six lines to be able to write without looking', html:'$\\mathbf{r}=(\\sin\\theta\\cos\\varphi,\\sin\\theta\\sin\\varphi,\\cos\\theta)$ &nbsp;·&nbsp; $R_{\\mathbf{n}}(\\alpha)=e^{-i\\alpha\\mathbf{n}\\cdot\\boldsymbol\\sigma/2}$ &nbsp;·&nbsp; $H=(X+Z)/\\sqrt2$ &nbsp;·&nbsp; $U=e^{i\\alpha}R_{z}(\\phi)R_{y}(\\theta)R_{z}(\\lambda)$ &nbsp;·&nbsp; $|c\\rangle|t\\rangle\\mapsto|c\\rangle|c\\oplus t\\rangle$ &nbsp;·&nbsp; $\\mathrm{CZ}=(H\\otimes I)\\,\\mathrm{CNOT}_{0\\to 1}\\,(H\\otimes I)$.'}],
      [{t:'note', kind:'warn', head:'Four errors that cost a whole question', html:'Reading the angle inside a rotation as the angle on the sphere, always wrong by two. Multiplying a circuit left to right. Dropping a global phase from a gate about to be controlled. And applying a one-qubit gate to the other qubit of a pair.'}]
    ]}
  ]},
  {t:'reveal', at:2, items:[
    {t:'note', kind:'def', head:'What comes next', html:'Chapter 5 runs these gates: how a circuit is executed, what a shot count buys against an exact statevector, and what a compiler does before the machine sees it. Then two protocols end to end, teleportation and Grover, using nothing beyond the gates written down here.'}
  ]}
]},

/* ---------------------------------------------------------------- 4.8.2 -- */
{ id:'m4-shapes', module:'M4', nav:'The shapes of question', title:'The shapes of question this chapter sets',
  objective:'Name the recurring question types of chapter 4 and the method each is answered by.',
  keywords:'question types taxonomy shapes method examination practice bloch rotation sequence decomposition two qubit',
  steps:1, blocks:[
  {t:'eyebrow', text:'Module 4 · Summary and practice'},
  {t:'title', text:'The shapes of question this chapter sets'},
  {t:'small', html:'Six shapes keep coming back, and a seventh — a <b>full-length question</b> — puts three to five of them in one statement, usually as one circuit followed from its input to a reported probability. Name the shape before starting; the method for each is fixed.'},
  {t:'grid', cols:3, gap:'22px', items:[
    [{t:'drilltypes', module:'M4', from:0, to:2}],
    [{t:'drilltypes', module:'M4', from:2, to:4}],
    [{t:'drilltypes', module:'M4', from:4, to:6}]
  ]},
  {t:'reveal', at:1, items:[
    {t:'note', kind:'ok', head:'The check that catches most of it', html:'A Bloch vector of a pure state has length one, a gate matrix has orthonormal columns, a rotation never changes the length of anything, probabilities add to one, and a local gate never changes an entanglement entropy. Five one-line tests, and between them they catch nearly every slip this chapter can produce.'}
  ]}
]}

];

window.SCENES_M4 = SC;
})();
