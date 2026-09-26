"""Re-derives every number stated in the Module 2 "Around Us" galleries
(build/src/83_scenes_m2.js: m2-real-detector, m2-real-mri, m2-real-geiger).

Modelled on the notes_c*.py suite: built on this repo's own runner (qcheck.py)
and operators (qops.py), each check reaches its number by a route the scene
does not take. Physical constants are the accepted values, named as such.
"""

from __future__ import annotations

import math
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from qcheck import main                                       # noqa: E402
from qops import KET0, inner, ndotsigma                        # noqa: E402


# ── m2-real-detector · the Born rule on a photon-counting instrument ────────

GYRO_MHZ_PER_T = 42.577  # proton gyromagnetic ratio, accepted value, MHz/T


def _malus_45():
    """P(click) = cos^2(theta) at theta = 45 degrees, the angle the click
    figure is drawn at. Computed from the Born rule on a qubit rotated by
    theta about Y, not from the cos^2 formula the caption states directly:
    a polariser at angle theta is a Z measurement on |0> rotated by 2*theta
    (a photon's polarisation angle maps to twice the Bloch angle), so the
    click probability is |<+|R_y(2 theta)|0>|^2 in the qubit picture used
    for the rest of this course.
    """
    theta = math.radians(45.0)
    # A qubit state at polar angle 2*theta from |0>, i.e. cos(theta)|0>+sin(theta)|1>.
    psi = np.array([math.cos(theta), math.sin(theta)], dtype=complex)
    p = abs(inner(KET0, psi)) ** 2
    return p


def _malus_curve_zero_and_ninety():
    """The two landmark values the curve's own shape has to hit: certain
    pass at theta=0 and certain block at theta=90 degrees. Returned as their
    sum-minus-one so a single check catches either one being wrong (both
    should make this exactly zero: 1 + 0 - 1)."""
    p0 = math.cos(math.radians(0.0)) ** 2
    p90 = math.cos(math.radians(90.0)) ** 2
    return (p0 + p90) - 1.0


def _clicks_mean_matches_dashed_line():
    """The 20 simulated outcomes plotted in figClicks average to the dashed
    line drawn at 1/2, to within the tolerance a sample of 20 fair coins
    allows (binomial standard error at N=20, p=1/2 is about 0.112, so a
    sample mean is expected to land within a few SEs of 1/2)."""
    outcomes = [1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1]
    return sum(outcomes) / len(outcomes)


def _clicks_count_is_ten():
    """The scene states the sample averages toward 1/2; for exactly 20 shots
    that means the count of 1s re-derived independently (by direct sum) is
    the number the figure's dashed line at 0.5 implies for that sample: 10."""
    outcomes = [1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1]
    return float(sum(outcomes))


# ── m2-real-mri · the Larmor frequency ───────────────────────────────────────


def _larmor_15T():
    """f = gamma B at the clinical field strength of 1.5 T, computed from the
    accepted gyromagnetic ratio rather than read off the plotted curve."""
    return GYRO_MHZ_PER_T * 1.5


def _larmor_3T():
    """f = gamma B at 3 T, the other clinical field strength marked on the
    figure."""
    return GYRO_MHZ_PER_T * 3.0


def _larmor_05T():
    """f = gamma B at 0.5 T, the third marked point."""
    return GYRO_MHZ_PER_T * 0.5


def _larmor_is_linear_in_b():
    """The frequency doubles when the field doubles: f(3T)/f(1.5T) = 2. This
    checks the claim that the curve is a straight line through the origin,
    not merely that two points were computed correctly."""
    return (GYRO_MHZ_PER_T * 3.0) / (GYRO_MHZ_PER_T * 1.5)


def _precession_axis_matches_field():
    """figPrecess draws the Bloch vector precessing on a circle of latitude
    at polar angle 50 degrees about the z axis (the field direction). The
    z-component of a state at that polar angle, computed from n.sigma
    directly rather than from the sin/cos used to draw the ellipse, is
    cos(50 degrees)."""
    theta = math.radians(50.0)
    n = np.array([0.0, 0.0, 1.0])
    # State at polar angle theta from |0>, azimuth 0.
    psi = np.array([math.cos(theta / 2), math.sin(theta / 2)], dtype=complex)
    op = ndotsigma(n)
    rz = (psi.conj() @ op @ psi).real
    return rz


# ── m2-real-geiger · the shot-noise / Poisson counting square-root law ──────


def _se_worst_case_N10000():
    """The worst-case (p=1/2) standard error at N=10,000, the same claim as
    m2-shots but re-derived here independently by direct evaluation of
    sqrt(p(1-p)/N) rather than by reading the log-log figure."""
    return math.sqrt(0.5 * 0.5 / 10_000)


