#!/bin/bash
# Run this ONCE before terraform init to create the GCS bucket for Terraform state.

set -e

PROJECT_ID="${GCP_PROJECT_ID:-bionic-upgrade-485121-h5}"
BUCKET="partyscout-terraform-state"
REGION="us-central1"

export PATH="$PATH:$HOME/google-cloud-sdk/bin"

echo "Creating Terraform state bucket: gs://$BUCKET"
gsutil mb -p $PROJECT_ID -l $REGION gs://$BUCKET 2>/dev/null || echo "Bucket already exists."

# Enable versioning so state history is preserved
gsutil versioning set on gs://$BUCKET

echo "Done. You can now run: terraform init"
