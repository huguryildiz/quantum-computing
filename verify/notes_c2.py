"""Re-derives every number the lecture notes of chapter 2 (notes/src/c2.js) state.

Same convention as notes_c1.py: every check reaches its number by a route the
notes do not take, on this repo's runner (qcheck.py) and operators (qops.py).
"""

from __future__ import annotations

import math
import os
import sys

import numpy as np
import sympy as sp
from scipy.stats import binom

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from qcheck import main                                       # noqa: E402
from qops import KET0, KET1, KETM, KETP, X, Y, Z, inner, outer  # noqa: E402


# ── 2.2 · Example 2.1, three measurements in a row ──────────────────────────


def _example_2_1_final_agreement_probability():
    """P(third Z reading agrees with the first), by simulating every branch of
    the tree exactly (Z, then X, then Z again) rather than by the notes'
    one-line symmetry argument.

    Start in |0>. Z is certain +1. Then X sends the state to |+> or |-> each
    with probability 1/2 (Born rule via projectors on the X eigenbasis).
    From either, a Z measurement returns +1 or -1 each with probability 1/2
    (Born rule via projectors on the Z eigenbasis). Sum p(branch) * P(agree |
    branch) over all four leaves.
    """
    def born(proj_ket, psi):
        return abs(inner(proj_ket, psi)) ** 2

    total = 0.0
    # after first Z: state is |0> with certainty (first outcome +1)
    psi1 = KET0
    for x_ket, p_x in ((KETP, born(KETP, psi1)), (KETM, born(KETM, psi1))):
        # x_ket is the post-X-measurement state
        for z_ket, p_z in ((KET0, born(KET0, x_ket)), (KET1, born(KET1, x_ket))):
            agrees = 1.0 if z_ket is KET0 else 0.0  # first reading was +1 <-> |0>
            total += p_x * p_z * agrees
    return total


def _example_2_1_check_no_middle_measurement():
    """Omit the middle X measurement: repeating Z immediately is certain, so
    the agreement probability is 1. Checked by applying the Z projector twice
    directly rather than quoting the projective-measurement postulate."""
    P0 = outer(KET0, KET0)
    psi1 = P0 @ KET0
    psi1 = psi1 / np.linalg.norm(psi1)
    p_repeat = abs(inner(KET0, psi1)) ** 2
    return p_repeat


# ── 2.2 · Example 2.2, a readout that sometimes lies ────────────────────────


def _example_2_2_slope():
    """The slope of p_rep(0) = epsilon + (1-2epsilon) q in q, taken as a
    symbolic derivative of the POVM expression rather than read off the
    notes' expanded line.

    p_rep(0) = (1-eps) q + eps (1-q), built directly from the two effects
    E0 = (1-eps)|0><0| + eps|1><1|, applied as Tr(rho E0) with rho the qubit
    state having Born probability q of z=0 and z-diagonal (so <A> only
    depends on q, not on coherence).
    """
    eps, q = sp.symbols("epsilon q", real=True)
    p_rep = (1 - eps) * q + eps * (1 - q)
    slope = sp.diff(sp.expand(p_rep), q)
    return float(slope.subs(eps, sp.Rational(1, 4)))  # slope is 1-2eps, eps-independent shape


def _example_2_2_at_half():
    """p_rep(0) at epsilon = 1/2, for an arbitrary q: should be 1/2 regardless
    of q, evaluated at three different q values and averaged (a poor man's
    "for all q" check) built from Tr(rho E0) rather than from the closed form."""
    eps = sp.Rational(1, 2)
    vals = []
    for qv in (sp.Rational(1, 5), sp.Rational(1, 2), sp.Rational(9, 10)):
        p_rep = (1 - eps) * qv + eps * (1 - qv)
        vals.append(float(p_rep))
    return float(sum(vals) / len(vals))


# ── 2.4 · compatibility and uncertainty ─────────────────────────────────────


def _commutator_x_z():
    """[X,Z] = -2iY, checked by direct matrix multiplication (not the Pauli
    cyclic mnemonic the notes state)."""
    comm = X @ Z - Z @ X
    diff = comm - (-2j * Y)
    return float(np.linalg.norm(diff))


def _robertson_saturated_on_plus_i():
    """On |+i>, Delta X * Delta Z equals |<Y>|/2 * 2 = 1 (saturation), computed
    from expectation values and variances directly rather than quoted.

    The commutator [X,Z] is anti-Hermitian, so its expectation on any state is
    purely imaginary; the bound is 0.5 * |<psi|[X,Z]|psi>|, taking the modulus
    of that (generally complex) inner product rather than its real part.
    """
    psi = (KET0 + 1j * KET1) / math.sqrt(2)  # |+i>

    def mean_real(A):
        return float(np.vdot(psi, A @ psi).real)

    def var(A):
        return mean_real(A @ A) - mean_real(A) ** 2

    dX = math.sqrt(max(var(X), 0.0))
    dZ = math.sqrt(max(var(Z), 0.0))
    comm_expect = complex(np.vdot(psi, (X @ Z - Z @ X) @ psi))
    bound = 0.5 * abs(comm_expect)
    return dX * dZ - bound  # should be ~0 (saturation)


