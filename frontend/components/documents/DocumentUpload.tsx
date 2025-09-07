'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { apiClient, Document } from '@/lib/api';
import { toast } from 'sonner';
import {
  HiOutlineCloudArrowUp,
  HiOutlineDocument,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2';

interface DocumentUploadProps {
  onUploadComplete?: (document: Document) => void;
}

interface UploadStatus {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  document?: Document;
  error?: string;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUploadComplete }) => {
  const [uploads, setUploads] = useState<UploadStatus[]>([]);

  const uploadFile = useCallback(async (file: File, uploadIndex: number) => {
    try {
      const document = await apiClient.uploadDocument(file, (progress) => {
        setUploads(prev => prev.map((upload, idx) => 
          idx === uploadIndex ? { ...upload, progress } : upload
        ));
      });

      // Update status to completed
      setUploads(prev => prev.map((upload, idx) => 
        idx === uploadIndex 
          ? { ...upload, status: 'completed', document, progress: 100 }
          : upload
      ));

      toast.success(`${file.name} uploaded successfully!`);
      onUploadComplete?.(document);

    } catch (error: any) {
      console.error('Upload failed:', error);
      const errorMessage = error.response?.data?.detail || 'Upload failed';
      
      setUploads(prev => prev.map((upload, idx) => 
        idx === uploadIndex 
          ? { ...upload, status: 'error', error: errorMessage }
          : upload
      ));

      toast.error(`Failed to upload ${file.name}: ${errorMessage}`);
    }
  }, [onUploadComplete]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Filter for PDF files only
    const pdfFiles = acceptedFiles.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length !== acceptedFiles.length) {
      toast.error('Only PDF files are supported');
    }

    if (pdfFiles.length === 0) return;

    // Initialize upload status for each file
    const newUploads: UploadStatus[] = pdfFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const,
    }));

    setUploads(prev => [...prev, ...newUploads]);

    // Upload each file
    pdfFiles.forEach((file, index) => {
      uploadFile(file, uploads.length + index);
    });
  }, [uploads.length, uploadFile]);

  const clearUploads = () => {
    setUploads([]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: true,
  });

  const getStatusIcon = (status: UploadStatus['status']) => {
    switch (status) {
      case 'completed':
        return <HiOutlineCheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <HiOutlineExclamationTriangle className="h-5 w-5 text-red-500" />;
      case 'uploading':
      default:
        return <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Upload Insurance Documents</CardTitle>
          <CardDescription>
            Upload PDF files of your insurance policies for AI analysis. Supported document types include policies, terms & conditions, claim forms, and medical records.
          </CardDescription>
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold text-sm mb-2">📋 Supported Document Types:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>• Health Insurance Policy</div>
              <div>• Policy Certificate</div>
              <div>• Terms & Conditions</div>
              <div>• Claims History</div>
              <div>• Medical Records</div>
              <div>• Coverage Summary</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/10' 
                : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
              }
            `}
          >
            <input {...getInputProps()} />
            <HiOutlineCloudArrowUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-blue-600 dark:text-blue-400">
                Drop the PDF files here...
              </p>
            ) : (
              <>
                <p className="text-lg font-medium mb-2">
                  Drag & drop PDF files here, or click to select
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Support for PDF files up to 50MB each
                </p>
                <Button variant="outline">
                  Browse Files
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload Status */}
      {uploads.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upload Progress</CardTitle>
              <CardDescription>
                {uploads.filter(u => u.status === 'completed').length} of {uploads.length} files uploaded
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={clearUploads}>
              Clear All
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {uploads.map((upload, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center space-x-3">
                  <HiOutlineDocument className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {upload.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(upload.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  {getStatusIcon(upload.status)}
                </div>
                
                {upload.status === 'uploading' && (
                  <Progress value={upload.progress} className="h-2" />
                )}
                
                {upload.status === 'error' && upload.error && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {upload.error}
                  </p>
                )}
                
                {upload.status === 'completed' && upload.document && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Processing started - Document ID: {upload.document.id}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};