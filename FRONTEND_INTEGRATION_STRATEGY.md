# Frontend Integration Strategy: Insurance RAG System

## Overview
This document outlines the comprehensive strategy for integrating the Horizon AI Boilerplate with the Insurance RAG API system. The integration focuses on replacing Supabase authentication with JWT, customizing components for insurance-specific use cases, and creating a seamless user experience.

## Current Backend Analysis

### API Endpoints
- **Authentication**: `/api/v1/auth/token`, `/api/v1/auth/register`, `/api/v1/auth/me`
- **Documents**: `/api/v1/documents/upload`, `/api/v1/documents/`, `/api/v1/documents/{id}`
- **Chat**: `/api/v1/chat/query`, `/api/v1/chat/sessions`, `/api/v1/chat/sessions/{id}/messages`
- **Health**: `/api/v1/health`

### Response Structures
```typescript
// Authentication
interface Token {
  access_token: string;
  token_type: string;
}

interface UserResponse {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  created_at: string;
}

// Insurance Query Response
interface QueryResponse {
  decision: "approved" | "rejected" | "requires_more_info";
  amount?: number;
  justification: string;
  sources: SourceClause[];
  confidence_score: number;
  processing_time_ms: number;
}

interface MultiAgentResponse {
  final_response: QueryResponse;
  agent_steps: AgentStep[];
  total_processing_time_ms: number;
}
```

## 1. Authentication Architecture

### JWT Token Management Strategy

**Current Supabase Flow → New JWT Flow:**

```typescript
// lib/auth/jwt-auth.ts
interface AuthState {
  user: UserResponse | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

class JWTAuthService {
  private token: string | null = null;
  private user: UserResponse | null = null;
  
  constructor() {
    this.loadFromStorage();
  }
  
  async login(username: string, password: string): Promise<void> {
    const response = await fetch('/api/v1/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ username, password })
    });
    
    if (!response.ok) throw new Error('Authentication failed');
    
    const data: Token = await response.json();
    this.token = data.access_token;
    this.saveToStorage();
    await this.fetchUserInfo();
  }
  
  async register(email: string, username: string, password: string): Promise<void> {
    const response = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password })
    });
    
    if (!response.ok) throw new Error('Registration failed');
    
    // Auto-login after registration
    await this.login(username, password);
  }
  
  private saveToStorage(): void {
    if (this.token) {
      localStorage.setItem('auth_token', this.token);
      localStorage.setItem('user', JSON.stringify(this.user));
    }
  }
  
  private loadFromStorage(): void {
    this.token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('user');
    this.user = userStr ? JSON.parse(userStr) : null;
  }
  
  getAuthHeaders(): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }
}
```

**React Context Implementation:**
```typescript
// contexts/auth-context.tsx
const AuthContext = createContext<{
  auth: AuthState;
  login: (username: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
} | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false
  });
  
  const authService = useMemo(() => new JWTAuthService(), []);
  
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.token) {
          await authService.fetchUserInfo();
          setAuth({
            user: authService.user,
            token: authService.token,
            isLoading: false,
            isAuthenticated: true
          });
        }
      } catch (error) {
        authService.logout();
      } finally {
        setAuth(prev => ({ ...prev, isLoading: false }));
      }
    };
    
    initAuth();
  }, [authService]);
  
  return (
    <AuthContext.Provider value={{ auth, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

## 2. API Client Architecture

### Centralized API Client
```typescript
// lib/api/client.ts
class InsuranceAPIClient {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  private authService: JWTAuthService;
  
