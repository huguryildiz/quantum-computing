"""Re-derives every number in the Check step of a worked solution, chapter 1.

A worked solution ends with a step that checks its own answer. That step is
where a wrong answer is most likely to survive, because a solution that
miscalculates in the middle usually miscalculates in the check as well and
agrees with itself. Each entry below reaches the same number by a route the
solution does not take.

The structure is the same as verify_scenes.py deliberately: one dict per claim,
a `derive` callable that computes it independently, and a tolerance. The two
files are separate because they answer to different sources — one to the
teaching scenes, one to the worked solutions — and a run should say which of the
two is red.

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
from qops import (H, I2, KET0, KET1, KETM, KETP, X,           # noqa: E402
                  dev, inner, outer, unitarity)

R2 = 1 / math.sqrt(2)

# ── D1-01 to D1-03: inner products ──────────────────────────────────────────

A01 = np.array([1, 1j], dtype=complex) * R2
B01 = np.array([1, 1], dtype=complex) * R2


def _d101_squared_overlap():
    """|<a|b>|^2, symbolically so that no rounding enters."""
    r = 1 / sp.sqrt(2)
    a = sp.Matrix([r, r * sp.I])
    b = sp.Matrix([r, r])
    return float(sp.Abs((a.conjugate().T * b)[0, 0]) ** 2)


def _d101_conjugate_symmetry():
    """|<a|b> - conj(<b|a>)|, which the solution claims is zero."""
    return abs(inner(A01, B01) - np.conjugate(inner(B01, A01)))


def _d102_probability(k):
    v = np.array([3, 4j], dtype=complex)
    v = v / np.linalg.norm(v)
    return abs(v[k]) ** 2


def _d103_squared_length_symbolic():
    a = sp.Matrix([1, sp.I])
    return float(sp.re(sp.simplify((a.conjugate().T * a)[0, 0])))


def _d103_without_the_conjugate():
    a = sp.Matrix([1, sp.I])
    return float(sp.Abs(sp.simplify((a.T * a)[0, 0])))


# ── D1-04, D1-05: bases ─────────────────────────────────────────────────────


def _d104_x_basis_probability(sign):
    """|<±|psi>|^2 for psi = (sqrt3/2, 1/2), by the projector rather than by
    the coefficient: <psi|P|psi> with P = |±><±|."""
    psi = np.array([math.sqrt(3) / 2, 0.5], dtype=complex)
    e = KETP if sign > 0 else KETM
    P = outer(e, e)
    return float(np.real(np.vdot(psi, P @ psi)))


def _d104_exact_value():
    """The same number in closed form, (2 + sqrt3)/4, evaluated symbolically."""
    return float((2 + sp.sqrt(3)) / 4)


def _d105_sum_over_the_x_basis():
    return abs(sum(inner(KET0, e) * inner(e, KET1) for e in (KETP, KETM)))


def _d105_same_insertion_on_zero_zero():
    return abs(sum(inner(KET0, e) * inner(e, KET0) for e in (KETP, KETM)))


# ── D1-06, D1-07: phase ─────────────────────────────────────────────────────

PSI1 = np.array([1, 1j], dtype=complex) * R2
PSI2 = np.array([1j, -1], dtype=complex) * R2
PSI3 = np.array([1, -1j], dtype=complex) * R2


def _d106_same_state_overlap():
    return abs(inner(PSI1, PSI2))


def _d106_orthogonal_overlap():
    return abs(inner(PSI1, PSI3))


def _d107_prob_after_h(phi):
    """P(0) after a Hadamard on (|0> + e^{i phi}|1>)/sqrt2, from the matrices.

    The solution reaches cos^2(phi/2) by rewriting 1 + e^{i phi} as a cosine.
    Here the gate is applied as a matrix and the amplitude is squared, so the
    trigonometric identity is being checked rather than reused.
    """
    psi = np.array([1, np.exp(1j * phi)], dtype=complex) * R2
    return abs(inner(KET0, H @ psi)) ** 2


# ── D1-08 to D1-11: operators ───────────────────────────────────────────────

P08 = outer(PSI1, PSI1)


def _d108_trace():
    return float(np.real(np.trace(P08)))


def _d108_idempotent():
    return dev(P08 @ P08, P08)


def _d108_length_of_projected_zero():
    return float(np.linalg.norm(P08 @ KET0))


A09 = np.array([[2, 1 + 1j], [1 - 1j, 3]], dtype=complex)


def _d109_commutator_entry():
    """The (0,0) entry of AX - XA, which the solution gives as 2i."""
    return float(np.imag((A09 @ X - X @ A09)[0, 0]))


def _d109_commutator_off_diagonal():
    """The (0,1) entry of AX - XA, which the solution gives as -1."""
    return float(np.real((A09 @ X - X @ A09)[0, 1]))


U10 = np.array([[1, 1], [1j, -1j]], dtype=complex) * R2


def _d110_columns_are_orthogonal():
    return abs(np.vdot(U10[:, 0], U10[:, 1]))


M11 = np.array([[1, 1], [0, 1]], dtype=complex)


def _d111_determinant():
    return float(np.real(np.linalg.det(M11)))


def _d111_length_of_image():
    return float(np.linalg.norm(M11 @ KET1))


def _d111_not_unitary():
    return unitarity(M11)


# ── D1-12 to D1-15: the spectral theorem ────────────────────────────────────

A12 = np.array([[1, -1j], [1j, 1]], dtype=complex)


def _d112_eigenvalue(k):
    return float(np.linalg.eigvalsh(A12)[k])


def _d112_trace():
    return float(np.real(np.trace(A12)))


def _d112_determinant():
    return abs(complex(np.linalg.det(A12)))


def _d113_projectors_resolve():
    w, V = np.linalg.eigh(A12)
    total = sum(np.outer(V[:, k], V[:, k].conj()) for k in range(2))
    return dev(total, I2)


def _d113_projectors_annihilate():
    w, V = np.linalg.eigh(A12)
    P = [np.outer(V[:, k], V[:, k].conj()) for k in range(2)]
    return float(np.linalg.norm(P[0] @ P[1]))


def _d113_reassembles():
    w, V = np.linalg.eigh(A12)
    rebuilt = sum(w[k] * np.outer(V[:, k], V[:, k].conj()) for k in range(2))
    return dev(rebuilt, A12)


def _d114_square():
    return dev(A12 @ A12, 2 * A12)


def _d114_root_squares_back():
    root = A12 / math.sqrt(2)
    return dev(root @ root, A12)


def _d114_exponential_at_zero():
    return dev(expm(-1j * A12 * 0.0), I2)


def _d115_exp_x_corner():
    return float(np.real(expm(X)[0, 0]))


def _d115_exp_x_determinant():
    """det exp(X) = exp(tr X) = 1, computed from the matrix rather than quoted."""
    return abs(complex(np.linalg.det(expm(X))))


def _d115_entrywise_determinant():
    wrong = np.array([[math.e ** 0, math.e ** 1], [math.e ** 1, math.e ** 0]])
    return float(np.linalg.det(wrong))


# ── D1-16 to D1-18: tensor products ─────────────────────────────────────────


def _d116_index_of_one_zero():
    return float(np.argmax(np.abs(np.kron(KET1, KET0))))


def _d116_index_the_other_way_round():
    return float(np.argmax(np.abs(np.kron(KET0, KET1))))


def _d117_alpha_first_entry():
    a = np.kron(KETP, KETM)
    return float(np.real(a[0]))


def _d117_determinant(state):
    """The 2x2 array of amplitudes, and its determinant.

    Zero exactly when the state factors, which is the claim the solution argues
    for by contradiction. The determinant is a different argument for the same
    fact and is what makes the two parts of the question one question.
    """
    return abs(complex(np.linalg.det(np.asarray(state).reshape(2, 2))))


def _d118_amplitudes():
    return math.exp(20 * math.log(2.0))


def _d118_bytes():
    return 16 * math.exp(20 * math.log(2.0))


# ── D1-19, D1-20: full-length ───────────────────────────────────────────────


def _d119_state():
    theta, phi = math.pi / 3, math.pi / 2
    Ymat = np.array([[0, -1j], [1j, 0]], dtype=complex)
    Zmat = np.array([[1, 0], [0, -1]], dtype=complex)
    # Built by two rotations rather than by writing the cosine and the sine:
    # a polar rotation about y, then the relative phase about z.
    psi = expm(-1j * phi * Zmat / 2) @ expm(-1j * theta * Ymat / 2) @ KET0
    return psi / np.exp(1j * np.angle(psi[0]))     # fix the global phase


def _d119_prob_zero():
    return abs(inner(KET0, _d119_state())) ** 2


def _d119_prob_plus():
    return abs(inner(KETP, _d119_state())) ** 2


def _d119_global_phase_changes_nothing():
    psi = _d119_state()
    turned = np.exp(1j * math.pi / 4) * psi
    return abs(abs(inner(KETP, turned)) ** 2 - abs(inner(KETP, psi)) ** 2)


G20 = np.array([[1, 1], [1, -1]], dtype=complex)


def _d120_square():
    return dev(G20 @ G20, 2 * I2)


def _d120_eigenvalue(k):
    return float(np.linalg.eigvalsh(G20)[k])


def _d120_determinant():
    return float(np.real(np.linalg.det(G20)))


def _d120_closed_form_against_expm(t):
    ghat = G20 / math.sqrt(2)
    closed = math.cos(math.sqrt(2) * t) * I2 - 1j * math.sin(math.sqrt(2) * t) * ghat
    return dev(expm(-1j * G20 * t), closed)


def _d120_quarter_turn_is_unitary():
    t = math.pi / (2 * math.sqrt(2))
    return unitarity(expm(-1j * G20 * t))


def _d120_half_turn_is_minus_identity():
    t = math.pi / math.sqrt(2)
    return dev(expm(-1j * G20 * t), -I2)


CHECKS = [
    {"name": "D1-01 squared overlap", "stated": 0.5,
     "derive": _d101_squared_overlap, "rtol": 1e-12},
    {"name": "D1-01 the two overlaps are conjugates", "stated": 0.0,
     "derive": _d101_conjugate_symmetry, "atol": 1e-15},
    {"name": "D1-02 probability of 0", "stated": 0.36,
     "derive": lambda: _d102_probability(0), "rtol": 1e-12},
    {"name": "D1-02 probability of 1", "stated": 0.64,
     "derive": lambda: _d102_probability(1), "rtol": 1e-12},
    {"name": "D1-03 <a|a> for a = (1,i)", "stated": 2.0,
     "derive": _d103_squared_length_symbolic, "rtol": 1e-12},
    {"name": "D1-03 the same sum with no conjugate", "stated": 0.0,
     "derive": _d103_without_the_conjugate, "atol": 1e-15},

    {"name": "D1-04 P(+) by the projector", "stated": 0.9330,
     "derive": lambda: _d104_x_basis_probability(+1), "rtol": 1e-4},
    {"name": "D1-04 P(-) by the projector", "stated": 0.0670,
     "derive": lambda: _d104_x_basis_probability(-1), "rtol": 1e-3},
    {"name": "D1-04 the closed form (2+sqrt3)/4", "stated": 0.9330,
     "derive": _d104_exact_value, "rtol": 1e-4},
    {"name": "D1-05 <0|1> through the X basis", "stated": 0.0,
     "derive": _d105_sum_over_the_x_basis, "atol": 1e-15},
    {"name": "D1-05 <0|0> through the X basis", "stated": 1.0,
     "derive": _d105_same_insertion_on_zero_zero, "rtol": 1e-12},

    {"name": "D1-06 the two states differing by a global phase", "stated": 1.0,
     "derive": _d106_same_state_overlap, "rtol": 1e-12},
    {"name": "D1-06 the pair differing by a relative phase", "stated": 0.0,
     "derive": _d106_orthogonal_overlap, "atol": 1e-15},
    {"name": "D1-07 P(0) after H at phi = pi/3", "stated": 0.75,
     "derive": lambda: _d107_prob_after_h(math.pi / 3), "rtol": 1e-12},
    {"name": "D1-07 P(0) after H at phi = 0", "stated": 1.0,
     "derive": lambda: _d107_prob_after_h(0.0), "rtol": 1e-12},
    {"name": "D1-07 P(0) after H at phi = pi", "stated": 0.0,
     "derive": lambda: _d107_prob_after_h(math.pi), "atol": 1e-30},

    {"name": "D1-08 trace of the projector", "stated": 1.0,
     "derive": _d108_trace, "rtol": 1e-12},
    {"name": "D1-08 the projector is idempotent", "stated": 0.0,
     "derive": _d108_idempotent, "atol": 1e-15},
    {"name": "D1-08 length of P|0>", "stated": 1 / math.sqrt(2),
     "derive": _d108_length_of_projected_zero, "rtol": 1e-12},
    {"name": "D1-09 the (0,0) entry of the commutator, imaginary part",
     "stated": 2.0, "derive": _d109_commutator_entry, "rtol": 1e-12},
    {"name": "D1-09 the (0,1) entry of the commutator", "stated": -1.0,
     "derive": _d109_commutator_off_diagonal, "rtol": 1e-12},
    {"name": "D1-10 the columns of U are orthogonal", "stated": 0.0,
     "derive": _d110_columns_are_orthogonal, "atol": 1e-15},
    {"name": "D1-11 determinant of the shear", "stated": 1.0,
     "derive": _d111_determinant, "rtol": 1e-12},
    {"name": "D1-11 length of M|1>", "stated": math.sqrt(2),
     "derive": _d111_length_of_image, "rtol": 1e-12},
    {"name": "D1-11 the shear is not unitary", "stated": math.sqrt(3),
     "derive": _d111_not_unitary, "rtol": 1e-12},

    {"name": "D1-12 larger eigenvalue", "stated": 2.0,
     "derive": lambda: _d112_eigenvalue(-1), "rtol": 1e-12},
    {"name": "D1-12 smaller eigenvalue", "stated": 0.0,
     "derive": lambda: _d112_eigenvalue(0), "atol": 1e-15},
    {"name": "D1-12 trace", "stated": 2.0, "derive": _d112_trace, "rtol": 1e-12},
    {"name": "D1-12 determinant", "stated": 0.0,
     "derive": _d112_determinant, "atol": 1e-15},
    {"name": "D1-13 the projectors resolve the identity", "stated": 0.0,
     "derive": _d113_projectors_resolve, "atol": 1e-14},
    {"name": "D1-13 the projectors annihilate each other", "stated": 0.0,
     "derive": _d113_projectors_annihilate, "atol": 1e-14},
    {"name": "D1-13 the spectral form reassembles A", "stated": 0.0,
     "derive": _d113_reassembles, "atol": 1e-14},
    {"name": "D1-14 A squared is twice A", "stated": 0.0,
     "derive": _d114_square, "atol": 1e-14},
    {"name": "D1-14 the square root squares back", "stated": 0.0,
     "derive": _d114_root_squares_back, "atol": 1e-14},
    {"name": "D1-14 the evolution at t = 0 is the identity", "stated": 0.0,
     "derive": _d114_exponential_at_zero, "atol": 1e-14},
    {"name": "D1-15 the (0,0) entry of exp(X)", "stated": 1.5431,
     "derive": _d115_exp_x_corner, "rtol": 1e-4},
    {"name": "D1-15 det exp(X)", "stated": 1.0,
     "derive": _d115_exp_x_determinant, "rtol": 1e-12},
    {"name": "D1-15 the entrywise answer's determinant", "stated": -6.389,
     "derive": _d115_entrywise_determinant, "rtol": 1e-3},

    {"name": "D1-16 the entry |1> tensor |0> occupies", "stated": 2.0,
     "derive": _d116_index_of_one_zero, "rtol": 1e-12},
    {"name": "D1-16 the entry the other convention would use", "stated": 1.0,
     "derive": _d116_index_the_other_way_round, "rtol": 1e-12},
    {"name": "D1-17 first amplitude of the product state", "stated": 0.5,
     "derive": _d117_alpha_first_entry, "rtol": 1e-12},
    {"name": "D1-17 determinant for the product state", "stated": 0.0,
     "derive": lambda: _d117_determinant([0.5, -0.5, 0.5, -0.5]), "atol": 1e-15},
    {"name": "D1-17 determinant for the entangled state", "stated": 0.5,
     "derive": lambda: _d117_determinant([R2, 0.0, 0.0, R2]), "rtol": 1e-12},
    {"name": "D1-18 amplitudes at twenty qubits", "stated": 1048576.0,
     "derive": _d118_amplitudes, "rtol": 1e-9},
    {"name": "D1-18 bytes at twenty qubits", "stated": 16777216.0,
     "derive": _d118_bytes, "rtol": 1e-9},

    {"name": "D1-19 P(0)", "stated": 0.75,
     "derive": _d119_prob_zero, "rtol": 1e-10},
    {"name": "D1-19 P(+)", "stated": 0.5,
     "derive": _d119_prob_plus, "rtol": 1e-10},
    {"name": "D1-19 a global phase changes no probability", "stated": 0.0,
     "derive": _d119_global_phase_changes_nothing, "atol": 1e-15},
    {"name": "D1-20 G squared is twice the identity", "stated": 0.0,
     "derive": _d120_square, "atol": 1e-15},
    {"name": "D1-20 larger eigenvalue", "stated": math.sqrt(2),
     "derive": lambda: _d120_eigenvalue(-1), "rtol": 1e-12},
    {"name": "D1-20 smaller eigenvalue", "stated": -math.sqrt(2),
     "derive": lambda: _d120_eigenvalue(0), "rtol": 1e-12},
    {"name": "D1-20 determinant", "stated": -2.0,
     "derive": _d120_determinant, "rtol": 1e-12},
    {"name": "D1-20 closed form against expm at t = 0.9", "stated": 0.0,
     "derive": lambda: _d120_closed_form_against_expm(0.9), "atol": 1e-14},
    {"name": "D1-20 the quarter turn is unitary", "stated": 0.0,
     "derive": _d120_quarter_turn_is_unitary, "atol": 1e-14},
    {"name": "D1-20 twice that time gives minus the identity", "stated": 0.0,
     "derive": _d120_half_turn_is_minus_identity, "atol": 1e-14},
]


if __name__ == "__main__":
    main(CHECKS, "verify_drills — chapter 1 worked solutions")
