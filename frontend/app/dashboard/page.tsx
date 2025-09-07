'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth';
import { apiClient, Document } from '@/lib/api';
import { 
  HiOutlineDocumentText, 
  HiOutlineCheckCircle, 
  HiOutlineExclamationTriangle,
  HiOutlineChatBubbleLeftRight,
  HiOutlineArrowRight 
} from 'react-icons/hi2';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import LoadingScreen from '@/components/ui/loading-screen';

interface DashboardStats {
  totalDocuments: number;
  processedDocuments: number;
  failedDocuments: number;
  recentQueries: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalDocuments: 0,
    processedDocuments: 0,
    failedDocuments: 0,
    recentQueries: 0,
  });
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const documents = await apiClient.getDocuments();
      setRecentDocuments(documents.slice(0, 5)); // Show 5 most recent
      
      const processedCount = documents.filter(d => d.processing_status === 'completed').length;
      const failedCount = documents.filter(d => d.processing_status === 'failed').length;
      
      setStats({
        totalDocuments: documents.length,
        processedDocuments: processedCount,
        failedDocuments: failedCount,
        recentQueries: 0, // TODO: Implement query history
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: Document['processing_status']) => {
    switch (status) {
      case 'completed':
        return <HiOutlineCheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <HiOutlineExclamationTriangle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-4 animate-fade-in-up">
          <div className="loading-shimmer h-12 w-12 rounded-full mx-auto"></div>
          <p className="text-muted-foreground text-slate-700 dark:text-slate-300">Loading your dashboard insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col space-y-3 animate-fade-in-up">
        <h1 className="text-4xl font-bold tracking-tight text-display bg-gradient-to-r from-primary via-trust to-primary bg-clip-text text-transparent">
          Welcome back, {user?.username}!
        </h1>
        <p className="text-muted-foreground text-lg text-slate-700 dark:text-slate-300 max-w-2xl">
          Here&apos;s an overview of your insurance document processing activity and system insights.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Documents</CardTitle>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30">
              <HiOutlineDocumentText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-display text-blue-600 dark:text-blue-400 mb-1">{stats.totalDocuments}</div>
            <p className="text-xs text-muted-foreground">
              Uploaded documents
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Processed</CardTitle>
            <div className="p-2 rounded-lg bg-success/10">
              <HiOutlineCheckCircle className="h-4 w-4 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-display text-success mb-1">{stats.processedDocuments}</div>
            <p className="text-xs text-muted-foreground">
              Ready for queries
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Failed</CardTitle>
            <div className="p-2 rounded-lg bg-warning/10">
              <HiOutlineExclamationTriangle className="h-4 w-4 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-display text-warning mb-1">{stats.failedDocuments}</div>
            <p className="text-xs text-muted-foreground">
              Processing failed
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Recent Queries</CardTitle>
            <div className="p-2 rounded-lg bg-trust/10">
              <HiOutlineChatBubbleLeftRight className="h-4 w-4 text-trust" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-display text-trust mb-1">{stats.recentQueries}</div>
            <p className="text-xs text-muted-foreground">
              Last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 rounded-lg professional-gradient">
                <HiOutlineArrowRight className="h-4 w-4 text-white" />
              </div>
              <span>Quick Actions</span>
            </CardTitle>
            <CardDescription>
              Get started with your insurance document processing workflow
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => router.push('/dashboard/documents')}
              className="w-full justify-between h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white"
            >
              Upload New Document
              <HiOutlineArrowRight className="h-5 w-5" />
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/dashboard/chat')}
              className="w-full justify-between h-12 text-base font-semibold border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/20"
            >
              Start Insurance Query
              <HiOutlineArrowRight className="h-5 w-5" />
            </Button>
          </CardContent>
        </Card>

        {/* Recent Documents */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                <HiOutlineDocumentText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span>Recent Documents</span>
            </CardTitle>
            <CardDescription>
              Your latest uploaded insurance documents and processing status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentDocuments.length > 0 ? (
              <div className="space-y-3">
                {recentDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center space-x-3">
                    {getStatusIcon(doc.processing_status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {doc.original_filename}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {doc.processing_status}
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/dashboard/documents')}
                  className="w-full mt-3"
                >
                  View All Documents
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <HiOutlineDocumentText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-3">
                  No documents uploaded yet
                </p>
                <Button 
                  size="sm"
                  onClick={() => router.push('/dashboard/documents')}
                >
                  Upload Your First Document
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
