#!/usr/bin/env python3
"""AI-ML · Part 8 lab — a zero-dependency drift monitor (Ch 8).

Computes PSI and KL divergence for each feature between a fixed REFERENCE window
(training / a known-good period) and a LIVE window, and prints the result plus a
Prometheus text-format block you could expose on /metrics.

PSI bands (Ch 8):  < 0.10 stable  ·  0.10-0.25 moderate  ·  > 0.25 significant.

  python learn8/labs/drift/monitor.py
"""
from __future__ import annotations

import math
import random

random.seed(42)
EPS = 1e-6
N_BINS = 10


def sample(mean: float, sd: float, n: int) -> list[float]:
    return [random.gauss(mean, sd) for _ in range(n)]


def bin_edges(ref: list[float]) -> list[float]:
    lo, hi = min(ref), max(ref)
    step = (hi - lo) / N_BINS
    return [lo + i * step for i in range(N_BINS + 1)]


def hist(xs: list[float], edges: list[float]) -> list[float]:
    counts = [0] * (len(edges) - 1)
    for x in xs:
        # clamp into the reference range so live outliers land in the end bins
        idx = 0
        for i in range(len(edges) - 1):
            if x >= edges[i]:
                idx = i
        counts[idx] += 1
    total = sum(counts) or 1
    return [c / total for c in counts]


def psi(ref_p: list[float], live_p: list[float]) -> float:
    out = 0.0
    for r, l in zip(ref_p, live_p):
        r = max(r, EPS)
        l = max(l, EPS)
        out += (l - r) * math.log(l / r)
    return out


def kl(ref_p: list[float], live_p: list[float]) -> float:
    out = 0.0
    for r, l in zip(ref_p, live_p):
        r = max(r, EPS)
        l = max(l, EPS)
        out += l * math.log(l / r)
    return out


def band(v: float) -> str:
    if v < 0.10:
        return "stable"
    if v < 0.25:
        return "moderate"
    return "SIGNIFICANT"


FEATURES = {
    # name: (ref_mean, ref_sd, live_mean, live_sd)  -- 'orders_30d' has drifted
    "avg_order_value_30d": (52.0, 12.0, 53.1, 12.4),
    "orders_30d": (4.0, 2.0, 6.3, 2.4),
    "days_since_last_order": (9.0, 5.0, 9.4, 5.2),
    "session_length_min": (7.5, 3.0, 7.6, 3.1),
}


def main() -> int:
    prom_lines: list[str] = ["# HELP feature_drift_psi Population Stability Index vs reference",
                             "# TYPE feature_drift_psi gauge"]
    scores: dict[str, float] = {}
    print(f"{'feature':<24}{'PSI':>10}{'KL':>10}  verdict")
    print("-" * 60)
    for name, (rm, rs, lm, ls) in FEATURES.items():
        ref = sample(rm, rs, 5000)
        live = sample(lm, ls, 2000)
        edges = bin_edges(ref)
        rp, lp = hist(ref, edges), hist(live, edges)
        p, k = psi(rp, lp), kl(rp, lp)
        scores[name] = p
        print(f"{name:<24}{p:>10.4f}{k:>10.4f}  {band(p)}")
        prom_lines.append(f'feature_drift_psi{{feature="{name}"}} {p:.6f}')
        prom_lines.append(f'feature_drift_kl{{feature="{name}"}} {k:.6f}')

    print("\n--- /metrics (Prometheus text format) ---")
    print("\n".join(prom_lines))

    # alert rule of thumb (Ch 8): large AND sustained AND correlated with a
    # quality metric — here we only flag the "large" part.
    flagged = [n for n, v in scores.items() if v > 0.25]
    print(f"\nfeatures over PSI 0.25 (investigate: drift vs data-bug): {flagged or 'none'}")
    assert max(scores.values()) >= 0.0
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
