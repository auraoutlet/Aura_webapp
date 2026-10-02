import { Metadata } from 'next';
import { Container } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Terms of Service | AURA OUTLET',
  description: 'Terms and Conditions for AURA OUTLET.',
};

export default function TermsPage() {
  return (
    <div className="py-16 md:py-24">
      <Container className="max-w-4xl">
        <h1 className="text-4xl font-bold tracking-wider uppercase mb-8">Terms of Service</h1>
        
        <div className="prose prose-slate max-w-none space-y-8 text-gray-600">
          <p className="text-sm font-medium text-black">Last Updated: September 30, 2026</p>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-wider uppercase text-black">1. Introduction</h2>
            <p>
              Welcome to AURA OUTLET. These Terms of Service govern your use of our website and services. By accessing or using our website, you agree to be bound by these terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-wider uppercase text-black">2. Products and Pricing</h2>
            <p>
              All products listed on the website are subject to availability. We reserve the right to discontinue any product at any time. Prices for all products are subject to change without notice.
            </p>
            <p>
              We have made every effort to display as accurately as possible the colors and images of our products that appear at the store. We cannot guarantee that your computer monitor&apos;s display of any color will be accurate.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-wider uppercase text-black">3. Order Acceptance</h2>
            <p>
              Please note that there may be certain orders that we are unable to accept and must cancel. We reserve the right, at our sole discretion, to refuse or cancel any order for any reason. For your convenience, you will not be charged until your payment method is authorized, the order information is verified for accuracy and your order is shipped.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-wider uppercase text-black">4. Intellectual Property</h2>
            <p>
              All content included on this site, such as text, graphics, logos, button icons, images, audio clips, digital downloads, data compilations, and software, is the property of AURA OUTLET or its content suppliers and protected by international copyright laws.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-wider uppercase text-black">5. Governing Law</h2>
            <p>
              These Terms of Service and any separate agreements whereby we provide you services shall be governed by and construed in accordance with the laws of the jurisdiction in which AURA OUTLET operates.
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
}
