"""Re-derives every number stated in the Module 5 "Around Us" galleries
(build/src/86_scenes_m5.js: m5-real-run, m5-real-ramsey, m5-real-grover).

Modelled on verify/notes_c1.py and built on this repo's own runner
(qcheck.py). Each check reaches its number by the physics definition, not by
copying the scene file's own arithmetic.

Physical constants used and their source:
  none needed here — every figure is a property of an ideal circuit
  (binomial sampling, a Hadamard sandwich, or the Grover rotation), not a
  measured hardware number.
"""

from __future__ import annotations

import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from qcheck import main                                       # noqa: E402


# ── m5-real-run: shot noise, section 5.2 ────────────────────────────────────


def _se_p05_n100():
    """Standard error of an estimated probability, from the binomial variance
    p(1-p)/N. p=0.5 is the most uncertain point on the curve, N=100 shots."""
    p, N = 0.5, 100
    return math.sqrt(p * (1 - p) / N)


def _se_p05_n10000():
    p, N = 0.5, 10000
    return math.sqrt(p * (1 - p) / N)


def _se_p04_n200():
    """The error bar drawn on the p=0.4 bar chart at N=200 shots."""
    p, N = 0.4, 200
    return math.sqrt(p * (1 - p) / N)


def _se_p04_n2000():
    """The same estimate at ten times the shots: the bar should shrink by
    sqrt(10), not by 10."""
    p, N = 0.4, 2000
    return math.sqrt(p * (1 - p) / N)


def _se_shrink_ratio():
    """Going from N=200 to N=2000 (10x the shots) shrinks the standard error
    by a factor of sqrt(10), independently of p, since SE scales as 1/sqrt(N)."""
    return _se_p04_n200() / _se_p04_n2000()


# ── m5-real-ramsey: the Hadamard-sandwich fringe, section 5.4 ───────────────


def _fringe(phi_deg):
    """p(0) = cos^2(phi/2) for the three-gate H-P(phi)-H circuit, built
    directly from the phase-to-population formula, not from the scene's own
    trig call."""
    phi = math.radians(phi_deg)
    return math.cos(phi / 2) ** 2


def _fringe_0():
    return _fringe(0)


def _fringe_180():
    return _fringe(180)


def _fringe_90():
    return _fringe(90)


def _fringe_period_deg():
    """cos^2(phi/2) has period 360 degrees in phi: the fringe at phi and
    phi+360 must agree exactly."""
    return abs(_fringe(45) - _fringe(45 + 360))


def _decay_envelope_ratio():
    """A Ramsey fringe run out to a wait time t has its oscillation amplitude
    shrink as exp(-t/T2). At t = T2, the envelope has fallen to 1/e of its
    value at t=0."""
    T2 = 1.0
    return math.exp(-T2 / T2)


# ── m5-real-grover: the search curve, section 5.6 ───────────────────────────


N_G, M_G = 64, 1


def _theta():
    return math.asin(math.sqrt(M_G / N_G))


def _grover_p(r):
    """Success probability after r iterations, sin^2((2r+1)*theta), built
    from the rotation-by-2*theta argument, not from a lookup table."""
    return math.sin((2 * r + 1) * _theta()) ** 2


def _grover_p_r6():
    return _grover_p(6)


def _grover_p_r12():
    """Twice the near-optimal count of 6: the state has rotated past the
    marked state and almost all the way back to where it started."""
    return _grover_p(12)


def _grover_p_r0():
    """Zero iterations: a single random guess. Should equal M/N."""
    return _grover_p(0)


def _r_star():
    """The optimal (real-valued) iteration count pi/(4 theta) - 1/2. The
    nearest integer, 6, is what the figure marks as the peak."""
    return math.pi / (4 * _theta()) - 0.5


def _queries_quantum(N):
    return math.pi / 4 * math.sqrt(N)


def _queries_classical(N):
    return N / 2


def _crossover_ratio_at_1024():
    """At N=1024 the quantum query count is about 20 times smaller than the
    classical one; this is the ratio the figure's second curve marks."""
    return _queries_classical(1024) / _queries_quantum(1024)


CHECKS = [
    {"name": "m5-real-run: SE(p=0.5, N=100) = 0.05",
     "stated": 0.05, "derive": _se_p05_n100, "atol": 1e-12},
    {"name": "m5-real-run: SE(p=0.5, N=10000) = 0.005",
     "stated": 0.005, "derive": _se_p05_n10000, "atol": 1e-12},
    {"name": "m5-real-run: SE(p=0.4, N=200) = 0.0346",
     "stated": 0.034641016151377546, "derive": _se_p04_n200, "atol": 1e-9},
    {"name": "m5-real-run: SE(p=0.4, N=2000) = 0.01095",
     "stated": 0.010954451150103323, "derive": _se_p04_n2000, "atol": 1e-9},
    {"name": "m5-real-run: ten times the shots shrinks SE by sqrt(10)",
     "stated": math.sqrt(10), "derive": _se_shrink_ratio},

    {"name": "m5-real-ramsey: p(0) at phi=0 is 1",
     "stated": 1.0, "derive": _fringe_0, "atol": 1e-10},
    {"name": "m5-real-ramsey: p(0) at phi=180deg is 0",
     "stated": 0.0, "derive": _fringe_180, "atol": 1e-10},
    {"name": "m5-real-ramsey: p(0) at phi=90deg is 0.5",
     "stated": 0.5, "derive": _fringe_90, "atol": 1e-10},
    {"name": "m5-real-ramsey: the fringe repeats every 360deg",
     "stated": 0.0, "derive": _fringe_period_deg, "atol": 1e-10},
    {"name": "m5-real-ramsey: envelope at t=T2 has fallen to 1/e",
     "stated": math.exp(-1), "derive": _decay_envelope_ratio, "atol": 1e-12},

    {"name": "m5-real-grover: theta = arcsin(sqrt(1/64)) = 7.18deg",
     "stated": 7.180755781458282, "derive": lambda: math.degrees(_theta())},
    {"name": "m5-real-grover: r* = pi/(4theta) - 1/2 = 5.77, nearest int 6",
     "stated": 5.766749819872207, "derive": _r_star},
    {"name": "m5-real-grover: P(r=6) = 0.9966 (near the peak)",
     "stated": 0.9965856807867991, "derive": _grover_p_r6},
    {"name": "m5-real-grover: P(r=0) = M/N = 1/64",
     "stated": 1 / 64, "derive": _grover_p_r0},
    {"name": "m5-real-grover: P(r=12), twice r*, has fallen back near 0",
     "stated": 7.050584240359227e-05, "derive": _grover_p_r12, "atol": 1e-6},
    {"name": "m5-real-grover: quantum queries at N=1024 = (pi/4)*sqrt(1024) = 25.13",
     "stated": 25.132741228718345, "derive": lambda: _queries_quantum(1024)},
    {"name": "m5-real-grover: classical queries at N=1024 = 512",
     "stated": 512.0, "derive": lambda: _queries_classical(1024)},
    {"name": "m5-real-grover: classical/quantum crossover ratio at N=1024 is about 20",
     "stated": 20.372828804777752, "derive": _crossover_ratio_at_1024},
]


if __name__ == "__main__":
    main(CHECKS, "Module 5 Around Us galleries")
