#!/usr/bin/env python3
"""AI-ML · Part 8 lab — LLM telemetry the way classic APM misses it (Ch 5).

Simulates a batch of LLM calls and emits, per call, the OpenTelemetry GenAI
span attributes and the aggregate metrics you would export (tokens in/out,
cost/request, TTFT, tokens/sec, cache-hit, context-used %, finish_reason).

Zero dependencies — this is the *shape* of the instrumentation; in prod you would
use the OTel SDK (`opentelemetry-instrumentation-*` / OpenLLMetry).

  python learn8/labs/llm/instrument_demo.py
"""
from __future__ import annotations

import json
import random
import statistics

# illustrative prices ($ per 1M tokens) — replace with your model's rate card
PRICE_IN = 0.15 / 1_000_000
PRICE_OUT = 0.60 / 1_000_000
CONTEXT_WINDOW = 8192

random.seed(7)


def one_call(i: int) -> dict:
    cache_hit = random.random() < 0.28
    in_tok = random.choice([420, 900, 1_800, 3_100])
    out_tok = 0 if cache_hit else random.choice([80, 220, 400, 512])
    ttft_ms = 2 if cache_hit else random.choice([180, 320, 620, 900])
    tps = 0.0 if cache_hit else random.choice([28, 34, 40, 46])
    finish = "stop"
    if out_tok == 512:
        finish = "length"          # truncated at max_tokens — a silent quality hit
    if not cache_hit and random.random() < 0.03:
        finish = "content_filter"  # guardrail fired

    cost = 0.0 if cache_hit else (in_tok * PRICE_IN + out_tok * PRICE_OUT)

    # --- OTel GenAI span attributes (per request) ---
    span_attrs = {
        "gen_ai.system": "self-hosted",
        "gen_ai.request.model": "ranker-llm",
        "gen_ai.request.max_tokens": 512,
        "gen_ai.usage.input_tokens": in_tok,
        "gen_ai.usage.output_tokens": out_tok,
        "gen_ai.response.finish_reasons": [finish],
        "gen_ai.server.time_to_first_token_ms": ttft_ms,
        "gen_ai.server.tokens_per_second": tps,
        "aiml.cache_hit": cache_hit,
        "aiml.cache_type": "semantic" if cache_hit else "",
        "aiml.context_used_ratio": round(in_tok / CONTEXT_WINDOW, 3),
        "aiml.cost_usd": round(cost, 8),
        "aiml.request_id": f"req-{i:04d}",
    }
    return span_attrs


def main() -> int:
    calls = [one_call(i) for i in range(200)]

    print("--- sample span (OTel GenAI attributes) ---")
    print(json.dumps(calls[0], indent=2))

    # --- aggregate metrics you would export to Prometheus/OTLP ---
    in_toks = [c["gen_ai.usage.input_tokens"] for c in calls]
    costs = [c["aiml.cost_usd"] for c in calls]
    ttfts = [c["gen_ai.server.time_to_first_token_ms"] for c in calls]
    succ = [c for c in calls if c["gen_ai.response.finish_reasons"] != ["content_filter"]]
    hits = sum(1 for c in calls if c["aiml.cache_hit"])
    trunc = sum(1 for c in calls if c["gen_ai.response.finish_reasons"] == ["length"])
    filt = sum(1 for c in calls if c["gen_ai.response.finish_reasons"] == ["content_filter"])

    def pct(xs, p):
        xs = sorted(xs)
        return xs[min(len(xs) - 1, int(len(xs) * p))]

    metrics = {
        "gen_ai.client.token.usage{type=input} p50": statistics.median(in_toks),
        "gen_ai.client.token.usage{type=input} p95": pct(in_toks, 0.95),
        "gen_ai.server.time_to_first_token_ms p95": pct(ttfts, 0.95),
        "aiml.cache_hit_ratio": round(hits / len(calls), 3),
        "aiml.finish_reason_total{reason=length}": trunc,
        "aiml.finish_reason_total{reason=content_filter}": filt,
        "aiml.cost_usd_total": round(sum(costs), 6),
        "aiml.cost_per_successful_request": round(sum(costs) / max(1, len(succ)), 8),
        "aiml.context_used_ratio p95": pct([c["aiml.context_used_ratio"] for c in calls], 0.95),
    }
    print("\n--- exported metrics ---")
    for k, v in metrics.items():
        print(f"  {k} = {v}")

    # a lab assertion: cost-per-successful-request must be finite and positive
    assert metrics["aiml.cost_per_successful_request"] > 0
    print("\nOK — instrument the real path with the OTel SDK; the fields are the same.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
