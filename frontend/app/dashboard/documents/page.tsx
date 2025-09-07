'use client';

import React, { useState } from 'react';
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { DocumentList } from '@/components/documents/DocumentList';
import { Document } from '@/lib/api';

export default function DocumentsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadComplete = (document: Document) => {
    // Trigger refresh of document list
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
        <p className="text-muted-foreground">
          Upload and manage your insurance documents for AI-powered analysis.
        </p>
      </div>

      <DocumentUpload onUploadComplete={handleUploadComplete} />
      <DocumentList refreshTrigger={refreshTrigger} />
    </div>
  );
}