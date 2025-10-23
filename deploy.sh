#!/bin/bash
# Trigger Vercel deployment via deploy hook
# Usage: ./deploy.sh

HOOK_URL=$(cat .vercel-deploy-hook 2>/dev/null)

if [ -z "$HOOK_URL" ]; then
  echo "❌ Error: .vercel-deploy-hook file not found"
  exit 1
fi

echo "🚀 Triggering Vercel deployment..."
RESPONSE=$(curl -X POST "$HOOK_URL" 2>&1)

if [ $? -eq 0 ]; then
  echo "✅ Deployment triggered successfully!"
  echo "📋 Response: $RESPONSE"
  echo ""
  echo "🔗 Check status: https://vercel.com/alexeystolybkos-projects/jumper/deployments"
else
  echo "❌ Failed to trigger deployment"
  echo "Error: $RESPONSE"
  exit 1
fi
