'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export function StoreShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');
  const [isAdminUser, setIsAdminUser] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is an admin
    const hasAdminCookie = typeof document !== 'undefined' && document.cookie.includes('aura_admin_session=true');
    const hasAdminLocal = typeof window !== 'undefined' && localStorage.getItem('aura_admin_logged_in') === 'true';
    const userRole = typeof window !== 'undefined' && localStorage.getItem('aura_user_role');

    const adminDetected = hasAdminCookie || hasAdminLocal || userRole === 'admin';

    if (adminDetected) {
      setIsAdminUser(true);
      // If admin is trying to access public customer routes, prevent public screens and redirect to /admin
      if (!isAdminRoute) {
        window.location.replace('/admin');
        return;
      }
    } else {
      setIsAdminUser(false);
    }

    setIsChecking(false);
  }, [pathname, isAdminRoute]);

  // Admin routes render the admin UI directly without public store chrome
  if (isAdminRoute) {
    return <>{children}</>;
  }

  // If logged in as admin on a public route, do NOT show public portal screens
  if (isAdminUser || isChecking) {
    if (isAdminUser) {
      return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin mb-4" />
          <h2 className="text-xl font-bold uppercase tracking-widest mb-1">AURA OUTLET ADMIN</h2>
          <p className="text-xs text-gray-400 uppercase tracking-wider">Redirecting to Admin Portal...</p>
        </div>
      );
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
