#!/usr/bin/env python3
"""AI-ML · Part 7 lab — start-up environment assertion (Ch 1).

Fails fast if the runtime differs from what the model was built/tested against —
the "worked in staging, broke in prod" class of bug. Checks Python version, CUDA
(if torch is present), and that a pinned MODEL_URI is set.

  python assert_env.py --dry-run   # CI: verify it parses + runs, exit 0
  python assert_env.py --serve     # would start the model server (stubbed here)
"""
from __future__ import annotations

import argparse
import os
import sys


def check(name: str, ok: bool, detail: str) -> bool:
    print(f"  [{'OK ' if ok else 'FAIL'}] {name}: {detail}")
    return ok


def assert_env(strict: bool) -> int:
    print("environment assertions:")
    ok = True

    want_py = os.environ.get("EXPECTED_PYTHON", "3.11")
    have_py = f"{sys.version_info.major}.{sys.version_info.minor}"
    ok &= check("python", have_py == want_py or not strict,
                f"have {have_py}, expected {want_py}")

    want_cuda = os.environ.get("EXPECTED_CUDA", "")
    try:
        import torch  # noqa: WPS433 - optional at runtime

        have_cuda = torch.version.cuda or ""
        ok &= check("cuda", (have_cuda == want_cuda) or (want_cuda == ""),
                    f"torch {torch.__version__}, cuda {have_cuda or 'n/a'}")
    except ImportError:
        check("cuda", True, "torch not installed (skipped)")

    model_uri = os.environ.get("MODEL_URI", "")
    ok &= check("model uri", "@sha256:" in model_uri or not strict,
                model_uri or "<unset>")

    return 0 if ok else 1


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--dry-run", action="store_true",
                   help="assert only, never strict-fail (for CI / image build RUN)")
    p.add_argument("--serve", action="store_true", help="assert then start serving")
    args = p.parse_args()

    rc = assert_env(strict=args.serve)
    if args.dry_run:
        print("dry-run: assertions completed")
        return 0
    if rc != 0:
        print("environment assertions failed — refusing to start", file=sys.stderr)
        return rc
    if args.serve:
        print("environment OK — would start: uvicorn src.serve:app --port 8080")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
