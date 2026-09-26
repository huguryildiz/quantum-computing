/* ==========================================================================
   Code for Module 5: programs in Qiskit and in NumPy
   The same form as 77_code_m1.js through 79a_code_m4.js: one entry a program,
   each written twice (`qk`, a Qiskit listing to copy; `py`, NumPy only, run
   on the page) and printing the same lines, which are `out`. Course qubit
   order throughout: |q_{n-1} ... q1 q0>, entry x of a state vector is the
   amplitude of |x>, and q0 is the top wire of a circuit drawing. The Qiskit
   listings use QuantumCircuit, Statevector, Operator and the transpiler
   where a program checks a real compiled circuit rather than a formula.
   Every teaching section closes with a code page (`CODE_BANKS_M5`) that
   pages through its programs.
   verify/code_check.py runs every entry in both forms and compares what it
   prints with `out`.
   ========================================================================== */
const CODE_BANKS_M5 = {
  'm5-code-circuit':  ['gate-list-to-unitary', 'depth-vs-gatecount', 'reading-the-wires'],
  'm5-code-run':      ['exact-vs-shots', 'midcircuit-feedforward', 'statevector-memory'],
  'm5-code-compile':  ['h-decomposition-phase', 'cnot-routing-cost', 'swap-back-or-relabel'],
  'm5-code-ramsey':   ['ramsey-fringe', 'ramsey-shot-noise', 'ramsey-inverse'],
  'm5-code-tele':     ['teleport-four-branches', 'bob-before-the-bits', 'skip-the-correction'],
  'm5-code-grover':   ['grover-success-probability', 'grover-as-two-reflections', 'grover-overshoot']
};

