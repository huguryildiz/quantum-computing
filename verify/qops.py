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
