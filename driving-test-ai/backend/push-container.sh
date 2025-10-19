#!/bin/bash

# Configuration
PROJECT_ID="bgn-ie-hack25dub-707"
IMAGE_NAME="backend-test"
TAG="latest"
REGION="eu"  # Options: us, eu, asia, or gcr.io for global

# Full image path
GCR_IMAGE="${REGION}.gcr.io/${PROJECT_ID}/${IMAGE_NAME}:${TAG}"

echo "🔧 Configuring Docker to use gcloud credentials..."
gcloud auth configure-docker ${REGION}.gcr.io --quiet

echo "🏗️  Building Docker image..."
docker build --platform linux/amd64 -t ${IMAGE_NAME}:${TAG} .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed!"
    exit 1
fi

echo "🏷️  Tagging image for GCR..."
docker tag ${IMAGE_NAME}:${TAG} ${GCR_IMAGE}

echo "📤 Pushing to Google Container Registry..."
docker push ${GCR_IMAGE}

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed image to: ${GCR_IMAGE}"
    echo ""
    echo "You can now deploy using:"
    echo "  gcloud run deploy ${IMAGE_NAME} --image ${GCR_IMAGE} --region us-central1"
else
    echo "❌ Push failed!"
    exit 1
fi