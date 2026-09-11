#!/usr/bin/env python3
"""AI-ML · Part 9 lab — simulate the tenancy gateway config (Ch 2 / Ch 14).

Drives a mix of tenant traffic (including one noisy neighbour) against a
weighted-fair-queue allocation + per-tier token rate limits, and shows that the
well-behaved tenants are served in full while the abuser is shed.

  python learn9/labs/tenancy/simulate.py
"""
from __future__ import annotations

import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))

try:
    import yaml  # ships with yamllint; pip install pyyaml otherwise
except ImportError:  # pragma: no cover
    print("PyYAML not installed — `pip install pyyaml` to run this simulation.")
    sys.exit(0)


def tier_token_limit(cfg: dict, tier: str) -> int:
    base = cfg["defaults"]["rate_limit"]["tokens_per_min"]
    ov = (cfg.get("tiers", {}).get(tier) or {})
    return (ov.get("rate_limit") or {}).get("tokens_per_min", base)


def run() -> int:
    with open(os.path.join(HERE, "gateway-config.yaml"), encoding="utf-8") as fh:
        cfg = yaml.safe_load(fh)

    tenants = cfg["tenants"]
    weights = cfg["scheduler"]["weights"]

    # one minute of demand (tokens); initech is the noisy neighbour
    demand = {"acme": 350_000, "globex": 40_000, "initech": 250_000}
    capacity = 500_000  # what this gateway shard can actually serve per minute

    tot_w = sum(weights[t["tier"]] for t in tenants)
    print(f"{'tenant':<10}{'tier':<12}{'demand':>10}{'fair share':>12}"
          f"{'served':>10}{'throttled':>12}")
    print("-" * 66)

    served_total = 0
    globex_served = 0
    for t in tenants:
        tid, tier = t["id"], t["tier"]
        share = int(capacity * weights[tier] / tot_w)
        served = min(demand[tid], share, tier_token_limit(cfg, tier))
        throttled = demand[tid] - served
        served_total += served
        if tid == "globex":
            globex_served = served
        note = "  <- noisy neighbour: shed / degraded" if throttled and tid == "initech" else ""
        print(f"{tid:<10}{tier:<12}{demand[tid]:>10,}{share:>12,}"
              f"{served:>10,}{throttled:>12,}{note}")

    print("-" * 66)
    print(f"gateway capacity/min: {capacity:,}   served: {served_total:,}")
    ok = globex_served == demand["globex"]
    print(f"\nwell-behaved tenant 'globex' served in full despite the abuser: {ok}")
    assert served_total <= capacity
    assert ok, "fair-queuing should protect well-behaved tenants"
    return 0


if __name__ == "__main__":
    raise SystemExit(run())
