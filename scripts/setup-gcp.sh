#!/bin/bash
# GCP Setup Script for PartyScout Frontend
# Run this once to set up Cloud Storage hosting

set -e

# Configuration - UPDATE THESE VALUES
PROJECT_ID="${GCP_PROJECT_ID:-your-project-id}"
BUCKET_NAME="${GCS_BUCKET_NAME:-partyscout-frontend}"
REGION="us-central1"
SERVICE_ACCOUNT_NAME="partyscout-deployer"

echo "Setting up GCP for PartyScout Frontend..."
echo "Project: $PROJECT_ID"
echo "Bucket: $BUCKET_NAME"

# Set project
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "Enabling required APIs..."
gcloud services enable \
  storage.googleapis.com \
  compute.googleapis.com

# Create Cloud Storage bucket for static hosting
echo "Creating Cloud Storage bucket..."
gsutil mb -p $PROJECT_ID -l $REGION gs://$BUCKET_NAME 2>/dev/null || echo "Bucket already exists"

# Enable static website hosting
echo "Configuring static website hosting..."
gsutil web set -m index.html -e index.html gs://$BUCKET_NAME

# Make bucket publicly readable
echo "Setting public access..."
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME

# Enable CORS for API requests
echo "Configuring CORS..."
cat > /tmp/cors.json << EOF
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "OPTIONS"],
    "responseHeader": ["Content-Type", "Access-Control-Allow-Origin"],
    "maxAgeSeconds": 3600
  }
]
EOF
gsutil cors set /tmp/cors.json gs://$BUCKET_NAME
rm /tmp/cors.json

# Grant service account access (if already exists from backend setup)
SA_EMAIL="$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com"
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/storage.objectAdmin" --quiet 2>/dev/null || true

echo ""
echo "=========================================="
echo "Setup complete!"
echo "=========================================="
echo ""
echo "Add these GitHub repository secrets:"
echo "  - GCP_PROJECT_ID: $PROJECT_ID"
echo "  - GCS_BUCKET_NAME: $BUCKET_NAME"
echo "  - BACKEND_URL: https://partyscout-backend-xxxxx-uc.a.run.app (get from backend deployment)"
echo "  - GCP_SA_KEY: (same key from backend setup)"
echo ""
echo "Static site will be available at:"
echo "  https://storage.googleapis.com/$BUCKET_NAME/index.html"
echo ""
echo "For custom domain, set up Cloud Load Balancer with Cloud CDN"
