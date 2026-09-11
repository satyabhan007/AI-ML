output "model_bucket" {
  value = aws_s3_bucket.models.bucket
}

output "serving_registry_url" {
  value = aws_ecr_repository.serving.repository_url
}

output "serving_role_arn" {
  value = aws_iam_role.serving.arn
}
