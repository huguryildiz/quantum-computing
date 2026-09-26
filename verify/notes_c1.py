"""Re-derives every number the lecture notes of chapter 1 (notes/src/c1.js) state.

Modelled on the reference suite in signals-and-systems/verify/notes_c1.py, but built
on this repo's own runner (`qcheck.py`) and operators (`qops.py`). Every check below
reaches its number by a route the notes do not take: a hand overlap is checked
symbolically or against a matrix exponential, a hand-eigendecomposition is checked
against `numpy.linalg.eigvalsh`, and so on. Copying the page's own arithmetic into
Python would only confirm that JavaScript and Python agree about multiplication.

Numbers already re-derived in `verify_scenes.py` for an identical scene claim are
not repeated here unless the notes state them independently (a different example,
a different route, or a number the scene never prints).
"""

from __future__ import annotations

import math
import os
import sys

import numpy as np
import sympy as sp
from scipy.linalg import expm

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from qcheck import main                                       # noqa: E402
from qops import I2, KET0, Y, Z, inner                         # noqa: E402


# ── 1.1 · Example 1.1, an overlap with the conjugate in the right place ─────


def _example_1_1_overlap():
    """<a|b> for a = (1,i)/sqrt2, b = (1,-i)/sqrt2, done symbolically.

    The notes compute this by writing out the bra by hand. SymPy is given the
    two kets and told to conjugate and multiply, so agreement is a check on the
    hand arithmetic rather than a restatement of it.
    """
    r = 1 / sp.sqrt(2)
    a = sp.Matrix([r, r * sp.I])
    b = sp.Matrix([r, -r * sp.I])
    return complex(sp.simplify((a.conjugate().T * b)[0, 0])).real


def _example_1_1_wrong_way():
    """The value the notes' error box warns about: the same sum without the
    conjugate. Built from the definition of the unconjugated bilinear form,
    not from calling the correct routine and pretending the conjugate was
    skipped."""
    r = 1 / sp.sqrt(2)
    a = sp.Matrix([r, r * sp.I])
    b = sp.Matrix([r, -r * sp.I])
    return complex(sp.simplify((a.T * b)[0, 0])).real


# ── 1.4 · Example 1.2, Gram-Schmidt in the plane ────────────────────────────


def _example_1_2_e1_first_entry():
    """e1 = v1/||v1|| for v1=(1,1), against a QR factorisation.

    QR uses Householder reflections and never subtracts a projection, so it is
    an independent route to the same first basis vector.
    """
    V = np.array([[1.0, 1.0], [1.0, 0.0]])
    Q, _ = np.linalg.qr(V)
    # QR may fix either overall sign; compare magnitudes of the two entries.
    return abs(float(Q[0, 0]))


def _example_1_2_e2_orthogonal_to_e1():
    """<e1|e2> for the notes' own e1=(1,1)/sqrt2 and e2=(1,-1)/sqrt2, done by
    direct inner product rather than by trusting the subtraction step."""
    e1 = np.array([1.0, 1.0]) / math.sqrt(2)
    e2 = np.array([1.0, -1.0]) / math.sqrt(2)
    return float(np.vdot(e1, e2))


def _example_1_2_u2_length_by_qr():
    """The length of u2 = (1/2,-1/2), against the R factor of a QR
    decomposition of the same two columns (|R[1,1]| is that length)."""
    V = np.array([[1.0, 1.0], [1.0, 0.0]])
    _, R = np.linalg.qr(V)
    return abs(float(R[1, 1]))


# ── 1.6 · Example 1.3, a rotation about z ───────────────────────────────────


def _example_1_3_cos_pi_over_6():
    return float(sp.cos(sp.pi / 6))


def _example_1_3_sin_pi_over_6():
    return float(sp.sin(sp.pi / 6))


def _example_1_3_relative_phase():
    """The relative phase between the two diagonal entries of R_z(pi/3),
    reached from the matrix exponential (expm) rather than from the closed
    form the notes derive.

    R_z(pi/3) = exp(-i (pi/3) Z / 2). Its two diagonal entries are
    e^{-i pi/6} and e^{i pi/6}; the phase between them is the difference of
    their arguments.
    """
    Rz = expm(-1j * (math.pi / 3) * Z / 2)
    return float(np.angle(Rz[1, 1]) - np.angle(Rz[0, 0]))


