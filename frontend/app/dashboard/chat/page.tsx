'use client';

import React, { useEffect, useState } from 'react';
import { InsuranceChat } from '@/components/chat/InsuranceChat';
import { apiClient, Document } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  HiOutlineDocumentText, 
  HiOutlineArrowRight,
  HiOutlineChatBubbleLeftRight
} from 'react-icons/hi2';

export default function ChatPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const docs = await apiClient.getDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const processedDocs = documents.filter(doc => doc.processing_status === 'completed');

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Insurance AI Chat</h1>
        <p className="text-muted-foreground">
          Ask questions about your insurance coverage and get intelligent answers.
        </p>
      </div>

      {processedDocs.length === 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {/* No documents message */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <HiOutlineDocumentText className="h-5 w-5" />
                <span>No Processed Documents</span>
              </CardTitle>
              <CardDescription>
                You need to upload and process insurance documents before you can start asking questions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-6">
                <HiOutlineDocumentText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Upload Insurance Documents</p>
                <p className="text-muted-foreground mb-4">
                  Get started by uploading your insurance policy PDFs.
                </p>
                <Button onClick={() => router.push('/dashboard/documents')}>
                  Upload Documents
                  <HiOutlineArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Example queries */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <HiOutlineChatBubbleLeftRight className="h-5 w-5" />
                <span>Example Queries</span>
              </CardTitle>
              <CardDescription>
                Once your documents are processed, you can ask questions like these:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">&quot;46-year-old male, knee surgery in Pune, 3-month-old insurance policy&quot;</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">&quot;What is covered for dental treatment?&quot;</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">&quot;What are the claim procedures for hospitalization?&quot;</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">&quot;Is maternity covered under this policy?&quot;</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">&quot;What is the sum insured for critical illness?&quot;</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-6">
          {/* Document status info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <HiOutlineDocumentText className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-medium">
                      {processedDocs.length} Document{processedDocs.length > 1 ? 's' : ''} Ready
                    </p>
                    <p className="text-sm text-muted-foreground">
                      AI can analyze your insurance coverage
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => router.push('/dashboard/documents')}
                >
                  Manage Documents
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Chat interface */}
          <InsuranceChat availableDocuments={documents} />
        </div>
      )}
    </div>
  );
}