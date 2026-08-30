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
from qops import (BELL_PHI_M, BELL_PHI_P, BELL_PSI_M, H, I2,  # noqa: E402
                  KET0, KET1, KETM, KETP, S_GATE, T_GATE, X, Y, Z,
                  amp_damp, bloch, bloch_of, channel, cnot, cz_gate, dev,
                  direction, inner, ket, kron, kron_state, ndotsigma,
                  on_qubit, outer, partial_trace, phase_flip, phase_gate,
                  proj, purity, rot, rx, ry, rz, same_state, swap_gate,
                  u_gate, unitarity, von_neumann)

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



# ── chapter 3 · mixed states and entanglement ───────────────────────────────
#
# The solutions apply a channel by its two entry rules, read a reduced state
# off a block structure, and assemble a CHSH value from cosines. None of those
# is the route below: channels are Kraus matrices multiplied out, reduced
# states come from the sum over (I (x) <j|) of the definition, and correlations
# are traces of four-by-four operators against the state.

_D3_MIX01 = 0.25 * proj(KET0) + 0.75 * proj(KETP)          # D3-01
_D3_M1 = np.array([[0.6, 0.4], [0.4, 0.4]], dtype=complex)  # D3-02
_D3_M2 = np.array([[0.5, 0.6j], [-0.6j, 0.5]], dtype=complex)
_D3_RETUNE = 0.75 * proj(KETP) + 0.25 * proj(KETM)          # D3-03
_D3_RHO04 = np.array([[0.7, 0.2j], [-0.2j, 0.3]], dtype=complex)
_D3_DIAG = 0.75 * proj(KET0) + 0.25 * proj(KET1)            # D3-05


def _d3_mean(rho, A):
    return float(np.trace(np.asarray(rho) @ np.asarray(A)).real)


def _d3_eig(M):
    return np.linalg.eigvalsh(np.asarray(M, dtype=complex))


def _d3_p_along(rho, deg):
    """p(+1) for a measurement along `deg` from z, from the projector itself
    rather than from the (1 + n.r)/2 shortcut the solution uses."""
    P = 0.5 * (I2 + ndotsigma(direction(deg)))
    return _d3_mean(rho, P)


def _d3_damped(gamma):
    return channel(amp_damp(gamma), proj(KETP))


def _d3_damp_purity_min():
    """The smallest purity |+> reaches under damping, found by sampling rather
    than by differentiating the closed form the solution writes down."""
    return min(purity(_d3_damped(float(g))) for g in np.linspace(0.0, 1.0, 100001))


def _d3_damp_argmin():
    gs = np.linspace(0.0, 1.0, 100001)
    return float(gs[int(np.argmin([purity(_d3_damped(float(g))) for g in gs]))])


def _d3_dephased(p):
    return channel(phase_flip(p), proj(KETP))


def _d3_t2(t1, tphi):
    return 1.0 / (1.0 / (2.0 * t1) + 1.0 / tphi)


def _d3_tphi(t1, t2):
    return 1.0 / (1.0 / t2 - 1.0 / (2.0 * t1))


_D3_LOPSIDED = np.array([math.sqrt(3) / 2, 0, 0, 0.5], dtype=complex)   # D3-10
_D3_SIGNFLIP = np.array([1, 1, 1, -1], dtype=complex) / 2               # D3-11
_D3_SVDSTATE = np.array([1, 1, 2, 0], dtype=complex) / math.sqrt(6)     # D3-14


def _d3_reduced(psi, keep=0):
    return partial_trace(proj(np.asarray(psi, dtype=complex)), keep)


def _d3_det(psi):
    c = np.asarray(psi, dtype=complex)
    return abs(c[0] * c[3] - c[1] * c[2])


def _d3_family(theta_deg):
    t = math.radians(theta_deg)
    return np.array([math.cos(t), 0, 0, math.sin(t)], dtype=complex)


def _d3_corr(rho, a_deg, b_deg):
    M = kron(ndotsigma(direction(a_deg)), ndotsigma(direction(b_deg)))
    return float(np.trace(np.asarray(rho) @ M).real)


def _d3_chsh(rho, a0, a1, b0, b1):
    return (_d3_corr(rho, a0, b0) + _d3_corr(rho, a0, b1)
            + _d3_corr(rho, a1, b0) - _d3_corr(rho, a1, b1))


def _d3_dephased_pair(p):
    """The Bell pair with the phase-flip channel applied to the second qubit
    only, built as a Kraus map on the four-dimensional space."""
    ks = [np.kron(I2, K) for K in phase_flip(p)]
    return channel(ks, proj(BELL_PHI_P))


def _d3_chsh_threshold():
    """The largest dephasing that still violates, found by bisection on the
    simulated state rather than from the algebra the solution does."""
    lo, hi = 0.0, 0.5
    for _ in range(200):
        mid = 0.5 * (lo + hi)
        if _d3_chsh(_d3_dephased_pair(mid), 0.0, 90.0, 45.0, -45.0) > 2.0:
            lo = mid
        else:
            hi = mid
    return 0.5 * (lo + hi)


def _d3_idle_pplus(t, t2):
    """p(+) for |+> after idling, from a dephasing channel of the matching
    strength rather than from the exponential written in the solution."""
    p = 0.5 * (1 - math.exp(-t / t2))
    rho = channel(phase_flip(p), proj(KETP))
    return _d3_mean(rho, proj(KETP))


def _d3_shots_for(target_two_se, p):
    return p * (1 - p) / (target_two_se / 2.0) ** 2


# ── Chapter 4 worked solutions ──────────────────────────────────────────────
#
# The independent routes are the same three as in verify_scenes: the matrix
# exponential for a rotation, a bit-string loop for a two-qubit gate, and
# comparison up to a global phase for a claim that two states are the same.
# Two of the questions -- D4-13 and D4-14 -- exist entirely to test the qubit
# ordering, so their checks are written against `on_qubit` and `cnot`, which
# take the wire number rather than a tensor slot.

