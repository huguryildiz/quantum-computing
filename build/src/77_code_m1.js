/* ==========================================================================
   Code for Module 1: programs in Qiskit and in NumPy
   One entry a program, keyed by a short name. Each program works the numbers
   of its section and prints the same lines in both forms, so `out` is one text
   for both. The Qiskit listing (`qk`) uses qiskit.quantum_info and the circuit
   library, and is copied to a machine where Qiskit is installed; Qiskit does
   not run in the browser. The NumPy version (`py`) uses NumPy only and runs on
   the page.
   `title`, `what` and `try` are student text and go through md(); the code
   is plain text. Each teaching section closes with a code page
   (`CODE_BANKS_M1`) that pages through its programs.
   verify/code_check.py runs every entry in both forms and compares what it
   prints with `out`.
   ========================================================================== */
const CODE_BANKS_M1 = {
  'm1-code-inner':     ['normalise', 'inner-conj', 'basis-coeff'],
  'm1-code-phase':     ['polar', 'global-phase', 'hadamard-phase'],
  'm1-code-proj':      ['outer', 'projector', 'resolve'],
  'm1-code-gs':        ['gs-step', 'gs-residual', 'gs-fail'],
  'm1-code-tensor':    ['tensor-order', 'x-tensor-x', 'dimension'],
  'm1-code-herm':      ['adjoint', 'unitary', 'generator'],
  'm1-code-spectral':  ['eig', 'spectral', 'function'],
  'm1-code-dirac':     ['expectation', 'matrix-elements', 'order'],
  'm1-code-functions': ['l2-inner', 'orthonormal-family', 'parseval']
};

