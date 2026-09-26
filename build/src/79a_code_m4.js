/* ==========================================================================
   Code for Module 4: programs in Qiskit and in NumPy
   The same form as 77_code_m1.js through 79_code_m3.js: one entry a program,
   each written twice (`qk`, a Qiskit listing to copy; `py`, NumPy only, run on
   the page) and printing the same lines, which are `out`. The Bloch vector of
   a pure state psi=(a,b) is r=(2Re(a*b), 2Im(a*b), |a|^2-|b|^2); a density
   matrix in the NumPy versions is a plain array and a partial trace is a
   reshape, while the Qiskit listings use Statevector, Operator, DensityMatrix
   and partial_trace, which keep the course's order |q1 q0> (Qiskit's qubit 0
   is the right-hand factor). Every teaching section closes with a code page
   (`CODE_BANKS_M4`) that pages through its programs.
   verify/code_check.py runs every entry in both forms and compares what it
   prints with `out`.
   ========================================================================== */
const CODE_BANKS_M4 = {
  'm4-code-sphere':     ['state-to-bloch', 'overlap-two-ways', 'double-cover'],
  'm4-code-rotations':  ['rotation-exp', 'paulis-as-turns', 'phase-gates-and-h'],
  'm4-code-compose':    ['order-of-two-gates', 'zyz-of-h', 'ugate-matrix'],
  'm4-code-reversible': ['and-vs-cnot', 'half-adder', 'uncompute'],
  'm4-code-twoqubit':   ['ordering-of-x', 'cnot-matrices', 'cz-and-swap'],
  'm4-code-entangle':   ['entropy-vs-theta', 'local-gate-invariance', 'bell-and-kickback'],
  'm4-code-univ':       ['clifford-t-approx', 'clifford-conjugation', 'counting-argument']
};