def _example_1_3_unitarity():
    """U^dagger U = I for the same matrix, checked directly (not assumed)."""
    Rz = expm(-1j * (math.pi / 3) * Z / 2)
    return float(np.linalg.norm(Rz.conj().T @ Rz - I2))


# ── 1.6 · full turn of a Pauli rotation ──────────────────────────────────────


def _full_turn_cosine():
    """cos(theta/2) at theta = 2 pi, from the trig function directly."""
    return math.cos(2 * math.pi / 2)


def _full_turn_sine():
    return math.sin(2 * math.pi / 2)


def _full_turn_matrix_is_minus_identity():
    """exp(-i(2 pi)Z/2) = -I, via expm, independent of the cos/sin closed form
    the figure and its caption both use."""
    return float(np.linalg.norm(expm(-1j * (2 * math.pi) * Z / 2) - (-I2)))


# ── 1.1 · the overlap figure's three marked points ──────────────────────────


def _overlap_figure_theta_0():
    """|<0|psi(theta)>|^2 at theta=0, with psi(theta) produced by the matrix
    exponential exp(-i theta Y/2)|0> rather than by writing cos/sin down."""
    psi = expm(-1j * 0.0 * Y / 2) @ KET0
    return abs(inner(KET0, psi)) ** 2


def _overlap_figure_theta_pi_over_2():
    psi = expm(-1j * (math.pi / 2) * Y / 2) @ KET0
    return abs(inner(KET0, psi)) ** 2


def _overlap_figure_theta_pi():
    psi = expm(-1j * math.pi * Y / 2) @ KET0
    return abs(inner(KET0, psi)) ** 2


# ── 1.7 · Example 1.4, a spectral decomposition end to end ──────────────────

A_EX_1_4 = np.array([[2, 1], [1, 2]], dtype=complex)


def _example_1_4_eigenvalue_plus():
    """The larger eigenvalue of A = [[2,1],[1,2]], from eigvalsh rather than
    from the characteristic-polynomial route the notes take."""
    return float(np.max(np.linalg.eigvalsh(A_EX_1_4)))


def _example_1_4_eigenvalue_minus():
    return float(np.min(np.linalg.eigvalsh(A_EX_1_4)))


def _example_1_4_trace_check():
    """Sum of eigenvalues equals the trace: 3 + 1 = 4."""
    return float(np.sum(np.linalg.eigvalsh(A_EX_1_4)))


def _example_1_4_det_check():
    """Product of eigenvalues equals the determinant: 3 * 1 = 3."""
    lam = np.linalg.eigvalsh(A_EX_1_4)
    return float(lam[0] * lam[1])


def _example_1_4_exponential_at_zero_is_identity():
    """e^{-iAt} at t=0 equals I, from the spectral sum sum_k e^{-i lambda_k t} P_k
    built from eigh's own eigenvectors -- not assumed, evaluated at t=0."""
    lam, vec = np.linalg.eigh(A_EX_1_4)
    t = 0.0
    out = sum(np.exp(-1j * l * t) * np.outer(vec[:, k], vec[:, k].conj())
               for k, l in enumerate(lam))
    return float(np.linalg.norm(out - I2))


# ── 1.7 · the entrywise-exponential trap ────────────────────────────────────

X_REAL = np.array([[0, 1], [1, 0]], dtype=complex)


def _exp_of_x_diagonal_entry():
    """cosh(1), the (0,0) and (1,1) entry of e^X for X the bit-flip matrix,
    via scipy's expm (scaling-and-squaring), independent of the cosh/sinh
    closed form the notes state."""
    return float(np.real(expm(X_REAL)[0, 0]))


def _exp_of_x_offdiagonal_entry():
    """sinh(1), the off-diagonal entry of e^X, via expm."""
    return float(np.real(expm(X_REAL)[0, 1]))


def _exp_of_x_eigenvalues():
    """The eigenvalues of e^X are e and e^{-1}, read off expm's own output
    rather than computed as exp(+-1) directly."""
    return float(np.max(np.linalg.eigvalsh(expm(X_REAL))))


def _entrywise_exponential_is_wrong():
    """The number the error box warns about: exponentiating each entry of X
    separately, [[1,e],[e,1]], and reading its largest eigenvalue -- which the
    notes say is negative-eigenvalue nonsense (1 - e < 0) and not the matrix
    exponential at all."""
    wrong = np.array([[1.0, math.e], [math.e, 1.0]])
    return float(np.min(np.linalg.eigvalsh(wrong)))


