/* Course notes — Chapter 4.

   The reading edition of the artifact's chapter 4. It says the same things in
   the same order and is not a transcript: a scene builds in reveal steps and a
   page does not, so an argument that arrives in four steps on screen arrives
   here as one paragraph with the same intermediate lines shown.

   Every figure that carries an angle, a circle or a rotation is drawn in an
   isotropic frame — the same number of pixels to the unit on both axes — and
   the ratio is written in the comment above it. A Bloch sphere drawn as an
   ellipse is a lie about the one object this chapter exists to explain. */
(function(){
const P=PLOT, C=P.COL;
const D2R=Math.PI/180, R2=Math.SQRT1_2;

/* The drawing convention for every sphere below:

       (x, y, z)  ->  (x + 0.42 y,  z + 0.24 y).

   The plane of the page is the x-z plane and is drawn undistorted, so the
   great circle through |0>, |+>, |1> and |-> is a genuine circle and every
   angle read inside that plane is the true angle. The y direction is
   foreshortened and drawn up and to the right, which is what turns the equator
   into an ellipse — correctly, because a circle seen at an angle is one. */
const KY=0.42, KZ=0.24;
const pj=(x,y,z)=>[x+KY*y, z+KZ*y];

/* The shared frame: 440 px over an x span of 5.50 and 216 px over a y span of
   2.70, both 80 px to the unit. Wider than the ball needs, so the names have
   somewhere to go and the figure does not fill the page height. */
const sph=()=>P.Axes({w:492,h:268,xr:[-1.85,3.65],yr:[-1.35,1.35],
  pad:{l:26,r:26,t:26,b:26},xticksOverride:[],yticksOverride:[],
  grid:false,zeroAxes:false,arrows:false});

function rim(a){
  const p=[]; for(let i=0;i<=220;i++){ const s=2*Math.PI*i/220; p.push([Math.cos(s),Math.sin(s)]); }
  a.poly(p,{color:C.grid,width:1.5});
}
function equator(a){
  const p=[]; for(let i=0;i<=220;i++){ const t=2*Math.PI*i/220; p.push(pj(Math.cos(t),Math.sin(t),0)); }
  a.poly(p,{color:C.rule,width:1.0,dash:'4 4'});
}
function axes3(a,r){
  a.poly([[0,-r],[0,r]],{color:C.rule,width:1.1});
  a.poly([[-r,0],[r,0]],{color:C.rule,width:1.1});
  a.poly([[0,0],pj(0,r,0)],{color:C.rule,width:1.1});
}

/* One state on the sphere, with the two angles drawn at their true size. */
function sphere(){
  const a=sph(); rim(a); equator(a); axes3(a,1.22);
  const th=60*D2R, ph=135*D2R;
  const v=[Math.sin(th)*Math.cos(ph),Math.sin(th)*Math.sin(ph),Math.cos(th)];
  const mer=[]; for(let i=0;i<=120;i++){ const s=Math.PI*i/120;
    mer.push(pj(Math.sin(s)*Math.cos(ph),Math.sin(s)*Math.sin(ph),Math.cos(s))); }
  a.poly(mer,{color:C.dec.mid,width:1.3});
  const q=pj(v[0],v[1],v[2]);
  a.poly([[0,0],q],{color:C.in,width:2.4});
  a.point(q[0],q[1],{color:C.in,r:5});
  const arc=[]; for(let i=0;i<=40;i++){ const s=th*i/40;
    arc.push(pj(0.34*Math.sin(s)*Math.cos(ph),0.34*Math.sin(s)*Math.sin(ph),0.34*Math.cos(s))); }
  a.poly(arc,{color:C.h,width:1.7});
  a.note(-0.30,0.62,'\\theta',{fs:13,color:C.h,anchor:'end',tex:true});
  const az=[]; for(let i=0;i<=40;i++){ const t=ph*i/40; az.push(pj(0.46*Math.cos(t),0.46*Math.sin(t),0)); }
  a.poly(az,{color:C.mid,width:1.7});
  a.note(0.32,0.16,'\\varphi',{fs:13,color:C.mid,tex:true});
  a.note(0,1.28,'|0\\rangle',{fs:13,color:C.ink,anchor:'middle',tex:true});
  a.note(0,-1.28,'|1\\rangle',{fs:13,color:C.ink,anchor:'middle',dy:14,tex:true});
  a.note(1.30,0,'x',{fs:12,color:C.muted,dy:20,tex:true});
  /* The vertical axis is named just clear of the rim on the left. Naming it
     out at the far left, level with the centre, would put it on -x instead. */
  a.note(-0.16,1.04,'z',{fs:12,color:C.muted,anchor:'end',tex:true});
  const yq=pj(0,1.32,0);
  a.note(yq[0],yq[1],'y',{fs:12,color:C.muted,dx:8,dy:4,tex:true});
  a.note(q[0],q[1],'|\\psi\\rangle',{fs:13,color:C.in,dx:-10,dy:-10,anchor:'end',tex:true});
  return a.svg();
}

/* The six states that carry most of a first course. */
function cardinal(){
  const a=sph(); rim(a); equator(a); axes3(a,1.22);
  [[[0,0,1],'|0\\rangle',C.in,0,-26,'middle'],
   [[0,0,-1],'|1\\rangle',C.in,0,34,'middle'],
   [[1,0,0],'|{+}\\rangle',C.out,12,20,'start'],
   [[-1,0,0],'|{-}\\rangle',C.out,-12,20,'end'],
   [[0,1,0],'|{+}i\\rangle',C.mid,14,-8,'start'],
   [[0,-1,0],'|{-}i\\rangle',C.mid,-14,12,'end']].forEach(([v,l,col,dx,dy,an])=>{
    const q=pj(v[0],v[1],v[2]);
    a.poly([[0,0],q],{color:col,width:1.7});
    a.point(q[0],q[1],{color:col,r:5});
    a.note(q[0],q[1],l,{fs:13,color:col,dx,dy,anchor:an,tex:true});
  });
  a.note(1.80,0.70,'\\pm\\hat{z}: \\text{ the }Z\\text{ basis}',{fs:12,color:C.in,tex:true});
  a.note(1.80,0.30,'\\pm\\hat{x}: \\text{ the }X\\text{ basis}',{fs:12,color:C.out,tex:true});
  a.note(1.80,-0.10,'\\pm\\hat{y}: \\text{ the }Y\\text{ basis}',{fs:12,color:C.mid,tex:true});
  return a.svg();
}

/* The overlap against the angle on the sphere: the half angle, plotted. */
function half(){
  const a=P.Axes({w:420,h:290,xr:[0,180],yr:[0,1.12],
    xlabel:'\\Theta\\,(\\text{degrees})',ylabel:'|\\langle\\chi|\\psi\\rangle|^{2}',
    pad:{l:64,r:22,t:30,b:44},xtarget:4,ytarget:4});
  a.curve(d=>Math.cos(d*D2R/2)**2,{color:C.in,width:2.2});
  a.hline(0.5,{color:C.rule,width:1.2,dash:'4 4'});
  a.point(90,0.5,{color:C.h,r:5});
  a.note(96,0.66,'\\text{a coin}',{fs:12,color:C.h,tex:true});
  a.point(180,0,{color:C.out,r:5});
  a.note(178,0,'\\text{opposite}',{fs:12,color:C.out,dx:-6,dy:-26,anchor:'end',tex:true});
  return a.svg();
}

/* The double cover: what a rotation about the state's own axis leaves behind. */
function cover(){
  const a=P.Axes({w:420,h:290,xr:[0,4],yr:[-1.25,1.25],
    xlabel:'\\alpha/\\pi',ylabel:'\\langle\\psi|R_{z}(\\alpha)|\\psi\\rangle',
    pad:{l:76,r:22,t:30,b:44},xtarget:4,ytarget:4});
  a.curve(u=>Math.cos(Math.PI*u/2),{color:C.in,width:2.2});
  a.point(2,-1,{color:C.err,r:5});
  a.note(2.08,-1,'-I',{fs:12,color:C.err,dy:18,tex:true});
  a.point(4,1,{color:C.out,r:5});
  a.note(3.92,1,'I',{fs:12,color:C.out,dy:-10,anchor:'end',tex:true});
  return a.svg();
}

/* A rotation about a tilted axis, with the circle the vector is carried on. */
function rotation(){
  const a=sph(); rim(a); axes3(a,1.20);
  const b=35*D2R;
  const n=[Math.sin(b),0,Math.cos(b)];
  const e1=[Math.cos(b),0,-Math.sin(b)], e2=[0,1,0];
  const nq=pj(1.32*n[0],1.32*n[1],1.32*n[2]);
  a.poly([[0,0],nq],{color:C.h,width:2.2});
  a.note(nq[0],nq[1],'\\mathbf{n}',{fs:13,color:C.h,dx:6,dy:-6,tex:true});
  const r=[1,0,0];
  const dot=r[0]*n[0]+r[2]*n[2], sin=Math.sqrt(Math.max(0,1-dot*dot));
  const at=s=>[0,1,2].map(k=>dot*n[k]+sin*(Math.cos(s)*e1[k]+Math.sin(s)*e2[k]));
  const orb=[]; for(let i=0;i<=200;i++){ const p=at(2*Math.PI*i/200); orb.push(pj(p[0],p[1],p[2])); }
  /* Drawn in the amber of its own axis: in the fill tone it disappears. */
  a.poly(orb,{color:C.h,width:1.4,dash:'5 4'});
  a.poly([[0,0],[1,0]],{color:C.in,width:2.4}); a.point(1,0,{color:C.in,r:5});
  const rp=at(120*D2R), q2=pj(rp[0],rp[1],rp[2]);
  a.poly([[0,0],q2],{color:C.out,width:2.4}); a.point(q2[0],q2[1],{color:C.out,r:5});
  a.note(1.02,0,'\\mathbf{r}',{fs:13,color:C.in,dx:8,dy:20,tex:true});
  a.note(q2[0],q2[1],'\\mathbf{r}^{\\prime}',{fs:13,color:C.out,dx:8,dy:-6,tex:true});
  a.note(1.75,0.50,'\\text{carried round}',{fs:12,color:C.muted,tex:true});
  a.note(1.75,0.10,'\\text{the axis by } \\alpha',{fs:12,color:C.muted,tex:true});
  return a.svg();
}

/* The Hadamard axis, at a true 45 degrees because the frame is isotropic. */
function hadamard(){
  const a=sph(); rim(a); axes3(a,1.20);
  a.poly([[-1.30*R2,-1.30*R2],[1.30*R2,1.30*R2]],{color:C.h,width:2.2});
  a.note(1.30*R2,1.30*R2,'\\frac{\\hat{x}+\\hat{z}}{\\sqrt2}',{fs:12,color:C.h,dx:6,dy:-4,tex:true});
  a.poly([[0,0],[0,1]],{color:C.in,width:2.4}); a.point(0,1,{color:C.in,r:5});
  a.note(0,1.28,'|0\\rangle',{fs:12,color:C.in,anchor:'middle',tex:true});
  a.poly([[0,0],[1,0]],{color:C.out,width:2.4}); a.point(1,0,{color:C.out,r:5});
  a.note(1,0,'|{+}\\rangle',{fs:12,color:C.out,dx:8,dy:24,tex:true});
  const sw=[]; for(let i=0;i<=40;i++){ const t=Math.PI/2*(1-i/40);
    sw.push([1.12*Math.cos(t),1.12*Math.sin(t)]); }
  a.poly(sw,{color:C.mid,width:1.5,dash:'3 4'});
  a.note(1.80,0.30,'\\text{a half turn about}',{fs:12,color:C.muted,tex:true});
  a.note(1.80,-0.10,'\\text{the diagonal}',{fs:12,color:C.muted,tex:true});
  return a.svg();
}

/* The phase gates, seen from above the north pole. */
function phases(){
  const a=sph();
  const r=[]; for(let i=0;i<=220;i++){ const s=2*Math.PI*i/220; r.push([Math.cos(s),Math.sin(s)]); }
  a.poly(r,{color:C.grid,width:1.5});
  a.poly([[-1.24,0],[1.24,0]],{color:C.rule,width:1.1});
  a.poly([[0,-1.24],[0,1.24]],{color:C.rule,width:1.1});
  const put=(deg,lab,col,dx,dy,an)=>{
    const t=deg*D2R, x=Math.cos(t), y=Math.sin(t);
    a.poly([[0,0],[x,y]],{color:col,width:2.2});
    a.point(x,y,{color:col,r:5});
    a.note(x,y,lab,{fs:12,color:col,dx,dy,anchor:an,tex:true});
  };
  put(0,'|{+}\\rangle',C.in,10,24,'start');
  put(45,'T|{+}\\rangle',C.mid,10,-6,'start');
  put(90,'S|{+}\\rangle',C.out,0,-12,'middle');
  put(180,'Z|{+}\\rangle',C.err,-10,24,'end');
  a.note(1.32,0,'x',{fs:12,color:C.muted,dy:-10,tex:true});
  a.note(1.90,-0.50,'\\text{every phase gate}',{fs:12,color:C.muted,tex:true});
  a.note(1.90,-0.90,'\\text{turns about } z',{fs:12,color:C.muted,tex:true});
  return a.svg();
}

/* How much entanglement one CNOT makes, against the state it is handed. */
function entangling(){
  const h=l=>(l<=0||l>=1)?0:-l*Math.log2(l)-(1-l)*Math.log2(1-l);
  const a=P.Axes({w:420,h:290,xr:[0,180],yr:[0,1.14],
    xlabel:'\\theta\\,(\\text{degrees})',ylabel:'S(\\rho_{A})\\,(\\text{bits})',
    pad:{l:72,r:22,t:30,b:44},xtarget:4,ytarget:4});
  a.curve(d=>h(Math.cos(d*D2R/2)**2),{color:C.in,width:2.2});
  a.point(0,0,{color:C.out,r:5}); a.point(180,0,{color:C.out,r:5});
  a.point(90,1,{color:C.h,r:5});
  a.note(90,1,'\\text{one ebit}',{fs:12,color:C.h,anchor:'middle',dy:-12,tex:true});
  a.note(6,0.56,'\\text{a product}',{fs:12,color:C.out,tex:true});
  return a.svg();
}

window.C4 = [

{t:'page'},

/* ---------------- chapter 4 ---------------- */
{t:'h1', num:'4', text:'The Bloch sphere and quantum gates'},

{t:'p', lead:true, text:'Three chapters of algebra have said what a qubit state is and what may be done to it. This chapter says the same things again as a drawing, and the drawing loses nothing: every pure state of one qubit is a point of a sphere, every mixed state a point inside it, and every gate a rotation of that sphere.'},

{t:'p', text:'The counting is what makes it work, and it is worth doing before anything is drawn. Two complex amplitudes are four real numbers. Normalisation removes one and the fact that a global phase is not physical removes another, so two are left — and two angles are exactly what it takes to name a point on a sphere. The same counting works for the gates: a two-by-two unitary has four real parameters, one of them a phase nobody can see, and the three that remain are exactly the three that name a rotation, being an axis and an angle.'},

{t:'box', kind:'warn', hd:'The picture is for one qubit and stops there', html:'There is no drawing like this for two qubits: a pure state of a pair needs six real parameters and a mixed one fifteen. Everything in the second half of this chapter — the entangling gates — is therefore done in algebra, and the sphere is used only for what each qubit does alone.'},

/* ---- 4.1 ---- */
{t:'h2', num:'4.1', text:'The Bloch sphere, and the half angle'},

{t:'p', text:'Start from any normalised qubit state and use the freedom of chapter 1: multiply by whatever global phase makes the first amplitude real and not negative. What is left is one real number in the first amplitude and one phase in the second, which is two angles.'},

{t:'eqbox', cap:'a pure qubit state, and the point it names', tex:['|\\psi(\\theta,\\varphi)\\rangle = \\cos\\frac{\\theta}{2}\\,|0\\rangle + e^{i\\varphi}\\sin\\frac{\\theta}{2}\\,|1\\rangle, \\qquad 0\\le\\theta\\le\\pi, \\quad 0\\le\\varphi<2\\pi', '\\mathbf{r} = \\left(\\sin\\theta\\cos\\varphi,\\;\\sin\\theta\\sin\\varphi,\\;\\cos\\theta\\right), \\qquad |\\mathbf{r}|=1'],
 after:'The second line is the Bloch vector of chapter 3, now written in the two angles rather than in three traces. A mixed state is the same expression with $|\\mathbf{r}|<1$, so the sphere is the surface of the ball chapter 3 was already computing in. At a pole the azimuth means nothing, because $\\sin 0=0$ leaves nothing for the phase to multiply: like latitude and longitude, the coordinates are degenerate there, and reporting a phase for a state at the north pole is reporting a number no experiment can contain.'},

{t:'p', text:'The half angle is not a typographic accident and not a normalisation trick. The state must return to itself after $\\theta$ has gone round once, and the vector must return after $\\theta$ has gone round once as well — but a state and its negative are the same state, so the state may take two turns while the vector takes one. Halving the angle in the amplitudes is what arranges that, and section 4.2 shows the same factor again from the other side.'},

{t:'fig', svg:sphere, cap:'One state on the sphere. The plane of the page is the $x$–$z$ plane and is drawn undistorted, so the outline is a true circle and $\\theta$ is drawn at its real size; the $y$ direction is foreshortened, which is what makes the equator an ellipse.'},

{t:'p', text:'Six states carry most of a first course, and they are the two eigenstates of each Pauli operator. On the sphere they are the six points where the axes meet the surface: $|0\\rangle$ and $|1\\rangle$ at $\\pm\\hat{z}$, $|{+}\\rangle$ and $|{-}\\rangle$ at $\\pm\\hat{x}$, and $|{+}i\\rangle$ and $|{-}i\\rangle$ at $\\pm\\hat{y}$. Each pair is one measurement basis, and each pair sits at the two ends of one axis.'},

{t:'fig', svg:cardinal, cap:'The six states. The frame is isotropic, so a pair that looks opposite on the page really is opposite in the data, and the axes really are at right angles inside the plane of the page.'},

{t:'p', text:'One formula turns the picture into probabilities, and it follows in a line from chapter 3: $\\left|\\langle\\chi|\\psi\\rangle\\right|^{2}=\\operatorname{Tr}(\\rho_\\psi\\rho_\\chi)$, and multiplying out $\\tfrac12(I+\\mathbf{r}\\cdot\\boldsymbol\\sigma)$ against $\\tfrac12(I+\\mathbf{s}\\cdot\\boldsymbol\\sigma)$ leaves the dot product.'},

{t:'eqbox', cap:'the overlap of two pure states, from the angle between their vectors', tex:'\\left|\\langle\\chi|\\psi\\rangle\\right|^{2} = \\frac{1+\\mathbf{r}\\cdot\\mathbf{s}}{2} = \\cos^{2}\\frac{\\Theta}{2}',
 after:'Read that once and the half angle stops being strange. Two states are orthogonal — perfectly distinguishable in one measurement — exactly when their points are <b>opposite</b>. Two points at a right angle on the sphere overlap with probability one half, which is a fair coin.'},

{t:'box', kind:'err', hd:'Right angles on the sphere are not orthogonality', html:'The word is the same and the meaning is not. The states at $\\pm\\hat{z}$ are orthogonal; the states at $+\\hat{z}$ and $+\\hat{x}$ are as hard to tell apart as a coin toss allows. Reading the geometry with the wrong meaning of the word is the fastest way to lose a whole question in this chapter.'},

{t:'fig', svg:half, cap:'The overlap against the angle on the sphere. It is one half at a right angle and reaches zero only at the far side, which is exactly what the half angle in the amplitudes is there to produce.'},

{t:'ex', hd:'Example 4.1 · from angles to numbers', rows:[
 ['Given','$\\theta=60^{\\circ}$ and $\\varphi=135^{\\circ}$.'],
 ['Find','The state, its Bloch vector, and $p(0)$.'],
 ['Solution','$\\cos 30^{\\circ}=0.8660$ and $\\sin 30^{\\circ}=0.5$, so $|\\psi\\rangle=0.8660|0\\rangle+0.5\\,e^{i3\\pi/4}|1\\rangle$ and $\\mathbf{r}=(-0.6124,\\,0.6124,\\,0.5)$. Then $p(0)=\\cos^{2}30^{\\circ}=0.75$.'],
 ['Check','$0.6124^{2}+0.6124^{2}+0.5^{2}=1$, so the point is on the surface as a pure state must be, and $\\tfrac12(1+r_z)=0.75$ agrees with the amplitude.']]},

/* ---- 4.2 ---- */
{t:'h2', num:'4.2', text:'Global phase, relative phase, and the double cover'},

{t:'p', text:'The rule stated in chapter 1 and proved in chapter 3 is now a fact about a drawing. Multiplying the whole state by a phase leaves $\\rho$ alone, so it leaves the point alone. Putting a phase between the two amplitudes is a different operation entirely, and it moves the point round the equator by exactly that angle.'},

{t:'eqbox', cap:'the two phases, drawn apart', tex:'e^{i\\gamma}|\\psi\\rangle \\longmapsto \\text{the same } \\mathbf{r}, \\qquad \\cos\\tfrac{\\theta}{2}|0\\rangle + e^{i\\varphi}\\sin\\tfrac{\\theta}{2}|1\\rangle \\longmapsto \\varphi',
 after:'The two look alike on paper and are opposite in effect. A global phase is a change of nothing; a relative phase carries the state a definite distance, and at $\\varphi=\\pi$ it has carried $|{+}\\rangle$ all the way to $|{-}\\rangle$, which any $X$ measurement separates from it every single time.'},

{t:'p', text:'The double cover is what happens when this is pushed. A rotation about an axis $\\mathbf{n}$ by an angle $\\alpha$ — the operator section 4.3 derives — halves the angle inside, so a full turn of the Bloch vector is a half turn in the amplitudes.'},

{t:'eqbox', cap:'a full turn is not the identity', tex:'R_{\\mathbf{n}}(2\\pi) = -I, \\qquad R_{\\mathbf{n}}(4\\pi) = +I',
 after:'The Bloch vector is back where it started after $2\\pi$ — it has to be, it is an ordinary vector being turned in ordinary space. The state is not: it has picked up a minus sign, and only after a second full turn does it return. So two different unitaries, $U$ and $-U$, produce the same rotation of the sphere, and the map from the gates to the rotations is two to one. That is the precise sense in which a half angle appears, and it is a fact about the geometry rather than a convention anyone chose.'},

{t:'fig', svg:cover, cap:'What is left of the state after a turn about its own axis. At one full turn the amplitude is $-1$: the same state, with a sign. At two full turns the gate is the identity itself.'},

{t:'box', kind:'err', hd:'"A rotation by $2\\pi$ does nothing" is false for a gate', html:'It does nothing to that qubit alone. As a gate inside a larger circuit it is $-I$, and $-I$ applied on one branch of a superposition is a sign that survives into the interference. Put a $2\\pi$ rotation under a control with the control in $|{+}\\rangle$ and the control comes out as $|{-}\\rangle$ — fully observable. The habit of dropping a global phase is right for a state and wrong for a gate.'},

/* ---- 4.3 ---- */
{t:'h2', num:'4.3', text:'Single-qubit gates as rotations'},

{t:'p', text:'Chapter 2 built the operator $\\mathbf{n}\\cdot\\boldsymbol\\sigma$ and showed that its square is the identity. That one fact collapses the exponential: split the series into even and odd terms and each becomes an ordinary trigonometric series, exactly as it did for the generator in chapter 1.'},

{t:'eqbox', cap:'the rotation operator', tex:['R_{\\mathbf{n}}(\\alpha) = e^{-i\\alpha\\,\\mathbf{n}\\cdot\\boldsymbol\\sigma/2} = \\cos\\frac{\\alpha}{2}\\,I - i\\sin\\frac{\\alpha}{2}\\;\\mathbf{n}\\cdot\\boldsymbol\\sigma', '\\begin{aligned} r_{x} &\\mapsto r_{x}\\cos\\alpha - r_{y}\\sin\\alpha \\\\ r_{y} &\\mapsto r_{x}\\sin\\alpha + r_{y}\\cos\\alpha \\\\ r_{z} &\\mapsto r_{z}\\end{aligned}'],
 after:'The second block is the case $\\mathbf{n}=\\hat{z}$ written out, and it is a plain rotation of the Bloch vector by $\\alpha$. Any other axis is this one with the coordinates renamed, so the statement holds for every $\\mathbf{n}$. Conversely every two-by-two unitary is $e^{i\\gamma}R_{\\mathbf{n}}(\\alpha)$ for some phase, axis and angle, so <b>rotation</b> is not one family of gates among many: it is all of them.'},

{t:'box', kind:'warn', hd:'The angle in the matrix is half the angle on the sphere', html:'$R_{z}(\\pi)$ contains $\\cos(\\pi/2)=0$ and $\\sin(\\pi/2)=1$, and it turns the vector by a <b>half</b> turn, not a quarter. Reading the number inside the exponential as the angle on the sphere is the most common slip in this chapter, and it is always wrong by a factor of two.'},

{t:'fig', svg:rotation, cap:'A rotation about a tilted axis. The vector is carried round the amber circle keeping its angle to the axis, so its length never changes — which is unitarity, drawn. The axis sits at its true angle to $z$ because the frame is isotropic.'},

{t:'p', text:'Putting $\\alpha=\\pi$ into the formula kills the cosine and leaves one Pauli operator with a phase in front of it. So each Pauli gate is a <b>half turn about its own axis</b>, up to a phase no measurement on that qubit can see, and half a turn fixes the two points on the axis while sending every other point to the far side.'},

{t:'eqbox', cap:'the Pauli gates', tex:['R_{x}(\\pi) = -iX, \\qquad R_{y}(\\pi) = -iY, \\qquad R_{z}(\\pi) = -iZ', '\\begin{aligned} X&:\\; |0\\rangle\\leftrightarrow|1\\rangle, \\qquad |{+}\\rangle \\text{ and } |{-}\\rangle \\text{ fixed} \\\\ Z&:\\; |{+}\\rangle\\leftrightarrow|{-}\\rangle, \\qquad |0\\rangle \\text{ and } |1\\rangle \\text{ fixed}\\end{aligned}'],
 after:'"$X$ is a bit flip" is therefore only half the story: it flips a computational-basis state and leaves $|{+}\\rangle$ and $|{-}\\rangle$ exactly where they are, because they lie on its axis. Likewise $Z$ is called a phase flip and does nothing at all to $|0\\rangle$ or $|1\\rangle$. Which gate looks like a flip depends entirely on the basis the state happens to be written in, and the sphere is where that stops being confusing.'},

{t:'p', text:'The Hadamard is the same kind of gate with a different axis, and its own definition says which one: it is the average of two Pauli operators, so it is $\\mathbf{n}\\cdot\\boldsymbol\\sigma$ for the direction halfway between $\\hat{x}$ and $\\hat{z}$.'},

{t:'eqbox', cap:'the Hadamard, and what a half turn about a diagonal does', tex:['H = \\frac{1}{\\sqrt2}\\begin{bmatrix}1&1\\\\1&-1\\end{bmatrix} = \\frac{X+Z}{\\sqrt2}, \\qquad H^{2}=I', 'HXH = Z, \\qquad HZH = X, \\qquad HYH = -Y'],
 after:'Half a turn about the diagonal exchanges the two axes it sits between and reverses the third. That is why $H$ is the standard change of measurement basis: measuring $X$ on a state is the same experiment as applying $H$ and then measuring $Z$, and a machine that can only read the computational basis needs exactly this gate to read any other.'},

{t:'box', kind:'err', hd:'The Hadamard does not create superpositions', html:'It creates one from $|0\\rangle$ and destroys one from $|{+}\\rangle$: $H|{+}\\rangle=|0\\rangle$. Being its own inverse, it can only be a swap of the two bases, never a machine that makes superposition out of nothing. "Apply $H$ to get a superposition" is a sentence about one particular input.'},

{t:'figrow', n:2, items:[
 {svg:hadamard, cap:'The axis of the Hadamard sits at $45^{\\circ}$ between $x$ and $z$, and the half turn about it carries $|0\\rangle$ to $|{+}\\rangle$. The $45^{\\circ}$ on the page is $45^{\\circ}$ in the data.'},
 {svg:phases, cap:'The equator seen from above, with $|{+}\\rangle$ carried round by $T$, by $S$ and by $Z$. Each is the same gate with a different angle.'}]},

{t:'p', text:'The last family is the diagonal one, which puts a phase on the second amplitude and leaves the first alone. It is a turn about $\\hat{z}$ carrying a phase, and two of its members have names because they are the two a machine usually provides.'},

{t:'eqbox', cap:'the phase gates', tex:['P(\\varphi) = \\begin{bmatrix}1&0\\\\0&e^{i\\varphi}\\end{bmatrix} = e^{i\\varphi/2}\\,R_{z}(\\varphi)', 'S = P\\!\\left(\\tfrac{\\pi}{2}\\right), \\qquad T = P\\!\\left(\\tfrac{\\pi}{4}\\right), \\qquad S^{2}=Z, \\quad T^{2}=S'],
 after:'$S$ is a quarter turn of the equator and $T$ is an eighth of one, so eight applications of $T$ are a full turn and give the identity back. The two are not interchangeable in practice: $S$ is a Clifford gate and cheap to correct for, and $T$ is not, which is the subject of section 4.7.'},

{t:'box', kind:'warn', hd:'A phase gate does nothing to a computational-basis state', html:'Both poles sit on the axis of the turn, so $P(\\varphi)$ cannot change any $Z$ probability at all, ever. Its whole effect appears only after a later gate has moved the state off that axis — which in practice means after a Hadamard. That two-step pattern, write a phase and then convert it, is the mechanism of every algorithm in chapter 6.'},

{t:'ex', hd:'Example 4.2 · a phase, and the gate that reveals it', rows:[
 ['Given','A qubit in $|{+}\\rangle$; apply $T$, then measure $Z$; then repeat with a Hadamard inserted before the measurement.'],
 ['Find','Both probabilities of the outcome $0$.'],
 ['Solution','$T$ turns $(1,0,0)$ to $(0.7071,\\,0.7071,\\,0)$, so $r_z=0$ and $p(0)=0.5$: the reading is blind to what happened. The Hadamard sends that vector to $(0,\\,-0.7071,\\,0.7071)$, so $p(0)=\\tfrac12(1+0.7071)=0.8536$.'],
 ['Check','Directly, $\\left|\\langle0|HT|{+}\\rangle\\right|^{2}=\\cos^{2}(\\pi/8)=0.8536$. Both lengths are one throughout, as two rotations require.']]},

/* ---- 4.4 ---- */
{t:'h2', num:'4.4', text:'Composing gates: order, Euler angles and one gate with three dials'},

{t:'p', text:'A circuit diagram is a picture of time, and the first gate is drawn on the left. A matrix acts on a ket standing to its right, so the first gate is the one closest to the ket, which is the one written last. This is the transcription error of the chapter, and it is invisible whenever the example happens to be symmetric.'},

{t:'eqbox', cap:'the order a circuit multiplies in', tex:['U_{1} \\text{ first},\\; U_{2} \\text{ next},\\; U_{3} \\text{ last} \\qquad\\Longrightarrow\\qquad U = U_{3}\\,U_{2}\\,U_{1}', '\\left(A\\otimes I\\right)\\left(I\\otimes B\\right) = A\\otimes B = \\left(I\\otimes B\\right)\\left(A\\otimes I\\right)'],
 after:'The second line says gates on different qubits always commute, because they act on different tensor factors. That is why a diagram can show them side by side in any order without ambiguity, and it is what lets a scheduler run them at the same moment. Only gates that share a qubit have an order that has to be respected — and those usually do not commute: $SH|0\\rangle=|{+}i\\rangle$ while $HS|0\\rangle=|{+}\\rangle$, two states at right angles on the sphere.'},

{t:'p', text:'Any rotation of a sphere can be reached by three turns about two fixed axes: spin about $z$, tilt about $y$, spin about $z$ again. The same is true of the gates, with one phase left over, and the parameter count shows that nothing is spare — four real degrees of freedom in a two-by-two unitary against three angles and a phase.'},

{t:'eqbox', cap:'the Euler decomposition, and the same gate as one matrix', tex:['U = e^{i\\alpha}\\,R_{z}(\\phi)\\,R_{y}(\\theta)\\,R_{z}(\\lambda)', 'U(\\theta,\\phi,\\lambda) = \\begin{bmatrix} \\cos\\frac{\\theta}{2} & -e^{i\\lambda}\\sin\\frac{\\theta}{2} \\\\[2pt] e^{i\\phi}\\sin\\frac{\\theta}{2} & e^{i(\\phi+\\lambda)}\\cos\\frac{\\theta}{2}\\end{bmatrix}'],
 after:'The second form is what most software presents, with the global phase fixed by a convention rather than carried as a fourth parameter. Its first column is the state it prepares from $|0\\rangle$, so $\\theta$ and $\\phi$ are the polar and azimuthal angles of that state and $\\lambda$ is what the gate does to everything else. Every named gate is a setting of the three dials: $H=U(\\tfrac{\\pi}{2},0,\\pi)$, $X=U(\\pi,0,\\pi)$ and $P(\\varphi)=U(0,\\varphi,0)$.'},

{t:'p', text:'This is what a compiler is doing when it turns a requested gate into hardware instructions. A machine calibrates one or two native rotations well and reaches everything else through this identity, rather than calibrating every gate a user might ask for. It is the reason a small instruction set is not a limitation.'},

{t:'ex', hd:'Example 4.3 · the Euler form of the Hadamard', rows:[
 ['Given','$H=\\tfrac{1}{\\sqrt2}\\begin{bmatrix}1&1\\\\1&-1\\end{bmatrix}$.'],
 ['Find','Angles $\\alpha,\\phi,\\theta,\\lambda$ with $H=e^{i\\alpha}R_z(\\phi)R_y(\\theta)R_z(\\lambda)$.'],
 ['Solution','$|U_{00}|=1/\\sqrt2$ gives $\\cos(\\theta/2)=1/\\sqrt2$, so $\\theta=\\pi/2$. Matching the phases of the first column and the sign in the first row gives $\\lambda=\\pi$, $\\phi=0$ and $\\alpha=\\pi/2$, so $H=e^{i\\pi/2}R_y(\\pi/2)R_z(\\pi)$.'],
 ['Check','$R_z(\\pi)=-iZ$ and $R_y(\\pi/2)=\\tfrac{1}{\\sqrt2}\\begin{bmatrix}1&-1\\\\1&1\\end{bmatrix}$, and the product is $i(-i)\\tfrac{1}{\\sqrt2}\\begin{bmatrix}1&-1\\\\1&1\\end{bmatrix}Z=H$. Note that $R_z(\\pi)$ is applied first, because it is written on the right.']]},

{t:'box', kind:'err', hd:'The phase is not optional when the gate is controlled', html:'Dropping $e^{i\\alpha}$ gives a gate with the same effect on any single qubit. Put it under a control and the dropped phase becomes a relative phase between two branches, and the circuit is wrong. A controlled version of a decomposed gate has to carry that phase explicitly, usually as an extra phase gate on the control. Three programs can implement the same rotation and print three different matrices, all correct, differing only in $e^{i\\alpha}$ — harmless until one of them is controlled.'},

/* ---- 4.5 ---- */
{t:'h2', num:'4.5', text:'Reversible embeddings, ancillas and uncomputing'},

{t:'p', text:'An AND gate takes two bits and returns one, so four inputs land on two outputs, the inputs cannot be recovered, and the map is not invertible. A unitary is invertible by definition, so no unitary implements AND as written. The fix is not to change the function but to keep enough of the input alongside the answer.'},

{t:'eqbox', cap:'the reversible embeddings', tex:['(a,\\,b) \\longmapsto (a,\\;a\\oplus b) \\qquad \\text{is exactly CNOT}', '|x\\rangle|y\\rangle \\longmapsto |x\\rangle\\,|y\\oplus f(x)\\rangle \\qquad \\text{for any } f'],
 after:'The first map is its own inverse — apply it twice and $a\\oplus b\\oplus a=b$ comes back — so it is a permutation of the four inputs, which is what a unitary on the computational basis is allowed to be. The second is the general pattern: keep the input, and write the answer into a second register by addition rather than by overwriting. Chapter 6 calls that an oracle and builds every algorithm on it. AND itself needs a third wire, $(a,b,c)\\mapsto(a,b,c\\oplus ab)$, which is the Toffoli gate.'},

{t:'box', kind:'def', hd:'Erasing a bit costs energy, and that is not a metaphor', html:'Landauer\u2019s argument ties the erasure of one bit to a definite minimum heat, $k_{B}T\\ln 2$, released into the environment. Reversible computation is the way around it, and the reason it matters here is narrower and sharper: a quantum computer cannot erase inside a coherent block at all, because erasure is exactly the operation a unitary is not.'},

{t:'p', text:'Any real computation needs somewhere to put intermediate results. Those extra qubits are <b>ancillas</b>, they start in a known state, and the problem is what they hold at the end. Run a computation on an input in superposition and the ancilla holds a different value in each branch, so the output register is entangled with the workings.'},

{t:'eqbox', cap:'compute, copy out, uncompute', tex:['\\sum_{x} c_{x}\\,|x\\rangle|0\\rangle \\;\\longmapsto\\; \\sum_{x} c_{x}\\,|x\\rangle\\,|g(x)\\rangle \\qquad \\text{(dirty)}', 'V_{f}^{\\dagger}\\;\\left(\\text{copy}\\right)\\;V_{f} \\;:\\; |x\\rangle|0\\rangle|y\\rangle \\;\\longmapsto\\; |x\\rangle|0\\rangle|y\\oplus f(x)\\rangle'],
 after:'The repair is three steps: compute, copy the answer out with a CNOT, then run the computation backwards. The ancilla leaves as it arrived and every branch agrees about it, so it is no longer entangled with anything, and the branches can interfere again. The cost is that the work is done twice.'},

{t:'box', kind:'err', hd:'A dirty ancilla destroys an algorithm silently', html:'It raises no error, the state is still normalised, and the circuit still runs. What is lost is the cancellation every algorithm in chapter 6 depends on, and the symptom is a flat output distribution that looks like noise. The smallest example is a two-qubit register left as a Bell pair with its ancilla: the register alone is $I/2$, so a Hadamard followed by a measurement returns a coin where a clean ancilla would have given $0$ with certainty. Counting the ancillas and checking that each returns to $|0\\rangle$ is part of reading a circuit, not an optimisation afterwards.'},

/* ---- 4.6 ---- */
{t:'h2', num:'4.6', text:'Two qubits, and the ordering a gate is silently wrong about'},

{t:'p', text:'Chapter 3 fixed the convention for states, and it is repeated here because this is where it starts breaking results rather than merely labels. A pair is written $|q_1q_0\\rangle$ with the higher-numbered qubit on the left, and entry $x$ of the column is the amplitude of the bit string $x$, so $x=2q_1+q_0$. A gate on one qubit alone is then written with the identity in the other slot, and <b>which</b> slot is the whole content of the statement.'},

{t:'eqbox', cap:'a one-qubit gate on a named qubit of a pair', tex:['\\text{on } q_{0}: \\; I\\otimes A, \\qquad \\text{on } q_{1}: \\; A\\otimes I', '\\left(I\\otimes X\\right)|10\\rangle = |11\\rangle, \\qquad \\left(X\\otimes I\\right)|10\\rangle = |00\\rangle'],
 after:'Both are four-by-four unitaries, both are perfectly valid gates, and they do different things. Nothing in the mathematics protects a reader who picks the wrong one: the result is normalised, its probabilities add to one, and it describes a different experiment. Whenever a state or a gate moves between two pieces of software, prepare $|10\\rangle$, apply $X$ to the qubit you mean, and print all four amplitudes. It takes a minute and it is the only reliable test — reading the wire order off a circuit picture is not one, because drawing conventions and index conventions are independent.'},

{t:'p', text:'The controlled-NOT flips one qubit exactly when the other is one. Its action on the computational basis is a permutation, and which qubit is the control changes the matrix, so a CNOT written down without naming its control and its target is not yet a gate. This course draws $q_0$ at the top of a circuit and uses it as the control unless a scene says otherwise.'},

{t:'eqbox', cap:'the two CNOT matrices, in the basis order $|00\\rangle,|01\\rangle,|10\\rangle,|11\\rangle$', tex:['\\mathrm{CNOT}:\\; |c\\rangle|t\\rangle \\longmapsto |c\\rangle|c\\oplus t\\rangle', '\\mathrm{CNOT}_{0\\to 1} = \\begin{bmatrix}1&0&0&0\\\\0&0&0&1\\\\0&0&1&0\\\\0&1&0&0\\end{bmatrix}, \\qquad \\mathrm{CNOT}_{1\\to 0} = \\begin{bmatrix}1&0&0&0\\\\0&1&0&0\\\\0&0&0&1\\\\0&0&1&0\\end{bmatrix}'],
 after:'The subscript reads control to target. The first exchanges the second and fourth basis states and the second exchanges the third and fourth, and they are different gates: handed $\\tfrac{1}{\\sqrt2}(|00\\rangle+|10\\rangle)$, one of them does nothing at all and the other produces a maximally entangled pair.'},

{t:'box', kind:'ok', hd:'The control is not a spectator', html:'Prepare the target in $|{-}\\rangle$ and let the control be $\\alpha|0\\rangle+\\beta|1\\rangle$. The gate does nothing in the $|0\\rangle$ branch, and in the $|1\\rangle$ branch it applies $X$, which gives $X|{-}\\rangle=-|{-}\\rangle$. The target comes out exactly as it went in and the control comes out as $\\alpha|0\\rangle-\\beta|1\\rangle$: it has been hit with $Z$. This is <b>phase kickback</b>, three chapters early, and it is the whole mechanism of chapter 6. Consistently, $\\mathrm{CNOT}_{0\\to1}=(H\\otimes H)\\,\\mathrm{CNOT}_{1\\to0}\\,(H\\otimes H)$: in the $X$ basis the gate runs the other way round.'},

{t:'p', text:'Two more two-qubit gates complete what this course needs. The controlled-$Z$ multiplies one basis state by $-1$ and leaves the other three alone; being diagonal it moves no probability at all, and being symmetric under exchanging its qubits it has no unique target. SWAP exchanges the two qubits, sends products to products, and creates no entanglement whatever it is given.'},

{t:'eqbox', cap:'CZ and SWAP, and what each costs', tex:['\\mathrm{CZ} = \\operatorname{diag}(1,1,1,-1) = \\left(H\\otimes I\\right)\\,\\mathrm{CNOT}_{0\\to 1}\\,\\left(H\\otimes I\\right)', '\\mathrm{SWAP} = \\mathrm{CNOT}_{0\\to 1}\\;\\mathrm{CNOT}_{1\\to 0}\\;\\mathrm{CNOT}_{0\\to 1}'],
 after:'A machine that provides one of CZ and CNOT provides both, at the cost of two one-qubit gates; which is native is a hardware question. SWAP is the expensive one: three two-qubit gates to move a state one step across a chip. Hardware does not let every pair of qubits interact, so a compiler moves qubits along the coupling map with SWAPs until the pair it needs is adjacent, and on some circuits those routing gates outnumber the gates the programmer wrote.'},

{t:'box', kind:'warn', hd:'A diagonal gate is not a harmless gate', html:'CZ changes no outcome probability of any computational-basis measurement made immediately afterwards, which makes it look inert. It is not: handed $|{+}\\rangle\\otimes|{+}\\rangle$ it produces a maximally entangled state. The phase it writes is relative between branches, and one later Hadamard turns it into a population difference. Likewise, relabelling two qubits is free and swapping them is not — a SWAP is required only when the two must physically move relative to a fixed coupling map.'},

/* ---- 4.7 ---- */
{t:'h2', num:'4.7', text:'Entangling gates and universality'},

{t:'p', text:'A gate of the form $U_A\\otimes U_B$ acts on each half separately. In the Schmidt decomposition of chapter 3 it rotates the two bases and leaves the coefficients exactly where they were, so the entropy is unchanged and <b>no amount of one-qubit work creates entanglement</b>. Something acting on both qubits at once is required, and that is what the word entangling gate means.'},

{t:'eqbox', cap:'one CNOT, and how much it makes', tex:['\\left(U_{A}\\otimes U_{B}\\right)\\sum_{k}\\sqrt{\\lambda_{k}}\\,|u_{k}\\rangle|v_{k}\\rangle = \\sum_{k}\\sqrt{\\lambda_{k}}\\,\\left(U_{A}|u_{k}\\rangle\\right)\\left(U_{B}|v_{k}\\rangle\\right)', '|00\\rangle \\xrightarrow{\\;I\\otimes R_{y}(\\theta)\\;} \\cos\\tfrac{\\theta}{2}|00\\rangle + \\sin\\tfrac{\\theta}{2}|01\\rangle \\xrightarrow{\\;\\mathrm{CNOT}_{0\\to 1}\\;} \\cos\\tfrac{\\theta}{2}|00\\rangle + \\sin\\tfrac{\\theta}{2}|11\\rangle'],
 after:'At $\\theta=90^{\\circ}$ the output is $|\\Phi^{+}\\rangle$ and the two halves are maximally entangled; at $\\theta=0$ nothing happened at all and the same gate produced a product state. So a gate is entangling if it entangles <b>some</b> input, not every input.'},

{t:'fig', svg:entangling, cap:'How much entanglement one CNOT produces, against the tilt it is handed. Zero at both ends, where the input is a computational-basis state and the gate is a permutation, and one full bit in the middle.'},

{t:'box', kind:'err', hd:'A circuit diagram is not a proof of entanglement', html:'The output of a Bell circuit on real hardware is entangled only if the gates were good enough. Establishing it requires measurements in more than one basis, or a witness, with the uncertainty reported. Naming the circuit is not measuring the state, and a noisy Bell circuit produces a separable mixture long before it stops producing something.'},

{t:'p', text:'Two universality statements, and they promise different things. The exact one needs a continuum of one-qubit gates; the approximate one needs four fixed gates and a budget. Both need one entangling gate, and no set of one-qubit gates alone is universal for any number of qubits.'},

{t:'eqbox', cap:'two universal sets', tex:['\\left\\{\\text{every one-qubit gate}\\right\\} \\cup \\left\\{\\mathrm{CNOT}\\right\\} \\;\\Longrightarrow\\; \\text{every unitary, exactly}', '\\left\\{H,\\;S,\\;T,\\;\\mathrm{CNOT}\\right\\} \\;\\Longrightarrow\\; \\text{every unitary, to any } \\varepsilon > 0'],
 after:'Only approximation is possible in the second case, because a finite set of gates generates a countable set of circuits and the unitaries are not countable. The price of $\\varepsilon$ is length: the Solovay–Kitaev result says a one-qubit gate can be reached with a number of gates growing like a power of $\\log(1/\\varepsilon)$, which is cheap — with the square, dropping $\\varepsilon$ from $10^{-2}$ to $10^{-4}$ multiplies the length by four.'},

{t:'box', kind:'def', hd:'Why $T$ is singled out, and what "universal" does not promise', html:'$H$, $S$ and CNOT generate the Clifford group, which maps Pauli operators to Pauli operators. That structure makes Clifford circuits classically simulable in polynomial time, so a Clifford-only machine offers no advantage at all. $T$ is the cheapest gate that leaves the group, and counting $T$ gates is how the cost of a fault-tolerant circuit is usually reported. Universality itself is a reachability claim and not a performance claim: counting shows there are far more $n$-qubit unitaries than short circuits, so a generic one needs a circuit exponential in $n$. It makes a machine programmable; it is never an argument that a particular task is fast.'},

{t:'ex', hd:'Example 4.4 · one gate, two directions', rows:[
 ['Given','$\\tfrac{1}{\\sqrt2}(|00\\rangle+|10\\rangle)$, that is $q_1$ in $|{+}\\rangle$ and $q_0$ in $|0\\rangle$, and a CNOT whose direction has not been named.'],
 ['Find','The output for each direction, and its entanglement.'],
 ['Solution','With $q_0$ as control the control is $0$ in both terms, so nothing happens and the state stays a product: $S=0$. With $q_1$ as control, $|10\\rangle\\to|11\\rangle$ and the output is $\\tfrac{1}{\\sqrt2}(|00\\rangle+|11\\rangle)=|\\Phi^{+}\\rangle$, with Schmidt weights $\\tfrac12,\\tfrac12$ and $S=1$ bit.'],
 ['Check','The reduced states agree: after the first, each qubit is pure with purity one; after the second, both are $I/2$ with purity one half. "Apply a CNOT" was never an instruction — one direction produces a maximally entangled pair and the other produces nothing.']]},

/* ---- 4.8 ---- */
{t:'h2', num:'4.8', text:'Summary'},

{t:'ul', items:[
 'A pure qubit state is $\\cos\\frac{\\theta}{2}|0\\rangle+e^{i\\varphi}\\sin\\frac{\\theta}{2}|1\\rangle$ at the point $\\mathbf{r}=(\\sin\\theta\\cos\\varphi,\\sin\\theta\\sin\\varphi,\\cos\\theta)$. Opposite points are orthogonal states, and $|\\langle\\chi|\\psi\\rangle|^{2}=\\cos^{2}(\\Theta/2)$.',
 'A global phase moves nothing and a relative phase moves the azimuth by itself. A $2\\pi$ rotation is $-I$, which is invisible on one qubit and observable under a control.',
 '$R_{\\mathbf{n}}(\\alpha)=\\cos\\frac{\\alpha}{2}I-i\\sin\\frac{\\alpha}{2}\\,\\mathbf{n}\\cdot\\boldsymbol\\sigma$ turns the Bloch vector about $\\mathbf{n}$ by $\\alpha$, and every one-qubit gate is one of these up to a phase. Each Pauli is a half turn, $H$ a half turn about $(\\hat{x}+\\hat{z})/\\sqrt2$, and $P(\\varphi)$ a turn about $z$.',
 'A circuit reads left to right and its matrices multiply right to left. Three turns and a phase reach every one-qubit gate, and $U(\\theta,\\phi,\\lambda)$ is the same statement as one matrix.',
 'An irreversible function is embedded as $|x\\rangle|y\\rangle\\mapsto|x\\rangle|y\\oplus f(x)\\rangle$, and the ancillas it needs have to be uncomputed or the interference is lost.',
 'Two qubits are $|q_1q_0\\rangle$ with $x=2q_1+q_0$; a gate on one is $A\\otimes I$ or $I\\otimes A$; a CNOT is not a gate until its control is named. CZ writes a phase and is symmetric, and SWAP costs three CNOTs.',
 'No local gate changes the Schmidt coefficients, so one entangling gate is needed and one is enough. Every one-qubit gate plus CNOT is exactly universal, and $H,S,T$ and CNOT reach any accuracy, paid for in depth.']},

{t:'box', kind:'err', hd:'Four errors that cost a whole question', html:'Reading the angle inside a rotation as the angle on the sphere, which is always wrong by a factor of two. Multiplying a circuit left to right. Dropping a global phase from a gate that is about to be controlled. And applying a one-qubit gate to the other qubit of a pair, which no later check will catch on its own.'},

{t:'box', kind:'ok', hd:'What comes next', html:'Chapter 5 runs these gates: how a circuit is actually executed, what a shot count buys against an exact statevector, and what a compiler does to a circuit before the machine sees it. Then two protocols are worked end to end on it, teleportation and Grover, using nothing beyond the gates written down here.'}

];
})();