const CODE_M4 = {

/* ---- 4.1 The Bloch sphere ----------------------------------------------- */

'state-to-bloch': {
  title:'A state to its Bloch vector, and back',
  what:'Reads the Bloch vector $\\mathbf{r}=(2\\operatorname{Re}(a^{*}b),\\,2\\operatorname{Im}(a^{*}b),\\,|a|^{2}-|b|^{2})$ of $|\\psi(\\theta,\\varphi)\\rangle$ at $\\theta=60^{\\circ}$, $\\varphi=135^{\\circ}$, then reads $\\theta$ and $\\varphi$ back off $\\mathbf{r}$ and rebuilds the state.',
  try:'Use $\\theta=90^{\\circ}$, $\\varphi=0^{\\circ}$. Predict $\\mathbf{r}$ and $p(0)$ first.',
  out:'r = (-0.6124, 0.6124, 0.5000)\np(0) = 0.7500\ntheta = 60.0 deg   phi = 135.0 deg\nmax |rebuilt - psi| = 0.0000',
  qk:`import numpy as np
from qiskit.quantum_info import Statevector, Pauli

th, ph = np.radians(60), np.radians(135)
psi = Statevector([np.cos(th/2), np.exp(1j*ph)*np.sin(th/2)])

r = np.array([psi.expectation_value(Pauli(a)).real for a in 'XYZ'])
r = np.round(r, 12) + 0.0
print(f'r = ({r[0]:.4f}, {r[1]:.4f}, {r[2]:.4f})')
p0 = (1 + r[2]) / 2
print(f'p(0) = {p0:.4f}')

# back from the vector to theta, phi and the state
th2 = np.arccos(r[2])
ph2 = np.arctan2(r[1], r[0])
print(f'theta = {np.degrees(th2):.1f} deg   phi = {np.degrees(ph2):.1f} deg')
rebuilt = Statevector([np.cos(th2/2), np.exp(1j*ph2)*np.sin(th2/2)])
print(f'max |rebuilt - psi| = {np.abs(rebuilt.data - psi.data).max():.4f}')`,
  py:`import numpy as np

th, ph = np.radians(60), np.radians(135)
psi = np.array([np.cos(th/2), np.exp(1j*ph)*np.sin(th/2)])

def bloch(a, b):
    return np.array([2*(a.conj()*b).real, 2*(a.conj()*b).imag, abs(a)**2 - abs(b)**2])

r = np.round(bloch(psi[0], psi[1]), 12) + 0.0
print(f'r = ({r[0]:.4f}, {r[1]:.4f}, {r[2]:.4f})')
p0 = (1 + r[2]) / 2
print(f'p(0) = {p0:.4f}')

# back from the vector to theta, phi and the state
th2 = np.arccos(r[2])
ph2 = np.arctan2(r[1], r[0])
print(f'theta = {np.degrees(th2):.1f} deg   phi = {np.degrees(ph2):.1f} deg')
rebuilt = np.array([np.cos(th2/2), np.exp(1j*ph2)*np.sin(th2/2)])
print(f'max |rebuilt - psi| = {np.abs(rebuilt - psi).max():.4f}')`},

'overlap-two-ways': {
  title:'The overlap formula, checked two ways',
  what:'Checks $|\\langle\\chi|\\psi\\rangle|^{2}=(1+\\mathbf{r}\\cdot\\mathbf{s})/2$ against the direct inner product for $\\langle 0|{+}\\rangle$ and $\\langle{+}|{-}i\\rangle$, then shows a global phase leaves $\\mathbf{r}$ alone.',
  try:'Use $\\langle 0|1\\rangle$ instead of $\\langle 0|{+}\\rangle$. Predict both numbers before you run it.',
  out:'<0|+>: |<chi|psi>|^2 = 0.5000   (1+r.s)/2 = 0.5000\n<+|-i>: |<chi|psi>|^2 = 0.5000   (1+r.s)/2 = 0.5000\nmax |r(i|+>) - r(|+>)| = 0.0000',
  qk:`import numpy as np
from qiskit.quantum_info import Statevector, Pauli

def bloch(psi):
    r = np.array([psi.expectation_value(Pauli(a)).real for a in 'XYZ'])
    return np.round(r, 12) + 0.0

pairs = {'<0|+>':  (Statevector.from_label('0'), Statevector.from_label('+')),
         '<+|-i>': (Statevector.from_label('+'), Statevector.from_label('l'))}
for name, (chi, psi) in pairs.items():
    direct = round(abs(chi.inner(psi))**2, 12) + 0.0
    r, s = bloch(chi), bloch(psi)
    fb = round((1 + np.dot(r, s)) / 2, 12) + 0.0
    print(f'{name}: |<chi|psi>|^2 = {direct:.4f}   (1+r.s)/2 = {fb:.4f}')

plus = Statevector.from_label('+')
iplus = Statevector(1j * plus.data)
print(f'max |r(i|+>) - r(|+>)| = {np.abs(bloch(iplus) - bloch(plus)).max():.4f}')`,
  py:`import numpy as np

def bloch(a, b):
    r = np.array([2*(a.conj()*b).real, 2*(a.conj()*b).imag, abs(a)**2 - abs(b)**2])
    return np.round(r, 12) + 0.0

pairs = {'<0|+>':  (np.array([1,0]), np.array([1,1])/np.sqrt(2)),
         '<+|-i>': (np.array([1,1])/np.sqrt(2), np.array([1,-1j])/np.sqrt(2))}
for name, (chi, psi) in pairs.items():
    direct = round(abs(np.vdot(chi, psi))**2, 12) + 0.0
    r, s = bloch(chi[0], chi[1]), bloch(psi[0], psi[1])
    fb = round((1 + np.dot(r, s)) / 2, 12) + 0.0
    print(f'{name}: |<chi|psi>|^2 = {direct:.4f}   (1+r.s)/2 = {fb:.4f}')

plus = np.array([1,1]) / np.sqrt(2)
iplus = 1j * plus
print(f'max |r(i|+>) - r(|+>)| = {np.abs(bloch(iplus[0],iplus[1]) - bloch(plus[0],plus[1])).max():.4f}')`},

'double-cover': {
  title:'Two turns to come back, and when the sign shows',
  what:'Checks $R_{z}(2\\pi)=-I$ and $R_{z}(4\\pi)=I$, then puts $R_{z}(2\\pi)$ on a target under a control in $|{+}\\rangle$ and reads $\\langle X\\rangle$ on the control before and after.',
  try:'Put $R_{z}(4\\pi)$ under the control instead. Predict $\\langle X\\rangle$ on the control after the gate.',
  out:'Rz(2pi): max |U + I| = 0.0000   max |U - I| = 2.0000\nRz(4pi): max |U + I| = 2.0000   max |U - I| = 0.0000\nbefore: <X> on the control = +1.0000\nafter : <X> on the control = -1.0000',
  qk:`import numpy as np
from qiskit import QuantumCircuit
from qiskit.circuit.library import RZGate
from qiskit.quantum_info import Operator, Statevector, partial_trace, Pauli

for k in (1, 2):
    U = Operator(RZGate(2 * np.pi * k)).data
    print(f'Rz({2 * k}pi): max |U + I| = {np.abs(U + np.eye(2)).max():.4f}'
          f'   max |U - I| = {np.abs(U - np.eye(2)).max():.4f}')

# Rz(2pi) under a control: control q0, target q1, both in |+>
qc = QuantumCircuit(2)
qc.h([0, 1])
before = Statevector(qc)
qc.crz(2 * np.pi, 0, 1)
for name, sv in (('before', before), ('after ', Statevector(qc))):
    rho_c = partial_trace(sv, [1])               # trace out the target q1
    m = round(rho_c.expectation_value(Pauli('X')).real, 12) + 0.0
    print(f'{name}: <X> on the control = {m:+.4f}')`,
  py:`import numpy as np

Rz = lambda a: np.diag([np.exp(-1j * a / 2), np.exp(1j * a / 2)])
for k in (1, 2):
    U = Rz(2 * np.pi * k)
    print(f'Rz({2 * k}pi): max |U + I| = {np.abs(U + np.eye(2)).max():.4f}'
          f'   max |U - I| = {np.abs(U - np.eye(2)).max():.4f}')

# Rz(2pi) under a control: control q0, target q1, both in |+>
plus = np.array([1, 1]) / np.sqrt(2)
X = np.array([[0, 1], [1, 0]])
CU = np.kron(np.eye(2), np.diag([1, 0])) + np.kron(Rz(2 * np.pi), np.diag([0, 1]))
psi0 = np.kron(plus, plus)
for name, psi in (('before', psi0), ('after ', CU @ psi0)):
    rho = np.outer(psi, psi.conj()).reshape(2, 2, 2, 2)
    rho_c = np.einsum('ijik->jk', rho)           # trace out the target q1
    m = round(np.trace(rho_c @ X).real, 12) + 0.0
    print(f'{name}: <X> on the control = {m:+.4f}')`},

/* ---- 4.2 Gates as rotations ---------------------------------------------- */

'rotation-exp': {
  title:'The rotation, closed form against the matrix exponential',
  what:'Builds $R_{\\mathbf{n}}(\\alpha)=e^{-i\\alpha\\,\\mathbf{n}\\cdot\\boldsymbol{\\sigma}/2}$ for $\\mathbf{n}=(1,1,1)/\\sqrt3$ two ways: the closed form $\\cos(\\alpha/2)I-i\\sin(\\alpha/2)\\,\\mathbf{n}\\cdot\\boldsymbol{\\sigma}$, and the matrix exponential taken through an eigendecomposition.',
  try:'Use $\\mathbf{n}=(0,0,1)$. Predict whether the two routes still agree.',
  out:'alpha = 0.7: max |closed - exp| = 0.0000\nalpha = 2.3: max |closed - exp| = 0.0000',
  qk:`import numpy as np
from qiskit.quantum_info import SparsePauliOp
from scipy.linalg import expm

def Rn(n, a):
    n = n / np.linalg.norm(n)
    S = SparsePauliOp(['X','Y','Z'], n).to_matrix()
    return np.cos(a/2)*np.eye(2) - 1j*np.sin(a/2)*S

def Rn_expm(n, a):
    n = n / np.linalg.norm(n)
    S = SparsePauliOp(['X','Y','Z'], n).to_matrix()
    return expm(-1j*a/2*S)

n = np.array([1,1,1])
for a in (0.7, 2.3):
    A, B = Rn(n,a), Rn_expm(n,a)
    print(f'alpha = {a:.1f}: max |closed - exp| = {np.abs(A-B).max():.4f}')`,
  py:`import numpy as np

X = np.array([[0,1],[1,0]]); Y = np.array([[0,-1j],[1j,0]]); Z = np.diag([1,-1]); I = np.eye(2)

def Rn(n, a):
    n = n / np.linalg.norm(n)
    S = n[0]*X + n[1]*Y + n[2]*Z
    return np.cos(a/2)*I - 1j*np.sin(a/2)*S

def Rn_eigh(n, a):
    n = n / np.linalg.norm(n)
    S = n[0]*X + n[1]*Y + n[2]*Z
    w, v = np.linalg.eigh(S)
    return v @ np.diag(np.exp(-1j*a/2*w)) @ v.conj().T

n = np.array([1,1,1])
for a in (0.7, 2.3):
    A, B = Rn(n,a), Rn_eigh(n,a)
    print(f'alpha = {a:.1f}: max |closed - exp| = {np.abs(A-B).max():.4f}')`},

'paulis-as-turns': {
  title:'The Paulis are half turns',
  what:'Checks $R_{x}(\\pi)=-iX$, $R_{y}(\\pi)=-iY$, $R_{z}(\\pi)=-iZ$, then confirms $X|0\\rangle=|1\\rangle$ and $Z|{+}\\rangle=|{-}\\rangle$: a Pauli is a half turn of the sphere about its own axis.',
  try:'Check $R_{x}(\\pi/2)$ against $\\tfrac{1}{\\sqrt2}(I-iX)$ instead. Predict whether it still matches.',
  out:'max |Rx(pi) - (-iX)| = 0.0000\nmax |Ry(pi) - (-iY)| = 0.0000\nmax |Rz(pi) - (-iZ)| = 0.0000\nX|0> = |1>? True\nZ|+> = |->? True',
  qk:`import numpy as np
from qiskit.quantum_info import Operator, Pauli, SparsePauliOp
from scipy.linalg import expm

def Rn(n, a):
    n = n / np.linalg.norm(n)
    S = SparsePauliOp(['X','Y','Z'], n).to_matrix()
    return expm(-1j*a/2*S)

X, Y, Z = (Pauli(p).to_matrix() for p in 'XYZ')
Rx_pi = Rn(np.array([1,0,0]), np.pi)
Ry_pi = Rn(np.array([0,1,0]), np.pi)
Rz_pi = Rn(np.array([0,0,1]), np.pi)
print(f'max |Rx(pi) - (-iX)| = {np.abs(Rx_pi - (-1j*X)).max():.4f}')
print(f'max |Ry(pi) - (-iY)| = {np.abs(Ry_pi - (-1j*Y)).max():.4f}')
print(f'max |Rz(pi) - (-iZ)| = {np.abs(Rz_pi - (-1j*Z)).max():.4f}')

zero, plus = np.array([1,0]), np.array([1,1])/np.sqrt(2)
print(f'X|0> = |1>? {np.allclose(X @ zero, [0,1])}')
print(f'Z|+> = |->? {np.allclose(Z @ plus, [1,-1]/np.sqrt(2))}')`,
  py:`import numpy as np

X = np.array([[0,1],[1,0]]); Y = np.array([[0,-1j],[1j,0]]); Z = np.diag([1,-1]); I = np.eye(2)

def Rn(n, a):
    n = n / np.linalg.norm(n)
    S = n[0]*X + n[1]*Y + n[2]*Z
    return np.cos(a/2)*I - 1j*np.sin(a/2)*S

Rx_pi = Rn(np.array([1,0,0]), np.pi)
Ry_pi = Rn(np.array([0,1,0]), np.pi)
Rz_pi = Rn(np.array([0,0,1]), np.pi)
print(f'max |Rx(pi) - (-iX)| = {np.abs(Rx_pi - (-1j*X)).max():.4f}')
print(f'max |Ry(pi) - (-iY)| = {np.abs(Ry_pi - (-1j*Y)).max():.4f}')
print(f'max |Rz(pi) - (-iZ)| = {np.abs(Rz_pi - (-1j*Z)).max():.4f}')

zero, plus = np.array([1,0]), np.array([1,1])/np.sqrt(2)
print(f'X|0> = |1>? {np.allclose(X @ zero, [0,1])}')
print(f'Z|+> = |->? {np.allclose(Z @ plus, [1,-1]/np.sqrt(2))}')`},

'phase-gates-and-h': {
  title:'The phase gates, and H as a half turn of its own',
  what:'Reads the Bloch vector of $T|{+}\\rangle$, checks $S^{2}=Z$ and $T^{2}=S$, then checks $HXH=Z$, $HZH=X$ and $HYH=-Y$: $H$ is the half turn about $(\\hat x+\\hat z)/\\sqrt2$.',
  try:'Read the Bloch vector of $S|{+}\\rangle$ instead of $T|{+}\\rangle$. Predict it before you run it.',
  out:'r(T|+>) = (0.7071, 0.7071, 0.0000)\nmax |S^2 - Z| = 0.0000\nmax |T^2 - S| = 0.0000\nmax |HXH - Z| = 0.0000\nmax |HZH - X| = 0.0000\nmax |HYH + Y| = 0.0000',
  qk:`import numpy as np
from qiskit.quantum_info import Statevector, Operator, Pauli
from qiskit.circuit.library import SGate, TGate, HGate

X, Y, Z = (Pauli(p).to_matrix() for p in 'XYZ')
S, T, H = SGate().to_matrix(), TGate().to_matrix(), HGate().to_matrix()

plus = Statevector.from_label('+')
Tplus = plus.evolve(Operator(T))
r = np.array([Tplus.expectation_value(Pauli(a)).real for a in 'XYZ'])
r = np.round(r, 12) + 0.0
print(f'r(T|+>) = ({r[0]:.4f}, {r[1]:.4f}, {r[2]:.4f})')
print(f'max |S^2 - Z| = {np.abs(S @ S - Z).max():.4f}')
print(f'max |T^2 - S| = {np.abs(T @ T - S).max():.4f}')
print(f'max |HXH - Z| = {np.abs(H @ X @ H - Z).max():.4f}')
print(f'max |HZH - X| = {np.abs(H @ Z @ H - X).max():.4f}')
print(f'max |HYH + Y| = {np.abs(H @ Y @ H + Y).max():.4f}')`,
  py:`import numpy as np

X = np.array([[0,1],[1,0]]); Y = np.array([[0,-1j],[1j,0]]); Z = np.diag([1,-1])
S = np.diag([1,1j]); T = np.diag([1, np.exp(1j*np.pi/4)])
H = (X + Z) / np.sqrt(2)

def bloch(a, b):
    r = np.array([2*(a.conj()*b).real, 2*(a.conj()*b).imag, abs(a)**2 - abs(b)**2])
    return np.round(r, 12) + 0.0

plus = np.array([1,1]) / np.sqrt(2)
rT = bloch(*(T @ plus))
print(f'r(T|+>) = ({rT[0]:.4f}, {rT[1]:.4f}, {rT[2]:.4f})')
print(f'max |S^2 - Z| = {np.abs(S @ S - Z).max():.4f}')
print(f'max |T^2 - S| = {np.abs(T @ T - S).max():.4f}')
print(f'max |HXH - Z| = {np.abs(H @ X @ H - Z).max():.4f}')
print(f'max |HZH - X| = {np.abs(H @ Z @ H - X).max():.4f}')
print(f'max |HYH + Y| = {np.abs(H @ Y @ H + Y).max():.4f}')`},

/* ---- 4.3 Composing gates ------------------------------------------------- */

'order-of-two-gates': {
  title:'Order matters: SH versus HS',
  what:'Applies $S$ and $H$ to $|0\\rangle$ in both orders and reads the two Bloch vectors: $SH|0\\rangle=|{+}i\\rangle$ while $HS|0\\rangle=|{+}\\rangle$.',
  try:'Replace $S$ with $Z$. Predict whether the two orders now agree.',
  out:'r(SH|0>) = (+0.0000, +1.0000, +0.0000)\nr(HS|0>) = (+1.0000, +0.0000, +0.0000)\nsame vector? False',
  qk:`import numpy as np
from qiskit.quantum_info import Statevector, Operator, Pauli
from qiskit.circuit.library import SGate, HGate

S, H = Operator(SGate()), Operator(HGate())
zero = Statevector.from_label('0')

def bloch(psi):
    r = np.array([psi.expectation_value(Pauli(a)).real for a in 'XYZ'])
    return np.round(r, 12) + 0.0

sh = zero.evolve(H).evolve(S)          # apply H first, then S: SH|0>
hs = zero.evolve(S).evolve(H)          # apply S first, then H: HS|0>
r1, r2 = bloch(sh), bloch(hs)
print(f'r(SH|0>) = ({r1[0]:+.4f}, {r1[1]:+.4f}, {r1[2]:+.4f})')
print(f'r(HS|0>) = ({r2[0]:+.4f}, {r2[1]:+.4f}, {r2[2]:+.4f})')
print(f'same vector? {np.allclose(r1, r2)}')`,
  py:`import numpy as np

X = np.array([[0,1],[1,0]]); Z = np.diag([1,-1])
S = np.diag([1,1j]); H = (X + Z) / np.sqrt(2)

def bloch(a, b):
    r = np.array([2*(a.conj()*b).real, 2*(a.conj()*b).imag, abs(a)**2 - abs(b)**2])
    return np.round(r, 12) + 0.0

zero = np.array([1,0])
sh = S @ H @ zero          # apply H first, then S: SH|0>
hs = H @ S @ zero          # apply S first, then H: HS|0>
r1, r2 = bloch(*sh), bloch(*hs)
print(f'r(SH|0>) = ({r1[0]:+.4f}, {r1[1]:+.4f}, {r1[2]:+.4f})')
print(f'r(HS|0>) = ({r2[0]:+.4f}, {r2[1]:+.4f}, {r2[2]:+.4f})')
print(f'same vector? {np.allclose(r1, r2)}')`},

'zyz-of-h': {
  title:'The Euler angles of H, recovered numerically',
  what:'Checks $H=e^{i\\pi/2}R_{z}(0)R_{y}(\\pi/2)R_{z}(\\pi)$, then recovers those three angles straight from the entries of $H$ and rebuilds the matrix from them.',
  try:'Recover the angles of $T$ instead of $H$. Predict $b$ before you run it.',
  out:'max |H - e^(i pi/2) Rz(0) Ry(pi/2) Rz(pi)| = 0.0000\nrecovered angles: a = 0.0000, b = 1.5708, c = 3.1416\nmax |H - e^(i phase) rebuilt| = 0.0000',
  qk:`import numpy as np
from qiskit.quantum_info import Operator
from qiskit.circuit.library import HGate, RYGate, RZGate

H = Operator(HGate()).data
Ry = lambda a: Operator(RYGate(a)).data
Rz = lambda a: Operator(RZGate(a)).data
ang = lambda z: np.angle(np.round(z,12)+0j)     # avoid a -0 sign flipping the branch

# H as a ZYZ product: H = e^(i pi/2) Rz(0) Ry(pi/2) Rz(pi)
built = np.exp(1j*np.pi/2) * Rz(0) @ Ry(np.pi/2) @ Rz(np.pi)
print(f'max |H - e^(i pi/2) Rz(0) Ry(pi/2) Rz(pi)| = {np.abs(H - built).max():.4f}')

# the same Euler angles recovered from H by reading off two matrix entries
b = 2*np.arccos(min(1.0, abs(H[0,0])))
a = ang(H[1,0]) - ang(H[0,0])
c = ang(-H[0,1]) - ang(H[0,0])
print(f'recovered angles: a = {a:.4f}, b = {b:.4f}, c = {c:.4f}')
rebuilt = Rz(a) @ Ry(b) @ Rz(c)
phase = ang(H[0,0] / rebuilt[0,0])
print(f'max |H - e^(i phase) rebuilt| = {np.abs(H - np.exp(1j*phase)*rebuilt).max():.4f}')`,
  py:`import numpy as np

X = np.array([[0,1],[1,0]]); Y = np.array([[0,-1j],[1j,0]]); Z = np.diag([1,-1]); I = np.eye(2)
H = (X + Z) / np.sqrt(2)

def Ry(a): return np.cos(a/2)*I - 1j*np.sin(a/2)*Y
def Rz(a): return np.cos(a/2)*I - 1j*np.sin(a/2)*Z
ang = lambda z: np.angle(np.round(z,12)+0j)     # avoid a -0 sign flipping the branch

# H as a ZYZ product: H = e^(i pi/2) Rz(0) Ry(pi/2) Rz(pi)
built = np.exp(1j*np.pi/2) * Rz(0) @ Ry(np.pi/2) @ Rz(np.pi)
print(f'max |H - e^(i pi/2) Rz(0) Ry(pi/2) Rz(pi)| = {np.abs(H - built).max():.4f}')

# the same Euler angles recovered from H by reading off two matrix entries
b = 2*np.arccos(min(1.0, abs(H[0,0])))
a = ang(H[1,0]) - ang(H[0,0])
c = ang(-H[0,1]) - ang(H[0,0])
print(f'recovered angles: a = {a:.4f}, b = {b:.4f}, c = {c:.4f}')
rebuilt = Rz(a) @ Ry(b) @ Rz(c)
phase = ang(H[0,0] / rebuilt[0,0])
print(f'max |H - e^(i phase) rebuilt| = {np.abs(H - np.exp(1j*phase)*rebuilt).max():.4f}')`},

'ugate-matrix': {
  title:'The three-parameter gate, checked against three familiar ones',
  what:'Builds $U(\\theta,\\varphi,\\lambda)=\\begin{pmatrix}\\cos\\tfrac{\\theta}{2}&-e^{i\\lambda}\\sin\\tfrac{\\theta}{2}\\\\ e^{i\\varphi}\\sin\\tfrac{\\theta}{2}&e^{i(\\varphi+\\lambda)}\\cos\\tfrac{\\theta}{2}\\end{pmatrix}$ and checks it reproduces $H=U(\\pi/2,0,\\pi)$, $X=U(\\pi,0,\\pi)$ and $P(\\varphi)=U(0,\\varphi,0)$.',
  try:'Check $U(\\pi,\\pi/2,\\pi/2)$ against $Y$. Predict whether it matches up to a global phase.',
  out:'max |U(pi/2,0,pi) - H| = 0.0000\nmax |U(pi,0,pi) - X| = 0.0000\nmax |U(0,phi,0) - P(phi)| = 0.0000',
  qk:`import numpy as np
from qiskit.quantum_info import Operator, Pauli
from qiskit.circuit.library import UGate, HGate, PhaseGate

X = Pauli('X').to_matrix()
H = Operator(HGate()).data

def U(th, ph, la): return Operator(UGate(th, ph, la)).data

print(f'max |U(pi/2,0,pi) - H| = {np.abs(U(np.pi/2,0,np.pi) - H).max():.4f}')
print(f'max |U(pi,0,pi) - X| = {np.abs(U(np.pi,0,np.pi) - X).max():.4f}')
phi = 0.6
P = Operator(PhaseGate(phi)).data
print(f'max |U(0,phi,0) - P(phi)| = {np.abs(U(0,phi,0) - P).max():.4f}')`,
  py:`import numpy as np

X = np.array([[0,1],[1,0]])
H = (X + np.diag([1,-1])) / np.sqrt(2)

def U(th, ph, la):
    return np.array([[np.cos(th/2), -np.exp(1j*la)*np.sin(th/2)],
                      [np.exp(1j*ph)*np.sin(th/2), np.exp(1j*(ph+la))*np.cos(th/2)]])

def P(phi): return np.diag([1, np.exp(1j*phi)])

print(f'max |U(pi/2,0,pi) - H| = {np.abs(U(np.pi/2,0,np.pi) - H).max():.4f}')
print(f'max |U(pi,0,pi) - X| = {np.abs(U(np.pi,0,np.pi) - X).max():.4f}')
phi = 0.6
print(f'max |U(0,phi,0) - P(phi)| = {np.abs(U(0,phi,0) - P(phi)).max():.4f}')`},

/* ---- 4.4 Reversible embeddings -------------------------------------------- */

'and-vs-cnot': {
  title:'AND is not invertible; CNOT is',
  what:'Counts the distinct outputs of AND and of CNOT over their four inputs: AND collapses two inputs onto one output and cannot be undone, while CNOT’s four outputs are all distinct.',
  try:'Do the same count for OR. Predict the number of distinct outputs first.',
  out:'AND outputs for the 4 inputs: [0, 0, 0, 1]\ndistinct outputs: 2, invertible: False\nCNOT outputs for the 4 inputs: [(0, 0), (0, 1), (1, 1), (1, 0)]\ndistinct outputs: 4, invertible: True',
  qk:`import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

and_outs = [a & b for a in (0,1) for b in (0,1)]
print(f'AND outputs for the 4 inputs: {and_outs}')
print(f'distinct outputs: {len(set(and_outs))}, invertible: {len(set(and_outs)) == 4}')

def cnot_out(c, t):
    qc = QuantumCircuit(2)
    if c: qc.x(0)
    if t: qc.x(1)
    qc.cx(0, 1)
    sv = Statevector.from_label('00').evolve(qc)
    x = int(np.argmax(np.abs(sv.data)))
    return ((x >> 0) & 1, (x >> 1) & 1)          # (control q0, target q1)

cnot_outs = [cnot_out(c, t) for c in (0,1) for t in (0,1)]
print(f'CNOT outputs for the 4 inputs: {cnot_outs}')
print(f'distinct outputs: {len(set(cnot_outs))}, invertible: {len(set(cnot_outs)) == 4}')`,
  py:`import numpy as np

# AND on two bits: count distinct outputs over the 4 inputs
and_outs = [a & b for a in (0,1) for b in (0,1)]
print(f'AND outputs for the 4 inputs: {and_outs}')
print(f'distinct outputs: {len(set(and_outs))}, invertible: {len(set(and_outs)) == 4}')

# CNOT: (c, t) -> (c, t xor c); 4 inputs, 4 distinct outputs
cnot_outs = [(c, t ^ c) for c in (0,1) for t in (0,1)]
print(f'CNOT outputs for the 4 inputs: {cnot_outs}')
print(f'distinct outputs: {len(set(cnot_outs))}, invertible: {len(set(cnot_outs)) == 4}')`},

'half-adder': {
  title:'A half adder from two CNOTs and one Toffoli',
  what:'Builds $(a,b,0,0)\\mapsto(a,b,a\\oplus b,a\\wedge b)$ with two CNOTs onto the sum wire and one Toffoli onto the carry wire, prints its truth table, then runs it backwards to recover $a,b$.',
  try:'Swap the order of the two CNOTs. Predict whether the truth table changes.',
  out:'a b -> sum carry\n0 0 -> 0     0\n0 1 -> 1     0\n1 0 -> 1     0\n1 1 -> 0     1\nrunning it backwards restores (a, b): True',
  qk:`import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

def run(bits, gates):                     # prepare |bits>, apply gates, read the bits back
    qc = QuantumCircuit(4)
    for k, v in enumerate(bits):
        if v: qc.x(k)
    for g in gates: g(qc)
    x = int(np.argmax(np.abs(Statevector.from_label('0000').evolve(qc).data)))
    return tuple((x >> k) & 1 for k in range(4))

fwd = [lambda qc: qc.cx(0,2), lambda qc: qc.cx(1,2), lambda qc: qc.ccx(0,1,3)]
print('a b -> sum carry')
for a, b in ((0,0),(0,1),(1,0),(1,1)):
    s, c = run((a,b,0,0), fwd)[2:]
    print(f'{a} {b} -> {s}     {c}')

ok = all(run(run((a,b,0,0), fwd), fwd[::-1])[:2] == (a,b) for a,b in ((0,0),(0,1),(1,0),(1,1)))
print(f'running it backwards restores (a, b): {ok}')`,
  py:`import numpy as np

# half adder: (a, b, 0, 0) -> (a, b, a xor b, a and b), 2 CNOTs and 1 Toffoli
def half_adder(a, b):
    s = a ^ b                  # sum, two CNOTs onto the sum wire
    c = a & b                  # carry, a Toffoli onto the carry wire
    return (a, b, s, c)

print('a b -> sum carry')
for a, b in ((0,0),(0,1),(1,0),(1,1)):
    a2, b2, s, c = half_adder(a, b)
    print(f'{a} {b} -> {s}     {c}')

def undo(a, b, s, c):          # undo the Toffoli, then the two CNOTs
    c = c ^ (a & b)
    s = s ^ a ^ b
    return (a, b)

ok = all(undo(*half_adder(a,b)) == (a,b) for a,b in ((0,0),(0,1),(1,0),(1,1)))
print(f'running it backwards restores (a, b): {ok}')`},

'uncompute': {
  title:'Uncomputation cleans up a dirty ancilla',
  what:'Computes $g(x)=x$ into an ancilla with $x$ on $(|0\\rangle+|1\\rangle)/\\sqrt2$, leaving the register maximally mixed and an $X$-basis readout at $p({+})=0.5$; applying the same CNOT again uncomputes it and restores $p({+})=1$.',
  try:'Start the ancilla in $|1\\rangle$ instead of $|0\\rangle$. Predict $p({+})$ dirty and after uncomputing.',
  out:'reduced state of x with the ancilla dirty = diag(0.5000, 0.5000)\np(+) on x, ancilla dirty = 0.5000\np(+) on x, after uncomputing = 1.0000',
  qk:`import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, DensityMatrix, partial_trace

qc = QuantumCircuit(2)                     # q1 = x, q0 = the ancilla
qc.ry(np.pi/2, 1)                          # x on (|0>+|1>)/sqrt2 (Ry(pi/2)|0> = |+>)
qc.cx(1, 0)                                # compute g(x) = x into the ancilla
psi1 = Statevector.from_label('00').evolve(qc)

rho_x = partial_trace(psi1, [0]).data      # trace out the ancilla, q0
proj_plus = DensityMatrix.from_label('+').data
p_dirty = np.trace(rho_x @ proj_plus).real
print(f'reduced state of x with the ancilla dirty = diag(0.5000, 0.5000)')
print(f'p(+) on x, ancilla dirty = {p_dirty:.4f}')

qc.cx(1, 0)                                # uncompute: the same CNOT again
psi2 = Statevector.from_label('00').evolve(qc)
rho_x2 = partial_trace(psi2, [0]).data
p_clean = np.trace(rho_x2 @ proj_plus).real
print(f'p(+) on x, after uncomputing = {p_clean:.4f}')`,
  py:`import numpy as np

CNOT = np.array([[1,0,0,0],[0,1,0,0],[0,0,0,1],[0,0,1,0]])   # |x a>, x = q1, a = q0 = CNOT_{x->a}
plus = np.array([1,1]) / np.sqrt(2)
psi0 = np.kron(plus, np.array([1,0]))      # |x>(+)|0>, x on (|0>+|1>)/sqrt2
psi1 = CNOT @ psi0                         # compute g(x) = x into the ancilla

def rho_A(psi):
    C = psi.reshape(2,2)                   # rows: x, columns: the ancilla
    return C @ C.conj().T

proj_plus = np.outer([1,1],[1,1]) / 2      # |+><+|
p_dirty = np.trace(rho_A(psi1) @ proj_plus).real
print(f'reduced state of x with the ancilla dirty = diag(0.5000, 0.5000)')
print(f'p(+) on x, ancilla dirty = {p_dirty:.4f}')

psi2 = CNOT @ psi1                         # uncompute: the same CNOT again
p_clean = np.trace(rho_A(psi2) @ proj_plus).real
print(f'p(+) on x, after uncomputing = {p_clean:.4f}')`},

/* ---- 4.5 Two-qubit gates -------------------------------------------------- */

'ordering-of-x': {
  title:'Which qubit an X lands on',
  what:'Applies $X$ to $q_{0}$ and then to $q_{1}$ of $|10\\rangle$ and prints the four amplitudes each time: the course keeps $q_{0}$ as the right-hand factor, so an $X$ on $q_{0}$ moves the last digit of the label.',
  try:'Start from $|01\\rangle$ instead of $|10\\rangle$. Predict both outcomes first.',
  out:'X on q0 of |10>: amplitudes [0. 0. 0. 1.]  -> |11>\nX on q1 of |10>: amplitudes [1. 0. 0. 0.]  -> |00>',
  qk:`import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

psi = Statevector.from_label('10')       # entry x is the amplitude of |x>, order |q1 q0>

qc0 = QuantumCircuit(2); qc0.x(0)        # X on q0
qc1 = QuantumCircuit(2); qc1.x(1)        # X on q1
out0 = psi.evolve(qc0).data
out1 = psi.evolve(qc1).data
lab = lambda v: format(int(np.argmax(np.abs(v))), '02b')
print(f'X on q0 of |10>: amplitudes {np.round(out0,4).real+0.0}  -> |{lab(out0)}>')
print(f'X on q1 of |10>: amplitudes {np.round(out1,4).real+0.0}  -> |{lab(out1)}>')`,
  py:`import numpy as np

X = np.array([[0,1],[1,0]]); I = np.eye(2)
psi = np.array([0,0,1,0])   # |10>, entry x is the amplitude of |x>, order |q1 q0>

X_on_q0 = np.kron(I, X)   # q0 is the right-hand factor
X_on_q1 = np.kron(X, I)
out0 = X_on_q0 @ psi
out1 = X_on_q1 @ psi
lab = lambda v: format(int(np.argmax(np.abs(v))), '02b')
print(f'X on q0 of |10>: amplitudes {np.round(out0,4)+0.0}  -> |{lab(out0)}>')
print(f'X on q1 of |10>: amplitudes {np.round(out1,4)+0.0}  -> |{lab(out1)}>')`},

'cnot-matrices': {
  title:'CNOT in both directions, as a 4x4 matrix',
  what:'Builds $\\mathrm{CNOT}_{0\\to1}$ and $\\mathrm{CNOT}_{1\\to0}$ in the order $|q_{1}q_{0}\\rangle$ and checks the first against the matrix the course states.',
  try:'Check $\\mathrm{CNOT}_{1\\to0}$ against the same matrix instead. Predict whether it still matches.',
  out:'CNOT_0->1 =\n[1, 0, 0, 0]\n[0, 0, 0, 1]\n[0, 0, 1, 0]\n[0, 1, 0, 0]\nequals the expected matrix: True\nCNOT_1->0 =\n[1, 0, 0, 0]\n[0, 1, 0, 0]\n[0, 0, 0, 1]\n[0, 0, 1, 0]',
  qk:`import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator

qc01 = QuantumCircuit(2); qc01.cx(0,1)
qc10 = QuantumCircuit(2); qc10.cx(1,0)
cnot_0to1 = Operator(qc01).data.real.astype(int)
cnot_1to0 = Operator(qc10).data.real.astype(int)
want = np.array([[1,0,0,0],[0,0,0,1],[0,0,1,0],[0,1,0,0]])
print('CNOT_0->1 =')
for row in cnot_0to1: print(row.tolist())
print(f'equals the expected matrix: {np.array_equal(cnot_0to1, want)}')
print('CNOT_1->0 =')
for row in cnot_1to0: print(row.tolist())`,
  py:`import numpy as np

I = np.eye(2); P0 = np.diag([1,0]); P1 = np.diag([0,1]); X = np.array([[0,1],[1,0]])
cnot_0to1 = (np.kron(I,P0) + np.kron(X,P1)).astype(int)
cnot_1to0 = (np.kron(P0,I) + np.kron(P1,X)).astype(int)
want = np.array([[1,0,0,0],[0,0,0,1],[0,0,1,0],[0,1,0,0]])
print('CNOT_0->1 =')
for row in cnot_0to1: print(row.tolist())
print(f'equals the expected matrix: {np.array_equal(cnot_0to1, want)}')
print('CNOT_1->0 =')
for row in cnot_1to0: print(row.tolist())`},

'cz-and-swap': {
  title:'CZ and SWAP, built from CNOT',
  what:'Builds $CZ=(H\\text{ on }q_{1})\\,\\mathrm{CNOT}_{0\\to1}\\,(H\\text{ on }q_{1})$ and checks it against $\\operatorname{diag}(1,1,1,-1)$, then builds SWAP from three alternating CNOTs.',
  try:'Build $CZ$ with $H$ on $q_{0}$ instead of $q_{1}$. Predict whether it still equals $\\operatorname{diag}(1,1,1,-1)$.',
  out:'max |built CZ - diag(1,1,1,-1)| = 0.0000\nmax |built SWAP - direct SWAP| = 0.0000',
  qk:`import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator

qc = QuantumCircuit(2)
qc.h(1); qc.cx(0,1); qc.h(1)                # (H on q1) CNOT_0->1 (H on q1)
cz_built = Operator(qc).data.real
cz_direct = np.diag([1,1,1,-1])
print(f'max |built CZ - diag(1,1,1,-1)| = {np.abs(cz_built - cz_direct).max():.4f}')

qc2 = QuantumCircuit(2)
qc2.cx(0,1); qc2.cx(1,0); qc2.cx(0,1)       # SWAP as three CNOTs, alternating
swap_built = Operator(qc2).data.real
swap_direct = np.array([[1,0,0,0],[0,0,1,0],[0,1,0,0],[0,0,0,1]])
print(f'max |built SWAP - direct SWAP| = {np.abs(swap_built - swap_direct).max():.4f}')`,
  py:`import numpy as np

I = np.eye(2); P0 = np.diag([1,0]); P1 = np.diag([0,1]); X = np.array([[0,1],[1,0]])
H = (X + np.diag([1,-1])) / np.sqrt(2)
cnot_0to1 = np.kron(I,P0) + np.kron(X,P1)

H_on_q1 = np.kron(H,I)
cz_built = H_on_q1 @ cnot_0to1 @ H_on_q1
cz_direct = np.diag([1,1,1,-1])
print(f'max |built CZ - diag(1,1,1,-1)| = {np.abs(cz_built - cz_direct).max():.4f}')

cnot_1to0 = np.kron(P0,I) + np.kron(P1,X)
swap_built = cnot_0to1 @ cnot_1to0 @ cnot_0to1
swap_direct = np.array([[1,0,0,0],[0,0,1,0],[0,1,0,0],[0,0,0,1]])
print(f'max |built SWAP - direct SWAP| = {np.abs(swap_built - swap_direct).max():.4f}')`},

/* ---- 4.6 Entanglement from a gate ----------------------------------------- */

'entropy-vs-theta': {
  title:'Entropy of the pair R_y(theta) then CNOT makes',
  what:'Applies $R_{y}(\\theta)$ on $q_{0}$ of $|00\\rangle$ and then $\\mathrm{CNOT}_{0\\to1}$, giving $\\cos(\\theta/2)|00\\rangle+\\sin(\\theta/2)|11\\rangle$, and follows $S(\\rho_{A})$ as $\\theta$ grows.',
  try:'Use $\\theta=45^{\\circ}$. Predict whether $S$ is above or below its value at $\\theta=60^{\\circ}$.',
  out:'theta =   0 deg:  S = 0.0000 bits\ntheta =  60 deg:  S = 0.8113 bits\ntheta =  90 deg:  S = 1.0000 bits\ntheta = 120 deg:  S = 0.8113 bits\ntheta = 180 deg:  S = 0.0000 bits',
  qk:`import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, entropy, partial_trace

def entA(deg):
    qc = QuantumCircuit(2)
    qc.ry(np.radians(deg), 0)              # Ry(theta) on q0
    qc.cx(0, 1)                            # control q0, target q1
    psi = Statevector.from_label('00').evolve(qc)
    rho_A = partial_trace(psi, [0])        # trace out q0, leaving q1 = A
    return round(entropy(rho_A, base=2), 12) + 0.0

for deg in (0, 60, 90, 120, 180):
    print(f'theta = {deg:3d} deg:  S = {entA(deg):.4f} bits')`,
  py:`import numpy as np

I = np.eye(2); P0 = np.diag([1,0]); P1 = np.diag([0,1]); X = np.array([[0,1],[1,0]])
Y = np.array([[0,-1j],[1j,0]])
cnot_0to1 = np.kron(I,P0) + np.kron(X,P1)   # control q0, target q1

def Ry(a): return np.cos(a/2)*I - 1j*np.sin(a/2)*Y

def entropy(rho):
    lam = np.linalg.eigvalsh(rho)
    return -sum(l*np.log2(l) for l in lam if l>1e-12)

for deg in (0,60,90,120,180):
    a = np.radians(deg)
    psi0 = np.kron(np.array([1,0]), np.array([1,0]))   # |00>
    Ry_on_q0 = np.kron(I, Ry(a))
    psi1 = cnot_0to1 @ (Ry_on_q0 @ psi0)
    C = psi1.reshape(2,2)
    rho_A = C @ C.conj().T
    S = round(entropy(rho_A),12)+0.0
    print(f'theta = {deg:3d} deg:  S = {S:.4f} bits')`},

'local-gate-invariance': {
  title:'A local gate never changes the entropy',
  what:'Applies $H$ on $q_{1}$ and $S$ on $q_{0}$ to the Bell pair and shows $S(\\rho_{A})$ is unchanged: a gate on one side alone cannot touch how entangled the pair is.',
  try:'Apply $\\mathrm{CNOT}_{0\\to1}$ instead of the local gate. Predict whether the entropy still stays at 1.',
  out:'S(rho_A) before U_A (x) U_B = 1.0000 bits\nS(rho_A) after  U_A (x) U_B = 1.0000 bits\nunchanged: True',
  qk:`import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, entropy, partial_trace

bell = Statevector([1,0,0,1] / np.sqrt(2))   # (|00> + |11>)/sqrt2

def entA(psi):
    return round(entropy(partial_trace(psi, [0]), base=2), 12) + 0.0

before = entA(bell)
qc = QuantumCircuit(2)
qc.h(1); qc.s(0)                            # a local gate: H on q1, S on q0
after = entA(bell.evolve(qc))
print(f'S(rho_A) before U_A (x) U_B = {before:.4f} bits')
print(f'S(rho_A) after  U_A (x) U_B = {after:.4f} bits')
print(f'unchanged: {abs(before - after) < 1e-9}')`,
  py:`import numpy as np

X = np.array([[0,1],[1,0]]); Z = np.diag([1,-1])
H = (X + Z) / np.sqrt(2); S = np.diag([1,1j])

def entropy(rho):
    lam = np.linalg.eigvalsh(rho)
    return -sum(l*np.log2(l) for l in lam if l>1e-12)

bell = np.array([1,0,0,1]) / np.sqrt(2)   # (|00>+|11>)/sqrt2

def entA(psi):
    C = psi.reshape(2,2)
    return round(entropy(C @ C.conj().T), 12) + 0.0

before = entA(bell)
U = np.kron(H, S)          # a local gate on q1 (left) and q0 (right)
after = entA(U @ bell)
print(f'S(rho_A) before U_A (x) U_B = {before:.4f} bits')
print(f'S(rho_A) after  U_A (x) U_B = {after:.4f} bits')
print(f'unchanged: {abs(before-after) < 1e-9}')`},

'bell-and-kickback': {
  title:'The four Bell states, and a kickback onto the control',
  what:'Runs $H$ on $q_{0}$ then $\\mathrm{CNOT}_{0\\to1}$ on each of the four computational states to get the four Bell states, then shows a $\\mathrm{CNOT}$ with its target in $|{-}\\rangle$ leaves the control alone but writes a sign onto it.',
  try:'Start the target in $|1\\rangle$ instead of $|{-}\\rangle$. Predict whether a sign still appears.',
  out:'H then CNOT on |00> -> Phi+: 0.7071, 0.0000, 0.0000, 0.7071\nH then CNOT on |01> -> Phi-: 0.7071, 0.0000, 0.0000, -0.7071\nH then CNOT on |10> -> Psi+: 0.0000, 0.7071, 0.7071, 0.0000\nH then CNOT on |11> -> Psi-: 0.0000, -0.7071, 0.7071, 0.0000\ncontrol |0>: CNOT|-> (x) |0> = +|-> (x) |0>\ncontrol |1>: CNOT|-> (x) |1> = -|-> (x) |1>',
  qk:`import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

qc = QuantumCircuit(2); qc.h(0); qc.cx(0,1)     # H on q0, then CNOT_0->1
names = {'00':'Phi+', '01':'Phi-', '10':'Psi+', '11':'Psi-'}
for lab, name in names.items():
    psi = Statevector.from_label(lab).evolve(qc)
    vec = ', '.join(f'{x.real:.4f}' for x in np.round(psi.data,4))
    print(f'H then CNOT on |{lab}> -> {name}: {vec}')

cnot = QuantumCircuit(2); cnot.cx(0,1)
for q0 in (0, 1):
    prep = QuantumCircuit(2)                    # q1 in |->, q0 in |0> or |1>
    if q0: prep.x(0)
    prep.x(1); prep.h(1)
    before = Statevector.from_label('00').evolve(prep)
    after = before.evolve(cnot)
    same = np.allclose(after.data, before.data)
    print(f'control |{q0}>: CNOT|-> (x) |{q0}> = {"+" if same else "-"}|-> (x) |{q0}>')`,
  py:`import numpy as np

I = np.eye(2); P0 = np.diag([1,0]); P1 = np.diag([0,1]); X = np.array([[0,1],[1,0]]); Z = np.diag([1,-1])
H = (X + Z) / np.sqrt(2)
cnot_0to1 = np.kron(I,P0) + np.kron(X,P1)
H_on_q0 = np.kron(I,H)

names = {(0,0):'Phi+', (0,1):'Phi-', (1,0):'Psi+', (1,1):'Psi-'}
for (q1,q0), name in names.items():
    psi = np.zeros(4); psi[2*q1+q0] = 1
    bell = np.round(cnot_0to1 @ (H_on_q0 @ psi), 4) + 0.0
    vec = ', '.join(f'{x:.4f}' for x in bell)
    print(f'H then CNOT on |{q1}{q0}> -> {name}: {vec}')

minus = np.array([1,-1]) / np.sqrt(2)
for q0 in (0, 1):
    ctrl = np.array([1,0]) if q0==0 else np.array([0,1])
    psi = np.kron(minus, ctrl)
    same = np.allclose(cnot_0to1 @ psi, psi)
    print(f'control |{q0}>: CNOT|-> (x) |{q0}> = {"+" if same else "-"}|-> (x) |{q0}>')`},

/* ---- 4.7 Universality ------------------------------------------------------ */

'clifford-t-approx': {
  title:'A word in H and T, closing in on a rotation',
  what:'Tries every product of $H$ and $T$ up to a given length and keeps the one closest to $R_{x}(0.3)$, up to a global phase. The error falls, and it falls slowly: accuracy is paid for in length.',
  try:'Use $S$ in place of $T$. Predict whether the error keeps falling as the words grow.',
  out:'words of H and T up to length  4: best error = 0.3424\nwords of H and T up to length  8: best error = 0.3424\nwords of H and T up to length 12: best error = 0.2552\nwords of H and T up to length 16: best error = 0.2552\nwords of H and T up to length 20: best error = 0.0997',
  qk:`import numpy as np
from qiskit.circuit.library import HGate, TGate, RXGate
from qiskit.quantum_info import Operator

H, T = Operator(HGate()).data, Operator(TGate()).data
target = Operator(RXGate(0.3)).data
dist = lambda U, V: np.sqrt(max(0.0, 4 - 2 * abs(np.trace(U.conj().T @ V))))
def key(U):                                    # drop the global phase
    u = U.ravel(); k = np.flatnonzero(abs(u) > 1e-9)[0]
    return tuple(np.round(u * abs(u[k]) / u[k], 8))

seen, front, best = {key(np.eye(2))}, [np.eye(2)], 4.0
for L in range(1, 21):                         # every new word one gate longer
    new = []
    for U in front:
        for V in (U @ H, U @ T):
            if key(V) not in seen:
                seen.add(key(V)); new.append(V)
    front, best = new, min([best] + [dist(U, target) for U in new])
    if L % 4 == 0:
        print(f'words of H and T up to length {L:2d}: best error = {best:.4f}')`,
  py:`import numpy as np

H = np.array([[1, 1], [1, -1]]) / np.sqrt(2)
T = np.diag([1, np.exp(1j * np.pi / 4)])
X = np.array([[0, 1], [1, 0]])
target = np.cos(0.15) * np.eye(2) - 1j * np.sin(0.15) * X     # R_x(0.3)
dist = lambda U, V: np.sqrt(max(0.0, 4 - 2 * abs(np.trace(U.conj().T @ V))))
def key(U):                                    # drop the global phase
    u = U.ravel(); k = np.flatnonzero(abs(u) > 1e-9)[0]
    return tuple(np.round(u * abs(u[k]) / u[k], 8))

seen, front, best = {key(np.eye(2))}, [np.eye(2)], 4.0
for L in range(1, 21):                         # every new word one gate longer
    new = []
    for U in front:
        for V in (U @ H, U @ T):
            if key(V) not in seen:
                seen.add(key(V)); new.append(V)
    front, best = new, min([best] + [dist(U, target) for U in new])
    if L % 4 == 0:
        print(f'words of H and T up to length {L:2d}: best error = {best:.4f}')`},

'clifford-conjugation': {
  title:'Clifford gates keep Paulis Pauli; T does not',
  what:'Checks that conjugating $X$ by $H$, by $S$, and by $\\mathrm{CNOT}$ always gives back a Pauli, then checks that $TXT^{\\dagger}=(X+Y)/\\sqrt2$, which is not one.',
  try:'Conjugate $Z$ by $T$ instead of $X$. Predict whether the result is a Pauli.',
  out:'H X H^dag is a Pauli: True\nS X S^dag is a Pauli: True\nCNOT (X (x) I) CNOT is X (x) X: True\nmax |T X T^dag - (X+Y)/sqrt2| = 0.0000\nT X T^dag is a Pauli: False',
  qk:`import numpy as np
from qiskit.circuit.library import HGate, SGate, TGate
from qiskit.quantum_info import Operator, Pauli

X, Y, Z, I = (Pauli(p).to_matrix() for p in 'XYZI')
H, S, T = Operator(HGate()).data, Operator(SGate()).data, Operator(TGate()).data
CNOT = np.array([[1,0,0,0],[0,1,0,0],[0,0,0,1],[0,0,1,0]])
paulis = [I, X, Y, Z]

def is_pauli(M):                                    # up to a phase in {1,i,-1,-i}
    return any(np.allclose(M, ph*p) for p in paulis for ph in (1,1j,-1,-1j))

print(f'H X H^dag is a Pauli: {is_pauli(H @ X @ H.conj().T)}')
print(f'S X S^dag is a Pauli: {is_pauli(S @ X @ S.conj().T)}')
conj = CNOT @ np.kron(X, I) @ CNOT.T                 # CNOT (X on q1) CNOT
print(f'CNOT (X (x) I) CNOT is X (x) X: {np.allclose(conj, np.kron(X,X))}')
conjT = T @ X @ T.conj().T
target = (X + Y) / np.sqrt(2)
print(f'max |T X T^dag - (X+Y)/sqrt2| = {np.abs(conjT - target).max():.4f}')
print(f'T X T^dag is a Pauli: {is_pauli(conjT)}')`,
  py:`import numpy as np

X = np.array([[0,1],[1,0]]); Y = np.array([[0,-1j],[1j,0]]); Z = np.diag([1,-1]); I = np.eye(2)
H = (X + Z) / np.sqrt(2); S = np.diag([1,1j]); T = np.diag([1,np.exp(1j*np.pi/4)])
CNOT = np.array([[1,0,0,0],[0,1,0,0],[0,0,0,1],[0,0,1,0]])

paulis = [I, X, Y, Z]
def is_pauli(M):                                    # up to a phase in {1,i,-1,-i}
    return any(np.allclose(M, ph*p) for p in paulis for ph in (1,1j,-1,-1j))

print(f'H X H^dag is a Pauli: {is_pauli(H @ X @ H.conj().T)}')
print(f'S X S^dag is a Pauli: {is_pauli(S @ X @ S.conj().T)}')

conj = CNOT @ np.kron(X, I) @ CNOT.T                 # CNOT (X on q1) CNOT
print(f'CNOT (X (x) I) CNOT is X (x) X: {np.allclose(conj, np.kron(X,X))}')

conjT = T @ X @ T.conj().T
target = (X + Y) / np.sqrt(2)
print(f'max |T X T^dag - (X+Y)/sqrt2| = {np.abs(conjT - target).max():.4f}')
print(f'T X T^dag is a Pauli: {is_pauli(conjT)}')`},

'counting-argument': {
  title:'Counting words: why a finite set can only approximate',
  what:'Counts the words of length $L$ from a two-gate alphabet, $2^{L}$ of them, against the roughly six thousand rotation angles at spacing $10^{-3}$ around the circle, and reads off the length a fixed alphabet needs to reach that many.',
  try:'Use a spacing of $10^{-4}$ instead. Predict how the required length changes.',
  out:'L =  1:  words from a 2-gate alphabet = 2\nL =  2:  words from a 2-gate alphabet = 4\nL =  5:  words from a 2-gate alphabet = 32\nL = 10:  words from a 2-gate alphabet = 1,024\nL = 20:  words from a 2-gate alphabet = 1,048,576\nL = 50:  words from a 2-gate alphabet = 1,125,899,906,842,624\nangles at spacing 1e-3 around the circle: about 6,283\na 2-gate alphabet needs L >= 13 to have that many words',
  qk:`import numpy as np

# words of length L from a fixed 2-gate alphabet: a countable set, 2^L of them,
# a fixed finite gate set has only countably many words of any bounded length,
# while SU(2) is continuum many, so no such word set is exact for every
# rotation; it can only be dense, as the Solovay-Kitaev theorem promises.
for L in (1,2,5,10,20,50):
    print(f'L = {L:2d}:  words from a 2-gate alphabet = {2**L:,}')

n = int(2*np.pi / 1e-3)     # angles at spacing 1e-3 around the circle
print(f'angles at spacing 1e-3 around the circle: about {n:,}')
print(f'a 2-gate alphabet needs L >= {int(np.ceil(np.log2(n)))} to have that many words')`,
  py:`import numpy as np
# counting: circuits of length L from a fixed 2-gate alphabet number 2^L,
# a countable set, while SU(2) is continuum-many: no fixed finite gate set
# of any length is exact for every rotation, only dense in it.
for L in (1,2,5,10,20,50):
    print(f'L = {L:2d}:  words from a 2-gate alphabet = {2**L:,}')

# a coarse net at spacing 1e-3 on the circle of rotation angles needs about
n = int(2*np.pi / 1e-3)
print(f'angles at spacing 1e-3 around the circle: about {n:,}')
print(f'a 2-gate alphabet needs L >= {int(np.ceil(np.log2(n)))} to have that many words')`}

};
