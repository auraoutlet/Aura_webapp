import { redirect } from 'next/navigation';

export default async function OrderDirectRedirect({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  redirect(`/orders?number=${encodeURIComponent(id)}`);
}
