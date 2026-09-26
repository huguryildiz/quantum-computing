"""Re-derives every number stated on Module 6's three Around Us gallery pages
(build/src/87_scenes_m6.js: m6-real-forks, m6-real-gears, m6-real-datacentre).

Each figure on those pages is schematic but true: it is computed from the
same definitions the teaching scenes use, not read off a table. This gate
re-derives every one of those numbers by a route the artifact does not take —
`qops.py`'s matrix form of phase estimation rather than the artifact's closed
form, and a plain modular-order search rather than the artifact's own loop —
so a passing gate is not just confirming that JavaScript and Python agree
about the same arithmetic.

Physical constant: none of the three pages states one. The photographs are
captioned only by what they show (a row of tuning forks, a gear train, a
data-centre aisle); every checked number is mathematics.
"""

from __future__ import annotations

import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from qcheck import main                                          # noqa: E402
from qops import mod_order, qpe_distribution                      # noqa: E402


# ── m6-real-forks: the phase-estimation distribution and its floor ─────────


def _forks_phi_027_t4_two_nearest():
    """m6-real-forks, figure 1: phi=0.27, t=4. Top two outcomes together,
    computed from the circuit itself (qops.qpe_distribution's matrix form,
    independent of the artifact's closed-form qpeProb).
    """
    p = qpe_distribution(0.27, 4)
    top2 = sorted(p, reverse=True)[:2]
    return sum(top2)


def _forks_floor_never_below_8_over_pi2():
    """m6-real-forks, figure 2: the minimum over phi of the top-two mass at
    t=4 is at least 8/pi^2 = 0.811, the same bound m6-qpeprec states. Swept
    over a fine grid of phases and minimised.
    """
    worst = 1.0
    for i in range(2001):
        phi = i / 2000.0
        p = qpe_distribution(phi, 4)
        top2 = sum(sorted(p, reverse=True)[:2])
        worst = min(worst, top2)
    return worst


def _forks_exact_phase_gives_certainty():
    """A sanity check behind the 'exact fraction' contrast the note draws:
    phi = 5/16 (a 4-bit fraction) is read with probability 1 at t=4.
    """
    p = qpe_distribution(5 / 16, 4)
    return p[5]


# ── m6-real-gears: modular order as a mechanical period ────────────────────


def _gears_order_of_7_mod_15():
    """m6-real-gears, figure 1: the order of 7 modulo 15, stated as r=4."""
    return mod_order(7, 15)


def _gears_cycle_returns_to_one_at_r():
    """The cycle 7^k mod 15 is 1 exactly at multiples of r, confirmed by
    walking it independently of mod_order's own loop.
    """
    r = mod_order(7, 15)
    x = 1
    for k in range(1, 4 * r + 1):
        x = (x * 7) % 15
        if k % r == 0 and x != 1:
            return -1  # would fail the check below
    return 1 if x == 1 else 0


def _gears_orders_mod_15_sum():
    """m6-real-gears, figure 2: the orders of every a coprime to 15 (there are
    eight such a, by Euler's totient of 15 = 8), summed as one checkable
    number standing in for the whole bar chart.
    """
    bases = [a for a in range(1, 15) if math.gcd(a, 15) == 1]
    if len(bases) != 8:
        raise AssertionError(f"expected 8 bases coprime to 15, got {len(bases)}")
    return sum(mod_order(a, 15) for a in bases)


def _gears_lcm_twelve_eight():
    """The note's mechanical analogy: a twelve-tooth gear meshed with an
    eight-tooth one realigns after lcm(12,8) = 24 teeth of travel.
    """
    return math.lcm(12, 8)


# ── m6-real-datacentre: the classical/quantum cost gap and the gcd step ────


def _data_growth_crossing_favours_quantum_at_L256():
    """m6-real-datacentre, figure 1: at L=256 bits, trial division's
    log10(steps) = (L/2)*log10(2) is far above order finding's 3*log10(L).
    Returns the gap in decades, which the caption's 'widens with every added
    bit' claims stays positive and growing.
    """
    L = 256
    trial = (L / 2) * math.log10(2)
    order = 3 * math.log10(L)
    return trial - order


def _data_gap_widens_between_L64_and_L256():
    """The gap grows with L, checked at two points independently of any
    single number quoted in the figure."""
    def gap(L):
        return (L / 2) * math.log10(2) - 3 * math.log10(L)
    return 1.0 if gap(256) > gap(64) else 0.0


def _data_gcd_7_21():
    """m6-real-datacentre, figure 2: gcd(a^{r/2}-1, N) for N=21, a=2, r=6:
    2^3-1 = 7, gcd(7,21) = 7. Same worked example m6-shor already checks.
    """
    return math.gcd(2 ** 3 - 1, 21)


def _data_gcd_9_21():
    """The other half of the same figure: gcd(2^3+1, 21) = gcd(9,21) = 3."""
    return math.gcd(2 ** 3 + 1, 21)


def _data_order_of_2_mod_21_is_6():
    """The order feeding both gcd computations: r=6 for a=2, N=21."""
    return mod_order(2, 21)


CHECKS = [
    {"name": "m6-real-forks fig1: phi=0.27, t=4, top two outcomes sum to 0.8634, above the 8/pi^2 floor",
     "stated": 0.8634481904922388, "derive": _forks_phi_027_t4_two_nearest, "rtol": 5e-3},
    {"name": "m6-real-forks fig2: worst-case top-two mass at t=4 equals 8/pi^2",
     "stated": 8 / math.pi ** 2, "derive": _forks_floor_never_below_8_over_pi2,
     "rtol": 5e-3},
    {"name": "m6-real-forks: an exact 4-bit phase (5/16) is read with probability 1",
     "stated": 1.0, "derive": _forks_exact_phase_gives_certainty, "atol": 1e-9},

    {"name": "m6-real-gears fig1: the order of 7 modulo 15 is 4",
     "stated": 4.0, "derive": _gears_order_of_7_mod_15, "atol": 1e-9},
    {"name": "m6-real-gears: the cycle returns to 1 exactly every r steps",
     "stated": 1.0, "derive": _gears_cycle_returns_to_one_at_r, "atol": 1e-9},
    {"name": "m6-real-gears fig2: the eight orders of a coprime to 15 sum to 23",
     "stated": 23.0, "derive": _gears_orders_mod_15_sum, "atol": 1e-9},
    {"name": "m6-real-gears note: lcm(12,8) = 24",
     "stated": 24.0, "derive": _gears_lcm_twelve_eight, "atol": 1e-9},

    {"name": "m6-real-datacentre fig1: at L=256 trial division exceeds order finding by 31.3 decades",
     "stated": 31.3, "derive": _data_growth_crossing_favours_quantum_at_L256, "atol": 0.1},
    {"name": "m6-real-datacentre: the classical/quantum gap widens from L=64 to L=256",
     "stated": 1.0, "derive": _data_gap_widens_between_L64_and_L256, "atol": 1e-9},
    {"name": "m6-real-datacentre fig2: gcd(7,21) = 7",
     "stated": 7.0, "derive": _data_gcd_7_21, "atol": 1e-9},
    {"name": "m6-real-datacentre fig2: gcd(9,21) = 3",
     "stated": 3.0, "derive": _data_gcd_9_21, "atol": 1e-9},
    {"name": "m6-real-datacentre: the order of 2 modulo 21 is 6",
     "stated": 6.0, "derive": _data_order_of_2_mod_21_is_6, "atol": 1e-9},
]


if __name__ == "__main__":
    main(CHECKS, "Module 6 Around Us gallery pages")
