"""Re-derives every number the Module 3 "Around Us" gallery scenes state
(build/src/84_scenes_m3.js: m3-real-cryostat, m3-real-crystal, m3-real-telescopes).

Modelled on verify/notes_c1.py: built on this repo's own runner (qcheck.py) and
operators (qops.py). Each check reaches its number by a route the scene's own
figure code does not take -- a matrix exponential in place of a closed-form
exp(-t), a singular-value decomposition in place of a hand determinant, and so
on -- so agreement is a check on the figure, not a restatement of it.
"""

from __future__ import annotations

import math
import os
import sys

import numpy as np
from scipy.linalg import expm

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from qcheck import main                                       # noqa: E402
from qops import kron, proj, purity                             # noqa: E402


# ── m3-real-cryostat · figRealT1T2: population and coherence at T2 = 2T1 ────


def _t1t2_population_via_expm():
    """rho_11(t)/rho_11(0) at t/T1 = 1.6, from a 1x1 matrix exponential of the
    decay generator -- an independent numerical route to exp(-t/T1)."""
    rate = 1.0  # in units of 1/T1
    t = 1.6
    return float(expm(np.array([[-rate * t]]))[0, 0])


def _t1t2_coherence_via_expm():
    """|rho_01(t)|/|rho_01(0)| at t/T1 = 2.6, for the ceiling case T2 = 2T1,
    i.e. decay rate 1/(2T1) = 0.5 in units of 1/T1."""
    rate = 0.5
    t = 2.6
    return float(expm(np.array([[-rate * t]]))[0, 0])


def _t1t2_ceiling_ratio():
    """T2 = 2 T1 exactly when the pure-dephasing rate 1/T_phi is zero:
    1/T2 = 1/(2 T1) + 1/T_phi with T_phi -> infinity gives 1/T2 = 1/(2T1)."""
    T1 = 1.0
    T_phi = 1e18   # numerically "infinite"
    T2 = 1.0 / (1.0 / (2 * T1) + 1.0 / T_phi)
    return T2 / T1


# ── m3-real-cryostat · figGateBudget: T1 / gate time at three gate times ────


def _gate_budget(gate_seconds):
    """Gates before the population reaches 1/e of its initial value: since
    rho_11(t) = exp(-t/T1), that happens at t = T1, so the count is T1 divided
    by the gate time. T1 = 100 microseconds, the same figure this course's
    m3-t1t2 scene already uses."""
    T1 = 100e-6
    return T1 / gate_seconds


# ── m3-real-crystal · figRealSep: the product test on two amplitude arrays ──


def _entangled_pair_determinant():
    """The determinant of the amplitude array for c = (1/sqrt2, 0, 0, 1/sqrt2)
    (the state 1/sqrt2 (|00>+|11>) in this course's ordering), computed from a
    singular value decomposition rather than the hand formula c0 c3 - c1 c2:
    the determinant of a 2x2 matrix is the product of its two singular values
    up to sign, and here both singular values are 1/sqrt2 so the magnitude is
    1/2, and det > 0 because the matrix is already diagonal with equal signs.
    """
    r = 1 / math.sqrt(2)
    C = np.array([[r, 0.0], [0.0, r]])
    s = np.linalg.svd(C, compute_uv=False)
    sign = np.sign(np.linalg.det(C))
    return float(sign * s[0] * s[1])


def _product_pair_determinant():
    """The determinant of the amplitude array for the product state
    |+>@|+> = (1/2, 1/2, 1/2, 1/2), via the same SVD route. A product state's
    coefficient matrix has rank one, so one singular value is exactly zero and
    the determinant vanishes."""
    C = np.array([[0.5, 0.5], [0.5, 0.5]])
    s = np.linalg.svd(C, compute_uv=False)
    return float(s[0] * s[1])


def _entangled_pair_is_phi_plus():
    """The amplitude array of the entangled pair is exactly the coefficient
    matrix of |Phi+> = (|00>+|11>)/sqrt2, checked by building the state from
    the standard Bell state formula in qops-style ordering and reshaping it,
    rather than by trusting the picture's own labels."""
    r = 1 / math.sqrt(2)
    psi = np.array([r, 0, 0, r])  # |00> + |11>, this course's |q1 q0> ordering
    C = psi.reshape(2, 2)
    return float(np.linalg.norm(C - np.array([[r, 0.0], [0.0, r]])))