  constructor(authService: JWTAuthService) {
    this.authService = authService;
  }
  
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}/api/v1${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...this.authService.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };
    
    const response = await fetch(url, config);
    
    if (!response.ok) {
      if (response.status === 401) {
        this.authService.logout();
        throw new Error('Authentication required');
      }
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  // Authentication methods
  async login(username: string, password: string): Promise<Token> {
    return this.request('/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ username, password })
    });
  }
  
  // Document methods
  async uploadDocument(file: File, onProgress?: (progress: number) => void): Promise<DocumentUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress((event.loaded / event.total) * 100);
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      });
      
      xhr.addEventListener('error', () => reject(new Error('Upload failed')));
      
      xhr.open('POST', `${this.baseURL}/api/v1/documents/upload`);
      Object.entries(this.authService.getAuthHeaders()).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
      xhr.send(formData);
    });
  }
  
  async getDocuments(): Promise<DocumentResponse[]> {
    return this.request('/documents/');
  }
  
  // Chat methods
  async createChatSession(sessionName: string): Promise<ChatSessionResponse> {
    return this.request('/chat/sessions', {
      method: 'POST',
      body: JSON.stringify({ session_name: sessionName })
    });
  }
  
  async queryInsurance(query: string, sessionId?: number): Promise<MultiAgentResponse> {
    return this.request('/chat/query', {
      method: 'POST',
      body: JSON.stringify({
        query,
        session_id: sessionId,
        max_chunks: 10,
        include_metadata: true
      })
    });
  }
  
  async getChatMessages(sessionId: number): Promise<ChatMessageResponse[]> {
    return this.request(`/chat/sessions/${sessionId}/messages`);
  }
}
```

## 3. Component Customization Plan

### Key Components to Modify

#### 3.1 Authentication Components
**Files to Replace/Modify:**
- `components/auth/SignIn.tsx` → Replace Supabase auth with JWT
- `components/auth/SignUp.tsx` → Replace Supabase auth with JWT
- `hooks/useAuth.ts` → Replace with JWT auth hook

```typescript
// components/auth/SignIn.tsx (Modified)
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function SignIn() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(formData.username, formData.password);
    } catch (error) {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sign In to Insurance RAG</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData(prev => ({...prev, username: e.target.value}))}
          />
          <Input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

#### 3.2 Dashboard Components
**New Components to Create:**
- `components/dashboard/DocumentStats.tsx`
- `components/dashboard/RecentQueries.tsx`
- `components/dashboard/InsuranceMetrics.tsx`

```typescript
// components/dashboard/DocumentStats.tsx
interface DocumentStatsProps {
  documents: DocumentResponse[];
}

export function DocumentStats({ documents }: DocumentStatsProps) {
  const stats = {
    total: documents.length,
    processing: documents.filter(d => d.processing_status === 'processing').length,
    completed: documents.filter(d => d.processing_status === 'completed').length,
    failed: documents.filter(d => d.processing_status === 'failed').length,
  };
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-sm text-muted-foreground">Total Documents</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <p className="text-sm text-muted-foreground">Processed</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="text-2xl font-bold text-yellow-600">{stats.processing}</div>
          <p className="text-sm text-muted-foreground">Processing</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          <p className="text-sm text-muted-foreground">Failed</p>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### 3.3 Chat Interface Customization
**Files to Modify:**
- `components/chat/ChatInterface.tsx` → Customize for insurance responses
- `components/chat/MessageBubble.tsx` → Add insurance-specific formatting

```typescript
// components/chat/InsuranceMessageBubble.tsx
interface InsuranceMessageProps {
  message: ChatMessageResponse;
  response?: MultiAgentResponse;
}

export function InsuranceMessageBubble({ message, response }: InsuranceMessageProps) {
  if (message.message_type === 'user') {
    return (
      <div className="flex justify-end mb-4">
        <div className="bg-blue-500 text-white rounded-lg px-4 py-2 max-w-xs lg:max-w-md">
          {message.content}
        </div>
      </div>
    );
  }
  
  // Assistant message with insurance response
  return (
    <div className="flex justify-start mb-4">
      <div className="bg-gray-200 rounded-lg px-4 py-2 max-w-xs lg:max-w-md">
        {response && (
          <InsuranceResponseCard response={response.final_response} />
        )}
        <p className="text-sm text-gray-600 mt-2">{message.content}</p>
      </div>
    </div>
  );
}

