# Part 7 · labs — runnable configs

> **Standard, not from-scratch.** These labs drive the *industry-standard* delivery
> tools with minimal config — Docker, an OCI registry, GitHub Actions, Argo CD,
> Argo Rollouts, Kubernetes, Terraform. Validated in CI (`.github/workflows/lab-tests.yml`, job `parts_6_9`).

| Lab | Contains | Validated with |
|---|---|---|
| [`image/`](image/) | a digest-pinned, multi-stage inference `Dockerfile` + a hashed `requirements.lock` + a startup env-assertion script | `hadolint` (locally); a CI compile of `assert_env.py` |
| [`ci/`](ci/) | a reusable `ml-ci.yml` GitHub Actions workflow — data checks, contract tests, an eval gate, a perf smoke, then build | `actionlint` |
| [`gitops/`](gitops/) | an Argo CD `Application` + a Kustomize base with a `staging` and `prod` overlay | `kustomize build`, `kubeconform` |
| [`rollout/`](rollout/) | an Argo Rollouts `Rollout` (canary steps) + an `AnalysisTemplate` gating on p99, error-rate, and a quality metric | `kubeconform` |
| [`k8s/`](k8s/) | an inference `Deployment` with GPU requests/limits + graceful termination, a `PodDisruptionBudget`, an `HPA` on queue depth, and a KEDA `ScaledObject` | `kubeconform` |
| [`iac/`](iac/) | a small Terraform module (model bucket + ECR registry + a scoped serving IAM role) with `staging`/`prod` tfvars | `terraform validate`, `terraform fmt -check` |
| [`rollback/`](rollback/) | a one-command `rollback.sh` (model alias / config / feature-flag) + a kill-switch flag config | `shellcheck`, `yamllint` |

Run `helm lint`/`kubeconform`/`terraform validate` etc. locally as shown in each
lab's header comment or `iac/README.md`.
