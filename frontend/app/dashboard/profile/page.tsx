'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  HiOutlineUser,
  HiOutlineEnvelope,
  HiOutlineCalendar,
  HiOutlineArrowRightOnRectangle,
  HiOutlineCog6Tooth,
} from 'react-icons/hi2';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
    logout();
    toast.success('Logged out successfully');
    router.push('/auth');
  };

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HiOutlineUser className="h-5 w-5" />
              <span>User Information</span>
            </CardTitle>
            <CardDescription>
              Your account details and status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <HiOutlineUser className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <HiOutlineUser className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Username</p>
                  <p className="text-sm text-muted-foreground">{user.username}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <HiOutlineEnvelope className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <HiOutlineCalendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Member Since</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Account Status</span>
                <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                  Active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HiOutlineCog6Tooth className="h-5 w-5" />
              <span>Account Actions</span>
            </CardTitle>
            <CardDescription>
              Manage your account settings and security
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start" disabled>
                <HiOutlineUser className="h-4 w-4 mr-2" />
                Edit Profile
                <Badge variant="secondary" className="ml-auto text-xs">
                  Coming Soon
                </Badge>
              </Button>

              <Button variant="outline" className="w-full justify-start" disabled>
                <HiOutlineCog6Tooth className="h-4 w-4 mr-2" />
                Account Settings
                <Badge variant="secondary" className="ml-auto text-xs">
                  Coming Soon
                </Badge>
              </Button>

              <Button variant="outline" className="w-full justify-start" disabled>
                <HiOutlineEnvelope className="h-4 w-4 mr-2" />
                Change Email
                <Badge variant="secondary" className="ml-auto text-xs">
                  Coming Soon
                </Badge>
              </Button>

              <div className="pt-4 border-t">
                <Button
                  variant="destructive"
                  className="w-full justify-start"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  <HiOutlineArrowRightOnRectangle className="h-4 w-4 mr-2" />
                  {isLoggingOut ? 'Logging out...' : 'Log Out'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>
            Information about the Insurance RAG System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-medium text-sm">System Version</h3>
              <p className="text-2xl font-bold text-blue-600">v1.0</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-medium text-sm">API Status</h3>
              <p className="text-2xl font-bold text-green-600">Online</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-medium text-sm">Last Updated</h3>
              <p className="text-2xl font-bold text-gray-600">Today</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}