# Model Card — `ranker-llm` v43

> Part 9 Ch 3 template. Generated from the training run + eval harness; stored
> with the registry entry (P7 Ch 2). One page, kept current.

## Overview
| | |
|---|---|
| Model | `ranker-llm` |
| Version | 43 |
| Owner | team:ranking (`@ranking-oncall`) |
| Risk tier | **tier-1** (customer-facing, affects what users see) |
| Registry | `registry://ranker-llm@43`, alias `@candidate` |
| Provenance | git `abc1234`, dataset snapshot `orders-2024-11-01`, base `Llama-3.1-8B` |

## Intended use
Re-rank the top ~100 retrieved feed candidates for the home feed. Online, p99 &lt; 200 ms.

## Out-of-scope use
Not for eligibility, pricing, moderation, or any decision about a person. Not a
general chat model. Not to be reused outside the ranking service without review.

## Training data
Implicit engagement labels (impressions + click/dwell/like/hide), 2024-06-01 →
2024-10-31, point-in-time joined. Position bias corrected via logged propensity.
No special-category data. PII: none (surrogate user ids only).

## Evaluation
| Metric | v43 | v42 (prod) | Gate |
|---|---|---|---|
| NDCG@10 (frozen eval set v3) | 0.5142 | 0.5121 | ≥ −0.5% |
| Groundedness pass ratio | 0.984 | 0.983 | ≥ 0.96 |
| Refusal correctness (safety slice) | 0.991 | 0.992 | ≥ 0.98 |
| p99 latency (ms) | 183 | 180 | ≤ 200 |
| Per-segment NDCG (10 locales) | min 0.47 | min 0.47 | no slice < −2% |

Held-out slice (authors never see): NDCG@10 0.508.

## Limitations & risks
- Under-serves brand-new items until the nightly embedding refresh.
- Feedback-loop risk on diversity — monitored per creator/topic (P8 Ch 8).
- Quantized to int8; re-evaluated on the quantized artifact.

## Monitoring plan
Golden signals + LLM telemetry + quality SLI + safety metrics (P8). Fast/slow
burn-rate alerts on latency-availability and groundedness SLIs. Shadow model running.

## Approvals
See `approval-workflow.yaml` — tier-1 requires model-risk-committee sign-off.
