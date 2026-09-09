# Prompting, RAG & Agents — The Amateur's Guide

> The model is a brain in a jar. Prompting is how you talk to it, RAG
> is how you hand it notes, and an agent is what you get when you let
> it press buttons.

---

## 1. Prompting — you're writing a program in English

A prompt is an instruction *plus* everything the model needs to follow
it. Its **structure** does the heavy lifting, not clever wording.

Five templates for the same task (`step1_prompting.py`):

| template | what it adds | costs |
|----------|--------------|------:|
| **zero-shot** | just the task | cheapest |
| **role / system** | "you are a precise classifier, reply in one word" | +a little |
| **few-shot** | 2–3 worked examples the model copies the *format* of | +examples |
| **chain-of-thought** | "let's think step by step" → shows working | +reasoning tokens |
| **grounded / RAG** | the task *plus the reference text* to use | +context |

**The lesson the lab proves:** prompt structure controls output
structure. A `Q:/A:` few-shot block gets you a bare one-word answer; a
"step by step" scaffold gets you multi-line reasoning; a schema
(`reply as JSON`) gets you JSON. You're programming the shape of the
response.

**Analogy — a new intern.** "Handle this" gets you chaos. "Handle
this; here are two examples of good ones; reply in this exact format;
if unsure, ask" gets you something usable. Same intern, same brain —
different instructions.

**Watch out:**
- Every token in the prompt is billed and eats context window. Few-shot
  isn't free.
- Long prompts bury the instruction. Put the crucial ask at the start
  *or* the end, not the soft middle.
- Examples teach format *and* bias. Three positive examples → the model
  leans positive.

---

## 2. RAG — Retrieval-Augmented Generation

The model's training data is frozen and doesn't include *your* PDFs,
last night's Slack, or today's prices. RAG fixes that at question time:

```
question
   │  1. embed the question            (embeddings/)
   ▼
[ nearest-neighbour search ] ──► top-k chunks of YOUR documents
   │  2. paste those chunks into the prompt
   ▼
[ MODEL ] ──► answer  +  "(source: handbook.pdf, p.12)"
   │  3. if the chunks don't contain the answer → say "I don't know"
```

`step2_mini_rag.py` runs the whole pipeline over a 6-document
knowledge base and checks the three things that actually matter:

1. **Retrieval routes correctly** — the right document comes back on
   top. If retrieval misses, nothing downstream can save you. *Garbage
   in, confident garbage out.*
2. **Answers are grounded and cited** — every claim traces to a chunk.
3. **Out-of-scope questions are refused** — ask it about Titanic's box
   office and it says "I don't know from the provided context" instead
   of inventing a number.

**Analogy — an open-book exam.** The model is a smart student who
didn't study your chapter. RAG lets them bring the chapter in. They
still have to *read the right page* (retrieval) and *not make things
up* (grounding).

**The pieces you tune:**
- **Chunk size / overlap** — too big and retrieval is vague, too small
  and answers lose context. ~200–500 tokens with a little overlap is a
  common start. (`chunk()` here uses words for simplicity.)
- **k** — how many chunks to retrieve. More recall, more prompt cost,
  more room for irrelevant text to distract the model.
- **The embedder** — must be the *same model* for questions and
  documents. This lab uses feature hashing (no training); real systems
  use a trained sentence-embedding model.
- **The refusal threshold** — how weak a match triggers "I don't know".

---

## 3. Agents — a model in a loop with tools

A single prompt → single answer can't *do* things: check today's date,
run a calculation, call an API, read a file. An **agent** wraps the
model in a loop and gives it tools:

```
   ┌──────────────────────────────────────────┐
   │  Thought:  what do I need next?           │
   │  Action:   lookup[...]  or  calc[...]     │
   │  Observation:  <the tool's result>        │
   └───────────────┬──────────────────────────┘
                   │  repeat until done
                   ▼
             Answer: ...
```

This is the **ReAct** pattern (Reason + Act). `step3_agent_loop.py`
gives the agent two tools — `lookup` (retrieval over a knowledge base)
and `calc` (safe arithmetic) — and a task that needs both:

> "How many years passed between the Transformer and GPT-3?"

The agent looks up 2020, looks up 2017, then computes `2020 - 2017 = 3`
— and every Thought/Action/Observation is printed so you can see it
work. (The controller choosing the actions is scripted here; swap in a
real model and the loop is unchanged — that's all LangChain / the
Assistants API is.)

**Analogy — a detective.** Not a genius who blurts the answer, but
someone who checks records, does the arithmetic, follows one lead to
the next, and shows their working.

**Why agents are hard in practice:**
- **Compounding errors** — 90% right per step is 0.9¹⁰ ≈ 35% right
  after ten steps. Loops amplify mistakes.
- **Tool safety** — a tool that can run code, spend money, or send
  email needs guardrails. Note `calc` here parses an AST and refuses
  anything that isn't arithmetic — never `eval()`.
- **Knowing when to stop** — agents loop forever, re-search the same
  thing, or declare victory early. `max_steps` is a seatbelt.
- **Cost** — every step is a full model call. A 10-step agent is 10x
  the latency and price of one answer.

---

## 4. How they stack

```
prompting   →  talk to the model well
    +
RAG         →  give it the right facts at answer time
    +
tools/agent →  let it act on those facts, in a loop
    =
most "AI apps" you've used in the last year
```

ChatGPT with browsing, Claude with your files, Cursor editing code,
Perplexity citing sources, a customer-support bot that can issue a
refund — all of them are this module's three ideas wired together
around a frozen model.

---

## 5. Run it

```bash
cd rag
python step1_prompting.py     # five prompt templates, measured
python step2_mini_rag.py      # retrieve → prompt → grounded answer + citation
python step3_agent_loop.py    # ReAct loop: lookup + calc tools, full trace
```

Prereq idea: **`embeddings/`** (nearest-neighbour search is the "R" in
RAG). Next stop: **`finetuning/`** — when prompting and RAG aren't
enough and you need to change the model's *weights*.
