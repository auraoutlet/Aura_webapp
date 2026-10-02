'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Container, Button, Input, Textarea } from '@/components/ui';

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate api call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1000);
  };

  return (
    <div className="py-16 md:py-24">
      <Container>
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-wider uppercase mb-4">Contact Us</h1>
          <p className="text-gray-500 max-w-2xl">
            Have a question about your order, need sizing advice, or just want to say hello? 
            We&apos;re here to help. Fill out the form below or reach us directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div className="space-y-12">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold tracking-wider uppercase border-b pb-4">Get In Touch</h2>
              
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-50 rounded-full">
                    <Mail size={24} className="text-black" />
                  </div>
                  <div>
                    <h3 className="font-bold tracking-wider uppercase mb-1">Email</h3>
                    <p className="text-gray-600">support@auraoutlet.com</p>
                    <p className="text-sm text-gray-500 mt-1">We aim to reply within 24 hours.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-50 rounded-full">
                    <Phone size={24} className="text-black" />
                  </div>
                  <div>
                    <h3 className="font-bold tracking-wider uppercase mb-1">Phone</h3>
                    <p className="text-gray-600">+1 (800) 123-4567</p>
                    <p className="text-sm text-gray-500 mt-1">Mon-Fri, 9am - 5pm EST</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-50 rounded-full">
                    <MapPin size={24} className="text-black" />
                  </div>
                  <div>
                    <h3 className="font-bold tracking-wider uppercase mb-1">Headquarters</h3>
                    <p className="text-gray-600">
                      123 Fashion Ave<br />
                      Suite 400<br />
                      New York, NY 10001
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-50 p-8 md:p-10">
            <h2 className="text-2xl font-bold tracking-wider uppercase mb-8">Send a Message</h2>
            
            {isSubmitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <h3 className="text-2xl font-bold tracking-wider uppercase">Message Sent</h3>
                <p className="text-gray-600">
                  Thank you for reaching out. We will get back to you as soon as possible.
                </p>
                <Button 
                  onClick={() => setIsSubmitted(false)} 
                  variant="outline" 
                  className="mt-6"
                >
                  SEND ANOTHER MESSAGE
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Name</label>
                    <Input id="name" required placeholder="Your name" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <Input id="email" type="email" required placeholder="your@email.com" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                  <Input id="subject" required placeholder="Order inquiry, Returns, etc." />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">Message</label>
                  <Textarea 
                    id="message" 
                    required 
                    placeholder="How can we help you?" 
                    rows={5}
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'SENDING...' : 'SEND MESSAGE'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
