# Part 8 · labs — runnable configs

> **Standard, not from-scratch.** These labs stand up the *industry-standard*
> observability stack with minimal config — OpenTelemetry, Prometheus, Grafana,
> Loki, Tempo. Validated in CI (`.github/workflows/lab-tests.yml`, job `parts_6_9`).

| Lab | Stands up | Validated with |
|---|---|---|
| [`stack/`](stack/) | `docker-compose.yml` — OTel Collector + Prometheus + Grafana + Tempo + Loki + `telemetrygen` to exercise the pipeline with zero app code | `docker compose config` |
| [`otel/`](otel/) | the OTel Collector config used by `stack/` — OTLP in, PII redaction, tail-based sampling, Prometheus + Tempo out | `otelcol validate` |
| [`rules/`](rules/) | Prometheus recording rules (golden signals), an SLO, and multi-window multi-burn-rate alerts, plus a quality/safety alert | `promtool check rules` |
| [`slo/`](slo/) | the same SLOs as OpenSLO v1 — the source a generator (Sloth/oslo) would turn into the rules above | `yamllint` |
| [`llm/`](llm/) | a zero-dep instrumentation demo emitting the OTel GenAI span attributes + the aggregate metrics (tokens, cost/req, TTFT, tokens/s, cache-hit, finish_reason) | `python llm/instrument_demo.py` |
| [`dashboards/`](dashboards/) | a Grafana "service overview" dashboard JSON — golden signals + LLM + cost rows, `$model`/`$tenant` template vars, exemplars, a worst-tenants table | `python -m json.tool` |
| [`drift/`](drift/) | a zero-dep PSI/KL drift monitor (reference vs. live window), printing a Prometheus `/metrics` block | `python drift/monitor.py` |

`docker compose -f stack/docker-compose.yml up -d` then open Grafana at
`localhost:3000` to see the pipeline end to end.
