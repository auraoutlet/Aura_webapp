import Link from 'next/link';
import { Container } from '@/components/ui';
import { Button } from '@/components/ui';

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-gray">
        404
      </p>
      <h1 className="mt-4 text-4xl font-bold uppercase tracking-tight text-black md:text-6xl">
        Page Not Found
      </h1>
      <p className="mt-4 text-sm text-gray">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8">
        <Link href="/">
          <Button variant="primary" size="lg">
            Back to Home
          </Button>
        </Link>
      </div>
    </Container>
  );
}
