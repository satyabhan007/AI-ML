variable "region" {
  type    = string
  default = "us-east-1"
}

variable "env" {
  type = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.env)
    error_message = "env must be one of dev, staging, prod."
  }
}

variable "team" {
  type    = string
  default = "ranking"
}

variable "model_bucket_name" {
  type = string
}

variable "force_destroy_buckets" {
  description = "Only true in dev — protects stateful data elsewhere (Ch 13)."
  type        = bool
  default     = false
}
