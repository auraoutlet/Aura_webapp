import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cart | AURA OUTLET',
  description: 'View your shopping cart',
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
