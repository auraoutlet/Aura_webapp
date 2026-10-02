import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop | AURA OUTLET',
  description: 'Browse our collection of premium streetwear and fashion clothing.',
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
