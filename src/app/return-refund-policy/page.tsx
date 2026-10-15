export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { Metadata } from 'next';
import { Container } from '@/components/ui';
import { getSetting, PolicyPagesSettings, DEFAULT_POLICY_PAGES } from '@/lib/services/settings';

export const metadata: Metadata = {
  title: 'Return & Refund Policy | AURA OUTLET',
  description: 'Hassle-free 7-day replacement and return policy for AURA OUTLET.',
};

export default async function ReturnPolicyPage() {
  const policy = await getSetting<PolicyPagesSettings>('policy_pages', DEFAULT_POLICY_PAGES);

  return (
    <div className="py-12 md:py-20 animate-fade-in bg-white">
      <Container className="max-w-4xl">
        <div className="border-b border-border pb-4 mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gray mb-1">
            Customer Guarantee
          </p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase text-black">
            Return & Refund Policy
          </h1>
        </div>
        
        <div className="space-y-8 text-xs sm:text-sm text-gray-700 leading-relaxed">
          {/* Admin Managed Overview */}
          <div className="p-4 bg-off-white border border-border rounded-lg text-black font-medium">
            <h3 className="font-black uppercase tracking-wider text-xs mb-1.5">Official Return Policy</h3>
            <p className="leading-relaxed">
              {policy.returnPolicyText || 'We offer a 7-day hassle-free doorstep replacement or return policy for unused, unwashed items in their original brand packaging with all tags attached.'}
            </p>
          </div>

          <section className="space-y-2.5">
            <h2 className="text-base sm:text-lg font-black tracking-wider uppercase text-black">7-Day Return Window</h2>
            <p>
              You have 7 calendar days from the date of doorstep delivery to request a replacement or return. To qualify, apparel must be unworn, unwashed, free of stains or fragrance, and accompanied by the original brand tags and polybag.
            </p>
          </section>

          <section className="space-y-2.5">
            <h2 className="text-base sm:text-lg font-black tracking-wider uppercase text-black">Size Exchanges & Replacements</h2>
            <p>
              Ordered the wrong size? We offer free doorstep reverse pickup and replacement for sizing issues across all standard oversized tees. Simply contact support via WhatsApp or email with your Order Number and desired size.
            </p>
          </section>

          <section className="space-y-2.5">
            <h2 className="text-base sm:text-lg font-black tracking-wider uppercase text-black">Refund Processing</h2>
            <p>
              Once your returned item arrives at our warehouse and passes QC inspection (typically 24 hours), refunds are initiated back to your original payment method (Bank/UPI/Card) within 3-5 business days. For COD orders, refund is remitted directly to your verified UPI ID or Bank account.
            </p>
          </section>

          <section className="space-y-2.5">
            <h2 className="text-base sm:text-lg font-black tracking-wider uppercase text-black">Need Help?</h2>
            <p>
              Have a question regarding your return? Reach out directly to our support desk at{' '}
              <a href={`mailto:${policy.contactEmail || 'support@auraoutlet.com'}`} className="font-bold text-black underline">
                {policy.contactEmail || 'support@auraoutlet.com'}
              </a>{' '}
              or WhatsApp us at{' '}
              <a href={`tel:${(policy.contactPhone || '+91 83009 48486').replace(/\s+/g, '')}`} className="font-bold text-black underline">
                {policy.contactPhone || '+91 83009 48486'}
              </a>.
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
}
