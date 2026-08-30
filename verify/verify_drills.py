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
from qops import (H, I2, KET0, KET1, KETM, KETP, X, Z,        # noqa: E402
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



# ── Module 2 ────────────────────────────────────────────────────────────────

YM = np.array([[0, -1j], [1j, 0]], dtype=complex)


def _m2_state(theta, phi):
    """The angle parameterisation, built by two rotations rather than written."""
    psi = expm(-1j * phi * np.array([[1, 0], [0, -1]], dtype=complex) / 2) @ \
        expm(-1j * theta * YM / 2) @ KET0
    return psi / np.exp(1j * np.angle(psi[0])) if abs(psi[0]) > 1e-12 else psi


def _m2_r(psi):
    Zm = np.array([[1, 0], [0, -1]], dtype=complex)
    return np.array([float(np.real(np.vdot(psi, M @ psi))) for M in (X, YM, Zm)])


def _m2_p(psi, ket):
    return abs(inner(ket, psi)) ** 2


def _m2_mean(A, psi):
    return float(np.real(np.vdot(psi, A @ psi)))


def _m2_var(A, psi):
    return _m2_mean(A @ A, psi) - _m2_mean(A, psi) ** 2


PSI_D0708 = np.array([math.sqrt(3) / 2, 0.5], dtype=complex)
H_D209 = np.array([[2, 1 - 1j], [1 + 1j, 3]], dtype=complex)
PSI_D209 = np.array([1, 1j], dtype=complex) / math.sqrt(2)


def _d205_sequence_agrees():
    """The probability that a third Z measurement agrees with the first, with an
    X measurement in between. Followed branch by branch rather than argued."""
    total = 0.0
    for mid in (KETP, KETM):
        p_mid = _m2_p(KET0, mid)
        post = mid                       # a rank-one projector leaves the basis vector
        total += p_mid * _m2_p(post, KET0)
    return total


def _d206_invert(reported, eps):
    return (reported - eps) / (1 - 2 * eps)


def _d209_probability_of_larger_eigenvalue():
    """p(4) from the projector of that eigenvalue, not from inverting the mean."""
    w, V = np.linalg.eigh(H_D209)
    k = int(np.argmax(w))
    P = np.outer(V[:, k], V[:, k].conj())
    return float(np.real(np.vdot(PSI_D209, P @ PSI_D209)))


def _d211_shifted_eigenvalue(sign):
    B = 3 * np.array([[1, 0], [0, -1]], dtype=complex) + 2 * I2
    w = np.linalg.eigvalsh(B)
    return float(w[-1] if sign > 0 else w[0])


def _d213_prob_plus(omega, t):
    H = omega * np.array([[1, 0], [0, -1]], dtype=complex) / 2
    return abs(inner(KETP, expm(-1j * H * t) @ KETP)) ** 2


def _d215_population(omega, t):
    H = omega * X / 2
    return abs(inner(KET1, expm(-1j * H * t) @ KET0)) ** 2


def _d215_pi_pulse_dev(omega):
    """U at the flip time is -iX, up to nothing at all."""
    t = math.pi / omega
    return dev(expm(-1j * (omega * X / 2) * t), -1j * X)


def _d216_population(omega_x, delta, t):
    H = (omega_x * X + delta * np.array([[1, 0], [0, -1]], dtype=complex)) / 2
    return abs(inner(KET1, expm(-1j * H * t) @ KET0)) ** 2


def _d216_ceiling(omega_x, delta):
    ts = np.linspace(0.0, 200.0, 10001)
    return max(_d216_population(omega_x, delta, float(t)) for t in ts)


def _se_probability(p, n):
    return math.sqrt(p * (1 - p) / n)


def _se_pauli(mean, n):
    return math.sqrt((1 - mean ** 2) / n)


def _shots_for(target, mean):
    return (1 - mean ** 2) / target ** 2


def _d220_meanZ(t):
    H = 2 * X / 2
    psi = expm(-1j * H * t) @ KET0
    return _m2_mean(np.array([[1, 0], [0, -1]], dtype=complex), psi)


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

    # ---- D2-01 to D2-03 ------------------------------------------------
    {"name": "D2-01 p(0)", "stated": 0.36,
     "derive": lambda: _m2_p(np.array([3, 4j], dtype=complex) / 5, KET0),
     "rtol": 1e-12},
    {"name": "D2-01 p(+) in the X basis", "stated": 0.5,
     "derive": lambda: _m2_p(np.array([3, 4j], dtype=complex) / 5, KETP),
     "rtol": 1e-12},
    {"name": "D2-01 the Bloch vector has length one", "stated": 1.0,
     "derive": lambda: float(np.linalg.norm(
         _m2_r(np.array([3, 4j], dtype=complex) / 5))), "rtol": 1e-12},
    {"name": "D2-01 <Y> for that state", "stated": 0.96,
     "derive": lambda: _m2_mean(YM, np.array([3, 4j], dtype=complex) / 5),
     "rtol": 1e-12},
    {"name": "D2-02 p(+1) at sixty degrees", "stated": 0.75,
     "derive": lambda: (1 + math.cos(math.pi / 3)) / 2, "rtol": 1e-12},
    {"name": "D2-02 a fair coin at ninety degrees", "stated": 0.5,
     "derive": lambda: (1 + math.cos(math.pi / 2)) / 2, "rtol": 1e-12},
    {"name": "D2-03 p(+) in X for |+i>", "stated": 0.5,
     "derive": lambda: _m2_p(np.array([1, 1j], dtype=complex) / math.sqrt(2),
                             KETP), "rtol": 1e-12},
    {"name": "D2-03 the Bloch vector is (0,1,0)", "stated": 1.0,
     "derive": lambda: _m2_mean(YM, np.array([1, 1j], dtype=complex) / math.sqrt(2)),
     "rtol": 1e-12},

    # ---- D2-04 to D2-06 ------------------------------------------------
    {"name": "D2-04 p(+) in the X basis", "stated": 0.9330,
     "derive": lambda: _m2_p(PSI_D0708, KETP), "rtol": 1e-4},
    {"name": "D2-04 p(-) in the X basis", "stated": 0.0670,
     "derive": lambda: _m2_p(PSI_D0708, KETM), "rtol": 1e-3},
    {"name": "D2-04 the two add to one", "stated": 1.0,
     "derive": lambda: _m2_p(PSI_D0708, KETP) + _m2_p(PSI_D0708, KETM),
     "rtol": 1e-12},
    {"name": "D2-04 a Z measurement after the + outcome", "stated": 0.5,
     "derive": lambda: _m2_p(KETP, KET0), "rtol": 1e-12},
    {"name": "D2-05 the third Z agrees with the first", "stated": 0.5,
     "derive": _d205_sequence_agrees, "rtol": 1e-12},
    {"name": "D2-06 a perfect report on |0>", "stated": 0.95,
     "derive": lambda: 1 - 0.05, "rtol": 1e-12},
    {"name": "D2-06 the corrected estimate", "stated": 0.6333,
     "derive": lambda: _d206_invert(0.62, 0.05), "rtol": 1e-3},
    {"name": "D2-06 the error amplification", "stated": 1.111,
     "derive": lambda: 1 / (1 - 2 * 0.05), "rtol": 1e-3},

    # ---- D2-07 to D2-09 ------------------------------------------------
    {"name": "D2-07 <Z>", "stated": 0.5,
     "derive": lambda: _m2_mean(np.array([[1, 0], [0, -1]], dtype=complex),
                                PSI_D0708), "rtol": 1e-12},
    {"name": "D2-07 <X>", "stated": math.sqrt(3) / 2,
     "derive": lambda: _m2_mean(X, PSI_D0708), "rtol": 1e-12},
    {"name": "D2-07 <Y>", "stated": 0.0,
     "derive": lambda: _m2_mean(YM, PSI_D0708), "atol": 1e-15},
    {"name": "D2-07 the Bloch vector has length one", "stated": 1.0,
     "derive": lambda: float(np.linalg.norm(_m2_r(PSI_D0708))), "rtol": 1e-12},
    {"name": "D2-08 Var(Z)", "stated": 0.75,
     "derive": lambda: _m2_var(np.array([[1, 0], [0, -1]], dtype=complex),
                               PSI_D0708), "rtol": 1e-12},
    {"name": "D2-08 Var(X)", "stated": 0.25,
     "derive": lambda: _m2_var(X, PSI_D0708), "rtol": 1e-12},
    {"name": "D2-08 the two variances add to one", "stated": 1.0,
     "derive": lambda: _m2_var(X, PSI_D0708)
         + _m2_var(np.array([[1, 0], [0, -1]], dtype=complex), PSI_D0708),
     "rtol": 1e-12},
    {"name": "D2-08 the bound is empty here", "stated": 0.0,
     "derive": lambda: abs(_m2_mean(YM, PSI_D0708)), "atol": 1e-15},
    {"name": "D2-09 <H>", "stated": 3.5,
     "derive": lambda: _m2_mean(H_D209, PSI_D209), "rtol": 1e-12},
    {"name": "D2-09 <H squared>", "stated": 13.5,
     "derive": lambda: _m2_mean(H_D209 @ H_D209, PSI_D209), "rtol": 1e-12},
    {"name": "D2-09 Var(H)", "stated": 1.25,
     "derive": lambda: _m2_var(H_D209, PSI_D209), "rtol": 1e-10},
    {"name": "D2-09 larger eigenvalue", "stated": 4.0,
     "derive": lambda: float(np.linalg.eigvalsh(H_D209)[-1]), "rtol": 1e-12},
    {"name": "D2-09 smaller eigenvalue", "stated": 1.0,
     "derive": lambda: float(np.linalg.eigvalsh(H_D209)[0]), "rtol": 1e-12},
    {"name": "D2-09 the probability of the larger one", "stated": 5 / 6,
     "derive": _d209_probability_of_larger_eigenvalue, "rtol": 1e-10},

    # ---- D2-10 to D2-12 ------------------------------------------------
    {"name": "D2-10 [X,Y] = 2iZ", "stated": 0.0,
     "derive": lambda: dev(X @ YM - YM @ X,
                           2j * np.array([[1, 0], [0, -1]], dtype=complex)),
     "atol": 1e-15},
    {"name": "D2-10 X and Y anticommute", "stated": 0.0,
     "derive": lambda: float(np.linalg.norm(X @ YM + YM @ X)), "atol": 1e-15},
    {"name": "D2-11 Z commutes with 3Z + 2I", "stated": 0.0,
     "derive": lambda: float(np.linalg.norm(
         Z @ (3 * Z + 2 * I2) - (3 * Z + 2 * I2) @ Z)), "atol": 1e-15},
    {"name": "D2-11 the larger eigenvalue of 3Z + 2I", "stated": 5.0,
     "derive": lambda: _d211_shifted_eigenvalue(+1), "rtol": 1e-12},
    {"name": "D2-11 the smaller one", "stated": -1.0,
     "derive": lambda: _d211_shifted_eigenvalue(-1), "rtol": 1e-12},
    {"name": "D2-12 <Y> on |+i>", "stated": 1.0,
     "derive": lambda: _m2_mean(YM, np.array([1, 1j], dtype=complex) / math.sqrt(2)),
     "rtol": 1e-12},
    {"name": "D2-12 the product of the two spreads", "stated": 1.0,
     "derive": lambda: math.sqrt(_m2_var(X, np.array([1, 1j], dtype=complex) / math.sqrt(2)))
         * math.sqrt(_m2_var(np.array([[1, 0], [0, -1]], dtype=complex),
                             np.array([1, 1j], dtype=complex) / math.sqrt(2))),
     "rtol": 1e-12},
    {"name": "D2-12 the bound is saturated", "stated": 0.0,
     "derive": lambda: abs(
         math.sqrt(_m2_var(X, np.array([1, 1j], dtype=complex) / math.sqrt(2)))
         * math.sqrt(_m2_var(np.array([[1, 0], [0, -1]], dtype=complex),
                             np.array([1, 1j], dtype=complex) / math.sqrt(2)))
         - abs(_m2_mean(YM, np.array([1, 1j], dtype=complex) / math.sqrt(2)))),
     "atol": 1e-12},

    # ---- D2-13 to D2-16 ------------------------------------------------
    {"name": "D2-13 P(+) at omega t = 0", "stated": 1.0,
     "derive": lambda: _d213_prob_plus(1.0, 0.0), "rtol": 1e-12},
    {"name": "D2-13 P(+) vanishes at omega t = pi", "stated": 0.0,
     "derive": lambda: _d213_prob_plus(1.0, math.pi), "atol": 1e-25},
    {"name": "D2-13 P(+) returns at omega t = 2 pi", "stated": 1.0,
     "derive": lambda: _d213_prob_plus(1.0, 2 * math.pi), "rtol": 1e-10},
    {"name": "D2-14 the beat period for a unit splitting", "stated": 2 * math.pi,
     "derive": lambda: 2 * math.pi / 1.0, "rtol": 1e-12},
    {"name": "D2-15 P(1) at the pi pulse", "stated": 1.0,
     "derive": lambda: _d215_population(1.0, math.pi), "rtol": 1e-10},
    {"name": "D2-15 P(1) at the half pulse", "stated": 0.5,
     "derive": lambda: _d215_population(1.0, math.pi / 2), "rtol": 1e-10},
    {"name": "D2-15 U at the pi pulse is -iX", "stated": 0.0,
     "derive": lambda: _d215_pi_pulse_dev(1.0), "atol": 1e-14},
    {"name": "D2-16 the generalised rate", "stated": math.sqrt(2),
     "derive": lambda: math.hypot(1.0, 1.0), "rtol": 1e-12},
    {"name": "D2-16 the ceiling of the population", "stated": 0.5,
     "derive": lambda: _d216_ceiling(1.0, 1.0), "rtol": 1e-4},
    {"name": "D2-16 the first time it reaches it", "stated": 2.2214,
     "derive": lambda: math.pi / math.sqrt(2), "rtol": 1e-4},
    {"name": "D2-16 a resonant pi pulse, applied detuned", "stated": 0.3166,
     "derive": lambda: _d216_population(1.0, 1.0, math.pi), "rtol": 1e-3},

    # ---- D2-17 to D2-20 ------------------------------------------------
    {"name": "D2-17 standard error at N = 10000", "stated": 0.005,
     "derive": lambda: _se_probability(0.5, 10000), "rtol": 1e-12},
    {"name": "D2-17 shots for a standard error of 0.001", "stated": 250000.0,
     "derive": lambda: 0.25 / 0.001 ** 2, "rtol": 1e-9},
    {"name": "D2-18 p(+1) for <X> = 0.8", "stated": 0.9,
     "derive": lambda: (1 + 0.8) / 2, "rtol": 1e-12},
    {"name": "D2-18 standard error at N = 1000", "stated": 0.019,
     "derive": lambda: _se_pauli(0.8, 1000), "rtol": 2e-3},
    {"name": "D2-18 shots for a standard error of 0.01", "stated": 3600.0,
     "derive": lambda: _shots_for(0.01, 0.8), "rtol": 1e-9},
    {"name": "D2-18 the two routes agree", "stated": 0.0,
     "derive": lambda: abs(_se_pauli(0.8, 1000) - 2 * _se_probability(0.9, 1000)),
     "atol": 1e-15},
    {"name": "D2-19 the x component of the Bloch vector", "stated": 0.5,
     "derive": lambda: float(_m2_r(_m2_state(math.pi / 2, math.pi / 3))[0]),
     "rtol": 1e-10},
    {"name": "D2-19 the y component", "stated": math.sqrt(3) / 2,
     "derive": lambda: float(_m2_r(_m2_state(math.pi / 2, math.pi / 3))[1]),
     "rtol": 1e-10},
    {"name": "D2-19 p(+) for an X measurement", "stated": 0.75,
     "derive": lambda: _m2_p(_m2_state(math.pi / 2, math.pi / 3), KETP),
     "rtol": 1e-10},
    {"name": "D2-19 shots for a standard error of 0.02", "stated": 1875.0,
     "derive": lambda: _shots_for(0.02, 0.5), "rtol": 1e-9},
    {"name": "D2-20 P(1) at t = pi/4 with Omega = 2", "stated": 0.5,
     "derive": lambda: _d215_population(2.0, math.pi / 4), "rtol": 1e-10},
    {"name": "D2-20 <Z> there", "stated": 0.0,
     "derive": lambda: _d220_meanZ(math.pi / 4), "atol": 1e-14},
    {"name": "D2-20 <Z> at t = 0", "stated": 1.0,
     "derive": lambda: _d220_meanZ(0.0), "rtol": 1e-12},
    {"name": "D2-20 shots for a standard error of 0.05", "stated": 400.0,
     "derive": lambda: _shots_for(0.05, 0.0), "rtol": 1e-9},
]


if __name__ == "__main__":
    main(CHECKS, "verify_drills — chapters 1 and 2, worked solutions")
