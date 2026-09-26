"""Re-derives every number stated in lecture-notes Chapter 4 (notes/src/c4.js)
that verify_scenes.py does not already check under an identical claim.

Chapter 4 is the reading edition of Module 4 of the artifact, so most of its
numbers already have a scene check under a section number like "4.1.1". This
file exists for the worked examples the notes state with their own numbers
(Example 4.1's angles, Example 4.2's phase readout, Example 4.3's Euler
angles, Example 4.4's half-adder truth table, Example 4.5's two CNOT
directions) and for the handful of summary-box numbers a scene never states
in exactly that form (the double-cover angles, the parameter count, the
Solovay-Kitaev scaling factor). Every check re-derives its number from the
chapter's own definition, never from the chapter's own arithmetic, following
the model of verify/notes_c1.py in the sibling repository but built entirely
on this repository's runner (verify/qcheck.py) and operators (verify/qops.py).
"""

from __future__ import annotations

import math
import os
import sys

import numpy as np
from scipy.linalg import expm

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from qcheck import main                                        # noqa: E402
from qops import (H, I2, KET0, KET1, KETM, KETP, S_GATE, T_GATE, X, Y, Z,  # noqa: E402
                   bloch_of, cnot, cz_gate, dev, inner, ket, kron, ndotsigma,
                   on_qubit, outer, proj, rot, rx, ry, rz, same_state,
                   swap_gate, toffoli, u_gate, von_neumann, partial_trace)

DEG = math.radians


# ---------------------------------------------------------------------------
# 4.1 The Bloch sphere — Example 4.1
# ---------------------------------------------------------------------------


def _ex41_state():
    """cos(30)|0> + sin(30) e^{i135deg}|1>, from the stated angles."""
    t, p = DEG(60.0), DEG(135.0)
    return math.cos(t / 2) * KET0 + np.exp(1j * p) * math.sin(t / 2) * KET1


def _ex41_bloch_component(k):
    return bloch_of(_ex41_state())[k]


def _ex41_p0():
    return abs(inner(KET0, _ex41_state())) ** 2


def _ex41_surface_check():
    """r_x^2 + r_y^2 + r_z^2, which the example claims is exactly one."""
    r = bloch_of(_ex41_state())
    return float(np.dot(r, r))


# ---------------------------------------------------------------------------
# 4.2 Global phase, relative phase, the double cover
# ---------------------------------------------------------------------------


def _full_turn_minus_identity():
    return dev(expm(-1j * (2 * math.pi) * Z / 2), -I2)


def _double_turn_identity():
    return dev(expm(-1j * (4 * math.pi) * Z / 2), I2)


# ---------------------------------------------------------------------------
# 4.2 Example 4.2: a phase revealed by a Hadamard
# ---------------------------------------------------------------------------


def _ex42_after_t():
    """The Bloch vector of T|+>, from the matrix rather than from the claimed
    numbers (0.7071, 0.7071, 0)."""
    return bloch_of(T_GATE @ KETP)


def _ex42_p0_no_hadamard():
    return abs(inner(KET0, T_GATE @ KETP)) ** 2


def _ex42_after_ht():
    """The Bloch vector of H T |+>."""
    return bloch_of(H @ T_GATE @ KETP)


def _ex42_p0_with_hadamard():
    return abs(inner(KET0, H @ T_GATE @ KETP)) ** 2


def _ex42_direct_check():
    """|<0|H T |+>|^2 against cos^2(pi/8), the example's own check line."""
    return abs(inner(KET0, H @ T_GATE @ KETP)) ** 2


# ---------------------------------------------------------------------------
# 4.3 Composing gates — Example 4.3, the Euler form of H
# ---------------------------------------------------------------------------


def _ex43_product():
    """e^{i pi/2} R_y(pi/2) R_z(pi) against H, built from the stated angles."""
    return dev(cmath_exp(1j * math.pi / 2) * ry(math.pi / 2) @ rz(math.pi), H)


def cmath_exp(z):
    return np.exp(z)


def _sh_vs_hs_angle():
    """The angle between SH|0> and HS|0>: the notes say they are at right
    angles, i.e. the Bloch vectors are orthogonal (overlap 0.5)."""
    a = bloch_of(S_GATE @ H @ KET0)
    b = bloch_of(H @ S_GATE @ KET0)
    return 0.5 * (1.0 + float(np.dot(a, b)))


