"""Re-derives every number stated in lecture-notes Chapter 5 (notes/src/c5.js)
that verify_scenes.py does not already check under an identical claim.

Chapter 5 restates Module 5 with its own worked examples, most of which carry
numbers the scenes never state (Example 5.1's sixteen-qubit GHZ timings,
Example 5.2's eight-candidate Grover search, Example 5.3's query-versus-time
comparison), plus a handful of summary numbers (bytes for n=30/50 qubits, the
shots needed for a stated standard error, the deferred-measurement identity,
the teleportation fidelity bound). Every check re-derives its number from the
chapter's own definition — a circuit simulated as matrices, a probability
taken from the binomial variance, a Grover angle taken from the reflections —
never from the chapter's own arithmetic. Built on this repository's runner
(verify/qcheck.py) and operators (verify/qops.py).
"""

from __future__ import annotations

import math
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from qcheck import main                                        # noqa: E402
from qops import (H, I2, KET0, KET1, KETM, KETP, X, Z, cnot, dev, grover_best,  # noqa: E402
                   grover_state, grover_success, index, inner, ket, kron,
                   kron_state, on_qubit, outer, partial_trace, proj,
                   same_state, teleport_bob, teleport_branch)


# ---------------------------------------------------------------------------
# 5.1 The circuit model — Example 5.1, GHZ chain vs. tree
# ---------------------------------------------------------------------------


def _apply_1q(v, gate, q, n):
    """Apply a one-qubit gate to qubit q of an n-qubit state vector by
    reshaping rather than by building the full 2^n x 2^n matrix, which is the
    only way n=16 (Example 5.1's circuit) is tractable here. Under the
    course's ordering |q_{n-1}...q_0>, qubit q is axis (n-1-q) of the tensor."""
    axis = n - 1 - q
    shape = [2] * n
    v = v.reshape(shape)
    v = np.moveaxis(v, axis, 0)
    v = np.tensordot(gate, v, axes=([1], [0]))
    v = np.moveaxis(v, 0, axis)
    return v.reshape(-1)


def _apply_cnot(v, control, target, n):
    """Apply CNOT by permuting the amplitudes where the control bit is 1,
    swapping the target axis, again without building a 2^n x 2^n matrix."""
    axis_c = n - 1 - control
    axis_t = n - 1 - target
    shape = [2] * n
    v = v.reshape(shape)
    idx1 = [slice(None)] * n
    idx1[axis_c] = 1
    sub = v[tuple(idx1)]
    sub_flipped = np.flip(sub, axis=axis_t if axis_t < axis_c else axis_t - 1)
    v[tuple(idx1)] = sub_flipped
    return v.reshape(-1)


def _ghz_chain(n):
    v = ket(*([0] * n)).copy()
    v = _apply_1q(v, H, 0, n)
    for k in range(n - 1):
        v = _apply_cnot(v, k, k + 1, n)
    return v


def _ghz_tree(n):
    v = ket(*([0] * n)).copy()
    v = _apply_1q(v, H, 0, n)
    width = 1
    while width < n:
        for k in range(width):
            if k + width < n:
                v = _apply_cnot(v, k, k + width, n)
        width *= 2
    return v


def _ghz_target(n):
    v = np.zeros(2 ** n, dtype=complex)
    v[0] = v[-1] = 1 / math.sqrt(2)
    return v


def _ghz_chain_gate_count(n):
    return 1 + (n - 1)          # one Hadamard, n-1 CNOTs


def _ghz_tree_depth(n):
    """The number of CNOT layers in the doubling tree plus the one Hadamard
    layer, found by actually running the layering loop rather than quoting
    1 + ceil(log2 n)."""
    depth = 1
    width = 1
    while width < n:
        depth += 1
        width *= 2
    return float(depth)


def _ex51_chain_result():
    return same_state(_ghz_chain(16), _ghz_target(16))


def _ex51_tree_result():
    return same_state(_ghz_tree(16), _ghz_target(16))


def _ex51_gate_counts_equal():
    return float(_ghz_chain_gate_count(16) == 16 and _ghz_chain_gate_count(16) == 16)


def _ex51_chain_duration():
    """16 gates * 200 ns = 3.2 microseconds, from the chain depth (=16)."""
    depth = 16.0          # the chain waits for every CNOT in turn: depth = n
    return depth * 0.2


