"""
serving/step1_quantization.py
=============================
FP32 -> INT8: four times smaller, almost the same numbers.

A weight is just a float. Store it in 8 bits instead of 32 and the
model shrinks 4x — the catch is rounding error. We measure that error
two ways:
  - per-tensor : one scale for the whole matrix
  - per-channel: one scale per row (each output channel keeps its own
                 dynamic range) — the standard fix, near-free.
"""
import sys
import math

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from serving import (quantize, dequantize, quantize_per_channel, rmse,
                     bytes_for)


def mean_rel_err(orig, approx):
    """Average |error| relative to each weight's own size — this is where
    per-channel scaling pays off: small-magnitude rows stop getting
    swamped by one global scale."""
    return sum(abs(a - b) / (abs(a) + 1e-9)
               for a, b in zip(orig, approx)) / len(orig)

# a weight matrix where rows have very different scales (common in real nets)
def lcg(seed):
    x = seed
    while True:
        x = (1103515245 * x + 12345) & 0x7FFFFFFF
        yield x / 0x7FFFFFFF - 0.5

g = lcg(42)
ROWS, COLS = 16, 64
MATRIX = [[next(g) * (10 ** (r % 4)) for _ in range(COLS)] for r in range(ROWS)]
flat = [x for row in MATRIX for x in row]
n = ROWS * COLS

print("Step 1 — quantizing a weight matrix\n")
print(f"matrix: {ROWS}x{COLS} = {n} weights, row magnitudes span 1x .. 1000x\n")

print("size:")
print(f"  FP32 : {bytes_for(n, 32):>7.0f} bytes")
print(f"  INT8 : {bytes_for(n, 8):>7.0f} bytes   ({bytes_for(n,32)/bytes_for(n,8):.0f}x smaller)")
print(f"  INT4 : {bytes_for(n, 4):>7.0f} bytes   ({bytes_for(n,32)/bytes_for(n,4):.0f}x smaller)")

# per-tensor: one global scale
pt = quantize(flat, bits=8)
pt_flat = dequantize(pt)

# per-channel: one scale per row
pc_rows = quantize_per_channel(MATRIX, bits=8)
pc_flat = [v for packed in pc_rows for v in dequantize(packed)]

# INT4 per-channel for contrast
pc4 = quantize_per_channel(MATRIX, bits=4)
pc4_flat = [v for packed in pc4 for v in dequantize(packed)]

rel_pt = mean_rel_err(flat, pt_flat)
rel_pc = mean_rel_err(flat, pc_flat)
rel_pc4 = mean_rel_err(flat, pc4_flat)

print(f"\nmean error relative to each weight's own magnitude:")
print(f"  INT8 per-tensor  : {rel_pt*100:8.3f}%   (small rows swamped by the global scale)")
print(f"  INT8 per-channel : {rel_pc*100:8.3f}%   ({rel_pt/rel_pc:.0f}x better)")
print(f"  INT4 per-channel : {rel_pc4*100:8.3f}%")

# per-row breakdown — rows 0..3 span the full 1x..1000x range
print("\nper-row RMSE (per-tensor vs per-channel):")
pt_deq = dequantize(pt)
for r in range(4):
    row = MATRIX[r]
    a = rmse(row, pt_deq[r*COLS:(r+1)*COLS])
    b = rmse(row, dequantize(pc_rows[r]))
    print(f"  row {r} (|max|~{max(abs(x) for x in row):8.1f}) : "
          f"per-tensor {a:10.4f}   per-channel {b:9.5f}")

assert bytes_for(n, 32) / bytes_for(n, 8) == 4
assert rel_pc < rel_pt / 10, "per-channel should crush per-tensor relative error"
assert rel_pc < 0.02, "INT8 per-channel relative error should be a couple of %"
assert rel_pc4 > rel_pc, "INT4 trades more accuracy for more compression"
print("\nPASS: 4x smaller at INT8; per-channel scaling cuts relative error "
      f"{rel_pt/rel_pc:.0f}x across rows that span 1000x in magnitude")