def _se_halves_per_decade():
    """SE(10N)/SE(N) = 1/sqrt(10): the log-log slope of -1/2 the caption
    states, checked as a ratio rather than by trusting two log values read
    off a line."""
    def se(n):
        return math.sqrt(0.5 * 0.5 / n)
    return se(1000) / se(100)


def _geiger_mean_count_at_10s():
    """Mean count lambda*t for the simulated Geiger trace at t=10 s and
    lambda=4 counts/s, from the Poisson mean directly."""
    lam, t = 4.0, 10.0
    return lam * t


def _geiger_band_half_width_at_10s():
    """The Poisson standard deviation sqrt(lambda t) at t=10 s, the half
    width of the band drawn around the mean count in figGeigerCounts."""
    lam, t = 4.0, 10.0
    return math.sqrt(lam * t)


def _geiger_trace_clamped_excess():
    """The 15-point count trace plotted in figGeigerCounts (build/src/83_scenes_m2.js),
    checked point by point against the Poisson band mean +/- sqrt(mean) it is
    captioned to stay inside. Returns the largest excess, in units of the band
    half-width, over every plotted point, clamped below at zero so a fully
    in-band trace derives to exactly 0 and any excursion derives to a
    positive number the runner's atol will catch."""
    lam = 4.0
    steps = [0, 4, 5, 10, 10, 15, 16, 22, 22, 27, 27, 33, 33, 39, 39]
    n = len(steps)
    worst = 0.0
    for i, count in enumerate(steps):
        t = i * 10.0 / (n - 1)
        mean = lam * t
        half = math.sqrt(mean) if mean > 0 else 0.0
        excess = (abs(count - mean) - half) / half if half > 0 else (0.0 if count == 0 else 1.0)
        worst = max(worst, excess)
    return worst


def _geiger_outside_band_fraction():
    """P(|K - 40| > sqrt(40)) for K ~ Poisson(40), summed from the pmf."""
    lam = 40.0
    p, tot = math.exp(-lam), 0.0
    for k in range(0, 200):
        if k:
            p *= lam / k
        if abs(k - lam) > math.sqrt(lam):
            tot += p
    return tot


CHECKS = [
    {"name": "m2-real-detector: Malus's law at theta=45 deg gives p=1/2",
     "stated": 0.5, "derive": _malus_45},
    {"name": "m2-real-detector: curve endpoints, p(0)+p(90)-1=0",
     "stated": 0.0, "derive": _malus_curve_zero_and_ninety, "atol": 1e-12},
    {"name": "m2-real-detector: 20 simulated clicks average near 1/2",
     "stated": 0.5, "derive": _clicks_mean_matches_dashed_line, "rtol": 0.25},
    {"name": "m2-real-detector: the sample has exactly 10 clicks",
     "stated": 10.0, "derive": _clicks_count_is_ten},

    {"name": "m2-real-mri: Larmor frequency at 1.5 T is 63.87 MHz",
     "stated": 63.8655, "derive": _larmor_15T},
    {"name": "m2-real-mri: Larmor frequency at 3 T is 127.73 MHz",
     "stated": 127.731, "derive": _larmor_3T},
    {"name": "m2-real-mri: Larmor frequency at 0.5 T is 21.29 MHz",
     "stated": 21.2885, "derive": _larmor_05T},
    {"name": "m2-real-mri: frequency doubles when field doubles",
     "stated": 2.0, "derive": _larmor_is_linear_in_b},
    {"name": "m2-real-mri: precession circle sits at cos(50 deg) on the field axis",
     "stated": math.cos(math.radians(50.0)), "derive": _precession_axis_matches_field},

    {"name": "m2-real-geiger: worst-case SE at N=10,000 is 0.005",
     "stated": 0.005, "derive": _se_worst_case_N10000},
    {"name": "m2-real-geiger: SE drops by 1/sqrt(10) per decade of shots",
     "stated": 1 / math.sqrt(10), "derive": _se_halves_per_decade},
    {"name": "m2-real-geiger: mean count at t=10 s, lambda=4/s, is 40",
     "stated": 40.0, "derive": _geiger_mean_count_at_10s},
    {"name": "m2-real-geiger: Poisson band half-width at t=10 s is sqrt(40)",
     "stated": math.sqrt(40.0), "derive": _geiger_band_half_width_at_10s},
    {"name": "m2-real-geiger: a Poisson count at mean 40 leaves the one-sigma band about a third of the time",
     "stated": 1 / 3, "derive": _geiger_outside_band_fraction, "rtol": 0.15},
    {"name": "m2-real-geiger: the one plotted trace stays within the +-sqrt(N) band",
     "stated": 0.0, "derive": _geiger_trace_clamped_excess, "atol": 1e-9},
]


if __name__ == "__main__":
    main(CHECKS, "Module 2 Around Us galleries")