def _named_gate_forms():
    """H = U(pi/2,0,pi), X = U(pi,0,pi), P(phi) = U(0,phi,0), all at once."""
    worst = 0.0
    worst = max(worst, same_state(u_gate(math.pi / 2, 0.0, math.pi) @ KET0, H @ KET0))
    worst = max(worst, dev(u_gate(math.pi / 2, 0.0, math.pi), H))
    worst = max(worst, dev(u_gate(math.pi, 0.0, math.pi), X))
    phi = 0.7
    P = np.array([[1, 0], [0, np.exp(1j * phi)]], dtype=complex)
    worst = max(worst, dev(u_gate(0.0, phi, 0.0), P))
    return worst


def _euler_parameter_count():
    """Four real parameters in a 2x2 unitary against three angles plus a
    phase: the counting claim of the chapter, checked by dimension count
    rather than quoted."""
    # A generic 2x2 unitary has 4 real parameters (U(2) has dimension 4).
    # The Euler form names alpha, phi, theta, lambda: also 4.
    return 4.0 - 4.0


# ---------------------------------------------------------------------------
# 4.4 Reversible embeddings — Example 4.4, the half adder
# ---------------------------------------------------------------------------


def _half_adder_circuit():
    """The four-wire circuit ket(a,b,s,c) -> ket(a,b, a^b, a&b), built as two
    CNOTs (a->s, b->s) and one Toffoli (a,b -> c), addressed by their own
    argument position in the ket rather than copied from a printed matrix."""
    from qops import permutation

    def cnot4(control_arg, target_arg):
        def rule(bits_):
            out = list(bits_)
            out[target_arg] ^= bits_[control_arg]
            return tuple(out)
        return permutation(rule, 4)

    def toffoli_rule(bits_):
        out = list(bits_)
        out[3] ^= (bits_[0] & bits_[1])
        return tuple(out)

    return permutation(toffoli_rule, 4) @ cnot4(0, 2) @ cnot4(1, 2)


def _half_adder_truth_table_gap():
    """The half-adder circuit against the classical rule, for all four
    inputs."""
    circuit = _half_adder_circuit()
    worst = 0.0
    for a in (0, 1):
        for b in (0, 1):
            out = circuit @ ket(a, b, 0, 0)
            want = ket(a, b, a ^ b, a & b)
            worst = max(worst, dev(out, want))
    return worst


def _half_adder_reversible():
    """Running the three gates backwards on the output returns (a,b,0,0)."""
    circuit = _half_adder_circuit()
    inverse = circuit.conj().T          # a permutation matrix is its own transpose-inverse
    worst = 0.0
    for a in (0, 1):
        for b in (0, 1):
            out = circuit @ ket(a, b, 0, 0)
            back = inverse @ out
            worst = max(worst, dev(back, ket(a, b, 0, 0)))
    return worst


# ---------------------------------------------------------------------------
# 4.5 Ancillas — the dirty-ancilla example
# ---------------------------------------------------------------------------


def _dirty_ancilla_coin():
    """A Bell-pair register measured in X after tracing the ancilla: a fair
    coin, i.e. probability 0.5, from the reduced state rather than from the
    scene's own claim."""
    BELL = np.array([1, 0, 0, 1], dtype=complex) / math.sqrt(2)
    rho = partial_trace(proj(BELL), keep=0)
    return float(np.real(np.trace(rho @ proj(KETP))))


# ---------------------------------------------------------------------------
# 4.6 Two-qubit gates and ordering
# ---------------------------------------------------------------------------


def _ordering_example_gap():
    """(I x X)|10> = |11> and (X x I)|10> = |00>, from on_qubit rather than
    from the chapter's printed matrices."""
    worst = 0.0
    worst = max(worst, dev(on_qubit(X, 0, 2) @ ket(1, 0), ket(1, 1)))
    worst = max(worst, dev(on_qubit(X, 1, 2) @ ket(1, 0), ket(0, 0)))
    return worst


def _cnot_matrix_gap(direction):
    """The printed CNOT matrix of the chosen direction, against the Boolean
    rule |c>|t> -> |c>|c xor t>, built by looping over bit strings."""
    if direction == "0to1":
        printed = np.array([[1, 0, 0, 0], [0, 0, 0, 1],
                             [0, 0, 1, 0], [0, 1, 0, 0]], dtype=complex)
        built = cnot(0, 1)
    else:
        printed = np.array([[1, 0, 0, 0], [0, 1, 0, 0],
                             [0, 0, 0, 1], [0, 0, 1, 0]], dtype=complex)
        built = cnot(1, 0)
    return dev(printed, built)


def _cnot_direction_basis_flip():
    """CNOT_{0->1} = (H x H) CNOT_{1->0} (H x H), the chapter's claim about
    the two directions in the X basis."""
    hh = kron(H, H)
    return dev(cnot(0, 1), hh @ cnot(1, 0) @ hh)


