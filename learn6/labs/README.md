# Part 6 · labs — runnable configs

> **Standard, not from-scratch.** These labs stand up the *industry-standard* serving
> stack with minimal, readable config — you operate it, you don't reimplement it.
> Every file here is validated in CI (`.github/workflows/lab-tests.yml`).

Landing in **Phase 1** alongside chapters 2–16:

| Lab | Stands up | Validated with |
|---|---|---|
| `capacity/` | a spreadsheet-free QPS / latency-budget / GPU-sizing calculator (pure-Python, zero deps) | `python capacity/sizing.py` |
| `gateway/` | `docker-compose.yml` — an inference gateway (Envoy) in front of two model stubs, with timeouts + retries + a circuit breaker | `docker compose config` |
| `serving/` | a KServe `InferenceService` + a vLLM `values.yaml` | `yamllint`, `helm lint` |
| `featurestore/` | a Feast `feature_store.yaml` + repo definition showing point-in-time joins | `feast validate` |
| `cache/` | a semantic-cache sidecar compose stack (Redis + a tiny embed service) | `docker compose config` |
| `loadtest/` | a `k6` script that drives the gateway and asserts a p99 SLO | `k6 --dry-run` (`--vus 1 --iterations 1` in CI) |

Until Phase 1 lands, this directory is intentionally a placeholder so links resolve.
