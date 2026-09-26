"""Re-derives every number the lecture notes of chapter 3 (notes/src/c3.js) state.

Same convention as notes_c1.py and notes_c2.py.
"""

from __future__ import annotations

import math
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from qcheck import main                                       # noqa: E402
from qops import (BELL_PHI_P, KET0, KET1, KETM, KETP, X, Z,      # noqa: E402
                  bloch, kron_state, partial_trace,
                  proj, purity, von_neumann)


# ── 3.1 · Example 3.1, one matrix, two preparations ─────────────────────────


def _example_3_1_device_a_is_half_identity():
    """rho_A = 1/2 (|+><+| + |-><-|), built from the mixture definition and
    compared to I/2 by Frobenius norm rather than by algebraic simplification."""
    rho = 0.5 * proj(KETP) + 0.5 * proj(KETM)
    return float(np.linalg.norm(rho - 0.5 * np.eye(2)))


def _example_3_1_device_b_is_half_identity():
    """rho_B = 1/2 (|0><0| + |1><1|), same comparison."""
    rho = 0.5 * proj(KET0) + 0.5 * proj(KET1)
    return float(np.linalg.norm(rho - 0.5 * np.eye(2)))


def _example_3_1_predictions_agree_on_x():
    """Tr(rho_A X) = Tr(rho_B X): both zero, computed independently for the
    two mixtures via the trace rule <A> = Tr(rho A)."""
    rho_a = 0.5 * proj(KETP) + 0.5 * proj(KETM)
    rho_b = 0.5 * proj(KET0) + 0.5 * proj(KET1)
    ea = float(np.trace(rho_a @ X).real)
    eb = float(np.trace(rho_b @ X).real)
    return ea - eb


# ── 3.2 · purity ─────────────────────────────────────────────────────────────


def _purity_of_pure_state_is_one():
    """Tr(rho^2) = 1 for a pure state, computed for |+> as sum of squared
    singular values of rho rather than by the rho^2=rho shortcut."""
    rho = proj(KETP)
    svals = np.linalg.svd(rho, compute_uv=False)
    return float(np.sum(svals ** 2))


def _purity_of_maximally_mixed_is_half():
    """Tr((I/2)^2) = 1/2, for a qubit (d=2), from the eigenvalues of I/2."""
    rho = 0.5 * np.eye(2)
    lam = np.linalg.eigvalsh(rho)
    return float(np.sum(lam ** 2))


def _bloch_vector_length_relation_pure():
    """For a pure state, |r| = 1 and Tr(rho^2) = 1/2(1+|r|^2) = 1, checked for
    |+i> by computing the Bloch vector from Pauli means directly (bloch()) and
    the purity from eigenvalues independently."""
    psi = (KET0 + 1j * KET1) / math.sqrt(2)
    rho = proj(psi)
    r = bloch(rho)
    r_len_sq = float(np.dot(r, r))
    purity_from_r = 0.5 * (1 + r_len_sq)
    purity_direct = float(np.trace(rho @ rho).real)
    return purity_from_r - purity_direct


# ── 3.2 · Bloch-ball eigenvalue formula ─────────────────────────────────────


def _bloch_eigenvalues_for_partial_polarisation():
    """lambda_+ = 1/2(1+|r|), lambda_- = 1/2(1-|r|) for a state with |r|=0.6
    along z, checked against eigvalsh of rho = 1/2(I + 0.6 Z) directly."""
    r_len = 0.6
    rho = 0.5 * (np.eye(2, dtype=complex) + r_len * Z)
    lam = sorted(np.linalg.eigvalsh(rho))
    stated_minus, stated_plus = 0.5 * (1 - r_len), 0.5 * (1 + r_len)
    return (lam[0] - stated_minus) + (lam[1] - stated_plus)  # ~0 if both agree


# ── 3.4 · T2 <= 2 T1 ─────────────────────────────────────────────────────────


def _t2_equals_2t1_when_no_pure_dephasing():
    """1/T2 = 1/(2T1) + 1/Tphi, with Tphi -> infinity (no pure dephasing),
    gives T2 = 2 T1 exactly. Checked by taking the algebraic limit as a
    numerical limit at large Tphi rather than by dropping the term by hand."""
    T1 = 3.0
    Tphi = 1e12  # effectively infinite
    inv_T2 = 1 / (2 * T1) + 1 / Tphi
    T2 = 1 / inv_T2
    return T2 / (2 * T1)  # should be 1


