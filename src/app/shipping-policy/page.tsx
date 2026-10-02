import { Metadata } from 'next';
import { Container } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Shipping Policy | AURA OUTLET',
  description: 'Shipping information and rates for AURA OUTLET.',
};

export default function ShippingPolicyPage() {
  return (
    <div className="py-16 md:py-24">
      <Container className="max-w-4xl">
        <h1 className="text-4xl font-bold tracking-wider uppercase mb-8">Shipping Policy</h1>
        
        <div className="prose prose-slate max-w-none space-y-8 text-gray-600">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-wider uppercase text-black">Processing Time</h2>
            <p>
              All orders are processed within 1-3 business days. Orders are not shipped or delivered on weekends or holidays. If we are experiencing a high volume of orders, shipments may be delayed by a few days. Please allow additional days in transit for delivery.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-wider uppercase text-black">Shipping Rates & Delivery Estimates</h2>
            <p>Shipping charges for your order will be calculated and displayed at checkout. We offer the following shipping options:</p>
            
            <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="p-4 font-bold tracking-wider uppercase text-black text-sm">Shipping Method</th>
                    <th className="p-4 font-bold tracking-wider uppercase text-black text-sm">Estimated Delivery Time</th>
                    <th className="p-4 font-bold tracking-wider uppercase text-black text-sm">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="p-4">Standard Shipping</td>
                    <td className="p-4">3-5 business days</td>
                    <td className="p-4">Free on orders over $150 ($10 flat rate below)</td>
                  </tr>
                  <tr>
                    <td className="p-4">Express Shipping</td>
                    <td className="p-4">1-2 business days</td>
                    <td className="p-4">$25 flat rate</td>
                  </tr>
                  <tr>
                    <td className="p-4">International</td>
                    <td className="p-4">7-14 business days</td>
                    <td className="p-4">Calculated at checkout</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-wider uppercase text-black">Shipment Confirmation & Order Tracking</h2>
            <p>
              You will receive a Shipment Confirmation email once your order has shipped containing your tracking number(s). The tracking number will be active within 24 hours.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-wider uppercase text-black">Customs, Duties and Taxes</h2>
            <p>
              AURA OUTLET is not responsible for any customs and taxes applied to your order. All fees imposed during or after shipping are the responsibility of the customer (tariffs, taxes, etc.).
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-wider uppercase text-black">Damages</h2>
            <p>
              AURA OUTLET is not liable for any products damaged or lost during shipping. If you received your order damaged, please contact the shipment carrier to file a claim. Please save all packaging materials and damaged goods before filing a claim.
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
}
