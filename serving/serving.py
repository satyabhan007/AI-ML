"""
serving/serving.py
==================
Shipping a trained model cheaply. Pure Python, zero deps.

Three levers that decide your inference bill:
  1. QUANTIZATION  — store weights in 8/4 bits instead of 32
  2. KV-CACHE      — never recompute the past; turns O(n^2) decode into O(n)
  3. BATCHING      — keep the GPU full across many users

None of this changes what the model says (much). It changes how much
memory it moves and how many FLOPs it burns — which is the whole game
once a model is trained.
"""

import math


# ── 1. quantization ────────────────────────────────────────────────

def quantize(xs, bits=8, symmetric=True):
    """
    Map floats -> small integers.  qmax = 2^(bits-1) - 1.
    symmetric: zero_point = 0, scale from max-abs (weights).
    asymmetric: scale + zero_point from [min, max] (activations).
    Returns a dict you can hand straight to dequantize().
    """
    qmax = (1 << (bits - 1)) - 1
    if symmetric:
        s = (max(abs(x) for x in xs) or 1e-12) / qmax
        q = [max(-qmax - 1, min(qmax, round(x / s))) for x in xs]
        return {"q": q, "scale": s, "zero": 0, "bits": bits}
    lo, hi = min(xs), max(xs)
    s = (hi - lo or 1e-12) / (2 * qmax + 1)
    z = round(-lo / s) - (qmax + 1)
    q = [max(-qmax - 1, min(qmax, round(x / s) + z)) for x in xs]
    return {"q": q, "scale": s, "zero": z, "bits": bits}


def dequantize(packed):
    s, z = packed["scale"], packed["zero"]
    return [(qi - z) * s for qi in packed["q"]]


def rmse(a, b):
    return math.sqrt(sum((x - y) ** 2 for x, y in zip(a, b)) / len(a))


def quantize_per_channel(matrix, bits=8):
    """One scale per ROW — each output channel gets its own dynamic range."""
    return [quantize(row, bits=bits, symmetric=True) for row in matrix]


def bytes_for(n_params, bits):
    return n_params * bits / 8


# ── 2. KV-cache: the cost of autoregressive decoding ──────────────

def generate_cost(prompt_len, gen_len, d_model):
    """
    Approximate FLOPs to generate `gen_len` tokens after a `prompt_len`
    prompt, with and without a KV-cache.

    Per new token at context length t:
      - project this token's Q,K,V           ~ 3 * 2 * d^2   (always)
      - WITHOUT cache: also re-project K,V for all t past    ~ t * 2 * 2 * d^2
      - attention scores + weighted values                   ~ 2 * 2 * t * d
    """
    no_cache = with_cache = 0.0
    for i in range(gen_len):
        t = prompt_len + i
        proj_new = 3 * 2 * d_model * d_model
        attn = 2 * 2 * t * d_model
        no_cache += proj_new + t * (2 * 2 * d_model * d_model) + attn
        with_cache += proj_new + attn
    return {"no_cache": no_cache, "with_cache": with_cache,
            "speedup": no_cache / with_cache}


# ── 3. continuous batching vs static batching ─────────────────────

def batching_sim(request_lens, slots=4, mode="static"):
    """
    Simulate serving `request_lens` (tokens to generate each) on `slots`
    parallel lanes. One time-step = every active lane emits one token.

    static     : load `slots` requests, wait for ALL to finish before
                 loading the next group (short requests idle their lane).
    continuous : the instant a lane finishes, admit the next request.

    Returns steps (wall-clock proxy) and utilisation (useful token-steps
    / total lane-steps).
    """
    queue = list(request_lens)
    total_work = sum(request_lens)
    steps = 0

    if mode == "static":
        while queue:
            batch = [queue.pop(0) for _ in range(min(slots, len(queue)))]
            steps += max(batch)                 # wait for the longest
        return {"steps": steps, "slots": slots,
                "utilisation": total_work / (steps * slots)}

    # continuous
    lanes = []
    while queue or lanes:
        while len(lanes) < slots and queue:
            lanes.append(queue.pop(0))
        steps += 1
        lanes = [r - 1 for r in lanes]
        lanes = [r for r in lanes if r > 0]
    return {"steps": steps, "slots": slots,
            "utilisation": total_work / (steps * slots)}


# ── roofline: are you compute-bound or memory-bound? ─────────────

def roofline(flops, bytes_moved, peak_flops, bandwidth):
    intensity = flops / bytes_moved
    ridge = peak_flops / bandwidth
    return {"intensity": intensity, "ridge": ridge,
            "bound": "compute" if intensity >= ridge else "memory"}


if __name__ == "__main__":
    xs = [math.sin(i / 7) for i in range(64)]
    packed = quantize(xs, bits=8)
    err = rmse(xs, dequantize(packed))
    assert err < 0.01, err
    assert generate_cost(100, 50, 128)["speedup"] > 5
    print("PASS: quantize round-trips and KV-cache speedup is real")
