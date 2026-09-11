# AI-ML · Part 7 lab — IaC for an ML platform slice (Ch 13).
# `terraform init -backend=false && terraform validate` checks this in CI
# (validate contacts no cloud — it only needs the provider schema).
terraform {
  required_version = ">= 1.6"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.60"
    }
  }
  # Remote, locked state — never a laptop, never git (Ch 13 anti-patterns).
  backend "s3" {
    bucket         = "acme-tfstate"
    key            = "ai-ml/platform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "acme-tf-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.region
  default_tags {
    tags = {
      team       = var.team
      env        = var.env
      managed_by = "terraform"
      component  = "ai-ml-platform"
    }
  }
}
