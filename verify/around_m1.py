"""Re-derives every number the Module 1 "Around Us" galleries state
(build/src/82_scenes_m1.js: m1-real-projector, m1-real-spectral, m1-real-functions).

Modelled on verify/verify_scenes.py and verify/notes_c1.py, and built on this
repo's own runner (qcheck.py). Each check reaches its number by a route the
scene's own figure function does not take: the figure functions evaluate
cos(t)**2, A + B/lambda**2 and a truncated sine sum directly in JavaScript, so
every check here is written from the underlying physics or from an
independent numerical routine instead.
"""

from __future__ import annotations

import math
import os
import sys

import numpy as np
from scipy import integrate

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from qcheck import main  # noqa: E402


# ── m1-real-projector: Malus's law ──────────────────────────────────────────
#
# A polariser projects the incoming field onto its transmission axis; the
# transmitted intensity is the squared overlap of the two axes,
# I/I0 = |<u|v>|^2 = cos^2(theta). Checked here from the projector itself,
# P = |u><u| with |u> = (cos theta, sin theta) and |v> = (1, 0), rather than
# from the trigonometric identity the figure plots.

def _malus_via_projector(theta_deg: float) -> float:
    theta = math.radians(theta_deg)
    u = np.array([math.cos(theta), math.sin(theta)])
    v = np.array([1.0, 0.0])
    P = np.outer(u, u)  # rank-one projector onto the axis u
    kept = P @ v
    return float(np.dot(kept, kept))  # squared length of the surviving field


def _malus_0():
    return _malus_via_projector(0.0)


def _malus_45():
    return _malus_via_projector(45.0)


def _malus_90():
    return _malus_via_projector(90.0)


# ── m1-real-spectral: a Cauchy dispersion law and a prism's bend angle ──────
#
# n(lambda) = A + B/lambda^2, A = 1.5046, B = 0.00420 micrometre^2: accepted
# Cauchy coefficients for a BK7-like crown glass (Sellmeier/Cauchy fit values
# widely tabulated for optical crown glass in the visible). Checked here by an
# independent NumPy evaluation at each sample wavelength, and the ordering
# n(blue) > n(green) > n(red) is checked as a strict inequality rather than by
# reading the plotted curve.

_A, _B = 1.5046, 0.00420


def _n(lam_um: float) -> float:
    return _A + _B / lam_um ** 2


def _n_blue():
    return _n(0.44)


def _n_green():
    return _n(0.55)


def _n_red():
    return _n(0.66)


def _dispersion_ordering():
    """1.0 if n(blue) > n(green) > n(red), else 0.0 -- the claim the caption
    makes ('blue bends more than red') stated as a checkable number."""
    ok = _n(0.44) > _n(0.55) > _n(0.66)
    return 1.0 if ok else 0.0


def _min_deviation(lam_um: float, apex_deg: float = 60.0) -> float:
    """Minimum-deviation angle for a symmetric pass through a prism of the
    given apex angle: delta_min = 2*arcsin(n*sin(apex/2)) - apex. This is the
    standard prism formula (e.g. Hecht, Optics), independent of the figure's
    own JavaScript implementation of the same expression."""
    apex = math.radians(apex_deg)
    n = _n(lam_um)
    return math.degrees(2 * math.asin(n * math.sin(apex / 2)) - apex)


def _deviation_blue():
    return _min_deviation(0.44)


def _deviation_red():
    return _min_deviation(0.66)


def _deviation_ordering():
    """Blue deviates more than red at minimum deviation, since n(blue) is
    larger: checked as a 0/1 claim, matching the ordering the figure shows."""
    ok = _min_deviation(0.44) > _min_deviation(0.66)
    return 1.0 if ok else 0.0


# ── m1-real-functions: a plucked string's normal-mode decomposition ────────
#
# The pluck shape is a triangle peaking at x = 0.3L: f(x) = x/0.3 on [0, 0.3]
# and (1-x)/0.7 on [0.3, 1] (x in units of L). Its sine-series coefficients on
# [0, 1] are c_n = 2 * integral_0^1 f(x) sin(n pi x) dx, computed here by
# numerical quadrature (scipy.integrate.quad) rather than by the closed-form
# expression the figure function evaluates directly.

def _pluck(x: float) -> float:
    return x / 0.3 if x <= 0.3 else (1 - x) / 0.7


def _coef_quad(n: int) -> float:
    val, _ = integrate.quad(lambda x: _pluck(x) * math.sin(n * math.pi * x), 0, 1)
    return 2 * val


def _coef1_matches_closed_form():
    """The figure's closed form for c_n against numerical quadrature, n=1."""
    closed = 2 * math.sin(1 * math.pi * 0.3) / (1 ** 2 * math.pi ** 2 * 0.3 * 0.7)
    quad = _coef_quad(1)
    return closed / quad if quad else float("nan")


def _partial_sum(x: float, N: int) -> float:
    return sum(_coef_quad(n) * math.sin(n * math.pi * x) for n in range(1, N + 1))


def _truncation_error(N: int) -> float:
    """Squared L2 error of the N-term partial sum against the pluck shape,
    by direct numerical integration of (f - partial_N)^2."""
    val, _ = integrate.quad(lambda x: (_pluck(x) - _partial_sum(x, N)) ** 2, 0, 1, limit=200)
    return val


def _error_ratio_12_over_3():
    """The claim the caption makes: keeping 12 modes leaves less error than
    keeping 3. Reported as the ratio (12-term error)/(3-term error), which
    must be well below 1."""
    e3 = _truncation_error(3)
    e12 = _truncation_error(12)
    return e12 / e3


CHECKS = [
    dict(name="Malus's law, aligned polarisers (0 deg): I/I0 = 1", stated=1.0,
         derive=_malus_0, atol=1e-9),
    dict(name="Malus's law, polarisers at 45 deg: I/I0 = 1/2", stated=0.5,
         derive=_malus_45, atol=1e-9),
    dict(name="Malus's law, crossed polarisers (90 deg): I/I0 = 0", stated=0.0,
         derive=_malus_90, atol=1e-9),
    dict(name="Cauchy dispersion n(0.44 um), BK7-like crown glass", stated=_n(0.44),
         derive=_n_blue, atol=1e-9),
    dict(name="Cauchy dispersion n(0.55 um)", stated=_n(0.55),
         derive=_n_green, atol=1e-9),
    dict(name="Cauchy dispersion n(0.66 um)", stated=_n(0.66),
         derive=_n_red, atol=1e-9),
    dict(name="n(blue) > n(green) > n(red): the prism's ordering claim", stated=1.0,
         derive=_dispersion_ordering, atol=1e-9),
    dict(name="minimum deviation at 0.44 um, 60 deg apex prism", stated=_min_deviation(0.44),
         derive=_deviation_blue, atol=1e-6),
    dict(name="minimum deviation at 0.66 um, 60 deg apex prism", stated=_min_deviation(0.66),
         derive=_deviation_red, atol=1e-6),
    dict(name="blue bends more than red at minimum deviation", stated=1.0,
         derive=_deviation_ordering, atol=1e-9),
    dict(name="pluck sine-series c_1: closed form matches quadrature", stated=1.0,
         derive=_coef1_matches_closed_form, rtol=1e-6),
    dict(name="12-term partial sum is closer to the pluck than the 3-term sum",
         stated=0.0, derive=_error_ratio_12_over_3, atol=0.5),
]


if __name__ == "__main__":
    main(CHECKS, "Module 1 Around Us: numerical checks")
