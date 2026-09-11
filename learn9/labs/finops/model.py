#!/usr/bin/env python3
"""AI-ML · Part 9 lab — GPU fleet economics + chargeback model (Ch 8).

Zero dependencies. Given a year of demand (a 24/7 floor + a peak), picks a
commitment / spot / on-demand mix, compares it to all-on-demand, and shows a
per-team chargeback split from metered token usage.

  python learn9/labs/finops/model.py
"""
from __future__ import annotations

HOURS_PER_MONTH = 730

# GPU $/hour by purchase mode (illustrative)
ON_DEMAND = 3.20
COMMITTED_1YR = ON_DEMAND * 0.45   # ~55% off the committed portion
SPOT = ON_DEMAND * 0.20            # ~80% off, interruption-tolerant only


def plan_fleet(floor_gpus: int, peak_gpus: int, spot_eligible_frac: float) -> dict:
    """Commit the 24/7 floor, run a middle band on spot, on-demand for the peak."""
    committed = floor_gpus
    mid_band = max(0, peak_gpus - floor_gpus)
    spot = int(mid_band * spot_eligible_frac)
    on_demand = mid_band - spot

    # rough monthly hours: floor runs 730h; mid band runs ~40% of the month
    mid_hours = int(HOURS_PER_MONTH * 0.40)
    cost = (
        committed * COMMITTED_1YR * HOURS_PER_MONTH
        + spot * SPOT * mid_hours
        + on_demand * ON_DEMAND * mid_hours
    )
    baseline = (
        floor_gpus * ON_DEMAND * HOURS_PER_MONTH
        + mid_band * ON_DEMAND * mid_hours
    )
    return {
        "committed": committed, "spot": spot, "on_demand": on_demand,
        "monthly_cost": cost, "all_on_demand_cost": baseline,
        "saving_pct": 100 * (1 - cost / baseline),
    }


def chargeback(total_cost: float, team_tokens: dict[str, int]) -> dict[str, float]:
    grand = sum(team_tokens.values()) or 1
    return {t: total_cost * n / grand for t, n in team_tokens.items()}


def _money(x: float) -> str:
    return f"${x:,.0f}"


def main() -> int:
    fleet = plan_fleet(floor_gpus=70, peak_gpus=150, spot_eligible_frac=0.6)

    print("Fleet plan (floor 70, peak 150 GPUs)")
    print("-----------------------------------")
    print(f"  committed (1yr): {fleet['committed']:>4}   @ {_money(COMMITTED_1YR)}/h")
    print(f"  spot           : {fleet['spot']:>4}   @ {_money(SPOT)}/h")
    print(f"  on-demand      : {fleet['on_demand']:>4}   @ {_money(ON_DEMAND)}/h")
    print(f"\n  monthly cost (mix)        : {_money(fleet['monthly_cost'])}")
    print(f"  monthly cost (all on-demand): {_money(fleet['all_on_demand_cost'])}")
    print(f"  saving                     : {fleet['saving_pct']:.1f}%")

    # metered token usage this month (P8 Ch 13 attribution -> P9 chargeback)
    team_tokens = {
        "ranking": 5_200_000_000,
        "support-bot": 3_100_000_000,
        "search": 1_400_000_000,
        "internal-tools": 300_000_000,
    }
    split = chargeback(fleet["monthly_cost"], team_tokens)
    print("\nChargeback (by metered tokens)")
    print("-----------------------------")
    for team, amount in sorted(split.items(), key=lambda kv: -kv[1]):
        share = 100 * amount / fleet["monthly_cost"]
        print(f"  {team:<16} {_money(amount):>10}  ({share:4.1f}%)")

    assert abs(sum(split.values()) - fleet["monthly_cost"]) < 1.0
    assert fleet["saving_pct"] > 0
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
