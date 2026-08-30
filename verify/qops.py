"""The operators and states the two gates need, written from their definitions.

Nothing here is imported from the artifact and nothing here is copied out of it.
These are the standard objects of the subject, written the way a textbook writes
them, so that a check built on them is independent of the JavaScript that draws
the pages.
"""

from __future__ import annotations

import math

import numpy as np

I2 = np.eye(2, dtype=complex)
X = np.array([[0, 1], [1, 0]], dtype=complex)
Y = np.array([[0, -1j], [1j, 0]], dtype=complex)
Z = np.array([[1, 0], [0, -1]], dtype=complex)
H = np.array([[1, 1], [1, -1]], dtype=complex) / np.sqrt(2)

KET0 = np.array([1, 0], dtype=complex)
KET1 = np.array([0, 1], dtype=complex)
KETP = (KET0 + KET1) / np.sqrt(2)
KETM = (KET0 - KET1) / np.sqrt(2)


def bra(v: np.ndarray) -> np.ndarray:
    """The dual vector: conjugate, then lay on its side."""
    return np.conjugate(np.asarray(v, dtype=complex))


def inner(u: np.ndarray, v: np.ndarray) -> complex:
    """<u|v>, conjugating the first argument. This is np.vdot and not np.dot."""
    return complex(np.vdot(u, v))


def outer(u: np.ndarray, v: np.ndarray) -> np.ndarray:
    """|u><v|, an operator and not a number."""
    return np.outer(np.asarray(u, dtype=complex), bra(v))


def dev(A: np.ndarray, B: np.ndarray) -> float:
    """How far apart two matrices are, in the Frobenius norm."""
    return float(np.linalg.norm(np.asarray(A) - np.asarray(B)))


def unitarity(U: np.ndarray) -> float:
    """How far U is from unitary. Zero exactly when U is unitary."""
    U = np.asarray(U, dtype=complex)
    return dev(U.conj().T @ U, np.eye(U.shape[0], dtype=complex))


def hermiticity(A: np.ndarray) -> float:
    """How far A is from Hermitian. Zero exactly when A is Hermitian."""
    A = np.asarray(A, dtype=complex)
    return dev(A, A.conj().T)


# ---------------------------------------------------------------------------
# Chapter 3 needs a few more standard objects. Each is written from its own
# definition, in the plainest way, and none of them is the route the artifact
# takes: the partial trace below is the sum over (I (x) <j|) of the definition
# and not a reshape, and the entropy is taken from eigenvalues rather than from
# a Schmidt form read off the page.
# ---------------------------------------------------------------------------


def proj(v: np.ndarray) -> np.ndarray:
    """|v><v|, the density operator of a pure state."""
    return outer(v, v)


def purity(rho: np.ndarray) -> float:
    """Tr(rho^2)."""
    rho = np.asarray(rho, dtype=complex)
    return float(np.trace(rho @ rho).real)


def bloch(rho: np.ndarray) -> np.ndarray:
    """The three Pauli means of a one-qubit state, in the order x, y, z."""
    return np.array([np.trace(rho @ s).real for s in (X, Y, Z)], dtype=float)


def kron(*ops: np.ndarray) -> np.ndarray:
    """The tensor product, left factor most significant, matching the course's
    ordering |q_{n-1} ... q_0>."""
    out = np.array([[1]], dtype=complex)
    for o in ops:
        out = np.kron(out, np.asarray(o, dtype=complex))
    return out


def partial_trace(rho: np.ndarray, keep: int, dims=(2, 2)) -> np.ndarray:
    """Trace out the factor that is not kept, straight from the definition

        Tr_B(rho) = sum_j (I_A (x) <j|) rho (I_A (x) |j>).

    `keep` is 0 for the left (most significant) factor and 1 for the right one.
    No reshape is used anywhere, so this is independent of the coefficient
    matrix route the artifact teaches.
    """
    rho = np.asarray(rho, dtype=complex)
    dA, dB = dims
    if keep == 0:
        out = np.zeros((dA, dA), dtype=complex)
        for j in range(dB):
            M = np.zeros((dA * dB, dA), dtype=complex)   # I_A (x) |j>
            for i in range(dA):
                M[i * dB + j, i] = 1.0
            out += M.conj().T @ rho @ M
        return out
    out = np.zeros((dB, dB), dtype=complex)
    for i in range(dA):
        M = np.zeros((dA * dB, dB), dtype=complex)       # |i> (x) I_B
        for j in range(dB):
            M[i * dB + j, j] = 1.0
        out += M.conj().T @ rho @ M
    return out


