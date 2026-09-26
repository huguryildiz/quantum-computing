/* ==========================================================================
   Code for Module 2: programs in Qiskit and in NumPy
   The same form as 77_code_m1.js: one entry a program, each written twice
   (`qk`, a Qiskit listing to copy; `py`, NumPy only, run on the page) and
   printing the same lines, which are `out`. The NumPy versions cannot use
   SciPy, so an exponential of a Hermitian matrix is taken through its
   eigenvalues. Each teaching section closes with a code page
   (`CODE_BANKS_M2`) that pages through its programs.
   verify/code_check.py runs every entry in both forms and compares what it
   prints with `out`.
   ========================================================================== */
const CODE_BANKS_M2 = {
  'm2-code-born':     ['born-rule', 'three-bases', 'best-guess'],
  'm2-code-measure':  ['update-rule', 'three-in-a-row', 'readout'],
  'm2-code-obs':      ['expectation', 'variance', 'eigen-mean'],
  'm2-code-comm':     ['commutator', 'robertson', 'order'],
  'm2-code-pauli':    ['pauli-props', 'product-rule', 'axis'],
  'm2-code-dynamics': ['evolve', 'energy-shift', 'rabi'],
  'm2-code-shots':    ['standard-error', 'shots-needed', 'within-band']
};

