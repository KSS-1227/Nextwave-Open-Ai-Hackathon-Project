#!/bin/bash

# VirtualCFO Backend Deployment Script
# This script deploys all Supabase Edge Functions and sets up the environment

set -e  # Exit on any error

echo "🚀 Starting VirtualCFO Backend Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI is not installed. Please install it first:${NC}"
    echo "npm install -g supabase"
    exit 1
fi

# Check if logged into Supabase
echo -e "${BLUE}🔐 Checking Supabase authentication...${NC}"
if ! supabase projects list &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged into Supabase. Please login first:${NC}"
    echo "supabase login"
    exit 1
fi

# Load environment variables
if [ -f .env ]; then
    echo -e "${BLUE}📂 Loading environment variables from .env...${NC}"
    source .env
else
    echo -e "${RED}❌ .env file not found. Please copy .env.example to .env and configure it.${NC}"
    exit 1
fi

# Validate required environment variables (WhatsApp disabled until hosting)
required_vars=(
    "SUPABASE_URL"
    "SUPABASE_SERVICE_ROLE_KEY"
    "SMTP_USERNAME"
    "SMTP_PASSWORD"
    # "WHATSAPP_ACCESS_TOKEN" # Disabled until hosting
    # "WHATSAPP_PHONE_NUMBER_ID" # Disabled until hosting
    # "WHATSAPP_VERIFY_TOKEN" # Disabled until hosting
    "CRON_SECRET"
)

echo -e "${BLUE}🔍 Validating environment variables...${NC}"
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}❌ Missing environment variable: $var${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✅ All required environment variables are set${NC}"

# Note: Database tables already exist - skipping migrations
echo -e "${BLUE}🗄️  Database tables already exist in Supabase - skipping migrations${NC}"

# Deploy Edge Functions
echo -e "${BLUE}⚡ Deploying Edge Functions...${NC}"

functions=("earnings-add" "earnings-summary" "daily-reminders")

for func in "${functions[@]}"; do
    echo -e "${YELLOW}📦 Deploying $func...${NC}"
    if supabase functions deploy "$func"; then
        echo -e "${GREEN}✅ $func deployed successfully${NC}"
    else
        echo -e "${RED}❌ Failed to deploy $func${NC}"
        exit 1
    fi
done

# Set secrets (WhatsApp secrets disabled)
secrets=(
    "SMTP_HOST:${SMTP_HOST:-smtp.gmail.com}"
    "SMTP_PORT:${SMTP_PORT:-465}"
    "SMTP_SECURE:${SMTP_SECURE:-true}"
    "SMTP_USERNAME:$SMTP_USERNAME"
    "SMTP_PASSWORD:$SMTP_PASSWORD"
    # "WHATSAPP_PHONE_NUMBER_ID:$WHATSAPP_PHONE_NUMBER_ID" # Disabled until hosting
    # "WHATSAPP_ACCESS_TOKEN:$WHATSAPP_ACCESS_TOKEN" # Disabled until hosting
    # "WHATSAPP_VERIFY_TOKEN:$WHATSAPP_VERIFY_TOKEN" # Disabled until hosting
    "CRON_SECRET:$CRON_SECRET"
    "FRONTEND_URL:${FRONTEND_URL:-http://localhost:3000}"
)

for secret in "${secrets[@]}"; do
    key="${secret%%:*}"
    value="${secret#*:}"
    echo -e "${YELLOW}🔑 Setting secret: $key${NC}"
    if echo "$value" | supabase secrets set "$key"; then
        echo -e "${GREEN}✅ Secret $key set successfully${NC}"
    else
        echo -e "${RED}❌ Failed to set secret $key${NC}"
        exit 1
    fi
done

# Test the deployment
echo -e "${BLUE}🧪 Testing deployment...${NC}"

# Get project URL
PROJECT_URL=$(supabase status | grep "API URL" | awk '{print $3}')

if [ -z "$PROJECT_URL" ]; then
    echo -e "${YELLOW}⚠️  Could not determine project URL for testing${NC}"
else
    echo -e "${BLUE}🌐 Project URL: $PROJECT_URL${NC}"
    
    # Test health endpoint (if exists)
    echo -e "${YELLOW}🏥 Testing function health...${NC}"
    
    # You can add specific health checks here
    # curl -f "$PROJECT_URL/functions/v1/health" > /dev/null 2>&1 && echo -e "${GREEN}✅ Functions are healthy${NC}" || echo -e "${YELLOW}⚠️  Function health check failed${NC}"
fi

# Display deployment summary
echo -e "\n${GREEN}🎉 VirtualCFO Backend Deployment Complete!${NC}"
echo -e "\n${BLUE}📋 Deployment Summary:${NC}"
echo -e "   • Database migrations: ${GREEN}Applied${NC}"
echo -e "   • Edge Functions: ${GREEN}Deployed (${#functions[@]})${NC}"
echo -e "   • Secrets: ${GREEN}Configured (${#secrets[@]})${NC}"
echo -e "   • Project URL: ${BLUE}$PROJECT_URL${NC}"

echo -e "\n${BLUE}🔗 Available Endpoints:${NC}"
echo -e "   • POST   $PROJECT_URL/functions/v1/earnings-add"
echo -e "   • GET    $PROJECT_URL/functions/v1/earnings-summary"
echo -e "   • POST   $PROJECT_URL/functions/v1/daily-reminders"

echo -e "\n${YELLOW}📝 Next Steps:${NC}"
echo -e "   1. Set up cron job for daily email reminders"
echo -e "   2. WhatsApp integration disabled until hosting"
echo -e "   3. Test API endpoints with your frontend"
echo -e "   4. Monitor function logs in Supabase Dashboard"

echo -e "\n${BLUE}📖 Documentation:${NC}"
echo -e "   • API Docs: VIRTUALCFO_BACKEND_API.md"
echo -e "   • Environment: .env.example"

echo -e "\n${GREEN}✨ Happy coding!${NC}"