def von_neumann(rho: np.ndarray, tol: float = 1e-12) -> float:
    """-Tr(rho log2 rho), in bits, from the eigenvalues."""
    lam = np.linalg.eigvalsh(np.asarray(rho, dtype=complex))
    return float(-sum(l * math.log2(l) for l in lam if l > tol))


def channel(kraus, rho: np.ndarray) -> np.ndarray:
    """sum_k K_k rho K_k^dagger, with the matrices multiplied out."""
    rho = np.asarray(rho, dtype=complex)
    return sum(K @ rho @ K.conj().T for K in kraus)


def amp_damp(gamma: float):
    """The two Kraus operators of amplitude damping, from their definition."""
    return [np.array([[1, 0], [0, math.sqrt(1 - gamma)]], dtype=complex),
            np.array([[0, math.sqrt(gamma)], [0, 0]], dtype=complex)]


def phase_flip(p: float):
    """The phase-flip channel as a pair of Kraus operators, not as a mixture."""
    return [math.sqrt(1 - p) * I2, math.sqrt(p) * Z]


def depolarise(p: float):
    """The depolarising channel, written with four Kraus operators."""
    return [math.sqrt(1 - 3 * p / 4) * I2,
            math.sqrt(p / 4) * X, math.sqrt(p / 4) * Y, math.sqrt(p / 4) * Z]


def ndotsigma(n) -> np.ndarray:
    """n . sigma for a real three-vector n."""
    n = np.asarray(n, dtype=float)
    return n[0] * X + n[1] * Y + n[2] * Z


def direction(deg: float) -> np.ndarray:
    """A unit vector at `deg` from z, in the z-x plane."""
    a = math.radians(deg)
    return np.array([math.sin(a), 0.0, math.cos(a)])


# The four Bell states, written out in the ordering |q1 q0>.
BELL_PHI_P = np.array([1, 0, 0, 1], dtype=complex) / np.sqrt(2)
BELL_PHI_M = np.array([1, 0, 0, -1], dtype=complex) / np.sqrt(2)
BELL_PSI_P = np.array([0, 1, 1, 0], dtype=complex) / np.sqrt(2)
BELL_PSI_M = np.array([0, 1, -1, 0], dtype=complex) / np.sqrt(2)


# ---------------------------------------------------------------------------
# Chapter 4 needs the standard gates and the two-qubit conventions. Everything
# below is written from a definition rather than copied from the artifact:
#
#   * `rot` is the matrix exponential itself, computed by scipy's
#     scaling-and-squaring Pade approximant, so it is an independent route to
#     the cos/sin closed form the chapter teaches.
#   * `cnot`, `cz` and `swap` are built by looping over the bit strings and
#     writing down where each basis state goes. No matrix is transcribed, so a
#     matrix printed in a scene can be checked against the Boolean rule it
#     claims to implement.
#   * `on_qubit` places a one-qubit operator on a named wire of an n-qubit
#     register under this course's ordering, |q_{n-1} ... q_0>, so the qubit
#     ordering itself is checkable rather than assumed.
# ---------------------------------------------------------------------------

from scipy.linalg import expm as _expm                        # noqa: E402

S_GATE = np.array([[1, 0], [0, 1j]], dtype=complex)
T_GATE = np.array([[1, 0], [0, np.exp(1j * math.pi / 4)]], dtype=complex)


def phase_gate(phi: float) -> np.ndarray:
    """P(phi) = diag(1, e^{i phi})."""
    return np.array([[1, 0], [0, np.exp(1j * phi)]], dtype=complex)


def rot(n, alpha: float) -> np.ndarray:
    """R_n(alpha) = exp(-i alpha n.sigma / 2), by matrix exponential.

    The chapter reaches the same operator through (n.sigma)^2 = I and a pair of
    trigonometric series. `expm` knows nothing about either, so agreeing with it
    is a real check on the closed form rather than on arithmetic.
    """
    return _expm(-0.5j * alpha * ndotsigma(n))


def rx(a: float) -> np.ndarray:
    return rot((1, 0, 0), a)


def ry(a: float) -> np.ndarray:
    return rot((0, 1, 0), a)


def rz(a: float) -> np.ndarray:
    return rot((0, 0, 1), a)


