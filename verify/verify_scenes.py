"""Re-derives every number a teaching scene of chapter 1 states.

A scene that says "the eigenvalues are 0 and 2" is making a claim, and a claim
nobody re-derives is a claim nobody has checked. Each entry below names the
scene, records the number as the scene prints it, and computes the same quantity
by a route the scene does not take.

What "a different route" means here is concrete, and it is the whole value of
the file:

  * A scene that reaches an eigenvalue through the characteristic polynomial is
    checked against `numpy.linalg.eigvalsh`, which runs a similarity reduction
    and never forms that polynomial.
  * A scene that writes a matrix exponential as a sum over spectral projectors,
    or as a closed form in a cosine and a sine, is checked against
    `scipy.linalg.expm`, which uses a scaling-and-squaring Pade approximant and
    knows nothing about eigenvalues.
  * A scene that orthogonalises by hand is checked against `numpy.linalg.qr`,
    which uses Householder reflections rather than projections and subtractions.
  * A scene that computes an overlap by hand is checked symbolically with SymPy,
    which never rounds.

Copying the scene's own expression into Python and evaluating it would verify
that JavaScript and Python agree about multiplication, which was never in doubt.

Adding a check is adding a dict to CHECKS. The runner does not change.
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
from qops import (H, I2, KET0, KET1, KETM, KETP, X, Z,        # noqa: E402
                  dev, hermiticity, inner, outer, unitarity)

# ── 1.1 Vectors, dual vectors and the inner product ─────────────────────────


def _squared_length_symbolic():
    """<psi|psi> for (2+i, 1-3i), by symbolic conjugation rather than by moduli.

    The scene squares two moduli and adds. SymPy is asked instead for
    sum(z * conjugate(z)) and told to expand it, which reaches the same integer
    without ever naming a modulus.
    """
    entries = [sp.Integer(2) + sp.I, sp.Integer(1) - 3 * sp.I]
    total = sum(z * sp.conjugate(z) for z in entries)
    return complex(sp.expand(sp.simplify(total))).real


def _prob_zero_of_that_state():
    """The Born probability of 0 for the same state, from the normalised column."""
    v = np.array([2 + 1j, 1 - 3j], dtype=complex)
    v = v / np.linalg.norm(v)
    return abs(inner(KET0, v)) ** 2


def _overlap_of_the_two_circular_states():
    """<a|b> for a = (1,i)/sqrt2 and b = (1,-i)/sqrt2, symbolically."""
    r = 1 / sp.sqrt(2)
    a = sp.Matrix([r, r * sp.I])
    b = sp.Matrix([r, -r * sp.I])
    return abs(complex(sp.simplify((a.conjugate().T * b)[0, 0])))


def _same_overlap_without_the_conjugate():
    """The number the scene warns about: the same sum with no conjugation.

    Reached symbolically, so it is the definition of the wrong operation and not
    a call to the NumPy routine that performs it.
    """
    r = 1 / sp.sqrt(2)
    a = sp.Matrix([r, r * sp.I])
    b = sp.Matrix([r, -r * sp.I])
    return abs(complex(sp.simplify((a.T * b)[0, 0])))


def _overlap_along_the_family(theta):
    """|<0|psi(theta)>|^2, with psi(theta) produced by a rotation rather than
    by writing cos and sin down.

    The scene defines psi(theta) = cos(theta/2)|0> + sin(theta/2)|1>. Here the
    same state is produced as exp(-i theta Y / 2)|0>, evaluated by expm, so the
    half angle is a consequence of the exponential rather than an assumption.
    """
    Ymat = np.array([[0, -1j], [1j, 0]], dtype=complex)
    psi = expm(-1j * theta * Ymat / 2) @ KET0
    return abs(inner(KET0, psi)) ** 2


def _coefficient_of_plus_in_zero():
    """<+|0>, read off the Hadamard matrix rather than computed by hand.

    The columns of H are |+> and |->, so the first row of H is the pair of
    coefficients of |0> in that basis.
    """
    return abs(complex(H[0, 0]))


# ── 1.2 Amplitude, phase and interference ───────────────────────────────────


def _modulus_of_minus_one_plus_i():
    return float(sp.Abs(-1 + sp.I))


def _phase_of_minus_one_plus_i():
    """The argument, from atan2 rather than from the quadrant argument."""
    return float(np.angle(-1 + 1j))


def _arctan_trap():
    """What arctan(y/x) returns for the same number: the wrong quadrant."""
    return math.atan(1 / -1)


def _prob_after_hadamard(state):
    out = H @ state
    return abs(inner(KET0, out)) ** 2


# ── 1.3 Outer products and projectors ───────────────────────────────────────


def _outer_zero_one_entry():
    return float(np.real(outer(KET0, KET1)[0, 1]))


def _outer_zero_one_squared_norm():
    M = outer(KET0, KET1)
    return float(np.linalg.norm(M @ M))


def _length_of_projected_zero():
    """||P|0>|| for P = |+><+|, from the matrix rather than from <+|0>."""
    P = outer(KETP, KETP)
    return float(np.linalg.norm(P @ KET0))


def _inner_by_inserting_the_x_basis():
    """<0|1>, computed as a sum over the X basis instead of directly."""
    total = sum(inner(KET0, e) * inner(e, KET1) for e in (KETP, KETM))
    return abs(total)


# ── 1.4 Building an orthonormal basis ───────────────────────────────────────


def _gram_schmidt_second_vector_against_qr():
    """The scene's e2 for the inputs (1,1) and (1,0), against a QR factorisation.

    QR uses Householder reflections and never forms a projection, so agreement
    is a genuine second opinion. The comparison is by overlap magnitude, because
    QR fixes a sign convention the hand calculation does not.
    """
    V = np.array([[1.0, 1.0], [1.0, 0.0]])          # columns are v1 and v2
    Q, _ = np.linalg.qr(V)
    claimed = np.array([1.0, -1.0]) / np.sqrt(2)
    return abs(float(np.vdot(Q[:, 1], claimed)))


# ── 1.5 The tensor product ──────────────────────────────────────────────────


def _index_of_zero_tensor_one():
    """Which entry of |0> ⊗ |1> is non-zero."""
    return float(np.argmax(np.abs(np.kron(KET0, KET1))))


def _corner_entry_of_x_tensor_x():
    return float(np.real(np.kron(X, X)[0, 3]))


def _amplitudes_at_fifty_qubits():
    """2**50, reached through logarithms rather than by exponentiation.

    A different arithmetic route to the same integer: the scene doubles, this
    exponentiates a logarithm. It catches a transcription slip in the printed
    figure, which is the only failure it can have.
    """
    return math.exp(50 * math.log(2.0))


# ── 1.6 Hermitian and unitary operators ─────────────────────────────────────

C_HERM = np.array([[1, 1j], [-1j, 1]], dtype=complex)
ROT = np.array([[0, -1], [1, 0]], dtype=complex)
SHEAR = np.array([[1, 1], [0, 1]], dtype=complex)
U_YBASIS = np.array([[1, 1], [1j, -1j]], dtype=complex) / np.sqrt(2)


def _rotation_eigenvalue_imaginary_part():
    """The eigenvalues of a real rotation, which are off the real axis."""
    return float(np.max(np.abs(np.imag(np.linalg.eigvals(ROT)))))


def _rotation_eigenvalue_real_part():
    return float(np.max(np.abs(np.real(np.linalg.eigvals(ROT)))))


def _length_of_sheared_one():
    return float(np.linalg.norm(SHEAR @ KET1))


def _pauli_closed_form_against_expm(theta):
    """The closed form of the generator scene, against a Pade approximant.

    The scene derives exp(-i theta sigma / 2) = cos(theta/2) I - i sin(theta/2)
    sigma by splitting a power series. `expm` computes the same matrix by
    scaling and squaring and never touches that series, so the difference below
    is a real disagreement if the closed form is wrong.
    """
    closed = math.cos(theta / 2) * I2 - 1j * math.sin(theta / 2) * Z
    return dev(expm(-1j * theta * Z / 2), closed)


def _full_turn_is_minus_identity():
    """exp(-i (2 pi) Z / 2) = -I, from expm rather than from the closed form."""
    return dev(expm(-1j * (2 * math.pi) * Z / 2), -I2)


def _rz_third_of_pi_first_phase():
    """The phase of the (0,0) entry of R_z(pi/3), by expm and atan2."""
    return float(np.angle(expm(-1j * (math.pi / 3) * Z / 2)[0, 0]))


# ── 1.7 The spectral theorem and functions of an operator ───────────────────

A_SYM = np.array([[2, 1], [1, 2]], dtype=complex)
A_CIRC = np.array([[1, -1j], [1j, 1]], dtype=complex)


def _eigs(A):
    return np.linalg.eigvalsh(A)


def _spectral_reassembly(A):
    """||sum_k lambda_k P_k - A||, with the eigenpairs from eigh."""
    w, V = np.linalg.eigh(A)
    rebuilt = sum(w[k] * np.outer(V[:, k], V[:, k].conj()) for k in range(len(w)))
    return dev(rebuilt, A)


def _projectors_resolve_the_identity(A):
    w, V = np.linalg.eigh(A)
    total = sum(np.outer(V[:, k], V[:, k].conj()) for k in range(len(w)))
    return dev(total, I2)


def _square_is_twice(A):
    return dev(A @ A, 2 * A)


def _square_root_squares_back(A):
    root = A / math.sqrt(2)
    return dev(root @ root, A)


def _spectral_exponential_against_expm(A, t):
    w, V = np.linalg.eigh(A)
    spectral = sum(np.exp(-1j * w[k] * t) * np.outer(V[:, k], V[:, k].conj())
                   for k in range(len(w)))
    return dev(spectral, expm(-1j * A * t))


def _exp_of_x_corner():
    return float(np.real(expm(X)[0, 0]))


def _exp_of_x_off_diagonal():
    return float(np.real(expm(X)[0, 1]))


def _entrywise_exponential_negative_eigenvalue():
    wrong = np.array([[math.e ** 0, math.e ** 1], [math.e ** 1, math.e ** 0]])
    return float(np.min(np.linalg.eigvalsh(wrong)))


CHECKS = [
    # ---- 1.1 -----------------------------------------------------------
    {"name": "1.1.1 squared length of (2+i, 1-3i)", "stated": 15.0,
     "derive": _squared_length_symbolic, "rtol": 1e-12},
    {"name": "1.1.1 probability of outcome 0 for that state", "stated": 1 / 3,
     "derive": _prob_zero_of_that_state, "rtol": 1e-12},
    {"name": "1.1.2 overlap of (1,i)/sqrt2 with (1,-i)/sqrt2", "stated": 0.0,
     "derive": _overlap_of_the_two_circular_states, "atol": 1e-12},
    {"name": "1.1.2 the same sum with the conjugate left out", "stated": 1.0,
     "derive": _same_overlap_without_the_conjugate, "rtol": 1e-12},
    {"name": "1.1.3 squared overlap at theta = 0", "stated": 1.0,
     "derive": lambda: _overlap_along_the_family(0.0), "rtol": 1e-10},
    {"name": "1.1.3 squared overlap at theta = pi/2", "stated": 0.5,
     "derive": lambda: _overlap_along_the_family(math.pi / 2), "rtol": 1e-10},
    {"name": "1.1.3 squared overlap at theta = pi", "stated": 0.0,
     "derive": lambda: _overlap_along_the_family(math.pi), "atol": 1e-15},
    {"name": "1.1.4 coefficient of |+> in |0>", "stated": 1 / math.sqrt(2),
     "derive": _coefficient_of_plus_in_zero, "rtol": 1e-12},

    # ---- 1.2 -----------------------------------------------------------
    {"name": "1.2.1 modulus of -1+i", "stated": math.sqrt(2),
     "derive": _modulus_of_minus_one_plus_i, "rtol": 1e-12},
    {"name": "1.2.1 phase of -1+i, in radians", "stated": 3 * math.pi / 4,
     "derive": _phase_of_minus_one_plus_i, "rtol": 1e-12},
    {"name": "1.2.1 what arctan(y/x) returns instead", "stated": -math.pi / 4,
     "derive": _arctan_trap, "rtol": 1e-12},
    {"name": "1.2.2 P(0) after a Hadamard on |+>", "stated": 1.0,
     "derive": lambda: _prob_after_hadamard(KETP), "rtol": 1e-12},
    {"name": "1.2.2 P(0) after a Hadamard on |->", "stated": 0.0,
     "derive": lambda: _prob_after_hadamard(KETM), "atol": 1e-30},

    # ---- 1.3 -----------------------------------------------------------
    {"name": "1.3.1 the (0,1) entry of |0><1|", "stated": 1.0,
     "derive": _outer_zero_one_entry, "rtol": 1e-12},
    {"name": "1.3.1 the norm of (|0><1|) squared", "stated": 0.0,
     "derive": _outer_zero_one_squared_norm, "atol": 1e-15},
    {"name": "1.3.2 length of P|0> for P = |+><+|", "stated": 1 / math.sqrt(2),
     "derive": _length_of_projected_zero, "rtol": 1e-12},
    {"name": "1.3.3 <0|1> by inserting the X basis", "stated": 0.0,
     "derive": _inner_by_inserting_the_x_basis, "atol": 1e-15},

    # ---- 1.4 -----------------------------------------------------------
    {"name": "1.4.1 Gram-Schmidt's second vector, against QR", "stated": 1.0,
     "derive": _gram_schmidt_second_vector_against_qr, "rtol": 1e-12},

    # ---- 1.5 -----------------------------------------------------------
    {"name": "1.5.1 the entry |0> tensor |1> occupies", "stated": 1.0,
     "derive": _index_of_zero_tensor_one, "rtol": 1e-12},
    {"name": "1.5.1 the (0,3) entry of X tensor X", "stated": 1.0,
     "derive": _corner_entry_of_x_tensor_x, "rtol": 1e-12},
    # The scene quotes this to three significant figures, so half a unit in the
    # last of them is the tolerance the printed value actually carries.
    {"name": "1.5.2 amplitudes at fifty qubits", "stated": 1.13e15,
     "derive": _amplitudes_at_fifty_qubits, "rtol": 5e-3},

    # ---- 1.6 -----------------------------------------------------------
    {"name": "1.6.1 [[1,i],[-i,1]] is Hermitian", "stated": 0.0,
     "derive": lambda: hermiticity(C_HERM), "atol": 1e-15},
    {"name": "1.6.2 its larger eigenvalue", "stated": 2.0,
     "derive": lambda: float(_eigs(C_HERM)[-1]), "rtol": 1e-12},
    {"name": "1.6.2 its smaller eigenvalue", "stated": 0.0,
     "derive": lambda: float(_eigs(C_HERM)[0]), "atol": 1e-15},
    {"name": "1.6.2 the rotation's eigenvalues are off the real axis",
     "stated": 1.0, "derive": _rotation_eigenvalue_imaginary_part, "rtol": 1e-12},
    {"name": "1.6.2 and have no real part", "stated": 0.0,
     "derive": _rotation_eigenvalue_real_part, "atol": 1e-15},
    {"name": "1.6.3 the Hadamard is unitary", "stated": 0.0,
     "derive": lambda: unitarity(H), "atol": 1e-15},
    {"name": "1.6.3 the Hadamard is its own inverse", "stated": 0.0,
     "derive": lambda: dev(H @ H, I2), "atol": 1e-15},
    {"name": "1.6.3 (1/sqrt2)[[1,1],[i,-i]] is unitary", "stated": 0.0,
     "derive": lambda: unitarity(U_YBASIS), "atol": 1e-15},
    {"name": "1.6.3 the shear is not, and stretches |1>",
     "stated": math.sqrt(2), "derive": _length_of_sheared_one, "rtol": 1e-12},
    {"name": "1.6.4 closed form against expm, theta = pi/3", "stated": 0.0,
     "derive": lambda: _pauli_closed_form_against_expm(math.pi / 3), "atol": 1e-14},
    {"name": "1.6.4 closed form against expm, theta = 2.4", "stated": 0.0,
     "derive": lambda: _pauli_closed_form_against_expm(2.4), "atol": 1e-14},
    {"name": "1.6.5 a full turn gives minus the identity", "stated": 0.0,
     "derive": _full_turn_is_minus_identity, "atol": 1e-14},
    {"name": "1.6.5 the first phase of R_z(pi/3)", "stated": -math.pi / 6,
     "derive": _rz_third_of_pi_first_phase, "rtol": 1e-12},

    # ---- 1.7 -----------------------------------------------------------
    {"name": "1.7.1 larger eigenvalue of [[2,1],[1,2]]", "stated": 3.0,
     "derive": lambda: float(_eigs(A_SYM)[-1]), "rtol": 1e-12},
    {"name": "1.7.1 smaller eigenvalue of [[2,1],[1,2]]", "stated": 1.0,
     "derive": lambda: float(_eigs(A_SYM)[0]), "rtol": 1e-12},
    {"name": "1.7.2 spectral form reassembles [[2,1],[1,2]]", "stated": 0.0,
     "derive": lambda: _spectral_reassembly(A_SYM), "atol": 1e-14},
    {"name": "1.7.2 its projectors resolve the identity", "stated": 0.0,
     "derive": lambda: _projectors_resolve_the_identity(A_SYM), "atol": 1e-14},
    {"name": "1.7.3 A squared is twice A for [[1,-i],[i,1]]", "stated": 0.0,
     "derive": lambda: _square_is_twice(A_CIRC), "atol": 1e-14},
    {"name": "1.7.3 A/sqrt2 squares back to A", "stated": 0.0,
     "derive": lambda: _square_root_squares_back(A_CIRC), "atol": 1e-14},
    {"name": "1.7.3 spectral exponential against expm, t = 0.7", "stated": 0.0,
     "derive": lambda: _spectral_exponential_against_expm(A_CIRC, 0.7), "atol": 1e-13},
    {"name": "1.7.3 the (0,0) entry of exp(X)", "stated": 1.5431,
     "derive": _exp_of_x_corner, "rtol": 1e-4},
    {"name": "1.7.3 the (0,1) entry of exp(X)", "stated": 1.1752,
     "derive": _exp_of_x_off_diagonal, "rtol": 1e-4},
    {"name": "1.7.3 the entrywise answer has a negative eigenvalue",
     "stated": -1.7183, "derive": _entrywise_exponential_negative_eigenvalue,
     "rtol": 1e-4},
]


if __name__ == "__main__":
    main(CHECKS, "verify_scenes — chapter 1 teaching scenes")
