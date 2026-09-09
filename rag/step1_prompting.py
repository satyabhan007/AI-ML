"""
rag/step1_prompting.py
======================
A prompt is a program you write in English. Its STRUCTURE — not magic
words — decides the output's structure.

Same task, five prompt templates. We measure the concrete things that
actually change between them:
  - token budget (what you pay for, every call)
  - whether grounding context is included
  - whether an output format is pinned down
Then a deterministic responder shows that few-shot examples and a
"think step by step" scaffold change the SHAPE of the answer.
"""
import sys
import re

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from rag import prompt_token_estimate

TASK = "Classify the sentiment of: \"the battery dies in an hour\""
CONTEXT = ("Product reviews are labelled positive, negative, or neutral. "
           "Complaints about battery life are negative.")

TEMPLATES = {
    "zero-shot": (
        f"{TASK}\nSentiment:"),
    "role / system": (
        "You are a precise sentiment classifier. Reply with exactly one "
        f"word: positive, negative, or neutral.\n{TASK}\nSentiment:"),
    "few-shot": (
        "Q: \"I love this keyboard\"\nA: positive\n"
        "Q: \"it arrived broken\"\nA: negative\n"
        "Q: \"it is a phone\"\nA: neutral\n"
        f"Q: \"the battery dies in an hour\"\nA:"),
    "chain-of-thought": (
        f"{TASK}\nLet's think step by step, then end with 'Sentiment: <label>'."),
    "grounded (RAG-style)": (
        f"Use ONLY the policy below.\n=== POLICY ===\n{CONTEXT}\n"
        f"=== TASK ===\n{TASK}\nSentiment:"),
}

print("Step 1 — five prompt templates for ONE task\n")
print(f"{'template':<22} {'tokens':>7}  {'context?':>9}  {'format pinned?':>15}")
print("-" * 60)
for name, p in TEMPLATES.items():
    has_ctx = "yes" if "POLICY" in p else "no"
    pinned = "yes" if ("exactly one word" in p or "A:" in p or "Sentiment: <label>" in p) else "no"
    print(f"{name:<22} {prompt_token_estimate(p):>7}  {has_ctx:>9}  {pinned:>15}")


# ── a deterministic responder that reacts to prompt STRUCTURE ───────
def toy_respond(prompt):
    """
    Not intelligent — it just imitates the pattern the prompt sets up,
    the way a real model's output format tracks its prompt:
      - few-shot 'Q:/A:' block  -> answer in the same one-word style
      - 'step by step'           -> emit a short reasoning scaffold
      - otherwise                -> a bare label
    """
    label = "negative"  # the lexicon rule: "dies"/"broken"/"hour" -> negative
    if re.search(r"^A:$", prompt.strip().splitlines()[-1]):
        return label
    if "step by step" in prompt:
        return (f"1. The review mentions battery life.\n"
                f"2. Short battery life is a complaint.\n"
                f"Sentiment: {label}")
    if "exactly one word" in prompt:
        return label
    return label


print("\n--- responder output per template ---")
shapes = {}
for name, p in TEMPLATES.items():
    out = toy_respond(p)
    shapes[name] = out
    print(f"\n[{name}]\n{out}")

# checks: structure in -> structure out
assert "\n" in shapes["chain-of-thought"], "CoT prompt should yield multi-line reasoning"
assert shapes["few-shot"] == "negative", "few-shot should yield a bare one-word answer"
assert "\n" not in shapes["zero-shot"], "zero-shot should be terse"
assert prompt_token_estimate(TEMPLATES["few-shot"]) > prompt_token_estimate(TEMPLATES["zero-shot"]), \
    "few-shot costs more tokens than zero-shot"
print("\nPASS: prompt structure controls output structure and token cost")
