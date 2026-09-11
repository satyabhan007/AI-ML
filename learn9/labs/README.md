# Part 9 · labs — runnable configs

> **Standard practice, applied.** These labs are minimal, reviewable artifacts that
> encode established frameworks (Team Topologies, NIST AI RMF, ISO/IEC 42001,
> FinOps, cell architecture) for AI/ML. Validated in CI (`.github/workflows/lab-tests.yml`, job `parts_6_9`).

| Lab | Contains | Validated with |
|---|---|---|
| [`paved-road/`](paved-road/) | a Backstage Software Template that scaffolds a model service with CI, canary, OTel, registry and tenancy wired in by default | `yamllint` |
| [`tenancy/`](tenancy/) | a model-gateway config — per-tenant isolation, token-based rate limits, quotas, tiers, weighted fair-queuing — plus a simulation of a noisy neighbour | `yamllint`, `python tenancy/simulate.py` |
| [`governance/`](governance/) | a filled-in `model-card.md` + an `approval-workflow.yaml` (states, gates, risk-tiered sign-offs, re-review triggers) | `yamllint` |
| [`airmf/`](airmf/) | a NIST AI RMF gap-assessment checklist + a scorer that prints per-function maturity and a ranked gap list | `python airmf/score.py` |
| [`finops/`](finops/) | a zero-dep GPU commitment/spot/on-demand mix model + a token-based chargeback split | `python finops/model.py` |
| [`cells/`](cells/) | a cell (bulkhead) router config with shuffle sharding + a single-cell-failure game-day runbook | `yamllint` |
| [`readiness/`](readiness/) | the enterprise-readiness checklist + a scorer that produces a tier-aware go/no-go report with tracked exceptions | `python readiness/check.py` |

Each Python lab is self-contained (stdlib + PyYAML) and prints a worked example —
run it to see the report shape before adapting the data to your own platform.
