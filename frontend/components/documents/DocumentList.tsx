'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiClient, Document } from '@/lib/api';
import { toast } from 'sonner';
import {
  HiOutlineDocument,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineClock,
  HiOutlineEye,
  HiOutlineTrash,
} from 'react-icons/hi2';

interface DocumentListProps {
  refreshTrigger?: number;
}

export const DocumentList: React.FC<DocumentListProps> = ({ refreshTrigger }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, [refreshTrigger]);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const docs = await apiClient.getDocuments();
      // Sort by created date, newest first
      docs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: Document['processing_status']) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            <HiOutlineCheckCircle className="h-3 w-3 mr-1" />
            Processed
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
            <HiOutlineClock className="h-3 w-3 mr-1" />
            Processing
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            <HiOutlineExclamationTriangle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge variant="secondary">
            <HiOutlineClock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Documents</CardTitle>
          <CardDescription>Loading your uploaded insurance documents...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  if (documents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Documents</CardTitle>
          <CardDescription>You haven&apos;t uploaded any documents yet</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <HiOutlineDocument className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">No documents found</p>
          <p className="text-muted-foreground mb-4">
            Upload your first insurance document to get started with AI-powered queries.
          </p>
          <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Upload Document
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Documents ({documents.length})</CardTitle>
        <CardDescription>
          Manage your uploaded insurance documents and their processing status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {documents.map((document) => (
            <div
              key={document.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className="flex-shrink-0">
                  <HiOutlineDocument className="h-8 w-8 text-red-500" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium truncate">{document.original_filename}</h3>
                    {getStatusBadge(document.processing_status)}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>{document.file_size ? formatFileSize(document.file_size) : 'Unknown size'}</span>
                    <span>•</span>
                    <span>Uploaded {formatDate(document.created_at)}</span>
                    <span>•</span>
                    <span className="truncate">ID: {document.id}</span>
                  </div>
                  
                  {document.processing_status === 'failed' && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      Processing failed. Please try uploading again.
                    </p>
                  )}
                  
                  {document.processing_status === 'processing' && (
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                      Document is being processed for AI queries...
                    </p>
                  )}
                  
                  {document.processing_status === 'completed' && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      Ready for insurance queries
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={document.processing_status !== 'completed'}
                  title={
                    document.processing_status === 'completed' 
                      ? 'View document details' 
                      : 'Document must be processed first'
                  }
                >
                  <HiOutlineEye className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                  title="Delete document"
                >
                  <HiOutlineTrash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex justify-between items-center text-sm text-muted-foreground">
          <span>
            {documents.filter(d => d.processing_status === 'completed').length} processed • {' '}
            {documents.filter(d => d.processing_status === 'processing').length} processing • {' '}
            {documents.filter(d => d.processing_status === 'failed').length} failed
          </span>
          <Button variant="outline" size="sm" onClick={fetchDocuments}>
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};