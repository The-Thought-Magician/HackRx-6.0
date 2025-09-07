'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { routes } from '@/components/routes';
import Sidebar from '@/components/sidebar/Sidebar';
import NavbarAdmin from '@/components/navbar/NavbarAdmin';
import { OpenContext } from '@/contexts/layout';
import LoadingScreen from '@/components/ui/loading-screen';
import ProfessionalBackground from '@/components/ui/professional-background';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking auth
  if (isLoading) {
    return <LoadingScreen message="Authenticating your insurance account..." />;
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <OpenContext.Provider value={{ open, setOpen }}>
      <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-900">
        <Sidebar routes={routes} />
        <div className="h-full w-full bg-white dark:bg-slate-800">
          <main className="mx-2.5 flex-none transition-all duration-300 md:pr-2 xl:ml-[323px]">
            <div>
              <NavbarAdmin />
              <div className="pt-5 mx-auto mb-auto h-full min-h-[84vh] p-2 md:pr-2">
                <div className="space-y-6">
                  {children}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </OpenContext.Provider>
  );
}