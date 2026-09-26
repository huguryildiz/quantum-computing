/* ==========================================================================
   Code for Module 3: programs in Qiskit and in NumPy
   The same form as 77_code_m1.js and 78_code_m2.js: one entry a program,
   each written twice (`qk`, a Qiskit listing to copy; `py`, NumPy only, run on
   the page) and printing the same lines, which are `out`. A density matrix
   in the NumPy versions is a plain array, and a partial trace is a reshape;
   the Qiskit listings use DensityMatrix, Kraus and partial_trace, which keep
   the course's order |q1 q0> (Qiskit's qubit 0 is the right-hand factor).
   Each teaching section closes with a code page (`CODE_BANKS_M3`) that pages
   through its programs.
   verify/code_check.py runs every entry in both forms and compares what it
   prints with `out`.
   ========================================================================== */
const CODE_BANKS_M3 = {
  'm3-code-rho':      ['rho-pure', 'state-test', 'two-ensembles'],
  'm3-code-purity':   ['purity-two-ways', 'bloch-vector', 'purity-curve'],
  'm3-code-channels': ['kraus-complete', 'damping', 'dephasing'],
  'm3-code-t1t2':     ['t2-from-rates', 'damping-steps', 'fit-t1'],
  'm3-code-ptrace':   ['ordering', 'partial-trace', 'pure-whole'],
  'm3-code-schmidt':  ['product-test', 'schmidt-svd', 'rank-tolerance'],
  'm3-code-entropy':  ['entropy', 'entropy-curve', 'noisy-pair'],
  'm3-code-bell':     ['bell-correlations', 'chsh', 'no-signal']
};