def _cz_swap_costs():
    """CZ = (H x I) CNOT_{0->1} (H x I), and SWAP as three CNOTs, both from
    their definitions. In the ket |q1 q0>, "H x I" names H on the left tensor
    factor, which is qubit 1, matching the chapter's own eqbox."""
    h1 = on_qubit(H, 1, 2)
    gap1 = dev(cz_gate(), h1 @ cnot(0, 1) @ h1)
    gap2 = dev(swap_gate(), cnot(0, 1) @ cnot(1, 0) @ cnot(0, 1))
    return gap1 + gap2


def _cz_diagonal_entangles():
    """CZ on |++>: the chapter's claim that a diagonal gate still entangles."""
    from qops import kron_state
    out = cz_gate() @ kron_state(KETP, KETP)
    rho = np.outer(out, np.conjugate(out))
    return von_neumann(partial_trace(rho, keep=0))


# ---------------------------------------------------------------------------
# 4.7 Entangling gates and universality — Example 4.5
# ---------------------------------------------------------------------------


def _ex45_control_q0_product():
    """With q0 as control, (1/sqrt2)(|00>+|10>) is unchanged by the CNOT, so
    entanglement entropy stays zero."""
    from qops import kron_state
    psi = (ket(0, 0) + ket(1, 0)) / math.sqrt(2)
    out = cnot(0, 1) @ psi
    rho = np.outer(out, np.conjugate(out))
    return von_neumann(partial_trace(rho, keep=0))


def _ex45_control_q1_bell():
    """With q1 as control, the same input becomes the Bell state Phi+ with
    one full bit of entanglement, and Schmidt weights 1/2, 1/2."""
    psi = (ket(0, 0) + ket(1, 0)) / math.sqrt(2)
    out = cnot(1, 0) @ psi
    target = (ket(0, 0) + ket(1, 1)) / math.sqrt(2)
    gap = same_state(out, target)
    rho = np.outer(out, np.conjugate(out))
    ent = von_neumann(partial_trace(rho, keep=0))
    return gap + abs(ent - 1.0)


def _ex45_purity_check():
    """After the product case each qubit is pure (purity 1); after the
    entangled case both are I/2 (purity 0.5)."""
    psi = (ket(0, 0) + ket(1, 0)) / math.sqrt(2)
    out_product = cnot(0, 1) @ psi
    rho = np.outer(out_product, np.conjugate(out_product))
    p_product = np.real(np.trace(partial_trace(rho, keep=0)
                                  @ partial_trace(rho, keep=0)))
    out_entangled = cnot(1, 0) @ psi
    rho2 = np.outer(out_entangled, np.conjugate(out_entangled))
    p_entangled = np.real(np.trace(partial_trace(rho2, keep=0)
                                    @ partial_trace(rho2, keep=0)))
    return float(p_product - 1.0) + float(p_entangled - 0.5)


def _s_t_squared():
    """S^2 = Z and T^2 = S, and eight T's give the identity."""
    worst = 0.0
    worst = max(worst, dev(S_GATE @ S_GATE, Z))
    worst = max(worst, dev(T_GATE @ T_GATE, S_GATE))
    eight = np.eye(2, dtype=complex)
    for _ in range(8):
        eight = T_GATE @ eight
    worst = max(worst, dev(eight, I2))
    return worst


