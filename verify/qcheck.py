"""The runner both numerical gates share, and nothing else.

A check is a dict with a name, the number the artifact prints, and a callable
that reaches the same number by a route the artifact does not take. The runner
compares the two and prints one line per check.

Two tolerances, because the claims come in two kinds. A claim about a magnitude
-- a probability, a length, an eigenvalue -- is checked *relatively*, so the
tolerance means the same thing at 0.36 and at 1.1e15. A claim that something
*vanishes* -- an overlap, a commutator, the difference between two matrices --
cannot be checked that way, because a relative difference against zero is
either zero or infinite. Those carry `atol` and are checked absolutely.

Nothing in this file knows anything about quantum mechanics, and nothing in the
two files that use it imports the artifact. A gate built from the code it
checks verifies itself.
"""

from __future__ import annotations

import sys
from typing import Callable, Sequence

DEFAULT_RTOL = 5e-3


def run(checks: Sequence[dict], title: str) -> int:
    passed = failed = 0
    print(title)
    print("-" * len(title))
    for c in checks:
        stated = float(c["stated"])
        try:
            got = float(c["derive"]())
        except Exception as exc:                 # a check that cannot run has failed
            print(f"FAIL  {c['name']}: re-derivation raised "
                  f"{type(exc).__name__}: {exc}")
            failed += 1
            continue
        if "atol" in c:
            diff = abs(got - stated)
            ok = diff <= c["atol"]
            print(f"{'PASS' if ok else 'FAIL'}  {c['name']}: page states {stated:.6g}, "
                  f"re-derived {got:.6g}, absolute difference {diff:.2e}")
        else:
            rtol = c.get("rtol", DEFAULT_RTOL)
            rel = abs(got - stated) / max(abs(stated), 1e-300)
            ok = rel <= rtol
            print(f"{'PASS' if ok else 'FAIL'}  {c['name']}: page states {stated:.6g}, "
                  f"re-derived {got:.6g}, relative difference {rel:.2e}")
        passed += ok
        failed += not ok
    print(f"{passed} passed, {failed} failed")
    return 1 if failed else 0


def main(checks: Sequence[dict], title: str) -> None:
    sys.exit(run(checks, title))
