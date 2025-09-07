# Insurance RAG System

A complete Multi-Agent RAG (Retrieval-Augmented Generation) system for processing insurance document queries using natural language. Built with FastAPI backend and Next.js frontend.

## 🌟 Features

- **🤖 Multi-Agent AI System**: Specialized agents for query parsing, retrieval, evaluation, and response generation
- **📄 Document Processing**: Upload and process PDF insurance documents
- **🔍 Semantic Search**: Advanced vector search using Qdrant for document retrieval
- **💬 Natural Language Queries**: Ask questions in plain English about insurance policies
- **📊 Structured Responses**: Get detailed answers with coverage decisions, amounts, and justifications
- **🔐 Authentication**: Secure JWT-based user authentication
- **🎨 Modern UI**: Beautiful Next.js frontend with shadcn/ui components
- **🐳 Docker Ready**: Complete containerized deployment

## 🏗️ Architecture

### Backend (FastAPI)
- **Multi-Agent Pipeline**: Query Parser → Retrieval → Evaluation → Response Generator
- **Vector Database**: Qdrant for semantic document search
- **Database**: PostgreSQL for user data and metadata
- **Caching**: Redis for session management and performance

### Frontend (Next.js)
- **Framework**: Next.js 14 with App Router
- **UI Components**: shadcn/ui with Tailwind CSS
- **Authentication**: JWT token management
- **File Upload**: Drag & drop PDF upload with progress tracking
- **Chat Interface**: Insurance-specific query interface

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- OpenAI API key (optional, for enhanced features)

### One-Command Setup

```bash
# Run the simplified setup
./setup-simple.sh
```

This will start:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Qdrant**: http://localhost:6333

### Manual Setup

1. **Configure Environment**:
```bash
cp .env.docker .env
# Edit .env with your OpenAI API key (optional)
```

2. **Start Services**:
```bash
docker compose -f docker-compose-simple.yml up --build -d
```

3. **Check Status**:
```bash
docker compose -f docker-compose-simple.yml ps
```

## 📋 Usage

### Web Interface (Recommended)

1. **Visit** http://localhost:3000
2. **Register** a new account or login
3. **Upload** insurance policy documents (PDF format)
4. **Wait** for AI processing to complete
5. **Ask questions** like:
   - *"46-year-old male, knee surgery in Pune, 3-month-old insurance policy"*
   - *"Is cancer treatment covered under this policy?"*
   - *"What's the waiting period for pre-existing conditions?"*
6. **Review** structured responses with coverage decisions and justifications
