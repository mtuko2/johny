#!/bin/bash
set -e
# Ensure commands like pm2 and pnpm are found when run via Cron
export PATH=$PATH:/usr/local/bin:/usr/bin:/root/.local/share/pnpm

echo "🚀 Starting Automated Deployment..."

# 1. Pull latest code (Fail gracefully if not in a git repo)
echo "📦 Pulling latest code..."
PULL_OUTPUT=$(git pull origin main 2>&1 || echo "Using current code state")
echo "$PULL_OUTPUT"

# Exit early if nothing changed (crucial so the 5-minute cron doesn't drain server CPU)
if echo "$PULL_OUTPUT" | grep -q "Already up to date."; then
    echo "✨ Code is already up to date. Skipping build."
    exit 0
fi

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