def u_gate(theta: float, phi: float, lam: float) -> np.ndarray:
    """The three-parameter gate, written out from the scene's own statement."""
    c, s = math.cos(theta / 2), math.sin(theta / 2)
    return np.array([[c, -np.exp(1j * lam) * s],
                     [np.exp(1j * phi) * s, np.exp(1j * (phi + lam)) * c]],
                    dtype=complex)


def bloch_of(psi: np.ndarray) -> np.ndarray:
    """The Bloch vector of a pure one-qubit state, from <psi|sigma_a|psi>."""
    psi = np.asarray(psi, dtype=complex)
    return np.array([np.vdot(psi, M @ psi).real for M in (X, Y, Z)], dtype=float)


def same_state(u: np.ndarray, v: np.ndarray) -> float:
    """0 when two normalised states agree up to a global phase, and nothing else.

    This is the quantity a claim like "R_z(pi/2)|+> is |+i>" is really making,
    and comparing the columns entry by entry would wrongly fail it.
    """
    return float(abs(abs(inner(u, v)) - 1.0))


# ---- the two-qubit conventions, built from the bit strings -----------------
#
# Basis order |q_1 q_0> with x = 2 q_1 + q_0, exactly as the course fixes it.
# Every gate below is assembled by asking, for each of the four inputs, which
# output bit string it becomes. Nothing is transcribed from a printed matrix.


def bits(x: int, n: int = 2):
    """The bit string of x, most significant first: x = 2 q_1 + q_0 for n = 2."""
    return tuple((x >> (n - 1 - k)) & 1 for k in range(n))


def index(b) -> int:
    """The inverse of `bits`."""
    out = 0
    for q in b:
        out = 2 * out + int(q)
    return out


def permutation(rule, n: int = 2) -> np.ndarray:
    """The unitary that sends each basis string to `rule(string)`."""
    d = 2 ** n
    M = np.zeros((d, d), dtype=complex)
    for x in range(d):
        M[index(rule(bits(x, n))), x] = 1.0
    return M


def cnot(control: int, target: int, n: int = 2) -> np.ndarray:
    """CNOT with the named wires, from |c>|t> -> |c>|c xor t>.

    `control` and `target` are qubit numbers in the course's own numbering, so
    qubit 0 is the least significant bit of the printed string.
    """
    def rule(b):
        out = list(b)
        pos = lambda q: n - 1 - q                       # noqa: E731
        out[pos(target)] ^= b[pos(control)]
        return tuple(out)
    return permutation(rule, n)


def swap_gate(n: int = 2) -> np.ndarray:
    """SWAP on two qubits, from |q1 q0> -> |q0 q1>."""
    return permutation(lambda b: (b[1], b[0]), n)


def cz_gate() -> np.ndarray:
    """CZ, from its action rather than from a written matrix: a sign on |11>."""
    M = np.eye(4, dtype=complex)
    M[index((1, 1)), index((1, 1))] = -1.0
    return M


def toffoli() -> np.ndarray:
    """|a b c> -> |a b, c xor ab>, on three qubits."""
    return permutation(lambda b: (b[0], b[1], b[2] ^ (b[0] & b[1])), 3)


def on_qubit(A: np.ndarray, q: int, n: int = 2) -> np.ndarray:
    """A acting on qubit `q` of an n-qubit register, identity elsewhere.

    Under |q_{n-1} ... q_0> the leftmost tensor factor is qubit n-1, so qubit q
    sits in slot n-1-q. Getting this wrong is the silent error of the chapter,
    which is exactly why it is written here once and used everywhere.
    """
    ops = [I2] * n
    ops[n - 1 - q] = np.asarray(A, dtype=complex)
    return kron(*ops)


def kron_state(*vs) -> np.ndarray:
    """The tensor product of state columns, left factor most significant.

    `kron` above starts from a one-by-one matrix and so returns a row when it
    is handed vectors. States are columns everywhere in this suite, so they get
    their own two lines rather than a reshape at every call site.
    """
    out = np.array([1], dtype=complex)
    for v in vs:
        out = np.kron(out, np.asarray(v, dtype=complex))
    return out


def ket(*qs) -> np.ndarray:
    """The computational basis state |q_{n-1} ... q_0>, as a column."""
    v = np.zeros(2 ** len(qs), dtype=complex)
    v[index(qs)] = 1.0
    return v