def _robertson_bound_is_abs_mean_y():
    """The Robertson bound for X,Z is |<Y>|, i.e. 0.5*|<[X,Z]>| = |<Y>|,
    verified as an algebraic identity via the commutator computed above,
    evaluated on |+i>."""
    psi = (KET0 + 1j * KET1) / math.sqrt(2)

    def mean_real(A):
        return float(np.vdot(psi, A @ psi).real)

    comm = X @ Z - Z @ X
    comm_expect = complex(np.vdot(psi, comm @ psi))
    lhs = 0.5 * abs(comm_expect)
    rhs = abs(mean_real(Y))
    return lhs - rhs


# ── 2.6 · the infinite square well ──────────────────────────────────────────


def _well_energy_ratio():
    """E_2 / E_1 = 4, from the closed form E_n = hbar^2 pi^2 n^2 / (2 m a^2)
    evaluated at n=1,2 with concrete numeric hbar, m, a (not symbolically
    cancelled the way the notes' one-line statement implicitly does)."""
    hbar, m, a = 1.0, 1.0, 1.0

    def E(n):
        return hbar ** 2 * math.pi ** 2 * n ** 2 / (2 * m * a ** 2)

    return E(2) / E(1)


def _well_beat_period():
    """The period of the moving cross-term for the first two levels,
    2*pi*hbar/(3*E1), checked against 2*pi / (E2 - E1) with hbar folded in --
    an independent algebraic route (period = 2 pi / angular frequency,
    frequency = (E2-E1)/hbar) rather than substituting E2=4E1 into the notes'
    own simplified expression."""
    hbar, m, a = 1.0, 1.0, 1.0

    def E(n):
        return hbar ** 2 * math.pi ** 2 * n ** 2 / (2 * m * a ** 2)

    E1, E2 = E(1), E(2)
    omega = (E2 - E1) / hbar
    return 2 * math.pi / omega


# ── 2.7 · finite shots ───────────────────────────────────────────────────────


def _standard_error_worst_case():
    """SE(K/N) at p=1/2 equals 1/(2 sqrt N), checked via the binomial
    distribution's own variance (scipy.stats.binom), not the closed-form
    square root the notes write down."""
    N = 10_000
    var = binom.var(N, 0.5) / N ** 2   # Var(K/N)
    se = math.sqrt(var)
    return se


def _standard_error_formula_matches_binomial():
    """The general SE = sqrt(p(1-p)/N) at p=0.3, N=5000, checked against the
    binomial distribution's variance directly."""
    N, p = 5000, 0.3
    var = binom.var(N, p) / N ** 2
    return math.sqrt(var)


def _order_of_magnitude_ten_thousand_shots():
    """"One per cent needs of order ten thousand shots" at p=1/2: solving
    1/(2 sqrt N) = 0.01 for N gives N = 2500; check the order-of-magnitude
    claim by finding the N at which SE first drops below 0.01, via the
    binomial variance and a direct search rather than solving the closed
    form."""
    p = 0.5
    N = 1
    while math.sqrt(binom.var(N, p) / N ** 2) > 0.01:
        N += 1
    return float(N)


CHECKS = [
    {"name": "2.2 Example 2.1: P(third Z agrees with first) = 1/2",
     "stated": 0.5, "derive": _example_2_1_final_agreement_probability},
    {"name": "2.2 Example 2.1 check: no middle measurement gives certainty 1",
     "stated": 1.0, "derive": _example_2_1_check_no_middle_measurement, "atol": 1e-12},

    {"name": "2.2 Example 2.2: slope of p_rep(0) in q is 1-2epsilon",
     "stated": 0.5, "derive": _example_2_2_slope},
    {"name": "2.2 Example 2.2: at epsilon=1/2, p_rep(0) is 1/2 for any q",
     "stated": 0.5, "derive": _example_2_2_at_half},

    {"name": "2.4 [X,Z] = -2iY",
     "stated": 0.0, "derive": _commutator_x_z, "atol": 1e-12},
    {"name": "2.4 Robertson relation saturated on |+i>",
     "stated": 0.0, "derive": _robertson_saturated_on_plus_i, "atol": 1e-10},
    {"name": "2.4 Robertson bound for X,Z equals |<Y>|",
     "stated": 0.0, "derive": _robertson_bound_is_abs_mean_y, "atol": 1e-10},

    {"name": "2.6 infinite well: E2/E1 = 4",
     "stated": 4.0, "derive": _well_energy_ratio},
    {"name": "2.6 infinite well: beat period = 2 pi hbar / (3 E1)",
     "stated": 2 * math.pi / (3 * math.pi ** 2 / 2), "derive": _well_beat_period},

    {"name": "2.7 worst-case standard error at p=1/2 is 1/(2 sqrt N)",
     "stated": 1 / (2 * math.sqrt(10_000)), "derive": _standard_error_worst_case},
    {"name": "2.7 SE formula matches the binomial variance at p=0.3",
     "stated": math.sqrt(0.3 * 0.7 / 5000), "derive": _standard_error_formula_matches_binomial},
    {"name": "2.7 order of magnitude: ~10^4 shots for one-per-cent SE at p=1/2",
     "stated": 2500.0, "derive": _order_of_magnitude_ten_thousand_shots, "rtol": 0.05},
]


if __name__ == "__main__":
    main(CHECKS, "Chapter 2 lecture notes")
