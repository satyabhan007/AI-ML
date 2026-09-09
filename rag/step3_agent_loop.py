"""
rag/step3_agent_loop.py
=======================
An agent = a model in a loop with tools.

    Thought  -> what do I need?
    Action   -> call a tool  (lookup / calc)
    Observation -> the tool's result
    ... repeat ...
    Answer   -> final response

The loop and the tools here are real and fully traced. The policy
that *chooses* actions is a hand-written controller standing in for
the LLM's decisions — so you can watch the ReAct structure work
without a model in the way. Swap the controller for a real model and
this is LangChain / the OpenAI Assistants runtime in miniature.
"""
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from rag import Retriever, Agent, calc

# knowledge the agent can look things up in
r = Retriever()
r.add("history", "The Transformer architecture was introduced in the year 2017 "
                 "by the paper Attention Is All You Need. BERT followed in 2018. "
                 "GPT-3 was released in the year 2020. GPT-4 arrived in 2023.")
r.add("units", "One kilobyte is 1024 bytes. One megabyte is 1024 kilobytes.")

agent = Agent(r, max_steps=5)

# a task that needs BOTH tools: two lookups, then arithmetic on the results
task = ("How many years passed between the Transformer and GPT-3? "
        "calc{ lookup{year GPT-3 was released} - lookup{year the Transformer "
        "architecture was introduced} }")

print("Step 3 — a ReAct-style agent with lookup + calc tools\n")
print(f"TASK: {task}\n")
result = agent.run(task)

print("--- trace ---")
for kind, text in result["trace"]:
    print(f"  {kind:<12} {text}")

print(f"\nANSWER: {result['answer']}")

# checks
kinds = [k for k, _ in result["trace"]]
assert result["answer"] == 3, f"expected 3, got {result['answer']}"
assert kinds.count("Action") == 3, f"expected 2 lookups + 1 calc, got {kinds}"
assert calc("2 ** 10") == 1024      # tool sanity
try:
    calc("__import__('os').system('echo hacked')")
    raise SystemExit("calc must reject non-numeric expressions")
except ValueError:
    pass
print("\nPASS: agent chained lookup + lookup + calc to the right answer, "
      "and calc refuses anything that isn't arithmetic")