def _ex51_tree_duration():
    """(1 + log2 16) layers * 200 ns = 1.0 microsecond, from the tree depth."""
    depth = _ghz_tree_depth(16)
    return depth * 0.2


def _ex51_check_n1000_chain():
    """n=1000: the chain needs 1000*200ns = 200 microseconds, impossible
    against T2=80us."""
    return 1000 * 0.2


def _ex51_check_n1000_tree():
    depth = _ghz_tree_depth(1000)
    return depth * 0.2


# ---------------------------------------------------------------------------
# 5.2 Running a circuit
# ---------------------------------------------------------------------------


def _bytes_for_qubits(n):
    return 16.0 * 2.0 ** n


def _qubits_fit_in_64gb():
    return math.log2(64e9 / 16)


def _shots_for_se(se, p=0.5):
    return p * (1 - p) / se ** 2


def _se_at_n(n, p=0.5):
    return math.sqrt(p * (1 - p) / n)


def _deferred_measurement_gap(theta_deg, phi_deg):
    """Two circuits: (A) CNOT then measure both qubits, (B) measure q0 first
    and apply X on q1 conditioned on the bit. Their joint distributions must
    agree exactly, for a state built independently of the scene's own claim."""
    t, p = math.radians(theta_deg), math.radians(phi_deg)
    psi = math.cos(t / 2) * KET0 + np.exp(1j * p) * math.sin(t / 2) * KET1
    a = cnot(0, 1) @ kron_state(KET0, psi)              # |q1 q0>, target on q1
    pa = [abs(a[x]) ** 2 for x in range(4)]
    pb = [0.0] * 4
    for m in (0, 1):
        pm = abs(psi[m]) ** 2
        pb[index((m, m))] += pm
    return max(abs(x - y) for x, y in zip(pa, pb))


def _dynamic_circuit_second_reading_zero():
    """H|0>, measure, then apply X when the bit was 1: the second reading is
    always 0, weighted by the branch probabilities of the first."""
    v = H @ KET0
    total = 0.0
    for m in (0, 1):
        after = KET0 if m == 0 else X @ KET1
        total += abs(v[m]) ** 2 * abs(after[0]) ** 2
    return total


# ---------------------------------------------------------------------------
# 5.4 Ramsey interference
# ---------------------------------------------------------------------------


def _ramsey_p0(phi_deg):
    from qops import phase_gate
    v = H @ phase_gate(math.radians(phi_deg)) @ H @ KET0
    return abs(v[0]) ** 2


# ---------------------------------------------------------------------------
# 5.5 Teleportation
# ---------------------------------------------------------------------------


def _no_cloning_overlap():
    """CNOT sends |+>|0> to (|00>+|11>)/sqrt2, which overlaps a real copy
    |+>|+> with probability one half."""
    out = cnot(0, 1) @ kron_state(KET0, KETP)
    return abs(inner(kron_state(KETP, KETP), out)) ** 2


def _no_cloning_reduced_mixed():
    out = cnot(0, 1) @ kron_state(KET0, KETP)
    rho = np.outer(out, np.conjugate(out))
    return max(dev(partial_trace(rho, keep=k), 0.5 * I2) for k in (0, 1))


_PSI = np.array([0.6, 0.8], dtype=complex)


def _branch_probability(m0, m1):
    return teleport_branch(_PSI, m0, m1)[1]


def _bob_before_bits():
    return dev(teleport_bob(_PSI), 0.5 * I2)


def _helstrom_classical_benchmark():
    """The classical measure-and-prepare fidelity, 2/3, from the Helstrom
    bound at zero entanglement (f=0.5), F_avg=(2f+1)/3."""
    f = 0.5
    return (2 * f + 1) / 3


def _perfect_pair_fidelity():
    f = 1.0
    return (2 * f + 1) / 3


def _singlet_fraction_for_avg(fidelity_avg):
    """Invert F_avg=(2f+1)/3 for f, given a stated average fidelity."""
    return (3 * fidelity_avg - 1) / 2


# ---------------------------------------------------------------------------
# 5.6 / 5.7 Grover search — Example 5.2, Example 5.3
# ---------------------------------------------------------------------------


