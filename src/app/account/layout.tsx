'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Package, MapPin, Heart, LogOut } from 'lucide-react';
import { mockCustomers } from '@/lib/mock-data';
import { getInitials, cn } from '@/lib/utils';
import { Container } from '@/components/ui';

const sidebarItems = [
  { name: 'Profile', href: '/account/profile', icon: User },
  { name: 'Orders', href: '/account/orders', icon: Package },
  { name: 'Addresses', href: '/account/addresses', icon: MapPin },
  { name: 'Wishlist', href: '/account/wishlist', icon: Heart },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = mockCustomers[0];

  return (
    <div className="min-h-screen bg-off-white py-12">
      <Container>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            {/* Account Header */}
            <div className="flex items-center gap-4 p-6 bg-white border border-border mb-6">
              <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center text-lg font-medium">
                {getInitials(user.full_name)}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="font-semibold truncate">{user.full_name}</span>
                <span className="text-sm text-gray truncate">{user.email}</span>
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
                className="flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors text-error hover:bg-gray-50 text-left w-full"
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
