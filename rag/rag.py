"""
rag/rag.py
==========
Prompting, Retrieval-Augmented Generation, and a tiny agent loop.
Pure Python, zero deps, fully deterministic.

The model itself is the one thing we DON'T build here (that's the rest
of the curriculum). Instead we build everything *around* it:

    question ->  retrieve context  ->  assemble prompt  ->  [MODEL]  ->  grounded answer
                 (embeddings +          (templates,          here: an     (with a citation,
                  nearest neighbour)     token budget)       extractive   or "I don't know")
                                                             stand-in

The "model" stand-in (`GroundedResponder`) is deliberately dumb: it
returns the sentence from the retrieved context that best matches the
question. That is enough to demonstrate the RAG mechanics that make or
break real systems — retrieval quality, grounding, and refusal.
"""

import math
import re

# ── deterministic text -> vector (feature hashing, no training) ──────

def _fnv1a(s):
    """Stable 32-bit hash (Python's built-in hash() is salted per run)."""
    h = 0x811c9dc5
    for b in s.encode("utf-8"):
        h ^= b
        h = (h * 0x01000193) & 0xFFFFFFFF
    return h


_WORD = re.compile(r"[a-z0-9]+")

# tiny stop-list: these carry no topic signal and otherwise dominate
# cosine on short texts (they're in every document).
STOPWORDS = {
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "of", "to", "in", "on", "at", "for", "and", "or", "but", "if", "then",
    "it", "its", "this", "that", "these", "those", "as", "by", "with",
    "from", "into", "about", "how", "what", "why", "when", "which", "who",
    "does", "do", "did", "can", "could", "will", "would", "so", "than",
    "much", "many", "more", "less", "you", "your", "we", "our", "they",
}


def tokenize(text, drop_stop=False):
    toks = _WORD.findall(text.lower())
    return [t for t in toks if t not in STOPWORDS] if drop_stop else toks


class HashingEmbedder:
    """
    Bag-of-words hashed into `dim` buckets, then L2-normalised.
    No training, no vocabulary file — same idea as scikit-learn's
    HashingVectorizer. Good enough to retrieve the right paragraph.
    """

    def __init__(self, dim=2048):
        self.dim = dim

    def embed(self, text):
        v = [0.0] * self.dim
        for tok in tokenize(text, drop_stop=True):
            j = _fnv1a(tok) % self.dim
            sign = 1.0 if (_fnv1a(tok + "#") & 1) else -1.0
            v[j] += sign
        n = math.sqrt(sum(x * x for x in v)) or 1.0
        return [x / n for x in v]


def cosine(a, b):
    return sum(x * y for x, y in zip(a, b))   # inputs are already unit vectors


# ── chunking ────────────────────────────────────────────────────────

def chunk(text, size=40, overlap=10):
    """Split into ~`size`-word windows with `overlap` words of carry-over."""
    words = text.split()
    if len(words) <= size:
        return [text.strip()]
    out, i = [], 0
    step = max(1, size - overlap)
    while i < len(words):
        out.append(" ".join(words[i:i + size]))
        i += step
    return out


# ── retriever: the "R" in RAG ───────────────────────────────────────

class Retriever:
    def __init__(self, embedder=None):
        self.embedder = embedder or HashingEmbedder()
        self.docs = []      # (doc_id, text, vector)

    def add(self, doc_id, text):
        for n, c in enumerate(chunk(text)):
            self.docs.append((f"{doc_id}#{n}" if "#" not in doc_id else doc_id,
                              c, self.embedder.embed(c)))

    def query(self, question, k=3):
        q = self.embedder.embed(question)
        scored = [(did, txt, cosine(q, v)) for did, txt, v in self.docs]
        scored.sort(key=lambda t: t[2], reverse=True)
        return scored[:k]


# ── prompt assembly: the part that quietly decides if RAG works ─────

def build_prompt(question, contexts, system="Answer ONLY from the context. "
                 "If the answer is not in the context, say you don't know."):
    blocks = "\n\n".join(f"[{i+1}] (source: {did})\n{txt}"
                         for i, (did, txt, _s) in enumerate(contexts))
    return (f"{system}\n\n=== CONTEXT ===\n{blocks}\n\n"
            f"=== QUESTION ===\n{question}\n\n=== ANSWER ===\n")