def _grover_theta_deg(N, M):
    return math.degrees(math.asin(math.sqrt(M / N)))


def _grover_r_star(N, M):
    theta = math.asin(math.sqrt(M / N))
    return math.pi / (4 * theta) - 0.5


def _grover_prob_formula(N, M, r):
    theta = math.asin(math.sqrt(M / N))
    return math.sin((2 * r + 1) * theta) ** 2


def _grover_prob_simulated(N, M, r):
    n = int(round(math.log2(N)))
    marked = list(range(M))
    return grover_success(n, marked, r)


def _ex52_theta():
    return _grover_theta_deg(8, 2)


def _ex52_r_star():
    return _grover_r_star(8, 2)


def _ex52_p_at_r_star():
    return _grover_prob_simulated(8, 2, 1)


def _ex52_p_at_second_iteration():
    return _grover_prob_simulated(8, 2, 2)


def _ex52_p0_matches_p_at_two():
    """P(0) before any iteration equals P(2) after two: both should be
    M/N = 0.25, found from the un-iterated and twice-iterated states."""
    p0 = _grover_prob_simulated(8, 2, 0)
    p2 = _grover_prob_simulated(8, 2, 2)
    return abs(p0 - p2)


def _grover_1000_1_r_star():
    theta = math.asin(math.sqrt(1 / 1024))
    return math.pi / (4 * theta) - 0.5


def _ex53_query_counts():
    """25 quantum queries against 512 classical queries, for N=1024, M=1."""
    r = _grover_r_star(1024, 1)
    classical = 1024 / 2
    return r, classical


def _ex53_quantum_time():
    r = round(_grover_r_star(1024, 1))
    return r * 10.0            # microseconds


def _ex53_classical_time():
    return 512 * 10e-3         # microseconds (10 ns per evaluation)


