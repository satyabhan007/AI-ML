# Part 9 · labs — runnable configs

> **Standard practice, applied.** These labs are minimal, reviewable artifacts that
> encode established frameworks (Team Topologies, NIST AI RMF, ISO/IEC 42001,
> FinOps, cell architecture) for AI/ML. Validated in CI (`.github/workflows/lab-tests.yml`).

Landing in **Phase 4** alongside chapters 2–16:

| Lab | Contains | Validated with |
|---|---|---|
| `paved-road/` | a Backstage-style `template.yaml` that scaffolds a model service with CI, canary, OTel and registry wired by default | `yamllint` |
| `tenancy/` | a model-gateway config: per-tenant quotas, tiered rate limits, token budgets, metering labels | `yamllint`, `python tenancy/simulate.py` |
| `governance/` | a `model-card.md` template + an approval-workflow definition (states, gates, sign-offs) | `yamllint` |
| `airmf/` | a NIST AI RMF gap-assessment checklist (YAML) + a scorer | `python airmf/score.py` |
| `finops/` | a zero-dep GPU commitment-vs-on-demand + chargeback model | `python finops/model.py` |
| `cells/` | a cell-router config + a game-day runbook for a single-cell failure | `yamllint` |
| `readiness/` | the enterprise-readiness checklist (YAML) driving a pass/fail report | `python readiness/check.py` |

Until Phase 4 lands, this directory is intentionally a placeholder so links resolve.