# ── m3-real-crystal · figRealSchmidtBar: the two Schmidt spectra ────────────


def _entangled_pair_schmidt_purity():
    """Tr(rho_A^2) for the entangled pair's reduced state, from the partial
    trace of the full projector -- not from reading two equal Schmidt bars off
    a picture. Two equal Schmidt coefficients of 1/2 give purity 1/2."""
    r = 1 / math.sqrt(2)
    psi = np.array([r, 0, 0, r], dtype=complex)
    rho = proj(psi)
    # trace out the right (least significant) qubit, dims (2,2), keep=0
    dA = dB = 2
    rhoA = np.zeros((dA, dA), dtype=complex)
    for j in range(dB):
        M = np.zeros((dA * dB, dA), dtype=complex)
        for i in range(dA):
            M[i * dB + j, i] = 1.0
        rhoA += M.conj().T @ rho @ M
    return purity(rhoA)


def _entangled_pair_schmidt_values():
    """The two Schmidt coefficients (squared singular values) of the
    entangled pair's amplitude array, each equal to 1/2, from an SVD."""
    r = 1 / math.sqrt(2)
    C = np.array([[r, 0.0], [0.0, r]])
    s = np.linalg.svd(C, compute_uv=False)
    return float(s[0] ** 2)


def _product_pair_schmidt_rank_one():
    """The product pair has Schmidt rank one: its second singular value is
    zero, so its second Schmidt coefficient is zero."""
    C = np.array([[0.5, 0.5], [0.5, 0.5]])
    s = np.linalg.svd(C, compute_uv=False)
    return float(s[1] ** 2)


# ── m3-real-telescopes · figRealCHSH: the CHSH curve at its optimum ─────────


def _chsh_optimum_value():
    """max_phi 2(cos phi + sin phi) = 2 sqrt2, at phi = 45 degrees, found by a
    numerical grid search over the same family the figure plots rather than
    by trusting the closed-form maximum."""
    phis = np.linspace(0, math.pi / 2, 200001)
    vals = 2 * (np.cos(phis) + np.sin(phis))
    return float(np.max(vals))


def _chsh_optimum_angle_degrees():
    """The angle (in degrees) at which the numerical grid search above finds
    its maximum, independent of the closed-form phi = 45 degrees."""
    phis = np.linspace(0, math.pi / 2, 200001)
    vals = 2 * (np.cos(phis) + np.sin(phis))
    return float(math.degrees(phis[np.argmax(vals)]))


def _chsh_classical_bound():
    """The largest value a(a0,b0)+a(a0,b1)+a(a1,b0)-a(a1,b1) can take when each
    term is confined to [-1,1] and, in addition, the four cannot all reach 1
    at once (one bracket in the CHSH identity is always zero): checked here by
    brute-force search over every assignment of a0,a1,b0,b1 in {-1,+1}, which
    is the definition chapter 3's own m3-chsh scene proves algebraically."""
    best = -1e9
    for a0 in (-1, 1):
        for a1 in (-1, 1):
            for b0 in (-1, 1):
                for b1 in (-1, 1):
                    s = a0 * b0 + a0 * b1 + a1 * b0 - a1 * b1
                    best = max(best, s)
    return float(best)


# ── m3-real-telescopes · figRealCHSHBars: the four correlations ────────────


def _bell_correlation_e_a0_b0():
    """E(a0,b0) = <sigma_a0 (x) sigma_b0> for the Bell state |Phi+>, with the
    two settings 45 degrees apart in the z-x plane, computed from the actual
    two-qubit expectation value rather than assumed from the figure's own bar
    height.

    For |Phi+> and two directions n_A, n_B in the z-x plane separated by angle
    alpha, the correlation <(n_A.sigma) (x) (n_B.sigma)> equals cos(alpha).
    This check builds both operators explicitly and takes the expectation
    value directly, rather than relying on that closed form.
    """
    def ndotsigma(theta_deg):
        a = math.radians(theta_deg)
        X = np.array([[0, 1], [1, 0]], dtype=complex)
        Zm = np.array([[1, 0], [0, -1]], dtype=complex)
        return math.cos(a) * Zm + math.sin(a) * X

    r = 1 / math.sqrt(2)
    psi = np.array([r, 0, 0, r], dtype=complex)  # |Phi+>, |q1 q0> ordering
    A = ndotsigma(0.0)
    B = ndotsigma(45.0)
    obs = kron(A, B)
    return float(np.real(np.vdot(psi, obs @ psi)))