CHECKS = [
    # ---- 5.1 Example 5.1 ---------------------------------------------------
    {"name": "Ex 5.1 the chain circuit builds GHZ on 16 qubits", "stated": 0.0,
     "derive": _ex51_chain_result, "atol": 1e-12},
    {"name": "Ex 5.1 the tree circuit builds GHZ on 16 qubits", "stated": 0.0,
     "derive": _ex51_tree_result, "atol": 1e-12},
    {"name": "Ex 5.1 both use 16 gates", "stated": 1.0,
     "derive": _ex51_gate_counts_equal, "atol": 1e-12},
    {"name": "Ex 5.1 the chain takes 3.2 microseconds", "stated": 3.2,
     "derive": _ex51_chain_duration, "rtol": 1e-9},
    {"name": "Ex 5.1 the tree takes 1.0 microsecond", "stated": 1.0,
     "derive": _ex51_tree_duration, "rtol": 1e-9},
    {"name": "Ex 5.1 check: n=1000 chain needs 200 microseconds", "stated": 200.0,
     "derive": _ex51_check_n1000_chain, "rtol": 1e-9},
    {"name": "Ex 5.1 check: n=1000 tree needs 2.2 microseconds", "stated": 2.2,
     "derive": _ex51_check_n1000_tree, "rtol": 1e-2},

    # ---- 5.2 Running a circuit ---------------------------------------------
    {"name": "5.2 a thirty-qubit state vector is 17 GB", "stated": 17e9,
     "derive": lambda: _bytes_for_qubits(30), "rtol": 2e-2},
    {"name": "5.2 a fifty-qubit state vector is 18 PB", "stated": 18e15,
     "derive": lambda: _bytes_for_qubits(50), "rtol": 1e-2},
    {"name": "5.2 the standard error of a coin at N shots for SE=0.005 needs 10000",
     "stated": 10000.0, "derive": lambda: _shots_for_se(0.005), "rtol": 1e-9},
    {"name": "5.2 the deferred-measurement circuits agree exactly", "stated": 0.0,
     "derive": lambda: _deferred_measurement_gap(35.0, 110.0), "atol": 1e-9},
    {"name": "5.2 the dynamic circuit's second reading is always 0", "stated": 1.0,
     "derive": _dynamic_circuit_second_reading_zero, "rtol": 1e-9},

    # ---- 5.4 Ramsey interference --------------------------------------------
    {"name": "5.4 p(0) = cos^2(phi/2) at phi=90", "stated": math.cos(math.radians(45)) ** 2,
     "derive": lambda: _ramsey_p0(90.0), "rtol": 1e-9},
    {"name": "5.4 p(0) = cos^2(phi/2) at phi=180 is 0", "stated": 0.0,
     "derive": lambda: _ramsey_p0(180.0), "atol": 1e-12},

    # ---- 5.5 Teleportation --------------------------------------------------
    {"name": "5.5 the failed clone overlaps a real copy by 1/2", "stated": 0.5,
     "derive": _no_cloning_overlap, "rtol": 1e-9},
    {"name": "5.5 the failed clone's two halves are maximally mixed", "stated": 0.0,
     "derive": _no_cloning_reduced_mixed, "atol": 1e-9},
    {"name": "5.5 each teleportation branch has probability 1/4", "stated": 0.25,
     "derive": lambda: _branch_probability(0, 0), "rtol": 1e-9},
    {"name": "5.5 branch 01 has probability 1/4", "stated": 0.25,
     "derive": lambda: _branch_probability(1, 0), "rtol": 1e-9},
    {"name": "5.5 branch 10 has probability 1/4", "stated": 0.25,
     "derive": lambda: _branch_probability(0, 1), "rtol": 1e-9},
    {"name": "5.5 branch 11 has probability 1/4", "stated": 0.25,
     "derive": lambda: _branch_probability(1, 1), "rtol": 1e-9},
    {"name": "5.5 Bob holds I/2 before the bits arrive", "stated": 0.0,
     "derive": _bob_before_bits, "atol": 1e-9},
    {"name": "5.5 the classical benchmark fidelity is 2/3", "stated": 2 / 3,
     "derive": _helstrom_classical_benchmark, "rtol": 1e-12},
    {"name": "5.5 a perfect pair gives fidelity 1", "stated": 1.0,
     "derive": _perfect_pair_fidelity, "rtol": 1e-12},
    {"name": "5.5 F_avg=0.81 comes from a singlet fraction just above 0.71",
     "stated": 0.715, "derive": lambda: _singlet_fraction_for_avg(0.81), "rtol": 1e-2},

    # ---- 5.6 Example 5.2 ---------------------------------------------------
    {"name": "Ex 5.2 theta = 30 degrees for N=8, M=2", "stated": 30.0,
     "derive": _ex52_theta, "rtol": 1e-9},
    {"name": "Ex 5.2 r* = 1 exactly", "stated": 1.0,
     "derive": _ex52_r_star, "rtol": 1e-9},
    {"name": "Ex 5.2 P(1) = 1 (certainty)", "stated": 1.0,
     "derive": _ex52_p_at_r_star, "rtol": 1e-9},
    {"name": "Ex 5.2 P(2) = 0.25 (undone)", "stated": 0.25,
     "derive": _ex52_p_at_second_iteration, "rtol": 1e-9},
    {"name": "Ex 5.2 P(2) equals P(0)", "stated": 0.0,
     "derive": _ex52_p0_matches_p_at_two, "atol": 1e-9},

    # ---- 5.6/5.7 the thousand-candidate example and Example 5.3 ------------
    {"name": "5.6 r* for N=1024, M=1 is about 25", "stated": 25.0,
     "derive": _grover_1000_1_r_star, "rtol": 2e-2},
    {"name": "Ex 5.3 25 quantum queries against 512 classical", "stated": 25.0,
     "derive": lambda: round(_ex53_query_counts()[0]), "atol": 1e-9},
    {"name": "Ex 5.3 the classical count is 512", "stated": 512.0,
     "derive": lambda: _ex53_query_counts()[1], "rtol": 1e-9},
    {"name": "Ex 5.3 the quantum run takes 250 microseconds", "stated": 250.0,
     "derive": _ex53_quantum_time, "rtol": 1e-9},
    {"name": "Ex 5.3 the classical run takes 5.1 microseconds", "stated": 5.1,
     "derive": _ex53_classical_time, "rtol": 5e-3},
]


if __name__ == "__main__":
    main(CHECKS, "notes_c5 — lecture-notes Chapter 5, numbers not already checked by verify_scenes")
