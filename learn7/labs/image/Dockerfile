# AI-ML · Part 7 lab — reproducible, multi-stage inference image (Ch 1).
# Digest-pinned base, hashed lockfile, non-root, model pulled at runtime by version.
# CI: hadolint.  (`docker build` needs a real base digest + wheels — see README.)

# ---- build stage: install deps into a venv ----
# Replace the digest with the current one:  docker buildx imagetools inspect python:3.11-slim
FROM python:3.11-slim@sha256:0000000000000000000000000000000000000000000000000000000000000000 AS build

ENV PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app
COPY requirements.lock .
RUN python -m venv /venv \
    && /venv/bin/pip install --require-hashes --no-deps -r requirements.lock

# ---- runtime stage: slim, non-root, no build tools ----
FROM python:3.11-slim@sha256:0000000000000000000000000000000000000000000000000000000000000000 AS runtime

ENV PATH="/venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    MODEL_URI="s3://models/ranker@sha256:1111111111111111111111111111111111111111111111111111111111111111" \
    EXPECTED_PYTHON="3.11" \
    EXPECTED_CUDA=""

COPY --from=build /venv /venv
WORKDIR /app
COPY assert_env.py ./
COPY src/ ./src/

# start-up assertion fails fast on environment drift (Ch 1 / staging-vs-prod bugs)
RUN python assert_env.py --dry-run

USER 65532:65532
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=3s --start-period=120s --retries=5 \
    CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8080/health').status==200 else 1)"
ENTRYPOINT ["python", "assert_env.py", "--serve"]
