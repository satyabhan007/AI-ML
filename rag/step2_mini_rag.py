"""
rag/step2_mini_rag.py
=====================
Retrieval-Augmented Generation, end to end:

    question -> embed -> nearest chunks -> prompt -> answer + citation

The model here is `GroundedResponder` (returns the best-matching
sentence from the retrieved text). It's dumb on purpose — what we're
testing is the RAG scaffolding:
  - does retrieval pull the RIGHT chunk?
  - is the answer traceable to a source?
  - does it REFUSE when the answer isn't in the knowledge base?
"""
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from rag import Retriever, rag_answer

KB = {
    "autograd": "An autograd engine records every operation on a graph and "
                "replays it backwards to compute gradients. micrograd is a "
                "scalar autograd engine written in about 150 lines of Python.",
    "tokenizer": "Byte-pair encoding merges the most frequent adjacent pair "
                 "of symbols over and over. Because API pricing is charged per "
                 "token, using fewer tokens directly means a lower bill and "
                 "leaves more room in the context window.",
    "attention": "The attention mechanism compares every token with every "
                 "other token, so its time complexity is quadratic in the "
                 "sequence length. Doubling the context roughly quadruples "
                 "the attention compute.",
    "embeddings": "An embedding maps text to a vector so that similar meanings "
                  "land near each other. RAG finds relevant context by running "
                  "nearest-neighbour search over those embedding vectors.",
    "matmul": "Matrix multiplication is the single operation that dominates a "
              "forward pass. GPUs exist because matmul is embarrassingly "
              "parallel across thousands of cores.",
    "quantization": "Quantization stores model weights in 8-bit or 4-bit "
                    "integers instead of 32-bit floats, making the model about "
                    "four times smaller for a small accuracy cost.",
}

r = Retriever()
for k, v in KB.items():
    r.add(k, v)

print("Step 2 — mini-RAG over a 6-document knowledge base\n")

QUESTIONS = [
    ("Why do fewer tokens mean a lower API bill?", "tokenizer"),
    ("What is the time complexity of attention?", "attention"),
    ("How much smaller does quantization make a model?", "quantization"),
    ("How does RAG find relevant context?", "embeddings"),
]

routed = grounded = 0
for q, expect_src in QUESTIONS:
    out = rag_answer(q, r, k=3)
    top_doc = out["retrieved"][0].split("#")[0]
    routed += (top_doc == expect_src)
    grounded += out["grounded"]
    print(f"Q: {q}")
    print(f"   retrieved : {out['retrieved']}   (want top: {expect_src})   "
          f"{'OK' if top_doc == expect_src else 'MISS'}")
    print(f"   answer    : {out['text']}")
    print(f"   cite      : {out['source']}")
    print(f"   prompt    : ~{out['prompt_tokens']} tokens\n")

# out-of-scope question -> must refuse, not invent
oos = rag_answer("What was the box-office revenue of the movie Titanic?", r, k=3)
print(f"Q: What was the box-office revenue of the movie Titanic?")
print(f"   answer    : {oos['text']}")
print(f"   grounded  : {oos['grounded']}   (expected: False)")

assert routed == len(QUESTIONS), f"retrieval routed {routed}/{len(QUESTIONS)} to the right doc"
assert grounded >= len(QUESTIONS) - 1, f"only {grounded} answers were grounded"
assert oos["grounded"] is False, "should refuse on an out-of-scope question"
print(f"\nPASS: {routed}/{len(QUESTIONS)} questions retrieved the right source, "
      f"{grounded} answered with a citation, out-of-scope question refused")