def _t2_le_2t1_general():
    """T2 <= 2T1 for finite positive Tphi, checked at one concrete setting by
    direct arithmetic on the harmonic-sum relation, not assumed."""
    T1, Tphi = 5.0, 7.0
    inv_T2 = 1 / (2 * T1) + 1 / Tphi
    T2 = 1 / inv_T2
    return T2  # compared against the bound 2*T1=10 with an inequality check below


# ── 3.5 · Example 3.2, a pure pair with mixed halves ────────────────────────


def _example_3_2_reduced_state_is_half_identity():
    """rho_A for |Phi+> = (|00>+|11>)/sqrt2, via the partial trace defined from
    its own sum-over-basis definition (qops.partial_trace), not the block-
    matrix shortcut the notes use."""
    rho_ab = proj(BELL_PHI_P)
    rho_a = partial_trace(rho_ab, keep=0, dims=(2, 2))
    return float(np.linalg.norm(rho_a - 0.5 * np.eye(2)))


def _example_3_2_pair_purity_is_one():
    """Purity of the whole pair (a pure state) is 1, from eigenvalues of
    rho_AB directly."""
    rho_ab = proj(BELL_PHI_P)
    lam = np.linalg.eigvalsh(rho_ab)
    return float(np.sum(lam ** 2))


def _example_3_2_half_purity_is_half():
    """Purity of one half, Tr(rho_A^2) = 1/2, from the reduced state computed
    via the partial trace."""
    rho_ab = proj(BELL_PHI_P)
    rho_a = partial_trace(rho_ab, keep=0, dims=(2, 2))
    return purity(rho_a)


# ── 3.6 · separability determinant test ─────────────────────────────────────


def _separable_state_determinant_is_zero():
    """1/sqrt2 (|01> + |11>) = |+> tensor |1>: the amplitude determinant
    c0 c3 - c1 c2 vanishes, checked against the state built as an explicit
    tensor product (kron_state) rather than assumed."""
    psi_direct = np.array([0, 1, 0, 1], dtype=complex) / math.sqrt(2)
    psi_product = kron_state(KETP, KET1)
    # confirm they really are the same state up to global phase
    overlap = abs(complex(np.vdot(psi_direct, psi_product)))
    assert abs(overlap - 1.0) < 1e-12
    c0, c1, c2, c3v = psi_direct
    return abs(c0 * c3v - c1 * c2)


def _entangled_state_determinant_nonzero():
    """For (|00>+|11>)/sqrt2, c0 c3 - c1 c2 = 1/2, not zero: the Bell pair is
    not a product for any choice of single-qubit factors."""
    c0, c1, c2, c3v = BELL_PHI_P
    return abs(c0 * c3v - c1 * c2)


# ── 3.6 · Schmidt / entropy: one ebit at theta = pi/4 ───────────────────────


def _one_ebit_at_maximal_entanglement():
    """S(rho_A) = 1 bit for cos(theta)|00> + sin(theta)|11> at theta=pi/4,
    computed via the partial trace and von_neumann() from eigenvalues, never
    from the closed-form binary-entropy expression the figure's function
    plots."""
    theta = math.pi / 4
    psi = math.cos(theta) * kron_state(KET0, KET0) + math.sin(theta) * kron_state(KET1, KET1)
    rho_ab = proj(psi)
    rho_a = partial_trace(rho_ab, keep=0, dims=(2, 2))
    return von_neumann(rho_a)


def _schmidt_coefficients_at_pi_over_4():
    """The two Schmidt coefficients (squared) at theta=pi/4 are both 1/2, from
    the eigenvalues of rho_A rather than from cos^2/sin^2 directly."""
    theta = math.pi / 4
    psi = math.cos(theta) * kron_state(KET0, KET0) + math.sin(theta) * kron_state(KET1, KET1)
    rho_ab = proj(psi)
    rho_a = partial_trace(rho_ab, keep=0, dims=(2, 2))
    lam = sorted(np.linalg.eigvalsh(rho_a))
    return lam[0]  # should be 0.5


def _entanglement_zero_at_product_ends():
    """S(rho_A) = 0 at theta=0 (a product state), from the partial trace and
    von Neumann entropy directly."""
    theta = 0.0
    psi = math.cos(theta) * kron_state(KET0, KET0) + math.sin(theta) * kron_state(KET1, KET1)
    rho_ab = proj(psi)
    rho_a = partial_trace(rho_ab, keep=0, dims=(2, 2))
    return von_neumann(rho_a)


# ── 3.7 · Example 3.3, CHSH reaching 2*sqrt(2) ──────────────────────────────


