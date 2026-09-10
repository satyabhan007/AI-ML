# Part 7 · labs — runnable configs

> **Standard, not from-scratch.** These labs drive the *industry-standard* delivery
> tools with minimal config — Docker, an OCI registry, GitHub Actions, Argo CD,
> Argo Rollouts, Kubernetes, Terraform. Validated in CI (`.github/workflows/lab-tests.yml`).

Landing in **Phase 2** alongside chapters 2–16:

| Lab | Contains | Validated with |
|---|---|---|
| `image/` | a digest-pinned, multi-stage inference `Dockerfile` + hashed `requirements.lock` + a startup env-assertion script | `hadolint`, `docker build` (CI: `--dry-run` parse) |
| `ci/` | a reusable `ml-ci.yml` GitHub Actions workflow — data checks, schema/contract tests, an eval gate, a perf smoke | `actionlint` |
| `gitops/` | an Argo CD `Application` + a Kustomize overlay per environment | `kustomize build`, `yamllint` |
| `rollout/` | an Argo Rollouts `Rollout` with a canary strategy + `AnalysisTemplate` on p99 + error-rate | `kubeconform` |
| `k8s/` | an inference `Deployment` with GPU requests/limits, a `PodDisruptionBudget`, an `HPA` and a KEDA `ScaledObject` | `kubeconform`, `yamllint` |
| `iac/` | a small Terraform module (bucket + registry + endpoint) with a `staging` and `prod` workspace | `terraform validate`, `tflint` |
| `rollback/` | a one-command `rollback.sh` + a feature-flag kill-switch config | `shellcheck`, `yamllint` |

Until Phase 2 lands, this directory is intentionally a placeholder so links resolve.
