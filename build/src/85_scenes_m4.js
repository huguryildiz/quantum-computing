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

/* A circuit runs left to right and its matrices multiply right to left. The
   whole figure exists to put those two orders side by side. */
function figTime(){
  return P.blocks({w:760,h:236,items:[
    {t:'line',d:'M60,74 H660',color:C.rule},
    {t:'box',x:150,y:50,w:70,h:48,label:'U_{1}',tex:true,fs:16,color:C.in},
    {t:'box',x:320,y:50,w:70,h:48,label:'U_{2}',tex:true,fs:16,color:C.h},
    {t:'box',x:490,y:50,w:70,h:48,label:'U_{3}',tex:true,fs:16,color:C.out},
    {t:'text',x:60,y:32,anchor:'start',label:'time runs this way',fs:12},
    {t:'arrow',x1:220,y1:28,x2:340,y2:28},
    {t:'text',x:380,y:150,label:'|\\psi_{\\text{out}}\\rangle = U_{3}\\,U_{2}\\,U_{1}\\,|\\psi_{\\text{in}}\\rangle',tex:true,fs:19},
    {t:'text',x:380,y:186,label:'the gate written last is applied first',fs:12.5},
    {t:'text',x:380,y:214,label:'a ket is eaten from the right, so the product is read backwards',fs:12}
  ]});
}

/* Any one-qubit gate as three turns: spin, tilt, spin. */
function figEuler(){
  return P.blocks({w:760,h:222,items:[
    {t:'box',x:40,y:56,w:120,h:56,label:'R_{z}(\\lambda)',tex:true,fs:16,color:C.in},
    {t:'arrow',x1:160,y1:84,x2:220,y2:84},
    {t:'box',x:220,y:56,w:120,h:56,label:'R_{y}(\\theta)',tex:true,fs:16,color:C.h},
    {t:'arrow',x1:340,y1:84,x2:400,y2:84},
    {t:'box',x:400,y:56,w:120,h:56,label:'R_{z}(\\phi)',tex:true,fs:16,color:C.in},
    {t:'arrow',x1:520,y1:84,x2:580,y2:84},
    {t:'box',x:580,y:56,w:140,h:56,label:'e^{i\\alpha}',tex:true,fs:16,color:C.mid},
    {t:'text',x:100,y:140,label:'spin',fs:12.5},
    {t:'text',x:280,y:140,label:'tilt',fs:12.5},
    {t:'text',x:460,y:140,label:'spin again',fs:12.5},
    {t:'text',x:650,y:140,label:'unobservable',fs:12.5},
    {t:'text',x:380,y:186,label:'applied left to right in time, so the matrix product is written the other way round',fs:12},
    {t:'text',x:380,y:212,label:'three angles fix the rotation; the fourth is the phase nobody can see',fs:12}
  ]});
}

/* The one-qubit gate a compiler actually calibrates, with each entry named. */
function figU(){
  return P.blocks({w:760,h:250,items:[
    {t:'box',x:210,y:46,w:170,h:70,label:'\\cos\\frac{\\theta}{2}',tex:true,fs:17,color:C.in},
    {t:'box',x:380,y:46,w:170,h:70,label:'-e^{i\\lambda}\\sin\\frac{\\theta}{2}',tex:true,fs:17,color:C.mid},
    {t:'box',x:210,y:116,w:170,h:70,label:'e^{i\\phi}\\sin\\frac{\\theta}{2}',tex:true,fs:17,color:C.mid},
    {t:'box',x:380,y:116,w:170,h:70,label:'e^{i(\\phi+\\lambda)}\\cos\\frac{\\theta}{2}',tex:true,fs:17,color:C.in},
    {t:'text',x:295,y:36,label:'|0\\rangle',tex:true,fs:13},
    {t:'text',x:465,y:36,label:'|1\\rangle',tex:true,fs:13},
    {t:'text',x:200,y:88,anchor:'end',label:'\\langle 0|',tex:true,fs:13},
    {t:'text',x:200,y:158,anchor:'end',label:'\\langle 1|',tex:true,fs:13},
    {t:'text',x:600,y:80,anchor:'start',label:'one tilt angle',fs:12},
    {t:'text',x:600,y:104,anchor:'start',label:'and two phases',fs:12},
    {t:'text',x:380,y:224,label:'three numbers, and every one-qubit gate is in here somewhere',fs:12}
  ]});
}

/* Why a classical gate cannot be run backwards, and what fixes it. */
function figRev(){
  return P.blocks({w:760,h:250,items:[
    {t:'box',x:60,y:56,w:150,h:70,label:'\\mathrm{AND}',tex:true,fs:16,color:C.err},
    {t:'text',x:50,y:78,anchor:'end',label:'a',tex:true,fs:14},
    {t:'text',x:50,y:112,anchor:'end',label:'b',tex:true,fs:14},
    {t:'arrow',x1:210,y1:91,x2:270,y2:91},
    {t:'text',x:284,y:96,anchor:'start',label:'ab',tex:true,fs:14},
    {t:'text',x:135,y:160,label:'four inputs, two outputs',fs:12},
    {t:'text',x:135,y:184,label:'two inputs are erased',fs:12,color:C.err},
    {t:'box',x:470,y:56,w:150,h:70,label:'\\mathrm{CNOT}',tex:true,fs:16,color:C.out},
    {t:'text',x:460,y:78,anchor:'end',label:'a',tex:true,fs:14},
    {t:'text',x:460,y:112,anchor:'end',label:'b',tex:true,fs:14},
    {t:'arrow',x1:620,y1:78,x2:672,y2:78},
    {t:'arrow',x1:620,y1:112,x2:672,y2:112},
    {t:'text',x:686,y:83,anchor:'start',label:'a',tex:true,fs:14},
    {t:'text',x:686,y:117,anchor:'start',label:'a\\oplus b',tex:true,fs:14},
    {t:'text',x:545,y:160,label:'four inputs, four outputs',fs:12},
    {t:'text',x:545,y:184,label:'a relabelling, so it undoes itself',fs:12,color:C.out},
    {t:'text',x:380,y:226,label:'a unitary gate has to be the second kind, and the first kind has to be embedded in it',fs:12}
  ]});
}

/* Computing into an ancilla, copying the answer out, and running the work
   backwards so nothing is left entangled. */
function figUncompute(){
  return P.blocks({w:760,h:236,items:[
    {t:'line',d:'M50,50 H710',color:C.rule},
    {t:'line',d:'M50,96 H710',color:C.rule},
    {t:'line',d:'M50,142 H710',color:C.rule},
    {t:'text',x:40,y:55,anchor:'end',label:'x',tex:true,fs:14},
    {t:'text',x:40,y:101,anchor:'end',label:'0',tex:true,fs:14},
    {t:'text',x:40,y:147,anchor:'end',label:'y',tex:true,fs:14},
    {t:'box',x:110,y:32,w:110,h:84,label:'V_{f}',tex:true,fs:16,color:C.h},
    {t:'box',x:330,y:78,w:110,h:84,label:'\\mathrm{copy}',tex:true,fs:15,color:C.mid},
    {t:'box',x:540,y:32,w:110,h:84,label:'V_{f}^{\\dagger}',tex:true,fs:16,color:C.h},
    {t:'text',x:165,y:190,label:'compute',fs:12},
    {t:'text',x:385,y:190,label:'copy out',fs:12},
    {t:'text',x:595,y:190,label:'uncompute',fs:12},
    {t:'text',x:380,y:220,label:'the middle wire leaves as it arrived, so nothing carries a record of the work',fs:12}
  ]});
}

/* Two qubits: which entry belongs to which pair of bits, and what a gate on
   one of them alone looks like. */
function figOrder(){
  const rows = [['|00\\rangle','c_{0}'],['|01\\rangle','c_{1}'],
                ['|10\\rangle','c_{2}'],['|11\\rangle','c_{3}']];
  const items = [];
  rows.forEach(([k,c],i)=>{
    const y = 26 + i*44;
    items.push({t:'text',x:150,y:y+28,anchor:'end',label:k,tex:true,fs:15});
    items.push({t:'box',x:168,y:y,w:96,h:38,label:c,tex:true,fs:15,
      color:i===2?C.out:C.mid});
  });
  items.push({t:'text',x:206,y:18,label:'x = 2q_{1}+q_{0}',tex:true,fs:13});
  items.push({t:'text',x:470,y:48,anchor:'middle',label:'\\left(I\\otimes X\\right)|10\\rangle = |11\\rangle',tex:true,fs:16});
  items.push({t:'text',x:470,y:78,anchor:'middle',label:'acts on the right qubit',fs:12});
  items.push({t:'text',x:470,y:132,anchor:'middle',label:'\\left(X\\otimes I\\right)|10\\rangle = |00\\rangle',tex:true,fs:16});
  items.push({t:'text',x:470,y:162,anchor:'middle',label:'acts on the left qubit',fs:12});
  items.push({t:'text',x:470,y:206,anchor:'middle',label:'same gate, same qubit count, two different states',fs:12,color:C.err});
  return P.blocks({w:760,h:222,items});
}