def prompt_token_estimate(prompt):
    """~4 chars/token, the rule of thumb for English (see tokenizer/)."""
    return max(1, len(prompt) // 4)


# ── the "model": an extractive, grounded stand-in ──────────────────

_SPLIT_SENT = re.compile(r"(?<=[.!?])\s+")


def _overlap(q_tokens, s_tokens):
    s_content = [t for t in s_tokens if t not in STOPWORDS]
    if not s_content:
        return 0.0
    qs = {t for t in q_tokens if t not in STOPWORDS}
    return sum(t in qs for t in s_content) / math.sqrt(len(s_content))


class GroundedResponder:
    """
    Stands in for the LLM. Returns the sentence from the retrieved
    context that best lexically matches the question, plus its source.
    Refuses ("I don't know...") when nothing matches well enough —
    the behaviour that separates RAG from a confident hallucination.
    """

    def __init__(self, min_score=0.6):
        self.min_score = min_score

    def answer(self, question, contexts):
        q_tok = tokenize(question)
        best = ("", 0.0, None)
        for did, txt, _s in contexts:
            for sent in _SPLIT_SENT.split(txt):
                sc = _overlap(q_tok, tokenize(sent))
                if sc > best[1]:
                    best = (sent.strip(), sc, did)
        if best[1] < self.min_score:
            return {"text": "I don't know from the provided context.",
                    "source": None, "score": round(best[1], 3), "grounded": False}
        return {"text": best[0], "source": best[2],
                "score": round(best[1], 3), "grounded": True}


def rag_answer(question, retriever, responder=None, k=3):
    responder = responder or GroundedResponder()
    ctx = retriever.query(question, k=k)
    prompt = build_prompt(question, ctx)
    out = responder.answer(question, ctx)
    out["prompt_tokens"] = prompt_token_estimate(prompt)
    out["retrieved"] = [did for did, _t, _s in ctx]
    return out


# ── tools + a scripted agent controller (ReAct-shaped) ─────────────

import ast
import operator as _op

_OPS = {ast.Add: _op.add, ast.Sub: _op.sub, ast.Mult: _op.mul,
        ast.Div: _op.truediv, ast.Pow: _op.pow, ast.USub: _op.neg,
        ast.Mod: _op.mod, ast.FloorDiv: _op.floordiv}


def calc(expr):
    """Safe arithmetic — parses to an AST and walks a numeric whitelist."""
    def ev(node):
        if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
            return node.value
        if isinstance(node, ast.BinOp) and type(node.op) in _OPS:
            return _OPS[type(node.op)](ev(node.left), ev(node.right))
        if isinstance(node, ast.UnaryOp) and type(node.op) in _OPS:
            return _OPS[type(node.op)](ev(node.operand))
        raise ValueError(f"unsupported expression: {ast.dump(node)}")
    return ev(ast.parse(expr.strip(), mode="eval").body)


class Agent:
    """
    A ReAct-style loop: Thought -> Action -> Observation, repeat, then
    Answer. The 'policy' picking actions is a hand-written controller
    standing in for the LLM's decisions — so the *loop* is real and
    inspectable even though the reasoning is scripted.

    Tools:
      lookup[query]  -> best retrieved sentence (uses the Retriever)
      calc[expr]     -> arithmetic
    """

    def __init__(self, retriever, max_steps=5):
        self.retriever = retriever
        self.responder = GroundedResponder(min_score=0.3)
        self.max_steps = max_steps
        self.trace = []

    def _log(self, kind, text):
        self.trace.append((kind, text))

    def run(self, task):
        self.trace = []
        facts = {}
        # 1. resolve every  lookup{...}  placeholder in the task
        for m in re.finditer(r"lookup\{([^}]+)\}", task):
            q = m.group(1).strip()
            self._log("Thought", f"I need a fact: {q!r}. Use lookup.")
            hits = self.retriever.query(q, k=3)
            ans = self.responder.answer(q, hits)
            # pull numbers that stand alone (not part of a word like "GPT-3")
            nums = re.findall(r"(?<![\w-])\d+(?:\.\d+)?", ans["text"])
            if "year" in q.lower():
                nums = [n for n in nums if len(n) == 4] or nums
            val = nums[0] if nums else ans["text"]
            facts[m.group(0)] = val
            self._log("Action", f"lookup[{q}]")
            self._log("Observation", f"{ans['text']}  (source: {ans['source']}) -> {val}")
        # 2. substitute facts back into the task
        resolved = task
        for placeholder, val in facts.items():
            resolved = resolved.replace(placeholder, str(val))
        # 3. if what's left is arithmetic, compute it
        expr = re.search(r"calc\{([^}]+)\}", resolved)
        if expr:
            e = expr.group(1)
            self._log("Thought", f"Now compute {e!r}. Use calc.")
            result = calc(e)
            self._log("Action", f"calc[{e}]")
            self._log("Observation", str(result))
            self._log("Answer", str(result))
            return {"answer": result, "trace": self.trace, "facts": facts}
        self._log("Answer", resolved)
        return {"answer": resolved, "trace": self.trace, "facts": facts}


if __name__ == "__main__":
    r = Retriever()
    r.add("doc", "The Transformer architecture was introduced in 2017. "
                 "BERT was released in 2018. GPT-3 arrived in 2020.")
    out = rag_answer("When was the Transformer introduced?", r)
    print(out)
    assert "2017" in out["text"] and out["grounded"]
    print("PASS: rag_answer retrieved and grounded")
