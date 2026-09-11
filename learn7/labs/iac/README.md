# iac — Terraform for an ML platform slice (Part 7 Ch 13)

```
terraform init -backend=false
terraform validate
terraform plan  -var-file=envs/staging.tfvars   # needs AWS creds
terraform apply -var-file=envs/prod.tfvars      # from CI, never a laptop
```

`validate` (run in CI) checks HCL + provider schema and contacts no cloud.