/* The controlled-NOT: the circuit symbol, and the permutation it performs. */
function figCnot(){
  const items = [
    {t:'line',d:'M60,52 H300',color:C.rule},
    {t:'line',d:'M60,120 H300',color:C.rule},
    {t:'line',d:'M180,52 V120',color:C.h},
    {t:'text',x:50,y:57,anchor:'end',label:'q_{0}',tex:true,fs:14},
    {t:'text',x:50,y:125,anchor:'end',label:'q_{1}',tex:true,fs:14},
    {t:'text',x:180,y:170,label:'control on top, target below',fs:12},
    {t:'text',x:180,y:196,label:'the filled dot is the control',fs:12}
  ];
  const maps = [['|00\\rangle','|00\\rangle',C.mid],['|01\\rangle','|11\\rangle',C.out],
                ['|10\\rangle','|10\\rangle',C.mid],['|11\\rangle','|01\\rangle',C.out]];
  maps.forEach(([a,b],i)=>{
    const y = 40 + i*42;
    items.push({t:'text',x:430,y,anchor:'end',label:a,tex:true,fs:15});
    items.push({t:'arrow',x1:442,y1:y-5,x2:500,y2:y-5});
    items.push({t:'text',x:512,y,anchor:'start',label:b,tex:true,fs:15});
  });
  items.push({t:'text',x:490,y:222,label:'the left digit flips exactly when the right one is one',fs:12});
  return P.blocks({w:760,h:236,items:items.concat([
    {t:'dot',x:180,y:52,r:7,color:C.h},
    {t:'line',d:'M166,120 a14,14 0 1,0 28,0 a14,14 0 1,0 -28,0',color:C.h},
    {t:'line',d:'M180,106 V134',color:C.h},
    {t:'line',d:'M166,120 H194',color:C.h}
  ])});
}

/* The controlled-Z, and the one identity that turns it into a CNOT. */
function figCz(){
  return P.blocks({w:760,h:222,items:[
    {t:'line',d:'M60,50 H250',color:C.rule},
    {t:'line',d:'M60,112 H250',color:C.rule},
    {t:'line',d:'M155,50 V112',color:C.h},
    {t:'dot',x:155,y:50,r:7,color:C.h},
    {t:'dot',x:155,y:112,r:7,color:C.h},
    {t:'text',x:155,y:150,label:'two dots, no target',fs:12},
    {t:'text',x:155,y:176,label:'exchanging the two wires changes nothing',fs:12},
    {t:'text',x:520,y:56,anchor:'middle',
      label:'\\mathrm{CZ} = \\operatorname{diag}(1,1,1,-1)',tex:true,fs:17},
    {t:'text',x:520,y:110,anchor:'middle',
      label:'\\mathrm{CZ} = (H\\otimes I)\\,\\mathrm{CNOT}_{0\\to 1}\\,(H\\otimes I)',tex:true,fs:16},
    {t:'text',x:520,y:150,anchor:'middle',label:'one Hadamard on each side of the target',fs:12},
    {t:'text',x:520,y:186,anchor:'middle',label:'so a machine that has one of them has both',fs:12}
  ]});
}