// components/chat/InsuranceResponseCard.tsx
interface InsuranceResponseCardProps {
  response: QueryResponse;
}

export function InsuranceResponseCard({ response }: InsuranceResponseCardProps) {
  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'approved': return 'text-green-600 bg-green-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      case 'requires_more_info': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };
  
  return (
    <div className="space-y-3">
      {/* Decision Badge */}
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDecisionColor(response.decision)}`}>
        {response.decision.toUpperCase()}
      </div>
      
      {/* Amount (if approved) */}
      {response.amount && (
        <div className="text-lg font-semibold text-green-600">
          Claim Amount: ₹{response.amount.toLocaleString()}
        </div>
      )}
      
      {/* Confidence Score */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">Confidence:</span>
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: `${response.confidence_score * 100}%` }}
          />
        </div>
        <span className="text-sm font-medium">{Math.round(response.confidence_score * 100)}%</span>
      </div>
      
      {/* Sources */}
      {response.sources.length > 0 && (
        <div className="border-t pt-2">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Reference Clauses:</h4>
          <div className="space-y-2">
            {response.sources.map((source, index) => (
              <div key={index} className="text-xs bg-gray-100 p-2 rounded">
                <div className="font-medium">{source.document_name}</div>
                <div className="text-gray-600 mt-1">{source.clause_text}</div>
                {source.page_number && (
                  <div className="text-gray-500 text-xs mt-1">Page {source.page_number}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

## 4. File Upload Implementation

### Progress Tracking & UI Components
```typescript
// components/documents/DocumentUploader.tsx
import { useState, useRef } from 'react';
import { useAPI } from '@/hooks/useAPI';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';

interface UploadState {
  file: File | null;
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  message: string;
}

export function DocumentUploader({ onUploadComplete }: { onUploadComplete: () => void }) {
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    progress: 0,
    status: 'idle',
    message: ''
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { apiClient } = useAPI();
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadState({
        file,
        progress: 0,
        status: 'idle',
        message: `Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`
      });
    }
  };
  
  const handleUpload = async () => {
    if (!uploadState.file) return;
    
    setUploadState(prev => ({ ...prev, status: 'uploading', progress: 0 }));
    
    try {
      await apiClient.uploadDocument(
        uploadState.file,
        (progress) => {
          setUploadState(prev => ({ ...prev, progress }));
        }
      );
      
      setUploadState(prev => ({
        ...prev,
        status: 'success',
        message: 'Document uploaded and processing started!'
      }));
      
      onUploadComplete();
      
      // Reset after 3 seconds
      setTimeout(() => {
        setUploadState({
          file: null,
          progress: 0,
          status: 'idle',
          message: ''
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
      }, 3000);
      
    } catch (error) {
      setUploadState(prev => ({
        ...prev,
        status: 'error',
        message: error instanceof Error ? error.message : 'Upload failed'
      }));
    }
  };
  
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
      <div className="text-center">
        {uploadState.status === 'idle' && !uploadState.file && (
          <>
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <Button variant="outline" asChild>
                  <span>Choose PDF File</span>
                </Button>
                <input
                  id="file-upload"
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>
              <p className="mt-2 text-sm text-gray-500">
                Upload insurance policy documents (PDF format, max 10MB)
              </p>
            </div>
          </>
        )}
        
        {uploadState.file && uploadState.status === 'idle' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{uploadState.file.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setUploadState({ file: null, progress: 0, status: 'idle', message: '' });
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={handleUpload} className="w-full">
              Upload Document
            </Button>
          </div>
        )}
        
        {uploadState.status === 'uploading' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Upload className="h-5 w-5 text-blue-500 animate-pulse" />
              <span className="text-sm font-medium">Uploading...</span>
            </div>
            <Progress value={uploadState.progress} className="w-full" />
            <p className="text-sm text-gray-600">{Math.round(uploadState.progress)}% complete</p>
          </div>
        )}
        
        {uploadState.status === 'success' && (
          <div className="space-y-2">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <p className="text-sm font-medium text-green-600">{uploadState.message}</p>
          </div>
        )}
        
        {uploadState.status === 'error' && (
          <div className="space-y-2">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <p className="text-sm font-medium text-red-600">{uploadState.message}</p>
            <Button
              variant="outline"
              onClick={() => setUploadState({ file: null, progress: 0, status: 'idle', message: '' })}
            >
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
```

## 5. Routing Structure

### App Router Structure
```
app/
├── layout.tsx                 # Root layout with AuthProvider
├── page.tsx                  # Landing/marketing page
├── (auth)/
│   ├── login/
│   │   └── page.tsx         # Login page
│   └── register/
│       └── page.tsx         # Registration page
└── (dashboard)/
    ├── layout.tsx           # Dashboard layout with navigation
    ├── dashboard/
    │   └── page.tsx        # Main dashboard
    ├── documents/
    │   ├── page.tsx        # Document management
    │   └── [id]/
    │       └── page.tsx    # Document details
    ├── chat/
    │   ├── page.tsx        # Chat sessions list
    │   └── [sessionId]/
    │       └── page.tsx    # Individual chat session
    └── profile/
        └── page.tsx        # User profile settings
```

### Protected Route Middleware
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                    request.nextUrl.pathname.startsWith('/register');
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard') ||
                         request.nextUrl.pathname.startsWith('/documents') ||
                         request.nextUrl.pathname.startsWith('/chat');
  
  // Redirect to login if accessing dashboard without token
  if (isDashboardPage && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Redirect to dashboard if accessing auth pages with token
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

## 6. Environment Configuration

### Environment Variables
```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=Insurance RAG System
NEXT_PUBLIC_FILE_UPLOAD_MAX_SIZE=10485760
NEXT_PUBLIC_ALLOWED_FILE_TYPES=.pdf
```

## 7. Implementation Checklist

### Phase 1: Authentication Setup
- [ ] Remove Supabase dependencies
- [ ] Implement JWT authentication service
- [ ] Create auth context and hooks
- [ ] Update login/register components
- [ ] Add protected route middleware

### Phase 2: API Integration
- [ ] Create centralized API client
- [ ] Implement error handling and retries
- [ ] Add request/response interceptors
- [ ] Set up CORS handling

### Phase 3: Component Customization
- [ ] Modify existing chat components
- [ ] Create insurance-specific response components
- [ ] Build document management interface
- [ ] Implement file upload with progress

### Phase 4: UI/UX Enhancement
- [ ] Create dashboard overview
- [ ] Add document statistics
- [ ] Implement query history
- [ ] Add loading states and error boundaries

### Phase 5: Testing & Optimization
- [ ] Add unit tests for auth service
- [ ] Test file upload edge cases
- [ ] Performance optimization
- [ ] Mobile responsiveness

## 8. Key Files to Create/Modify

### New Files:
- `/lib/auth/jwt-auth.ts`
- `/contexts/auth-context.tsx`
- `/lib/api/client.ts`
- `/hooks/useAPI.ts`
- `/components/auth/SignIn.tsx` (replace)
- `/components/auth/SignUp.tsx` (replace)
- `/components/dashboard/DocumentStats.tsx`
- `/components/documents/DocumentUploader.tsx`
- `/components/chat/InsuranceMessageBubble.tsx`
- `/components/chat/InsuranceResponseCard.tsx`
- `/middleware.ts`

### Files to Modify:
- `/app/layout.tsx` (add AuthProvider)
- `/components/chat/ChatInterface.tsx`
- `/hooks/useAuth.ts` (replace with JWT)
- `/package.json` (remove Supabase, add dependencies)

This comprehensive strategy provides a clear roadmap for integrating the Horizon AI Boilerplate with your Insurance RAG API system, focusing on practical implementation steps that leverage the template's strengths while customizing it for insurance-specific use cases.