const CODE_M2 = {

/* ---- 2.1 The Born rule ------------------------------------------------- */

'born-rule': {
  title:'From amplitudes to probabilities',
  what:'Reads the amplitudes of $\\tfrac15(3|0\\rangle+4i|1\\rangle)$, squares their moduli, and prints what squaring the amplitude itself would give.',
  try:'Change the state to $\\tfrac15(3|0\\rangle-4|1\\rangle)$. Predict the two probabilities before you run it.',
  out:'c0 = 0.60   c1 = 0.80i\np(0) = 0.3600   p(1) = 0.6400\nsum = 1.0000\nc1 squared, the mistake = -0.6400',
  qk:`import numpy as np
from qiskit.quantum_info import Statevector

# The state (3|0> + 4i|1>)/5
psi = Statevector(np.array([3, 4j]) / 5)
c = psi.data                        # the amplitudes <n|psi>

p = psi.probabilities()             # |c_n|^2
print(f'c0 = {c[0].real:.2f}   c1 = {c[1].imag:.2f}i')
print(f'p(0) = {p[0]:.4f}   p(1) = {p[1]:.4f}')
print(f'sum = {p.sum():.4f}')
print(f'c1 squared, the mistake = {(c[1]**2).real:.4f}')`,
  py:`import numpy as np

# The state (3|0> + 4i|1>)/5
psi = np.array([3, 4j]) / 5
c = psi                             # the amplitudes <n|psi>

p = np.abs(c)**2                    # |c_n|^2
print(f'c0 = {c[0].real:.2f}   c1 = {c[1].imag:.2f}i')
print(f'p(0) = {p[0]:.4f}   p(1) = {p[1]:.4f}')
print(f'sum = {p.sum():.4f}')
print(f'c1 squared, the mistake = {(c[1]**2).real:.4f}')`},

'three-bases': {
  title:'One state, three experiments',
  what:'Measures $\\cos(\\pi/6)|0\\rangle+\\sin(\\pi/6)|1\\rangle$ in $Z$, $X$ and $Y$. Hardware measures only $Z$, so a gate first turns the chosen basis onto $|0\\rangle$ and $|1\\rangle$.',
  try:'Use $|{+}i\\rangle=(|0\\rangle+i|1\\rangle)/\\sqrt2$ instead. Predict which basis gives a certain answer.',
  out:'Z basis: p = 0.7500, 0.2500\nX basis: p = 0.9330, 0.0670\nY basis: p = 0.5000, 0.5000',
  qk:`import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

psi = Statevector([np.cos(np.pi/6), np.sin(np.pi/6)])

# To measure X, apply H; to measure Y, apply S-dagger then H
to_x = QuantumCircuit(1); to_x.h(0)
to_y = QuantumCircuit(1); to_y.sdg(0); to_y.h(0)

for name, qc in (('Z', None), ('X', to_x), ('Y', to_y)):
    out = psi if qc is None else psi.evolve(qc)
    p = out.probabilities()
    print(f'{name} basis: p = {p[0]:.4f}, {p[1]:.4f}')`,
  py:`import numpy as np

psi = np.array([np.cos(np.pi/6), np.sin(np.pi/6)])
H = np.array([[1, 1], [1, -1]]) / np.sqrt(2)
Sdg = np.diag([1, -1j])

# To measure X, apply H; to measure Y, apply S-dagger then H
bases = (('Z', np.eye(2)), ('X', H), ('Y', H @ Sdg))

for name, U in bases:
    p = np.abs(U @ psi)**2
    print(f'{name} basis: p = {p[0]:.4f}, {p[1]:.4f}')`},

'best-guess': {
  title:'The best single guess between two states',
  what:'For $|a\\rangle=|0\\rangle$ and $|b\\rangle=\\tfrac12(|0\\rangle+\\sqrt3|1\\rangle)$, each sent half the time, computes the best chance of naming the state from one copy.',
  try:'Make $|b\\rangle=|1\\rangle$. Predict the overlap and the best chance first.',
  out:'|<a|b>| = 0.5000\nbest p(correct) = 0.9330\n(1 + sin theta)/2 = 0.9330',
  qk:`import numpy as np
from qiskit.quantum_info import DensityMatrix, Statevector

a = Statevector([1, 0])
b = Statevector([1/2, np.sqrt(3)/2])
overlap = abs(a.inner(b))

# Best guess: (1 + half the trace norm of rho_a - rho_b) / 2
D = DensityMatrix(a).data - DensityMatrix(b).data
tn = np.abs(np.linalg.eigvalsh(D)).sum()
print(f'|<a|b>| = {overlap:.4f}')
print(f'best p(correct) = {0.5 * (1 + tn/2):.4f}')
print(f'(1 + sin theta)/2 = {0.5 * (1 + np.sqrt(1 - overlap**2)):.4f}')`,
  py:`import numpy as np

a = np.array([1, 0])
b = np.array([1/2, np.sqrt(3)/2])
overlap = abs(np.vdot(a, b))

# Best guess: (1 + half the trace norm of rho_a - rho_b) / 2
D = np.outer(a, a.conj()) - np.outer(b, b.conj())
tn = np.abs(np.linalg.eigvalsh(D)).sum()
print(f'|<a|b>| = {overlap:.4f}')
print(f'best p(correct) = {0.5 * (1 + tn/2):.4f}')
print(f'(1 + sin theta)/2 = {0.5 * (1 + np.sqrt(1 - overlap**2)):.4f}')`},

/* ---- 2.2 Projective measurement ---------------------------------------- */

'update-rule': {
  title:'The state after a reading',
  what:'Measures $Z$ on $\\tfrac{1}{\\sqrt5}(|0\\rangle+2|1\\rangle)$, keeps the reading $1$, projects and divides by the length, then asks for the same reading again.',
  try:'Keep the reading $0$ instead. Predict $p(0)$ and the state afterwards.',
  out:'p(1) = 0.8000\nlength of P1|psi> = 0.8944\nstate after = (0.0000, 1.0000)\np(1) on a repeat = 1.0000',
  qk:`import numpy as np
from qiskit.quantum_info import Operator, Statevector

psi = Statevector(np.array([1, 2]) / np.sqrt(5))
P1 = Operator(np.array([[0, 0], [0, 1]]))   # projector for the reading 1

p1 = psi.expectation_value(P1).real
kept = psi.evolve(P1).data                   # P1|psi>, not yet length one
after = Statevector(kept / np.sqrt(p1))

print(f'p(1) = {p1:.4f}')
print(f'length of P1|psi> = {np.linalg.norm(kept):.4f}')
print(f'state after = ({after.data[0].real:.4f}, {after.data[1].real:.4f})')
print(f'p(1) on a repeat = {after.expectation_value(P1).real:.4f}')`,
  py:`import numpy as np

psi = np.array([1, 2]) / np.sqrt(5)
P1 = np.array([[0, 0], [0, 1]])             # projector for the reading 1

p1 = np.vdot(psi, P1 @ psi).real
kept = P1 @ psi                              # P1|psi>, not yet length one
after = kept / np.sqrt(p1)

print(f'p(1) = {p1:.4f}')
print(f'length of P1|psi> = {np.linalg.norm(kept):.4f}')
print(f'state after = ({after[0].real:.4f}, {after[1].real:.4f})')
print(f'p(1) on a repeat = {np.vdot(after, P1 @ after).real:.4f}')`},

'three-in-a-row': {
  title:'Three measurements in a row',
  what:'Measures $Z$, then $X$, then $Z$ on $|0\\rangle$. The last reading adds up the two branches the $X$ reading left behind.',
  try:'Replace the middle $X$ measurement by a second $Z$. Predict the last $p(0)$.',
  out:'first Z:  p(0) = 1.0000\nX:        p(+) = 0.5000   p(-) = 0.5000\nlast Z:   p(0) = 0.5000',
  qk:`from qiskit.quantum_info import Statevector

k0 = Statevector.from_label('0')
kp, km = Statevector.from_label('+'), Statevector.from_label('-')
psi = k0

# First Z: the reading is 0 with certainty, and the state stays |0>
print(f'first Z:  p(0) = {abs(k0.inner(psi))**2:.4f}')
# X: each reading, and the state it leaves
px = [abs(e.inner(psi))**2 for e in (kp, km)]
print(f'X:        p(+) = {px[0]:.4f}   p(-) = {px[1]:.4f}')
# Last Z: add up the two branches the X reading left
p0 = sum(q * abs(k0.inner(e))**2 for q, e in zip(px, (kp, km)))
print(f'last Z:   p(0) = {p0:.4f}')`,
  py:`import numpy as np

k0 = np.array([1, 0])
kp, km = np.array([1, 1]) / np.sqrt(2), np.array([1, -1]) / np.sqrt(2)
psi = k0

# First Z: the reading is 0 with certainty, and the state stays |0>
print(f'first Z:  p(0) = {abs(np.vdot(k0, psi))**2:.4f}')
# X: each reading, and the state it leaves
px = [abs(np.vdot(e, psi))**2 for e in (kp, km)]
print(f'X:        p(+) = {px[0]:.4f}   p(-) = {px[1]:.4f}')
# Last Z: add up the two branches the X reading left
p0 = sum(q * abs(np.vdot(k0, e))**2 for q, e in zip(px, (kp, km)))
print(f'last Z:   p(0) = {p0:.4f}')`},

'readout': {
  title:'A readout error as two effects',
  what:'Builds the effects of a readout that flips the bit with probability $\\epsilon=0.05$, applies them to a state with true $p(0)=0.7$, and inverts the line to recover it.',
  try:'Set $\\epsilon=0.5$. Predict the reported $p(0)$, and what the correction does.',
  out:'reported p(0) = 0.6800\nE0 + E1 = I: True\nE0 is a projector: False\ncorrected q = 0.7000',
  qk:`import numpy as np
from qiskit.quantum_info import Operator, Statevector

eps, q = 0.05, 0.7
psi = Statevector([np.sqrt(q), np.sqrt(1 - q)])
E0 = Operator(np.diag([1 - eps, eps]))       # the effect for the report 0
E1 = Operator(np.diag([eps, 1 - eps]))

r = psi.expectation_value(E0).real
print(f'reported p(0) = {r:.4f}')
print(f'E0 + E1 = I: {E0 + E1 == Operator(np.eye(2))}')
print(f'E0 is a projector: {E0.compose(E0) == E0}')
print(f'corrected q = {(r - eps) / (1 - 2*eps):.4f}')`,
  py:`import numpy as np

eps, q = 0.05, 0.7
psi = np.array([np.sqrt(q), np.sqrt(1 - q)])
E0 = np.diag([1 - eps, eps])                 # the effect for the report 0
E1 = np.diag([eps, 1 - eps])

r = np.vdot(psi, E0 @ psi).real
print(f'reported p(0) = {r:.4f}')
print(f'E0 + E1 = I: {np.allclose(E0 + E1, np.eye(2))}')
print(f'E0 is a projector: {np.allclose(E0 @ E0, E0)}')
print(f'corrected q = {(r - eps) / (1 - 2*eps):.4f}')`},

/* ---- 2.3 Observables --------------------------------------------------- */

'expectation': {
  title:'An expectation value by two routes',
  what:'Computes $\\langle Z\\rangle$ on $\\tfrac{1}{\\sqrt5}(2|0\\rangle+|1\\rangle)$ as a sandwich, and again by weighting the eigenvalues $\\pm1$ by their probabilities.',
  try:'Use the state $\\tfrac{1}{\\sqrt5}(|0\\rangle+2|1\\rangle)$. Predict the sign of $\\langle Z\\rangle$ and its size.',
  out:'p(+1) = 0.8000   p(-1) = 0.2000\nsandwich <Z> = 0.6000\nweighted <Z> = 0.6000',
  qk:`import numpy as np
from qiskit.quantum_info import Pauli, Statevector

psi = Statevector(np.array([2, 1]) / np.sqrt(5))

# Route 1: the sandwich <psi|Z|psi>
sandwich = psi.expectation_value(Pauli('Z')).real
# Route 2: weight each eigenvalue by its probability
p = psi.probabilities()
weighted = (+1) * p[0] + (-1) * p[1]
print(f'p(+1) = {p[0]:.4f}   p(-1) = {p[1]:.4f}')
print(f'sandwich <Z> = {sandwich:.4f}')
print(f'weighted <Z> = {weighted:.4f}')`,
  py:`import numpy as np

psi = np.array([2, 1]) / np.sqrt(5)
Z = np.diag([1, -1])

# Route 1: the sandwich <psi|Z|psi>
sandwich = np.vdot(psi, Z @ psi).real
# Route 2: weight each eigenvalue by its probability
p = np.abs(psi)**2
weighted = (+1) * p[0] + (-1) * p[1]
print(f'p(+1) = {p[0]:.4f}   p(-1) = {p[1]:.4f}')
print(f'sandwich <Z> = {sandwich:.4f}')
print(f'weighted <Z> = {weighted:.4f}')`},

'variance': {
  title:'The spread of a reading',
  what:'Computes $\\langle Z\\rangle$ and $\\operatorname{Var}(Z)=\\langle Z^{2}\\rangle-\\langle Z\\rangle^{2}$ on three states. The spread is zero only on the eigenstate.',
  try:'Add the state $|1\\rangle$. Predict its mean and its variance.',
  out:'|+>         <Z> = +0.0000   Var(Z) = 1.0000\n|0>         <Z> = +1.0000   Var(Z) = 0.0000\npi/8 state  <Z> = +0.7071   Var(Z) = 0.5000',
  qk:`import numpy as np
from qiskit.quantum_info import Operator, Pauli, Statevector

Z = Operator(Pauli('Z'))
Z2 = Z.compose(Z)                            # the matrix squared first
states = {'|+>': Statevector.from_label('+'),
          '|0>': Statevector.from_label('0'),
          'pi/8 state': Statevector([np.cos(np.pi/8), np.sin(np.pi/8)])}
r = lambda x: round(float(x), 12) + 0.0

for name, psi in states.items():
    mean = psi.expectation_value(Z).real
    var = psi.expectation_value(Z2).real - mean**2
    print(f'{name:11s} <Z> = {r(mean):+.4f}   Var(Z) = {r(var):.4f}')`,
  py:`import numpy as np

Z = np.diag([1, -1])
Z2 = Z @ Z                                   # the matrix squared first
states = {'|+>': np.array([1, 1]) / np.sqrt(2),
          '|0>': np.array([1, 0]),
          'pi/8 state': np.array([np.cos(np.pi/8), np.sin(np.pi/8)])}
r = lambda x: round(float(x), 12) + 0.0

for name, psi in states.items():
    mean = np.vdot(psi, Z @ psi).real
    var = np.vdot(psi, Z2 @ psi).real - mean**2
    print(f'{name:11s} <Z> = {r(mean):+.4f}   Var(Z) = {r(var):.4f}')`},

'eigen-mean': {
  title:'A mean that is not a reading',
  what:'Diagonalises $X$, reads the probability of each eigenvalue on $\\cos(\\pi/8)|0\\rangle+\\sin(\\pi/8)|1\\rangle$, and averages. The mean is neither of the two readings.',
  try:'Use $|+\\rangle$ instead. Predict both probabilities and the mean.',
  out:'reading -1: p = 0.1464\nreading +1: p = 0.8536\nsum of a p(a) = 0.7071\n<psi|X|psi>   = 0.7071',
  qk:`import numpy as np
from qiskit.quantum_info import Operator, Statevector

psi = Statevector([np.cos(np.pi/8), np.sin(np.pi/8)])
X = Operator.from_label('X')

# Diagonalise: the eigenvalues are the readings, the eigenvectors give p(a)
vals, vecs = np.linalg.eigh(X.data)
p = [abs(np.vdot(vecs[:, k], psi.data))**2 for k in range(2)]
for a, pa in zip(vals, p):
    print(f'reading {a:+.0f}: p = {pa:.4f}')
print(f'sum of a p(a) = {np.dot(vals, p):.4f}')
print(f'<psi|X|psi>   = {psi.expectation_value(X).real:.4f}')`,
  py:`import numpy as np

psi = np.array([np.cos(np.pi/8), np.sin(np.pi/8)])
X = np.array([[0, 1], [1, 0]])

# Diagonalise: the eigenvalues are the readings, the eigenvectors give p(a)
vals, vecs = np.linalg.eigh(X)
p = [abs(np.vdot(vecs[:, k], psi))**2 for k in range(2)]
for a, pa in zip(vals, p):
    print(f'reading {a:+.0f}: p = {pa:.4f}')
print(f'sum of a p(a) = {np.dot(vals, p):.4f}')
print(f'<psi|X|psi>   = {np.vdot(psi, X @ psi).real:.4f}')`},

/* ---- 2.4 Compatibility and uncertainty --------------------------------- */

'commutator': {
  title:'Commutators of Pauli operators',
  what:'Computes $[X,Z]=XZ-ZX$ and checks it against $-2iY$, then checks a commuting pair and the anticommutation of $X$ and $Z$.',
  try:'Compute $[X,Y]$ as well. Predict which Pauli operator it is a multiple of, and the factor.',
  out:'[X,Z] entries: -2 (top right)   +2 (bottom left)\n[X,Z] = -2iY: True\n[Z,X] = 2iY:  True\n[Z,Z] = 0:    True\nXZ = -ZX:     True',
  qk:`import numpy as np
from qiskit.quantum_info import Pauli

X, Y, Z = (Pauli(s).to_matrix() for s in 'XYZ')
comm = lambda A, B: A @ B - B @ A

c = comm(X, Z)
print(f'[X,Z] entries: {c[0,1].real:+.0f} (top right)   {c[1,0].real:+.0f} (bottom left)')
print(f'[X,Z] = -2iY: {np.allclose(c, -2j * Y)}')
print(f'[Z,X] = 2iY:  {np.allclose(comm(Z, X), 2j * Y)}')
print(f'[Z,Z] = 0:    {np.allclose(comm(Z, Z), 0)}')
print(f'XZ = -ZX:     {np.allclose(X @ Z, -(Z @ X))}')`,
  py:`import numpy as np

X = np.array([[0, 1], [1, 0]])
Y = np.array([[0, -1j], [1j, 0]])
Z = np.diag([1, -1])
comm = lambda A, B: A @ B - B @ A

c = comm(X, Z)
print(f'[X,Z] entries: {c[0,1].real:+.0f} (top right)   {c[1,0].real:+.0f} (bottom left)')
print(f'[X,Z] = -2iY: {np.allclose(c, -2j * Y)}')
print(f'[Z,X] = 2iY:  {np.allclose(comm(Z, X), 2j * Y)}')
print(f'[Z,Z] = 0:    {np.allclose(comm(Z, Z), 0)}')
print(f'XZ = -ZX:     {np.allclose(X @ Z, -(Z @ X))}')`},

'robertson': {
  title:'The uncertainty relation on one state',
  what:'Computes $\\Delta X\\,\\Delta Z$ and the bound $|\\langle Y\\rangle|$ on $\\cos(\\pi/6)|0\\rangle+e^{i\\pi/4}\\sin(\\pi/6)|1\\rangle$. Each Pauli squares to $I$, so $\\operatorname{Var}=1-\\langle P\\rangle^{2}$.',
  try:'Set the phase to $\\pi/2$. Predict whether the product moves closer to the bound.',
  out:'<X> = 0.6124   <Y> = 0.6124   <Z> = 0.5000\ndX dZ = 0.6847\n|<Y>| = 0.6124\nbound holds: True',
  qk:`import numpy as np
from qiskit.quantum_info import Pauli, Statevector

th, ph = np.pi/3, np.pi/4
psi = Statevector([np.cos(th/2), np.exp(1j*ph) * np.sin(th/2)])
m = {s: psi.expectation_value(Pauli(s)).real for s in 'XYZ'}

# Every Pauli squares to I, so Var = 1 - <P>^2
dX = np.sqrt(1 - m['X']**2)
dZ = np.sqrt(1 - m['Z']**2)
print(f"<X> = {m['X']:.4f}   <Y> = {m['Y']:.4f}   <Z> = {m['Z']:.4f}")
print(f'dX dZ = {dX * dZ:.4f}')
print(f"|<Y>| = {abs(m['Y']):.4f}")
print(f"bound holds: {dX * dZ >= abs(m['Y'])}")`,
  py:`import numpy as np

th, ph = np.pi/3, np.pi/4
psi = np.array([np.cos(th/2), np.exp(1j*ph) * np.sin(th/2)])
P = {'X': np.array([[0, 1], [1, 0]]), 'Y': np.array([[0, -1j], [1j, 0]]),
     'Z': np.diag([1, -1])}
m = {s: np.vdot(psi, P[s] @ psi).real for s in 'XYZ'}

# Every Pauli squares to I, so Var = 1 - <P>^2
dX = np.sqrt(1 - m['X']**2)
dZ = np.sqrt(1 - m['Z']**2)
print(f"<X> = {m['X']:.4f}   <Y> = {m['Y']:.4f}   <Z> = {m['Z']:.4f}")
print(f'dX dZ = {dX * dZ:.4f}')
print(f"|<Y>| = {abs(m['Y']):.4f}")
print(f"bound holds: {dX * dZ >= abs(m['Y'])}")`},

'order': {
  title:'Does a measurement in between erase the first answer?',
  what:'Starts in $|0\\rangle$, measures $B$, then $Z$ again, adding up both readings of $B$. Only the $B$ that commutes with $Z$ keeps the first answer.',
  try:'Start in $|+\\rangle$ and put $X$ first and last instead of $Z$. Predict the three lines.',
  out:'Z, then Z, then Z: p(0 again) = 1.0000\nZ, then X, then Z: p(0 again) = 0.5000\nZ, then Y, then Z: p(0 again) = 0.5000',
  qk:`import numpy as np
from qiskit.quantum_info import Pauli, Statevector

k0 = Statevector.from_label('0').data

# Measure Z (reading 0), then B, then Z again: how often is it still 0?
for name in 'ZXY':
    B = Pauli(name).to_matrix()
    agree = 0.0
    for s in (+1, -1):
        v = (np.eye(2) + s * B) / 2 @ k0          # project on the reading s
        p = np.vdot(v, v).real
        if p > 1e-12:
            agree += p * abs(v[0])**2 / p
    print(f'Z, then {name}, then Z: p(0 again) = {agree:.4f}')`,
  py:`import numpy as np

k0 = np.array([1, 0])
PAULI = {'Z': np.diag([1, -1]), 'X': np.array([[0, 1], [1, 0]]),
         'Y': np.array([[0, -1j], [1j, 0]])}

# Measure Z (reading 0), then B, then Z again: how often is it still 0?
for name in 'ZXY':
    B = PAULI[name]
    agree = 0.0
    for s in (+1, -1):
        v = (np.eye(2) + s * B) / 2 @ k0          # project on the reading s
        p = np.vdot(v, v).real
        if p > 1e-12:
            agree += p * abs(v[0])**2 / p
    print(f'Z, then {name}, then Z: p(0 again) = {agree:.4f}')`},

/* ---- 2.5 The Pauli algebra --------------------------------------------- */

'pauli-props': {
  title:'What every Pauli operator is',
  what:'Checks that $X$, $Y$ and $Z$ are each Hermitian and unitary, square to the identity, have trace zero, and have eigenvalues $-1$ and $+1$.',
  try:'Run the same checks on the Hadamard $H=(X+Z)/\\sqrt2$. Predict which ones it passes.',
  out:'X: Hermitian True, unitary True, square I True, trace 0, eigenvalues -1 +1\nY: Hermitian True, unitary True, square I True, trace 0, eigenvalues -1 +1\nZ: Hermitian True, unitary True, square I True, trace 0, eigenvalues -1 +1',
  qk:`import numpy as np
from qiskit.quantum_info import Operator, Pauli

for name in 'XYZ':
    M = Pauli(name).to_matrix()
    herm = np.allclose(M, M.conj().T)
    unit = Operator(M).is_unitary()
    sq = np.allclose(M @ M, np.eye(2))
    tr = abs(np.trace(M))
    ev = np.linalg.eigvalsh(M)
    print(f'{name}: Hermitian {herm}, unitary {unit}, square I {sq}, '
          f'trace {tr:.0f}, eigenvalues {ev[0]:+.0f} {ev[1]:+.0f}')`,
  py:`import numpy as np

PAULI = {'X': np.array([[0, 1], [1, 0]]), 'Y': np.array([[0, -1j], [1j, 0]]),
         'Z': np.diag([1, -1])}

for name, M in PAULI.items():
    herm = np.allclose(M, M.conj().T)
    unit = np.allclose(M.conj().T @ M, np.eye(2))
    sq = np.allclose(M @ M, np.eye(2))
    tr = abs(np.trace(M))
    ev = np.linalg.eigvalsh(M)
    print(f'{name}: Hermitian {herm}, unitary {unit}, square I {sq}, '
          f'trace {tr:.0f}, eigenvalues {ev[0]:+.0f} {ev[1]:+.0f}')`},

'product-rule': {
  title:'The product rule',
  what:'Multiplies pairs of Pauli operators and names each product as a phase times one Pauli: $i$ with the cycle $X\\to Y\\to Z$, $-i$ against it, $I$ for a repeat.',
  try:'Add the pair $ZY$. Predict its name before you run it.',
  out:'XY = iZ\nYX = -iZ\nYZ = iX\nXZ = -iY\nXX = I',
  qk:`from qiskit.quantum_info import Pauli

# Pauli.dot multiplies and keeps track of the phase
for a, b in ('XY', 'YX', 'YZ', 'XZ', 'XX'):
    product = Pauli(a).dot(Pauli(b))
    print(f'{a}{b} = {product.to_label()}')`,
  py:`import numpy as np

P = {'I': np.eye(2), 'X': np.array([[0, 1], [1, 0]]),
     'Y': np.array([[0, -1j], [1j, 0]]), 'Z': np.diag([1, -1])}

def name(M):
    for k, S in P.items():
        for c, s in ((1, ''), (-1, '-'), (1j, 'i'), (-1j, '-i')):
            if np.allclose(M, c * S):
                return s + k

for a, b in ('XY', 'YX', 'YZ', 'XZ', 'XX'):
    print(f'{a}{b} = {name(P[a] @ P[b])}')`},

'axis': {
  title:'Measuring along a tilted direction',
  what:'Builds $P_{+}=\\tfrac12(I+\\mathbf{n}\\cdot\\boldsymbol\\sigma)$ for $\\mathbf{n}$ at $60^{\\circ}$ from $z$ and computes $p(+)$ on $|0\\rangle$, from the projector and from $\\tfrac12(1+\\mathbf{n}\\cdot\\mathbf{r})$.',
  try:'Tilt $\\mathbf{n}$ to $120^{\\circ}$ from $z$. Predict $p(+)$.',
  out:'P+ is a projector: True\np(+) from the projector = 0.7500\np(+) = (1 + n.r)/2      = 0.7500',
  qk:`import numpy as np
from qiskit.quantum_info import Operator, Pauli, Statevector

a = np.pi / 3                               # 60 degrees from z, in the xz plane
n = np.array([np.sin(a), 0, np.cos(a)])
ns = sum(nk * Pauli(s).to_matrix() for nk, s in zip(n, 'XYZ'))
P_plus = Operator((np.eye(2) + ns) / 2)

psi = Statevector.from_label('0')
r = np.array([psi.expectation_value(Pauli(s)).real for s in 'XYZ'])
print(f'P+ is a projector: {P_plus.compose(P_plus) == P_plus}')
print(f'p(+) from the projector = {psi.expectation_value(P_plus).real:.4f}')
print(f'p(+) = (1 + n.r)/2      = {(1 + n @ r) / 2:.4f}')`,
  py:`import numpy as np

S = [np.array([[0, 1], [1, 0]]), np.array([[0, -1j], [1j, 0]]), np.diag([1, -1])]
a = np.pi / 3                               # 60 degrees from z, in the xz plane
n = np.array([np.sin(a), 0, np.cos(a)])
ns = sum(nk * Sk for nk, Sk in zip(n, S))
P_plus = (np.eye(2) + ns) / 2

psi = np.array([1, 0])
r = np.array([np.vdot(psi, Sk @ psi).real for Sk in S])
print(f'P+ is a projector: {np.allclose(P_plus @ P_plus, P_plus)}')
print(f'p(+) from the projector = {np.vdot(psi, P_plus @ psi).real:.4f}')
print(f'p(+) = (1 + n.r)/2      = {(1 + n @ r) / 2:.4f}')`},

/* ---- 2.6 Dynamics ------------------------------------------------------ */

'evolve': {
  title:'A relative phase that turns',
  what:'Evolves $|+\\rangle$ under $H=\\tfrac{\\omega}{2}Z$ and prints $P(0)$ and $P(+)$ at four times. $P(0)$ never moves; $P(+)$ follows the relative phase.',
  try:'Start in $|0\\rangle$ instead. Predict both columns at every time.',
  out:'omega t = 0.0000:  P(0) = 0.5000   P(+) = 1.0000\nomega t = 1.5708:  P(0) = 0.5000   P(+) = 0.5000\nomega t = 3.1416:  P(0) = 0.5000   P(+) = 0.0000\nomega t = 6.2832:  P(0) = 0.5000   P(+) = 1.0000',
  qk:`import numpy as np
from qiskit.circuit.library import HamiltonianGate
from qiskit.quantum_info import Operator, Statevector

w = 1.0
H = w / 2 * np.diag([1, -1])                 # H = (omega/2) Z
plus = Statevector.from_label('+')

for wt in (0, np.pi/2, np.pi, 2*np.pi):
    U = Operator(HamiltonianGate(H, time=wt / w))   # exp(-iHt)
    psi = plus.evolve(U)
    p0 = abs(psi.data[0])**2
    pp = abs(plus.inner(psi))**2
    print(f'omega t = {wt:.4f}:  P(0) = {p0:.4f}   P(+) = {pp:.4f}')`,
  py:`import numpy as np

def expm_h(H, t):                            # exp(-iHt) from the eigenvalues
    vals, vecs = np.linalg.eigh(H)
    return vecs @ np.diag(np.exp(-1j * vals * t)) @ vecs.conj().T

w = 1.0
H = w / 2 * np.diag([1, -1])                 # H = (omega/2) Z
plus = np.array([1, 1]) / np.sqrt(2)

for wt in (0, np.pi/2, np.pi, 2*np.pi):
    psi = expm_h(H, wt / w) @ plus
    p0 = abs(psi[0])**2
    pp = abs(np.vdot(plus, psi))**2
    print(f'omega t = {wt:.4f}:  P(0) = {p0:.4f}   P(+) = {pp:.4f}')`},

'energy-shift': {
  title:'Adding a constant to the energy',
  what:'Evolves $|0\\rangle$ under $H=\\tfrac12(X+Z)$ and under $H+5I$ for $t=0.8$. The two final states differ by the global phase $e^{-5it}$ and nothing else.',
  try:'Replace $5I$ by $5Z$. Predict whether $P(0)$ still agrees.',
  out:'P(0) under H    = 0.8564\nP(0) under H+5I = 0.8564\n|<a|b>| = 1.0000\nphase of <a|b> = 2.2832   (-5t, wrapped = 2.2832)',
  qk:`import numpy as np
from qiskit.circuit.library import HamiltonianGate
from qiskit.quantum_info import Operator, SparsePauliOp, Statevector

H = SparsePauliOp(['X', 'Z'], [0.5, 0.5]).to_matrix()
t = 0.8
k0 = Statevector.from_label('0')
a = k0.evolve(Operator(HamiltonianGate(H, time=t)))
b = k0.evolve(Operator(HamiltonianGate(H + 5 * np.eye(2), time=t)))

ab = a.inner(b)
print(f'P(0) under H    = {a.probabilities()[0]:.4f}')
print(f'P(0) under H+5I = {b.probabilities()[0]:.4f}')
print(f'|<a|b>| = {abs(ab):.4f}')
print(f'phase of <a|b> = {np.angle(ab):.4f}   (-5t, wrapped = {(-5*t + np.pi) % (2*np.pi) - np.pi:.4f})')`,
  py:`import numpy as np

def expm_h(H, t):                            # exp(-iHt) from the eigenvalues
    vals, vecs = np.linalg.eigh(H)
    return vecs @ np.diag(np.exp(-1j * vals * t)) @ vecs.conj().T

H = 0.5 * np.array([[0, 1], [1, 0]]) + 0.5 * np.diag([1, -1])
t = 0.8
k0 = np.array([1, 0])
a = expm_h(H, t) @ k0
b = expm_h(H + 5 * np.eye(2), t) @ k0

ab = np.vdot(a, b)
print(f'P(0) under H    = {abs(a[0])**2:.4f}')
print(f'P(0) under H+5I = {abs(b[0])**2:.4f}')
print(f'|<a|b>| = {abs(ab):.4f}')
print(f'phase of <a|b> = {np.angle(ab):.4f}   (-5t, wrapped = {(-5*t + np.pi) % (2*np.pi) - np.pi:.4f})')`},

'rabi': {
  title:'A pulse is a gate',
  what:'Drives $|0\\rangle$ with $H=\\tfrac12(\\Omega_{x}X+\\Delta Z)$ and prints $P(1)$ for three pulses: two on resonance, and one detuned by $\\Delta=\\Omega_{x}$.',
  try:'Detune by $\\Delta=2\\Omega_{x}$ and keep $\\Omega t=\\pi$. Predict $P(1)$ from $(\\Omega_{x}/\\Omega)^{2}$.',
  out:'resonant, area pi/3:   P(1) = 0.2500\nresonant, area pi:     P(1) = 1.0000\ndetuned by Omega_x, area pi: P(1) = 0.5000',
  qk:`import numpy as np
from qiskit.circuit.library import HamiltonianGate
from qiskit.quantum_info import Operator, SparsePauliOp

def p1(ox, d, area):
    H = SparsePauliOp(['X', 'Z'], [ox / 2, d / 2]).to_matrix()
    t = area / np.hypot(ox, d)               # pulse area = Omega t
    U = Operator(HamiltonianGate(H, time=t)).data
    return abs(U[1, 0])**2                   # |<1|U|0>|^2

print(f'resonant, area pi/3:   P(1) = {p1(1, 0, np.pi/3):.4f}')
print(f'resonant, area pi:     P(1) = {p1(1, 0, np.pi):.4f}')
print(f'detuned by Omega_x, area pi: P(1) = {p1(1, 1, np.pi):.4f}')`,
  py:`import numpy as np

X, Z = np.array([[0, 1], [1, 0]]), np.diag([1, -1])

def p1(ox, d, area):
    H = (ox * X + d * Z) / 2
    t = area / np.hypot(ox, d)               # pulse area = Omega t
    vals, vecs = np.linalg.eigh(H)           # exp(-iHt) from the eigenvalues
    U = vecs @ np.diag(np.exp(-1j * vals * t)) @ vecs.conj().T
    return abs(U[1, 0])**2                   # |<1|U|0>|^2

print(f'resonant, area pi/3:   P(1) = {p1(1, 0, np.pi/3):.4f}')
print(f'resonant, area pi:     P(1) = {p1(1, 0, np.pi):.4f}')
print(f'detuned by Omega_x, area pi: P(1) = {p1(1, 1, np.pi):.4f}')`},

/* ---- 2.7 Finite shots -------------------------------------------------- */

'standard-error': {
  title:'The standard error of a count',
  what:'Prints $\\sqrt{p(1-p)/N}$ for $|+\\rangle$, where $p=\\tfrac12$, and for a state with $p=0.1$, at three shot counts.',
  try:'Add $N=10^{6}$. Predict the first column from the $N=10^{5}$ row before you run it.',
  out:'N =    100:  SE at p = 0.5 is 0.0500   at p = 0.1 is 0.0300\nN =   1000:  SE at p = 0.5 is 0.0158   at p = 0.1 is 0.0095\nN = 100000:  SE at p = 0.5 is 0.0016   at p = 0.1 is 0.0009',
  qk:`import numpy as np
from qiskit.quantum_info import Statevector

half = Statevector.from_label('+').probabilities()[1]      # p = 1/2
tenth = Statevector([np.sqrt(0.9), np.sqrt(0.1)]).probabilities()[1]

# SE = sqrt(p(1 - p) / N): ten times the shots, sqrt(10) times less error
for N in (100, 1000, 100000):
    se = [np.sqrt(p * (1 - p) / N) for p in (half, tenth)]
    print(f'N = {N:6d}:  SE at p = 0.5 is {se[0]:.4f}   at p = 0.1 is {se[1]:.4f}')`,
  py:`import numpy as np

plus = np.array([1, 1]) / np.sqrt(2)
half = abs(plus[1])**2                                      # p = 1/2
tenth = abs(np.sqrt(0.1))**2

# SE = sqrt(p(1 - p) / N): ten times the shots, sqrt(10) times less error
for N in (100, 1000, 100000):
    se = [np.sqrt(p * (1 - p) / N) for p in (half, tenth)]
    print(f'N = {N:6d}:  SE at p = 0.5 is {se[0]:.4f}   at p = 0.1 is {se[1]:.4f}')`},

'shots-needed': {
  title:'How many shots a precision costs',
  what:'Inverts $\\mathrm{SE}=\\sqrt{p(1-p)/N}$ to find the shots needed for a target error, at $p=\\tfrac12$ and at $p=0.1$.',
  try:'Ask for a target of $0.003$. Predict the answer at $p=\\tfrac12$ from the two you have.',
  out:'SE = 0.01:  N = 2500 at p = 0.5,  N = 900 at p = 0.1\nSE = 0.001:  N = 250000 at p = 0.5,  N = 90000 at p = 0.1',
  qk:`import numpy as np
from qiskit.quantum_info import Statevector

half = Statevector.from_label('+').probabilities()[1]      # p = 1/2
tenth = Statevector([np.sqrt(0.9), np.sqrt(0.1)]).probabilities()[1]

# N = p(1 - p) / SE^2
for target in (0.01, 0.001):
    N = [round(p * (1 - p) / target**2) for p in (half, tenth)]
    print(f'SE = {target}:  N = {N[0]} at p = 0.5,  N = {N[1]} at p = 0.1')`,
  py:`import numpy as np

plus = np.array([1, 1]) / np.sqrt(2)
half = abs(plus[1])**2                                      # p = 1/2
tenth = abs(np.sqrt(0.1))**2

# N = p(1 - p) / SE^2
for target in (0.01, 0.001):
    N = [round(p * (1 - p) / target**2) for p in (half, tenth)]
    print(f'SE = {target}:  N = {N[0]} at p = 0.5,  N = {N[1]} at p = 0.1')`},

'within-band': {
  title:'How often an estimate lands near the truth',
  what:'Adds up the binomial distribution exactly to find how often $K/N$ lands within $0.05$ of $p=\\tfrac12$, for $N=100$ and $N=400$.',
  try:'Use $N=1600$. Predict whether the chance rises, and roughly how close to one it gets.',
  out:'N = 100: P(|K/N - 1/2| <= 0.05) = 0.7287   (SE = 0.0500)\nN = 400: P(|K/N - 1/2| <= 0.05) = 0.9598   (SE = 0.0250)',
  qk:`import math
import numpy as np
from qiskit.quantum_info import Statevector

p = Statevector.from_label('+').probabilities()[1]          # p = 1/2

for N in (100, 400):
    # Add up P(K = k) for every k with |k/N - p| <= 0.05
    prob = sum(math.comb(N, k) * p**k * (1 - p)**(N - k)
               for k in range(N + 1) if abs(k - N * p) <= 0.05 * N + 1e-9)
    se = np.sqrt(p * (1 - p) / N)
    print(f'N = {N}: P(|K/N - 1/2| <= 0.05) = {prob:.4f}   (SE = {se:.4f})')`,
  py:`import math
import numpy as np

plus = np.array([1, 1]) / np.sqrt(2)
p = abs(plus[1])**2                                         # p = 1/2

for N in (100, 400):
    # Add up P(K = k) for every k with |k/N - p| <= 0.05
    prob = sum(math.comb(N, k) * p**k * (1 - p)**(N - k)
               for k in range(N + 1) if abs(k - N * p) <= 0.05 * N + 1e-9)
    se = np.sqrt(p * (1 - p) / N)
    print(f'N = {N}: P(|K/N - 1/2| <= 0.05) = {prob:.4f}   (SE = {se:.4f})')`}

};
