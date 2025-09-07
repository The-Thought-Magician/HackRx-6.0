# Insurance RAG Frontend Setup Instructions

## Quick Start

1. **Prerequisites**
   - Node.js 18+ installed
   - npm or yarn package manager
   - FastAPI backend running at `http://localhost:8000`

2. **Environment Setup**
   ```bash
   cd /home/chiranjeet/dev/HackRx-6.0/frontend
   cp .env.local.example .env.local
   ```
   
   Update `.env.local`:
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access Application**
   - Frontend: http://localhost:3000
   - Auto-redirect to authentication page

## Project Features

### Complete Authentication System
- JWT-based login and registration
- Protected routes with middleware
- User profile management
- Secure token handling

### Document Management
- Drag & drop PDF upload
- Real-time upload progress
- Processing status tracking
- Document list management

### Insurance AI Chat
- Natural language queries
- Structured AI responses with:
  - Coverage decisions (approved/denied)
  - Monetary amounts (formatted currency)
  - Detailed justifications
  - Source policy clauses
- Document-specific queries
- Chat history

### Modern UI/UX
- Built with Next.js 14+ App Router
- shadcn/ui component library
- Responsive design (mobile-first)
- Dark/light mode support
- Loading states and error handling

## Application Flow

1. **Authentication**: Login or register at `/auth`
2. **Dashboard**: Overview at `/dashboard` 
3. **Upload Documents**: PDF upload at `/dashboard/documents`
4. **Process Documents**: Wait for AI processing to complete
5. **Chat Interface**: Ask questions at `/dashboard/chat`
6. **Profile Management**: User settings at `/dashboard/profile`

## Expected Query Examples

Once documents are processed, try these insurance queries:

- "46-year-old male, knee surgery in Pune, 3-month-old insurance policy"
- "What is covered for dental treatment?"
- "What are the claim procedures for hospitalization?"
- "Is maternity covered under this policy?"
- "What is the sum insured for critical illness?"

## Backend Integration

The frontend integrates with these FastAPI endpoints:

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/token` - Login authentication  
- `GET /api/v1/auth/me` - Current user details
- `POST /api/v1/documents/upload` - Document upload
- `GET /api/v1/documents/` - Document listing
- `POST /api/v1/chat/query` - Insurance queries
- `GET /api/v1/health/` - Health check

## Production Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Troubleshooting

**API Connection Issues:**
- Ensure backend running on port 8000
- Check CORS configuration
- Verify environment variables

**Authentication Problems:**
- Clear browser localStorage
- Check JWT token validity
- Restart both frontend/backend

**Upload Issues:**
- Use PDF files only (max 50MB)
- Check backend upload limits
- Verify file permissions

This frontend provides a complete insurance document processing interface with modern React patterns and excellent user experience.