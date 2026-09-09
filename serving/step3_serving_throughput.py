"""
serving/step3_serving_throughput.py
===================================
The GPU is rented by the second. Idle lanes are money on fire.

STATIC batching loads N requests, runs them together, and waits for the
SLOWEST one before loading the next N — a 5-token reply sits idle while
a 500-token reply finishes.

CONTINUOUS batching (vLLM's trick) refills a lane the instant its
request finishes. Same hardware, far higher utilisation.

We serve 16 requests with wildly different output lengths on 4 lanes
and compare wall-clock steps and GPU utilisation.
"""
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from serving import batching_sim

# 16 requests: a few long, many short — the real traffic shape
REQUESTS = [200, 12, 8, 150, 20, 6, 5, 90, 10, 7, 4, 120, 15, 9, 3, 60]
SLOTS = 4

static = batching_sim(REQUESTS, slots=SLOTS, mode="static")
cont = batching_sim(REQUESTS, slots=SLOTS, mode="continuous")

print("Step 3 — static vs continuous batching\n")
print(f"{len(REQUESTS)} requests, output lengths {min(REQUESTS)}..{max(REQUESTS)} "
      f"tokens, {SLOTS} lanes\n")
print(f"  {'':<12} {'steps':>8} {'utilisation':>13}")
print(f"  {'static':<12} {static['steps']:>8} {static['utilisation']*100:>12.1f}%")
print(f"  {'continuous':<12} {cont['steps']:>8} {cont['utilisation']*100:>12.1f}%")
print(f"\n  continuous batching: {static['steps']/cont['steps']:.2f}x fewer steps, "
      f"{cont['utilisation']/static['utilisation']:.2f}x the utilisation")

# roofline aside: which regime are we even in?
from serving import roofline
rl = roofline(flops=2 * 7e9, bytes_moved=7e9 * 2, peak_flops=312e12, bandwidth=2e12)
print(f"\nroofline (7B model, 1 token, INT16 weights): arithmetic intensity "
      f"{rl['intensity']:.1f} vs ridge {rl['ridge']:.0f} -> {rl['bound']}-bound")
print("  (single-user decode is memory-bound — batching adds compute for ~free)")

assert cont["steps"] < static["steps"], "continuous should finish sooner"
assert cont["utilisation"] > static["utilisation"] * 1.3, "continuous should use lanes better"
assert rl["bound"] == "memory"
print("\nPASS: continuous batching finished in fewer steps at much higher "
      "GPU utilisation on the same 4 lanes")