DEG = math.radians


def _d4_state(theta_deg, phi_deg):
    t, p = DEG(theta_deg), DEG(phi_deg)
    return math.cos(t / 2) * KET0 + np.exp(1j * p) * math.sin(t / 2) * KET1


def _d4_bloch(theta_deg, phi_deg):
    return bloch_of(_d4_state(theta_deg, phi_deg))


def _d4_overlap(a, b):
    return 0.5 * (1.0 + float(np.dot(a, b)))


def _d4_shots_for(tol, p):
    """The shots that put two standard errors at +/- tol."""
    se = tol / 2.0
    return p * (1.0 - p) / se ** 2


def _d4_controlled(U):
    """Control on q0, target on q1, built from the branch rule."""
    M = np.zeros((4, 4), dtype=complex)
    for x in range(4):
        q1, q0 = (x >> 1) & 1, x & 1
        if q0 == 0:
            M[x, x] = 1.0
        else:
            for q1p in range(2):
                M[2 * q1p + 1, x] = U[q1p, q1]
    return M


def _d4_13_state():
    return np.array([1, 1, 1, 0], dtype=complex) / math.sqrt(3)


def _d4_14_state():
    return np.array([1, 0, 1, 0], dtype=complex) / math.sqrt(2)


def _d4_entropy_of(psi):
    return von_neumann(partial_trace(proj(psi), keep=0))


def _d4_17_output(theta_deg):
    return cnot(0, 1) @ (on_qubit(ry(DEG(theta_deg)), 0) @ ket(0, 0))


def _d4_20_output():
    """H on q0, then CNOT from q0 to q1, then Z on q1."""
    psi = ket(0, 0)
    psi = on_qubit(H, 0) @ psi
    psi = cnot(0, 1) @ psi
    return on_qubit(Z, 1) @ psi


