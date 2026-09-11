# Game day — single-cell failure (Part 9 Ch 9)

**Goal:** prove that losing one shared cell is contained (≤ 15% of traffic, no
SLO breach for other cells) and that the runbook works — with humans, in a
controlled window.

## Pre-flight
- [ ] Announce the window; on-call + cell owners present.
- [ ] Confirm the error-budget for the affected cell's tenants can absorb it.
- [ ] Snapshot dashboards (golden signals + SLO burn per cell) — P8 Ch 10.

## Inject
1. Pick a shared cell (`cell-us-2`).
2. Fail it: `kubectl -n cell-us-2 scale deploy --all --replicas=0`
   (or block its ingress). Start a timer.

## Observe (expected)
- Router marks `cell-us-2` unhealthy within ~30 s; its tenants re-hash to
  `cell-us-1` (rendezvous hashing → minimal reshuffle).
- `cell-us-1` absorbs the load: p99 rises but stays under SLO; no burn-rate page.
- `cell-acme`, `cell-eu-1` unaffected (verify their dashboards are flat).
- Total error rate spike < 1%, recovering as re-hash completes.

## Failure signatures to watch for (widen, don't narrow)
`slo_fast_burn` on any *other* cell · `cell-us-1` queue depth unbounded ·
router 5xx · stale replica in the target cell (the classic broken assumption) ·
cross-region spillover that shouldn't happen.

## Restore
3. `kubectl -n cell-us-2 scale deploy --all --replicas=<prev>`; wait for Ready.
4. Router re-includes `cell-us-2`; tenants re-hash back.
5. Stop the timer → that is the containment + recovery time.

## After
- [ ] File findings as action items (owner + date), e.g. "add replication-lag
      alert", "router failover was 45 s — target 20 s".
- [ ] Update this runbook with anything that surprised you.