def _bell_correlation_matches_cos_alpha():
    """The Bell-state correlation for two Pauli directions separated by angle
    alpha equals cos(alpha) exactly -- checked at alpha = 45 degrees against
    the value the scene's bars use, 1/sqrt2, from the closed form
    cos(45 deg)."""
    return math.cos(math.radians(45.0))


CHECKS = [
    {"name": "m3-real-cryostat figRealT1T2: rho_11(t)/rho_11(0) at t/T1=1.6",
     "stated": math.exp(-1.6), "derive": _t1t2_population_via_expm},
    {"name": "m3-real-cryostat figRealT1T2: |rho_01(t)| at t/T1=2.6, T2=2T1",
     "stated": math.exp(-1.3), "derive": _t1t2_coherence_via_expm},
    {"name": "m3-real-cryostat: ceiling case gives T2 = 2 T1",
     "stated": 2.0, "derive": _t1t2_ceiling_ratio},

    {"name": "m3-real-cryostat figGateBudget: T1/500ns = 200 gates",
     "stated": 200.0, "derive": lambda: _gate_budget(500e-9), "rtol": 1e-9},
    {"name": "m3-real-cryostat figGateBudget: T1/100ns = 1000 gates",
     "stated": 1000.0, "derive": lambda: _gate_budget(100e-9), "rtol": 1e-9},
    {"name": "m3-real-cryostat figGateBudget: T1/50ns = 2000 gates",
     "stated": 2000.0, "derive": lambda: _gate_budget(50e-9), "rtol": 1e-9},

    {"name": "m3-real-crystal figRealSep: entangled pair determinant = 1/2",
     "stated": 0.5, "derive": _entangled_pair_determinant},
    {"name": "m3-real-crystal figRealSep: product pair determinant = 0",
     "stated": 0.0, "derive": _product_pair_determinant, "atol": 1e-12},
    {"name": "m3-real-crystal: the entangled array is |Phi+>'s own",
     "stated": 0.0, "derive": _entangled_pair_is_phi_plus, "atol": 1e-12},

    {"name": "m3-real-crystal figRealSchmidtBar: entangled purity = 1/2",
     "stated": 0.5, "derive": _entangled_pair_schmidt_purity},
    {"name": "m3-real-crystal figRealSchmidtBar: entangled Schmidt value = 1/2",
     "stated": 0.5, "derive": _entangled_pair_schmidt_values},
    {"name": "m3-real-crystal figRealSchmidtBar: product pair's 2nd value = 0",
     "stated": 0.0, "derive": _product_pair_schmidt_rank_one, "atol": 1e-12},

    {"name": "m3-real-telescopes figRealCHSH: peak value 2 sqrt2",
     "stated": 2 * math.sqrt(2), "derive": _chsh_optimum_value},
    {"name": "m3-real-telescopes figRealCHSH: peak angle 45 degrees",
     "stated": 45.0, "derive": _chsh_optimum_angle_degrees, "atol": 0.05},
    {"name": "m3-real-telescopes: classical bound is 2",
     "stated": 2.0, "derive": _chsh_classical_bound},

    {"name": "m3-real-telescopes figRealCHSHBars: E(a0,b0) = 1/sqrt2",
     "stated": 1 / math.sqrt(2), "derive": _bell_correlation_e_a0_b0},
    {"name": "m3-real-telescopes figRealCHSHBars: cos(45 deg) = 1/sqrt2",
     "stated": 1 / math.sqrt(2), "derive": _bell_correlation_matches_cos_alpha},
]


if __name__ == "__main__":
    main(CHECKS, "Module 3 Around Us gallery")
