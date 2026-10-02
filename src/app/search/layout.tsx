import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search | AURA OUTLET',
  description: 'Search for premium streetwear and fashion clothing.',
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
