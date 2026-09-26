/* ==========================================================================
   Code for Module 6: programs in Qiskit and in NumPy
   The same form as 77_code_m1.js through 79b_code_m5.js: one entry a program,
   each written twice (`qk`, a Qiskit listing to copy; `py`, NumPy only, run
   on the page) and printing the same lines, which are `out`. Course qubit
   order throughout: |q_{n-1} ... q1 q0>, entry x of a state vector is the
   amplitude of |x>, and q0 is the top wire of a circuit drawing. The Qiskit
   listings use QuantumCircuit, Statevector, Operator and the circuit library
   where a program checks a real compiled circuit rather than a formula.
   Every teaching section closes with a code page (`CODE_BANKS_M6`) that
   pages through its programs.
   verify/code_check.py runs every entry in both forms and compares what it
   prints with `out`.
   ========================================================================== */
const CODE_BANKS_M6 = {
  'm6-code-query':  ['oracle-as-permutation', 'classical-worst-case', 'randomised-tester-error'],
  'm6-code-kick':   ['or-oracle-kickback', 'controlled-phase-kickback', 'before-and-after-hadamard'],
  'm6-code-dj':     ['dj-constant-vs-balanced', 'amplitude-equals-mean-sign', 'four-masks-at-n4'],
  'm6-code-qft':    ['qft-sum-vs-circuit', 'qft-phase-ramp', 'qft-of-a-periodic-input'],
  'm6-code-qpe':    ['exact-phase-read', 'halfway-phase-bounds', 'counting-qubits-formula'],
  'm6-code-order':  ['order-by-brute-force', 'order-finding-reading', 'continued-fraction-candidate'],
  'm6-code-shor':   ['shor-fifteen-end-to-end', 'shor-failure-modes', 'fraction-of-good-bases']
};

