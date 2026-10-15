import { Metadata } from 'next';
import { Container } from '@/components/ui';
import { getSetting, PolicyPagesSettings, DEFAULT_POLICY_PAGES } from '@/lib/services/settings';

export const metadata: Metadata = {
  title: 'Privacy Policy | AURA OUTLET',
  description: 'Privacy Policy and data security practices for AURA OUTLET.',
};

export default async function PrivacyPolicyPage() {
  const policy = await getSetting<PolicyPagesSettings>('policy_pages', DEFAULT_POLICY_PAGES);

  return (
    <div className="py-12 md:py-20 animate-fade-in bg-white">
      <Container className="max-w-4xl">
        <div className="border-b border-border pb-4 mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gray mb-1">
            Trust & Security
          </p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase text-black">
            Privacy Policy
          </h1>
        </div>
        
        <div className="space-y-8 text-xs sm:text-sm text-gray-700 leading-relaxed">
          {/* Admin Managed Overview */}
          <div className="p-4 bg-off-white border border-border rounded-lg text-black font-medium">
            <h3 className="font-black uppercase tracking-wider text-xs mb-1.5">Data Privacy Statement</h3>
            <p className="leading-relaxed">
              {policy.privacyPolicyText || 'AURA OUTLET respects your privacy. We strictly secure customer contact and transaction information and never sell or disclose your personal data to unauthorized third parties.'}
            </p>
          </div>

          <section className="space-y-2.5">
            <h2 className="text-base sm:text-lg font-black tracking-wider uppercase text-black">1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us when you create an account, browse products, place an order, or communicate with customer care. This includes:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Full Name, Delivery Addresses, Pincode</li>
              <li>Phone Number and Email Address (for dispatch tracking and transactional OTPs)</li>
              <li>Encrypted transaction references processed securely via RBI-compliant payment gateways (Cashfree/UPI)</li>
            </ul>
          </section>

          <section className="space-y-2.5">
            <h2 className="text-base sm:text-lg font-black tracking-wider uppercase text-black">2. Payment & Card Security</h2>
            <p>
              AURA OUTLET never stores your raw debit/credit card numbers or UPI MPINs. All transactions are end-to-end tokenized and processed via certified PCI-DSS compliant banking partners.
            </p>
          </section>

          <section className="space-y-2.5">
            <h2 className="text-base sm:text-lg font-black tracking-wider uppercase text-black">3. Contacting Us Regarding Your Data</h2>
            <p>
              If you have any questions or requests regarding your personal information, contact our privacy desk at{' '}
              <a href={`mailto:${policy.contactEmail || 'support@auraoutlet.com'}`} className="font-bold text-black underline">
                {policy.contactEmail || 'support@auraoutlet.com'}
              </a>.
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
}
