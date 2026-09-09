"""
serving/step2_kv_cache.py
=========================
Why the first ChatGPT token is slow, then words pour out.

To generate token N, attention needs the keys and values of tokens
1..N-1. Recompute them every step and decoding is O(n^2). Cache them
once and each new token is O(n) — you only project the ONE new token
and score it against the stored past.

We add up the FLOPs to generate 128 tokens after a 256-token prompt,
with and without the cache.
"""
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from serving import generate_cost

PROMPT, GEN, D = 256, 128, 512

cost = generate_cost(PROMPT, GEN, D)

print("Step 2 — KV-cache: recompute the past, or remember it\n")
print(f"prompt {PROMPT} tokens, generate {GEN} tokens, d_model {D}\n")
print(f"  without KV-cache : {cost['no_cache']:.3e} FLOPs")
print(f"  with    KV-cache : {cost['with_cache']:.3e} FLOPs")
print(f"  speed-up         : {cost['speedup']:.1f}x\n")

# show the per-token cost curve: no-cache grows with context, cache is flat
print("per-token FLOPs as the context grows:")
print(f"  {'context':>8}  {'no-cache':>12}  {'with-cache':>12}")
prev = None
for ctx in (256, 320, 384):
    a = generate_cost(ctx, 1, D)["no_cache"]
    b = generate_cost(ctx, 1, D)["with_cache"]
    print(f"  {ctx:>8}  {a:>12.2e}  {b:>12.2e}")

# no-cache per-token cost should scale ~linearly with context (=> O(n^2) total)
t1 = generate_cost(256, 1, D)["no_cache"]
t2 = generate_cost(512, 1, D)["no_cache"]
cache1 = generate_cost(256, 1, D)["with_cache"]
cache2 = generate_cost(512, 1, D)["with_cache"]

print(f"\ndoubling context 256 -> 512:")
print(f"  no-cache per-token FLOPs : x{t2/t1:.2f}   (re-projects the whole past)")
print(f"  with-cache per-token     : x{cache2/cache1:.2f}   (only the attention "
      f"term grows; projections are constant)")

assert cost["speedup"] > 8, cost["speedup"]
assert 1.8 < t2 / t1 < 2.2, "no-cache decode should scale ~linearly with context"
assert cache2 / cache1 < 1.4, "cached decode should grow far more slowly than no-cache"
print("\nPASS: the KV-cache turns O(n^2) decoding into ~O(n) — "
      f"{cost['speedup']:.0f}x fewer FLOPs here; what's left (attention over the "
      f"cache) is why very long generations still slow down")