const CODE_M6 = {

/* ---- 6.1 What a query model counts ---------------------------------------- */

'oracle-as-permutation': {
  title:'An oracle built as a permutation matrix',
  what:'Builds $U_{f}$ for a two-bit $f$ as the permutation $|x\\rangle|y\\rangle \\mapsto |x\\rangle|y\\oplus f(x)\\rangle$ and checks it is both unitary and its own inverse.',
  try:'Change one entry of the truth table, from $f=[0,1,1,0]$ to $[0,1,1,1]$. Predict whether $U_{f}$ is still self-inverse.',
  out:'U unitary? max |U^T U - I| = 0.0000\nU self-inverse? max |U U - I| = 0.0000\ntruth table f(x) for x=0..3: [0, 1, 1, 0]',
  qk:`import numpy as np

truth = [0, 1, 1, 0]                  # f(x) for x = 0..3, a balanced XOR
N = 8                                  # 2 input bits x, 1 output bit y
U = np.zeros((N, N))
for x in range(4):
    for y in (0, 1):
        i = x * 2 + y                  # order |x1 x0 y>, y = q0
        j = x * 2 + (y ^ truth[x])
        U[j, i] = 1
err = np.abs(U.T @ U - np.eye(N)).max()
print(f'U unitary? max |U^T U - I| = {err:.4f}')
self_inv = np.abs(U @ U - np.eye(N)).max()
print(f'U self-inverse? max |U U - I| = {self_inv:.4f}')
print(f'truth table f(x) for x=0..3: {truth}')`,
  py:`import numpy as np

truth = [0, 1, 1, 0]                  # f(x) for x = 0..3, a balanced XOR
N = 8                                  # 2 input bits x, 1 output bit y
U = np.zeros((N, N))
for x in range(4):
    for y in (0, 1):
        i = x * 2 + y                  # order |x1 x0 y>, y = q0
        j = x * 2 + (y ^ truth[x])
        U[j, i] = 1
err = np.abs(U.T @ U - np.eye(N)).max()
print(f'U unitary? max |U^T U - I| = {err:.4f}')
self_inv = np.abs(U @ U - np.eye(N)).max()
print(f'U self-inverse? max |U U - I| = {self_inv:.4f}')
print(f'truth table f(x) for x=0..3: {truth}')`},

'classical-worst-case': {
  title:'A deterministic tester needs half the inputs plus one',
  what:'Counts a deterministic classical tester\'s worst-case query cost $N/2+1$ against a promise oracle, at three sizes, and compares it with the single quantum query the same promise takes.',
  try:'Add $n=5$ to the list. Predict the classical cost before you run it.',
  out:'n = 2: classical worst case = 3 queries, quantum = 1 query\nn = 3: classical worst case = 5 queries, quantum = 1 query\nn = 4: classical worst case = 9 queries, quantum = 1 query',
  qk:`def make_oracle(f):                # counts every call the tester makes
    calls = [0]
    def oracle(x):
        calls[0] += 1
        return f(x)
    return oracle, calls

def tester(oracle, N):                # queries until two different outputs appear
    seen = set()
    for x in range(N):
        seen.add(oracle(x))
        if len(seen) == 2: break

for n in (2, 3, 4):
    N = 2**n
    f = lambda x: 0 if x < N // 2 else 1     # worst case: half 0s, then half 1s
    oracle, calls = make_oracle(f)
    tester(oracle, N)
    print(f'n = {n}: classical worst case = {calls[0]} queries, quantum = 1 query')`,
  py:`def make_oracle(f):                # counts every call the tester makes
    calls = [0]
    def oracle(x):
        calls[0] += 1
        return f(x)
    return oracle, calls

def tester(oracle, N):                # queries until two different outputs appear
    seen = set()
    for x in range(N):
        seen.add(oracle(x))
        if len(seen) == 2: break

for n in (2, 3, 4):
    N = 2**n
    f = lambda x: 0 if x < N // 2 else 1     # worst case: half 0s, then half 1s
    oracle, calls = make_oracle(f)
    tester(oracle, N)
    print(f'n = {n}: classical worst case = {calls[0]} queries, quantum = 1 query')`},

'randomised-tester-error': {
  title:'A randomised tester\'s exact error, against its bound',
  what:'Computes the exact error probability $2\\binom{N/2}{k}/\\binom{N}{k}$ of a $k$-query randomised balanced-or-constant tester and checks it stays under the bound $2^{-(k-1)}$.',
  try:'Use $N=32$ instead of $N=16$. Predict whether the error at $k=2$ rises or falls.',
  out:'k = 1: error prob = 1.0000, bound 2^-(k-1) = 1.0000\nk = 2: error prob = 0.4667, bound 2^-(k-1) = 0.5000\nk = 3: error prob = 0.2000, bound 2^-(k-1) = 0.2500\nk = 4: error prob = 0.0769, bound 2^-(k-1) = 0.1250\nerror stays at or under the bound for every k: True',
  qk:`from math import comb

def error_prob(N, k):                   # k draws, all landing on the same half of N
    return 2 * comb(N // 2, k) / comb(N, k)

def bound(k): return 2**(-(k - 1))       # the worst-case bound the algorithm claims

N = 16
for k in (1, 2, 3, 4):
    p, b = error_prob(N, k), bound(k)
    print(f'k = {k}: error prob = {p:.4f}, bound 2^-(k-1) = {b:.4f}')
print(f'error stays at or under the bound for every k: '
      f'{all(error_prob(N, k) <= bound(k) for k in (1, 2, 3, 4))}')`,
  py:`from math import comb

def error_prob(N, k):                   # k draws, all landing on the same half of N
    return 2 * comb(N // 2, k) / comb(N, k)

def bound(k): return 2**(-(k - 1))       # the worst-case bound the algorithm claims

N = 16
for k in (1, 2, 3, 4):
    p, b = error_prob(N, k), bound(k)
    print(f'k = {k}: error prob = {p:.4f}, bound 2^-(k-1) = {b:.4f}')
print(f'error stays at or under the bound for every k: '
      f'{all(error_prob(N, k) <= bound(k) for k in (1, 2, 3, 4))}')`},

/* ---- 6.2 Phase kickback ----------------------------------------------------- */

'or-oracle-kickback': {
  title:'The OR oracle kicks a sign onto three branches of four',
  what:'Applies $U_{f}|x_{1}x_{0}\\rangle|{-}\\rangle$ for $f=x_{1}\\lor x_{0}$ and reads the coefficient the ancilla leaves behind on each of the four $|x_{1}x_{0}\\rangle$ branches.',
  try:'Change $f$ to the XOR of the two bits. Predict which branches carry the minus sign before you run it.',
  out:'kickback coefficient on |x1 x0>, f = OR:\n[[ 0.5 -0.5]\n [-0.5 -0.5]]',
  qk:`import numpy as np
from qiskit.quantum_info import Statevector

def Uf_or():                        # |x1 x0 a> -> |x1 x0 (a xor f)>, f = x1 OR x0
    N, U = 8, np.zeros((8, 8))
    for x1 in (0, 1):
        for x0 in (0, 1):
            f, base = x1 | x0, x1*4 + x0*2
            for a in (0, 1): U[base + (a ^ f), base + a] = 1
    return U

plus = Statevector.from_label('+').data
minus = Statevector.from_label('-').data
psi = np.kron(np.kron(plus, plus), minus)
out = (Uf_or() @ psi).reshape(2, 2, 2)      # index by (x1, x0, a)

coeff = np.zeros((2, 2))
for x1 in (0, 1):
    for x0 in (0, 1):
        coeff[x1, x0] = round((out[x1, x0, 0] / minus[0]).real, 4)
print(f'kickback coefficient on |x1 x0>, f = OR:\\n{coeff}')`,
  py:`import numpy as np

X = np.array([[0,1],[1,0]])
H = (X + np.diag([1,-1])) / np.sqrt(2)
def Uf_or():                        # |x1 x0 a> -> |x1 x0 (a xor f)>, f = x1 OR x0
    U = np.zeros((8, 8))
    for x1 in (0, 1):
        for x0 in (0, 1):
            f, base = x1 | x0, x1*4 + x0*2
            for a in (0, 1): U[base + (a ^ f), base + a] = 1
    return U

plus = H @ np.array([1, 0])
minus = (np.array([1, 0]) - np.array([0, 1])) / np.sqrt(2)
psi = np.kron(np.kron(plus, plus), minus)
out = (Uf_or() @ psi).reshape(2, 2, 2)      # index by (x1, x0, a)
coeff = np.zeros((2, 2))
for x1 in (0, 1):
    for x0 in (0, 1):
        coeff[x1, x0] = round((out[x1, x0, 0] / minus[0]).real, 4)
print(f'kickback coefficient on |x1 x0>, f = OR:\\n{coeff}')`},

'controlled-phase-kickback': {
  title:'A controlled phase gate kicks its angle onto the control',
  what:'Applies a controlled-$P(\\theta)$ with $\\theta=3\\pi/4$ to a control in $|{+}\\rangle$ and a target held at the eigenstate $|1\\rangle$, and reads the phase $e^{i\\theta}$ left on the control.',
  try:'Use $\\theta=\\pi/3$ instead. Predict the new control amplitudes before you run it.',
  out:'control amplitudes after kickback = [ 0.70710678+0.j  -0.5       +0.5j]\nexpected [1, e^i theta]/sqrt2, theta = 2.3562',
  qk:`import numpy as np
from qiskit.quantum_info import Statevector, Operator
from qiskit.circuit.library import PhaseGate

theta = 2 * np.pi * 3 / 8
CP = Operator(PhaseGate(theta).control(1)).data   # control q1, target q0

plus = Statevector.from_label('+').data
target = Statevector.from_label('1').data          # eigenstate |1> of P(theta)
psi = np.kron(plus, target)
out = CP @ psi
control = out.reshape(2, 2)[:, 1]                   # target branch is 1 throughout
control = np.round(control, 12) + 0j
print(f'control amplitudes after kickback = {control}')
print(f'expected [1, e^i theta]/sqrt2, theta = {theta:.4f}')`,
  py:`import numpy as np

I = np.eye(2); X = np.array([[0,1],[1,0]])
H = (X + np.diag([1,-1])) / np.sqrt(2)

theta = 2 * np.pi * 3 / 8
P = np.diag([1, np.exp(1j*theta)])
CP = np.kron(np.diag([1,0]), I) + np.kron(np.diag([0,1]), P)   # control q1, target q0

plus = H @ np.array([1, 0], dtype=complex)
target = np.array([0, 1], dtype=complex)            # eigenstate |1> of P(theta)
psi = np.kron(plus, target)
out = CP @ psi
control = out.reshape(2, 2)[:, 1]                   # target branch is 1 throughout
control = np.round(control, 12) + 0j
print(f'control amplitudes after kickback = {control}')
print(f'expected [1, e^i theta]/sqrt2, theta = {theta:.4f}')`},

'before-and-after-hadamard': {
  title:'The readout is flat before the last Hadamard layer, peaked after',
  what:'Runs the phase-kickback trick for a balanced $f(x)=x_{1}\\oplus x_{0}$ on $n=3$ and compares the uniform readout right after the oracle with the readout after the final Hadamard layer.',
  try:'Use the constant function $f=0$ instead. Predict both readouts before you run it.',
  out:'before final H layer, p(uniform over all x) = 0.1250 (each x)\nafter final H layer, p(000) = 0.0000\nafter final H layer, p(any x != 0) summed = 1.0000',
  qk:`import numpy as np
from qiskit.quantum_info import Operator
from qiskit.circuit.library import HGate

H = Operator(HGate()).data
n, N = 3, 8
mask = 3                             # f(x) = parity of x1, x0 (balanced on n=3)
def f(x): return bin(x & mask).count('1') % 2

signs = np.array([(-1)**f(x) for x in range(N)])
after_oracle = signs / np.sqrt(N)                # right after the oracle, before H^n
Hn = H
for _ in range(n - 1): Hn = np.kron(Hn, H)
after_had = Hn @ after_oracle

p_before = round(abs(after_oracle[0])**2, 9)
p_after = round(abs(after_had[0])**2, 9)
print(f'before final H layer, p(uniform over all x) = {p_before:.4f} (each x)')
print(f'after final H layer, p(000) = {p_after:.4f}')
print(f'after final H layer, p(any x != 0) summed = {1-p_after:.4f}')`,
  py:`import numpy as np

X = np.array([[0,1],[1,0]])
H = (X + np.diag([1,-1])) / np.sqrt(2)
n, N = 3, 8
mask = 3                             # f(x) = parity of x1, x0 (balanced on n=3)
def f(x): return bin(x & mask).count('1') % 2

signs = np.array([(-1)**f(x) for x in range(N)])
after_oracle = signs / np.sqrt(N)                # right after the oracle, before H^n
Hn = H
for _ in range(n - 1): Hn = np.kron(Hn, H)
after_had = Hn @ after_oracle

p_before = round(abs(after_oracle[0])**2, 9)
p_after = round(abs(after_had[0])**2, 9)
print(f'before final H layer, p(uniform over all x) = {p_before:.4f} (each x)')
print(f'after final H layer, p(000) = {p_after:.4f}')
print(f'after final H layer, p(any x != 0) summed = {1-p_after:.4f}')`},

/* ---- 6.3 Deutsch and Deutsch-Jozsa ------------------------------------------ */

'dj-constant-vs-balanced': {
  title:'Deutsch-Jozsa tells constant from balanced in one query',
  what:'Runs the Deutsch-Jozsa circuit at $n=3$ on the two constant functions and one balanced parity function, and reads $P(000)$ in each case.',
  try:'Change the balanced mask from $011$ to $110$. Predict $P(000)$ before you run it.',
  out:'constant f=0: P(000) = 1.0000\nconstant f=1: P(000) = 1.0000\nbalanced (mask=011): P(000) = 0.0000',
  qk:`import numpy as np
from qiskit.quantum_info import Operator
from qiskit.circuit.library import HGate

H = Operator(HGate()).data
n, N = 3, 8
Hn = H
for _ in range(n - 1): Hn = np.kron(Hn, H)

def dj_p0(f):
    signs = np.array([(-1)**f(x) for x in range(N)])
    out = Hn @ (signs / np.sqrt(N))
    return round(abs(out[0])**2, 9)

mask = 3                                          # balanced: parity of x1, x0
print(f'constant f=0: P(000) = {dj_p0(lambda x: 0):.4f}')
print(f'constant f=1: P(000) = {dj_p0(lambda x: 1):.4f}')
print(f'balanced (mask=011): P(000) = '
      f'{dj_p0(lambda x: bin(x & mask).count("1") % 2):.4f}')`,
  py:`import numpy as np

X = np.array([[0,1],[1,0]])
H = (X + np.diag([1,-1])) / np.sqrt(2)
n, N = 3, 8
Hn = H
for _ in range(n - 1): Hn = np.kron(Hn, H)

def dj_p0(f):
    signs = np.array([(-1)**f(x) for x in range(N)])
    out = Hn @ (signs / np.sqrt(N))
    return round(abs(out[0])**2, 9)

mask = 3                                          # balanced: parity of x1, x0
print(f'constant f=0: P(000) = {dj_p0(lambda x: 0):.4f}')
print(f'constant f=1: P(000) = {dj_p0(lambda x: 1):.4f}')
print(f'balanced (mask=011): P(000) = '
      f'{dj_p0(lambda x: bin(x & mask).count("1") % 2):.4f}')`},

'amplitude-equals-mean-sign': {
  title:'The amplitude of $0^{n}$ is the mean of the oracle\'s signs',
  what:'For a function that is neither constant nor balanced, checks that $P(0^{n})$ from the Deutsch-Jozsa circuit equals the square of the mean of $(-1)^{f(x)}$, and lands strictly between 0 and 1.',
  try:'Flip one more output bit so five of eight outputs are 1 instead of three. Predict $P(0^{n})$ before you run it.',
  out:'skewed f (three 1s of eight): P(000) = 0.0625, mean(signs)^2 = 0.0625\n0 < P(000) < 1: True',
  qk:`import numpy as np
from qiskit.quantum_info import Operator
from qiskit.circuit.library import HGate

H = Operator(HGate()).data
n, N = 3, 8
Hn = H
for _ in range(n - 1): Hn = np.kron(Hn, H)

f_vals = [0, 1, 0, 0, 0, 1, 0, 1]              # three 1s of eight: not balanced
signs = (-1.0)**np.array(f_vals)
out = Hn @ (signs / np.sqrt(N))
p0 = round(abs(out[0])**2, 9)
formula = round(signs.mean()**2, 9)
print(f'skewed f (three 1s of eight): P(000) = {p0:.4f}, mean(signs)^2 = {formula:.4f}')
print(f'0 < P(000) < 1: {0 < p0 < 1}')`,
  py:`import numpy as np

X = np.array([[0,1],[1,0]])
H = (X + np.diag([1,-1])) / np.sqrt(2)
n, N = 3, 8
Hn = H
for _ in range(n - 1): Hn = np.kron(Hn, H)

f_vals = [0, 1, 0, 0, 0, 1, 0, 1]              # three 1s of eight: not balanced
signs = (-1.0)**np.array(f_vals)
out = Hn @ (signs / np.sqrt(N))
p0 = round(abs(out[0])**2, 9)
formula = round(signs.mean()**2, 9)
print(f'skewed f (three 1s of eight): P(000) = {p0:.4f}, mean(signs)^2 = {formula:.4f}')
print(f'0 < P(000) < 1: {0 < p0 < 1}')`},

'four-masks-at-n4': {
  title:'Three parity masks at $n=4$, each read off exactly',
  what:'Runs Deutsch-Jozsa at $n=4$ on three different parity-with-mask oracles and reads the mask straight back as the peak bit string.',
  try:'Add the mask $1111$ to the list. Predict the peak string before you run it.',
  out:'mask = 0110: P(peak) = 1.0000 at |0110>\nmask = 1001: P(peak) = 1.0000 at |1001>\nmask = 0011: P(peak) = 1.0000 at |0011>',
  qk:`import numpy as np
from qiskit.quantum_info import Operator
from qiskit.circuit.library import HGate

H = Operator(HGate()).data
n, N = 4, 16
Hn = H
for _ in range(n - 1): Hn = np.kron(Hn, H)

def dj_peak(mask):
    signs = np.array([(-1)**bin(x & mask).count('1') for x in range(N)])
    out = Hn @ (signs / np.sqrt(N))
    x_star = int(np.argmax(np.abs(out)))
    return round(abs(out[x_star])**2, 9), format(x_star, f'0{n}b')

for mask in (0b0110, 0b1001, 0b0011):
    p, bits = dj_peak(mask)
    print(f'mask = {mask:04b}: P(peak) = {p:.4f} at |{bits}>')`,
  py:`import numpy as np

X = np.array([[0,1],[1,0]])
H = (X + np.diag([1,-1])) / np.sqrt(2)
n, N = 4, 16
Hn = H
for _ in range(n - 1): Hn = np.kron(Hn, H)

def dj_peak(mask):
    signs = np.array([(-1)**bin(x & mask).count('1') for x in range(N)])
    out = Hn @ (signs / np.sqrt(N))
    x_star = int(np.argmax(np.abs(out)))
    return round(abs(out[x_star])**2, 9), format(x_star, f'0{n}b')

for mask in (0b0110, 0b1001, 0b0011):
    p, bits = dj_peak(mask)
    print(f'mask = {mask:04b}: P(peak) = {p:.4f} at |{bits}>')`},

/* ---- 6.4 The quantum Fourier transform -------------------------------------- */

'qft-sum-vs-circuit': {
  title:'The QFT matrix from its sum, against the circuit that builds it',
  what:'Builds the $8\\times8$ QFT matrix from its defining sum $F_{jk}=e^{2\\pi ijk/8}/\\sqrt{8}$ and checks it against the $H$-plus-controlled-phase-plus-swap circuit at $n=3$.',
  try:'Drop the final swap from the circuit. Predict whether the max difference stays zero.',
  out:'max |circuit - formula| = 0.000000',
  qk:`import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator

n, N = 3, 8
j = np.arange(N).reshape(-1, 1); k = np.arange(N).reshape(1, -1)
F = np.exp(2j * np.pi * j * k / N) / np.sqrt(N)

qc = QuantumCircuit(n)
qc.h(2); qc.cp(np.pi/2, 1, 2); qc.cp(np.pi/4, 0, 2)
qc.h(1); qc.cp(np.pi/2, 0, 1)
qc.h(0); qc.swap(0, 2)
U = Operator(qc).data
print(f'max |circuit - formula| = {np.abs(U - F).max():.6f}')`,
  py:`import numpy as np

n, N = 3, 8
j = np.arange(N).reshape(-1, 1); k = np.arange(N).reshape(1, -1)
F = np.exp(2j * np.pi * j * k / N) / np.sqrt(N)
I = np.eye(2); X = np.array([[0,1],[1,0]])
H = (X + np.diag([1,-1])) / np.sqrt(2)
def gate_on(q, G):                    # G on qubit q, order |q2 q1 q0>
    ops = [I, I, I]; ops[q] = G
    return np.kron(ops[2], np.kron(ops[1], ops[0]))
def cp(theta, c, t):                  # diagonal controlled phase, bits c and t of x
    return np.diag([np.exp(1j*theta) if (x>>c)&1 and (x>>t)&1 else 1 for x in range(N)])
SWAP02 = np.eye(N)[[0, 4, 2, 6, 1, 5, 3, 7]]      # swap bit 0 and bit 2 of the index

U = cp(np.pi/4, 0, 2) @ (cp(np.pi/2, 1, 2) @ gate_on(2, H))
U = cp(np.pi/2, 0, 1) @ (gate_on(1, H) @ U)
U = SWAP02 @ (gate_on(0, H) @ U)
print(f'max |circuit - formula| = {np.abs(U - F).max():.6f}')`},

'qft-phase-ramp': {
  title:'The QFT of a basis state is a flat magnitude, ramping phase',
  what:'Applies the QFT circuit to $|3\\rangle$ at $n=3$, shows every amplitude has magnitude $1/\\sqrt{N}$, and reads the constant phase step between consecutive $k$.',
  try:'Use $|5\\rangle$ instead of $|3\\rangle$. Predict the new phase step before you run it.',
  out:'all magnitudes equal 1/sqrt(N) = 0.3536? True\nphase step per k, mod 2pi = 2.3562\nexpected 2 pi x/N mod 2pi = 2.3562',
  qk:`import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

n, x = 3, 3
qc = QuantumCircuit(n)
qc.h(2); qc.cp(np.pi/2, 1, 2); qc.cp(np.pi/4, 0, 2)
qc.h(1); qc.cp(np.pi/2, 0, 1)
qc.h(0); qc.swap(0, 2)

psi = Statevector.from_label(format(x, f'0{n}b')).evolve(qc).data
mags = np.round(np.abs(psi), 6)
step = round(np.angle(psi[1] * np.conj(psi[0])) % (2*np.pi), 6)
expected = round((2 * np.pi * x / 2**n) % (2*np.pi), 6)
print(f'all magnitudes equal 1/sqrt(N) = {1/np.sqrt(2**n):.4f}? {np.allclose(mags, 1/np.sqrt(2**n))}')
print(f'phase step per k, mod 2pi = {step:.4f}')
print(f'expected 2 pi x/N mod 2pi = {expected:.4f}')`,
  py:`import numpy as np

n, N, x = 3, 8, 3
j = np.arange(N).reshape(-1, 1); k = np.arange(N).reshape(1, -1)
F = np.exp(2j * np.pi * j * k / N) / np.sqrt(N)

basis = np.zeros(N); basis[x] = 1
out = F @ basis
mags = np.round(np.abs(out), 6)
step = round(np.angle(out[1] * np.conj(out[0])) % (2*np.pi), 6)
expected = round((2 * np.pi * x / N) % (2*np.pi), 6)
print(f'all magnitudes equal 1/sqrt(N) = {1/np.sqrt(N):.4f}? {np.allclose(mags, 1/np.sqrt(N))}')
print(f'phase step per k, mod 2pi = {step:.4f}')
print(f'expected 2 pi x/N mod 2pi = {expected:.4f}')`},

'qft-of-a-periodic-input': {
  title:'A periodic input transforms to spikes at multiples of $Q/r$',
  what:'Feeds the QFT an equal-weight superposition of $|0\\rangle,|4\\rangle$ at period $r=4$ on $Q=8$ and reads which output positions carry all the weight.',
  try:'Keep the period $r=4$ on a register of $Q=16$. Predict the nonzero positions before you run it.',
  out:'period r = 4, Q = 8: nonzero at k = [0, 2, 4, 6]\neach with probability 0.2500',
  qk:`import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

n, N, r = 3, 8, 4
psi_in = np.zeros(N)
for m in range(N // r): psi_in[m * r] = 1
psi_in = psi_in / np.linalg.norm(psi_in)

qc = QuantumCircuit(n)
qc.h(2); qc.cp(np.pi/2, 1, 2); qc.cp(np.pi/4, 0, 2)
qc.h(1); qc.cp(np.pi/2, 0, 1)
qc.h(0); qc.swap(0, 2)

out = Statevector(psi_in).evolve(qc).data
probs = np.round(np.abs(out)**2, 9)
nz = [k for k in range(N) if probs[k] > 1e-9]
print(f'period r = {r}, Q = {N}: nonzero at k = {nz}')
print(f'each with probability {probs[nz[0]]:.4f}')`,
  py:`import numpy as np

n, N, r = 3, 8, 4
j = np.arange(N).reshape(-1, 1); k = np.arange(N).reshape(1, -1)
F = np.exp(2j * np.pi * j * k / N) / np.sqrt(N)

psi_in = np.zeros(N)
for m in range(N // r): psi_in[m * r] = 1
psi_in = psi_in / np.linalg.norm(psi_in)

out = F @ psi_in
probs = np.round(np.abs(out)**2, 9)
nz = [k for k in range(N) if probs[k] > 1e-9]
print(f'period r = {r}, Q = {N}: nonzero at k = {nz}')
print(f'each with probability {probs[nz[0]]:.4f}')`},

/* ---- 6.5 Phase estimation ---------------------------------------------------- */

'exact-phase-read': {
  title:'A phase with an exact $t$-bit expansion reads out with certainty',
  what:'Runs phase estimation with $t=3$ counting qubits on the exact phase $\\varphi=1/4$ and reads $P(\\varphi)=1$ at the one bit string that represents it.',
  try:'Use $\\varphi=3/8$ instead. Predict the peak position before you run it.',
  out:'phi = 0.25, t = 3: peak at k = 2 (binary 010), P = 1.0000\nphi recovered = k/Q = 0.2500',
  qk:`import numpy as np
from qiskit import QuantumCircuit
from qiskit.circuit.library import QFTGate
from qiskit.quantum_info import Statevector

t, phi = 3, 1/4
Q = 2**t
qc = QuantumCircuit(t)
qc.h(range(t))
for j in range(t): qc.p(2 * np.pi * phi * 2**j, j)   # controlled-U^(2^j), folded in
qc.append(QFTGate(t).inverse(), range(t))

probs = np.round(Statevector.from_label('0'*t).evolve(qc).probabilities(), 9)
peak = int(np.argmax(probs))
print(f'phi = {phi}, t = {t}: peak at k = {peak} (binary {format(peak, f"0{t}b")}), '
      f'P = {probs[peak]:.4f}')
print(f'phi recovered = k/Q = {peak/Q:.4f}')`,
  py:`import numpy as np

t, phi = 3, 1/4
Q = 2**t
j = np.arange(Q).reshape(-1, 1); k = np.arange(Q).reshape(1, -1)
F = np.exp(2j * np.pi * j * k / Q) / np.sqrt(Q)

kk = np.arange(Q)
reg = np.exp(2j * np.pi * kk * phi) / np.sqrt(Q)
out = F.conj().T @ reg                # inverse QFT
probs = np.round(np.abs(out)**2, 9)
peak = int(np.argmax(probs))
print(f'phi = {phi}, t = {t}: peak at k = {peak} (binary {format(peak, f"0{t}b")}), '
      f'P = {probs[peak]:.4f}')
print(f'phi recovered = k/Q = {peak/Q:.4f}')`},

'halfway-phase-bounds': {
  title:'An inexact phase still lands above the worst-case bound',
  what:'Runs phase estimation with $t=4$ counting qubits on $\\varphi=0.2$, which has no exact 4-bit expansion, and checks the best readout\'s probability against the bounds $4/\\pi^{2}$ and $8/\\pi^{2}$.',
  try:'Use $\\varphi=0.3$ instead. Predict whether the best probability still exceeds $4/\\pi^{2}$.',
  out:'phi = 0.2, t = 4: best k = 3, P(best) = 0.8756\nbound 4/pi^2 = 0.4053 (delta <= 1/2)\nbound 8/pi^2 = 0.8106 (any error)\nP(best) exceeds 4/pi^2: True',
  qk:`import numpy as np
from qiskit import QuantumCircuit
from qiskit.circuit.library import QFTGate
from qiskit.quantum_info import Statevector

t, phi = 4, 0.2
Q = 2**t
qc = QuantumCircuit(t)
qc.h(range(t))
for j in range(t): qc.p(2 * np.pi * phi * 2**j, j)
qc.append(QFTGate(t).inverse(), range(t))

probs = np.round(Statevector.from_label('0'*t).evolve(qc).probabilities(), 9)
best = int(np.argmax(probs)); p_best = probs[best]
print(f'phi = {phi}, t = {t}: best k = {best}, P(best) = {p_best:.4f}')
print(f'bound 4/pi^2 = {4/np.pi**2:.4f} (delta <= 1/2)')
print(f'bound 8/pi^2 = {8/np.pi**2:.4f} (any error)')
print(f'P(best) exceeds 4/pi^2: {p_best > 4/np.pi**2}')`,
  py:`import numpy as np

t, phi = 4, 0.2
Q = 2**t
j = np.arange(Q).reshape(-1, 1); k = np.arange(Q).reshape(1, -1)
F = np.exp(2j * np.pi * j * k / Q) / np.sqrt(Q)

kk = np.arange(Q)
reg = np.exp(2j * np.pi * kk * phi) / np.sqrt(Q)
out = F.conj().T @ reg
probs = np.round(np.abs(out)**2, 9)
best = int(np.argmax(probs)); p_best = probs[best]
print(f'phi = {phi}, t = {t}: best k = {best}, P(best) = {p_best:.4f}')
print(f'bound 4/pi^2 = {4/np.pi**2:.4f} (delta <= 1/2)')
print(f'bound 8/pi^2 = {8/np.pi**2:.4f} (any error)')
print(f'P(best) exceeds 4/pi^2: {p_best > 4/np.pi**2}')`},

'counting-qubits-formula': {
  title:'The counting-qubit formula, checked against a simulated run',
  what:'Computes $t=n+\\lceil\\log_{2}(2+1/(2\\varepsilon))\\rceil$ for $n=2$ bits of accuracy and $\\varepsilon=0.1$, then checks the simulated success probability against $1-\\varepsilon$.',
  try:'Use $\\varepsilon=0.2$ instead. Predict whether $t$ grows or shrinks before you run it.',
  out:'n = 2 bits, eps = 0.1: t = 5 counting qubits, Q = 32\nP(within n-bit accuracy) = 0.9855\nrequired success >= 1 - eps = 0.9000: True',
  qk:`import numpy as np
from qiskit import QuantumCircuit
from qiskit.circuit.library import QFTGate
from qiskit.quantum_info import Statevector

n_bits, eps = 2, 0.1
t = n_bits + int(np.ceil(np.log2(2 + 1/(2*eps))))
Q, phi = 2**t, 0.35
qc = QuantumCircuit(t)
qc.h(range(t))
for j in range(t): qc.p(2 * np.pi * phi * 2**j, j)
qc.append(QFTGate(t).inverse(), range(t))
probs = np.round(Statevector.from_label('0'*t).evolve(qc).probabilities(), 9)

target = round(phi * Q); window = 2**(t - n_bits)
p_success = sum(probs[k] for k in range(Q)
                 if min(abs(k - target), Q - abs(k - target)) <= window / 2)
print(f'n = {n_bits} bits, eps = {eps}: t = {t} counting qubits, Q = {Q}')
print(f'P(within n-bit accuracy) = {p_success:.4f}')
print(f'required success >= 1 - eps = {1-eps:.4f}: {p_success >= 1-eps}')`,
  py:`import numpy as np

n_bits, eps = 2, 0.1
t = n_bits + int(np.ceil(np.log2(2 + 1/(2*eps))))
Q = 2**t
phi = 0.35

j = np.arange(Q).reshape(-1, 1); k = np.arange(Q).reshape(1, -1)
F = np.exp(2j * np.pi * j * k / Q) / np.sqrt(Q)
kk = np.arange(Q)
reg = np.exp(2j * np.pi * kk * phi) / np.sqrt(Q)
out = F.conj().T @ reg
probs = np.round(np.abs(out)**2, 9)

target = round(phi * Q); window = 2**(t - n_bits)
p_success = sum(probs[k] for k in range(Q)
                 if min(abs(k - target), Q - abs(k - target)) <= window / 2)
print(f'n = {n_bits} bits, eps = {eps}: t = {t} counting qubits, Q = {Q}')
print(f'P(within n-bit accuracy) = {p_success:.4f}')
print(f'required success >= 1 - eps = {1-eps:.4f}: {p_success >= 1-eps}')`},

/* ---- 6.6 Order finding -------------------------------------------------------- */

'order-by-brute-force': {
  title:'The order of $a$ mod $N$, found by repeated multiplication',
  what:'Finds the order $r$ of $a$ modulo $N$ at three small pairs by multiplying $a$ into a running product until it returns to 1, and confirms each $a$ is coprime to its $N$.',
  try:'Try $a=4$, $N=12$, where $\\gcd(a,N)\\ne1$. Predict what the search does before you run it.',
  out:'order of 3 mod 7 = 6, gcd(3,7) = 1\norder of 5 mod 9 = 6, gcd(5,9) = 1\norder of 7 mod 12 = 2, gcd(7,12) = 1',
  qk:`from math import gcd

def order_of(a, N):
    x = a % N
    for r in range(1, N + 1):
        if x == 1: return r
        x = (x * a) % N
    return None

for a, N in [(3, 7), (5, 9), (7, 12)]:
    print(f'order of {a} mod {N} = {order_of(a, N)}, gcd({a},{N}) = {gcd(a, N)}')`,
  py:`from math import gcd

def order_of(a, N):
    x = a % N
    for r in range(1, N + 1):
        if x == 1: return r
        x = (x * a) % N
    return None

for a, N in [(3, 7), (5, 9), (7, 12)]:
    print(f'order of {a} mod {N} = {order_of(a, N)}, gcd({a},{N}) = {gcd(a, N)}')`},

'order-finding-reading': {
  title:'The counting register peaks near multiples of $Q/r$',
  what:'Simulates order finding for $a=3$, $N=7$ (order $r=6$) by averaging the inverse-QFT readout over the $r$ possible phases $s/r$, with the work register already traced out, and reads the top readings.',
  try:'Use $a=5$, $N=9$ (order $r=6$ as well) instead. Predict whether the top readings move.',
  out:'a = 3, N = 7, order r = 6, t = 6 counting qubits, Q = 64\ntop readings k: [0, 21, 32, 53]\ntheir probabilities: [0.167, 0.1142, 0.167, 0.1142]',
  qk:`import numpy as np
from qiskit import QuantumCircuit
from qiskit.circuit.library import QFTGate
from qiskit.quantum_info import Statevector

a, N_mod, r, t = 3, 7, 6, 6
Q = 2**t
probs_sum = np.zeros(Q)
for s in range(r):
    qc = QuantumCircuit(t)
    qc.h(range(t))
    for j in range(t): qc.p(2 * np.pi * (s / r) * 2**j, j)
    qc.append(QFTGate(t).inverse(), range(t))
    probs_sum += np.round(Statevector.from_label('0'*t).evolve(qc).probabilities(), 9)
probs_avg = np.round(probs_sum / r, 9)

top = sorted(np.argsort(probs_avg)[::-1][:4].tolist())
print(f'a = {a}, N = {N_mod}, order r = {r}, t = {t} counting qubits, Q = {Q}')
print(f'top readings k: {top}')
print(f'their probabilities: {[float(round(probs_avg[k], 4)) for k in top]}')`,
  py:`import numpy as np

a, N_mod, r, t = 3, 7, 6, 6
Q = 2**t
j = np.arange(Q).reshape(-1, 1); k = np.arange(Q).reshape(1, -1)
F = np.exp(2j * np.pi * j * k / Q) / np.sqrt(Q)

probs_sum = np.zeros(Q)
for s in range(r):
    kk = np.arange(Q)
    reg = np.exp(2j * np.pi * kk * (s / r)) / np.sqrt(Q)
    probs_sum += np.round(np.abs(F.conj().T @ reg)**2, 9)
probs_avg = np.round(probs_sum / r, 9)

top = sorted(np.argsort(probs_avg)[::-1][:4].tolist())
print(f'a = {a}, N = {N_mod}, order r = {r}, t = {t} counting qubits, Q = {Q}')
print(f'top readings k: {top}')
print(f'their probabilities: {[float(round(probs_avg[k], 4)) for k in top]}')`},

'continued-fraction-candidate': {
  title:'Continued fractions turn a reading into a candidate order',
  what:'Converts two different readings $y/Q$ into a candidate order $r$ by the nearest fraction with denominator at most $N$, then checks $a^{r}\\equiv1\\pmod N$ for each.',
  try:'Try $y=32$, the other peak near $k\\cdot Q/r$ for $k=3$. Predict whether it also checks out.',
  out:'y = 21, Q = 64: candidate r = 3, a^r mod N = 6, match = False\ny = 53, Q = 64: candidate r = 6, a^r mod N = 1, match = True',
  qk:`from fractions import Fraction

def candidate_order(y, Q, N_max):
    return Fraction(y, Q).limit_denominator(N_max).denominator

a, N_mod, Q = 3, 7, 64
for y in (21, 53):
    r = candidate_order(y, Q, N_mod)
    ok = pow(a, r, N_mod) == 1
    print(f'y = {y}, Q = {Q}: candidate r = {r}, a^r mod N = {pow(a, r, N_mod)}, '
          f'match = {ok}')`,
  py:`from fractions import Fraction

def candidate_order(y, Q, N_max):
    return Fraction(y, Q).limit_denominator(N_max).denominator

a, N_mod, Q = 3, 7, 64
for y in (21, 53):
    r = candidate_order(y, Q, N_mod)
    ok = pow(a, r, N_mod) == 1
    print(f'y = {y}, Q = {Q}: candidate r = {r}, a^r mod N = {pow(a, r, N_mod)}, '
          f'match = {ok}')`},

/* ---- 6.7 Factoring ------------------------------------------------------------ */

'shor-fifteen-end-to-end': {
  title:'Factoring 15 from an order, start to finish',
  what:'Finds the order of $a=13$ modulo $N=15$, takes $\\gcd(a^{r/2}\\mp1,N)$ as the two candidate factors, and checks their product against $N$.',
  try:'Try $a=8$ instead of $a=13$. Predict the order before you run it.',
  out:'N = 15, a = 13: order r = 4\ngcd(a^(r/2)-1, N) = 3, gcd(a^(r/2)+1, N) = 5\nproduct check: 3 * 5 = 15',
  qk:`from math import gcd

def order_of(a, N):
    x = a % N
    for r in range(1, N):
        if x == 1: return r
        x = (x * a) % N
    return None

N_mod, a = 15, 13
r = order_of(a, N_mod)
p_cand = gcd(a**(r // 2) - 1, N_mod)
q_cand = gcd(a**(r // 2) + 1, N_mod)
print(f'N = {N_mod}, a = {a}: order r = {r}')
print(f'gcd(a^(r/2)-1, N) = {p_cand}, gcd(a^(r/2)+1, N) = {q_cand}')
print(f'product check: {p_cand} * {q_cand} = {p_cand * q_cand}')`,
  py:`from math import gcd

def order_of(a, N):
    x = a % N
    for r in range(1, N):
        if x == 1: return r
        x = (x * a) % N
    return None

N_mod, a = 15, 13
r = order_of(a, N_mod)
p_cand = gcd(a**(r // 2) - 1, N_mod)
q_cand = gcd(a**(r // 2) + 1, N_mod)
print(f'N = {N_mod}, a = {a}: order r = {r}')
print(f'gcd(a^(r/2)-1, N) = {p_cand}, gcd(a^(r/2)+1, N) = {q_cand}')
print(f'product check: {p_cand} * {q_cand} = {p_cand * q_cand}')`},

'shor-failure-modes': {
  title:'The two ways an order fails to give a factor',
  what:'Checks $a=4\\bmod21$, whose order is odd, and $a=14\\bmod15$, whose order is even but $a^{r/2}\\equiv-1$, and shows neither hands back a useful factor.',
  try:'Check $a=2\\bmod15$ as a third case. Predict which failure it hits before you run it.',
  out:'N = 21, a = 4: order r = 3, odd = True, a^(r/2) = -1 mod N: False, useful: False\nN = 15, a = 14: order r = 2, odd = False, a^(r/2) = -1 mod N: True, useful: False',
  qk:`def order_of(a, N):
    x = a % N
    for r in range(1, N):
        if x == 1: return r
        x = (x * a) % N
    return None

cases = [(21, 4), (15, 14)]           # odd order, then a^(r/2) = -1
for N_mod, a in cases:
    r = order_of(a, N_mod)
    odd = r % 2 == 1
    half_minus1 = (not odd) and pow(a, r // 2, N_mod) == N_mod - 1
    useful = not odd and not half_minus1
    print(f'N = {N_mod}, a = {a}: order r = {r}, odd = {odd}, '
          f'a^(r/2) = -1 mod N: {half_minus1}, useful: {useful}')`,
  py:`def order_of(a, N):
    x = a % N
    for r in range(1, N):
        if x == 1: return r
        x = (x * a) % N
    return None

cases = [(21, 4), (15, 14)]           # odd order, then a^(r/2) = -1
for N_mod, a in cases:
    r = order_of(a, N_mod)
    odd = r % 2 == 1
    half_minus1 = (not odd) and pow(a, r // 2, N_mod) == N_mod - 1
    useful = not odd and not half_minus1
    print(f'N = {N_mod}, a = {a}: order r = {r}, odd = {odd}, '
          f'a^(r/2) = -1 mod N: {half_minus1}, useful: {useful}')`},

'fraction-of-good-bases': {
  title:'Most bases coprime to 15 give a useful order',
  what:'Sweeps every $a$ coprime to $N=15$, finds its order, and counts what fraction give an even order with $a^{r/2}\\not\\equiv-1$, the condition that hands back a real factor.',
  try:'Run the same sweep for $N=21$. Predict whether the fraction rises or falls.',
  out:'N = 15: 6 of 7 coprime bases give useful factors\nfraction = 0.8571',
  qk:`from math import gcd

def order_of(a, N):
    x = a % N
    for r in range(1, N):
        if x == 1: return r
        x = (x * a) % N
    return None

N_mod = 15
good, total = 0, 0
for a in range(2, N_mod):
    if gcd(a, N_mod) != 1: continue
    total += 1
    r = order_of(a, N_mod)
    if r % 2 == 0 and pow(a, r // 2, N_mod) != N_mod - 1: good += 1

print(f'N = {N_mod}: {good} of {total} coprime bases give useful factors')
print(f'fraction = {good/total:.4f}')`,
  py:`from math import gcd

def order_of(a, N):
    x = a % N
    for r in range(1, N):
        if x == 1: return r
        x = (x * a) % N
    return None

N_mod = 15
good, total = 0, 0
for a in range(2, N_mod):
    if gcd(a, N_mod) != 1: continue
    total += 1
    r = order_of(a, N_mod)
    if r % 2 == 0 and pow(a, r // 2, N_mod) != N_mod - 1: good += 1

print(f'N = {N_mod}: {good} of {total} coprime bases give useful factors')
print(f'fraction = {good/total:.4f}')`}

};
