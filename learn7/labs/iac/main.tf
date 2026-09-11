# bucket (model + data artifacts) + container registry + a scoped serving role.

resource "aws_s3_bucket" "models" {
  bucket        = var.model_bucket_name
  force_destroy = var.force_destroy_buckets
}

resource "aws_s3_bucket_versioning" "models" {
  bucket = aws_s3_bucket.models.id
  versioning_configuration {
    status = "Enabled" # keep old model artifacts retrievable (Ch 2)
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "models" {
  bucket = aws_s3_bucket.models.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "models" {
  bucket                  = aws_s3_bucket.models.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_ecr_repository" "serving" {
  name                 = "ai-ml/${var.team}-serving"
  image_tag_mutability = "IMMUTABLE" # digest-pinned images (Ch 1)
  image_scanning_configuration {
    scan_on_push = true
  }
}

data "aws_iam_policy_document" "serving_read" {
  statement {
    actions   = ["s3:GetObject", "s3:ListBucket"]
    resources = [aws_s3_bucket.models.arn, "${aws_s3_bucket.models.arn}/*"]
  }
}

resource "aws_iam_role" "serving" {
  name = "ai-ml-${var.team}-serving-${var.env}"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "pods.eks.amazonaws.com" }
      Action    = ["sts:AssumeRole", "sts:TagSession"]
    }]
  })
}

resource "aws_iam_role_policy" "serving_read" {
  name   = "model-bucket-read"
  role   = aws_iam_role.serving.id
  policy = data.aws_iam_policy_document.serving_read.json
}
