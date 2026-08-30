"""The runner itself, tested. A gate that cannot fail is not a gate.

These are the only tests in `verify/`, and they exist because the two numerical
gates are only as trustworthy as the comparison at the bottom of them. Each test
below builds a check that should pass and one that should not, and asserts that
the runner says so.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from qcheck import run


def test_a_relative_check_passes_when_the_two_agree():
    assert run([{"name": "agree", "stated": 2.0, "derive": lambda: 2.0}], "t") == 0


def test_a_relative_check_fails_when_they_do_not():
    assert run([{"name": "differ", "stated": 2.0, "derive": lambda: 2.5}], "t") == 1


def test_a_relative_tolerance_scales_with_the_magnitude():
    small = {"name": "small", "stated": 1e-9, "derive": lambda: 1.001e-9}
    large = {"name": "large", "stated": 1e9, "derive": lambda: 1.001e9}
    assert run([small], "t") == 0
    assert run([large], "t") == 0


def test_an_absolute_check_accepts_rounding_noise_around_zero():
    c = {"name": "vanishes", "stated": 0.0, "derive": lambda: 3e-16, "atol": 1e-14}
    assert run([c], "t") == 0


def test_an_absolute_check_still_catches_a_real_difference():
    c = {"name": "does not vanish", "stated": 0.0, "derive": lambda: 1e-3,
         "atol": 1e-14}
    assert run([c], "t") == 1


def test_a_check_that_raises_is_a_failure_and_not_a_crash():
    def boom():
        raise ValueError("no")
    assert run([{"name": "raises", "stated": 1.0, "derive": boom}], "t") == 1
