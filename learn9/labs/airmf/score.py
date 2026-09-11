#!/usr/bin/env python3
"""AI-ML · Part 9 lab — NIST AI RMF gap-assessment scorer (Ch 6).

Reads checklist.yaml + a set of maturity answers (0-3) and prints a per-function
score, an overall maturity, and the ranked gap list to drive the roadmap.

  python learn9/labs/airmf/score.py
"""
from __future__ import annotations

import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))

try:
    import yaml
except ImportError:  # pragma: no cover
    print("PyYAML not installed — `pip install pyyaml` to run the scorer.")
    sys.exit(0)

# a plausible "current state" for a mid-maturity platform (0 absent .. 3 managed)
ANSWERS: dict[str, int] = {
    "GV-1": 3, "GV-2": 2, "GV-3": 1, "GV-4": 2,
    "MP-1": 3, "MP-2": 2, "MP-3": 1,
    "MS-1": 3, "MS-2": 1, "MS-3": 2, "MS-4": 2,
    "MG-1": 3, "MG-2": 2, "MG-3": 1, "MG-4": 2,
}


def main() -> int:
    with open(os.path.join(HERE, "checklist.yaml"), encoding="utf-8") as fh:
        spec = yaml.safe_load(fh)

    max_level = spec["scale"][-1]
    gaps: list[tuple[int, str, str]] = []
    overall_pts = overall_max = 0

    print(f"{spec['framework']} — maturity (0 absent .. {max_level} managed+measured)\n")
    for fn, items in spec["functions"].items():
        pts = sum(ANSWERS.get(i["id"], 0) for i in items)
        mx = max_level * len(items)
        overall_pts += pts
        overall_max += mx
        bar = "#" * pts + "-" * (mx - pts)
        print(f"  {fn.upper():<9} {pts:>2}/{mx:<2} [{bar}]")
        for i in items:
            a = ANSWERS.get(i["id"], 0)
            if a < 2:  # below "defined" is a gap
                gaps.append((a, i["id"], i["text"]))

    pct = 100 * overall_pts / overall_max
    print(f"\n  OVERALL   {overall_pts}/{overall_max}  ({pct:.0f}%)")

    print("\nGaps (below 'defined') — ranked, become the platform roadmap:")
    for a, cid, text in sorted(gaps):
        print(f"  [{a}] {cid}  {text}")

    assert 0 <= pct <= 100
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
