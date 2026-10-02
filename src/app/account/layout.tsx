'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Package, MapPin, Heart, LogOut } from 'lucide-react';
import { getInitials, cn } from '@/lib/utils';
import { Container } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';

const sidebarItems = [
  { name: 'Profile', href: '/account/profile', icon: User },
  { name: 'Orders', href: '/account/orders', icon: Package },
  { name: 'Addresses', href: '/account/addresses', icon: MapPin },
  { name: 'Wishlist', href: '/account/wishlist', icon: Heart },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<{ id: string; email?: string; full_name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createClient();
        const { data: { user: authUser }, error } = await supabase.auth.getUser();

        if (error || !authUser) {
          window.location.href = `/login?redirect=${encodeURIComponent(pathname)}`;
          return;
        }

        // Fetch associated profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, phone, role')
          .eq('id', authUser.id)
          .maybeSingle();

        if (profile?.role === 'admin' || authUser.email === 'admin@auraoutlet.com') {
          document.cookie = 'aura_admin_session=true; path=/; max-age=604800; SameSite=Lax';
          document.cookie = 'aura_user_role=admin; path=/; max-age=604800; SameSite=Lax';
          localStorage.setItem('aura_admin_logged_in', 'true');
          localStorage.setItem('aura_user_role', 'admin');
          window.location.replace('/admin');
          return;
        }

        setUser({
          id: authUser.id,
          email: authUser.email || '',
          full_name: profile?.full_name || authUser.user_metadata?.full_name || 'Valued Customer',
        });
      } catch (err) {
        window.location.href = `/login?redirect=${encodeURIComponent(pathname)}`;
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (e) {
      // Ignore
    }
    window.location.href = '/login';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-off-white py-16 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-widest font-bold text-gray-500">Loading Account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white py-12">
      <Container>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            {/* Account Header */}
            <div className="flex items-center gap-4 p-6 bg-white border border-border mb-6">
              <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center text-lg font-medium">
                {getInitials(user?.full_name || 'Customer')}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="font-semibold truncate">{user?.full_name || 'Customer'}</span>
                <span className="text-sm text-gray truncate">{user?.email}</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="bg-white border border-border flex flex-col">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors border-b border-border last:border-b-0",
                      isActive 
                        ? "bg-black text-white" 
                        : "hover:bg-gray-50 text-black"
                    )}
                  >
                    <Icon size={18} />
                    {item.name}
                  </Link>
                );
              })}
              <button 
                onClick={handleSignOut}
                className="flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors text-error hover:bg-gray-50 text-left w-full cursor-pointer"
              >
                <LogOut size={18} />
                Logout
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </Container>
    </div>
  );
}
