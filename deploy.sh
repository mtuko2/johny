#!/bin/bash
set -e

echo "🚀 Starting Automated Deployment..."

# 1. Pull latest code (Fail gracefully if not in a git repo)
echo "📦 Pulling latest code..."
git pull origin main || echo "Using current code state"

# 2. Update and Restart Backend
echo "⚙️  Updating Backend..."
cd backend
pnpm install
pnpm db:generate
pnpm db:push
pnpm build
pm2 reload quantum-backend || pm2 start dist/index.js --name quantum-backend
cd ..

# 3. Update Frontend
echo "🎨 Updating Frontend..."
cd frontend
pnpm install
pnpm build
cd ..

echo "✅ Automation Complete! Your site is live."