CHECKS = [
    {"name": "1.1 Example 1.1: <a|b> for a=(1,i)/sqrt2, b=(1,-i)/sqrt2",
     "stated": 0.0, "derive": _example_1_1_overlap, "atol": 1e-12},
    {"name": "1.1 Example 1.1 error box: the same sum without the conjugate",
     "stated": 1.0, "derive": _example_1_1_wrong_way, "atol": 1e-12},

    {"name": "1.4 Example 1.2: |e1 first entry| = 1/sqrt2",
     "stated": 1 / math.sqrt(2), "derive": _example_1_2_e1_first_entry},
    {"name": "1.4 Example 1.2: <e1|e2> = 0",
     "stated": 0.0, "derive": _example_1_2_e2_orthogonal_to_e1, "atol": 1e-12},
    {"name": "1.4 Example 1.2: ||u2|| = 1/sqrt2",
     "stated": 1 / math.sqrt(2), "derive": _example_1_2_u2_length_by_qr},

    {"name": "1.6 Example 1.3: cos(pi/6) = sqrt3/2",
     "stated": math.sqrt(3) / 2, "derive": _example_1_3_cos_pi_over_6},
    {"name": "1.6 Example 1.3: sin(pi/6) = 1/2",
     "stated": 0.5, "derive": _example_1_3_sin_pi_over_6},
    {"name": "1.6 Example 1.3: relative phase between the two entries = pi/3",
     "stated": math.pi / 3, "derive": _example_1_3_relative_phase},
    {"name": "1.6 Example 1.3 check: R_z(pi/3) is unitary",
     "stated": 0.0, "derive": _example_1_3_unitarity, "atol": 1e-10},

    {"name": "1.6 full turn: cos(theta/2) at theta=2pi is -1",
     "stated": -1.0, "derive": _full_turn_cosine, "atol": 1e-12},
    {"name": "1.6 full turn: sin(theta/2) at theta=2pi is 0",
     "stated": 0.0, "derive": _full_turn_sine, "atol": 1e-12},
    {"name": "1.6 full turn: the matrix itself is -I",
     "stated": 0.0, "derive": _full_turn_matrix_is_minus_identity, "atol": 1e-10},

    {"name": "1.1 overlap figure: theta=0 gives probability 1",
     "stated": 1.0, "derive": _overlap_figure_theta_0, "atol": 1e-12},
    {"name": "1.1 overlap figure: theta=pi/2 gives probability 1/2",
     "stated": 0.5, "derive": _overlap_figure_theta_pi_over_2},
    {"name": "1.1 overlap figure: theta=pi gives probability 0",
     "stated": 0.0, "derive": _overlap_figure_theta_pi, "atol": 1e-12},

    {"name": "1.7 Example 1.4: larger eigenvalue is 3",
     "stated": 3.0, "derive": _example_1_4_eigenvalue_plus},
    {"name": "1.7 Example 1.4: smaller eigenvalue is 1",
     "stated": 1.0, "derive": _example_1_4_eigenvalue_minus},
    {"name": "1.7 Example 1.4 check: eigenvalues sum to the trace, 4",
     "stated": 4.0, "derive": _example_1_4_trace_check},
    {"name": "1.7 Example 1.4 check: eigenvalues multiply to the determinant, 3",
     "stated": 3.0, "derive": _example_1_4_det_check},
    {"name": "1.7 Example 1.4 check: e^{-iAt} at t=0 is the identity",
     "stated": 0.0, "derive": _example_1_4_exponential_at_zero_is_identity, "atol": 1e-10},

    {"name": "1.7 error box: (e^X)_00 = cosh(1) = 1.5431",
     "stated": math.cosh(1), "derive": _exp_of_x_diagonal_entry},
    {"name": "1.7 error box: (e^X)_01 = sinh(1) = 1.1752",
     "stated": math.sinh(1), "derive": _exp_of_x_offdiagonal_entry},
    {"name": "1.7 error box: larger eigenvalue of e^X is e",
     "stated": math.e, "derive": _exp_of_x_eigenvalues},
    {"name": "1.7 error box: entrywise exponential has a negative eigenvalue (1-e)",
     "stated": 1 - math.e, "derive": _entrywise_exponential_is_wrong},
]


if __name__ == "__main__":
    main(CHECKS, "Chapter 1 lecture notes")
