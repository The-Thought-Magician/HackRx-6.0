#!/bin/bash

# Setup script for local Trieve + Insurance RAG API

echo "🚀 Setting up Insurance RAG API with local Trieve..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cp .env.docker .env
    echo "⚠️  Please edit .env file with your OpenAI API key and other configuration"
    echo "   Required: OPENAI_API_KEY"
    echo ""
    read -p "Press Enter to continue after editing .env file..."
fi

# Create uploads directory
mkdir -p uploads

# Build and start all services
echo "🏗️  Building and starting services..."
docker compose up --build -d

echo "⏳ Waiting for services to be healthy..."

# Wait for services to be ready
timeout=300
elapsed=0
while [ $elapsed -lt $timeout ]; do
    if docker compose ps | grep -q "Up (healthy)"; then
        break
    fi
    echo "   Waiting... ($elapsed/$timeout seconds)"
    sleep 10
    elapsed=$((elapsed + 10))
done

# Check service status
echo ""
echo "📊 Service Status:"
docker compose ps

echo ""
echo "✅ Setup complete!"
echo ""
echo "🌐 Available endpoints:"
echo "   • Insurance RAG API: http://localhost:8000"
echo "   • API Documentation: http://localhost:8000/docs"
echo "   • Trieve Server: http://localhost:8090"
echo "   • Qdrant: http://localhost:6333"
echo "   • MinIO Console: http://localhost:9001"
echo ""
echo "📚 Next steps:"
echo "   1. Visit http://localhost:8000/docs to explore the API"
echo "   2. Register a user account"
echo "   3. Upload insurance documents"
echo "   4. Start querying!"
echo ""
echo "🛑 To stop: docker compose down"
echo "🔄 To restart: docker compose up -d"