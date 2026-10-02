import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checkout | AURA OUTLET',
  description: 'Complete your purchase',
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