/* SWAP out of three CNOTs, with the alternating control. */
function figSwap(){
  const wire = y => ({t:'line',d:`M60,${y} H640`,color:C.rule});
  const dot = (x,y) => ({t:'dot',x,y,r:7,color:C.h});
  const targ = (x,y) => ([{t:'line',d:`M${x-14},${y} a14,14 0 1,0 28,0 a14,14 0 1,0 -28,0`,color:C.h},
                          {t:'line',d:`M${x},${y-14} V${y+14}`,color:C.h},
                          {t:'line',d:`M${x-14},${y} H${x+14}`,color:C.h}]);
  const link = (x) => ({t:'line',d:`M${x},50 V120`,color:C.h});
  return P.blocks({w:760,h:222,items:[wire(50),wire(120),
    link(180),dot(180,50),...targ(180,120),
    link(330),dot(330,120),...targ(330,50),
    link(480),dot(480,50),...targ(480,120),
    {t:'text',x:40,y:55,anchor:'end',label:'q_{0}',tex:true,fs:14},
    {t:'text',x:40,y:125,anchor:'end',label:'q_{1}',tex:true,fs:14},
    {t:'text',x:660,y:55,anchor:'start',label:'q_{1}',tex:true,fs:14},
    {t:'text',x:660,y:125,anchor:'start',label:'q_{0}',tex:true,fs:14},
    {t:'text',x:330,y:172,label:'the middle one runs the other way',fs:12},
    {t:'text',x:330,y:200,label:'three two-qubit gates to move one state one step across a chip',fs:12}
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

/* What a universal set is, and what the word does not promise. */
function figUniv(){
  return P.blocks({w:760,h:236,items:[
    {t:'box',x:40,y:44,w:200,h:60,label:'\\text{every one-qubit gate}',tex:true,fs:14,color:C.in},
    {t:'box',x:40,y:124,w:200,h:60,label:'\\mathrm{CNOT}',tex:true,fs:16,color:C.h},
    {t:'arrow',x1:240,y1:74,x2:320,y2:104},
    {t:'arrow',x1:240,y1:154,x2:320,y2:114},
    {t:'box',x:320,y:84,w:190,h:60,label:'\\text{every unitary, exactly}',tex:true,fs:14,color:C.out},
    {t:'box',x:540,y:44,w:180,h:60,label:'H,\\;S,\\;\\mathrm{CNOT},\\;T',tex:true,fs:15,color:C.mid},
    /* A plain connector rather than an arrow: the arrowhead in `blocks` always
       points right, so a vertical arrow draws a head at ninety degrees to its
       own line. The reading order here is unambiguous without one. */
    {t:'line',d:'M630,104 V134',color:C.ink},
    {t:'text',x:648,y:124,anchor:'start',label:'gives',fs:12},
    {t:'box',x:540,y:134,w:180,h:60,label:'\\text{every unitary, to }\\varepsilon',tex:true,fs:14,color:C.out},
    {t:'text',x:380,y:214,label:'the discrete set buys accuracy with length, and the length is what a budget pays for',fs:12}
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
  src:'L7 · pure qubit states and the Bloch sphere', steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · The Bloch sphere'},
  {t:'title', text:'The two angles of a qubit, and why one of them is halved'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Start from any normalised qubit state and use the freedom of chapter 1: multiply by whatever global phase makes the first amplitude real and not negative. What is left is one real number in the first amplitude and one phase in the second.</p>'},
    {t:'eq', key:true, tex:'|\\psi(\\theta,\\varphi)\\rangle = \\cos\\frac{\\theta}{2}\\,|0\\rangle + e^{i\\varphi}\\sin\\frac{\\theta}{2}\\,|1\\rangle, \\qquad 0\\le\\theta\\le\\pi, \\quad 0\\le\\varphi<2\\pi'},
    {t:'body', html:'<p>The three Pauli means of chapter 3 then have one line each, and together they are a point of the unit sphere:</p>'},
    {t:'eq', key:true, tex:'\\mathbf{r} = \\left(\\sin\\theta\\cos\\varphi,\\;\\sin\\theta\\sin\\varphi,\\;\\cos\\theta\\right), \\qquad |\\mathbf{r}| = 1'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'The half angle is the whole reason this works. The state must come back to itself after $\\theta$ has gone round once, and the vector must come back after $\\theta$ has gone round once as well — but a state and its negative are the same state, so the state may take two turns while the vector takes one. Halving the angle in the amplitudes is what arranges that.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figSphere(),
      caption:'One state on the sphere. The plane of the page is the $x$&#8211;$z$ plane and is drawn undistorted, so the outline is a true circle and $\\theta$ is drawn at its real size; the $y$ direction is foreshortened, which is what makes the equator an ellipse. The north pole is $|0\\rangle$ and the south pole is $|1\\rangle$.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', '$\\theta=60^{\\circ}$ and $\\varphi=135^{\\circ}$.'],
        ['Work', '$\\cos 30^{\\circ}=0.8660$ and $\\sin 30^{\\circ}=0.5$, so $|\\psi\\rangle = 0.8660\\,|0\\rangle + 0.5\\,e^{i3\\pi/4}|1\\rangle$.'],
        ['Answer', '$\\cos 135^{\\circ}=-0.7071$ and $\\sin 135^{\\circ}=0.7071$, so $\\mathbf{r}=(-0.6124,\\,0.6124,\\,0.5)$.'],
        ['Check', '$0.6124^{2}+0.6124^{2}+0.5^{2}=0.375+0.375+0.25=1$, so the point is on the surface, as a pure state must be. And $p(0)=\\cos^{2}30^{\\circ}=0.75$, which is $\\tfrac12(1+r_{z})$.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'At a pole the azimuth means nothing', html:'At $\\theta=0$ the state is $|0\\rangle$ whatever $\\varphi$ is, because $\\sin 0 = 0$ leaves nothing for the phase to multiply. The two angles are coordinates on a sphere and, like latitude and longitude, they are degenerate at the poles. Reporting a phase for a state at the north pole is reporting a number the experiment cannot contain.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 4.1.2 -- */
{ id:'m4-cardinal', module:'M4', nav:'The six states', title:'Six states worth knowing by their positions',
  objective:'Place the six eigenstates of the Pauli operators on the sphere and read a Bloch vector back into a state.',
  keywords:'cardinal states eigenstates pauli plus minus plus i basis axes positions poles equator six points',
  src:'L7 · computational, X and Y basis states', steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · The Bloch sphere'},
  {t:'title', text:'Six states worth knowing by their positions'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Six states carry most of a first course, and they are the two eigenstates of each Pauli operator. On the sphere they are the six points where the axes meet the surface:</p>'},
    {t:'eq', key:true, tex:'\\begin{aligned}|0\\rangle,\;|1\\rangle \;&\\longleftrightarrow\; \\pm\\hat{z} \\\\ |{+}\\rangle,\;|{-}\\rangle \;&\\longleftrightarrow\; \\pm\\hat{x} \\\\ |{+}i\\rangle,\;|{-}i\\rangle \;&\\longleftrightarrow\; \\pm\\hat{y}\\end{aligned}'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'Each pair is one measurement basis, and each pair sits at the two ends of one axis. That is not a coincidence to be memorised: the two eigenstates of an observable are orthogonal, and the next scene shows that orthogonal states are exactly the opposite points.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figCardinal(),
      caption:'The six states. The frame is isotropic, so a pair that looks opposite on the page really is opposite in the data, and the three axes really are at right angles inside the plane of the page.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', 'A qubit reported as $\\mathbf{r}=(0,\\,-1,\\,0)$.'],
        ['Work', 'The length is one, so the state is pure. It is on the $-\\hat{y}$ axis, so $\\theta=90^{\\circ}$ and $\\varphi=270^{\\circ}$.'],
        ['Answer', '$|\\psi\\rangle = \\tfrac{1}{\\sqrt2}\\left(|0\\rangle - i|1\\rangle\\right) = |{-}i\\rangle$.'],
        ['Check', '$\\langle Y\\rangle$ for that state is $-1$, and $\\langle X\\rangle=\\langle Z\\rangle=0$. So a $Y$ measurement is certain and the other two are fair coins, which is what a point on the $y$ axis says.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'Superposition is a statement about a basis, not about a state', html:'$|{+}\\rangle$ is a superposition in the $Z$ basis and an eigenstate in the $X$ basis. Nothing distinguishes the $z$ axis on this sphere except the habit of measuring along it. Saying a qubit "is in a superposition" without naming the basis says nothing at all about it.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 4.1.3 -- */
{ id:'m4-overlap', module:'M4', nav:'Angles and overlaps', title:'Opposite means orthogonal, and a right angle means a coin',
  objective:'Use the overlap formula to turn an angle on the sphere into a probability.',
  keywords:'overlap fidelity angle between bloch vectors antipodal orthogonal half angle distinguishability coin',
  src:'L7 · pure qubit states and the Bloch sphere', steps:2, blocks:[
  {t:'eyebrow', text:'Module 4 · The Bloch sphere'},
  {t:'title', text:'Opposite means orthogonal, and a right angle means a coin'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>One formula turns the picture into probabilities. For two pure states with Bloch vectors $\\mathbf{r}$ and $\\mathbf{s}$, separated on the sphere by an angle $\\Theta$:</p>'},
    {t:'eq', key:true, tex:'\\left|\\langle\\chi|\\psi\\rangle\\right|^{2} = \\frac{1+\\mathbf{r}\\cdot\\mathbf{s}}{2} = \\cos^{2}\\frac{\\Theta}{2}'},
    {t:'body', html:'<p>It follows in one line from chapter 3: $\\left|\\langle\\chi|\\psi\\rangle\\right|^{2}=\\operatorname{Tr}(\\rho_{\\psi}\\rho_{\\chi})$, and multiplying out $\\tfrac12(I+\\mathbf{r}\\cdot\\boldsymbol\\sigma)$ with $\\tfrac12(I+\\mathbf{s}\\cdot\\boldsymbol\\sigma)$ leaves the dot product.</p>'},
    {t:'reveal', at:1, items:[
      {t:'wex', rows:[
        ['Given', '$|0\\rangle$ at $+\\hat{z}$ and $|{+}\\rangle$ at $+\\hat{x}$.'],
        ['Work', 'The two are at $\\Theta=90^{\\circ}$, so $\\mathbf{r}\\cdot\\mathbf{s}=0$.'],
        ['Answer', '$\\left|\\langle {+}|0\\rangle\\right|^{2} = \\tfrac12(1+0) = 0.5$.'],
        ['Check', 'Directly: $\\langle {+}|0\\rangle = 1/\\sqrt2$, squared is $0.5$. Now $|0\\rangle$ and $|1\\rangle$, at $\\Theta=180^{\\circ}$: $\\tfrac12(1-1)=0$, and they are orthogonal.']
      ]}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figHalf(),
      caption:'The overlap against the angle on the sphere. It is one half at a right angle and reaches zero only at the far side, which is exactly what the half angle in the amplitudes is there to produce.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Right angles on the sphere are not orthogonality', html:'The word is the same and the meaning is not. Two states are orthogonal — perfectly distinguishable in one measurement — exactly when their points are <b>opposite</b>. Two points at a right angle on the sphere are as hard to tell apart as a coin toss allows. Reading the geometry with the wrong meaning of the word is the fastest way to lose a whole question.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 4.1.4 -- */
{ id:'m4-glob', module:'M4', nav:'Global against relative phase', title:'One phase moves nothing, the other moves everything',
  objective:'Say which phase changes the Bloch vector and demonstrate it on a pair of states.',
  keywords:'global phase relative phase azimuth unobservable interference distinguishable density operator picture',
  src:'L7 · global phase, relative phase and the double cover', steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · The Bloch sphere'},
  {t:'title', text:'One phase moves nothing, the other moves everything'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>The rule stated in chapter 1 and proved in chapter 3 is now a fact about a drawing. Multiplying the whole state by a phase leaves $\\rho$ alone, so it leaves the point alone; putting a phase between the two amplitudes moves the point round the equator by exactly that angle.</p>'},
    {t:'eq', key:true, tex:'e^{i\\gamma}|\\psi\\rangle \\longmapsto \\text{the same } \\mathbf{r}, \\qquad \\cos\\tfrac{\\theta}{2}|0\\rangle + e^{i\\varphi}\\sin\\tfrac{\\theta}{2}|1\\rangle \\longmapsto \\varphi'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'The two look alike on paper and are opposite in effect. A global phase is a change of nothing; a relative phase carries the state a definite distance round the equator, and at $\\varphi=\\pi$ it has carried $|{+}\\rangle$ all the way to $|{-}\\rangle$, which is a perfectly distinguishable state.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figGlobal(),
      caption:'The equator, seen from above the north pole. A global phase does not move the teal point at all, whatever $\\gamma$ is. A relative phase $\\varphi$ carries it round by exactly $\\varphi$, and the frame is isotropic so that angle is drawn true.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', 'The three states $|{+}\\rangle$, $i|{+}\\rangle$ and $|{-}\\rangle$.'],
        ['Work', '$i|{+}\\rangle$ multiplies both amplitudes by $i$; $|{-}\\rangle$ multiplies only the second by $-1$.'],
        ['Answer', 'The first two are one state at $\\mathbf{r}=(1,0,0)$; the third is at $\\mathbf{r}=(-1,0,0)$.'],
        ['Check', 'An $X$ measurement separates the first from the third every time and never separates the first from the second.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'A global phase becomes relative the moment the qubit is controlled', html:'It is unobservable only while the state is the whole of what is there. Put the same qubit under a control — apply the phase to the branch where the control is $|1\\rangle$ and not to the branch where it is $|0\\rangle$ — and the phase is now <b>between two branches</b>, which is a relative phase and is fully observable on the control. Every algorithm in chapter 6 lives on this one move.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 4.1.5 -- */
{ id:'m4-cover', module:'M4', nav:'Two turns to come back', title:'The state needs two full turns and the vector needs one',
  objective:'Show that a full rotation returns minus the identity and say when that sign is observable.',
  keywords:'double cover su2 so3 spinor two pi rotation minus identity four pi controlled phase observable',
  src:'L7 · global phase, relative phase and the double cover', steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · The Bloch sphere'},
  {t:'title', text:'The state needs two full turns and the vector needs one'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Take the rotation the next section derives and put a full turn into it. The angle is halved inside, so a turn of $2\\pi$ on the sphere is a turn of $\\pi$ in the amplitudes:</p>'},
    {t:'eq', tex:'R_{\\mathbf{n}}(\\alpha) = \\cos\\frac{\\alpha}{2}\\,I - i\\sin\\frac{\\alpha}{2}\\,\\mathbf{n}\\cdot\\boldsymbol\\sigma'},
    {t:'eq', key:true, tex:'R_{\\mathbf{n}}(2\\pi) = -I, \\qquad R_{\\mathbf{n}}(4\\pi) = +I'},
    {t:'body', html:'<p>The Bloch vector is back where it started after $2\\pi$ — it has to be, it is an ordinary vector being turned in ordinary space. The state is not: it has picked up a minus sign, and only after a second full turn does it return.</p>'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'That is the double cover: two different unitaries, $U$ and $-U$, produce the same rotation of the sphere, so the map from the gates to the rotations is two to one. It is the precise reason a half angle appears, and it is a fact about the geometry rather than a convention anyone chose.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figCover(),
      caption:'What is left of the state after a turn about its own axis, as the turn grows. At one full turn the amplitude is $-1$: the same state, with a sign. At two full turns the gate is the identity itself.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', 'A qubit in $|{+}\\rangle$, and the gate $R_{z}(2\\pi)$.'],
        ['Work', '$R_{z}(2\\pi)=-I$, so the state becomes $-|{+}\\rangle$.'],
        ['Answer', 'Nothing measurable has changed: $-|{+}\\rangle$ and $|{+}\\rangle$ have the same $\\rho$ and the same $\\mathbf{r}=(1,0,0)$.'],
        ['Check', 'Now put the same gate under a control. On $\\tfrac{1}{\\sqrt2}(|0\\rangle+|1\\rangle)\\otimes|{+}\\rangle$, applying it only in the $|1\\rangle$ branch gives $\\tfrac{1}{\\sqrt2}(|0\\rangle-|1\\rangle)\\otimes|{+}\\rangle$: the control has gone from $|{+}\\rangle$ to $|{-}\\rangle$, which any $X$ measurement sees.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'"A rotation by $2\\pi$ does nothing" is false for a gate', html:'It does nothing to <b>that qubit alone</b>. As a gate inside a larger circuit it is $-I$, and $-I$ on one branch of a superposition is a sign that survives into the interference. The habit of dropping a global phase is right for a state and wrong for a gate, and this is the cheapest example of the difference.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 4.2.1 -- */
{ id:'m4-rot', module:'M4', nav:'Every gate is a rotation', title:'Every one-qubit gate is a rotation, and here is its axis',
  objective:'Write a one-qubit unitary as a rotation and read its axis and angle.',
  keywords:'rotation operator exponential pauli axis angle generator half angle unitary one qubit gate geometry',
  src:'L7 · single-qubit gates as rotations', steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Single-qubit gates as rotations'},
  {t:'title', text:'Every one-qubit gate is a rotation, and here is its axis'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Chapter 2 built the operator $\\mathbf{n}\\cdot\\boldsymbol\\sigma$ and showed that its square is the identity. That one fact collapses the exponential: split the series into even and odd terms and each becomes an ordinary trigonometric series.</p>'},
    {t:'eq', tex:'\\left(\\mathbf{n}\\cdot\\boldsymbol\\sigma\\right)^{2} = I \\qquad\\Longrightarrow\\qquad e^{-i\\alpha\\,\\mathbf{n}\\cdot\\boldsymbol\\sigma/2} = \\cos\\frac{\\alpha}{2}\\,I - i\\sin\\frac{\\alpha}{2}\\;\\mathbf{n}\\cdot\\boldsymbol\\sigma'},
    {t:'eq', key:true, tex:'R_{\\mathbf{n}}(\\alpha) = e^{-i\\alpha\\,\\mathbf{n}\\cdot\\boldsymbol\\sigma/2}, \\qquad \\text{turns } \\mathbf{r} \\text{ about } \\mathbf{n} \\text{ by } \\alpha'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>The second line is the theorem of the chapter, and it is checked directly for $\\mathbf{n}=\\hat{z}$: conjugating the Pauli operators by $R_{z}(\\alpha)$ mixes $X$ and $Y$ by a plain rotation matrix and leaves $Z$ alone.</p>'},
      {t:'eq', tex:'\\begin{aligned} r_{x} &\\mapsto r_{x}\\cos\\alpha - r_{y}\\sin\\alpha \\\\ r_{y} &\\mapsto r_{x}\\sin\\alpha + r_{y}\\cos\\alpha \\\\ r_{z} &\\mapsto r_{z}\\end{aligned}'},
      {t:'small', html:'Any other axis is this one with the coordinates renamed, so the statement holds for every $\\mathbf{n}$. Conversely, every two-by-two unitary is $e^{i\\gamma}R_{\\mathbf{n}}(\\alpha)$ for some phase, axis and angle, so <b>rotation</b> is not one family of gates among many: it is all of them.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figRot(),
      caption:'A rotation about a tilted axis. The vector is carried round the amber circle, keeping its angle to the axis, so the length never changes — which is unitarity, drawn. The axis is at its true angle to $z$ because the frame is isotropic.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', '$R_{z}(90^{\\circ})$ applied to $|{+}\\rangle$.'],
        ['Work', 'Geometrically: $\\mathbf{r}=(1,0,0)$ turns a quarter of the way round $z$, to $(0,1,0)$.'],
        ['Answer', '$(0,1,0)$ is $|{+}i\\rangle$.'],
        ['Check', 'By matrices: $R_{z}(\\pi/2)=\\operatorname{diag}(e^{-i\\pi/4},e^{i\\pi/4})$, so $|{+}\\rangle \\mapsto \\tfrac{1}{\\sqrt2}(e^{-i\\pi/4}|0\\rangle + e^{i\\pi/4}|1\\rangle) = e^{-i\\pi/4}\\tfrac{1}{\\sqrt2}(|0\\rangle+i|1\\rangle)$, which is $|{+}i\\rangle$ up to a global phase.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'The angle in the matrix is half the angle on the sphere', html:'$R_{z}(\\pi)$ contains $\\cos(\\pi/2)=0$ and $\\sin(\\pi/2)=1$, and it turns the vector by a <b>half</b> turn, not a quarter. Reading the number inside the exponential as the angle on the sphere is the most common slip in this chapter, and it is always wrong by a factor of two.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 4.2.2 -- */
{ id:'m4-pauli', module:'M4', nav:'The Pauli gates', title:'The three Pauli gates, as three half turns',
  objective:'Give the axis and angle of each Pauli gate and its action on the six cardinal states.',
  keywords:'pauli gates X Y Z bit flip phase flip half turn axis fixed points eigenstates action',
  src:'L7 · the X, Y and Z gates', steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Single-qubit gates as rotations'},
  {t:'title', text:'The three Pauli gates, as three half turns'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Put $\\alpha=\\pi$ into the rotation formula and the cosine vanishes, leaving one Pauli operator and a phase:</p>'},
    {t:'eq', key:true, tex:'R_{x}(\\pi) = -iX, \\qquad R_{y}(\\pi) = -iY, \\qquad R_{z}(\\pi) = -iZ'},
    {t:'body', html:'<p>Each Pauli gate is therefore a <b>half turn about its own axis</b>, up to a phase that no measurement on that qubit can see. Half a turn fixes the two points on the axis and sends every other point to the far side.</p>'},
    {t:'eq', tex:'\\begin{aligned} X&:\\; |0\\rangle\\leftrightarrow|1\\rangle, \\qquad |{+}\\rangle \\text{ and } |{-}\\rangle \\text{ fixed} \\\\ Z&:\\; |{+}\\rangle\\leftrightarrow|{-}\\rangle, \\qquad |0\\rangle \\text{ and } |1\\rangle \\text{ fixed}\\end{aligned}'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'$Y$ is the third of the same kind, and it is also $Y=iXZ$: a half turn about $z$ followed by a half turn about $x$ is a half turn about $y$. Two half turns about perpendicular axes always compose into a third, which is why the three Pauli gates keep reproducing one another.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figPauli(),
      caption:'The two half turns that matter most. $X$ turns about the horizontal axis and exchanges the poles; $Z$ turns about the vertical axis and exchanges $|{+}\\rangle$ and $|{-}\\rangle$. Each leaves its own axis alone.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', '$X$ applied to $|{-}\\rangle = \\tfrac{1}{\\sqrt2}(|0\\rangle-|1\\rangle)$.'],
        ['Work', '$X$ swaps the two amplitudes: $\\tfrac{1}{\\sqrt2}(-|0\\rangle+|1\\rangle)$.'],
        ['Answer', 'That is $-|{-}\\rangle$, which is $|{-}\\rangle$ again.'],
        ['Check', 'On the sphere $|{-}\\rangle$ is at $-\\hat{x}$, which lies on the axis of the turn, so it cannot move. The minus sign is the global phase the picture already told us to expect.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'"$X$ is a bit flip" is only half the story', html:'It flips a computational-basis state and leaves $|{+}\\rangle$ and $|{-}\\rangle$ exactly where they are. Likewise $Z$ is called a phase flip and does nothing at all to $|0\\rangle$ or $|1\\rangle$. Which gate looks like a flip depends entirely on the basis the state happens to be written in, and the sphere is where that stops being confusing.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 4.2.3 -- */
{ id:'m4-had', module:'M4', nav:'The Hadamard', title:'The Hadamard: one half turn about a diagonal axis',
  objective:'Give the Hadamard as a rotation and use it to exchange the two bases.',
  keywords:'hadamard gate superposition basis change diagonal axis half turn self inverse HXH HZH conjugation',
  src:'L7 · the Hadamard gate', steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Single-qubit gates as rotations'},
  {t:'title', text:'The Hadamard: one half turn about a diagonal axis'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>The Hadamard is the average of two Pauli operators, and that is exactly what tells you its axis:</p>'},
    {t:'eq', key:true, tex:'H = \\frac{1}{\\sqrt2}\\begin{bmatrix}1&1\\\\1&-1\\end{bmatrix} = \\frac{X+Z}{\\sqrt2}'},
    {t:'body', html:'<p>A gate of the form $\\mathbf{n}\\cdot\\boldsymbol\\sigma$ is a half turn about $\\mathbf{n}$, up to a phase, so $H$ is a half turn about the diagonal direction halfway between $\\hat{x}$ and $\\hat{z}$.</p>'},
    {t:'eq', key:true, tex:'H \\;\\text{is a half turn about}\\; \\frac{\\hat{x}+\\hat{z}}{\\sqrt2}, \\qquad H^{2}=I'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>Half a turn about the diagonal exchanges the two axes it sits between, and reverses the third:</p>'},
      {t:'eq', tex:'HXH = Z, \\qquad HZH = X, \\qquad HYH = -Y'},
      {t:'small', html:'That is why $H$ is the standard change of measurement basis: measuring $X$ on a state is the same experiment as applying $H$ and then measuring $Z$, and a machine that can only read the computational basis needs exactly this gate to read any other.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figHad(),
      caption:'The axis of the Hadamard sits at $45^{\\circ}$ between $x$ and $z$, and the half turn about it carries $|0\\rangle$ to $|{+}\\rangle$. The frame is isotropic, so the $45^{\\circ}$ on the page is $45^{\\circ}$ in the data.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', '$H$ applied to $|{+}i\\rangle$, whose Bloch vector is $(0,1,0)$.'],
        ['Work', 'The half turn swaps $x$ with $z$ and reverses $y$, so $(0,1,0)\\mapsto(0,-1,0)$.'],
        ['Answer', '$|{-}i\\rangle$.'],
        ['Check', 'By matrices: $H|{+}i\\rangle = \\tfrac12\\left[(1+i)|0\\rangle + (1-i)|1\\rangle\\right] = \\tfrac{e^{i\\pi/4}}{\\sqrt2}\\left(|0\\rangle - i|1\\rangle\\right)$, which is $|{-}i\\rangle$ up to a global phase.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'The Hadamard does not create superpositions', html:'It creates one from $|0\\rangle$ and destroys one from $|{+}\\rangle$: $H|{+}\\rangle=|0\\rangle$. It is its own inverse, so it can only be a swap of the two bases, never a machine that makes superposition out of nothing. "Apply $H$ to get a superposition" is a sentence about one particular input.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 4.2.4 -- */
{ id:'m4-phase', module:'M4', nav:'Phase gates', title:'The phase gates: turning the equator by a chosen angle',
  objective:'Write the phase gate family and place S and T inside it.',
  keywords:'phase gate P S T gate quarter turn eighth turn clifford non clifford diagonal z rotation equator',
  src:'L7 · the phase, S and T gates', steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Single-qubit gates as rotations'},
  {t:'title', text:'The phase gates: turning the equator by a chosen angle'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>The diagonal family puts a phase on the second amplitude and leaves the first alone:</p>'},
    {t:'eq', key:true, tex:'P(\\varphi) = \\begin{bmatrix}1&0\\\\0&e^{i\\varphi}\\end{bmatrix} = e^{i\\varphi/2}\\,R_{z}(\\varphi)'},
    {t:'body', html:'<p>So it is a turn about $z$ by $\\varphi$, carrying a global phase that nothing can see. Two members of the family have names, and they are the two a machine usually provides:</p>'},
    {t:'eq', key:true, tex:'S = P\\!\\left(\\tfrac{\\pi}{2}\\right) = \\begin{bmatrix}1&0\\\\0&i\\end{bmatrix}, \\qquad T = P\\!\\left(\\tfrac{\\pi}{4}\\right), \\qquad S^{2}=Z, \\quad T^{2}=S'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'$S$ is a quarter turn of the equator and $T$ is an eighth of one. Eight applications of $T$ are a full turn and give the identity back. The two are not interchangeable in practice: $S$ is a Clifford gate and cheap to correct for, and $T$ is not, which is the subject of the universality scene at the end of the chapter.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figPhaseGate(),
      caption:'The equator seen from above, with $|{+}\\rangle$ carried round by $T$, by $S$ and by $Z$. Each is the same gate with a different angle, and the angles on the page are the angles in the data.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', '$T$ applied to $|{+}\\rangle$.'],
        ['Work', '$T|{+}\\rangle = \\tfrac{1}{\\sqrt2}\\left(|0\\rangle + e^{i\\pi/4}|1\\rangle\\right)$, so $\\theta=90^{\\circ}$ and $\\varphi=45^{\\circ}$.'],
        ['Answer', '$\\mathbf{r}=(\\cos 45^{\\circ},\\,\\sin 45^{\\circ},\\,0)=(0.7071,\\,0.7071,\\,0)$.'],
        ['Check', 'The length is $\\sqrt{0.5+0.5}=1$, so the state is still pure, and $r_{z}=0$, so a $Z$ measurement is still a fair coin — which it must be, because a turn about $z$ cannot change a $Z$ probability.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'A phase gate does nothing to a computational-basis state', html:'$P(\\varphi)|0\\rangle=|0\\rangle$ and $P(\\varphi)|1\\rangle = e^{i\\varphi}|1\\rangle$, which is $|1\\rangle$. Both poles sit on the axis of the turn. It follows that a phase gate cannot change any $Z$ probability at all, ever, and that its whole effect appears only after a later gate has moved the state off the axis — which in practice means after a Hadamard.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 4.3.1 -- */
{ id:'m4-time', module:'M4', nav:'The order gates compose in', title:'A circuit reads left to right and its matrices multiply right to left',
  objective:'Convert a drawn gate sequence into the correct matrix product.',
  keywords:'circuit order matrix multiplication right to left composition time order non commuting gates sequence',
  src:'L7 · the quantum circuit model', steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Composing gates'},
  {t:'title', text:'A circuit reads left to right and its matrices multiply right to left'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>A circuit diagram is a picture of time: the first gate is drawn on the left. A matrix acts on a ket standing to its right, so the first gate is the one closest to the ket, which is the one written <b>last</b>.</p>'},
    {t:'eq', key:true, tex:'U_{1} \\text{ first},\\; U_{2} \\text{ next},\\; U_{3} \\text{ last} \\qquad\\Longrightarrow\\qquad U = U_{3}\\,U_{2}\\,U_{1}'},
    {t:'body', html:'<p>This matters because gates on one qubit rarely commute. Two gates in the wrong order are not a slightly different answer; they are a different state.</p>'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>Gates acting on <b>different</b> qubits always commute, because they act on different tensor factors:</p>'},
      {t:'eq', tex:'\\left(A\\otimes I\\right)\\left(I\\otimes B\\right) = A\\otimes B = \\left(I\\otimes B\\right)\\left(A\\otimes I\\right)'},
      {t:'small', html:'That is why a circuit diagram can show them side by side in any order without ambiguity, and it is what lets a scheduler run them at the same moment. Only gates that share a qubit have an order that has to be respected.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figTime(),
      caption:'The same three gates in the two orders they are written in. Reading the product from left to right and calling it the circuit is the single most common transcription error in this course.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', 'Apply $H$ and then $S$ to $|0\\rangle$.'],
        ['Work', 'The matrix is $SH$, not $HS$. $H|0\\rangle=|{+}\\rangle$, then $S|{+}\\rangle$ turns the equator a quarter turn.'],
        ['Answer', '$SH|0\\rangle = |{+}i\\rangle$, at $\\mathbf{r}=(0,1,0)$.'],
        ['Check', 'The other order: $HS|0\\rangle = H|0\\rangle = |{+}\\rangle$, at $\\mathbf{r}=(1,0,0)$. Two different states, at right angles on the sphere, from the same two gates.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'Where this bites hardest', html:'It is invisible whenever the example happens to be symmetric. $HZH=X$ reads the same in both directions, so a student can check their method on it and learn nothing. Test the rule on a pair that does <b>not</b> commute — $S$ and $H$ will do — and test it once, properly, before trusting it.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 4.3.2 -- */
{ id:'m4-euler', module:'M4', nav:'Three turns are enough', title:'Any one-qubit gate in three turns and a phase',
  objective:'Decompose a one-qubit unitary into two z rotations and one y rotation.',
  keywords:'euler decomposition zyz rotation three angles universal one qubit synthesis native gate set compiler',
  src:'L7 · arbitrary single-qubit gates and Euler angles', steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Composing gates'},
  {t:'title', text:'Any one-qubit gate in three turns and a phase'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Any rotation of a sphere can be reached by three turns about two fixed axes: spin about $z$, tilt about $y$, spin about $z$ again. The same is true of the gates, with one phase left over:</p>'},
    {t:'eq', key:true, tex:'U = e^{i\\alpha}\\,R_{z}(\\phi)\\,R_{y}(\\theta)\\,R_{z}(\\lambda)'},
    {t:'body', html:'<p>Count the parameters and nothing is spare: a two-by-two unitary has four real degrees of freedom, and the decomposition has four — three angles and the phase. So the form is not one choice among many; it is a coordinate system for the whole group.</p>'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'This is what a compiler is doing when it turns a requested gate into hardware instructions. A machine calibrates one or two native rotations well and reaches everything else through this identity, rather than calibrating every gate a user might ask for. It is the reason a small instruction set is not a limitation.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figEuler(),
      caption:'The three turns and the phase. Read the boxes left to right as the order they run in; the matrix product then has $R_{z}(\\lambda)$ on the right, because it is applied first.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', 'Decompose the Hadamard.'],
        ['Work', 'Its matrix has $|U_{00}|=1/\\sqrt2$, so $\\cos(\\theta/2)=1/\\sqrt2$ and $\\theta=\\pi/2$. Matching the two phases in the first column and the sign in the first row gives $\\lambda=\\pi$, $\\phi=0$ and $\\alpha=\\pi/2$.'],
        ['Answer', '$H = e^{i\\pi/2}\\,R_{y}(\\pi/2)\\,R_{z}(\\pi)$.'],
        ['Check', '$R_{z}(\\pi)=-iZ$ and $R_{y}(\\pi/2)=\\tfrac{1}{\\sqrt2}\\begin{bmatrix}1&-1\\\\1&1\\end{bmatrix}$, so the product is $i\\cdot(-i)\\cdot\\tfrac{1}{\\sqrt2}\\begin{bmatrix}1&-1\\\\1&1\\end{bmatrix}Z = \\tfrac{1}{\\sqrt2}\\begin{bmatrix}1&1\\\\1&-1\\end{bmatrix} = H$.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'The phase is not optional when the gate is controlled', html:'Dropping $e^{i\\alpha}$ gives a gate with the same effect on any single qubit. Put it under a control and the dropped phase becomes a relative phase between two branches, and the circuit is wrong. A controlled version of a decomposed gate has to carry that phase explicitly, usually as an extra phase gate on the control.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 4.3.3 -- */
{ id:'m4-ugate', module:'M4', nav:'The gate a machine takes', title:'The three-parameter gate an instruction set actually offers',
  objective:'Read the standard three-parameter gate matrix and recover the named gates from it.',
  keywords:'u gate three parameters theta phi lambda instruction set native gate qiskit parameterised unitary',
  src:'L7 · arbitrary single-qubit gates and Euler angles', steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Composing gates'},
  {t:'title', text:'The three-parameter gate an instruction set actually offers'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Written out as a matrix rather than as a product, the decomposition of the last scene becomes one gate with three dials. This is the form most software presents:</p>'},
    {t:'eq', key:true, tex:'U(\\theta,\\phi,\\lambda) = \\begin{bmatrix} \\cos\\frac{\\theta}{2} & -e^{i\\lambda}\\sin\\frac{\\theta}{2} \\\\[2pt] e^{i\\phi}\\sin\\frac{\\theta}{2} & e^{i(\\phi+\\lambda)}\\cos\\frac{\\theta}{2}\\end{bmatrix}'},
    {t:'body', html:'<p>The global phase has been fixed by a convention rather than carried as a fourth parameter, so this is the rotation and not the gate up to phase. Every named gate of this chapter is a setting of the three dials:</p>'},
    {t:'eq', tex:'H = U\\!\\left(\\tfrac{\\pi}{2},\\,0,\\,\\pi\\right), \\qquad X = U(\\pi,\\,0,\\,\\pi), \\qquad P(\\varphi) = U(0,\\,\\varphi,\\,0)'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'The first column is worth reading on its own: applied to $|0\\rangle$ the gate returns $\\cos\\frac{\\theta}{2}|0\\rangle + e^{i\\phi}\\sin\\frac{\\theta}{2}|1\\rangle$, which is the parameterisation of the first scene. So $\\theta$ and $\\phi$ are the polar and azimuthal angles of the state it prepares from $|0\\rangle$, and $\\lambda$ is what it does to everything else.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figU(),
      caption:'The four entries, with the one tilt angle and the two phases that fill them. Reading the first column tells you which state the gate prepares from $|0\\rangle$; reading the second tells you what it does to $|1\\rangle$.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', 'Check $H = U(\\pi/2,\\,0,\\,\\pi)$.'],
        ['Work', '$\\cos(\\pi/4)=\\sin(\\pi/4)=1/\\sqrt2$. The entries are $1/\\sqrt2$, $-e^{i\\pi}/\\sqrt2$, $e^{i0}/\\sqrt2$ and $e^{i\\pi}/\\sqrt2$.'],
        ['Answer', '$\\tfrac{1}{\\sqrt2}\\begin{bmatrix}1&1\\\\1&-1\\end{bmatrix}$, which is $H$ exactly, with no phase left over.'],
        ['Check', 'The columns are orthonormal, so the matrix is unitary for every $\\theta$, $\\phi$ and $\\lambda$ — worth verifying once, because it is what makes the three dials safe to turn freely.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'Every library fixes the phase differently', html:'Three programs can implement the same rotation and print three different matrices, all correct, differing only in $e^{i\\alpha}$. That is harmless until the gate is controlled, and then the three give three different circuits. When a matrix is copied from one place to another, check what it does to $|0\\rangle$ and to $|1\\rangle$ rather than comparing the entries.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 4.L1 --- */
{ id:'m4-lab-g', module:'M4', nav:'Laboratory G', title:'Laboratory G · A gate sequence, and the vector it moves',
  objective:'Let the reader build a single-qubit sequence and follow the Bloch vector through it.',
  keywords:'laboratory gate sequence bloch vector path intermediate states net rotation axis angle composition order',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 4 · Composing gates'},
  {t:'title', text:'Laboratory G · A gate sequence, and the vector it moves'},
  {t:'small', html:'Build a sequence by pressing gates and watch where the Bloch vector goes. The left panel is the sphere with the path on it; the right panel is the three components against the step number, so every intermediate state can be read exactly. Find a pair of gates whose order changes the answer, and a sequence of four or more whose net effect is still one rotation.'},
  {t:'lab', id:'G'}
]},

/* ---------------------------------------------------------------- 4.4.1 -- */
{ id:'m4-rev', module:'M4', nav:'Reversible embeddings', title:'A classical gate that throws information away cannot be unitary',
  objective:'Embed an irreversible Boolean function in a reversible gate and say what it costs.',
  keywords:'reversible computation irreversible AND XOR landauer erasure bijection cnot embedding classical logic',
  src:'L7 · classical logic, information loss and reversible embeddings', steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Reversible embeddings'},
  {t:'title', text:'A classical gate that throws information away cannot be unitary'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>An AND gate takes two bits and returns one. Four inputs land on two outputs, so the inputs cannot be recovered from the output and the map is not invertible. A unitary is invertible by definition, so no unitary implements AND as written.</p>'},
    {t:'body', html:'<p>The fix is not to change the function but to keep enough of the input alongside the answer. For XOR, keeping the first input is enough:</p>'},
    {t:'eq', key:true, tex:'(a,\\,b) \\;\\longmapsto\\; (a,\\;a\\oplus b)'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>That map is its own inverse — apply it twice and $a\\oplus b\\oplus a = b$ comes back — so it is a permutation of the four inputs, which is exactly what a unitary on the computational basis is allowed to be. It is the CNOT gate.</p>'},
      {t:'small', html:'The same trick works in general. Any function $f$ has the reversible embedding $|x\\rangle|y\\rangle\\mapsto|x\\rangle|y\\oplus f(x)\\rangle$: keep the input, and write the answer into a second register by addition rather than by overwriting. Chapter 6 calls that an oracle and builds every algorithm on it.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figRev(),
      caption:'The two kinds of classical gate. The left one erases two of its four inputs; the right one only relabels them. A quantum gate has to be of the second kind, and the first kind reaches a quantum computer only by being rewritten as the second.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', 'AND, to be made reversible.'],
        ['Work', 'Keep both inputs and add a third wire for the answer: $(a,b,c)\\mapsto(a,\\,b,\\,c\\oplus ab)$.'],
        ['Answer', 'That is the Toffoli gate. Set $c=0$ and the third wire leaves carrying $ab$, with $a$ and $b$ untouched.'],
        ['Check', 'Eight inputs, eight outputs, and applying it twice restores everything, because $ab\\oplus ab = 0$. So it is a permutation of the eight basis states, and a permutation matrix is unitary.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Erasing a bit costs energy, and that is not a metaphor', html:'Landauer\u2019s argument ties the erasure of one bit to a definite minimum heat, $k_{B}T\\ln 2$, released into the environment. Reversible computation is the way around it, and the reason it matters here is narrower and sharper: a quantum computer cannot erase inside a coherent block at all, because erasure is exactly the operation a unitary is not.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 4.4.2 -- */
{ id:'m4-toffoli', module:'M4', nav:'Ancillas and uncomputing', title:'Ancillas, and why the workings have to be cleaned up',
  objective:'Explain uncomputation and say what goes wrong when a workspace is left dirty.',
  keywords:'toffoli ancilla uncompute garbage entangled workspace interference reversible circuit clean up bennett',
  src:'L7 · classical logic, information loss and reversible embeddings', steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Reversible embeddings'},
  {t:'title', text:'Ancillas, and why the workings have to be cleaned up'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Any real computation needs somewhere to put intermediate results. Those extra qubits are <b>ancillas</b>, and they start in a known state, usually $|0\\rangle$. The problem is what they hold at the end.</p>'},
    {t:'body', html:'<p>Run a computation $V_{f}$ on an input in superposition and the ancilla ends up holding a different value in each branch. The output register is then entangled with the workings:</p>'},
    {t:'eq', tex:'\\sum_{x} c_{x}\\,|x\\rangle|0\\rangle \\;\\longmapsto\\; \\sum_{x} c_{x}\\,|x\\rangle\\,|g(x)\\rangle'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>The standard repair is three steps: compute, copy the answer out with a CNOT, then run the computation backwards.</p>'},
      {t:'eq', key:true, tex:'V_{f}^{\\dagger}\\;\\left(\\text{copy}\\right)\\;V_{f} \\;:\\; |x\\rangle|0\\rangle|y\\rangle \\;\\longmapsto\\; |x\\rangle|0\\rangle|y\\oplus f(x)\\rangle'},
      {t:'small', html:'The ancilla leaves as it arrived, and every branch agrees about it, so it is no longer entangled with anything. That is what makes the branches able to interfere again.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figUncompute(),
      caption:'Compute, copy out, uncompute. The cost is that the work is done twice, and the gain is that the middle wire is clean at the end. Every oracle used in chapter 6 is assumed to have been built this way.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', 'A two-qubit register in $\\tfrac{1}{\\sqrt2}(|0\\rangle+|1\\rangle)$ with an ancilla holding $g(x)=x$.'],
        ['Work', 'The joint state is $\\tfrac{1}{\\sqrt2}(|0\\rangle|0\\rangle + |1\\rangle|1\\rangle)$, a Bell pair.'],
        ['Answer', 'The reduced state of the register is $I/2$: the superposition has become a mixture as far as the register is concerned.'],
        ['Check', 'Apply $H$ to the register and measure it. With the ancilla clean the answer would be $0$ with certainty; with the ancilla dirty it is a fair coin. The interference has gone, and nothing was measured to take it away.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'A dirty ancilla destroys an algorithm silently', html:'It raises no error, the state is still normalised, and the circuit still runs. What is lost is the cancellation every algorithm in chapter 6 depends on, and the symptom is a flat output distribution that looks like noise. Counting the ancillas and checking that each returns to $|0\\rangle$ is part of reading a circuit, not an optimisation afterwards.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 4.5.1 -- */
{ id:'m4-order', module:'M4', nav:'Which qubit is which', title:'Two qubits, and the ordering a gate is silently wrong about',
  objective:'Apply a one-qubit gate to a named qubit of a pair without ambiguity.',
  keywords:'qubit order convention tensor product significant bit index kron identity gate wrong qubit silent error',
  src:'L7 · qubit and bit-order conventions', steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Two-qubit gates'},
  {t:'title', text:'Two qubits, and the ordering a gate is silently wrong about'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Chapter 3 fixed the convention for states, and it is repeated here because this is where it starts breaking results. A pair of qubits is written with the higher-numbered one on the left, and entry $x$ of the column is the amplitude of the bit string $x$:</p>'},
    {t:'eq', key:true, tex:'|q_{1}q_{0}\\rangle, \\qquad x = 2q_{1}+q_{0}'},
    {t:'body', html:'<p>A gate on one qubit alone is then written with the identity in the other slot, and <b>which</b> slot is the whole content of the statement:</p>'},
    {t:'eq', key:true, tex:'\\text{on } q_{0}: \\; I\\otimes A, \\qquad \\text{on } q_{1}: \\; A\\otimes I'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'Both are four-by-four unitaries, both are perfectly valid gates, and they do different things. Nothing in the mathematics protects a reader who picks the wrong one: the result is normalised, its probabilities add to one, and it describes a different experiment.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figOrder(),
      caption:'The four entries and their bit strings, and the same gate applied to each of the two qubits of $|10\\rangle$. One answer is $|11\\rangle$ and the other is $|00\\rangle$. No calculation can recover from choosing the wrong one.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', 'The state $|10\\rangle$, which is the column $(0,0,1,0)$.'],
        ['Work', '$I\\otimes X$ flips $q_{0}$: the string $10$ becomes $11$, entry $3$. $X\\otimes I$ flips $q_{1}$: the string $10$ becomes $00$, entry $0$.'],
        ['Answer', '$(I\\otimes X)|10\\rangle = |11\\rangle$ and $(X\\otimes I)|10\\rangle = |00\\rangle$.'],
        ['Check', 'A one-qubit gate never moves probability between the two qubits, so the reduced state of the untouched qubit must be unchanged. After $I\\otimes X$ the first qubit is still $|1\\rangle$; after $X\\otimes I$ it is $|0\\rangle$. That check names which qubit moved.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'The one thing to do when a state crosses a boundary', html:'Whenever a state or a gate moves between two pieces of software, prepare $|10\\rangle$, apply $X$ to the qubit you mean, and print all four amplitudes. It takes a minute and it is the only reliable test. Reading the wire order off a circuit picture is not a test: drawing conventions and index conventions are independent, and a library may draw $q_{0}$ at the top while labelling it the least significant bit.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 4.5.2 -- */
{ id:'m4-cnot', module:'M4', nav:'The controlled-NOT', title:'The controlled-NOT, and why the control is not a spectator',
  objective:'Write the CNOT matrix for a stated control and target and use it in both bases.',
  keywords:'cnot controlled not gate control target matrix permutation phase kickback X basis conjugation entangling',
  src:'L7 · the CNOT gate', steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Two-qubit gates'},
  {t:'title', text:'The controlled-NOT, and why the control is not a spectator'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>The gate flips one qubit exactly when the other is one. Written for a control $c$ and a target $t$, its action on the computational basis is a permutation:</p>'},
    {t:'eq', key:true, tex:'\\mathrm{CNOT}:\\; |c\\rangle_{\\text{control}}\\,|t\\rangle_{\\text{target}} \\;\\longmapsto\\; |c\\rangle\\,|c\\oplus t\\rangle'},
    {t:'body', html:'<p>Which qubit is which changes the matrix. In the basis order $|00\\rangle,|01\\rangle,|10\\rangle,|11\\rangle$, with the course convention $|q_{1}q_{0}\\rangle$, the two choices are:</p>'},
    {t:'eq', key:true, tex:'\\mathrm{CNOT}_{0\\to 1} = \\begin{bmatrix}1&0&0&0\\\\0&0&0&1\\\\0&0&1&0\\\\0&1&0&0\\end{bmatrix}, \\qquad \\mathrm{CNOT}_{1\\to 0} = \\begin{bmatrix}1&0&0&0\\\\0&1&0&0\\\\0&0&0&1\\\\0&0&1&0\\end{bmatrix}'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'The subscript reads control to target. The first exchanges the second and fourth basis states, the second exchanges the third and fourth, and they are different gates. A CNOT matrix written down without naming its control and its target is not yet a gate, and this is the most common place a two-qubit circuit goes wrong. This course draws $q_{0}$ at the top of a circuit, so the gate drawn beside is $\\mathrm{CNOT}_{0\\to 1}$.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figCnot(),
      caption:'The circuit symbol and the permutation it performs. The filled dot marks the control and the crossed circle marks the target; the two are not interchangeable in this basis.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', 'The target prepared in $|{-}\\rangle$, and any control state $\\alpha|0\\rangle+\\beta|1\\rangle$.'],
        ['Work', 'The gate does nothing in the $|0\\rangle$ branch; in the $|1\\rangle$ branch it applies $X$, and $X|{-}\\rangle = -|{-}\\rangle$.'],
        ['Answer', 'The target comes out exactly as it went in, and the <b>control</b> comes out as $\\alpha|0\\rangle - \\beta|1\\rangle$: it has been hit with $Z$.'],
        ['Check', 'Consistent with the identity $\\mathrm{CNOT}_{0\\to 1} = (H\\otimes H)\\,\\mathrm{CNOT}_{1\\to 0}\\,(H\\otimes H)$. Conjugating by a Hadamard on both qubits exchanges the roles of control and target, so in the $X$ basis the gate runs the other way round.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'This is phase kickback, three chapters early', html:'The worked example above is the entire mechanism of chapter 6. An operation written to change a target register writes a phase onto the control instead, because the target was prepared in an eigenstate of that operation. Nothing new will be needed there; only this, applied to a larger register.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 4.5.3 -- */
{ id:'m4-cz', module:'M4', nav:'The controlled-Z', title:'The controlled-Z: the same gate with no target',
  objective:'Write CZ and convert between it and CNOT with one Hadamard.',
  keywords:'controlled z gate cz symmetric diagonal locally equivalent hadamard conjugation native gate hardware',
  src:'L7 · the controlled-Z gate', steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Two-qubit gates'},
  {t:'title', text:'The controlled-Z: the same gate with no target'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>The controlled-$Z$ multiplies one basis state by $-1$ and leaves the other three alone:</p>'},
    {t:'eq', key:true, tex:'\\mathrm{CZ} = \\operatorname{diag}(1,\\,1,\\,1,\\,-1)'},
    {t:'body', html:'<p>Being diagonal, it does not move any probability at all; it only writes a phase. And it is symmetric under exchanging its two qubits, so calling one of them the control is a habit rather than a fact about the gate.</p>'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>It is the CNOT with one Hadamard on each side of the target, because $HXH=Z$ turns the flip into the sign:</p>'},
      {t:'eq', key:true, tex:'\\mathrm{CZ} = \\left(H\\otimes I\\right)\\,\\mathrm{CNOT}_{0\\to 1}\\,\\left(H\\otimes I\\right)'},
      {t:'small', html:'So a machine that provides one of them provides both, at the cost of two one-qubit gates. Which one is native is a hardware question: some couplings produce a phase naturally and a flip only after conjugation, and some the other way round.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figCz(),
      caption:'Two dots and no target, which is how the symmetry is drawn. Exchanging the two wires leaves the picture and the matrix unchanged, and that is not true of the CNOT.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', '$\\mathrm{CZ}$ applied to $|{+}\\rangle\\otimes|{+}\\rangle$.'],
        ['Work', 'The input is $\\tfrac12(|00\\rangle+|01\\rangle+|10\\rangle+|11\\rangle)$; only the last term changes sign.'],
        ['Answer', '$\\tfrac12(|00\\rangle+|01\\rangle+|10\\rangle-|11\\rangle)$.'],
        ['Check', 'Is it entangled? The amplitude test of chapter 3 gives $c_{0}c_{3}-c_{1}c_{2}=\\left(\\tfrac12\\right)\\left(-\\tfrac12\\right)-\\left(\\tfrac12\\right)\\left(\\tfrac12\\right)=-\\tfrac12 \\ne 0$, so yes — a diagonal gate that moves no probability at all has produced an entangled state.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'A diagonal gate is not a harmless gate', html:'It changes no outcome probability of any computational-basis measurement made immediately afterwards, which makes it look inert. It is not: the phase it writes is relative between branches, and one later Hadamard turns it into a population difference. This is the two-qubit version of the warning in the phase-gate scene.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 4.5.4 -- */
{ id:'m4-swap', module:'M4', nav:'The SWAP', title:'SWAP: three entangling gates to move nothing',
  objective:'Write the SWAP gate and build it from three CNOTs.',
  keywords:'swap gate exchange qubits three cnots connectivity routing transpilation coupling map cost depth',
  src:'L7 · the SWAP gate', steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Two-qubit gates'},
  {t:'title', text:'SWAP: three entangling gates to move nothing'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>SWAP exchanges the two qubits, which as a permutation of the basis exchanges the middle two entries:</p>'},
    {t:'eq', key:true, tex:'\\mathrm{SWAP}\\,|q_{1}q_{0}\\rangle = |q_{0}q_{1}\\rangle, \\qquad \\mathrm{SWAP} = \\begin{bmatrix}1&0&0&0\\\\0&0&1&0\\\\0&1&0&0\\\\0&0&0&1\\end{bmatrix}'},
    {t:'body', html:'<p>It sends products to products, so it creates no entanglement whatever it is given. What it costs is another matter: when CNOT is the native two-qubit gate, a SWAP is three of them.</p>'},
    {t:'eq', key:true, tex:'\\mathrm{SWAP} = \\mathrm{CNOT}_{0\\to 1}\\;\\mathrm{CNOT}_{1\\to 0}\\;\\mathrm{CNOT}_{0\\to 1}'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'Check it on the basis by hand once, in the order the gates run. Starting from $|10\\rangle$: the first gate has its control on $q_{0}=0$ and does nothing; the second, with the roles exchanged, flips $q_{0}$ and gives $|11\\rangle$; the third flips $q_{1}$ and gives $|01\\rangle$. The pair has been exchanged, and it took three two-qubit gates to do it.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figSwap(),
      caption:'The three gates, with the middle one running the other way. The alternation is what makes the composition an exchange rather than a repeated flip.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Why a gate that does nothing has a chapter of its own', html:'Hardware does not let every pair of qubits interact. Two qubits that are not neighbours on the chip cannot be given a CNOT directly, so the compiler moves one of them along the coupling map with SWAPs until they are neighbours. Those SWAPs are real gates with real error, and on some circuits they outnumber the gates the programmer wrote.'}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'Relabelling is free and swapping is not', html:'If the exchange is only bookkeeping — the algorithm would be just as correct with the two names interchanged — then no gate is needed at all and the compiler should simply renumber. A SWAP is required only when the two qubits must physically move relative to a fixed coupling map. Confusing the two is how a circuit acquires depth it does not need.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 4.6.1 -- */
{ id:'m4-entangle', module:'M4', nav:'Which gates entangle', title:'What a local gate cannot do, and what one CNOT can',
  objective:'Say why local gates cannot entangle and how much entanglement one CNOT makes.',
  keywords:'entangling gate local unitary schmidt coefficients invariant bell state preparation ebit cnot hadamard',
  src:'L7 · local gates, entangling gates and universality', steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Entanglement from a gate'},
  {t:'title', text:'What a local gate cannot do, and what one CNOT can'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>A gate of the form $U_{A}\\otimes U_{B}$ acts on each half separately. In the Schmidt decomposition of chapter 3 it rotates the two bases and leaves the coefficients exactly where they were:</p>'},
    {t:'eq', key:true, tex:'\\left(U_{A}\\otimes U_{B}\\right)\\sum_{k}\\sqrt{\\lambda_{k}}\\,|u_{k}\\rangle|v_{k}\\rangle = \\sum_{k}\\sqrt{\\lambda_{k}}\\,\\left(U_{A}|u_{k}\\rangle\\right)\\left(U_{B}|v_{k}\\rangle\\right)'},
    {t:'body', html:'<p>The $\\lambda_{k}$ are unchanged, so the entropy is unchanged, so <b>no amount of one-qubit work creates entanglement</b>. Something that acts on both qubits at once is required, and that is what the word entangling gate means.</p>'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'<p>One CNOT is enough. Take $|00\\rangle$, tilt the control by $R_{y}(\\theta)$, then apply the gate:</p>'},
      {t:'eq', key:true, tex:'|00\\rangle \\;\\xrightarrow{\\;I\\otimes R_{y}(\\theta)\\;}\\; \\cos\\tfrac{\\theta}{2}|00\\rangle + \\sin\\tfrac{\\theta}{2}|01\\rangle \\;\\xrightarrow{\\;\\mathrm{CNOT}_{0\\to 1}\\;}\\; \\cos\\tfrac{\\theta}{2}|00\\rangle + \\sin\\tfrac{\\theta}{2}|11\\rangle'},
      {t:'small', html:'At $\\theta=90^{\\circ}$ that is $|\\Phi^{+}\\rangle$ and the two halves are maximally entangled. At $\\theta=0$ nothing happened at all, and the same gate produced a product state. So a gate is entangling if it entangles <b>some</b> input, not every input.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figEntangle(),
      caption:'How much entanglement one CNOT produces, against the tilt it is handed. Zero at both ends, where the input is a computational-basis state and the gate is a permutation, and one full bit in the middle.'},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given', 'The circuit above at $\\theta=90^{\\circ}$, which is the Hadamard case.'],
        ['Work', 'The output is $\\tfrac{1}{\\sqrt2}(|00\\rangle+|11\\rangle)$, whose coefficient matrix is $\\tfrac{1}{\\sqrt2}I$.'],
        ['Answer', 'The Schmidt coefficients are $\\tfrac12$ and $\\tfrac12$, so $\\rho_{A}=\\rho_{B}=I/2$ and $S=1$ bit.'],
        ['Check', 'At $\\theta=60^{\\circ}$: $\\lambda = \\cos^{2}30^{\\circ}=0.75$ and $0.25$, so $S=-0.75\\log_{2}0.75-0.25\\log_{2}0.25=0.8113$ bits. Less than one, and the state is still entangled.']
      ]}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'A circuit diagram is not a proof of entanglement', html:'The output of a Bell circuit on real hardware is entangled only if the gates were good enough. Establishing it requires measurements in more than one basis, or a witness, with the uncertainty reported. Naming the circuit is not measuring the state, and a noisy Bell circuit produces a separable mixture long before it stops producing something.'}
    ]}
  ]}
]},

/* ---------------------------------------------------------------- 4.L2 --- */
{ id:'m4-lab-h', module:'M4', nav:'Laboratory H', title:'Laboratory H · The Bell circuit, and both halves of what it makes',
  objective:'Let the reader run the Bell circuit and watch the joint state and both reduced states.',
  keywords:'laboratory bell circuit hadamard cnot joint state reduced states entropy four bell states input bits',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 4 · Entanglement from a gate'},
  {t:'title', text:'Laboratory H · The Bell circuit, and both halves of what it makes'},
  {t:'small', html:'Two input bits, one tilt and one phase, and the circuit of the last scene. The left panel is the joint state at the chosen stage, drawn as the four amplitudes; the right panel is the entanglement against the tilt. The readout carries both reduced states. Three things to find: the four input bit patterns give the four Bell states, the phase control moves the joint state without changing the entanglement at all, and there is exactly one tilt at which the output is a product.'},
  {t:'lab', id:'H'}
]},

/* ---------------------------------------------------------------- 4.7.1 -- */
{ id:'m4-univ', module:'M4', nav:'Universality', title:'What a universal gate set promises, and what it does not',
  objective:'State a universal gate set and say what universality costs in circuit length.',
  keywords:'universal gate set clifford T solovay kitaev approximation exact synthesis discrete continuous cost',
  src:'L7 · local gates, entangling gates and universality', steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Universality'},
  {t:'title', text:'What a universal gate set promises, and what it does not'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'<p>Two statements, and they promise different things. The first is exact:</p>'},
    {t:'eq', key:true, tex:'\\left\\{\\text{every one-qubit gate}\\right\\} \\cup \\left\\{\\mathrm{CNOT}\\right\\} \\;\\Longrightarrow\\; \\text{every unitary, exactly}'},
    {t:'body', html:'<p>The second replaces the continuous family by four fixed gates, and then only approximation is possible, because a finite set of gates generates a countable set of circuits and the unitaries are not countable:</p>'},
    {t:'eq', key:true, tex:'\\left\\{H,\\;S,\\;T,\\;\\mathrm{CNOT}\\right\\} \\;\\Longrightarrow\\; \\text{every unitary, to any } \\varepsilon > 0'},
    {t:'reveal', at:1, items:[
      {t:'small', html:'The price of $\\varepsilon$ is length: the Solovay&#8211;Kitaev result says a one-qubit gate can be reached with a number of gates growing like a power of $\\log(1/\\varepsilon)$, which is cheap. So accuracy is bought with depth, and depth is what a coherence time is spent against.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>figUniv(),
      caption:'The two claims. The exact one needs a continuum of one-qubit gates; the approximate one needs four gates and a budget. Both need one entangling gate, and no set of one-qubit gates alone is universal for any number of qubits.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Why $T$ is singled out', html:'$H$, $S$ and CNOT generate the Clifford group, which maps Pauli operators to Pauli operators. That structure makes Clifford circuits classically simulable in polynomial time, so a Clifford-only machine offers no advantage at all. $T$ is the cheapest gate that leaves the group, and counting $T$ gates is how the cost of a fault-tolerant circuit is usually reported.'}
    ]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'"Universal" says nothing about efficiency', html:'It says every unitary can be approximated, not that any of them can be approximated by a <b>short</b> circuit. Counting shows the opposite for almost all of them: there are far more unitaries than short circuits, so a generic $n$-qubit unitary needs a circuit exponential in $n$. Universality is what makes a machine programmable; it is never an argument that a particular task is fast.'}
    ]}
  ]}
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
