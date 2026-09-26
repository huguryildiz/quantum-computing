"""Re-derives every number stated in the three "Around Us" galleries added to
Module 4 (build/src/85_scenes_m4.js: m4-real-nmr, m4-real-iontrap, m4-real-chip).

Each gallery ties one photographed piece of hardware to the section's physics
and draws two figures computed from that physics. This file re-derives every
number those figures and their captions state, independently of the artifact's
own arithmetic, on the model of verify/notes_c1.py and built on this
repository's runner (qcheck.py) and operators (qops.py).

Physical constant used: the proton gyromagnetic ratio over 2 pi,
gamma/2pi = 42.577 MHz/T, an accepted value (CODATA proton gyromagnetic ratio
gamma_p = 2.6752e8 rad/(s.T), so gamma_p/(2 pi) = 42.577 MHz/T).
"""

from __future__ import annotations

import math
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from qcheck import main                                        # noqa: E402
from qops import H, cnot, on_qubit, ket                         # noqa: E402


GAMMA = 42.577  # MHz/T, accepted proton gyromagnetic ratio over 2 pi


# ── m4-real-nmr: Larmor precession ───────────────────────────────────────


def _larmor_3t():
    """f = (gamma/2pi) B at 3 T, the field of a common clinical scanner."""
    return GAMMA * 3.0


def _larmor_128_near():
    """The caption's "near 128 MHz" claim at 3 T: check the two are close,
    not equal -- 127.731 MHz rounds to 128 MHz at three significant figures."""
    return round(GAMMA * 3.0)


def _larmor_1p5t():
    return GAMMA * 1.5


def _larmor_7t():
    return GAMMA * 7.0


def _larmor_period_ns():
    """The period of the 3 T precession signal, in nanoseconds.
    f is in MHz, so 1/f is in microseconds; times 1000 for nanoseconds."""
    f = GAMMA * 3.0
    return 1000.0 / f


# ── m4-real-iontrap: Rabi flopping and the rotation angle it drives ──────

OMEGA = 2 * math.pi * 0.1  # rad/us, a 100 kHz Rabi frequency


def _rabi_population(t_us):
    return math.sin(OMEGA * t_us / 2) ** 2


def _rabi_pi_pulse_time_us():
    """The pulse length that drives a full flip, from P(1) = sin^2(Omega t/2) = 1."""
    return math.pi / OMEGA


def _rabi_pi_over_2_pulse_time_us():
    return (math.pi / 2) / OMEGA


def _rabi_angle_deg(t_us):
    """The rotation angle theta = Omega t, in degrees."""
    return (OMEGA * t_us) * 180 / math.pi


# ── m4-real-chip: a CNOT after a Hadamard makes a Bell pair ──────────────


def _chip_bell_probs():
    """H on q0, then CNOT(control=0, target=1), applied to |00>. Returns the
    four outcome probabilities in the order 00, 01, 10, 11."""
    psi0 = ket(0, 0)
    psi1 = on_qubit(H, 0) @ psi0
    psi2 = cnot(control=0, target=1) @ psi1
    return np.abs(psi2) ** 2


def _chip_bell_p00():
    return _chip_bell_probs()[0]


def _chip_bell_p01():
    return _chip_bell_probs()[1]


def _chip_bell_p10():
    return _chip_bell_probs()[2]


def _chip_bell_p11():
    return _chip_bell_probs()[3]


def _chip_no_gate_probs():
    """H on q0 alone, no CNOT: the four outcomes of |00> with q0 in |+>."""
    psi0 = ket(0, 0)
    psi1 = on_qubit(H, 0) @ psi0
    return np.abs(psi1) ** 2


def _chip_no_gate_p00():
    return _chip_no_gate_probs()[0]


def _chip_no_gate_p01():
    return _chip_no_gate_probs()[1]


def _chip_no_gate_p10():
    return _chip_no_gate_probs()[2]


def _chip_no_gate_p11():
    return _chip_no_gate_probs()[3]


CHECKS = [
    {"name": "m4-real-nmr: Larmor frequency at 1.5 T is 63.87 MHz",
     "stated": 63.8655, "derive": _larmor_1p5t},
    {"name": "m4-real-nmr: Larmor frequency at 3 T is 127.73 MHz",
     "stated": 127.731, "derive": _larmor_3t},
    {"name": "m4-real-nmr: 3 T rounds to the caption's near 128 MHz",
     "stated": 128.0, "derive": _larmor_128_near, "atol": 1e-9},
    {"name": "m4-real-nmr: Larmor frequency at 7 T is 298.04 MHz",
     "stated": 298.039, "derive": _larmor_7t},
    {"name": "m4-real-nmr: precession period at 3 T is 7.83 ns",
     "stated": 7.828953034110748, "derive": _larmor_period_ns},

    {"name": "m4-real-iontrap: pi pulse time is 5 us",
     "stated": 5.0, "derive": _rabi_pi_pulse_time_us},
    {"name": "m4-real-iontrap: pi/2 pulse time is 2.5 us",
     "stated": 2.5, "derive": _rabi_pi_over_2_pulse_time_us},
    {"name": "m4-real-iontrap: P(1) at the pi pulse is 1.0",
     "stated": 1.0, "derive": lambda: _rabi_population(5.0)},
    {"name": "m4-real-iontrap: P(1) at the pi/2 pulse is 0.5",
     "stated": 0.5, "derive": lambda: _rabi_population(2.5)},
    {"name": "m4-real-iontrap: rotation angle at the pi/2 pulse is 90 degrees",
     "stated": 90.0, "derive": lambda: _rabi_angle_deg(2.5)},
    {"name": "m4-real-iontrap: rotation angle at the pi pulse is 180 degrees",
     "stated": 180.0, "derive": lambda: _rabi_angle_deg(5.0)},

    {"name": "m4-real-chip: Bell pair P(00) = 0.5",
     "stated": 0.5, "derive": _chip_bell_p00},
    {"name": "m4-real-chip: Bell pair P(01) = 0",
     "stated": 0.0, "derive": _chip_bell_p01, "atol": 1e-10},
    {"name": "m4-real-chip: Bell pair P(10) = 0",
     "stated": 0.0, "derive": _chip_bell_p10, "atol": 1e-10},
    {"name": "m4-real-chip: Bell pair P(11) = 0.5",
     "stated": 0.5, "derive": _chip_bell_p11},
    {"name": "m4-real-chip: Hadamard alone, P(00) = 0.5",
     "stated": 0.5, "derive": _chip_no_gate_p00},
    {"name": "m4-real-chip: Hadamard alone, P(01) = 0.5",
     "stated": 0.5, "derive": _chip_no_gate_p01},
    {"name": "m4-real-chip: Hadamard alone, P(10) = 0",
     "stated": 0.0, "derive": _chip_no_gate_p10, "atol": 1e-10},
    {"name": "m4-real-chip: Hadamard alone, P(11) = 0",
     "stated": 0.0, "derive": _chip_no_gate_p11, "atol": 1e-10},
]


if __name__ == "__main__":
    main(CHECKS, "Module 4 Around Us galleries")
