import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Order Confirmed | AURA OUTLET',
  description: 'Your order has been placed successfully',
};

export default function OrderSuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
