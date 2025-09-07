#!/bin/bash

# Simplified setup script for Insurance RAG API with direct Qdrant integration

echo "🚀 Setting up Insurance RAG API (Simplified Version)..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cat > .env << 'EOL'
# API Configuration
DEBUG=true
SECRET_KEY=your-insurance-api-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database
DATABASE_URL=sqlite:///./insurance_rag.db

# Vector Database (Direct Qdrant)
QDRANT_URL=http://qdrant:6333
QDRANT_API_KEY=

# OpenAI (Required for embeddings - add your key)
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4

# File Upload
MAX_FILE_SIZE=52428800
UPLOAD_DIR=uploads
EOL
    echo "⚠️  Please edit .env file with your OpenAI API key"
    echo "   Required: OPENAI_API_KEY"
    echo ""
    read -p "Press Enter to continue after editing .env file..."
fi

# Create uploads directory
mkdir -p uploads

# Build and start services using simplified compose
echo "🏗️  Building and starting services..."
docker compose -f docker-compose-simple.yml up --build -d

echo "⏳ Waiting for services to be ready..."

# Wait for services
timeout=120
elapsed=0
healthy=false
while [ $elapsed -lt $timeout ]; do
    raw=$(curl -s http://localhost:8000/api/v1/health/ || true)
    if [ -n "$raw" ]; then
        # Try jq if present, else naive grep
        if command -v jq >/dev/null 2>&1; then
            status_val=$(echo "$raw" | jq -r '.status // empty')
        else
            status_val=$(echo "$raw" | grep -o '"status":"[a-zA-Z]*"' | head -1 | cut -d '"' -f4)
        fi
        if [ "$status_val" = "healthy" ]; then
            healthy=true
            echo "✅ API healthy!"
            break
        fi
        echo "   API reachable but not healthy yet (status=$status_val) ($elapsed/$timeout)"
    else
        echo "   Waiting... ($elapsed/$timeout seconds)"
    fi
    sleep 5
    elapsed=$((elapsed + 5))
done

if [ "$healthy" != true ]; then
    echo "⚠️ API not healthy after $timeout seconds. See logs: docker compose -f docker-compose-simple.yml logs insurance-rag-api"
fi

# Check service status
echo ""
echo "📊 Service Status:"
docker compose -f docker-compose-simple.yml ps

echo ""
echo "✅ Setup complete!"
echo ""
echo "🌐 Available endpoints:"
echo "   • 🖥️  Frontend Application: http://localhost:3001"
echo "   • 🔧 Insurance RAG API: http://localhost:8000"
echo "   • 📚 API Documentation: http://localhost:8000/docs"
echo "   • 🔍 Qdrant Vector DB: http://localhost:6333"
echo ""
echo "📚 Next steps:"
echo "   1. 🚀 Visit http://localhost:3000 to use the web interface"
echo "   2. 📝 Create a user account via the registration form"
echo "   3. 📄 Upload insurance policy documents (PDF format)"
echo "   4. 🤖 Ask questions like: '46-year-old male, knee surgery in Pune, 3-month-old insurance policy'"
echo "   5. 📊 View structured responses with coverage decisions and justifications"
echo ""
echo "🛑 To stop: docker compose -f docker-compose-simple.yml down"
echo "🔄 To restart: docker compose -f docker-compose-simple.yml up -d"
echo ""
echo "📝 Note: Simplified mode runs ONLY Qdrant + API + Frontend (SQLite)."
echo "    Enable Postgres/Redis by running with profile: docker compose --profile full -f docker-compose-simple.yml up -d"
echo "    For production: consider managed Postgres, persistent Qdrant, robust embedding pipeline, auth hardening." 