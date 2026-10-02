'use client';

import { useState } from 'react';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail('');
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <form className="mt-6 flex gap-0" onSubmit={handleSubmit}>
      {submitted ? (
        <p className="w-full py-3 text-center text-sm text-white/80">
          Thank you for subscribing!
        </p>
      ) : (
        <>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 border border-white/20 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white focus:outline-none"
          />
          <button
            type="submit"
            className="border border-white bg-white px-6 py-3 text-xs font-semibold uppercase tracking-widest text-black transition-colors hover:bg-transparent hover:text-white"
          >
            Subscribe
          </button>
        </>
      )}
    </form>
  );
}