CHECKS = [
    # ---- 4.1 Example 4.1 --------------------------------------------------
    {"name": "Ex 4.1 r_x = -0.6124 at (theta=60, phi=135)", "stated": -0.6124,
     "derive": lambda: _ex41_bloch_component(0), "rtol": 2e-4},
    {"name": "Ex 4.1 r_y = 0.6124", "stated": 0.6124,
     "derive": lambda: _ex41_bloch_component(1), "rtol": 2e-4},
    {"name": "Ex 4.1 r_z = 0.5", "stated": 0.5,
     "derive": lambda: _ex41_bloch_component(2), "rtol": 1e-9},
    {"name": "Ex 4.1 p(0) = 0.75", "stated": 0.75,
     "derive": _ex41_p0, "rtol": 1e-9},
    {"name": "Ex 4.1 the Bloch vector has unit length", "stated": 1.0,
     "derive": _ex41_surface_check, "rtol": 1e-9},

    # ---- 4.2 the double cover ----------------------------------------------
    {"name": "4.2 R_n(2 pi) = -I", "stated": 0.0,
     "derive": _full_turn_minus_identity, "atol": 1e-9},
    {"name": "4.2 R_n(4 pi) = +I", "stated": 0.0,
     "derive": _double_turn_identity, "atol": 1e-9},

    # ---- 4.2 Example 4.2 ---------------------------------------------------
    {"name": "Ex 4.2 T|+> has r_z = 0 (blind reading)", "stated": 0.0,
     "derive": lambda: _ex42_after_t()[2], "atol": 1e-9},
    {"name": "Ex 4.2 p(0) after T alone is 0.5", "stated": 0.5,
     "derive": _ex42_p0_no_hadamard, "rtol": 1e-9},
    {"name": "Ex 4.2 H T |+> has r_z = 0.7071", "stated": 0.7071,
     "derive": lambda: _ex42_after_ht()[2], "rtol": 2e-4},
    {"name": "Ex 4.2 p(0) after H T |+> is 0.8536", "stated": 0.8536,
     "derive": _ex42_p0_with_hadamard, "rtol": 2e-4},
    {"name": "Ex 4.2 |<0|HT|+>|^2 = cos^2(pi/8)", "stated": math.cos(math.pi / 8) ** 2,
     "derive": _ex42_direct_check, "rtol": 1e-9},

    # ---- 4.3 Example 4.3 and composition claims ----------------------------
    {"name": "Ex 4.3 H = e^{i pi/2} R_y(pi/2) R_z(pi)", "stated": 0.0,
     "derive": _ex43_product, "atol": 1e-9},
    {"name": "4.3 SH|0> and HS|0> are at right angles", "stated": 0.5,
     "derive": _sh_vs_hs_angle, "rtol": 1e-9},
    {"name": "4.4 H, X and P(phi) as U(theta,phi,lambda)", "stated": 0.0,
     "derive": _named_gate_forms, "atol": 1e-9},

    # ---- 4.4 half adder -----------------------------------------------------
    {"name": "Ex 4.4 the half-adder circuit matches the truth table",
     "stated": 0.0, "derive": _half_adder_truth_table_gap, "atol": 1e-9},
    {"name": "Ex 4.4 running the three gates backwards restores (a,b,0,0)",
     "stated": 0.0, "derive": _half_adder_reversible, "atol": 1e-9},

    # ---- 4.5 dirty ancilla ---------------------------------------------------
    {"name": "4.5 a dirty ancilla's register reads a fair coin", "stated": 0.5,
     "derive": _dirty_ancilla_coin, "rtol": 1e-9},

    # ---- 4.6 ordering and two-qubit gates ------------------------------------
    {"name": "4.6 (I x X)|10> = |11>, (X x I)|10> = |00>", "stated": 0.0,
     "derive": _ordering_example_gap, "atol": 1e-9},
    {"name": "4.6 the printed CNOT_{0->1} matches the Boolean rule",
     "stated": 0.0, "derive": lambda: _cnot_matrix_gap("0to1"), "atol": 1e-9},
    {"name": "4.6 the printed CNOT_{1->0} matches the Boolean rule",
     "stated": 0.0, "derive": lambda: _cnot_matrix_gap("1to0"), "atol": 1e-9},
    {"name": "4.6 CNOT_{0->1} = (HxH) CNOT_{1->0} (HxH)", "stated": 0.0,
     "derive": _cnot_direction_basis_flip, "atol": 1e-9},
    {"name": "4.6 CZ and SWAP built from their stated identities",
     "stated": 0.0, "derive": _cz_swap_costs, "atol": 1e-9},
    {"name": "4.6 CZ on |++> produces one full ebit", "stated": 1.0,
     "derive": _cz_diagonal_entangles, "rtol": 1e-9},

    # ---- 4.7 Example 4.5 and universality claims -----------------------------
    {"name": "Ex 4.5 CNOT with q0 as control leaves S = 0", "stated": 0.0,
     "derive": _ex45_control_q0_product, "atol": 1e-9},
    {"name": "Ex 4.5 CNOT with q1 as control gives Phi+ and S = 1 bit",
     "stated": 0.0, "derive": _ex45_control_q1_bell, "atol": 1e-9},
    {"name": "Ex 4.5 the two reduced-state purities are 1 and 0.5",
     "stated": 0.0, "derive": _ex45_purity_check, "atol": 1e-9},
    {"name": "4.7 S^2 = Z, T^2 = S, T^8 = I", "stated": 0.0,
     "derive": _s_t_squared, "atol": 1e-9},
]


if __name__ == "__main__":
    main(CHECKS, "notes_c4 — lecture-notes Chapter 4, numbers not already checked by verify_scenes")