const CODE_M3 = {

/* ---- 3.1 The density operator ------------------------------------------ */

'rho-pure': {
  title:'The density matrix of a pure state',
  what:'Builds $\\rho=|\\psi\\rangle\\langle\\psi|$ for $\\tfrac{1}{\\sqrt2}(|0\\rangle+i|1\\rangle)$, checks the trace and $\\rho^{2}=\\rho$, and shows that a global phase changes nothing.',
  try:'Use $\\tfrac{1}{\\sqrt2}(|0\\rangle-i|1\\rangle)$. Predict which entries change and which stay the same.',
  out:' 0.50+0.00i   0.00-0.50i\n 0.00+0.50i   0.50+0.00i\ntrace = 1.0000\nmax |rho^2 - rho| = 0.0000\nmax change under a global phase = 0.0000',
  qk:`import numpy as np
from qiskit.quantum_info import DensityMatrix, Statevector

# The density matrix of (|0> + i|1>)/sqrt2
psi = Statevector(np.array([1, 1j]) / np.sqrt(2))
rho = DensityMatrix(psi).data               # |psi><psi|
r = np.round(rho, 12) + 0j                  # tidy away -0.0
for row in r:
    print('  '.join(f'{z.real:5.2f}{z.imag:+.2f}i' for z in row))
print(f'trace = {np.trace(rho).real:.4f}')
print(f'max |rho^2 - rho| = {np.abs(rho @ rho - rho).max():.4f}')

# A global phase e^(0.7i) changes nothing
rho2 = DensityMatrix(Statevector(np.exp(0.7j) * psi.data)).data
print(f'max change under a global phase = {np.abs(rho2 - rho).max():.4f}')`,
  py:`import numpy as np

# The density matrix of (|0> + i|1>)/sqrt2
psi = np.array([1, 1j]) / np.sqrt(2)
rho = np.outer(psi, psi.conj())             # |psi><psi|
r = np.round(rho, 12) + 0j                  # tidy away -0.0
for row in r:
    print('  '.join(f'{z.real:5.2f}{z.imag:+.2f}i' for z in row))
print(f'trace = {np.trace(rho).real:.4f}')
print(f'max |rho^2 - rho| = {np.abs(rho @ rho - rho).max():.4f}')

# A global phase e^(0.7i) changes nothing
phased = np.exp(0.7j) * psi
rho2 = np.outer(phased, phased.conj())
print(f'max change under a global phase = {np.abs(rho2 - rho).max():.4f}')`},

'state-test': {
  title:'Is this matrix a state?',
  what:'Tests two Hermitian matrices with trace one against the third condition, positivity, by looking at the smallest eigenvalue.',
  try:'Change the off-diagonal entries of $M$ to $0.5$. Predict the two eigenvalues and the verdict.',
  out:'A: Hermitian True, trace 1.00, eigenvalues +0.1464 +0.8536, a state: True\nM: Hermitian True, trace 1.00, eigenvalues -0.3000 +1.3000, a state: False',
  qk:`import numpy as np
from qiskit.quantum_info import DensityMatrix

# The running example, and a matrix that only looks like a state
cands = {'A': np.array([[0.75, 0.25], [0.25, 0.25]]),
         'M': np.array([[0.5, 0.8], [0.8, 0.5]])}

for name, M in cands.items():
    rho = DensityMatrix(M)
    herm = np.allclose(M, M.conj().T)
    lam = np.linalg.eigvalsh(M)             # in ascending order
    print(f'{name}: Hermitian {herm}, trace {rho.trace().real:.2f}, '
          f'eigenvalues {lam[0]:+.4f} {lam[1]:+.4f}, a state: {rho.is_valid()}')`,
  py:`import numpy as np

# The running example, and a matrix that only looks like a state
cands = {'A': np.array([[0.75, 0.25], [0.25, 0.25]]),
         'M': np.array([[0.5, 0.8], [0.8, 0.5]])}

for name, M in cands.items():
    herm = np.allclose(M, M.conj().T)
    tr = np.trace(M).real
    lam = np.linalg.eigvalsh(M)             # in ascending order
    valid = herm and abs(tr - 1) < 1e-9 and lam[0] > -1e-9
    print(f'{name}: Hermitian {herm}, trace {tr:.2f}, '
          f'eigenvalues {lam[0]:+.4f} {lam[1]:+.4f}, a state: {valid}')`},

'two-ensembles': {
  title:'Two preparations, one matrix',
  what:'Builds $I/2$ from the pair $|0\\rangle,|1\\rangle$ and from the pair $|{+}\\rangle,|{-}\\rangle$, compares the two matrices, and computes $\\langle Z\\rangle$ and $\\langle X\\rangle$ for each.',
  try:'Give the second device the weights $0.9$ and $0.1$. Predict which of the two means moves.',
  out:'max |rho_a - rho_b| = 0.0000\n<Z>: device a +0.0000, device b +0.0000\n<X>: device a +0.0000, device b +0.0000',
  qk:`import numpy as np
from qiskit.quantum_info import DensityMatrix, Pauli

P = lambda label: DensityMatrix.from_label(label).data     # |v><v|
rho_a = 0.5 * P('0') + 0.5 * P('1')         # a coin, then |0> or |1>
rho_b = 0.5 * P('+') + 0.5 * P('-')         # a coin, then |+> or |->
print(f'max |rho_a - rho_b| = {np.abs(rho_a - rho_b).max():.4f}')

for name in ('Z', 'X'):
    A = Pauli(name)
    ma = DensityMatrix(rho_a).expectation_value(A).real
    mb = DensityMatrix(rho_b).expectation_value(A).real
    ma, mb = round(ma, 12) + 0.0, round(mb, 12) + 0.0
    print(f'<{name}>: device a {ma:+.4f}, device b {mb:+.4f}')`,
  py:`import numpy as np

k0, k1 = np.array([1, 0]), np.array([0, 1])
kp, km = (k0 + k1) / np.sqrt(2), (k0 - k1) / np.sqrt(2)
P = lambda v: np.outer(v, v.conj())         # |v><v|
rho_a = 0.5 * P(k0) + 0.5 * P(k1)           # a coin, then |0> or |1>
rho_b = 0.5 * P(kp) + 0.5 * P(km)           # a coin, then |+> or |->
print(f'max |rho_a - rho_b| = {np.abs(rho_a - rho_b).max():.4f}')

ops = {'Z': np.diag([1, -1]), 'X': np.array([[0, 1], [1, 0]])}
for name, A in ops.items():
    ma = np.trace(rho_a @ A).real
    mb = np.trace(rho_b @ A).real
    ma, mb = round(ma, 12) + 0.0, round(mb, 12) + 0.0
    print(f'<{name}>: device a {ma:+.4f}, device b {mb:+.4f}')`},

/* ---- 3.2 Purity and the ball ------------------------------------------- */

'purity-two-ways': {
  title:'Purity from the entries and from the eigenvalues',
  what:'Computes $\\operatorname{Tr}\\rho^{2}$ for the running example twice: as the sum of the squared entries, and as the sum of the squared eigenvalues.',
  try:'Set both off-diagonal entries to zero. Predict the purity before you run it.',
  out:'eigenvalues = 0.8536, 0.1464\npurity from the entries     = 0.7500\npurity from the eigenvalues = 0.7500\npurity from Tr(rho rho)     = 0.7500\na qubit has 0.50 <= purity <= 1.00',
  qk:`import numpy as np
from qiskit.quantum_info import DensityMatrix, purity

rho = DensityMatrix(np.array([[0.75, 0.25], [0.25, 0.25]]))

by_entries = np.sum(np.abs(rho.data)**2)    # the sum of |rho_jk|^2
lam = np.linalg.eigvalsh(rho.data)          # in ascending order
by_eigen = np.sum(lam**2)
print(f'eigenvalues = {lam[1]:.4f}, {lam[0]:.4f}')
print(f'purity from the entries     = {by_entries:.4f}')
print(f'purity from the eigenvalues = {by_eigen:.4f}')
print(f'purity from Tr(rho rho)     = {purity(rho).real:.4f}')
print(f'a qubit has {1/2:.2f} <= purity <= {1:.2f}')`,
  py:`import numpy as np

rho = np.array([[0.75, 0.25], [0.25, 0.25]])

by_entries = np.sum(np.abs(rho)**2)         # the sum of |rho_jk|^2
lam = np.linalg.eigvalsh(rho)               # in ascending order
by_eigen = np.sum(lam**2)
print(f'eigenvalues = {lam[1]:.4f}, {lam[0]:.4f}')
print(f'purity from the entries     = {by_entries:.4f}')
print(f'purity from the eigenvalues = {by_eigen:.4f}')
print(f'purity from Tr(rho rho)     = {np.trace(rho @ rho).real:.4f}')
print(f'a qubit has {1/2:.2f} <= purity <= {1:.2f}')`},

'bloch-vector': {
  title:'The three Pauli means are the state',
  what:'Reads $r_{a}=\\operatorname{Tr}(\\rho\\,\\sigma_{a})$ for the running example, gets the eigenvalues and the purity from $|\\mathbf{r}|$, and rebuilds $\\rho$ from $\\mathbf{r}$.',
  try:'Use $\\rho=\\operatorname{diag}(0.5,0.5)$. Predict $\\mathbf{r}$ and the purity first.',
  out:'r = (0.5000, 0.0000, 0.5000)   |r| = 0.7071\neigenvalues (1 +- |r|)/2 = 0.8536, 0.1464\npurity (1 + |r|^2)/2 = 0.7500\nmax |rebuilt - rho| = 0.0000',
  qk:`import numpy as np
from qiskit.quantum_info import DensityMatrix, Pauli

rho = DensityMatrix(np.array([[0.75, 0.25], [0.25, 0.25]]))

# r_a = Tr(rho sigma_a)
r = np.array([rho.expectation_value(Pauli(a)).real for a in 'XYZ'])
r = np.round(r, 12) + 0.0
L = np.linalg.norm(r)
print(f'r = ({r[0]:.4f}, {r[1]:.4f}, {r[2]:.4f})   |r| = {L:.4f}')
print(f'eigenvalues (1 +- |r|)/2 = {(1 + L)/2:.4f}, {(1 - L)/2:.4f}')
print(f'purity (1 + |r|^2)/2 = {(1 + L**2)/2:.4f}')

rebuilt = 0.5 * (np.eye(2) + sum(r[k] * Pauli(a).to_matrix() for k, a in enumerate('XYZ')))
print(f'max |rebuilt - rho| = {np.abs(rebuilt - rho.data).max():.4f}')`,
  py:`import numpy as np

rho = np.array([[0.75, 0.25], [0.25, 0.25]])
X = np.array([[0, 1], [1, 0]]); Y = np.array([[0, -1j], [1j, 0]]); Z = np.diag([1, -1])

# r_a = Tr(rho sigma_a)
r = np.array([np.trace(rho @ S).real for S in (X, Y, Z)])
r = np.round(r, 12) + 0.0
L = np.linalg.norm(r)
print(f'r = ({r[0]:.4f}, {r[1]:.4f}, {r[2]:.4f})   |r| = {L:.4f}')
print(f'eigenvalues (1 +- |r|)/2 = {(1 + L)/2:.4f}, {(1 - L)/2:.4f}')
print(f'purity (1 + |r|^2)/2 = {(1 + L**2)/2:.4f}')

rebuilt = 0.5 * (np.eye(2) + r[0] * X + r[1] * Y + r[2] * Z)
print(f'max |rebuilt - rho| = {np.abs(rebuilt - rho).max():.4f}')`},

'purity-curve': {
  title:'The purity of a mixture of two states',
  what:'Follows $\\operatorname{Tr}\\rho^{2}$ for $(1-p)|0\\rangle\\langle 0|+p|1\\rangle\\langle 1|$ as $p$ grows, and finds its lowest value on a fine grid.',
  try:'Mix $|0\\rangle$ with $|{+}\\rangle$ instead of $|1\\rangle$. Predict whether the lowest purity is still one half.',
  out:'p = 0.0:  purity = 1.0000\np = 0.1:  purity = 0.8200\np = 0.3:  purity = 0.5800\np = 0.5:  purity = 0.5000\np = 1.0:  purity = 1.0000\nlowest purity = 0.5000, at p = 0.500',
  qk:`import numpy as np
from qiskit.quantum_info import DensityMatrix, purity

def mix(p):
    # (1 - p)|0><0| + p|1><1|
    return DensityMatrix((1 - p) * DensityMatrix.from_label('0').data
                         + p * DensityMatrix.from_label('1').data)

for p in (0.0, 0.1, 0.3, 0.5, 1.0):
    print(f'p = {p:.1f}:  purity = {purity(mix(p)).real:.4f}')

grid = np.linspace(0, 1, 1001)
low = min(purity(mix(p)).real for p in grid)
where = grid[np.argmin([purity(mix(p)).real for p in grid])]
print(f'lowest purity = {low:.4f}, at p = {where:.3f}')`,
  py:`import numpy as np

k0, k1 = np.array([1, 0]), np.array([0, 1])

def mix(p):
    # (1 - p)|0><0| + p|1><1|
    return (1 - p) * np.outer(k0, k0) + p * np.outer(k1, k1)

for p in (0.0, 0.1, 0.3, 0.5, 1.0):
    print(f'p = {p:.1f}:  purity = {np.trace(mix(p) @ mix(p)).real:.4f}')

grid = np.linspace(0, 1, 1001)
low = min(np.trace(mix(p) @ mix(p)).real for p in grid)
where = grid[np.argmin([np.trace(mix(p) @ mix(p)).real for p in grid])]
print(f'lowest purity = {low:.4f}, at p = {where:.3f}')`},

/* ---- 3.3 Quantum channels ---------------------------------------------- */

'kraus-complete': {
  title:'A channel from its Kraus operators',
  what:'Writes the bit-flip channel with $p=0.2$, checks $\\sum_{k}K_{k}^{\\dagger}K_{k}=I$, applies it to $|0\\rangle$, and shows that it leaves $|{+}\\rangle$ alone.',
  try:'Replace $X$ by $Z$ in $K_{1}$. Predict what happens to $|0\\rangle$ and to $|{+}\\rangle$.',
  out:'max |sum K^dag K - I| = 0.0000\n|0> goes to diag(0.8000, 0.2000)\ntrace afterwards = 1.0000\n|+> changed by 0.0000',
  qk:`import numpy as np
from qiskit.quantum_info import DensityMatrix, Kraus, Pauli

p = 0.2
K = [np.sqrt(1 - p) * np.eye(2), np.sqrt(p) * Pauli('X').to_matrix()]
ch = Kraus(K)                                        # the bit-flip channel

total = sum(k.conj().T @ k for k in K)               # must be I
print(f'max |sum K^dag K - I| = {np.abs(total - np.eye(2)).max():.4f}')

out = DensityMatrix.from_label('0').evolve(ch).data
print(f'|0> goes to diag({out[0, 0].real:.4f}, {out[1, 1].real:.4f})')
print(f'trace afterwards = {np.trace(out).real:.4f}')

plus = DensityMatrix.from_label('+')
print(f'|+> changed by {np.abs(plus.evolve(ch).data - plus.data).max():.4f}')`,
  py:`import numpy as np

p = 0.2
X = np.array([[0, 1], [1, 0]])
K = [np.sqrt(1 - p) * np.eye(2), np.sqrt(p) * X]     # the bit-flip channel
channel = lambda rho: sum(k @ rho @ k.conj().T for k in K)

total = sum(k.conj().T @ k for k in K)               # must be I
print(f'max |sum K^dag K - I| = {np.abs(total - np.eye(2)).max():.4f}')

out = channel(np.diag([1.0, 0.0]))                   # |0><0|
print(f'|0> goes to diag({out[0, 0].real:.4f}, {out[1, 1].real:.4f})')
print(f'trace afterwards = {np.trace(out).real:.4f}')

plus = np.full((2, 2), 0.5)                          # |+><+|
print(f'|+> changed by {np.abs(channel(plus) - plus).max():.4f}')`},

'damping': {
  title:'Amplitude damping on the plus state',
  what:'Applies amplitude damping to $|{+}\\rangle$ at three strengths and prints the two populations, the coherence and the purity.',
  try:'Start from $|1\\rangle$ instead. Predict $\\rho_{11}$ at $\\gamma=0.5$ and whether any coherence appears.',
  out:'gamma = 0.0:  rho00 = 0.5000  rho11 = 0.5000  |rho01| = 0.5000  purity = 1.0000\ngamma = 0.5:  rho00 = 0.7500  rho11 = 0.2500  |rho01| = 0.3536  purity = 0.8750\ngamma = 1.0:  rho00 = 1.0000  rho11 = 0.0000  |rho01| = 0.0000  purity = 1.0000',
  qk:`import numpy as np
from qiskit.quantum_info import DensityMatrix, Kraus, purity

def damp(g):
    # K0 keeps |0> and shrinks |1>; K1 is the emission |1> -> |0>
    return Kraus([np.array([[1, 0], [0, np.sqrt(1 - g)]]),
                  np.array([[0, np.sqrt(g)], [0, 0]])])

plus = DensityMatrix.from_label('+')
for g in (0.0, 0.5, 1.0):
    rho = plus.evolve(damp(g))
    r = rho.data
    print(f'gamma = {g:.1f}:  rho00 = {r[0, 0].real:.4f}  rho11 = {r[1, 1].real:.4f}'
          f'  |rho01| = {abs(r[0, 1]):.4f}  purity = {purity(rho).real:.4f}')`,
  py:`import numpy as np

def damp(g):
    # K0 keeps |0> and shrinks |1>; K1 is the emission |1> -> |0>
    return [np.array([[1, 0], [0, np.sqrt(1 - g)]]),
            np.array([[0, np.sqrt(g)], [0, 0]])]

plus = np.full((2, 2), 0.5)                          # |+><+|
for g in (0.0, 0.5, 1.0):
    r = sum(k @ plus @ k.conj().T for k in damp(g))
    pur = np.trace(r @ r).real
    print(f'gamma = {g:.1f}:  rho00 = {r[0, 0].real:.4f}  rho11 = {r[1, 1].real:.4f}'
          f'  |rho01| = {abs(r[0, 1]):.4f}  purity = {pur:.4f}')`},

'dephasing': {
  title:'Dephasing moves only the coherence',
  what:'Applies the phase-flip channel to $|{+}\\rangle$ at four strengths, then to $|0\\rangle$, which it does not touch.',
  try:'Apply it to $|{+}i\\rangle$ at $p=1$. Predict the state that comes out.',
  out:'p = 0.00:  rho00 = 0.5000  rho11 = 0.5000  rho01 = +0.5000\np = 0.25:  rho00 = 0.5000  rho11 = 0.5000  rho01 = +0.2500\np = 0.50:  rho00 = 0.5000  rho11 = 0.5000  rho01 = +0.0000\np = 1.00:  rho00 = 0.5000  rho11 = 0.5000  rho01 = -0.5000\n|0> at p = 0.5 changed by 0.0000',
  qk:`import numpy as np
from qiskit.quantum_info import DensityMatrix, Kraus, Pauli

def phase_flip(p):
    return Kraus([np.sqrt(1 - p) * np.eye(2), np.sqrt(p) * Pauli('Z').to_matrix()])

plus = DensityMatrix.from_label('+')
for p in (0.0, 0.25, 0.5, 1.0):
    r = np.round(plus.evolve(phase_flip(p)).data, 12) + 0j
    print(f'p = {p:.2f}:  rho00 = {r[0, 0].real:.4f}  rho11 = {r[1, 1].real:.4f}'
          f'  rho01 = {r[0, 1].real:+.4f}')

zero = DensityMatrix.from_label('0')
moved = np.abs(zero.evolve(phase_flip(0.5)).data - zero.data).max()
print(f'|0> at p = 0.5 changed by {moved:.4f}')`,
  py:`import numpy as np

Z = np.diag([1, -1])

def phase_flip(p, rho):
    return (1 - p) * rho + p * Z @ rho @ Z

plus = np.full((2, 2), 0.5)                          # |+><+|
for p in (0.0, 0.25, 0.5, 1.0):
    r = np.round(phase_flip(p, plus), 12) + 0.0
    print(f'p = {p:.2f}:  rho00 = {r[0, 0]:.4f}  rho11 = {r[1, 1]:.4f}'
          f'  rho01 = {r[0, 1]:+.4f}')

zero = np.diag([1.0, 0.0])                           # |0><0|
moved = np.abs(phase_flip(0.5, zero) - zero).max()
print(f'|0> at p = 0.5 changed by {moved:.4f}')`},

/* ---- 3.4 Relaxation and dephasing -------------------------------------- */

't2-from-rates': {
  title:'T2 from relaxation and pure dephasing',
  what:'Runs $|{+}\\rangle$ through damping for a time $t$ and then through dephasing, reads $T_{2}$ off the surviving coherence, and compares it with $1/T_{2}=1/(2T_{1})+1/T_{\\phi}$. Times are in microseconds.',
  try:'Set $T_{1}=20$ with no pure dephasing. Predict $T_{2}$ first.',
  out:'T_phi = 60:  T2 from the decay = 37.50   from the rule = 37.50\nT_phi = 300:  T2 from the decay = 75.00   from the rule = 75.00\nT_phi = 1e+09:  T2 from the decay = 100.00   from the rule = 100.00',
  qk:`import numpy as np
from qiskit.quantum_info import DensityMatrix, Kraus, Pauli

T1, t = 50.0, 10.0                         # microseconds
g = 1 - np.exp(-t / T1)                    # damping over the time t
damp = Kraus([np.diag([1, np.sqrt(1 - g)]), np.array([[0, np.sqrt(g)], [0, 0]])])

for Tphi in (60.0, 300.0, 1e9):
    q = (1 - np.exp(-t / Tphi)) / 2        # dephasing with 1 - 2q = exp(-t/Tphi)
    deph = Kraus([np.sqrt(1 - q) * np.eye(2), np.sqrt(q) * Pauli('Z').to_matrix()])
    rho = DensityMatrix.from_label('+').evolve(damp).evolve(deph).data
    T2 = -t / np.log(2 * abs(rho[0, 1]))   # 2|rho01| = exp(-t/T2)
    rule = 1 / (1 / (2 * T1) + 1 / Tphi)
    print(f'T_phi = {Tphi:g}:  T2 from the decay = {T2:.2f}   from the rule = {rule:.2f}')`,
  py:`import numpy as np

T1, t = 50.0, 10.0                         # microseconds
g = 1 - np.exp(-t / T1)                    # damping over the time t
damp = [np.diag([1, np.sqrt(1 - g)]), np.array([[0, np.sqrt(g)], [0, 0]])]
Z = np.diag([1, -1])

for Tphi in (60.0, 300.0, 1e9):
    q = (1 - np.exp(-t / Tphi)) / 2        # dephasing with 1 - 2q = exp(-t/Tphi)
    rho = np.full((2, 2), 0.5)             # |+><+|
    rho = sum(k @ rho @ k.T for k in damp)
    rho = (1 - q) * rho + q * Z @ rho @ Z
    T2 = -t / np.log(2 * abs(rho[0, 1]))   # 2|rho01| = exp(-t/T2)
    rule = 1 / (1 / (2 * T1) + 1 / Tphi)
    print(f'T_phi = {Tphi:g}:  T2 from the decay = {T2:.2f}   from the rule = {rule:.2f}')`},

'damping-steps': {
  title:'Many short dampings make one exponential',
  what:'Applies amplitude damping in a thousand short steps up to $t=T_{1}$, to $|1\\rangle$ and to $|{+}\\rangle$. The population ends at $e^{-1}$ and the coherence at $e^{-1/2}$: with no pure dephasing, $T_{2}=2T_{1}$.',
  try:'Stop at $t=2T_{1}$. Predict both numbers before you run it.',
  out:'rho11 of |1> at t = T1:    0.3679   exp(-1)   = 0.3679\n2|rho01| of |+> at t = T1: 0.6065   exp(-1/2) = 0.6065',
  qk:`import numpy as np
from qiskit.quantum_info import DensityMatrix, Kraus

n, t = 1000, 1.0                           # 1000 short steps up to t = T1
g = 1 - np.exp(-t / n)                     # the damping of one step
step = Kraus([np.diag([1, np.sqrt(1 - g)]), np.array([[0, np.sqrt(g)], [0, 0]])])

one = DensityMatrix.from_label('1')
plus = DensityMatrix.from_label('+')
for _ in range(n):
    one, plus = one.evolve(step), plus.evolve(step)

p11 = one.data[1, 1].real
c = 2 * abs(plus.data[0, 1])
print(f'rho11 of |1> at t = T1:    {p11:.4f}   exp(-1)   = {np.exp(-1):.4f}')
print(f'2|rho01| of |+> at t = T1: {c:.4f}   exp(-1/2) = {np.exp(-0.5):.4f}')`,
  py:`import numpy as np

n, t = 1000, 1.0                           # 1000 short steps up to t = T1
g = 1 - np.exp(-t / n)                     # the damping of one step
step = [np.diag([1, np.sqrt(1 - g)]), np.array([[0, np.sqrt(g)], [0, 0]])]

one = np.diag([0.0, 1.0])                  # |1><1|
plus = np.full((2, 2), 0.5)                # |+><+|
for _ in range(n):
    one = sum(k @ one @ k.T for k in step)
    plus = sum(k @ plus @ k.T for k in step)

p11 = one[1, 1]
c = 2 * abs(plus[0, 1])
print(f'rho11 of |1> at t = T1:    {p11:.4f}   exp(-1)   = {np.exp(-1):.4f}')
print(f'2|rho01| of |+> at t = T1: {c:.4f}   exp(-1/2) = {np.exp(-0.5):.4f}')`},

'fit-t1': {
  title:'A T1 is the parameter of a fitted model',
  what:'Makes a relaxation curve for a qubit with $T_{1}=50$ microseconds, then recovers $T_{1}$ by fitting a straight line to the logarithm of the population.',
  try:'Add a constant $0.02$ to every population before the fit. Predict whether the fitted $T_{1}$ still comes out at $50$.',
  out:'rho11 = 1.0000, 0.8187, 0.6065, 0.3679, 0.1353\nfitted T1 = 50.00 microseconds',
  qk:`import numpy as np
from qiskit.quantum_info import DensityMatrix, Kraus

T1 = 50.0                                   # microseconds
times = np.array([0.0, 10.0, 25.0, 50.0, 100.0])

p11 = []
for t in times:
    g = 1 - np.exp(-t / T1)
    ch = Kraus([np.diag([1, np.sqrt(1 - g)]), np.array([[0, np.sqrt(g)], [0, 0]])])
    p11.append(DensityMatrix.from_label('1').evolve(ch).data[1, 1].real)
print('rho11 =', ', '.join(f'{p:.4f}' for p in p11))

# log rho11 = -t / T1, so the slope of a straight-line fit is -1/T1
slope, intercept = np.polyfit(times, np.log(p11), 1)
print(f'fitted T1 = {-1 / slope:.2f} microseconds')`,
  py:`import numpy as np

T1 = 50.0                                   # microseconds
times = np.array([0.0, 10.0, 25.0, 50.0, 100.0])

p11 = []
for t in times:
    g = 1 - np.exp(-t / T1)
    K = [np.diag([1, np.sqrt(1 - g)]), np.array([[0, np.sqrt(g)], [0, 0]])]
    rho = sum(k @ np.diag([0.0, 1.0]) @ k.T for k in K)     # start in |1>
    p11.append(rho[1, 1])
print('rho11 =', ', '.join(f'{p:.4f}' for p in p11))

# log rho11 = -t / T1, so the slope of a straight-line fit is -1/T1
slope, intercept = np.polyfit(times, np.log(p11), 1)
print(f'fitted T1 = {-1 / slope:.2f} microseconds')`},

/* ---- 3.5 Two systems --------------------------------------------------- */

'ordering': {
  title:'The ordering, printed',
  what:'Builds $(0.6|0\\rangle+0.8|1\\rangle)\\otimes(0.8|0\\rangle+0.6|1\\rangle)$ in this course\u2019s order and in the other one, and prints the four amplitudes of each.',
  try:'Make both factors equal. Predict whether the two orders can still be told apart.',
  out:'|00>: 0.48   other order: 0.48\n|01>: 0.36   other order: 0.64\n|10>: 0.64   other order: 0.36\n|11>: 0.48   other order: 0.48\nthe same state? False',
  qk:`import numpy as np
from qiskit.quantum_info import Statevector

a = Statevector([0.6, 0.8])            # the left qubit, q1
b = Statevector([0.8, 0.6])            # the right qubit, q0

right = a.tensor(b).data               # (ac, ad, bc, bd): this course's order
wrong = b.tensor(a).data               # the other convention
for x in range(4):
    print(f'|{x:02b}>: {right[x].real:.2f}   other order: {wrong[x].real:.2f}')
print(f'the same state? {np.allclose(right, wrong)}')`,
  py:`import numpy as np

a = np.array([0.6, 0.8])               # the left qubit, q1
b = np.array([0.8, 0.6])               # the right qubit, q0

right = np.kron(a, b)                  # (ac, ad, bc, bd): this course's order
wrong = np.kron(b, a)                  # the other convention
for x in range(4):
    print(f'|{x:02b}>: {right[x]:.2f}   other order: {wrong[x]:.2f}')
print(f'the same state? {np.allclose(right, wrong)}')`},

'partial-trace': {
  title:'Both partial traces of one state',
  what:'Takes $\\tfrac{1}{\\sqrt3}(|00\\rangle+|01\\rangle+|11\\rangle)$ and computes $\\rho_{A}$, the left qubit, and $\\rho_{B}$, the right one. The two are different matrices.',
  try:'Use $\\tfrac{1}{\\sqrt3}(|00\\rangle+|10\\rangle+|11\\rangle)$. Predict how $\\rho_{A}$ and $\\rho_{B}$ change.',
  out:'rho_A = [[0.6667, 0.3333], [0.3333, 0.3333]]\nrho_B = [[0.3333, 0.3333], [0.3333, 0.6667]]\ntrace of each: 1.0000, 1.0000',
  qk:`import numpy as np
from qiskit.quantum_info import Statevector, partial_trace

psi = Statevector(np.array([1, 1, 0, 1]) / np.sqrt(3))   # (|00> + |01> + |11>)/sqrt3

# Qiskit's qubit 0 is the right-hand factor, B
rho_A = partial_trace(psi, [0]).data        # trace out B
rho_B = partial_trace(psi, [1]).data        # trace out A
for name, r in (('rho_A', rho_A), ('rho_B', rho_B)):
    r = r.real
    print(f'{name} = [[{r[0, 0]:.4f}, {r[0, 1]:.4f}], [{r[1, 0]:.4f}, {r[1, 1]:.4f}]]')
print(f'trace of each: {np.trace(rho_A).real:.4f}, {np.trace(rho_B).real:.4f}')`,
  py:`import numpy as np

psi = np.array([1, 1, 0, 1]) / np.sqrt(3)   # (|00> + |01> + |11>)/sqrt3
rho = np.outer(psi, psi.conj())

# Index the 4x4 matrix as (q1, q0, q1', q0'): the 2x2 blocks belong to q1
M = rho.reshape(2, 2, 2, 2)
rho_A = np.einsum('ijkj->ik', M)            # the trace of each block
rho_B = np.einsum('ijil->jl', M)            # the sum of the diagonal blocks
for name, r in (('rho_A', rho_A), ('rho_B', rho_B)):
    r = r.real
    print(f'{name} = [[{r[0, 0]:.4f}, {r[0, 1]:.4f}], [{r[1, 0]:.4f}, {r[1, 1]:.4f}]]')
print(f'trace of each: {np.trace(rho_A).real:.4f}, {np.trace(rho_B).real:.4f}')`},

'pure-whole': {
  title:'A pure pair with mixed halves',
  what:'Compares the purity of a pair with the purity of its left half, for the Bell pair $|\\Phi^{+}\\rangle$ and for the product $|{+}\\rangle\\otimes|0\\rangle$.',
  try:'Use $\\tfrac12(\\sqrt3\\,|00\\rangle+|11\\rangle)$. Predict the purity of the half before you run it.',
  out:'Bell pair  purity of the pair = 1.0000   of the left half = 0.5000\n|+>|0>     purity of the pair = 1.0000   of the left half = 1.0000',
  qk:`import numpy as np
from qiskit.quantum_info import DensityMatrix, Statevector, partial_trace, purity

states = {'Bell pair': Statevector(np.array([1, 0, 0, 1]) / np.sqrt(2)),
          '|+>|0>':    Statevector.from_label('+0')}

for name, psi in states.items():
    pair = purity(DensityMatrix(psi)).real
    half = purity(partial_trace(psi, [0])).real     # the left qubit
    print(f'{name:9s}  purity of the pair = {pair:.4f}   of the left half = {half:.4f}')`,
  py:`import numpy as np

def left_half(psi):
    C = psi.reshape(2, 2)                  # rows: left qubit, columns: right
    return C @ C.conj().T                  # rho_A

purity = lambda r: np.trace(r @ r).real
states = {'Bell pair': np.array([1, 0, 0, 1]) / np.sqrt(2),
          '|+>|0>':    np.kron(np.array([1, 1]) / np.sqrt(2), np.array([1, 0]))}

for name, psi in states.items():
    pair = purity(np.outer(psi, psi.conj()))
    half = purity(left_half(psi))
    print(f'{name:9s}  purity of the pair = {pair:.4f}   of the left half = {half:.4f}')`},

/* ---- 3.6 Separability and the Schmidt decomposition -------------------- */

'product-test': {
  title:'The product test on four amplitudes',
  what:'Computes $c_{0}c_{3}-c_{1}c_{2}$ for three states and checks each verdict against the purity of the left half.',
  try:'Add $0.6|00\\rangle+0.8|01\\rangle$. Predict the determinant and the purity first.',
  out:'|+>|+>           c0c3 - c1c2 = 0.0000  product    purity of a half = 1.0000\nBell pair        c0c3 - c1c2 = 0.5000  entangled  purity of a half = 0.5000\n0.6|00>+0.8|11>  c0c3 - c1c2 = 0.4800  entangled  purity of a half = 0.5392',
  qk:`import numpy as np
from qiskit.quantum_info import Statevector, partial_trace, purity

states = {'|+>|+>':          Statevector.from_label('++'),
          'Bell pair':       Statevector(np.array([1, 0, 0, 1]) / np.sqrt(2)),
          '0.6|00>+0.8|11>': Statevector([0.6, 0, 0, 0.8])}

for name, psi in states.items():
    c = psi.data
    det = (c[0] * c[3] - c[1] * c[2]).real
    verdict = 'product' if abs(det) < 1e-12 else 'entangled'
    half = purity(partial_trace(psi, [0])).real
    print(f'{name:16s} c0c3 - c1c2 = {det:.4f}  {verdict:9s}  purity of a half = {half:.4f}')`,
  py:`import numpy as np

states = {'|+>|+>':          np.array([1, 1, 1, 1]) / 2,
          'Bell pair':       np.array([1, 0, 0, 1]) / np.sqrt(2),
          '0.6|00>+0.8|11>': np.array([0.6, 0, 0, 0.8])}

for name, c in states.items():
    det = c[0] * c[3] - c[1] * c[2]
    verdict = 'product' if abs(det) < 1e-12 else 'entangled'
    C = c.reshape(2, 2)
    rho_A = C @ C.conj().T
    half = np.trace(rho_A @ rho_A).real
    print(f'{name:16s} c0c3 - c1c2 = {det:.4f}  {verdict:9s}  purity of a half = {half:.4f}')`},

'schmidt-svd': {
  title:'Schmidt coefficients from a singular value decomposition',
  what:'Reshapes $\\tfrac{1}{\\sqrt3}(|00\\rangle+|01\\rangle+|11\\rangle)$ into a two-by-two matrix, takes its singular values, and checks them against the eigenvalues of $\\rho_{A}$. The last line rebuilds the state from the two Schmidt terms.',
  try:'Use the Bell pair. Predict the singular values before you run it.',
  out:'singular values = 0.9342, 0.3568\nSchmidt coefficients = 0.8727, 0.1273\neigenvalues of rho_A = 0.8727, 0.1273\nmax |rebuilt - c| = 0.0000',
  qk:`import numpy as np
from qiskit.quantum_info import Statevector, partial_trace

psi = Statevector(np.array([1, 1, 0, 1]) / np.sqrt(3))
C = psi.data.reshape(2, 2)                  # rows: left qubit, columns: right
U, s, Vh = np.linalg.svd(C)
print(f'singular values = {s[0]:.4f}, {s[1]:.4f}')
print(f'Schmidt coefficients = {s[0]**2:.4f}, {s[1]**2:.4f}')

lam = np.linalg.eigvalsh(partial_trace(psi, [0]).data)[::-1]
print(f'eigenvalues of rho_A = {lam[0]:.4f}, {lam[1]:.4f}')

rebuilt = sum(s[k] * np.kron(U[:, k], Vh[k, :]) for k in range(2))
c = psi.data
print(f'max |rebuilt - c| = {np.abs(rebuilt - c).max():.4f}')`,
  py:`import numpy as np

c = np.array([1, 1, 0, 1]) / np.sqrt(3)     # (|00> + |01> + |11>)/sqrt3
C = c.reshape(2, 2)                         # rows: left qubit, columns: right
U, s, Vh = np.linalg.svd(C)
print(f'singular values = {s[0]:.4f}, {s[1]:.4f}')
print(f'Schmidt coefficients = {s[0]**2:.4f}, {s[1]**2:.4f}')

lam = np.linalg.eigvalsh(C @ C.conj().T)[::-1]     # rho_A = C C^dagger
print(f'eigenvalues of rho_A = {lam[0]:.4f}, {lam[1]:.4f}')

rebuilt = sum(s[k] * np.kron(U[:, k], Vh[k, :]) for k in range(2))
print(f'max |rebuilt - c| = {np.abs(rebuilt - c).max():.4f}')`},

'rank-tolerance': {
  title:'A rank needs a tolerance',
  what:'Takes a product state and adds a tiny amount of $|11\\rangle$. The second singular value is about $10^{-9}$, so the Schmidt rank depends on the tolerance chosen.',
  try:'Change the added amount to $10^{-3}$. Predict the rank under both tolerances.',
  out:'singular values: 1.0000 and 5.73e-10\nSchmidt rank with tolerance 1e-12: 2\nSchmidt rank with tolerance 1e-06: 1',
  qk:`import numpy as np
from qiskit.quantum_info import Statevector

a = Statevector([0.6, 0.8])
b = Statevector([np.cos(0.3), np.exp(0.7j) * np.sin(0.3)])
c = a.tensor(b).data + 1e-9 * np.array([0, 0, 0, 1])     # a tiny extra |11>
c = c / np.linalg.norm(c)

s = np.linalg.svd(c.reshape(2, 2), compute_uv=False)
print(f'singular values: {s[0]:.4f} and {s[1]:.2e}')
for tol in (1e-12, 1e-6):
    print(f'Schmidt rank with tolerance {tol:g}: {int(np.sum(s > tol))}')`,
  py:`import numpy as np

a = np.array([0.6, 0.8])
b = np.array([np.cos(0.3), np.exp(0.7j) * np.sin(0.3)])
c = np.kron(a, b) + 1e-9 * np.array([0, 0, 0, 1])       # a tiny extra |11>
c = c / np.linalg.norm(c)

s = np.linalg.svd(c.reshape(2, 2), compute_uv=False)
print(f'singular values: {s[0]:.4f} and {s[1]:.2e}')
for tol in (1e-12, 1e-6):
    print(f'Schmidt rank with tolerance {tol:g}: {int(np.sum(s > tol))}')`},

/* ---- 3.7 Entropy ------------------------------------------------------- */

'entropy': {
  title:'Entanglement entropy of three pairs',
  what:'Computes $S(\\rho_{A})$ in bits for a lopsided entangled pair, a Bell pair and a product pair.',
  try:'Use $\\tfrac{1}{\\sqrt5}(|00\\rangle+2|11\\rangle)$. Predict whether $S$ is above or below the lopsided pair\u2019s.',
  out:'sqrt3/2|00> + 1/2|11>  S(rho_A) = 0.8113 bits\nBell pair              S(rho_A) = 1.0000 bits\n|+>|0>                 S(rho_A) = 0.0000 bits',
  qk:`import numpy as np
from qiskit.quantum_info import Statevector, entropy, partial_trace

pairs = {'sqrt3/2|00> + 1/2|11>': Statevector([np.sqrt(3)/2, 0, 0, 0.5]),
         'Bell pair':             Statevector(np.array([1, 0, 0, 1]) / np.sqrt(2)),
         '|+>|0>':                Statevector.from_label('+0')}

for name, psi in pairs.items():
    rho_A = partial_trace(psi, [0])                 # trace out the right qubit
    S = round(entropy(rho_A, base=2), 12) + 0.0
    print(f'{name:22s} S(rho_A) = {S:.4f} bits')`,
  py:`import numpy as np

def entropy(rho):                                   # -sum lambda log2 lambda
    lam = np.linalg.eigvalsh(rho)
    return -sum(l * np.log2(l) for l in lam if l > 1e-12)

pairs = {'sqrt3/2|00> + 1/2|11>': np.array([np.sqrt(3)/2, 0, 0, 0.5]),
         'Bell pair':             np.array([1, 0, 0, 1]) / np.sqrt(2),
         '|+>|0>':                np.array([1, 0, 1, 0]) / np.sqrt(2)}

for name, c in pairs.items():
    C = c.reshape(2, 2)
    S = round(entropy(C @ C.conj().T), 12) + 0.0    # rho_A = C C^dagger
    print(f'{name:22s} S(rho_A) = {S:.4f} bits')`},

'entropy-curve': {
  title:'Entropy along a family of pairs',
  what:'Follows $\\cos\\theta\\,|00\\rangle+\\sin\\theta\\,|11\\rangle$ from a product at $\\theta=0$ to a Bell pair at $\\theta=\\pi/4$, printing the larger Schmidt coefficient and the entropy.',
  try:'Continue to $\\theta=\\pi/2$. Predict what the entropy does after $\\pi/4$.',
  out:'theta = 0      lambda1 = 1.0000   S = 0.0000 bits\ntheta = pi/12  lambda1 = 0.9330   S = 0.3546 bits\ntheta = pi/8   lambda1 = 0.8536   S = 0.6009 bits\ntheta = pi/4   lambda1 = 0.5000   S = 1.0000 bits',
  qk:`import numpy as np
from qiskit.quantum_info import Statevector, entropy, partial_trace

for k in (0, 1, 2, 3):
    th = [0, np.pi/12, np.pi/8, np.pi/4][k]
    psi = Statevector([np.cos(th), 0, 0, np.sin(th)])
    rho_A = partial_trace(psi, [0])
    lam1 = max(np.linalg.eigvalsh(rho_A.data))
    S = round(entropy(rho_A, base=2), 12) + 0.0
    name = ['0', 'pi/12', 'pi/8', 'pi/4'][k]
    print(f'theta = {name:5s}  lambda1 = {lam1:.4f}   S = {S:.4f} bits')`,
  py:`import numpy as np

def entropy(rho):                                   # -sum lambda log2 lambda
    lam = np.linalg.eigvalsh(rho)
    return -sum(l * np.log2(l) for l in lam if l > 1e-12)

for k in (0, 1, 2, 3):
    th = [0, np.pi/12, np.pi/8, np.pi/4][k]
    C = np.array([[np.cos(th), 0], [0, np.sin(th)]])  # the reshaped amplitudes
    rho_A = C @ C.conj().T
    lam1 = max(np.linalg.eigvalsh(rho_A))
    S = round(entropy(rho_A), 12) + 0.0
    name = ['0', 'pi/12', 'pi/8', 'pi/4'][k]
    print(f'theta = {name:5s}  lambda1 = {lam1:.4f}   S = {S:.4f} bits')`},

'noisy-pair': {
  title:'Where the reduced entropy stops measuring entanglement',
  what:'Compares the Bell pair with the classical mixture $\\tfrac12|00\\rangle\\langle 00|+\\tfrac12|11\\rangle\\langle 11|$. Both halves have one bit of entropy; only the pair entropy and $\\langle X\\otimes X\\rangle$ tell them apart.',
  try:'Mix the Bell pair half and half with the classical mixture. Predict $S(\\rho_{A})$ and $\\langle X\\otimes X\\rangle$.',
  out:'Bell pair          S(rho_A) = 1.0000   S(rho_AB) = 0.0000   <XX> = +1.0000\nclassical mixture  S(rho_A) = 1.0000   S(rho_AB) = 1.0000   <XX> = +0.0000',
  qk:`import numpy as np
from qiskit.quantum_info import DensityMatrix, Pauli, entropy, partial_trace

bell = DensityMatrix(np.outer([1, 0, 0, 1], [1, 0, 0, 1]) / 2)
mix = DensityMatrix(np.diag([0.5, 0, 0, 0.5]))       # a coin, then |00> or |11>

for name, rho in (('Bell pair', bell), ('classical mixture', mix)):
    SA = round(entropy(partial_trace(rho, [0]), base=2), 12) + 0.0
    SAB = round(entropy(rho, base=2), 12) + 0.0
    xx = round(rho.expectation_value(Pauli('XX')).real, 12) + 0.0
    print(f'{name:17s}  S(rho_A) = {SA:.4f}   S(rho_AB) = {SAB:.4f}   <XX> = {xx:+.4f}')`,
  py:`import numpy as np

def entropy(rho):                                   # -sum lambda log2 lambda
    lam = np.linalg.eigvalsh(rho)
    return -sum(l * np.log2(l) for l in lam if l > 1e-12)

X = np.array([[0, 1], [1, 0]])
bell = np.outer([1, 0, 0, 1], [1, 0, 0, 1]) / 2
mix = np.diag([0.5, 0, 0, 0.5])                     # a coin, then |00> or |11>

for name, rho in (('Bell pair', bell), ('classical mixture', mix)):
    rho_A = np.einsum('ijkj->ik', rho.reshape(2, 2, 2, 2))   # trace out B
    SA = round(entropy(rho_A), 12) + 0.0
    SAB = round(entropy(rho), 12) + 0.0
    xx = round(np.trace(rho @ np.kron(X, X)).real, 12) + 0.0
    print(f'{name:17s}  S(rho_A) = {SA:.4f}   S(rho_AB) = {SAB:.4f}   <XX> = {xx:+.4f}')`},

/* ---- 3.8 Bell correlations --------------------------------------------- */

'bell-correlations': {
  title:'The Pauli correlations of two Bell states and a mixture',
  what:'Computes $\\langle X\\otimes X\\rangle$, $\\langle Y\\otimes Y\\rangle$ and $\\langle Z\\otimes Z\\rangle$ for $|\\Phi^{+}\\rangle$, $|\\Phi^{-}\\rangle$ and the classical mixture of $|00\\rangle$ and $|11\\rangle$.',
  try:'Add $|\\Psi^{+}\\rangle=\\tfrac{1}{\\sqrt2}(|01\\rangle+|10\\rangle)$. Predict its three correlations first.',
  out:'Phi+     <XX> = +1   <YY> = -1   <ZZ> = +1\nPhi-     <XX> = -1   <YY> = +1   <ZZ> = +1\nmixture  <XX> = +0   <YY> = +0   <ZZ> = +1',
  qk:`import numpy as np
from qiskit.quantum_info import DensityMatrix, Pauli, Statevector

r = 1 / np.sqrt(2)
states = {'Phi+':    DensityMatrix(Statevector([r, 0, 0, r])),
          'Phi-':    DensityMatrix(Statevector([r, 0, 0, -r])),
          'mixture': DensityMatrix(np.diag([0.5, 0, 0, 0.5]))}

for name, rho in states.items():
    vals = []
    for P in ('XX', 'YY', 'ZZ'):
        v = rho.expectation_value(Pauli(P)).real
        vals.append(f'<{P}> = {round(v, 12) + 0.0:+.0f}')
    print(f'{name:8s} ' + '   '.join(vals))`,
  py:`import numpy as np

X = np.array([[0, 1], [1, 0]]); Y = np.array([[0, -1j], [1j, 0]]); Z = np.diag([1, -1])
r = 1 / np.sqrt(2)
proj = lambda v: np.outer(v, np.conj(v))
states = {'Phi+':    proj(np.array([r, 0, 0, r])),
          'Phi-':    proj(np.array([r, 0, 0, -r])),
          'mixture': np.diag([0.5, 0, 0, 0.5])}

for name, rho in states.items():
    vals = []
    for P, S in (('XX', X), ('YY', Y), ('ZZ', Z)):
        v = np.trace(rho @ np.kron(S, S)).real
        vals.append(f'<{P}> = {round(v, 12) + 0.0:+.0f}')
    print(f'{name:8s} ' + '   '.join(vals))`},

'chsh': {
  title:'The CHSH value over a range of settings',
  what:'On $|\\Phi^{+}\\rangle$, with $A_{0}=Z$, $A_{1}=X$ and the second party\u2019s settings at $\\pm\\varphi$ from $z$ in the $z$–$x$ plane, computes $S$ for five angles.',
  try:'Swap the second party\u2019s two settings. Predict the value of $S$ at $45$ degrees.',
  out:'phi =  0.0:  S = 2.0000\nphi = 22.5:  S = 2.6131  above the bound\nphi = 45.0:  S = 2.8284  above the bound\nphi = 67.5:  S = 2.6131  above the bound\nphi = 90.0:  S = 2.0000',
  qk:`import numpy as np
from qiskit.quantum_info import SparsePauliOp, Statevector

bell = Statevector(np.array([1, 0, 0, 1]) / np.sqrt(2))

def axis(deg):                             # n.sigma for n at deg from z, in the z-x plane
    a = np.radians(deg)
    return SparsePauliOp(['X', 'Z'], [np.sin(a), np.cos(a)])

def E(a, b):                               # <(n.sigma) (x) (m.sigma)>
    return bell.expectation_value(axis(a).tensor(axis(b))).real

for phi in (0.0, 22.5, 45.0, 67.5, 90.0):
    S = E(0, phi) + E(0, -phi) + E(90, phi) - E(90, -phi)
    flag = 'above the bound' if S > 2 + 1e-9 else ''
    print(f'phi = {phi:4.1f}:  S = {S:.4f}  {flag}'.rstrip())`,
  py:`import numpy as np

X = np.array([[0, 1], [1, 0]]); Z = np.diag([1, -1])
bell = np.array([1, 0, 0, 1]) / np.sqrt(2)

def axis(deg):                             # n.sigma for n at deg from z, in the z-x plane
    a = np.radians(deg)
    return np.sin(a) * X + np.cos(a) * Z

def E(a, b):                               # <(n.sigma) (x) (m.sigma)>
    return np.vdot(bell, np.kron(axis(a), axis(b)) @ bell).real

for phi in (0.0, 22.5, 45.0, 67.5, 90.0):
    S = E(0, phi) + E(0, -phi) + E(90, phi) - E(90, -phi)
    flag = 'above the bound' if S > 2 + 1e-9 else ''
    print(f'phi = {phi:4.1f}:  S = {S:.4f}  {flag}'.rstrip())`},

'no-signal': {
  title:'A distant measurement leaves the reduced state alone',
  what:'The second party measures their half of $|\\Phi^{+}\\rangle$ along a direction in the $z$–$x$ plane and tells no one. The program averages over the two outcomes and prints what the first party can predict: $p(0)$ in $Z$ and $\\langle X\\rangle$.',
  try:'Let the second party apply the gate $X$ instead of measuring. Predict whether the first party\u2019s numbers move.',
  out:'before           : p(0) = 0.5000   <X> = +0.0000\nafter B at 30 deg: p(0) = 0.5000   <X> = +0.0000\nafter B at 60 deg: p(0) = 0.5000   <X> = +0.0000\nafter B at 90 deg: p(0) = 0.5000   <X> = +0.0000',
  qk:`import numpy as np
from qiskit.quantum_info import DensityMatrix, Operator, partial_trace

bell = DensityMatrix(np.outer([1, 0, 0, 1], [1, 0, 0, 1]) / 2)
X = np.array([[0, 1], [1, 0]]); Z = np.diag([1, -1])

def report(rho, label):
    rA = partial_trace(rho, [0]).data            # the first party's state
    print(f'{label}: p(0) = {rA[0, 0].real:.4f}   <X> = {round(np.trace(rA @ X).real, 12) + 0.0:+.4f}')

report(bell, 'before           ')
for deg in (30, 60, 90):
    n = np.sin(np.radians(deg)) * X + np.cos(np.radians(deg)) * Z
    after = sum(bell.evolve(Operator(np.kron(np.eye(2), (np.eye(2) + s * n) / 2))).data
                for s in (+1, -1))              # both outcomes, unread
    report(DensityMatrix(after), f'after B at {deg:2d} deg')`,
  py:`import numpy as np

bell = np.outer([1, 0, 0, 1], [1, 0, 0, 1]) / 2
X = np.array([[0, 1], [1, 0]]); Z = np.diag([1, -1])

def report(rho, label):
    rA = np.einsum('ijkj->ik', rho.reshape(2, 2, 2, 2))   # the first party's state
    print(f'{label}: p(0) = {rA[0, 0].real:.4f}   <X> = {round(np.trace(rA @ X).real, 12) + 0.0:+.4f}')

report(bell, 'before           ')
for deg in (30, 60, 90):
    n = np.sin(np.radians(deg)) * X + np.cos(np.radians(deg)) * Z
    after = 0
    for s in (+1, -1):                           # both outcomes, unread
        P = np.kron(np.eye(2), (np.eye(2) + s * n) / 2)
        after = after + P @ bell @ P
    report(after, f'after B at {deg:2d} deg')`}

};