const CODE_M5 = {

/* ---- 5.1 The circuit model ------------------------------------------------ */

'gate-list-to-unitary': {
  title:'A gate list, multiplied into one unitary',
  what:'Builds the unitary of the three-gate circuit $H$ on $q_{0}$, $\\mathrm{CNOT}_{0\\to1}$, $H$ on $q_{1}$ by multiplying one layer at a time, and checks the result against $\\mathrm{Operator}(\\mathrm{QuantumCircuit})$.',
  try:'Add a fourth gate, $H$ on $q_{0}$ again, at the end. Predict whether the matrix is still unitary before you run it.',
  out:"U built from the gate list =\n['+0.5000', '+0.5000', '+0.5000', '+0.5000']\n['+0.5000', '-0.5000', '+0.5000', '-0.5000']\n['+0.5000', '+0.5000', '-0.5000', '-0.5000']\n['-0.5000', '+0.5000', '+0.5000', '-0.5000']\nunitary? max |U^dag U - I| = 0.0000",
  qk:`import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator

qc = QuantumCircuit(2)
qc.h(0); qc.cx(0, 1); qc.h(1)     # the same gate list, in order
U = Operator(qc).data
U = np.round(U, 12) + 0.0
print('U built from the gate list =')
for row in U: print([f'{x.real:+.4f}' for x in row])
err = np.abs(U.conj().T @ U - np.eye(4)).max()
print(f'unitary? max |U^dag U - I| = {err:.4f}')`,
  py:`import numpy as np

I = np.eye(2); P0 = np.diag([1,0]); P1 = np.diag([0,1])
X = np.array([[0,1],[1,0]]); H = (X + np.diag([1,-1])) / np.sqrt(2)
cnot01 = np.kron(I, P0) + np.kron(X, P1)      # control q0, target q1

def layer(name, wires):
    if name == 'H':
        (q,) = wires
        return np.kron(I, H) if q == 0 else np.kron(H, I)
    return cnot01

gates = [('H', (0,)), ('CX', (0, 1)), ('H', (1,))]
U = np.eye(4)
for g in gates: U = layer(*g) @ U
U = np.round(U, 12) + 0.0
print('U built from the gate list =')
for row in U: print([f'{x:+.4f}' for x in row])
err = np.abs(U.conj().T @ U - np.eye(4)).max()
print(f'unitary? max |U^dag U - I| = {err:.4f}')`},

'depth-vs-gatecount': {
  title:'Depth by layers, against qc.depth()',
  what:'Layers a chain and a tree of CNOTs that both make the same four-qubit GHZ state, counts the depth by a greedy layering rule in NumPy, and checks it against $\\mathrm{QuantumCircuit.depth()}$.',
  try:'Add one more CNOT to the tree, from $q_{2}$ to $q_{3}$. Predict the new depth before you run it.',
  out:'chain: gates = 4, depth = 4\ntree:  gates = 4, depth = 3',
  qk:`from qiskit import QuantumCircuit

chain = QuantumCircuit(4)
chain.h(0); chain.cx(0,1); chain.cx(1,2); chain.cx(2,3)

tree = QuantumCircuit(4)
tree.h(0); tree.cx(0,1); tree.cx(0,2); tree.cx(1,3)

print(f'chain: gates = {chain.size()}, depth = {chain.depth()}')
print(f'tree:  gates = {tree.size()}, depth = {tree.depth()}')`,
  py:`import numpy as np

def layer_depth(gates, n):            # greedy layering: a gate joins the
    busy = [0]*n                       # earliest layer where its wires are free
    for wires in gates:
        L = max(busy[q] for q in wires) + 1
        for q in wires: busy[q] = L
    return max(busy)

chain = [(0,), (0,1), (1,2), (2,3)]    # H on q0, then a CNOT chain to q3
tree  = [(0,), (0,1), (0,2), (1,3)]    # H on q0, then two independent CNOTs
print(f'chain: gates = {len(chain)}, depth = {layer_depth(chain, 4)}')
print(f'tree:  gates = {len(tree)}, depth = {layer_depth(tree, 4)}')`},

'reading-the-wires': {
  title:'Reading a circuit\'s own wire order',
  what:'Applies $X$ to $q_{1}$ only, of $|00\\rangle$, and reads the amplitude, the index and the ket back off the state, checking that the top wire ($q_{0}$) is the last digit of the ket.',
  try:'Apply the $X$ to $q_{0}$ instead of $q_{1}$. Predict the new ket before you run it.',
  out:'state vector = [0 0 1 0]\nentry x = 2  ->  ket |10> = |q1 q0>\ntop wire (q0) reads 0, bottom wire (q1) reads 1',
  qk:`import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

qc = QuantumCircuit(2)
qc.x(1)                                 # X on q1 only, top wire is q0
psi = Statevector.from_label('00').evolve(qc)
x = int(np.argmax(np.abs(psi.data)))
bits = format(x, '02b')                 # leftmost char is q1, rightmost q0
print(f'state vector = {psi.data.real.astype(int)}')
print(f'entry x = {x}  ->  ket |{bits}> = |q1 q0>')
print(f'top wire (q0) reads {bits[1]}, bottom wire (q1) reads {bits[0]}')`,
  py:`import numpy as np

I = np.eye(2); X = np.array([[0,1],[1,0]])
# circuit: X on q1 only. Input |00>, entry x is the amplitude of |x>,
# order |q1 q0>, and q0 is drawn on the top wire (course convention).
X_on_q1 = np.kron(X, I)
psi = X_on_q1 @ np.array([1, 0, 0, 0])
x = int(np.argmax(np.abs(psi)))
bits = format(x, '02b')                 # leftmost char is q1, rightmost q0
print(f'state vector = {psi.astype(int)}')
print(f'entry x = {x}  ->  ket |{bits}> = |q1 q0>')
print(f'top wire (q0) reads {bits[1]}, bottom wire (q1) reads {bits[0]}')`},

/* ---- 5.2 Running a circuit ------------------------------------------------- */

'exact-vs-shots': {
  title:'The exact probability, and one seeded draw of shots',
  what:'Reads the exact $p(0)$ of an $H$–$P(\\varphi)$–$H$ circuit, then draws counts from it with one shared, seeded NumPy generator so both languages report the same shot outcome.',
  try:'Set $\\varphi = \\pi$ instead of $2\\pi/3$. Predict $p(0)$ and the counts before you run it.',
  out:'exact p(0) = 0.2500\nN = 4000: counts of 0 = 1034, p_hat(0) = 0.2585\nstandard error = 0.0068',
  qk:`import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

phi = 2 * np.pi / 3
qc = QuantumCircuit(1)
qc.h(0); qc.p(phi, 0); qc.h(0)
p0_exact = Statevector.from_label('0').evolve(qc).probabilities()[0]
p0_exact = round(p0_exact, 9)
print(f'exact p(0) = {p0_exact:.4f}')

def se(p, N): return np.sqrt(p * (1 - p) / N)

rng = np.random.default_rng(0)              # one shared seeded draw
N = 4000
counts0 = int(rng.binomial(N, p0_exact))
p0_hat = counts0 / N
print(f'N = {N}: counts of 0 = {counts0}, p_hat(0) = {p0_hat:.4f}')
print(f'standard error = {se(p0_exact, N):.4f}')`,
  py:`import numpy as np

def se(p, N): return np.sqrt(p * (1 - p) / N)

phi = 2 * np.pi / 3                    # H, P(phi), H, then measure
p0_exact = round(np.cos(phi / 2)**2, 9)
print(f'exact p(0) = {p0_exact:.4f}')

rng = np.random.default_rng(0)
N = 4000
counts0 = int(rng.binomial(N, p0_exact))    # one shared seeded draw
p0_hat = counts0 / N
print(f'N = {N}: counts of 0 = {counts0}, p_hat(0) = {p0_hat:.4f}')
print(f'standard error = {se(p0_exact, N):.4f}')`},

'midcircuit-feedforward': {
  title:'A mid-circuit measurement, corrected branch by branch',
  what:'Projects $H|0\\rangle$ onto each measured bit $m$ by hand, renormalises, and applies $X$ only on the branch $m=1$: both branches land on $|0\\rangle$, with no simulator randomness anywhere.',
  try:'Start the qubit in $|1\\rangle$ before the $H$ instead of $|0\\rangle$. Predict both branches before you run it.',
  out:'branch m=0: p=0.5000, state after correction = [1.+0.j 0.+0.j]\nbranch m=1: p=0.5000, state after correction = [1.+0.j 0.+0.j]',
  qk:`import numpy as np
from qiskit.quantum_info import Statevector, Operator
from qiskit.circuit.library import HGate, XGate

X = Operator(XGate()).data
psi = Statevector.from_label('0').evolve(Operator(HGate())).data
P0 = np.diag([1, 0]); P1 = np.diag([0, 1])
for m, P in ((0, P0), (1, P1)):
    branch = P @ psi                    # project onto the measured bit m
    p_m = np.vdot(branch, branch).real
    if p_m < 1e-12: continue
    branch = branch / np.sqrt(p_m)      # renormalise after the projection
    if m == 1: branch = X @ branch      # feedforward: apply X only if m=1
    branch = np.round(branch, 12) + 0j
    print(f'branch m={m}: p={p_m:.4f}, state after correction = {branch}')`,
  py:`import numpy as np

I = np.eye(2); X = np.array([[0,1],[1,0]])
H = (X + np.diag([1,-1])) / np.sqrt(2)
P0 = np.diag([1,0]); P1 = np.diag([0,1])

psi = (H @ np.array([1, 0])).astype(complex)   # H|0> = |+>, one qubit
for m, P in ((0, P0), (1, P1)):
    branch = P @ psi                    # project onto the measured bit m
    p_m = np.vdot(branch, branch).real
    if p_m < 1e-12: continue
    branch = branch / np.sqrt(p_m)      # renormalise after the projection
    if m == 1: branch = X @ branch      # feedforward: apply X only if m=1
    branch = np.round(branch, 12) + 0j
    print(f'branch m={m}: p={p_m:.4f}, state after correction = {branch}')`},

'statevector-memory': {
  title:'What an exact state vector actually costs',
  what:'Builds a real state vector at three sizes and reads its byte count off the array itself, checks it against $16\\cdot2^{n}$, then solves for the largest $n$ that fits in $64\\,\\mathrm{GB}$.',
  try:'Solve the same limit for a $1\\,\\mathrm{TB}$ machine instead. Predict the new $n$ before you run it.',
  out:'n =  4: formula = 256 B, array = 256 B\nn =  8: formula = 4,096 B, array = 4,096 B\nn = 12: formula = 65,536 B, array = 65,536 B\nlargest n that fits in 64 GB: 31',
  qk:`import numpy as np
from qiskit.quantum_info import Statevector

def bytes_needed(n): return 16 * 2**n        # complex128, 2^n amplitudes

for n in (4, 8, 12):
    sv = Statevector.from_label('0' * n)
    actual = sv.data.nbytes                   # the real array, not a guess
    print(f'n = {n:2d}: formula = {bytes_needed(n):,} B, array = {actual:,} B')

limit = 64e9                                  # a 64 GB workstation
n_max = int(np.log2(limit / 16))
print(f'largest n that fits in 64 GB: {n_max}')`,
  py:`import numpy as np

def bytes_needed(n): return 16 * 2**n        # complex128, 2^n amplitudes

for n in (4, 8, 12):
    qc_state = np.zeros(2**n, dtype=complex)
    qc_state[0] = 1.0
    actual = qc_state.nbytes                  # the real array, not a guess
    print(f'n = {n:2d}: formula = {bytes_needed(n):,} B, array = {actual:,} B')

limit = 64e9                                  # a 64 GB workstation
n_max = int(np.log2(limit / 16))
print(f'largest n that fits in 64 GB: {n_max}')`},

/* ---- 5.3 Compiling for a machine ------------------------------------------- */

'h-decomposition-phase': {
  title:'A rewrite that is exact only up to a global phase',
  what:'Checks $H$ against the raw product $R_{z}(\\pi/2)R_{x}(\\pi/2)R_{z}(\\pi/2)$ with and without absorbing the global phase $e^{i\\pi/2}$ the identity carries.',
  try:'Absorb the phase and compare again with $\\varphi = \\pi/2 + \\pi$ instead of $\\pi/2$. Predict whether it still matches.',
  out:'max |H - Rz Rx Rz|, no phase = 1.0000\nmax |H - Rz Rx Rz|, up to phase = 0.0000',
  qk:`import numpy as np
from qiskit.quantum_info import Operator
from qiskit.circuit.library import HGate, RZGate, RXGate

H = Operator(HGate()).data
Rz = lambda a: Operator(RZGate(a)).data
Rx = lambda a: Operator(RXGate(a)).data

# instruction-set rewrite: H = e^(i pi/2) Rz(pi/2) Rx(pi/2) Rz(pi/2)
raw = Rz(np.pi/2) @ Rx(np.pi/2) @ Rz(np.pi/2)

def phase_dist(U, V):                   # distance up to a global phase
    k = np.argmax(np.abs(U.ravel()))
    ph = U.ravel()[k] / V.ravel()[k]
    return np.abs(U - ph*V).max()

print(f'max |H - Rz Rx Rz|, no phase = {np.abs(H - raw).max():.4f}')
print(f'max |H - Rz Rx Rz|, up to phase = {phase_dist(H, raw):.4f}')`,
  py:`import numpy as np

I = np.eye(2); X = np.array([[0,1],[1,0]]); Z = np.diag([1,-1])
H = (X + Z) / np.sqrt(2)

def Rz(a): return np.cos(a/2)*I - 1j*np.sin(a/2)*Z
def Rx(a): return np.cos(a/2)*I - 1j*np.sin(a/2)*X

# instruction-set rewrite: H = e^(i pi/2) Rz(pi/2) Rx(pi/2) Rz(pi/2)
raw = Rz(np.pi/2) @ Rx(np.pi/2) @ Rz(np.pi/2)

def phase_dist(U, V):                   # distance up to a global phase
    k = np.argmax(np.abs(U.ravel()))
    ph = U.ravel()[k] / V.ravel()[k]
    return np.abs(U - ph*V).max()

print(f'max |H - Rz Rx Rz|, no phase = {np.abs(H - raw).max():.4f}')
print(f'max |H - Rz Rx Rz|, up to phase = {phase_dist(H, raw):.4f}')`},

'cnot-routing-cost': {
  title:'Routing a distant CNOT on a line, checked against a real transpile',
  what:'Counts the two-qubit gates a $\\mathrm{CNOT}$ needs after routing on a line of four qubits by the formula $3(d-1)+1$, then checks it against Qiskit\'s own transpiler with a line coupling map.',
  try:'Route $\\mathrm{CNOT}_{1\\to3}$ instead of $\\mathrm{CNOT}_{0\\to3}$. Predict the count before you run it.',
  out:'CNOT_0->1 on a line of 4: 1 two-qubit gates\nCNOT_0->2 on a line of 4: 4 two-qubit gates\nCNOT_0->3 on a line of 4: 7 two-qubit gates\nextra gates paid for routing CNOT_0->3: 6',
  qk:`from qiskit import QuantumCircuit
from qiskit.transpiler import CouplingMap
from qiskit.compiler import transpile

n = 4
cmap = CouplingMap.from_line(n)         # a line: neighbours only
def two_qubit_count(c, t):
    qc = QuantumCircuit(n); qc.cx(c, t)
    out = transpile(qc, coupling_map=cmap, basis_gates=['cx','u'],
                     optimization_level=0, seed_transpiler=0)
    return out.count_ops().get('cx', 0)

for c, t in [(0, 1), (0, 2), (0, 3)]:
    cost = two_qubit_count(c, t)
    print(f'CNOT_{c}->{t} on a line of {n}: {cost} two-qubit gates')

extra = two_qubit_count(0, 3) - 1
print(f'extra gates paid for routing CNOT_0->3: {extra}')`,
  py:`import numpy as np

def cnot_cost_on_line(c, t, n):        # a line of n qubits, neighbours only
    d = abs(t - c)                      # distance to bridge
    if d == 1: return 1                 # already neighbours
    return 3 * (d - 1) + 1              # (d-1) SWAPs there, then one CNOT

n = 4
for c, t in [(0, 1), (0, 2), (0, 3)]:
    cost = cnot_cost_on_line(c, t, n)
    print(f'CNOT_{c}->{t} on a line of {n}: {cost} two-qubit gates')

# leave the SWAPs uncompensated: swapping back doubles the extra cost
extra = cnot_cost_on_line(0, 3, n) - 1
print(f'extra gates paid for routing CNOT_0->3: {extra}')`},

'swap-back-or-relabel': {
  title:'Swapping back doubles the cost that relabelling avoids',
  what:'Compares the two-qubit gate count of routing a distant CNOT when the compiler swaps the qubits back to their original wires against leaving the labels permuted, at three distances.',
  try:'Find the distance at which swapping back first costs more than double the CNOT count of leaving the labels permuted. Predict it before you run it.',
  out:'d = 2: swap back = 7, leave permuted = 4\nd = 3: swap back = 13, leave permuted = 7\nd = 4: swap back = 19, leave permuted = 10\nsaving at d=4 from leaving the labels permuted: 9',
  qk:`import numpy as np

# routing on a line: (d-1) SWAPs bring the pair together, at 3 CNOTs each,
# and swapping back afterwards to keep the original wire labels doubles
# that part of the cost. A compiler may skip it and relabel instead.
def routed_cost(d, swap_back):        # d = distance to bridge, in steps
    there = 3 * (d - 1)                # SWAPs to bring the qubits together
    back = there if swap_back else 0   # SWAPs to restore the original labels
    return there + 1 + back            # +1 for the CNOT itself

for d in (2, 3, 4):
    no_relabel = routed_cost(d, swap_back=True)
    relabel = routed_cost(d, swap_back=False)
    print(f'd = {d}: swap back = {no_relabel}, leave permuted = {relabel}')

d = 4
saving = routed_cost(d, True) - routed_cost(d, False)
print(f'saving at d={d} from leaving the labels permuted: {saving}')`,
  py:`import numpy as np

def routed_cost(d, swap_back):        # d = distance to bridge, in steps
    there = 3 * (d - 1)                # SWAPs to bring the qubits together
    back = there if swap_back else 0   # SWAPs to restore the original labels
    return there + 1 + back            # +1 for the CNOT itself

for d in (2, 3, 4):
    no_relabel = routed_cost(d, swap_back=True)
    relabel = routed_cost(d, swap_back=False)
    print(f'd = {d}: swap back = {no_relabel}, leave permuted = {relabel}')

d = 4
saving = routed_cost(d, True) - routed_cost(d, False)
print(f'saving at d={d} from leaving the labels permuted: {saving}')`},

/* ---- 5.4 Interference in a circuit ----------------------------------------- */

'ramsey-fringe': {
  title:'The Ramsey fringe, gate by gate against the closed form',
  what:'Runs $H$–$P(\\varphi)$–$H$ on $|0\\rangle$ at six phases and checks the resulting $p(0)$ against $\\cos^{2}(\\varphi/2)$.',
  try:'Add $\\varphi=360$ degrees to the list. Predict $p(0)$ before you run it.',
  out:'phi =   0 deg: p(0) = 1.0000   cos^2(phi/2) = 1.0000\nphi =  45 deg: p(0) = 0.8536   cos^2(phi/2) = 0.8536\nphi =  90 deg: p(0) = 0.5000   cos^2(phi/2) = 0.5000\nphi = 135 deg: p(0) = 0.1464   cos^2(phi/2) = 0.1464\nphi = 180 deg: p(0) = 0.0000   cos^2(phi/2) = 0.0000\nphi = 270 deg: p(0) = 0.5000   cos^2(phi/2) = 0.5000',
  qk:`import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

def p0_of_phi(phi):
    qc = QuantumCircuit(1)
    qc.h(0); qc.p(phi, 0); qc.h(0)
    psi = Statevector.from_label('0').evolve(qc)
    return psi.probabilities()[0]

for deg in (0, 45, 90, 135, 180, 270):
    p0 = p0_of_phi(np.radians(deg))
    formula = np.cos(np.radians(deg)/2)**2
    print(f'phi = {deg:3d} deg: p(0) = {p0:.4f}   cos^2(phi/2) = {formula:.4f}')`,
  py:`import numpy as np

I = np.eye(2); X = np.array([[0,1],[1,0]])
H = (X + np.diag([1,-1])) / np.sqrt(2)

def p0_of_phi(phi):
    P = np.diag([1, np.exp(1j*phi)])    # phase gate P(phi)
    psi = H @ (P @ (H @ np.array([1, 0])))
    return abs(psi[0])**2

for deg in (0, 45, 90, 135, 180, 270):
    p0 = p0_of_phi(np.radians(deg))
    formula = np.cos(np.radians(deg)/2)**2
    print(f'phi = {deg:3d} deg: p(0) = {p0:.4f}   cos^2(phi/2) = {formula:.4f}')`},

'ramsey-shot-noise': {
  title:'Shot noise is worst where the fringe is steepest',
  what:'Draws counts from the Ramsey circuit at $\\varphi=0$, where $p(0)=1$ exactly, and at $\\varphi=90^{\\circ}$, where $p(0)=0.5$, and reads the standard error at each.',
  try:'Use $N=8000$ instead of $2000$ at $\\varphi=90^{\\circ}$. Predict the new standard error before you run it.',
  out:'phi =  0 deg: p(0) = 1.0000, p_hat = 1.0000, SE = 0.0000\nphi = 90 deg: p(0) = 0.5000, p_hat = 0.4665, SE = 0.0112',
  qk:`import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

def se(p, N): return np.sqrt(p * (1 - p) / N)

phis_deg = (0, 90)
N = 2000
rng = np.random.default_rng(1)
for deg in phis_deg:
    phi = np.radians(deg)
    qc = QuantumCircuit(1); qc.h(0); qc.p(phi, 0); qc.h(0)
    p0 = Statevector.from_label('0').evolve(qc).probabilities()[0]
    p0 = round(p0, 9)                   # round before feeding the sampler
    counts0 = int(rng.binomial(N, p0))  # one shared seeded draw
    p_hat = counts0 / N
    print(f'phi = {deg:2d} deg: p(0) = {p0:.4f}, p_hat = {p_hat:.4f}, '
          f'SE = {se(p0, N):.4f}')`,
  py:`import numpy as np

def se(p, N): return np.sqrt(p * (1 - p) / N)

phis_deg = (0, 90)                      # flattest and steepest points
N = 2000
rng = np.random.default_rng(1)
for deg in phis_deg:
    phi = np.radians(deg)
    p0 = round(np.cos(phi / 2)**2, 9)   # round before feeding the sampler
    counts0 = int(rng.binomial(N, p0))  # one shared seeded draw
    p_hat = counts0 / N
    print(f'phi = {deg:2d} deg: p(0) = {p0:.4f}, p_hat = {p_hat:.4f}, '
          f'SE = {se(p0, N):.4f}')`},

'ramsey-inverse': {
  title:'Reading the phase back off a measured probability',
  what:'Runs the Ramsey circuit at a chosen $\\varphi$, then inverts $p(0)=\\cos^{2}(\\varphi/2)$ with $\\varphi = 2\\arccos\\sqrt{p(0)}$ to recover the phase from the probability alone.',
  try:'Use $\\varphi = 260^{\\circ}$ instead of $50^{\\circ}$. Predict whether the recovered angle still matches.',
  out:'true phi = 50.0 deg, p(0) = 0.8214\nrecovered phi = 50.0 deg\nmatch: True',
  qk:`import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

def p0_of_phi(phi):
    qc = QuantumCircuit(1)
    qc.h(0); qc.p(phi, 0); qc.h(0)
    return Statevector.from_label('0').evolve(qc).probabilities()[0]

true_phi = np.radians(50)
p0 = p0_of_phi(true_phi)
recovered = 2 * np.arccos(np.sqrt(p0))    # invert p(0) = cos^2(phi/2)
print(f'true phi = {np.degrees(true_phi):.1f} deg, p(0) = {p0:.4f}')
print(f'recovered phi = {np.degrees(recovered):.1f} deg')
print(f'match: {np.isclose(true_phi, recovered)}')`,
  py:`import numpy as np

I = np.eye(2); X = np.array([[0,1],[1,0]])
H = (X + np.diag([1,-1])) / np.sqrt(2)

def p0_of_phi(phi):
    P = np.diag([1, np.exp(1j*phi)])
    psi = H @ (P @ (H @ np.array([1, 0])))
    return abs(psi[0])**2

true_phi = np.radians(50)
p0 = p0_of_phi(true_phi)
recovered = 2 * np.arccos(np.sqrt(p0))    # invert p(0) = cos^2(phi/2)
print(f'true phi = {np.degrees(true_phi):.1f} deg, p(0) = {p0:.4f}')
print(f'recovered phi = {np.degrees(recovered):.1f} deg')
print(f'match: {np.isclose(true_phi, recovered)}')`},

/* ---- 5.5 Teleportation ------------------------------------------------------ */

'teleport-four-branches': {
  title:'All four branches, corrected, and fidelity one in each',
  what:'Runs the full three-qubit teleportation circuit, projects onto each of the four measured-bit branches $(m_{1},m_{0})$, applies $X^{m_{1}}$ then $Z^{m_{0}}$, and checks the fidelity against $|\\psi\\rangle$.',
  try:'Apply the correction in the order $Z^{m_{0}}$ then $X^{m_{1}}$ instead. Predict which branches keep fidelity 1.',
  out:'m1=0 m0=0: p=0.2500, fidelity = 1.0000\nm1=0 m0=1: p=0.2500, fidelity = 1.0000\nm1=1 m0=0: p=0.2500, fidelity = 1.0000\nm1=1 m0=1: p=0.2500, fidelity = 1.0000',
  qk:`import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, Operator
from qiskit.circuit.library import XGate, ZGate

X, Z = Operator(XGate()).data, Operator(ZGate()).data
psi = [0.6, 0.8j]                       # q0: the state to send
qc = QuantumCircuit(3)                  # q2 Bob, q1 Alice, q0 input
qc.initialize(psi, 0)
qc.h(1); qc.cx(1, 2); qc.cx(0, 1); qc.h(0)   # Bell pair, then rotation
state = Statevector.from_label('000').evolve(qc).data
Xp = np.linalg.matrix_power
for m1 in (0, 1):
    for m0 in (0, 1):
        keep = [k for k in range(8) if (k>>1&1)==m1 and (k&1)==m0]
        branch = np.zeros(8, complex); branch[keep] = state[keep]
        p = np.vdot(branch, branch).real
        bob = branch.reshape(2,2,2)[:, m1, m0] / np.sqrt(p)
        fixed = Xp(X,m1) @ (Xp(Z,m0) @ bob)
        F = abs(np.vdot(psi, fixed))**2
        print(f'm1={m1} m0={m0}: p={p:.4f}, fidelity = {F:.4f}')`,
  py:`import numpy as np

I = np.eye(2); X = np.array([[0,1],[1,0]]); Z = np.diag([1,-1])
H = (X + Z) / np.sqrt(2); P = [np.diag([1,0]), np.diag([0,1])]
psi = np.array([0.6, 0.8j])                 # q0: the state to send

# order |q2 q1 q0>: q2 Bob's half, q1 Alice's half, q0 the input
bell = (np.kron([1,0],[1,0]) + np.kron([0,1],[0,1])) / np.sqrt(2)
cx01 = np.kron(I, np.kron(I, P[0])) + np.kron(I, np.kron(X, P[1]))
state = np.kron(I, np.kron(I, H)) @ (cx01 @ np.kron(bell, psi))
Xp, Zp = np.linalg.matrix_power, np.linalg.matrix_power

for m1 in (0, 1):
    for m0 in (0, 1):
        branch = np.kron(I, np.kron(P[m1], P[m0])) @ state
        p = np.vdot(branch, branch).real
        bob = branch.reshape(2,2,2)[:, m1, m0] / np.sqrt(p)
        fixed = Xp(X,m1) @ (Zp(Z,m0) @ bob)
        F = abs(np.vdot(psi, fixed))**2
        print(f'm1={m1} m0={m0}: p={p:.4f}, fidelity = {F:.4f}')`},

'bob-before-the-bits': {
  title:'Bob\'s reduced state is I/2, whatever was sent',
  what:'Traces out Alice\'s two qubits right after her Bell-basis rotation, before either classical bit exists, for two different input states, and checks that both give $I/2$.',
  try:'Try the input $|1\\rangle$ instead of $|{+}\\rangle$. Predict the reduced state before you run it.',
  out:'psi = [1 0]: rho_Bob before the bits =\n[[0.5+0.j 0. +0.j]\n [0. +0.j 0.5+0.j]]\npsi = [0.7071 0.7071]: rho_Bob before the bits =\n[[0.5+0.j 0. +0.j]\n [0. +0.j 0.5+0.j]]',
  qk:`import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, partial_trace

def rho_bob_before_bits(psi):               # trace out Alice's two qubits
    qc = QuantumCircuit(3)                  # q2 Bob, q1 Alice, q0 input
    qc.initialize(psi, 0)
    qc.h(1); qc.cx(1, 2); qc.cx(0, 1); qc.h(0)
    state = Statevector.from_label('000').evolve(qc)
    return partial_trace(state, [0, 1]).data       # leaves q2 = Bob

for psi in ([1,0], [1,1]/np.sqrt(2)):
    rho = np.round(rho_bob_before_bits(psi), 12) + 0j
    print(f'psi = {np.round(psi,4)}: rho_Bob before the bits =')
    print(rho)`,
  py:`import numpy as np

I = np.eye(2); X = np.array([[0,1],[1,0]]); Z = np.diag([1,-1])
H = (X + Z) / np.sqrt(2); P = [np.diag([1,0]), np.diag([0,1])]

def rho_bob_before_bits(psi):               # average over the 4 branches
    bell = (np.kron([1,0],[1,0]) + np.kron([0,1],[0,1])) / np.sqrt(2)
    cx01 = np.kron(I, np.kron(I, P[0])) + np.kron(I, np.kron(X, P[1]))
    state = np.kron(I, np.kron(I, H)) @ (cx01 @ np.kron(bell, psi))
    rho = np.zeros((2, 2), complex)
    for m1 in (0, 1):
        for m0 in (0, 1):
            branch = np.kron(I, np.kron(P[m1], P[m0])) @ state
            bob = branch.reshape(2,2,2)[:, m1, m0]     # unnormalised: p*rho
            rho += np.outer(bob, bob.conj())
    return rho

for psi in (np.array([1,0]), np.array([1,1])/np.sqrt(2)):
    rho = np.round(rho_bob_before_bits(psi), 12) + 0j
    print(f'psi = {np.round(psi,4)}: rho_Bob before the bits =')
    print(rho)`},

'skip-the-correction': {
  title:'Skipping the correction gives I/2, not a slightly worse state',
  what:'Averages the four uncorrected branches $X^{m_{1}}Z^{m_{0}}|\\psi\\rangle$ with weight one quarter each and shows the average is $I/2$, then applies the right correction on one branch and gets fidelity one.',
  try:'Average only the two branches with $m_{1}=0$ instead of all four. Predict whether the result is still $I/2$.',
  out:'no correction, averaged over the 4 branches:\n[[0.5+0.j 0. +0.j]\n [0. +0.j 0.5+0.j]]\nwith the right correction on one branch: fidelity = 1.0000',
  qk:`import numpy as np
from qiskit.quantum_info import Statevector, Operator
from qiskit.circuit.library import XGate, ZGate

X, Z = Operator(XGate()).data, Operator(ZGate()).data
psi = Statevector([0.6, 0.8j]).data
Xp = np.linalg.matrix_power

rho_avg = np.zeros((2,2), complex)          # average, correction skipped
for m1 in (0, 1):
    for m0 in (0, 1):
        held = Xp(X, m1) @ (Xp(Z, m0) @ psi)
        rho_avg += 0.25 * np.outer(held, held.conj())
rho_avg = np.round(rho_avg, 12) + 0j
print(f'no correction, averaged over the 4 branches:\\n{rho_avg}')

fixed = Xp(X, 1) @ (Xp(Z, 1) @ (Xp(X, 1) @ (Xp(Z, 1) @ psi)))
F = abs(np.vdot(psi, fixed))**2
print(f'with the right correction on one branch: fidelity = {F:.4f}')`,
  py:`import numpy as np

X = np.array([[0,1],[1,0]]); Z = np.diag([1,-1])
psi = np.array([0.6, 0.8j])
Xp = np.linalg.matrix_power

rho_avg = np.zeros((2,2), complex)          # average, correction skipped
for m1 in (0, 1):
    for m0 in (0, 1):
        held = Xp(X, m1) @ (Xp(Z, m0) @ psi)
        rho_avg += 0.25 * np.outer(held, held.conj())
rho_avg = np.round(rho_avg, 12) + 0j
print(f'no correction, averaged over the 4 branches:\\n{rho_avg}')

fixed = Xp(X, 1) @ (Xp(Z, 1) @ (Xp(X, 1) @ (Xp(Z, 1) @ psi)))
F = abs(np.vdot(psi, fixed))**2
print(f'with the right correction on one branch: fidelity = {F:.4f}')`},

/* ---- 5.6 Grover search ------------------------------------------------------ */

'grover-success-probability': {
  title:'The success probability, checked against a real Grover circuit',
  what:'Reads $P(r)=\\sin^{2}((2r+1)\\theta)$ with $\\sin\\theta=\\sqrt{M/N}$ off the formula and checks each value against an actual Grover circuit run on a statevector.',
  try:'Use $M=2$ marked candidates out of $N=8$ instead of one. Predict the new optimum $r^{*}$ before you run it.',
  out:'r = 0: P = 0.125\nr = 1: P = 0.781\nr = 2: P = 0.945\nr = 3: P = 0.330\nr = 4: P = 0.012\ntheta = 20.7048 deg, optimum r* = 2',
  qk:`import numpy as np
from qiskit import QuantumCircuit
from qiskit.circuit.library import grover_operator, ZGate
from qiskit.quantum_info import Statevector

n = 3                                # N=8, one marked candidate: |111>
N, M = 2**n, 1
theta = np.arcsin(np.sqrt(M / N))
r_star = round(np.pi / (4 * theta) - 0.5)

oracle = QuantumCircuit(n)
oracle.append(ZGate().control(n - 1), range(n))
gop = grover_operator(oracle)

for r in range(5):
    qc = QuantumCircuit(n)
    qc.h(range(n))
    for _ in range(r): qc.compose(gop, inplace=True)
    p = Statevector.from_label('0'*n).evolve(qc).probabilities()[-1]
    print(f'r = {r}: P = {p:.3f}')
print(f'theta = {np.degrees(theta):.4f} deg, optimum r* = {r_star}')`,
  py:`import numpy as np

N, M = 8, 1                         # 3 qubits, one marked candidate
theta = np.arcsin(np.sqrt(M / N))
r_star = round(np.pi / (4 * theta) - 0.5)

def p_good(r): return np.sin((2*r + 1) * theta)**2

for r in range(5):
    print(f'r = {r}: P = {p_good(r):.3f}')
print(f'theta = {np.degrees(theta):.4f} deg, optimum r* = {r_star}')`},

'grover-as-two-reflections': {
  title:'Grover built as two reflection matrices',
  what:'Builds the oracle reflection $O_{f}=I-2|G\\rangle\\langle G|$ and the diffusion reflection $D=2|s\\rangle\\langle s|-I$ as plain matrices, checks $D O_{f}$ is unitary, and runs it as the Grover iteration.',
  try:'Reverse the order to $O_{f}D$ instead of $DO_{f}$. Predict whether the success probabilities at $r=1,2$ change.',
  out:'r = 0: p(marked) = 0.125\nr = 1: p(marked) = 0.781\nr = 2: p(marked) = 0.945\nG unitary? max |G^dag G - I| = 0.0000',
  qk:`import numpy as np
from qiskit import QuantumCircuit
from qiskit.circuit.library import grover_operator, ZGate
from qiskit.quantum_info import Statevector, Operator

n = 3; N = 2**n; marked = [7]           # N=8, one marked candidate |111>
oracle = QuantumCircuit(n)
oracle.append(ZGate().control(n - 1), range(n))
gop = grover_operator(oracle)
G = Operator(gop).data

state_qc = QuantumCircuit(n)
state_qc.h(range(n))
sv = Statevector.from_label('0'*n).evolve(state_qc)
for r in range(3):
    p = sv.probabilities()[marked[0]]
    print(f'r = {r}: p(marked) = {p:.3f}')
    sv = sv.evolve(Operator(G))
err = np.abs(G.conj().T @ G - np.eye(N)).max()
print(f'G unitary? max |G^dag G - I| = {err:.4f}')`,
  py:`import numpy as np

n = 3; N = 2**n; marked = [7]           # N=8, one marked candidate |111>
s = np.ones(N) / np.sqrt(N)             # the uniform superposition |s>

Of = np.eye(N)                          # oracle: reflect in the unmarked
for x in marked: Of[x, x] = -1
D = 2 * np.outer(s, s) - np.eye(N)      # diffusion: reflect in |s>
G = D @ Of                              # one Grover iteration

state = s.copy()
for r in range(3):
    p = abs(state[marked[0]])**2
    print(f'r = {r}: p(marked) = {p:.3f}')
    state = G @ state
err = np.abs(G.conj().T @ G - np.eye(N)).max()
print(f'G unitary? max |G^dag G - I| = {err:.4f}')`},

'grover-overshoot': {
  title:'Past the optimum, the success probability falls',
  what:'Finds the real optimum $r_{*}=\\pi/(4\\theta)-1/2$ and its rounded value for $N=1024$, $M=1$, then reads the success probability at $r_{*}$, at twice $r_{*}$, and at $r=0$.',
  try:'Use $M=4$ marked candidates instead of one. Predict whether $r^{*}$ grows or shrinks before you run it.',
  out:'r* (real) = 24.6286, r* (rounded) = 25\nP at r* = 0.9995\nP at 2 r* (double the optimum) = 0.0002\nP at r=0 (no iteration at all) = 0.0010',
  qk:`import numpy as np

# the success probability is sin^2((2r+1) theta) with sin(theta)=sqrt(M/N);
# it is the closed form the Grover circuit realises, checked as a circuit
# in the two programs before this one, and used here to find the optimum.
N, M = 1024, 1                       # a bigger search: 10 qubits, 1 marked
theta = np.arcsin(np.sqrt(M / N))
r_exact = np.pi / (4 * theta) - 0.5
r_star = round(r_exact)

def p_good(r): return np.sin((2*r + 1) * theta)**2

print(f'r* (real) = {r_exact:.4f}, r* (rounded) = {r_star}')
print(f'P at r* = {p_good(r_star):.4f}')
print(f'P at 2 r* (double the optimum) = {p_good(2*r_star):.4f}')
print(f'P at r=0 (no iteration at all) = {p_good(0):.4f}')`,
  py:`import numpy as np

N, M = 1024, 1                       # a bigger search: 10 qubits, 1 marked
theta = np.arcsin(np.sqrt(M / N))
r_exact = np.pi / (4 * theta) - 0.5
r_star = round(r_exact)

def p_good(r): return np.sin((2*r + 1) * theta)**2

print(f'r* (real) = {r_exact:.4f}, r* (rounded) = {r_star}')
print(f'P at r* = {p_good(r_star):.4f}')
print(f'P at 2 r* (double the optimum) = {p_good(2*r_star):.4f}')
print(f'P at r=0 (no iteration at all) = {p_good(0):.4f}')`}

};
