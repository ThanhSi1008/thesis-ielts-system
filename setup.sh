#!/bin/bash
# TOEIC Master AI - Quick Setup Script
# This script automates the setup process identified in the health check

set -e  # Exit on error

echo "🚀 TOEIC Master AI - Infrastructure Setup"
echo "=========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Create .env files
echo "📝 Step 1/6: Creating environment files..."
if [ ! -f backend-core/.env ]; then
    cp backend-core/.env.example backend-core/.env
    echo -e "${GREEN}✓${NC} Created backend-core/.env"
else
    echo -e "${YELLOW}!${NC} backend-core/.env already exists, skipping"
fi

if [ ! -f backend-ai/.env ]; then
    cp backend-ai/.env.example backend-ai/.env
    echo -e "${GREEN}✓${NC} Created backend-ai/.env"
else
    echo -e "${YELLOW}!${NC} backend-ai/.env already exists, skipping"
fi

# Step 2: Check for port conflict and offer fix
echo ""
echo "🔍 Step 2/6: Checking for port conflicts..."
if lsof -iTCP:5432 -sTCP:LISTEN > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠${NC} Port 5432 is already in use"
    echo "Would you like to configure PostgreSQL to use port 5433 instead? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        # Update docker-compose.yml
        sed -i.bak 's/"5432:5432"/"5433:5432"/' docker-compose.yml
        # Update backend-core/.env
        sed -i.bak 's/@localhost:5432/@localhost:5433/' backend-core/.env
        # Update backend-ai/.env
        sed -i.bak 's/@localhost:5432/@localhost:5433/' backend-ai/.env
        echo -e "${GREEN}✓${NC} Updated configurations to use port 5433"
    else
        echo -e "${YELLOW}!${NC} Skipping port configuration. You may need to stop the conflicting service."
    fi
else
    echo -e "${GREEN}✓${NC} Port 5432 is available"
fi

# Step 3: Install Backend Core dependencies
echo ""
echo "📦 Step 3/6: Installing Backend Core dependencies..."
cd backend-core
if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✓${NC} Installed Node.js dependencies"
    npx prisma generate
    echo -e "${GREEN}✓${NC} Generated Prisma client"
else
    echo -e "${YELLOW}!${NC} node_modules exists, running npm install to verify..."
    npm install
    npx prisma generate
fi
cd ..

# Step 4: Setup Backend AI Python environment
echo ""
echo "🐍 Step 4/6: Setting up Backend AI Python environment..."
cd backend-ai
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✓${NC} Created Python virtual environment"
fi

# Activate virtual environment
source venv/bin/activate
pip install --upgrade pip > /dev/null 2>&1
pip install -r requirements.txt
echo -e "${GREEN}✓${NC} Installed Python dependencies"
deactivate
cd ..

# Step 5: Start infrastructure services
echo ""
echo "🐳 Step 5/6: Starting Docker infrastructure services..."
docker-compose up -d postgres redis rabbitmq minio
echo "Waiting for services to be healthy (30 seconds)..."
sleep 30

# Check health
echo -e "${GREEN}✓${NC} Infrastructure services started"
docker-compose ps

# Step 6: Run database migrations
echo ""
echo "🗄️  Step 6/6: Running database migrations..."
cd backend-core
npx prisma migrate dev --name init || echo -e "${YELLOW}!${NC} Migrations may already be applied"
cd ..

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Start Backend Core:    cd backend-core && npm run start:dev"
echo "2. Start Backend AI:      cd backend-ai && source venv/bin/activate && python -m uvicorn app.main:app --reload"
echo "3. Start Frontend Web:    cd frontend-web && npm install && npm run dev"
echo ""
echo "Access points:"
echo "  - Backend Core:     http://localhost:3000/api/v1"
echo "  - Backend AI:       http://localhost:8000"
echo "  - Frontend Web:     http://localhost:3001"
echo "  - RabbitMQ Mgmt:    http://localhost:15672 (toeic/toeic_password)"
echo "  - MinIO Console:    http://localhost:9001 (minioadmin/minioadmin)"
echo ""
