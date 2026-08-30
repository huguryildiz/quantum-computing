"""The operators and states the two gates need, written from their definitions.

Nothing here is imported from the artifact and nothing here is copied out of it.
These are the standard objects of the subject, written the way a textbook writes
them, so that a check built on them is independent of the JavaScript that draws
the pages.
"""

from __future__ import annotations

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
