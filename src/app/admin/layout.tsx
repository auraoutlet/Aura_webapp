'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  Grid3X3, 
  ShoppingCart, 
  Users, 
  Ticket, 
  Warehouse, 
  Settings,
  Menu,
  X,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState('admin@auraoutlet.com');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function verifyAdminAuth() {
      // 1. Check local session markers
      const hasCookie = typeof document !== 'undefined' && document.cookie.includes('aura_admin_session=true');
      const hasLocal = typeof window !== 'undefined' && localStorage.getItem('aura_admin_logged_in') === 'true';
      const roleLocal = typeof window !== 'undefined' && localStorage.getItem('aura_user_role');

      if (hasCookie || hasLocal || roleLocal === 'admin') {
        const storedEmail = localStorage.getItem('aura_admin_email');
        if (storedEmail) setAdminEmail(storedEmail);
        setIsAuthorized(true);
        setIsLoading(false);
        return;
      }

      // 2. Fallback check with Supabase Auth
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

          if (profile?.role === 'admin' || user.email === 'admin@auraoutlet.com') {
            document.cookie = 'aura_admin_session=true; path=/; max-age=604800; SameSite=Lax';
            document.cookie = 'aura_user_role=admin; path=/; max-age=604800; SameSite=Lax';
            localStorage.setItem('aura_admin_logged_in', 'true');
            localStorage.setItem('aura_user_role', 'admin');
            localStorage.setItem('aura_admin_email', user.email || 'admin@auraoutlet.com');
            setAdminEmail(user.email || 'admin@auraoutlet.com');
            setIsAuthorized(true);
            setIsLoading(false);
            return;
          }
        }
      } catch (e) {
        // Not authorized
      }

      // If neither succeeds, redirect to the unified public sign in portal
      window.location.replace('/login?redirect=/admin');
    }

    verifyAdminAuth();
  }, [pathname]);

  const handleSignOut = async () => {
    document.cookie = 'aura_admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'aura_user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    if (typeof window !== 'undefined') {
      localStorage.removeItem('aura_admin_logged_in');
      localStorage.removeItem('aura_user_role');
      localStorage.removeItem('aura_admin_email');
    }
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (e) {
      // Ignore
    }
    window.location.replace('/login');
  };

  if (isLoading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin mb-4" />
        <h1 className="text-xl font-bold uppercase tracking-widest mb-1">AURA OUTLET</h1>
        <p className="text-xs text-gray-400 uppercase tracking-wider">Verifying Admin Access...</p>
      </div>
    );
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Categories', href: '/admin/categories', icon: Grid3X3 },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Coupons', href: '/admin/coupons', icon: Ticket },
    { name: 'Inventory', href: '/admin/inventory', icon: Warehouse },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-off-white flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-black text-white p-4 flex justify-between items-center sticky top-0 z-20">
        <img src="/logo-white.png" alt="AURA OUTLET" className="h-10 w-auto object-contain" />
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:static inset-y-0 left-0 z-40 w-64 bg-black text-white flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 border-r border-white/10 shrink-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <img src="/logo-white.png" alt="AURA OUTLET" className="h-9 w-auto object-contain" />
          </Link>
          <span className="text-[10px] bg-white text-black font-extrabold uppercase px-2 py-0.5 tracking-wider">
            ADMIN
          </span>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3.5 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors",
                  isActive 
                    ? "bg-white text-black" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 bg-neutral-950">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs font-bold text-white">
              <ShieldCheck size={16} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold truncate text-white">Admin Session</span>
              <span className="text-[11px] text-gray-400 truncate">{adminEmail}</span>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