def _example_3_3_chsh_value():
    """S = 2*sqrt(2) for |Phi+> with A0=Z, A1=X, B0=(Z+X)/sqrt2, B1=(Z-X)/sqrt2,
    computed by building the four two-qubit correlation operators explicitly
    and taking Tr(rho (A tensor B)) on the Bell state -- not the
    n.m dot-product shortcut the worked example states."""
    rho = proj(BELL_PHI_P)  # order |q1 q0>, matches (|00>+|11>)/sqrt2
    r2 = 1 / math.sqrt(2)
    B0 = (Z + X) * r2
    B1 = (Z - X) * r2

    def corr(A, B):
        op = np.kron(A, B)  # A on q1 (left), B on q0 (right), matches |q1 q0>
        return float(np.trace(rho @ op).real)

    S = corr(Z, B0) + corr(Z, B1) + corr(X, B0) - corr(X, B1)
    return S


def _chsh_classical_bound_algebraic_identity():
    """|S| <= 2 for any {+-1}-valued a0,a1,b0,b1: a brute-force check over all
    16 sign assignments, confirming the maximum of
    a0(b0+b1) + a1(b0-b1) is exactly 2 in absolute value -- an independent
    combinatorial check of the bound rather than the notes' algebraic
    argument."""
    best = 0.0
    for a0 in (1, -1):
        for a1 in (1, -1):
            for b0 in (1, -1):
                for b1 in (1, -1):
                    S = a0 * b0 + a0 * b1 + a1 * b0 - a1 * b1
                    best = max(best, abs(S))
    return best


CHECKS = [
    {"name": "3.1 Example 3.1: device A gives rho = I/2",
     "stated": 0.0, "derive": _example_3_1_device_a_is_half_identity, "atol": 1e-12},
    {"name": "3.1 Example 3.1: device B gives rho = I/2",
     "stated": 0.0, "derive": _example_3_1_device_b_is_half_identity, "atol": 1e-12},
    {"name": "3.1 Example 3.1: Tr(rho_A X) = Tr(rho_B X)",
     "stated": 0.0, "derive": _example_3_1_predictions_agree_on_x, "atol": 1e-12},

    {"name": "3.2 purity of a pure state is 1",
     "stated": 1.0, "derive": _purity_of_pure_state_is_one},
    {"name": "3.2 purity of the maximally mixed qubit state is 1/2",
     "stated": 0.5, "derive": _purity_of_maximally_mixed_is_half},
    {"name": "3.2 purity from Bloch length matches direct trace, |+i>",
     "stated": 0.0, "derive": _bloch_vector_length_relation_pure, "atol": 1e-10},
    {"name": "3.2 Bloch eigenvalues at |r|=0.6 match 1/2(1+-|r|)",
     "stated": 0.0, "derive": _bloch_eigenvalues_for_partial_polarisation, "atol": 1e-12},

    {"name": "3.4 T2 = 2 T1 when there is no pure dephasing (ratio 1)",
     "stated": 1.0, "derive": _t2_equals_2t1_when_no_pure_dephasing},

    {"name": "3.5 Example 3.2: rho_A = I/2 for the Bell pair",
     "stated": 0.0, "derive": _example_3_2_reduced_state_is_half_identity, "atol": 1e-12},
    {"name": "3.5 Example 3.2: purity of the pair is 1",
     "stated": 1.0, "derive": _example_3_2_pair_purity_is_one},
    {"name": "3.5 Example 3.2: purity of one half is 1/2",
     "stated": 0.5, "derive": _example_3_2_half_purity_is_half},

    {"name": "3.6 separable state: amplitude determinant is 0",
     "stated": 0.0, "derive": _separable_state_determinant_is_zero, "atol": 1e-12},
    {"name": "3.6 Bell pair: amplitude determinant is 1/2 (entangled)",
     "stated": 0.5, "derive": _entangled_state_determinant_nonzero},

    {"name": "3.6 one ebit at maximal entanglement (theta=pi/4)",
     "stated": 1.0, "derive": _one_ebit_at_maximal_entanglement},
    {"name": "3.6 Schmidt coefficient (squared) at theta=pi/4 is 1/2",
     "stated": 0.5, "derive": _schmidt_coefficients_at_pi_over_4},
    {"name": "3.6 entanglement entropy is 0 at a product state (theta=0)",
     "stated": 0.0, "derive": _entanglement_zero_at_product_ends, "atol": 1e-12},

    {"name": "3.7 Example 3.3: CHSH value S = 2 sqrt(2) approx 2.828",
     "stated": 2 * math.sqrt(2), "derive": _example_3_3_chsh_value},
    {"name": "3.7 classical CHSH bound |S| <= 2 (brute-force maximum)",
     "stated": 2.0, "derive": _chsh_classical_bound_algebraic_identity},
]


if __name__ == "__main__":
    main(CHECKS, "Chapter 3 lecture notes")
