'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
} from 'lucide-react';
import { Container } from '@/components/ui';
import { NAV_LINKS } from '@/lib/constants';
import { useCartStore, useWishlistStore, useHydration } from '@/lib/store';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const cartItemCount = useCartStore((s) => s.getItemCount());
  const wishlistItems = useWishlistStore((s) => s.items);
  const isHydrated = useHydration();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    useCartStore.persist.rehydrate();
    useWishlistStore.persist.rehydrate();
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full bg-white transition-shadow duration-300 ${
          isScrolled ? 'shadow-sm' : ''
        }`}
      >
        {/* Announcement Bar */}
        <div className="bg-black py-2.5 text-center text-xs md:text-sm font-bold tracking-[0.25em] text-white">
          FREE SHIPPING ON ORDERS ABOVE ₹999
        </div>

        <Container>
          <nav className="flex h-16 items-center justify-between gap-4 md:h-24">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex items-center justify-center p-2 text-black transition-colors hover:opacity-70 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Logo */}
            <Link
              href="/"
              className="flex items-center py-1"
            >
              <img src="/logo-black.png" alt="AURA OUTLET" className="h-10 md:h-12 lg:h-14 w-auto object-contain transition-transform hover:scale-105" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden items-center gap-9 lg:flex">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-sm font-bold uppercase tracking-[0.18em] transition-colors hover:text-black py-2 ${
                    pathname === link.href
                      ? 'text-black border-b-2 border-black'
                      : 'text-gray'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/search"
                className="flex items-center justify-center p-2 text-black transition-colors hover:opacity-70"
                aria-label="Search"
              >
                <Search className="h-5 w-5 md:h-6 md:w-6" />
              </Link>
              <Link
                href="/account/wishlist"
                className="relative hidden items-center justify-center p-2 text-black transition-colors hover:opacity-70 sm:flex"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5 md:h-6 md:w-6" />
                {isHydrated && wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 min-w-[20px] items-center justify-center bg-black text-[11px] font-extrabold text-white rounded-full border-2 border-white">
                    {wishlistItems.length > 9 ? '9+' : wishlistItems.length}
                  </span>
                )}
              </Link>
              <Link
                href="/cart"
                className="relative flex items-center justify-center p-2 text-black transition-colors hover:opacity-70"
                aria-label="Cart"
              >
                <ShoppingBag className="h-5 w-5 md:h-6 md:w-6" />
                {isHydrated && cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 min-w-[20px] items-center justify-center bg-black text-[11px] font-extrabold text-white rounded-full border-2 border-white">
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </span>
                )}
              </Link>
              <Link
                href="/account"
                className="hidden items-center justify-center p-2 text-black transition-colors hover:opacity-70 sm:flex"
                aria-label="Account"
              >
                <User className="h-5 w-5 md:h-6 md:w-6" />
              </Link>
            </div>
          </nav>
        </Container>

        {/* Bottom border */}
        <div className="h-px w-full bg-border" />
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Panel */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-full max-w-sm transform bg-white transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <img src="/logo-black.png" alt="AURA OUTLET" className="h-9 w-auto object-contain" />
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-black transition-colors hover:opacity-70"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile Menu Links */}
          <nav className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block py-3.5 text-base font-bold uppercase tracking-[0.18em] transition-colors ${
                    pathname === link.href
                      ? 'text-black'
                      : 'text-gray hover:text-black'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Mobile secondary links */}
            <div className="mt-8 border-t border-border pt-6 space-y-2">
              <Link
                href="/account"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3.5 py-3 text-sm font-bold uppercase tracking-wider text-gray hover:text-black"
              >
                <User className="h-5 w-5" />
                Account
              </Link>
              <Link
                href="/account/wishlist"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3.5 py-3 text-sm font-bold uppercase tracking-wider text-gray hover:text-black"
              >
                <Heart className="h-5 w-5" />
                Wishlist
              </Link>
              <Link
                href="/cart"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3.5 py-3 text-sm font-bold uppercase tracking-wider text-gray hover:text-black"
              >
                <ShoppingBag className="h-5 w-5" />
                Cart
              </Link>
            </div>
          </nav>

          {/* Mobile Menu Footer */}
          <div className="border-t border-border px-6 py-5">
            <Link
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block w-full bg-black py-4 text-center text-sm font-extrabold uppercase tracking-widest text-white transition-colors hover:bg-dark"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
