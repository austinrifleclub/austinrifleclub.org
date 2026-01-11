#!/bin/bash
# Austin Rifle Club - Cloudflare Resource Setup Script
#
# This script creates all required Cloudflare resources for the application.
# Run this once to set up your Cloudflare account.
#
# Prerequisites:
# 1. Install wrangler: npm install -g wrangler
# 2. Login to Cloudflare: wrangler login
#    OR set CLOUDFLARE_API_TOKEN environment variable
#
# Usage:
#   ./scripts/setup-cloudflare.sh [environment]
#
#   environment: staging (default) | production | local

set -e

ENV="${1:-staging}"
echo "🚀 Setting up Cloudflare resources for: $ENV"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if wrangler is available
if ! command -v wrangler &> /dev/null && ! npx wrangler --version &> /dev/null; then
    echo -e "${RED}Error: wrangler is not installed${NC}"
    echo "Install with: npm install -g wrangler"
    exit 1
fi

WRANGLER="npx wrangler"

# Function to create D1 database
create_d1() {
    local name=$1
    echo -e "${YELLOW}Creating D1 database: $name${NC}"

    result=$($WRANGLER d1 create "$name" 2>&1) || true

    if echo "$result" | grep -q "already exists"; then
        echo -e "${GREEN}✓ Database already exists${NC}"
        # Get existing database ID
        db_id=$($WRANGLER d1 list --json | jq -r ".[] | select(.name==\"$name\") | .uuid")
    else
        db_id=$(echo "$result" | grep -oP 'database_id = "\K[^"]+')
        echo -e "${GREEN}✓ Created database with ID: $db_id${NC}"
    fi

    echo "$db_id"
}

# Function to create KV namespace
create_kv() {
    local name=$1
    echo -e "${YELLOW}Creating KV namespace: $name${NC}"

    result=$($WRANGLER kv:namespace create "$name" 2>&1) || true

    if echo "$result" | grep -q "already exists"; then
        echo -e "${GREEN}✓ KV namespace already exists${NC}"
        kv_id=$($WRANGLER kv:namespace list --json | jq -r ".[] | select(.title | contains(\"$name\")) | .id")
    else
        kv_id=$(echo "$result" | grep -oP 'id = "\K[^"]+')
        echo -e "${GREEN}✓ Created KV namespace with ID: $kv_id${NC}"
    fi

    echo "$kv_id"
}

# Function to create R2 bucket
create_r2() {
    local name=$1
    echo -e "${YELLOW}Creating R2 bucket: $name${NC}"

    result=$($WRANGLER r2 bucket create "$name" 2>&1) || true

    if echo "$result" | grep -q "already exists"; then
        echo -e "${GREEN}✓ R2 bucket already exists${NC}"
    else
        echo -e "${GREEN}✓ Created R2 bucket${NC}"
    fi
}

echo "================================================"
echo "Creating resources for: $ENV"
echo "================================================"
echo ""

case $ENV in
    local)
        echo "For local development, resources are created automatically."
        echo "Just run: npm run dev"
        echo ""
        echo "To apply migrations locally:"
        echo "  npm run db:migrate"
        echo "  npm run db:seed"
        ;;

    staging)
        echo "Creating STAGING resources..."
        echo ""

        # Create D1 database
        D1_ID=$(create_d1 "austinrifleclub-db-staging")
        echo ""

        # Create KV namespace
        KV_ID=$(create_kv "austinrifleclub-kv-staging")
        echo ""

        # Create R2 bucket
        create_r2 "austinrifleclub-files-staging"
        echo ""

        echo "================================================"
        echo -e "${GREEN}Staging resources created!${NC}"
        echo "================================================"
        echo ""
        echo "Update wrangler.toml [env.staging] section with:"
        echo ""
        echo "[[env.staging.d1_databases]]"
        echo "database_id = \"$D1_ID\""
        echo ""
        echo "[[env.staging.kv_namespaces]]"
        echo "id = \"$KV_ID\""
        echo ""
        echo "Next steps:"
        echo "1. Update wrangler.toml with the IDs above"
        echo "2. Run migrations: npm run db:migrate:staging"
        echo "3. Seed database: npx wrangler d1 execute austinrifleclub-db-staging --remote --file=drizzle/seed.sql"
        echo "4. Set secrets: npm run secrets:staging"
        ;;

    production)
        echo "Creating PRODUCTION resources..."
        echo ""

        # Create D1 database
        D1_ID=$(create_d1 "austinrifleclub-db-prod")
        echo ""

        # Create KV namespace
        KV_ID=$(create_kv "austinrifleclub-kv-prod")
        echo ""

        # Create R2 bucket
        create_r2 "austinrifleclub-files-prod"
        echo ""

        echo "================================================"
        echo -e "${GREEN}Production resources created!${NC}"
        echo "================================================"
        echo ""
        echo "Update wrangler.toml [env.production] section with:"
        echo ""
        echo "[[env.production.d1_databases]]"
        echo "database_id = \"$D1_ID\""
        echo ""
        echo "[[env.production.kv_namespaces]]"
        echo "id = \"$KV_ID\""
        echo ""
        echo "Next steps:"
        echo "1. Update wrangler.toml with the IDs above"
        echo "2. Run migrations: npm run db:migrate:production"
        echo "3. Seed database: npx wrangler d1 execute austinrifleclub-db-prod --remote --file=drizzle/seed.sql"
        echo "4. Set secrets: npm run secrets:production"
        ;;

    *)
        echo -e "${RED}Unknown environment: $ENV${NC}"
        echo "Usage: $0 [staging|production|local]"
        exit 1
        ;;
esac

echo ""
echo "================================================"
echo "Setting Secrets"
echo "================================================"
echo ""
echo "Run these commands to set required secrets:"
echo ""
echo "# Required:"
echo "wrangler secret put BETTER_AUTH_SECRET --env $ENV"
echo ""
echo "# For payments:"
echo "wrangler secret put STRIPE_SECRET_KEY --env $ENV"
echo "wrangler secret put STRIPE_WEBHOOK_SECRET --env $ENV"
echo ""
echo "# For email:"
echo "wrangler secret put RESEND_API_KEY --env $ENV"
echo ""