const CODE_M1 = {

/* ---- 1.1 Vectors, dual vectors and the inner product ------------------- */

'normalise': {
  title:'Normalise a column',
  what:'Divides the column $(2+i,\\,1-3i)$ by its length and prints the two probabilities of the state it names.',
  try:'Use the column $(3,\\,4i)$. Predict the squared length and both probabilities before you run it.',
  out:'squared length = 15.0000\nP(0) = 0.3333   P(1) = 0.6667\nsum of P = 1.0000',
  qk:`import numpy as np
from qiskit.quantum_info import Statevector

# An unnormalised column, divided by its length
v = np.array([2 + 1j, 1 - 3j])
L2 = np.vdot(v, v).real
psi = Statevector(v / np.sqrt(L2))

p = psi.probabilities()
print(f'squared length = {L2:.4f}')
print(f'P(0) = {p[0]:.4f}   P(1) = {p[1]:.4f}')
print(f'sum of P = {p.sum():.4f}')`,
  py:`import numpy as np

# An unnormalised column, divided by its length
v = np.array([2 + 1j, 1 - 3j])
L2 = np.vdot(v, v).real
psi = v / np.sqrt(L2)

p = np.abs(psi)**2
print(f'squared length = {L2:.4f}')
print(f'P(0) = {p[0]:.4f}   P(1) = {p[1]:.4f}')
print(f'sum of P = {p.sum():.4f}')`},

'inner-conj': {
  title:'The conjugate in the inner product',
  what:'Computes $\\langle a|b\\rangle$ for $|a\\rangle=(1,i)/\\sqrt2$ and $|b\\rangle=(1,-i)/\\sqrt2$, once with the conjugate and once without it.',
  try:'Replace $|b\\rangle$ by $|a\\rangle$ in both products. Predict the two printed numbers before you run it.',
  out:'with the conjugate:    <a|b> = 0.0000\nwithout the conjugate: <a|b> = 1.0000\n<a|a> = 1.0000',
  qk:`import numpy as np
from qiskit.quantum_info import Statevector

a = Statevector(np.array([1, 1j]) / np.sqrt(2))
b = Statevector(np.array([1, -1j]) / np.sqrt(2))

# inner() conjugates its own state, the first argument
right = a.inner(b)
wrong = np.dot(a.data, b.data)      # no conjugate: the mistake
r = lambda z: round(float(np.real(z)), 10) + 0.0
print(f'with the conjugate:    <a|b> = {r(right):.4f}')
print(f'without the conjugate: <a|b> = {r(wrong):.4f}')
print(f'<a|a> = {r(a.inner(a)):.4f}')`,
  py:`import numpy as np

a = np.array([1, 1j]) / np.sqrt(2)
b = np.array([1, -1j]) / np.sqrt(2)

# np.vdot conjugates its first argument; np.dot does not
right = np.vdot(a, b)
wrong = np.dot(a, b)                # no conjugate: the mistake
r = lambda z: round(float(np.real(z)), 10) + 0.0
print(f'with the conjugate:    <a|b> = {r(right):.4f}')
print(f'without the conjugate: <a|b> = {r(wrong):.4f}')
print(f'<a|a> = {r(np.vdot(a, a)):.4f}')`},

'basis-coeff': {
  title:'Coefficients in the $X$ basis',
  what:'Reads the coefficients of $|0\\rangle$ and of $|1\\rangle$ in the basis $|\\pm\\rangle$ as inner products, $v_{j}=\\langle e_{j}|v\\rangle$.',
  try:'Read the coefficients of $|1\\rangle$ in the basis $(|0\\rangle\\pm i|1\\rangle)/\\sqrt2$ instead. Predict their moduli first.',
  out:'<+|0> = 0.7071   <-|0> = 0.7071\n<+|1> = 0.7071   <-|1> = -0.7071\nsum of squares for |1> = 1.0000',
  qk:`import numpy as np
from qiskit.quantum_info import Statevector

plus = Statevector.from_label('+')
minus = Statevector.from_label('-')
k0 = Statevector.from_label('0')
k1 = Statevector.from_label('1')

# A coefficient is an inner product with the basis vector
c = [[e.inner(v).real for e in (plus, minus)] for v in (k0, k1)]
print(f'<+|0> = {c[0][0]:.4f}   <-|0> = {c[0][1]:.4f}')
print(f'<+|1> = {c[1][0]:.4f}   <-|1> = {c[1][1]:.4f}')
print(f'sum of squares for |1> = {c[1][0]**2 + c[1][1]**2:.4f}')`,
  py:`import numpy as np

plus = np.array([1, 1]) / np.sqrt(2)
minus = np.array([1, -1]) / np.sqrt(2)
k0 = np.array([1, 0])
k1 = np.array([0, 1])

# A coefficient is an inner product with the basis vector
c = [[np.vdot(e, v).real for e in (plus, minus)] for v in (k0, k1)]
print(f'<+|0> = {c[0][0]:.4f}   <-|0> = {c[0][1]:.4f}')
print(f'<+|1> = {c[1][0]:.4f}   <-|1> = {c[1][1]:.4f}')
print(f'sum of squares for |1> = {c[1][0]**2 + c[1][1]**2:.4f}')`},

/* ---- 1.2 Amplitude, phase and interference ----------------------------- */

'polar': {
  title:'Modulus and phase of an amplitude',
  what:'Takes a state whose $|1\\rangle$ amplitude is $(-1+i)/2$ and computes the modulus and phase of $z=-1+i$, with the quadrant kept and with it lost.',
  try:'Change the amplitude to $(-1-i)/2$. Predict what <code>np.angle</code> and the arctangent each return.',
  out:'|z| = 1.4142\nnp.angle(z) = 2.3562 rad   (3pi/4 = 2.3562)\narctan(y/x) = -0.7854 rad\nrelative phase of the two amplitudes = 1.5708 rad',
  qk:`import numpy as np
from qiskit.quantum_info import Statevector

# A state whose |1> amplitude is (-1+i)/2
psi = Statevector([0.5 * (1 + 1j), 0.5 * (-1 + 1j)])
z = 2 * psi.data[1]                 # z = -1 + i

print(f'|z| = {abs(z):.4f}')
print(f'np.angle(z) = {np.angle(z):.4f} rad   (3pi/4 = {3*np.pi/4:.4f})')
print(f'arctan(y/x) = {np.arctan(z.imag / z.real):.4f} rad')
rel = np.angle(psi.data[1] / psi.data[0])
print(f'relative phase of the two amplitudes = {rel:.4f} rad')`,
  py:`import numpy as np

# A state whose |1> amplitude is (-1+i)/2
psi = np.array([0.5 * (1 + 1j), 0.5 * (-1 + 1j)])
z = 2 * psi[1]                      # z = -1 + i

print(f'|z| = {abs(z):.4f}')
print(f'np.angle(z) = {np.angle(z):.4f} rad   (3pi/4 = {3*np.pi/4:.4f})')
print(f'arctan(y/x) = {np.arctan(z.imag / z.real):.4f} rad')
rel = np.angle(psi[1] / psi[0])
print(f'relative phase of the two amplitudes = {rel:.4f} rad')`},

'global-phase': {
  title:'A global phase changes nothing',
  what:'Multiplies the state $\\tfrac12|0\\rangle+\\tfrac{\\sqrt3}{2}i|1\\rangle$ by $e^{i\\gamma}$ for three values of $\\gamma$ and prints the probabilities each time.',
  try:'Multiply only the $|1\\rangle$ amplitude by $e^{i\\gamma}$. Predict whether the probabilities change and whether the last line still says True.',
  out:'gamma = 0.00   P(0) = 0.2500   P(1) = 0.7500\ngamma = 1.00   P(0) = 0.2500   P(1) = 0.7500\ngamma = 2.50   P(0) = 0.2500   P(1) = 0.7500\nsame state up to a global phase: True',
  qk:`import numpy as np
from qiskit.quantum_info import Statevector

psi = Statevector([0.5, np.sqrt(3) / 2 * 1j])

for g in [0.0, 1.0, 2.5]:
    phi = Statevector(np.exp(1j * g) * psi.data)
    p = phi.probabilities()
    print(f'gamma = {g:.2f}   P(0) = {p[0]:.4f}   P(1) = {p[1]:.4f}')

# equiv() compares two states up to a global phase
print('same state up to a global phase:', phi.equiv(psi))`,
  py:`import numpy as np

psi = np.array([0.5, np.sqrt(3) / 2 * 1j])

for g in [0.0, 1.0, 2.5]:
    phi = np.exp(1j * g) * psi
    p = np.abs(phi)**2
    print(f'gamma = {g:.2f}   P(0) = {p[0]:.4f}   P(1) = {p[1]:.4f}')

# Two unit vectors are one state when |<psi|phi>| = 1
same = bool(np.isclose(abs(np.vdot(psi, phi)), 1))
print('same state up to a global phase:', same)`},

'hadamard-phase': {
  title:'A relative phase, read by a Hadamard',
  what:'Prepares $(|0\\rangle+e^{i\\varphi}|1\\rangle)/\\sqrt2$, applies a Hadamard, and prints $P(0)$ for three relative phases.',
  try:'Add $\\varphi=2\\pi/3$ to the list. Predict $P(0)=\\cos^{2}(\\varphi/2)$ before you run it.',
  out:'phi = 0.0000   P(0) after H = 1.0000\nphi = 1.5708   P(0) after H = 0.5000\nphi = 3.1416   P(0) after H = 0.0000',
  qk:`import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

# H, a phase on |1>, then H again
for phi in [0, np.pi / 2, np.pi]:
    qc = QuantumCircuit(1)
    qc.h(0)
    qc.p(phi, 0)
    qc.h(0)
    p0 = Statevector(qc).probabilities()[0]
    print(f'phi = {phi:.4f}   P(0) after H = {p0:.4f}')`,
  py:`import numpy as np

H = np.array([[1, 1], [1, -1]]) / np.sqrt(2)

# (|0> + e^{i phi}|1>)/sqrt2, then H
for phi in [0, np.pi / 2, np.pi]:
    psi = np.array([1, np.exp(1j * phi)]) / np.sqrt(2)
    out = H @ psi
    p0 = abs(out[0])**2
    print(f'phi = {phi:.4f}   P(0) after H = {p0:.4f}')`},

/* ---- 1.3 Outer products and projectors --------------------------------- */

'outer': {
  title:'A ket beside a bra',
  what:'Builds $|0\\rangle\\langle 1|$ as a column times a conjugated row, squares it, and applies $|1\\rangle\\langle 0|$ to $|0\\rangle$.',
  try:'Build $|1\\rangle\\langle 1|$ instead. Predict its matrix and whether its square is zero.',
  out:'|0><1| =\n[[0 1]\n [0 0]]\nits square is zero: True\n|1><0| applied to |0> gives |1>: True',
  qk:`import numpy as np
from qiskit.quantum_info import Statevector, Operator

k0 = Statevector.from_label('0')
k1 = Statevector.from_label('1')

# Column times conjugated row: an operator
M = Operator(np.outer(k0.data, k1.data.conj()))
print('|0><1| =')
print(M.data.real.astype(int))
print('its square is zero:', np.allclose((M @ M).data, 0))

N = Operator(np.outer(k1.data, k0.data.conj()))
print('|1><0| applied to |0> gives |1>:', k0.evolve(N).equiv(k1))`,
  py:`import numpy as np

k0 = np.array([1, 0])
k1 = np.array([0, 1])

# Column times conjugated row: an operator
M = np.outer(k0, k1.conj())
print('|0><1| =')
print(M.real.astype(int))
print('its square is zero:', np.allclose(M @ M, 0))

N = np.outer(k1, k0.conj())
print('|1><0| applied to |0> gives |1>:', np.allclose(N @ k0, k1))`},

'projector': {
  title:'What a projector keeps',
  what:'Splits $|0\\rangle$ into the part along $|+\\rangle$ and the part orthogonal to it, and checks $P^{2}=P$.',
  try:'Project $(\\sqrt3|0\\rangle+|1\\rangle)/2$ onto $|1\\rangle$ instead. Predict the two lengths first.',
  out:'P squared equals P: True\nkept part length      = 0.7071\ndiscarded part length = 0.7071\n<kept|discarded> = 0.0000',
  qk:`import numpy as np
from qiskit.quantum_info import Statevector, Operator

P = Statevector.from_label('+').to_operator()    # |+><+|
I = Operator(np.eye(2))
v = Statevector.from_label('0')

kept = v.evolve(P)
gone = v.evolve(I - P)
r = lambda z: round(float(np.real(z)), 10) + 0.0
print('P squared equals P:', P @ P == P)
print(f'kept part length      = {np.linalg.norm(kept.data):.4f}')
print(f'discarded part length = {np.linalg.norm(gone.data):.4f}')
print(f'<kept|discarded> = {r(kept.inner(gone)):.4f}')`,
  py:`import numpy as np

plus = np.array([1, 1]) / np.sqrt(2)
P = np.outer(plus, plus.conj())                  # |+><+|
I = np.eye(2)
v = np.array([1, 0])

kept = P @ v
gone = (I - P) @ v
r = lambda z: round(float(np.real(z)), 10) + 0.0
print('P squared equals P:', np.allclose(P @ P, P))
print(f'kept part length      = {np.linalg.norm(kept):.4f}')
print(f'discarded part length = {np.linalg.norm(gone):.4f}')
print(f'<kept|discarded> = {r(np.vdot(kept, gone)):.4f}')`},

'resolve': {
  title:'Insert the resolution of the identity',
  what:'Adds the projectors of the $X$ basis, then computes $\\langle 0|1\\rangle$ by inserting them between the bra and the ket.',
  try:'Insert the basis $(|0\\rangle\\pm i|1\\rangle)/\\sqrt2$ instead. Predict the two terms and their sum.',
  out:'sum of the X-basis projectors is I: True\n<0|+><+|1> = 0.5000\n<0|-><-|1> = -0.5000\n<0|1> by insertion = 0.0000',
  qk:`import numpy as np
from qiskit.quantum_info import Statevector

k0, k1 = Statevector.from_label('0'), Statevector.from_label('1')
basis = [Statevector.from_label('+'), Statevector.from_label('-')]

S = basis[0].to_operator() + basis[1].to_operator()
print('sum of the X-basis projectors is I:', np.allclose(S.data, np.eye(2)))

r = lambda z: round(float(np.real(z)), 10) + 0.0
terms = [k0.inner(e) * e.inner(k1) for e in basis]
print(f'<0|+><+|1> = {r(terms[0]):.4f}')
print(f'<0|-><-|1> = {r(terms[1]):.4f}')
print(f'<0|1> by insertion = {r(sum(terms)):.4f}')`,
  py:`import numpy as np

k0, k1 = np.array([1, 0]), np.array([0, 1])
basis = [np.array([1, 1]) / np.sqrt(2), np.array([1, -1]) / np.sqrt(2)]

S = sum(np.outer(e, e.conj()) for e in basis)
print('sum of the X-basis projectors is I:', np.allclose(S, np.eye(2)))

r = lambda z: round(float(np.real(z)), 10) + 0.0
terms = [np.vdot(k0, e) * np.vdot(e, k1) for e in basis]
print(f'<0|+><+|1> = {r(terms[0]):.4f}')
print(f'<0|-><-|1> = {r(terms[1]):.4f}')
print(f'<0|1> by insertion = {r(sum(terms)):.4f}')`},

/* ---- 1.4 Building an orthonormal basis --------------------------------- */

'gs-step': {
  title:'Gram-Schmidt by hand',
  what:'Runs one Gram-Schmidt step on $v_{1}=(1,1)$ and $v_{2}=(1,0)$ and checks that the result is $|+\\rangle$ and $|-\\rangle$.',
  try:'Start from $v_{1}=(1,0)$ and $v_{2}=(1,1)$, in the other order. Predict $e_{1}$ and $e_{2}$.',
  out:'e1 = (0.7071, 0.7071)\ne2 = (0.7071, -0.7071)\ne1 is |+>: True   e2 is |->: True',
  qk:`import numpy as np
from qiskit.quantum_info import Statevector

v1 = np.array([1.0, 1.0])
v2 = np.array([1.0, 0.0])

e1 = v1 / np.linalg.norm(v1)
u2 = v2 - np.vdot(e1, v2) * e1      # remove the part along e1
e2 = u2 / np.linalg.norm(u2)

print(f'e1 = ({e1[0]:.4f}, {e1[1]:.4f})')
print(f'e2 = ({e2[0]:.4f}, {e2[1]:.4f})')
a = Statevector(e1).equiv(Statevector.from_label('+'))
b = Statevector(e2).equiv(Statevector.from_label('-'))
print(f'e1 is |+>: {a}   e2 is |->: {b}')`,
  py:`import numpy as np

v1 = np.array([1.0, 1.0])
v2 = np.array([1.0, 0.0])

e1 = v1 / np.linalg.norm(v1)
u2 = v2 - np.vdot(e1, v2) * e1      # remove the part along e1
e2 = u2 / np.linalg.norm(u2)

print(f'e1 = ({e1[0]:.4f}, {e1[1]:.4f})')
print(f'e2 = ({e2[0]:.4f}, {e2[1]:.4f})')
a = bool(np.isclose(abs(np.vdot(e1, [1, 1] / np.sqrt(2))), 1))
b = bool(np.isclose(abs(np.vdot(e2, [1, -1] / np.sqrt(2))), 1))
print(f'e1 is |+>: {a}   e2 is |->: {b}')`},

'gs-residual': {
  title:'The residual, and QR',
  what:'Computes $u_{2}$ for $v_{1}=(1,0)$ and $v_{2}=(3,4)$, and compares its length with what a QR factorisation reports.',
  try:'Use $v_{2}=(5,12)$. Predict $u_{2}$ and its length before you run it.',
  out:'u2 = (0.0000, 4.0000)\nlength of u2 = 4.0000\nQR gives |R[1,1]| = 4.0000\nthe basis is orthonormal: True',
  qk:`import numpy as np
from qiskit.quantum_info import Operator

v1 = np.array([1.0, 0.0])
v2 = np.array([3.0, 4.0])

u2 = v2 - np.vdot(v1, v2) * v1      # v1 already has length one
print(f'u2 = ({u2[0]:.4f}, {u2[1]:.4f})')
print(f'length of u2 = {np.linalg.norm(u2):.4f}')

Q, R = np.linalg.qr(np.column_stack([v1, v2]))
print(f'QR gives |R[1,1]| = {abs(R[1, 1]):.4f}')
# A square matrix with orthonormal columns is unitary
print('the basis is orthonormal:', Operator(Q).is_unitary())`,
  py:`import numpy as np

v1 = np.array([1.0, 0.0])
v2 = np.array([3.0, 4.0])

u2 = v2 - np.vdot(v1, v2) * v1      # v1 already has length one
print(f'u2 = ({u2[0]:.4f}, {u2[1]:.4f})')
print(f'length of u2 = {np.linalg.norm(u2):.4f}')

Q, R = np.linalg.qr(np.column_stack([v1, v2]))
print(f'QR gives |R[1,1]| = {abs(R[1, 1]):.4f}')
# Orthonormal columns: Q^dagger Q = I
print('the basis is orthonormal:', np.allclose(Q.conj().T @ Q, np.eye(2)))`},

'gs-fail': {
  title:'Where Gram-Schmidt breaks',
  what:'Orthogonalises three nearly parallel vectors twice, by the recursion of the section and by the modified recursion, and checks each result.',
  try:'Change <code>eps</code> to $10^{-3}$. Predict whether both recursions then pass.',
  out:'classical: orthonormal: False\nmodified:  orthonormal: True',
  qk:`import numpy as np
from qiskit.quantum_info import Operator

eps = 1e-10                         # 1 + eps**2 rounds to 1
A = np.array([[1, 1, 1], [eps, 0, 0], [0, eps, 0], [0, 0, eps]])

def gs(A, modified):
    E = []
    for v in A.T:
        u = v.copy()
        for e in E:                 # subtract from u, or from v
            u = u - np.vdot(e, u if modified else v) * e
        E.append(u / np.linalg.norm(u))
    G = np.array(E) @ np.array(E).T  # every <e_i|e_j>
    return Operator(G).equiv(Operator(np.eye(3)))

print('classical: orthonormal:', gs(A, False))
print('modified:  orthonormal:', gs(A, True))`,
  py:`import numpy as np

eps = 1e-10                         # 1 + eps**2 rounds to 1
A = np.array([[1, 1, 1], [eps, 0, 0], [0, eps, 0], [0, 0, eps]])

def gs(A, modified):
    E = []
    for v in A.T:
        u = v.copy()
        for e in E:                 # subtract from u, or from v
            u = u - np.vdot(e, u if modified else v) * e
        E.append(u / np.linalg.norm(u))
    G = np.array(E) @ np.array(E).T  # every <e_i|e_j>
    return bool(np.allclose(G, np.eye(3), rtol=1e-5, atol=1e-8))

print('classical: orthonormal:', gs(A, False))
print('modified:  orthonormal:', gs(A, True))`},

/* ---- 1.5 The tensor product -------------------------------------------- */

'tensor-order': {
  title:'The bit order of a register',
  what:'Forms $|1\\rangle\\otimes|0\\rangle$ with qubit $1$ written first, and prints which entry of the four holds the amplitude.',
  try:'Put qubit $1$ in $|0\\rangle$ and qubit $0$ in $|1\\rangle$. Predict the entry and the string.',
  out:'amplitudes: [0 0 1 0]\nnon-zero entry: 2, the string 10',
  qk:`import numpy as np
from qiskit.quantum_info import Statevector

q1 = Statevector.from_label('1')
q0 = Statevector.from_label('0')

# a.tensor(b) puts b on qubit 0: the order |q1 q0>
s = q1.tensor(q0)
x = int(np.argmax(np.abs(s.data)))

print('amplitudes:', s.data.real.astype(int))
print(f'non-zero entry: {x}, the string {x:02b}')`,
  py:`import numpy as np

q1 = np.array([0, 1])               # |1>
q0 = np.array([1, 0])               # |0>

# np.kron(a, b) puts b on qubit 0: the order |q1 q0>
s = np.kron(q1, q0)
x = int(np.argmax(np.abs(s)))

print('amplitudes:', s.real.astype(int))
print(f'non-zero entry: {x}, the string {x:02b}')`},

'x-tensor-x': {
  title:'An operator on two qubits',
  what:'Builds $X\\otimes X$ as one $4\\times4$ matrix and applies it to $|01\\rangle$.',
  try:'Build $X\\otimes I$ instead. Predict which string $|01\\rangle$ goes to.',
  out:'X tensor X =\n[[0 0 0 1]\n [0 0 1 0]\n [0 1 0 0]\n [1 0 0 0]]\nit sends |01> to |10>: True',
  qk:`import numpy as np
from qiskit.quantum_info import Operator, Statevector

XX = Operator.from_label('XX')      # X on qubit 1 and on qubit 0

print('X tensor X =')
print(XX.data.real.astype(int))

s = Statevector.from_label('01').evolve(XX)
print('it sends |01> to |10>:', s.equiv(Statevector.from_label('10')))`,
  py:`import numpy as np

X = np.array([[0, 1], [1, 0]])
XX = np.kron(X, X)                  # X on qubit 1 and on qubit 0

print('X tensor X =')
print(XX)

s01 = np.array([0, 1, 0, 0])        # entry 1 is |01>
s10 = np.array([0, 0, 1, 0])        # entry 2 is |10>
print('it sends |01> to |10>:', np.allclose(XX @ s01, s10))`},

'dimension': {
  title:'How the column grows',
  what:'Builds the state $|0\\ldots0\\rangle$ of $n$ qubits and prints how many amplitudes its column holds and the memory they take.',
  try:'Add $n=22$ to the list. Predict the count and the memory before you run it.',
  out:'n =  1   amplitudes = 2   memory = 0.00 MB\nn =  2   amplitudes = 4   memory = 0.00 MB\nn = 10   amplitudes = 1024   memory = 0.02 MB\nn = 20   amplitudes = 1048576   memory = 16.00 MB\nthe count is 2**n every time: True',
  qk:`import numpy as np
from qiskit.quantum_info import Statevector

counts = {}
for n in [1, 2, 10, 20]:
    # every qubit in |0>: one amplitude is 1, the rest are 0
    s = Statevector.from_label('0' * n)
    counts[n] = s.dim
    mb = s.dim * 16 / 2**20         # 16 bytes a complex amplitude
    print(f'n = {n:2d}   amplitudes = {s.dim}   memory = {mb:.2f} MB')

print('the count is 2**n every time:', all(d == 2**n for n, d in counts.items()))`,
  py:`import numpy as np

counts = {}
for n in [1, 2, 10, 20]:
    # every qubit in |0>: one Kronecker product a qubit
    s = np.array([1.0 + 0j])
    for _ in range(n):
        s = np.kron(s, [1.0, 0.0])
    counts[n] = s.size
    mb = s.nbytes / 2**20           # 16 bytes a complex amplitude
    print(f'n = {n:2d}   amplitudes = {s.size}   memory = {mb:.2f} MB')

print('the count is 2**n every time:', all(d == 2**n for n, d in counts.items()))`},

/* ---- 1.6 Hermitian and unitary operators ------------------------------- */

'adjoint': {
  title:'The adjoint, and the transpose that is not it',
  what:'Tests two matrices for Hermiticity with the adjoint, then shows that the transpose alone gives the wrong answer for the second.',
  try:'Test $\\begin{bmatrix}2&1-i\\\\1+i&0\\end{bmatrix}$. Predict all three lines.',
  out:'C equals its adjoint: True\nA equals its adjoint: False\nA equals its transpose: True',
  qk:`import numpy as np
from qiskit.quantum_info import Operator

C = Operator([[1, 1j], [-1j, 1]])
A = Operator([[1, 2j], [2j, 3]])

# adjoint() conjugates every entry and transposes
print('C equals its adjoint:', C.adjoint() == C)
print('A equals its adjoint:', A.adjoint() == A)
# the transpose alone drops the conjugate
print('A equals its transpose:', A.transpose() == A)`,
  py:`import numpy as np

C = np.array([[1, 1j], [-1j, 1]])
A = np.array([[1, 2j], [2j, 3]])

# .conj().T conjugates every entry and transposes
print('C equals its adjoint:', np.allclose(C.conj().T, C))
print('A equals its adjoint:', np.allclose(A.conj().T, A))
# .T alone drops the conjugate
print('A equals its transpose:', np.allclose(A.T, A))`},

'unitary': {
  title:'Unitary or not',
  what:'Tests the Hadamard and a shear for $U^{\\dagger}U=I$, and measures what the shear does to the length of $|1\\rangle$.',
  try:'Test $\\begin{bmatrix}0&i\\\\i&0\\end{bmatrix}$. Predict whether it is unitary and whether it is its own inverse.',
  out:'H is unitary: True\nH is its own inverse: True\nthe shear is unitary: False\nthe shear sends |1> to length 1.4142',
  qk:`import numpy as np
from qiskit.circuit.library import HGate
from qiskit.quantum_info import Operator, Statevector

H = Operator(HGate())
S = Operator([[1, 1], [0, 1]])      # determinant 1, not unitary

print('H is unitary:', H.is_unitary())
print('H is its own inverse:', H @ H == Operator(np.eye(2)))
print('the shear is unitary:', S.is_unitary())
out = Statevector.from_label('1').evolve(S)
print(f'the shear sends |1> to length {np.linalg.norm(out.data):.4f}')`,
  py:`import numpy as np

H = np.array([[1, 1], [1, -1]]) / np.sqrt(2)
S = np.array([[1, 1], [0, 1]])      # determinant 1, not unitary
unitary = lambda U: np.allclose(U.conj().T @ U, np.eye(2))

print('H is unitary:', unitary(H))
print('H is its own inverse:', np.allclose(H @ H, np.eye(2)))
print('the shear is unitary:', unitary(S))
out = S @ np.array([0, 1])
print(f'the shear sends |1> to length {np.linalg.norm(out):.4f}')`},

'generator': {
  title:'A rotation from its generator',
  what:'Builds $e^{-i\\theta X/2}$ at several angles and compares it with the closed form $\\cos(\\theta/2)I-i\\sin(\\theta/2)X$.',
  try:'Use $\\theta=3\\pi$. Predict which simple matrix comes out.',
  out:'theta = 1.30: equals the closed form: True\ntheta = pi:   equals -iX: True\ntheta = 2pi:  equals -I:  True\ntheta = 4pi:  equals  I:  True',
  qk:`import numpy as np
from qiskit.circuit.library import RXGate
from qiskit.quantum_info import Operator

I, X = np.eye(2), np.array([[0, 1], [1, 0]])
U = lambda t: Operator(RXGate(t)).data       # exp(-i t X / 2)
closed = np.cos(1.3 / 2) * I - 1j * np.sin(1.3 / 2) * X

print('theta = 1.30: equals the closed form:', np.allclose(U(1.3), closed))
print('theta = pi:   equals -iX:', np.allclose(U(np.pi), -1j * X))
print('theta = 2pi:  equals -I: ', np.allclose(U(2 * np.pi), -I))
print('theta = 4pi:  equals  I: ', np.allclose(U(4 * np.pi), I))`,
  py:`import numpy as np

I, X = np.eye(2), np.array([[0, 1], [1, 0]])
w, V = np.linalg.eigh(X)            # exponentiate the eigenvalues
U = lambda t: V @ np.diag(np.exp(-1j * t * w / 2)) @ V.conj().T
closed = np.cos(1.3 / 2) * I - 1j * np.sin(1.3 / 2) * X

print('theta = 1.30: equals the closed form:', np.allclose(U(1.3), closed))
print('theta = pi:   equals -iX:', np.allclose(U(np.pi), -1j * X))
print('theta = 2pi:  equals -I: ', np.allclose(U(2 * np.pi), -I))
print('theta = 4pi:  equals  I: ', np.allclose(U(4 * np.pi), I))`},

/* ---- 1.7 The spectral theorem and functions of an operator ------------- */

'eig': {
  title:'Eigenvalues of a Hermitian matrix',
  what:'Finds the eigenvalues and eigenvectors of $A=\\begin{bmatrix}2&1\\\\1&2\\end{bmatrix}=2I+X$ with the routine for Hermitian matrices.',
  try:'Use $A=3I-2Z$. Predict both eigenvalues and which basis state goes with each.',
  out:'eigenvalues: 1.0000 and 3.0000\ntrace = 4.0000, sum of eigenvalues = 4.0000\neigenvector for 3 is |+>: True',
  qk:`import numpy as np
from qiskit.quantum_info import SparsePauliOp, Statevector

A = SparsePauliOp(['I', 'X'], coeffs=[2, 1]).to_matrix()   # 2I + X

w, V = np.linalg.eigh(A)            # ascending, orthonormal columns
print(f'eigenvalues: {w[0]:.4f} and {w[1]:.4f}')
print(f'trace = {np.trace(A).real:.4f}, sum of eigenvalues = {w.sum():.4f}')
top = Statevector(V[:, 1]).equiv(Statevector.from_label('+'))
print('eigenvector for 3 is |+>:', top)`,
  py:`import numpy as np

A = np.array([[2, 1], [1, 2]])      # 2I + X

w, V = np.linalg.eigh(A)            # ascending, orthonormal columns
print(f'eigenvalues: {w[0]:.4f} and {w[1]:.4f}')
print(f'trace = {np.trace(A):.4f}, sum of eigenvalues = {w.sum():.4f}')
plus = np.array([1, 1]) / np.sqrt(2)
top = bool(np.isclose(abs(np.vdot(V[:, 1], plus)), 1))
print('eigenvector for 3 is |+>:', top)`},

'spectral': {
  title:'An operator from its projectors',
  what:'Rebuilds $A$ from $3P_{+}+1P_{-}$ and checks the two properties the projectors must have.',
  try:'Build $4P_{+}-P_{-}$ instead. Predict its matrix entries before you print it.',
  out:'3 P+ + 1 P- is A: True\nP+ P- is zero: True\nP+ + P- is I: True',
  qk:`import numpy as np
from qiskit.quantum_info import Operator, Statevector

A = Operator([[2, 1], [1, 2]])
Pp = Statevector.from_label('+').to_operator()   # |+><+|
Pm = Statevector.from_label('-').to_operator()   # |-><-|

print('3 P+ + 1 P- is A:', 3 * Pp + 1 * Pm == A)
print('P+ P- is zero:', np.allclose((Pp @ Pm).data, 0))
print('P+ + P- is I:', Pp + Pm == Operator(np.eye(2)))`,
  py:`import numpy as np

A = np.array([[2, 1], [1, 2]])
plus, minus = np.array([1, 1]) / np.sqrt(2), np.array([1, -1]) / np.sqrt(2)
Pp = np.outer(plus, plus.conj())    # |+><+|
Pm = np.outer(minus, minus.conj())  # |-><-|

print('3 P+ + 1 P- is A:', np.allclose(3 * Pp + 1 * Pm, A))
print('P+ P- is zero:', np.allclose(Pp @ Pm, 0))
print('P+ + P- is I:', np.allclose(Pp + Pm, np.eye(2)))`},

'function': {
  title:'A function of an operator',
  what:'Computes $e^{-iAt}$ for $A=2I+X$ through its eigenvalues and checks it, then shows what the entry-by-entry exponential gets wrong.',
  try:'Change $t$ to $\\pi$. Predict $e^{-iAt}$ from $e^{-3i\\pi}P_{+}+e^{-i\\pi}P_{-}$ first.',
  out:'t = 0.7: spectral form matches: True\neigenvalues of exp(A):     2.7183 and 20.0855\nentrywise exp has instead: 4.6708 and 10.1073',
  qk:`import numpy as np
from qiskit.circuit.library import PauliEvolutionGate
from qiskit.quantum_info import Operator, SparsePauliOp

op = SparsePauliOp(['I', 'X'], coeffs=[2, 1])     # A = 2I + X
A, t = op.to_matrix(), 0.7
w, V = np.linalg.eigh(A)
spec = V @ np.diag(np.exp(-1j * w * t)) @ V.conj().T
exact = Operator(PauliEvolutionGate(op, time=t)).data   # exp(-iAt)
print(f't = 0.7: spectral form matches: {np.allclose(spec, exact)}')

true = np.exp(w)                    # the function acts on eigenvalues
wrong = np.linalg.eigvalsh(np.exp(A.real))
print(f'eigenvalues of exp(A):     {true[0]:.4f} and {true[1]:.4f}')
print(f'entrywise exp has instead: {wrong[0]:.4f} and {wrong[1]:.4f}')`,
  py:`import numpy as np
from math import factorial

A, t = np.array([[2.0, 1.0], [1.0, 2.0]]), 0.7   # A = 2I + X
w, V = np.linalg.eigh(A)
spec = V @ np.diag(np.exp(-1j * w * t)) @ V.conj().T
exact = sum(np.linalg.matrix_power(-1j * t * A, k) / factorial(k)
            for k in range(40))                  # the power series
print(f't = 0.7: spectral form matches: {np.allclose(spec, exact)}')

true = np.exp(w)                    # the function acts on eigenvalues
wrong = np.linalg.eigvalsh(np.exp(A))
print(f'eigenvalues of exp(A):     {true[0]:.4f} and {true[1]:.4f}')
print(f'entrywise exp has instead: {wrong[0]:.4f} and {wrong[1]:.4f}')`},

/* ---- 1.8 Dirac notation ------------------------------------------------ */

'expectation': {
  title:'Row, matrix, column: one number',
  what:'Computes $\\langle\\psi|Z|\\psi\\rangle$ and $\\langle\\psi|X|\\psi\\rangle$ for $|\\psi\\rangle=\\cos(\\pi/6)|0\\rangle+\\sin(\\pi/6)|1\\rangle$.',
  try:'Use $|\\psi\\rangle=|+\\rangle$. Predict both expectation values before you run it.',
  out:'<psi|Z|psi> = 0.5000\n<psi|X|psi> = 0.8660\nP(0) - P(1)  = 0.5000',
  qk:`import numpy as np
from qiskit.quantum_info import Pauli, Statevector

a = np.pi / 6
psi = Statevector([np.cos(a), np.sin(a)])

ez = psi.expectation_value(Pauli('Z')).real
ex = psi.expectation_value(Pauli('X')).real
p = psi.probabilities()
print(f'<psi|Z|psi> = {ez:.4f}')
print(f'<psi|X|psi> = {ex:.4f}')
print(f'P(0) - P(1)  = {p[0] - p[1]:.4f}')`,
  py:`import numpy as np

a = np.pi / 6
psi = np.array([np.cos(a), np.sin(a)])
Z = np.array([[1, 0], [0, -1]])
X = np.array([[0, 1], [1, 0]])

ez = np.vdot(psi, Z @ psi).real     # row, matrix, column
ex = np.vdot(psi, X @ psi).real
p = np.abs(psi)**2
print(f'<psi|Z|psi> = {ez:.4f}')
print(f'<psi|X|psi> = {ex:.4f}')
print(f'P(0) - P(1)  = {p[0] - p[1]:.4f}')`},

'matrix-elements': {
  title:'An operator read in a basis',
  what:'Computes the four numbers $\\langle e_{j}|H|e_{k}\\rangle$ of the Hadamard and rebuilds the operator from them, $H=\\sum_{j,k}|e_{j}\\rangle\\langle e_{j}|H|e_{k}\\rangle\\langle e_{k}|$.',
  try:'Read $H$ in the basis $|\\pm\\rangle$ instead. Predict the four numbers first.',
  out:'<0|H|0> = 0.7071   <0|H|1> = 0.7071\n<1|H|0> = 0.7071   <1|H|1> = -0.7071\nrebuilt from its entries: True',
  qk:`import numpy as np
from qiskit.circuit.library import HGate
from qiskit.quantum_info import Operator, Statevector

H = Operator(HGate())
e = [Statevector.from_label('0'), Statevector.from_label('1')]

# <e_j|H|e_k>: apply H to the ket, then take the inner product
m = [[e[j].inner(e[k].evolve(H)).real for k in (0, 1)] for j in (0, 1)]
print(f'<0|H|0> = {m[0][0]:.4f}   <0|H|1> = {m[0][1]:.4f}')
print(f'<1|H|0> = {m[1][0]:.4f}   <1|H|1> = {m[1][1]:.4f}')
B = sum(m[j][k] * np.outer(e[j].data, e[k].data) for j in (0, 1) for k in (0, 1))
print('rebuilt from its entries:', Operator(B) == H)`,
  py:`import numpy as np

H = np.array([[1, 1], [1, -1]]) / np.sqrt(2)
e = [np.array([1, 0]), np.array([0, 1])]

# <e_j|H|e_k>: apply H to the ket, then take the inner product
m = [[np.vdot(e[j], H @ e[k]).real for k in (0, 1)] for j in (0, 1)]
print(f'<0|H|0> = {m[0][0]:.4f}   <0|H|1> = {m[0][1]:.4f}')
print(f'<1|H|0> = {m[1][0]:.4f}   <1|H|1> = {m[1][1]:.4f}')
B = sum(m[j][k] * np.outer(e[j], e[k]) for j in (0, 1) for k in (0, 1))
print('rebuilt from its entries:', np.allclose(B, H))`},

'order': {
  title:'A circuit read right to left',
  what:'Runs $H$ and then $S$ on one qubit and asks which matrix product that is.',
  try:'Swap the two gates. Predict which of the two lines is now True.',
  out:'H then S is the matrix S H: True\nH then S is the matrix H S: False',
  qk:`import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator

qc = QuantumCircuit(1)
qc.h(0)                             # first
qc.s(0)                             # second
U = Operator(qc).data

H = np.array([[1, 1], [1, -1]]) / np.sqrt(2)
S = np.diag([1, 1j])
print('H then S is the matrix S H:', np.allclose(U, S @ H))
print('H then S is the matrix H S:', np.allclose(U, H @ S))`,
  py:`import numpy as np

H = np.array([[1, 1], [1, -1]]) / np.sqrt(2)
S = np.diag([1, 1j])

# apply H, then S, to each basis state: the columns of U
U = np.zeros((2, 2), dtype=complex)
for k in (0, 1):
    ket = np.eye(2)[:, k]
    U[:, k] = S @ (H @ ket)         # H first, S second

print('H then S is the matrix S H:', np.allclose(U, S @ H))
print('H then S is the matrix H S:', np.allclose(U, H @ S))`},

/* ---- 1.9 Functions as vectors ------------------------------------------ */

'l2-inner': {
  title:'A function as a state',
  what:'Samples $u=\\sin x/\\sqrt\\pi$ and $v=\\cos x/\\sqrt\\pi$ at $2^{12}$ points of $[-\\pi,\\pi]$ and stores each as the state of twelve qubits.',
  try:'Use $v=\\sin 2x/\\sqrt\\pi$. Predict $\\langle u|v\\rangle$ before you run it.',
  out:'samples = 4096, qubits = 12\n<u|v> = 0.0000\n<u|u> = 1.0000\nu is a valid state: True',
  qk:`import numpy as np
from qiskit.quantum_info import Statevector

n = 12
N = 2**n
x = -np.pi + (np.arange(N) + 0.5) * 2 * np.pi / N   # midpoints
dx = 2 * np.pi / N

# sqrt(dx) turns the integral into a sum over amplitudes
u = Statevector(np.sin(x) / np.sqrt(np.pi) * np.sqrt(dx))
v = Statevector(np.cos(x) / np.sqrt(np.pi) * np.sqrt(dx))
r = lambda z: round(float(np.real(z)), 10) + 0.0
print(f'samples = {N}, qubits = {u.num_qubits}')
print(f'<u|v> = {r(u.inner(v)):.4f}')
print(f'<u|u> = {r(u.inner(u)):.4f}')
print('u is a valid state:', u.is_valid())`,
  py:`import numpy as np

n = 12
N = 2**n
x = -np.pi + (np.arange(N) + 0.5) * 2 * np.pi / N   # midpoints
dx = 2 * np.pi / N

# sqrt(dx) turns the integral into a sum over amplitudes
u = np.sin(x) / np.sqrt(np.pi) * np.sqrt(dx)
v = np.cos(x) / np.sqrt(np.pi) * np.sqrt(dx)
r = lambda z: round(float(np.real(z)), 10) + 0.0
print(f'samples = {N}, qubits = {int(np.log2(u.size))}')
print(f'<u|v> = {r(np.vdot(u, v)):.4f}')
print(f'<u|u> = {r(np.vdot(u, u)):.4f}')
print('u is a valid state:', bool(np.isclose(np.linalg.norm(u), 1)))`},

'orthonormal-family': {
  title:'An orthonormal family of functions',
  what:'Samples $1/\\sqrt{2\\pi}$, $\\cos x/\\sqrt\\pi$, $\\sin x/\\sqrt\\pi$, $\\cos 2x/\\sqrt\\pi$ and $\\sin 2x/\\sqrt\\pi$ and checks that every pair has the inner product $\\delta_{jk}$.',
  try:'Add $\\cos 3x/\\sqrt\\pi$ to the family. Predict whether the check still passes.',
  out:'functions: 5\nevery <u_j|u_k> is delta_jk: True',
  qk:`import numpy as np
from qiskit.quantum_info import Statevector

N = 2**12
x = -np.pi + (np.arange(N) + 0.5) * 2 * np.pi / N
w = np.sqrt(2 * np.pi / N)          # sqrt(dx)
fam = [np.ones(N) / np.sqrt(2 * np.pi), np.cos(x) / np.sqrt(np.pi),
       np.sin(x) / np.sqrt(np.pi), np.cos(2 * x) / np.sqrt(np.pi),
       np.sin(2 * x) / np.sqrt(np.pi)]
S = [Statevector(f * w) for f in fam]

G = np.array([[a.inner(b) for b in S] for a in S])
print(f'functions: {len(S)}')
print('every <u_j|u_k> is delta_jk:', np.allclose(G, np.eye(len(S))))`,
  py:`import numpy as np

N = 2**12
x = -np.pi + (np.arange(N) + 0.5) * 2 * np.pi / N
w = np.sqrt(2 * np.pi / N)          # sqrt(dx)
fam = [np.ones(N) / np.sqrt(2 * np.pi), np.cos(x) / np.sqrt(np.pi),
       np.sin(x) / np.sqrt(np.pi), np.cos(2 * x) / np.sqrt(np.pi),
       np.sin(2 * x) / np.sqrt(np.pi)]
S = [f * w for f in fam]

G = np.array([[np.vdot(a, b) for b in S] for a in S])
print(f'functions: {len(S)}')
print('every <u_j|u_k> is delta_jk:', np.allclose(G, np.eye(len(S))))`},

'parseval': {
  title:'What truncation loses',
  what:'Expands $f(x)=x$ on $[-\\pi,\\pi]$ in the functions $\\sin nx/\\sqrt\\pi$, keeps $N$ terms, and compares the coefficient tail from Parseval with the squared error of the truncated sum.',
  try:'Keep $N=20$ terms. Predict whether the tail falls below $0.5$.',
  out:'<f|f> = 20.6709\nN = 5   tail = 2.2786   squared error = 2.2786',
  qk:`import numpy as np
from qiskit.quantum_info import Statevector

M = 2**14
x = -np.pi + (np.arange(M) + 0.5) * 2 * np.pi / M
w = np.sqrt(2 * np.pi / M)          # sqrt(dx)
f = Statevector(x * w)              # not normalised: <f|f> is the energy
N = 5
u = [Statevector(np.sin(n * x) / np.sqrt(np.pi) * w) for n in range(1, N + 1)]
c = np.array([un.inner(f).real for un in u])   # c_n = <u_n|f>

energy = f.inner(f).real
tail = energy - np.sum(c**2)        # Parseval: the rest of the sum
err = np.sum(np.abs(f.data - sum(cn * un.data for cn, un in zip(c, u)))**2)
print(f'<f|f> = {energy:.4f}')
print(f'N = {N}   tail = {tail:.4f}   squared error = {err:.4f}')`,
  py:`import numpy as np

M = 2**14
x = -np.pi + (np.arange(M) + 0.5) * 2 * np.pi / M
w = np.sqrt(2 * np.pi / M)          # sqrt(dx)
f = x * w                           # not normalised: <f|f> is the energy
N = 5
u = np.array([np.sin(n * x) / np.sqrt(np.pi) * w for n in range(1, N + 1)])
c = u @ f                           # c_n = <u_n|f>

energy = np.vdot(f, f).real
tail = energy - np.sum(c**2)        # Parseval: the rest of the sum
err = np.sum(np.abs(f - c @ u)**2)
print(f'<f|f> = {energy:.4f}')
print(f'N = {N}   tail = {tail:.4f}   squared error = {err:.4f}')`}

};
