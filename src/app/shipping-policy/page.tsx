export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { Metadata } from 'next';
import { Container } from '@/components/ui';
import { getSetting, PolicyPagesSettings, DEFAULT_POLICY_PAGES } from '@/lib/services/settings';

export const metadata: Metadata = {
  title: 'Shipping Policy | AURA OUTLET',
  description: 'Pan-India shipping rates, delivery timelines, and prepaid/COD terms for AURA OUTLET.',
};

export default async function ShippingPolicyPage() {
  const policy = await getSetting<PolicyPagesSettings>('policy_pages', DEFAULT_POLICY_PAGES);

  return (
    <div className="py-12 md:py-20 animate-fade-in bg-white">
      <Container className="max-w-4xl">
        <div className="border-b border-border pb-4 mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gray mb-1">
            Fulfillment & Logistics
          </p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase text-black">
            Shipping Policy
          </h1>
        </div>
        
        <div className="space-y-8 text-xs sm:text-sm text-gray-700 leading-relaxed">
          {/* Admin Managed Overview */}
          <div className="p-4 bg-off-white border border-border rounded-lg text-black font-medium">
            <h3 className="font-black uppercase tracking-wider text-xs mb-1.5">Store Delivery Overview</h3>
            <p className="leading-relaxed">
              {policy.shippingPolicyText || 'Orders dispatch within 24-48 business hours across India. Prepaid orders enjoy express air transit (2-4 days). Cash on Delivery orders require ₹200 advance confirmation with ₹150 delivery & handling charges.'}
            </p>
          </div>

          <section className="space-y-2.5">
            <h2 className="text-base sm:text-lg font-black tracking-wider uppercase text-black">Order Processing & Dispatch</h2>
            <p>
              All orders are processed and packed at our Salem fulfillment center within 24 to 48 business hours (excluding Sundays and national holidays). Tracking IDs are generated and updated on your account immediately upon courier handover.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black tracking-wider uppercase text-black">Pan-India Delivery Timelines & Charges</h2>
            <p>We partner with premier logistics carriers (Bluedart, Delhivery, Xpressbees) to ensure express transit across all serviceable Indian pincodes:</p>
            
            <div className="border border-border rounded-lg overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-off-white border-b border-border">
                  <tr>
                    <th className="p-3.5 font-black tracking-wider uppercase text-black">Shipping Method</th>
                    <th className="p-3.5 font-black tracking-wider uppercase text-black">Estimated Timeline</th>
                    <th className="p-3.5 font-black tracking-wider uppercase text-black">Charges</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-white">
                  <tr>
                    <td className="p-3.5 font-bold text-black">Prepaid Express Air</td>
                    <td className="p-3.5 text-gray-600">2 - 4 Business Days</td>
                    <td className="p-3.5 font-bold text-green-700">₹50 (FREE on orders above ₹999)</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-black">Cash on Delivery (COD)</td>
                    <td className="p-3.5 text-gray-600">3 - 6 Business Days</td>
                    <td className="p-3.5 text-black">
                      <strong>₹150</strong> (₹50 Express Shipping + ₹100 COD Verification Fee)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-2.5 bg-amber-50/70 border border-amber-200 p-4 rounded-lg text-amber-950">
            <h2 className="text-sm font-black tracking-wider uppercase text-amber-900">Cash on Delivery (COD) Advance Terms</h2>
            <p className="leading-relaxed">
              To minimize Return to Origin (RTO) and prevent fraudulent bookings, AURA OUTLET requires a <strong>₹200 advance payment</strong> online via UPI or card for all COD orders. The remaining balance (Order Total minus ₹200) is collected in cash at your doorstep upon delivery.
            </p>
          </section>

          <section className="space-y-2.5">
            <h2 className="text-base sm:text-lg font-black tracking-wider uppercase text-black">Tracking Your Shipment</h2>
            <p>
              Once dispatched, you will receive real-time SMS and email notifications with direct tracking links. You can also track the status of your parcel directly from the <strong className="text-black">Track Order</strong> page using your Order Number.
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
}