def _d4_corr(psi, A, B):
    """<A (x) B> on a two-qubit state, with A on q1 and B on q0."""
    return float(np.real(np.vdot(psi, kron(A, B) @ psi)))


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

    # ---- D3-01 to D3-03 · building and testing a density operator -------
    {"name": "D3-01 the 00 entry of the mixture", "stated": 0.625,
     "derive": lambda: float(_D3_MIX01[0, 0].real), "rtol": 1e-12},
    {"name": "D3-01 its coherence", "stated": 0.375,
     "derive": lambda: float(_D3_MIX01[0, 1].real), "rtol": 1e-12},
    {"name": "D3-01 its determinant", "stated": 0.09375,
     "derive": lambda: float(np.linalg.det(_D3_MIX01).real), "rtol": 1e-10},
    {"name": "D3-01 its purity", "stated": 0.8125,
     "derive": lambda: purity(_D3_MIX01), "rtol": 1e-12},
    {"name": "D3-01 the squared length of its Bloch vector", "stated": 0.625,
     "derive": lambda: float(np.linalg.norm(bloch(_D3_MIX01))) ** 2, "rtol": 1e-12},
    {"name": "D3-02 M1 is a state", "stated": 0.0,
     "derive": lambda: min(0.0, float(_d3_eig(_D3_M1)[0])), "atol": 1e-15},
    {"name": "D3-02 M2 has a negative eigenvalue", "stated": -0.1,
     "derive": lambda: float(_d3_eig(_D3_M2)[0]), "rtol": 1e-12},
    {"name": "D3-02 M3 does not have trace one", "stated": 1.1,
     "derive": lambda: float(np.trace(
         np.array([[0.5, 0.3], [0.3, 0.6]], dtype=complex)).real), "rtol": 1e-12},
    {"name": "D3-02 the larger eigenvalue of M1", "stated": 0.9123,
     "derive": lambda: float(_d3_eig(_D3_M1)[1]), "rtol": 1e-4},
    {"name": "D3-02 the smaller eigenvalue of M1", "stated": 0.0877,
     "derive": lambda: float(_d3_eig(_D3_M1)[0]), "rtol": 1e-3},
    {"name": "D3-02 the purity of M1", "stated": 0.84,
     "derive": lambda: purity(_D3_M1), "rtol": 1e-12},
    {"name": "D3-03 both devices give I/2", "stated": 0.0,
     "derive": lambda: dev(0.5 * proj(KETP) + 0.5 * proj(KETM),
                           0.5 * proj(KET0) + 0.5 * proj(KET1)), "atol": 1e-15},
    {"name": "D3-03 the retuned device has coherence 0.25", "stated": 0.25,
     "derive": lambda: float(_D3_RETUNE[0, 1].real), "rtol": 1e-12},
    {"name": "D3-03 its p(+) in the X basis", "stated": 0.75,
     "derive": lambda: _d3_mean(_D3_RETUNE, proj(KETP)), "rtol": 1e-12},
    {"name": "D3-03 its purity", "stated": 0.625,
     "derive": lambda: purity(_D3_RETUNE), "rtol": 1e-12},

    # ---- D3-04 to D3-06 · predictions -----------------------------------
    {"name": "D3-04 <Z>", "stated": 0.4,
     "derive": lambda: _d3_mean(_D3_RHO04, Z), "rtol": 1e-12},
    {"name": "D3-04 <X>", "stated": 0.0,
     "derive": lambda: _d3_mean(_D3_RHO04, X), "atol": 1e-15},
    {"name": "D3-04 <Y>", "stated": -0.4,
     "derive": lambda: _d3_mean(_D3_RHO04, Y), "rtol": 1e-12},
    {"name": "D3-04 p(0)", "stated": 0.7,
     "derive": lambda: _d3_mean(_D3_RHO04, proj(KET0)), "rtol": 1e-12},
    {"name": "D3-04 its purity", "stated": 0.66,
     "derive": lambda: purity(_D3_RHO04), "rtol": 1e-12},
    {"name": "D3-05 the z component of the diagonal mixture", "stated": 0.5,
     "derive": lambda: float(bloch(_D3_DIAG)[2]), "rtol": 1e-12},
    {"name": "D3-05 p(+1) at 60 degrees", "stated": 0.625,
     "derive": lambda: _d3_p_along(_D3_DIAG, 60.0), "rtol": 1e-12},
    {"name": "D3-05 the fair coin is at 90 degrees", "stated": 0.5,
     "derive": lambda: _d3_p_along(_D3_DIAG, 90.0), "rtol": 1e-12},
    {"name": "D3-05 the pure-state formula would have given something else",
     "stated": 0.75, "derive": lambda: math.cos(math.radians(30.0)) ** 2,
     "rtol": 1e-12},
    {"name": "D3-06 <X + Z>", "stated": 1.0,
     "derive": lambda: _d3_mean(_D3_MIX01, X + Z), "rtol": 1e-12},
    {"name": "D3-06 <(X + Z)^2>", "stated": 2.0,
     "derive": lambda: _d3_mean(_D3_MIX01, (X + Z) @ (X + Z)), "rtol": 1e-12},
    {"name": "D3-06 its variance", "stated": 1.0,
     "derive": lambda: _d3_mean(_D3_MIX01, (X + Z) @ (X + Z))
                       - _d3_mean(_D3_MIX01, X + Z) ** 2, "rtol": 1e-12},
    {"name": "D3-06 the readings are plus or minus root two",
     "stated": math.sqrt(2),
     "derive": lambda: float(_d3_eig(X + Z)[1]), "rtol": 1e-12},

    # ---- D3-07 to D3-09 · channels --------------------------------------
    {"name": "D3-07 the 11 entry after damping at 0.36", "stated": 0.32,
     "derive": lambda: float(_d3_damped(0.36)[1, 1].real), "rtol": 1e-12},
    {"name": "D3-07 the coherence there", "stated": 0.4,
     "derive": lambda: abs(_d3_damped(0.36)[0, 1]), "rtol": 1e-12},
    {"name": "D3-07 the purity there", "stated": 0.8848,
     "derive": lambda: purity(_d3_damped(0.36)), "rtol": 1e-4},
    {"name": "D3-07 the smallest purity reached", "stated": 0.875,
     "derive": _d3_damp_purity_min, "rtol": 1e-6},
    {"name": "D3-07 and the damping at which it happens", "stated": 0.5,
     "derive": _d3_damp_argmin, "rtol": 1e-4},
    {"name": "D3-07 full damping leaves a pure state", "stated": 1.0,
     "derive": lambda: purity(_d3_damped(1.0)), "rtol": 1e-12},
    {"name": "D3-08 the coherence after a phase flip at p = 0.25",
     "stated": 0.25, "derive": lambda: abs(_d3_dephased(0.25)[0, 1]),
     "rtol": 1e-12},
    {"name": "D3-08 the purity there", "stated": 0.625,
     "derive": lambda: purity(_d3_dephased(0.25)), "rtol": 1e-12},
    {"name": "D3-08 at p = 1/2 the output is I/2", "stated": 0.0,
     "derive": lambda: dev(_d3_dephased(0.5), I2 / 2), "atol": 1e-15},
    {"name": "D3-08 at p = 1 the output is |->", "stated": 0.0,
     "derive": lambda: dev(_d3_dephased(1.0), proj(KETM)), "atol": 1e-15},
    {"name": "D3-09 T2 from T1 = 80 and Tphi = 40", "stated": 32.0,
     "derive": lambda: _d3_t2(80.0, 40.0), "rtol": 1e-12},
    {"name": "D3-09 the surviving population after 20", "stated": 0.779,
     "derive": lambda: math.exp(-20.0 / 80.0), "rtol": 1e-3},
    {"name": "D3-09 the surviving coherence after 20", "stated": 0.535,
     "derive": lambda: math.exp(-20.0 / 32.0), "rtol": 1e-3},
    {"name": "D3-09 the largest T2 this T1 allows", "stated": 160.0,
     "derive": lambda: _d3_t2(80.0, 1e14), "rtol": 1e-11},

    # ---- D3-10 to D3-12 · reduced states --------------------------------
    {"name": "D3-10 the larger eigenvalue of the reduced state", "stated": 0.75,
     "derive": lambda: float(_d3_eig(_d3_reduced(_D3_LOPSIDED))[1]), "rtol": 1e-12},
    {"name": "D3-10 the two reduced states agree", "stated": 0.0,
     "derive": lambda: dev(_d3_reduced(_D3_LOPSIDED, 0),
                           _d3_reduced(_D3_LOPSIDED, 1)), "atol": 1e-15},
    {"name": "D3-10 the purity of each", "stated": 0.625,
     "derive": lambda: purity(_d3_reduced(_D3_LOPSIDED)), "rtol": 1e-12},
    {"name": "D3-10 its separability determinant", "stated": math.sqrt(3) / 4,
     "derive": lambda: _d3_det(_D3_LOPSIDED), "rtol": 1e-12},
    {"name": "D3-11 the reduced state of the sign-flipped state is I/2",
     "stated": 0.0, "derive": lambda: dev(_d3_reduced(_D3_SIGNFLIP), I2 / 2),
     "atol": 1e-15},
    {"name": "D3-11 its separability determinant", "stated": 0.5,
     "derive": lambda: _d3_det(_D3_SIGNFLIP), "rtol": 1e-12},
    {"name": "D3-11 its entropy is one bit", "stated": 1.0,
     "derive": lambda: von_neumann(_d3_reduced(_D3_SIGNFLIP)), "rtol": 1e-12},
    {"name": "D3-11 the all-plus version is a product instead", "stated": 0.0,
     "derive": lambda: _d3_det(np.full(4, 0.5, dtype=complex)), "atol": 1e-16},
    {"name": "D3-12 the mixture and the Bell pair share a reduced state",
     "stated": 0.0,
     "derive": lambda: dev(partial_trace(
         0.5 * proj(np.array([1, 0, 0, 0], dtype=complex))
         + 0.5 * proj(np.array([0, 0, 0, 1], dtype=complex)), 0),
         _d3_reduced(BELL_PHI_P)), "atol": 1e-15},
    {"name": "D3-12 the purity of the mixture", "stated": 0.5,
     "derive": lambda: purity(
         0.5 * proj(np.array([1, 0, 0, 0], dtype=complex))
         + 0.5 * proj(np.array([0, 0, 0, 1], dtype=complex))), "rtol": 1e-12},
    {"name": "D3-12 the two disagree about <X (x) X>", "stated": 1.0,
     "derive": lambda: float(np.vdot(BELL_PHI_P, kron(X, X) @ BELL_PHI_P).real)
                       - float(np.trace((
         0.5 * proj(np.array([1, 0, 0, 0], dtype=complex))
         + 0.5 * proj(np.array([0, 0, 0, 1], dtype=complex))) @ kron(X, X)).real),
     "rtol": 1e-12},
    {"name": "D3-12 and agree about <Z (x) Z>", "stated": 0.0,
     "derive": lambda: float(np.vdot(BELL_PHI_P, kron(Z, Z) @ BELL_PHI_P).real)
                       - float(np.trace((
         0.5 * proj(np.array([1, 0, 0, 0], dtype=complex))
         + 0.5 * proj(np.array([0, 0, 0, 1], dtype=complex))) @ kron(Z, Z)).real),
     "atol": 1e-15},

    # ---- D3-13 to D3-15 · separability, Schmidt and entropy -------------
    {"name": "D3-13 (i) is a product", "stated": 0.0,
     "derive": lambda: _d3_det(np.full(4, 0.5, dtype=complex)), "atol": 1e-16},
    {"name": "D3-13 (i) factors as |+> (x) |+>", "stated": 0.0,
     "derive": lambda: float(np.linalg.norm(
         np.full(4, 0.5, dtype=complex) - np.kron(KETP, KETP))), "atol": 1e-15},
    {"name": "D3-13 (ii) is entangled", "stated": 0.5,
     "derive": lambda: _d3_det(BELL_PHI_P), "rtol": 1e-12},
    {"name": "D3-13 (iii) factors as |0> (x) |+>", "stated": 0.0,
     "derive": lambda: float(np.linalg.norm(
         np.array([1, 1, 0, 0], dtype=complex) / math.sqrt(2)
         - np.kron(KET0, KETP))), "atol": 1e-15},
    {"name": "D3-14 the 00 entry of the reduced state", "stated": 1 / 3,
     "derive": lambda: float(_d3_reduced(_D3_SVDSTATE)[0, 0].real), "rtol": 1e-12},
    {"name": "D3-14 the larger Schmidt coefficient", "stated": 0.8727,
     "derive": lambda: float(_d3_eig(_d3_reduced(_D3_SVDSTATE))[1]), "rtol": 1e-4},
    {"name": "D3-14 the smaller one", "stated": 0.1273,
     "derive": lambda: float(_d3_eig(_d3_reduced(_D3_SVDSTATE))[0]), "rtol": 1e-3},
    {"name": "D3-14 the purity of the reduced state", "stated": 7 / 9,
     "derive": lambda: purity(_d3_reduced(_D3_SVDSTATE)), "rtol": 1e-12},
    {"name": "D3-14 its entropy in bits", "stated": 0.550,
     "derive": lambda: von_neumann(_d3_reduced(_D3_SVDSTATE)), "rtol": 1e-3},
    {"name": "D3-15 the larger coefficient at 30 degrees", "stated": 0.75,
     "derive": lambda: float(_d3_eig(_d3_reduced(_d3_family(30.0)))[1]),
     "rtol": 1e-12},
    {"name": "D3-15 the entropy at 30 degrees", "stated": 0.811,
     "derive": lambda: von_neumann(_d3_reduced(_d3_family(30.0))), "rtol": 1e-3},
    {"name": "D3-15 one ebit at 45 degrees", "stated": 1.0,
     "derive": lambda: von_neumann(_d3_reduced(_d3_family(45.0))), "rtol": 1e-12},
    {"name": "D3-15 nothing at zero degrees", "stated": 0.0,
     "derive": lambda: von_neumann(_d3_reduced(_d3_family(0.0))), "atol": 1e-9},
    {"name": "D3-15 the teaching note's value at 10 degrees", "stated": 0.20,
     "derive": lambda: von_neumann(_d3_reduced(_d3_family(10.0))), "rtol": 3e-2},

    # ---- D3-16 to D3-18 · Bell correlations -----------------------------
    {"name": "D3-16 <X (x) X> on the singlet", "stated": -1.0,
     "derive": lambda: float(np.vdot(BELL_PSI_M, kron(X, X) @ BELL_PSI_M).real),
     "rtol": 1e-12},
    {"name": "D3-16 <Y (x) Y> on the singlet", "stated": -1.0,
     "derive": lambda: float(np.vdot(BELL_PSI_M, kron(Y, Y) @ BELL_PSI_M).real),
     "rtol": 1e-12},
    {"name": "D3-16 <Z (x) Z> on the singlet", "stated": -1.0,
     "derive": lambda: float(np.vdot(BELL_PSI_M, kron(Z, Z) @ BELL_PSI_M).real),
     "rtol": 1e-12},
    {"name": "D3-16 its reduced state is I/2", "stated": 0.0,
     "derive": lambda: dev(_d3_reduced(BELL_PSI_M), I2 / 2), "atol": 1e-15},
    {"name": "D3-16 it anticorrelates along every direction too", "stated": -1.0,
     "derive": lambda: max(_d3_corr(proj(BELL_PSI_M), float(d), float(d))
                           for d in np.linspace(0.0, 180.0, 181)), "rtol": 1e-12},
    {"name": "D3-17 the first correlation", "stated": 0.8660,
     "derive": lambda: _d3_corr(proj(BELL_PHI_P), 0.0, 30.0), "rtol": 1e-4},
    {"name": "D3-17 the third correlation", "stated": 0.5,
     "derive": lambda: _d3_corr(proj(BELL_PHI_P), 90.0, 30.0), "rtol": 1e-12},
    {"name": "D3-17 the fourth correlation", "stated": -0.5,
     "derive": lambda: _d3_corr(proj(BELL_PHI_P), 90.0, -30.0), "rtol": 1e-12},
    {"name": "D3-17 the CHSH value", "stated": 2.732,
     "derive": lambda: _d3_chsh(proj(BELL_PHI_P), 0.0, 90.0, 30.0, -30.0),
     "rtol": 1e-3},
    {"name": "D3-17 the best symmetric setting", "stated": 2 * math.sqrt(2),
     "derive": lambda: max(_d3_chsh(proj(BELL_PHI_P), 0.0, 90.0, f, -f)
                           for f in np.linspace(0.0, 90.0, 9001)), "rtol": 1e-6},
    {"name": "D3-18 the Bell state has the same form in the X basis",
     "stated": 0.0,
     "derive": lambda: min(
         float(np.linalg.norm(BELL_PHI_P
               - (np.kron(KETP, KETP) + np.kron(KETM, KETM)) / math.sqrt(2))),
         float(np.linalg.norm(BELL_PHI_P
               + (np.kron(KETP, KETP) + np.kron(KETM, KETM)) / math.sqrt(2)))),
     "atol": 1e-15},
    {"name": "D3-18 the conditional state after a plus reading is |+>",
     "stated": 1.0,
     "derive": lambda: _d3_mean(
         partial_trace(kron(I2, proj(KETP)) @ proj(BELL_PHI_P)
                       @ kron(I2, proj(KETP)), 0) / 0.5, proj(KETP)),
     "rtol": 1e-12},
    {"name": "D3-18 the unconditional state is I/2 whatever B does",
     "stated": 0.0,
     "derive": lambda: max(
         dev(partial_trace(
             sum(kron(I2, 0.5 * (I2 + sg * ndotsigma(direction(float(d)))))
                 @ proj(BELL_PHI_P)
                 @ kron(I2, 0.5 * (I2 + sg * ndotsigma(direction(float(d)))))
                 for sg in (+1, -1)), 0), I2 / 2)
         for d in np.linspace(0.0, 180.0, 91)), "atol": 1e-14},

    # ---- D3-19 and D3-20 · the full-length questions ---------------------
    {"name": "D3-19 S at p = 0 is the undamaged value",
     "stated": 2 * math.sqrt(2),
     "derive": lambda: _d3_chsh(_d3_dephased_pair(0.0), 0.0, 90.0, 45.0, -45.0),
     "rtol": 1e-12},
    {"name": "D3-19 S at p = 0.1", "stated": 2.546,
     "derive": lambda: _d3_chsh(_d3_dephased_pair(0.1), 0.0, 90.0, 45.0, -45.0),
     "rtol": 1e-3},
    {"name": "D3-19 the largest p that still violates", "stated": 0.2929,
     "derive": _d3_chsh_threshold, "rtol": 1e-3},
    {"name": "D3-19 S at p = 1/2", "stated": math.sqrt(2),
     "derive": lambda: _d3_chsh(_d3_dephased_pair(0.5), 0.0, 90.0, 45.0, -45.0),
     "rtol": 1e-12},
    {"name": "D3-19 at p = 1/2 the pair is the classical mixture", "stated": 0.0,
     "derive": lambda: dev(_d3_dephased_pair(0.5),
         0.5 * proj(np.array([1, 0, 0, 0], dtype=complex))
         + 0.5 * proj(np.array([0, 0, 0, 1], dtype=complex))), "atol": 1e-15},
    {"name": "D3-20 p(+) after 20 microseconds", "stated": 0.7567,
     "derive": lambda: _d3_idle_pplus(20.0, 30.0), "rtol": 1e-4},
    {"name": "D3-20 p(+) at t = 0", "stated": 1.0,
     "derive": lambda: _d3_idle_pplus(0.0, 30.0), "rtol": 1e-12},
    {"name": "D3-20 the shots needed for two decimal places", "stated": 7400.0,
     "derive": lambda: _d3_shots_for(0.01, _d3_idle_pplus(20.0, 30.0)),
     "rtol": 1e-2},
    {"name": "D3-20 the pure-dephasing time behind T1 = 50 and T2 = 30",
     "stated": 42.857, "derive": lambda: _d3_tphi(50.0, 30.0), "rtol": 1e-4},
    {"name": "D3-20 the two times are consistent", "stated": 30.0,
     "derive": lambda: _d3_t2(50.0, _d3_tphi(50.0, 30.0)), "rtol": 1e-12},

    # ── D4-01 to D4-03: between a state, a matrix and a point ──────────────
    {"name": "D4-01 r_x of the prepared state", "stated": -0.4330,
     "derive": lambda: _d4_bloch(60.0, 120.0)[0], "rtol": 1e-3},
    {"name": "D4-01 r_y of the prepared state", "stated": 0.7500,
     "derive": lambda: _d4_bloch(60.0, 120.0)[1], "rtol": 1e-4},
    {"name": "D4-01 r_z of the prepared state", "stated": 0.5000,
     "derive": lambda: _d4_bloch(60.0, 120.0)[2], "rtol": 1e-12},
    {"name": "D4-01 the check: the point is on the surface", "stated": 1.0,
     "derive": lambda: float(np.linalg.norm(_d4_bloch(60.0, 120.0))),
     "rtol": 1e-12},
    {"name": "D4-01 p(0), two ways agreeing", "stated": 0.75,
     "derive": lambda: abs(inner(KET0, _d4_state(60.0, 120.0))) ** 2,
     "rtol": 1e-12},
    {"name": "D4-02 the polar angle behind r_z = 0.8", "stated": 36.87,
     "derive": lambda: math.degrees(math.acos(0.8)), "rtol": 1e-4},
    {"name": "D4-02 the amplitude of |0>", "stated": 0.9487,
     "derive": lambda: math.cos(math.acos(0.8) / 2), "rtol": 1e-4},
    {"name": "D4-02 the amplitude of |1>", "stated": 0.3162,
     "derive": lambda: math.sin(math.acos(0.8) / 2), "rtol": 1e-4},
    {"name": "D4-02 p(0) along z", "stated": 0.9,
     "derive": lambda: _d4_overlap(np.array([0.6, 0.0, 0.8]),
                                   np.array([0.0, 0.0, 1.0])),
     "rtol": 1e-12},
    {"name": "D4-02 p(+1) along x", "stated": 0.8,
     "derive": lambda: _d4_overlap(np.array([0.6, 0.0, 0.8]),
                                   np.array([1.0, 0.0, 0.0])),
     "rtol": 1e-12},
    {"name": "D4-03 the orthogonal pair really is antipodal", "stated": 0.0,
     "derive": lambda: _d4_overlap(_d4_bloch(60.0, 0.0),
                                   _d4_bloch(120.0, 180.0)),
     "atol": 1e-15},
    {"name": "D4-03 the overlap of the other pair", "stated": 0.9330,
     "derive": lambda: _d4_overlap(_d4_bloch(90.0, 0.0), _d4_bloch(60.0, 0.0)),
     "rtol": 1e-4},
    {"name": "D4-03 the check: the same number from the half angle",
     "stated": 0.9330, "derive": lambda: math.cos(DEG(15.0)) ** 2, "rtol": 1e-4},

    # ── D4-04 to D4-06: a gate as a rotation ────────────────────────────────
    {"name": "D4-04 the state after R_y(70 degrees) on |0>", "stated": 0.0,
     "derive": lambda: dev(ry(DEG(70.0)) @ KET0,
                           math.cos(DEG(35.0)) * KET0
                           + math.sin(DEG(35.0)) * KET1),
     "atol": 1e-12},
    {"name": "D4-04 its Bloch vector turned by the full angle", "stated": 0.9397,
     "derive": lambda: bloch_of(ry(DEG(70.0)) @ KET0)[0], "rtol": 1e-4},
    {"name": "D4-04 p(0) afterwards", "stated": 0.6710,
     "derive": lambda: abs(inner(KET0, ry(DEG(70.0)) @ KET0)) ** 2,
     "rtol": 1e-4},
    {"name": "D4-04 the check: the length is still one", "stated": 1.0,
     "derive": lambda: float(np.linalg.norm(bloch_of(ry(DEG(70.0)) @ KET0))),
     "rtol": 1e-12},
    {"name": "D4-05 the gate is a half turn about the stated axis",
     "stated": 0.0,
     "derive": lambda: dev((X + Y) / math.sqrt(2), ndotsigma((R2, R2, 0.0))),
     "atol": 1e-15},
    {"name": "D4-05 it sends |0> to |1>", "stated": 0.0,
     "derive": lambda: same_state((X + Y) / math.sqrt(2) @ KET0, KET1),
     "atol": 1e-12},
    {"name": "D4-05 it sends |+i> to |+>", "stated": 0.0,
     "derive": lambda: same_state(
         (X + Y) / math.sqrt(2) @ ((KET0 + 1j * KET1) / math.sqrt(2)), KETP),
     "atol": 1e-12},
    {"name": "D4-06 the Bloch vector of T|+>, y component", "stated": 0.7071,
     "derive": lambda: bloch_of(T_GATE @ KETP)[1], "rtol": 1e-4},
    {"name": "D4-06 p(0) after T alone", "stated": 0.5,
     "derive": lambda: abs(inner(KET0, T_GATE @ KETP)) ** 2, "rtol": 1e-12},
    {"name": "D4-06 p(0) after the Hadamard as well", "stated": 0.8536,
     "derive": lambda: abs(inner(KET0, H @ T_GATE @ KETP)) ** 2, "rtol": 1e-4},

    # ── D4-07 to D4-09: composing a sequence ────────────────────────────────
    {"name": "D4-07 the circuit sends |0> to |-i>", "stated": 0.0,
     "derive": lambda: same_state(H @ S_GATE @ H @ KET0,
                                  (KET0 - 1j * KET1) / math.sqrt(2)),
     "atol": 1e-12},
    {"name": "D4-07 the check: the net gate is a quarter turn about x",
     "stated": 0.0,
     "derive": lambda: dev(H @ S_GATE @ H,
                           np.exp(1j * math.pi / 4) * rx(math.pi / 2)),
     "atol": 1e-12},
    {"name": "D4-08 H first gives |+i>", "stated": 0.0,
     "derive": lambda: same_state(S_GATE @ H @ KET0,
                                  (KET0 + 1j * KET1) / math.sqrt(2)),
     "atol": 1e-12},
    {"name": "D4-08 S first gives |+>", "stated": 0.0,
     "derive": lambda: same_state(H @ S_GATE @ KET0, KETP), "atol": 1e-12},
    {"name": "D4-08 the overlap of the two answers", "stated": 0.5,
     "derive": lambda: abs(inner(S_GATE @ H @ KET0, H @ S_GATE @ KET0)) ** 2,
     "rtol": 1e-12},
    {"name": "D4-08 the check: both give the same Z statistics", "stated": 0.5,
     "derive": lambda: abs(inner(KET0, S_GATE @ H @ KET0)) ** 2, "rtol": 1e-12},
    {"name": "D4-09 the four gates compose to minus the identity", "stated": 0.0,
     "derive": lambda: dev(Z @ X @ Z @ X, -I2), "atol": 1e-15},
    {"name": "D4-09 they move no Bloch vector at all", "stated": 0.0,
     "derive": lambda: float(np.linalg.norm(
         bloch_of(Z @ X @ Z @ X @ _d4_state(43.0, 71.0))
         - _d4_bloch(43.0, 71.0))),
     "atol": 1e-14},
    {"name": "D4-09 under a control they turn |+> into |->", "stated": 0.0,
     "derive": lambda: same_state(_d4_controlled(Z @ X @ Z @ X)
                                  @ kron_state(KETP, KETP),
                                  kron_state(KETP, KETM)),
     "atol": 1e-12},

    # ── D4-10 to D4-12: decomposing and synthesising ────────────────────────
    {"name": "D4-10 S is a phase times a quarter turn about z", "stated": 0.0,
     "derive": lambda: dev(S_GATE, np.exp(1j * math.pi / 4) * rz(math.pi / 2)),
     "atol": 1e-12},
    {"name": "D4-10 the controlled versions differ by a phase on the control",
     "stated": 0.0,
     "derive": lambda: dev(
         _d4_controlled(S_GATE),
         _d4_controlled(rz(math.pi / 2))
         @ on_qubit(phase_gate(math.pi / 4), 0)),
     "atol": 1e-12},
    {"name": "D4-11 the gate prepares the wanted state from |0>", "stated": 0.0,
     "derive": lambda: dev(u_gate(DEG(60.0), DEG(45.0), 0.0) @ KET0,
                           _d4_state(60.0, 45.0)),
     "atol": 1e-12},
    {"name": "D4-11 the entry U_00", "stated": 0.8660,
     "derive": lambda: float(np.real(u_gate(DEG(60.0), DEG(45.0), 0.0)[0, 0])),
     "rtol": 1e-4},
    {"name": "D4-11 the real part of U_10", "stated": 0.3536,
     "derive": lambda: float(np.real(u_gate(DEG(60.0), DEG(45.0), 0.0)[1, 0])),
     "rtol": 1e-3},
    {"name": "D4-11 the real part of U_11", "stated": 0.6124,
     "derive": lambda: float(np.real(u_gate(DEG(60.0), DEG(45.0), 0.0)[1, 1])),
     "rtol": 1e-3},
    {"name": "D4-11 the check: the matrix is unitary", "stated": 0.0,
     "derive": lambda: unitarity(u_gate(DEG(60.0), DEG(45.0), 0.0)),
     "atol": 1e-14},
    {"name": "D4-12 four T gates make a Z", "stated": 0.0,
     "derive": lambda: dev(np.linalg.matrix_power(T_GATE, 4), Z), "atol": 1e-14},
    {"name": "D4-12 the check: eight of them make the identity", "stated": 0.0,
     "derive": lambda: dev(np.linalg.matrix_power(T_GATE, 8), I2), "atol": 1e-14},
    {"name": "D4-12 the length grows by this factor", "stated": 4.0,
     "derive": lambda: (math.log(1e4) / math.log(1e2)) ** 2, "rtol": 1e-12},

    # ── D4-13 to D4-16: two-qubit gates, and which qubit is which ───────────
    {"name": "D4-13 X on q0 of the three-term state", "stated": 0.0,
     "derive": lambda: dev(on_qubit(X, 0) @ _d4_13_state(),
                           np.array([1, 1, 0, 1], dtype=complex) / math.sqrt(3)),
     "atol": 1e-15},
    {"name": "D4-13 X on q1 of the same state", "stated": 0.0,
     "derive": lambda: dev(on_qubit(X, 1) @ _d4_13_state(),
                           np.array([1, 0, 1, 1], dtype=complex) / math.sqrt(3)),
     "atol": 1e-15},
    {"name": "D4-13 p(01) after the gate on q0", "stated": 0.3333,
     "derive": lambda: abs((on_qubit(X, 0) @ _d4_13_state())[1]) ** 2,
     "rtol": 1e-3},
    {"name": "D4-13 p(01) after the gate on q1", "stated": 0.0,
     "derive": lambda: abs((on_qubit(X, 1) @ _d4_13_state())[1]) ** 2,
     "atol": 1e-30},
    {"name": "D4-14 with q0 as control the state is untouched", "stated": 0.0,
     "derive": lambda: dev(cnot(0, 1) @ _d4_14_state(), _d4_14_state()),
     "atol": 1e-15},
    {"name": "D4-14 with q1 as control it becomes a Bell state", "stated": 0.0,
     "derive": lambda: dev(cnot(1, 0) @ _d4_14_state(), BELL_PHI_P),
     "atol": 1e-15},
    {"name": "D4-14 the entanglement in the first case", "stated": 0.0,
     "derive": lambda: _d4_entropy_of(cnot(0, 1) @ _d4_14_state()),
     "atol": 1e-12},
    {"name": "D4-14 the entanglement in the second", "stated": 1.0,
     "derive": lambda: _d4_entropy_of(cnot(1, 0) @ _d4_14_state()),
     "rtol": 1e-12},
    {"name": "D4-15 the amplitude test on CZ|++>", "stated": -0.5,
     "derive": lambda: float(np.real(
         (cz_gate() @ kron_state(KETP, KETP))[0]
         * (cz_gate() @ kron_state(KETP, KETP))[3]
         - (cz_gate() @ kron_state(KETP, KETP))[1]
         * (cz_gate() @ kron_state(KETP, KETP))[2])),
     "rtol": 1e-12},
    {"name": "D4-15 the reduced state is maximally mixed", "stated": 0.0,
     "derive": lambda: dev(partial_trace(
         proj(cz_gate() @ kron_state(KETP, KETP)), keep=0), 0.5 * I2),
     "atol": 1e-14},
    {"name": "D4-15 its purity", "stated": 0.5,
     "derive": lambda: purity(partial_trace(
         proj(cz_gate() @ kron_state(KETP, KETP)), keep=0)),
     "rtol": 1e-12},
    {"name": "D4-15 the entanglement, in bits", "stated": 1.0,
     "derive": lambda: _d4_entropy_of(cz_gate() @ kron_state(KETP, KETP)),
     "rtol": 1e-12},
    {"name": "D4-15 the check: the outcome probabilities do not move",
     "stated": 0.25,
     "derive": lambda: max(abs(z) ** 2
                           for z in cz_gate() @ kron_state(KETP, KETP)),
     "rtol": 1e-12},
    {"name": "D4-16 the SWAP exchanges the two qubits", "stated": 0.0,
     "derive": lambda: dev(swap_gate() @ ket(1, 0), ket(0, 1)), "atol": 1e-15},
    {"name": "D4-16 three CNOTs build it", "stated": 0.0,
     "derive": lambda: dev(cnot(0, 1) @ cnot(1, 0) @ cnot(0, 1), swap_gate()),
     "atol": 1e-15},
    {"name": "D4-16 the check: a SWAP creates no entanglement", "stated": 0.0,
     "derive": lambda: _d4_entropy_of(swap_gate() @ kron_state(KETP, KET0)),
     "atol": 1e-12},

    # ── D4-17 and D4-18: entangling power and universality ──────────────────
    {"name": "D4-17 the output at 120 degrees", "stated": 0.0,
     "derive": lambda: dev(_d4_17_output(120.0),
                           math.cos(DEG(60.0)) * ket(0, 0)
                           + math.sin(DEG(60.0)) * ket(1, 1)),
     "atol": 1e-14},
    {"name": "D4-17 its entanglement, in bits", "stated": 0.8113,
     "derive": lambda: _d4_entropy_of(_d4_17_output(120.0)), "rtol": 1e-3},
    {"name": "D4-17 a product at both ends", "stated": 0.0,
     "derive": lambda: max(_d4_entropy_of(_d4_17_output(t))
                           for t in (0.0, 180.0)),
     "atol": 1e-12},
    {"name": "D4-17 a local gate leaves the entropy alone", "stated": 0.0,
     "derive": lambda: abs(
         _d4_entropy_of(kron(u_gate(1.3, 0.4, 2.2), u_gate(0.9, 2.7, 1.1))
                        @ _d4_17_output(120.0))
         - _d4_entropy_of(_d4_17_output(120.0))),
     "atol": 1e-12},
    {"name": "D4-18 one-qubit gates alone never entangle", "stated": 0.0,
     "derive": lambda: max(_d4_entropy_of(
         kron(u_gate(a, 0.4, 2.2), u_gate(0.9, a, 1.1)) @ kron_state(KET0, KET0))
         for a in np.linspace(0.0, math.pi, 13)),
     "atol": 1e-12},
    {"name": "D4-18 the length grows by this factor", "stated": 4.0,
     "derive": lambda: (math.log(1e4) / math.log(1e2)) ** 2, "rtol": 1e-12},

    # ── D4-19 and D4-20: full-length ────────────────────────────────────────
    {"name": "D4-19 r_z after the second Hadamard", "stated": 0.7071,
     "derive": lambda: bloch_of(H @ T_GATE @ H @ KET0)[2], "rtol": 1e-4},
    {"name": "D4-19 p(0) at the end", "stated": 0.8536,
     "derive": lambda: abs(inner(KET0, H @ T_GATE @ H @ KET0)) ** 2,
     "rtol": 1e-4},
    {"name": "D4-19 the check: the same number as cos^2(pi/8)", "stated": 0.8536,
     "derive": lambda: math.cos(math.pi / 8) ** 2, "rtol": 1e-4},
    {"name": "D4-19 the shots for two decimal places", "stated": 5000.0,
     "derive": lambda: _d4_shots_for(
         0.01, abs(inner(KET0, H @ T_GATE @ H @ KET0)) ** 2),
     "rtol": 1e-3},
    {"name": "D4-19 the conjugate gate gives the same probability",
     "stated": 0.8536,
     "derive": lambda: abs(inner(KET0,
                                 H @ T_GATE.conj().T @ H @ KET0)) ** 2,
     "rtol": 1e-4},
    {"name": "D4-20 the circuit produces the Bell state with a minus sign",
     "stated": 0.0, "derive": lambda: dev(_d4_20_output(), BELL_PHI_M),
     "atol": 1e-14},
    {"name": "D4-20 both reduced states are maximally mixed", "stated": 0.0,
     "derive": lambda: max(dev(partial_trace(proj(_d4_20_output()), keep=k),
                               0.5 * I2) for k in (0, 1)),
     "atol": 1e-14},
    {"name": "D4-20 the entanglement, in bits", "stated": 1.0,
     "derive": lambda: _d4_entropy_of(_d4_20_output()), "rtol": 1e-12},
    {"name": "D4-20 p(00) at the end", "stated": 0.5,
     "derive": lambda: abs(_d4_20_output()[0]) ** 2, "rtol": 1e-12},
    {"name": "D4-20 p(01) at the end", "stated": 0.0,
     "derive": lambda: abs(_d4_20_output()[1]) ** 2, "atol": 1e-30},
    {"name": "D4-20 the Z correlation cannot separate the two candidates",
     "stated": 0.0,
     "derive": lambda: abs(_d4_corr(_d4_20_output(), Z, Z)
                           - _d4_corr(BELL_PHI_P, Z, Z)),
     "atol": 1e-14},
    {"name": "D4-20 the X correlation of the state produced", "stated": -1.0,
     "derive": lambda: _d4_corr(_d4_20_output(), X, X), "rtol": 1e-12},
    {"name": "D4-20 the X correlation of the state claimed", "stated": 1.0,
     "derive": lambda: _d4_corr(BELL_PHI_P, X, X), "rtol": 1e-12},
]


if __name__ == "__main__":
    main(CHECKS, "verify_drills — chapters 1 to 4, worked solutions")
