#!/usr/bin/env python3
"""AI-ML · Part 9 lab — enterprise-readiness go/no-go report (Ch 16).

Reads checklist.yaml, filters items to the system's risk tier, applies a set of
answers (yes / no / exception), and prints a per-area result + an overall
verdict. A "no" on an in-scope item blocks; an "exception" must have an owner and
an expiry.

  python learn9/labs/readiness/check.py            # tier-1 example
  python learn9/labs/readiness/check.py tier-3     # lighter walk
"""
from __future__ import annotations

import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))

try:
    import yaml
except ImportError:  # pragma: no cover
    print("PyYAML not installed — `pip install pyyaml` to run the check.")
    sys.exit(0)

# answers for a tier-1 assistant up for launch (mirrors Ch 16 Scenario A):
# three gaps — no quality SLO, rollback misses the prompt, no appeal path.
ANSWERS: dict[str, object] = {
    "SEC-1": "yes", "SEC-2": "yes", "SEC-3": "yes", "SEC-4": "yes",
    "GOV-1": "yes", "GOV-2": "yes", "GOV-3": "yes",
    "GOV-4": "no",                                   # no appeal path
    "REL-1": "no",                                   # no quality SLO
    "REL-2": {"exception": "prompt rollback lands Fri", "owner": "ranking", "expires": "2026-09-19"},
    "REL-3": "yes", "REL-4": "yes",
    "CST-1": "yes", "CST-2": "yes",
    "ORG-1": "yes", "ORG-2": "yes", "ORG-3": "yes", "ORG-4": "yes",
}


def evaluate(tier: str) -> int:
    with open(os.path.join(HERE, "checklist.yaml"), encoding="utf-8") as fh:
        spec = yaml.safe_load(fh)

    blockers: list[tuple[str, str]] = []
    exceptions: list[tuple[str, str]] = []
    print(f"Enterprise-readiness review — risk {tier}\n")

    for area, items in spec["areas"].items():
        in_scope = [i for i in items if tier in i["tiers"]]
        passed = 0
        rows: list[str] = []
        for i in in_scope:
            ans = ANSWERS.get(i["id"], "no")
            if ans == "yes":
                passed += 1
                rows.append(f"    [ok ] {i['id']} {i['text']}")
            elif isinstance(ans, dict) and "exception" in ans:
                ok = bool(ans.get("owner")) and bool(ans.get("expires"))
                exceptions.append((i["id"], ans["exception"]))
                mark = "EXC " if ok else "EXC?"
                rows.append(f"    [{mark}] {i['id']} {i['text']}  -> {ans['exception']} "
                            f"(owner {ans.get('owner', '?')}, expires {ans.get('expires', '?')})")
                if not ok:
                    blockers.append((i["id"], "exception without owner/expiry"))
            else:
                blockers.append((i["id"], i["text"]))
                rows.append(f"    [NO ] {i['id']} {i['text']}")
        print(f"  {area.upper():<13} {passed}/{len(in_scope)} pass")
        print("\n".join(rows))
        print()

    if blockers:
        print("VERDICT: NO-GO — blockers:")
        for cid, text in blockers:
            print(f"  - {cid}: {text}")
    else:
        print("VERDICT: GO" + (" (with tracked exceptions)" if exceptions else ""))
    if exceptions:
        print("Tracked, time-boxed exceptions:")
        for cid, text in exceptions:
            print(f"  - {cid}: {text}")

    # the script "passes" (exit 0) — it is a reporting tool; the verdict is the output
    return 0


if __name__ == "__main__":
    raise SystemExit(evaluate(sys.argv[1] if len(sys.argv) > 1 else "tier-1"))
