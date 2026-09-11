# Part 6 · labs — runnable configs

> **Standard, not from-scratch.** These labs stand up the *industry-standard* serving
> stack with minimal, readable config — you operate it, you don't reimplement it.
> Every file here is validated in CI (`.github/workflows/lab-tests.yml`, job `parts_6_9`).

| Lab | Stands up | Validated with |
|---|---|---|
| [`capacity/`](capacity/) | a spreadsheet-free QPS / latency-budget / GPU-sizing calculator (pure-Python, zero deps) | `python capacity/sizing.py` |
| [`gateway/`](gateway/) | `docker-compose.yml` — an inference gateway (Envoy) in front of two model stubs, with a route timeout, retries, and outlier-detection circuit breaking | `docker compose config` |
| [`serving/`](serving/) | a Helm chart wrapping a KServe `InferenceService` running vLLM | `helm lint`, `helm template \| kubeconform` |
| [`featurestore/`](featurestore/) | a Feast `feature_store.yaml` + repo definition (offline + online, point-in-time joins) | yamllint (`feast apply` needs the `feast` package) |
| [`cache/`](cache/) | a semantic-cache sidecar stack (Redis Stack + a TEI embedding server) + the cache-key design | `docker compose config` |
| [`loadtest/`](loadtest/) | a `k6` script that drives the gateway with a realistic mix and asserts p95/p99 SLO thresholds | `k6 inspect` |

Run any of them locally with `docker compose up -d` in the lab's directory (see
each file's header comment for the exact commands).
