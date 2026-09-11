#!/usr/bin/env bash
# AI-ML · Part 7 lab — one-command rollback (Ch 9).
# Recovery in seconds: repoint the model alias, git-revert the config, OR flip a
# flag. No rebuild, no retrain. Predefine the trigger (SLO burn / error spike).
#
#   ./rollback.sh model   ranker 42          # repoint @production -> v42
#   ./rollback.sh config  ranker-prod        # git revert the last deploy commit
#   ./rollback.sh flag    ai_summary_enabled # kill switch off
set -euo pipefail

MODE="${1:-}"
shift || true

log() { printf '[rollback] %s\n' "$*" >&2; }

rollback_model() {
  local model="${1:?model name}" version="${2:?target version}"
  log "repointing ${model}@production -> v${version}"
  # mlflow / registry CLI — atomic, no rebuild
  echo mlflow models set-alias --name "${model}" --alias production --version "${version}"
  echo "kubectl rollout status deploy/${model} --timeout=120s"
}

rollback_config() {
  local app="${1:?argocd app name}"
  log "reverting last deploy commit for ${app} (GitOps self-heal applies it)"
  echo "git revert --no-edit HEAD"
  echo "git push origin main"
  echo "argocd app wait ${app} --health --timeout 120"
}

rollback_flag() {
  local flag="${1:?flag key}"
  log "flipping kill switch ${flag} -> off (seconds, no deploy)"
  echo "curl -sf -XPATCH \"\$FLAGS_API/flags/${flag}\" -d '{\"enabled\":false}'"
}

case "${MODE}" in
  model) rollback_model "$@" ;;
  config) rollback_config "$@" ;;
  flag) rollback_flag "$@" ;;
  *)
    echo "usage: $0 {model <name> <version>|config <app>|flag <key>}" >&2
    exit 2
    ;;
esac

log "done — verify the SLI recovered on the dashboard, then file the incident"
