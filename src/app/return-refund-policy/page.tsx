import { Metadata } from 'next';
import { Container } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Return & Refund Policy | AURA OUTLET',
  description: 'Return and refund policy for AURA OUTLET.',
};

export default function ReturnPolicyPage() {
  return (
    <div className="py-16 md:py-24">
      <Container className="max-w-4xl">
        <h1 className="text-4xl font-bold tracking-wider uppercase mb-8">Return & Refund Policy</h1>
        
        <div className="prose prose-slate max-w-none space-y-8 text-gray-600">
          <p>Thank you for shopping at AURA OUTLET. If you are not entirely satisfied with your purchase, we&apos;re here to help.</p>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-wider uppercase text-black">Returns</h2>
            <p>
              You have 30 calendar days to return an item from the date you received it. To be eligible for a return, your item must be unused, unwashed, and in the same condition that you received it. Your item must be in the original packaging with all tags attached.
            </p>
            <p>Your item needs to have the receipt or proof of purchase.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-wider uppercase text-black">Refunds</h2>
            <p>
              Once we receive your item, we will inspect it and notify you that we have received your returned item. We will immediately notify you on the status of your refund after inspecting the item.
            </p>
            <p>
              If your return is approved, we will initiate a refund to your credit card (or original method of payment). You will receive the credit within a certain amount of days, depending on your card issuer&apos;s policies.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-wider uppercase text-black">Exchanges</h2>
            <p>
              If you need a different size or color, please return your original item for a refund and place a new order. We do not offer direct exchanges at this time due to high inventory turnover.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-wider uppercase text-black">Shipping</h2>
            <p>
              You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-wider uppercase text-black">Non-Returnable Items</h2>
            <p>Certain items cannot be returned:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Underwear and swimwear</li>
              <li>Sale items marked as &quot;Final Sale&quot;</li>
              <li>Gift cards</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-wider uppercase text-black">Contact Us</h2>
            <p>
              If you have any questions on how to return your item to us, contact us at support@auraoutlet.com.
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
}
