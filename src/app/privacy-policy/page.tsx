import { Metadata } from 'next';
import { Container } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Privacy Policy | AURA OUTLET',
  description: 'Privacy Policy for AURA OUTLET.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="py-16 md:py-24">
      <Container className="max-w-4xl">
        <h1 className="text-4xl font-bold tracking-wider uppercase mb-8">Privacy Policy</h1>
        
        <div className="prose prose-slate max-w-none space-y-8 text-gray-600">
          <p className="text-sm font-medium text-black">Last Updated: September 30, 2026</p>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-wider uppercase text-black">1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us. For example, we collect information when you create an account, participate in any interactive features of our services, fill out a form, request customer support or otherwise communicate with us.
            </p>
            <p>The types of information we may collect include your name, email address, postal address, credit card information and other contact or identifying information you choose to provide.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-wider uppercase text-black">2. Use of Information</h2>
            <p>We may use information about you for various purposes, including to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Provide, maintain and improve our services;</li>
              <li>Provide and deliver the products and services you request, process transactions and send you related information;</li>
              <li>Send you technical notices, updates, security alerts and support and administrative messages;</li>
              <li>Respond to your comments, questions and requests and provide customer service;</li>
              <li>Communicate with you about products, services, offers, promotions, rewards, and events offered by AURA OUTLET.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-wider uppercase text-black">3. Sharing of Information</h2>
            <p>We may share information about you as follows or as otherwise described in this Privacy Policy:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>With vendors, consultants and other service providers who need access to such information to carry out work on our behalf;</li>
              <li>In response to a request for information if we believe disclosure is in accordance with any applicable law, regulation or legal process;</li>
              <li>If we believe your actions are inconsistent with the spirit or language of our user agreements or policies.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-wider uppercase text-black">4. Security</h2>
            <p>
              AURA OUTLET takes reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-wider uppercase text-black">5. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at: support@auraoutlet.com
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
}
