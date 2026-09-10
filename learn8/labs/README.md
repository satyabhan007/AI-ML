# Part 8 · labs — runnable configs

> **Standard, not from-scratch.** These labs stand up the *industry-standard*
> observability stack with minimal config — OpenTelemetry, Prometheus, Grafana,
> Loki, Tempo. Validated in CI (`.github/workflows/lab-tests.yml`).

Landing in **Phase 3** alongside chapters 2–16:

| Lab | Stands up | Validated with |
|---|---|---|
| `stack/` | `docker-compose.yml` — OTel Collector + Prometheus + Grafana + Tempo + Loki + a tiny instrumented FastAPI model stub | `docker compose config`, `otelcol validate` |
| `otel/` | an OTel Collector config with OTLP in, tail-based sampling, and the GenAI attributes mapped | `otelcol validate` |
| `rules/` | Prometheus recording + alerting rules: golden signals, an SLO, a multi-window burn-rate alert | `promtool check rules` |
| `slo/` | an SLO definition (Sloth / OpenSLO format) generating the burn-rate rules | `sloth validate` / `yamllint` |
| `llm/` | an instrumentation snippet emitting tokens, cost/request, TTFT, tokens/sec, cache-hit as OTel metrics + span attributes | `python llm/instrument_demo.py` |
| `dashboards/` | a Grafana dashboard JSON — per-model & per-tenant rows, exemplars metric→trace | `python -m json.tool` |
| `drift/` | a zero-dep drift monitor (PSI / KL over a reference vs live window) exposed as Prometheus metrics | `python drift/monitor.py` |

Until Phase 3 lands, this directory is intentionally a placeholder so links resolve.