# ---- the protocols of chapter 5, built from their own definitions -----------
#
# Both are written as circuits and as operators, never as the closed forms the
# artifact reasons with. The teleportation branch is reached by applying the
# gates and projecting; the Grover state is reached by reflecting twice per
# iteration. A gate that quoted sin^2((2r+1)theta) would be checking the
# artifact's algebra against a second copy of the same algebra.


def teleport_after_alice(psi: np.ndarray) -> np.ndarray:
    """The three-qubit state after Alice's gates, from the circuit itself.

    Qubit 0 carries the unknown state, qubits 1 and 2 are the shared pair, and
    the register is |q2 q1 q0> with x = 4 q2 + 2 q1 + q0. The gates applied are
    exactly the ones the scene draws: H on q1 and CNOT from q1 to q2 to make
    the pair, then CNOT from q0 to q1 and H on q0 to rotate into the Bell
    basis. Nothing about the four branches is assumed here.
    """
    v = kron_state(KET0, KET0, np.asarray(psi, dtype=complex))
    v = on_qubit(H, 1, 3) @ v
    v = cnot(1, 2, 3) @ v
    v = cnot(0, 1, 3) @ v
    v = on_qubit(H, 0, 3) @ v
    return v


def teleport_branch(psi: np.ndarray, m0: int, m1: int):
    """Bob's normalised state in one branch, and that branch's probability.

    The projection is written out: keep the amplitudes whose q0 and q1 bits are
    the measured ones, read the two values of q2 off them, and renormalise.
    """
    v = teleport_after_alice(psi)
    k = 2 * m1 + m0
    amps = np.array([v[k], v[4 + k]], dtype=complex)
    p = float(np.vdot(amps, amps).real)
    if p < 1e-15:
        return np.zeros(2, dtype=complex), 0.0
    return amps / math.sqrt(p), p


def teleport_bob(psi: np.ndarray) -> np.ndarray:
    """Bob's density operator before the classical bits arrive.

    Taken as a partial trace of the whole three-qubit state over the two qubits
    Alice holds, so it never mentions the four branches at all.
    """
    v = teleport_after_alice(psi)
    rho = np.outer(v, np.conjugate(v))
    # Under |q2 q1 q0> the leftmost tensor factor is q2, so Bob's qubit is the
    # dimension-2 factor and Alice's pair is the dimension-4 one beside it.
    return partial_trace(rho, keep=0, dims=(2, 4))


def grover_oracle(n: int, marked) -> np.ndarray:
    """The phase oracle: a sign on every marked basis state, and nothing else."""
    d = 2 ** n
    M = np.eye(d, dtype=complex)
    for x in marked:
        M[x, x] = -1.0
    return M


def grover_diffusion(n: int) -> np.ndarray:
    """2|s><s| - I with |s> the uniform superposition, written out."""
    d = 2 ** n
    s = np.ones(d, dtype=complex) / math.sqrt(d)
    return 2 * np.outer(s, np.conjugate(s)) - np.eye(d, dtype=complex)


def grover_state(n: int, marked, iterations: int) -> np.ndarray:
    """The register after a stated number of full Grover iterations.

    Built by applying the two reflections as matrices. No angle is computed and
    no closed form is used, so the agreement with sin^2((2r+1)theta) is a
    result of this function rather than an assumption inside it.
    """
    d = 2 ** n
    v = np.ones(d, dtype=complex) / math.sqrt(d)
    G = grover_diffusion(n) @ grover_oracle(n, marked)
    for _ in range(int(iterations)):
        v = G @ v
    return v


def grover_success(n: int, marked, iterations: int) -> float:
    """The probability of reading a marked string, from the simulated state."""
    v = grover_state(n, marked, iterations)
    return float(sum(abs(v[x]) ** 2 for x in marked))


def grover_best(n: int, marked, upper: int) -> int:
    """The iteration count that maximises the simulated success probability.

    Searched by simulation up to `upper`, so the optimum this returns owes
    nothing to the formula pi/(4 theta) - 1/2 that the artifact quotes.
    """
    d = 2 ** n
    v = np.ones(d, dtype=complex) / math.sqrt(d)
    G = grover_diffusion(n) @ grover_oracle(n, marked)
    best, best_p = 0, float(sum(abs(v[x]) ** 2 for x in marked))
    for r in range(1, int(upper) + 1):
        v = G @ v
        p = float(sum(abs(v[x]) ** 2 for x in marked))
        if p > best_p:
            best, best_p = r, p
    return best
