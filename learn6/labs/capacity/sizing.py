#!/usr/bin/env python3
"""AI-ML · Part 6 lab — capacity calculator (zero dependencies).

Turns product numbers into a defensible fleet size and GPU count, using the
back-of-envelope from Part 6 Ch 2 (QPS, peak factor, Little's Law, latency
budget, LLM token throughput).

Run:  python learn6/labs/capacity/sizing.py
It prints two worked examples and self-checks the arithmetic with asserts.
"""
from __future__ import annotations

import math
from dataclasses import dataclass


# ----------------------------- classic model service -----------------------------
@dataclass
class ClassicPlan:
    daily_requests: float
    peak_factor: float                 # measured peak / average
    per_replica_capacity_rps: float    # from a load test at the latency target
    target_utilisation: float          # headroom: 0.5-0.7 typical
    zones: int

    @property
    def qps_avg(self) -> float:
        return self.daily_requests / 86_400

    @property
    def qps_peak(self) -> float:
        return self.qps_avg * self.peak_factor

    @property
    def replicas(self) -> int:
        raw = self.qps_peak / self.per_replica_capacity_rps / self.target_utilisation
        # round up, then round up again to a multiple of `zones` for even spread + N+1
        n = math.ceil(raw)
        n = math.ceil(n / self.zones) * self.zones
        return n + self.zones  # N+1 per zone so losing one zone is survivable


def littles_law_capacity(concurrency: int, mean_latency_ms: float) -> float:
    """L = lambda * W  ->  lambda = L / W  (requests/sec one replica sustains)."""
    return concurrency / (mean_latency_ms / 1000.0)


# ------------------------------- LLM endpoint -----------------------------------
@dataclass
class LLMPlan:
    target_rps: float
    mean_output_tokens: int
    tokens_per_sec_per_gpu: float      # from a benchmark at the serving batch size
    prefill_headroom_gpus: int
    failover_gpus: int

    @property
    def output_tokens_per_sec(self) -> float:
        return self.target_rps * self.mean_output_tokens

    @property
    def gpus(self) -> int:
        decode = math.ceil(self.output_tokens_per_sec / self.tokens_per_sec_per_gpu)
        return decode + self.prefill_headroom_gpus + self.failover_gpus


# ---------------------------- latency budgeting -------------------------------
def latency_budget(p99_target_ms: float, hops_ms: dict[str, float]) -> float:
    spent = sum(hops_ms.values())
    slack = p99_target_ms - spent
    return slack


def _print_table(title: str, rows: list[tuple[str, str]]) -> None:
    print(f"\n{title}")
    print("-" * len(title))
    width = max(len(k) for k, _ in rows)
    for k, v in rows:
        print(f"  {k.ljust(width)}  {v}")


def demo() -> None:
    # ---- Scenario A: classic ranking service (Part 6 Ch 2, Scenario A) ----
    a = ClassicPlan(
        daily_requests=240_000_000,      # 40M users x 6 feed loads/day
        peak_factor=3.0,
        per_replica_capacity_rps=120.0,  # measured: p99 180ms at 4 vCPU
        target_utilisation=0.60,
        zones=3,
    )
    _print_table("Scenario A — classic ranking service", [
        ("daily requests", f"{a.daily_requests:,.0f}"),
        ("QPS average", f"{a.qps_avg:,.0f}"),
        ("QPS peak (x{:.0f})".format(a.peak_factor), f"{a.qps_peak:,.0f}"),
        ("per-replica capacity", f"{a.per_replica_capacity_rps:.0f} rps @ target latency"),
        ("target utilisation", f"{a.target_utilisation:.0%}"),
        ("replicas (rounded, +N per zone)", f"{a.replicas} across {a.zones} zones"),
        ("Little's Law cross-check", f"{littles_law_capacity(24, 180):.0f} rps "
                                     f"(concurrency 24, mean 180ms)"),
    ])
    assert a.qps_avg == 240_000_000 / 86_400
    assert 8_000 < a.qps_peak < 8_500
    assert a.replicas >= math.ceil(a.qps_peak / a.per_replica_capacity_rps)

    # ---- Scenario B: LLM endpoint (Part 6 Ch 2, Scenario B) ----
    b = LLMPlan(
        target_rps=50,
        mean_output_tokens=400,
        tokens_per_sec_per_gpu=2_500,    # benchmark: batch 16
        prefill_headroom_gpus=1,
        failover_gpus=1,
    )
    _print_table("Scenario B — self-hosted LLM endpoint", [
        ("target throughput", f"{b.target_rps:.0f} rps x {b.mean_output_tokens} out tok"),
        ("output tokens/sec needed", f"{b.output_tokens_per_sec:,.0f}"),
        ("tokens/sec/GPU (benchmarked)", f"{b.tokens_per_sec_per_gpu:,.0f}"),
        ("GPUs (decode + prefill + failover)", f"{b.gpus}"),
        ("autoscale band suggestion", f"{max(1, b.gpus - 4)}-{b.gpus + 4} GPUs"),
    ])
    assert b.output_tokens_per_sec == 20_000
    assert b.gpus == math.ceil(20_000 / 2_500) + 2  # 8 + 2

    # ---- latency budget (Part 6 Ch 2, L3) ----
    hops = {"LB": 5, "auth": 10, "feature fetch": 30, "model": 120,
            "serialization": 10, "network": 15}
    slack = latency_budget(200, hops)
    _print_table("Latency budget — p99 target 200 ms", (
        [(k, f"{v:.0f} ms") for k, v in hops.items()]
        + [("sum", f"{sum(hops.values()):.0f} ms"), ("slack", f"{slack:.0f} ms")]
    ))
    assert slack == 10

    # ---- cost per request ----
    replica_hourly = 0.35        # 4 vCPU spot-ish
    cost_per_req = (replica_hourly * a.replicas) / (a.qps_avg * 3600)
    _print_table("Cost per request (Scenario A)", [
        ("replica $/hour", f"${replica_hourly:.2f}"),
        ("replicas", f"{a.replicas}"),
        ("cost per request", f"${cost_per_req:.6f}"),
    ])
    assert cost_per_req > 0

    print("\nAll capacity self-checks passed.")


if __name__ == "__main__":
    demo()
