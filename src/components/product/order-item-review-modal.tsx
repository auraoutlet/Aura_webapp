'use client';

import React, { useState } from 'react';
import { Star, CheckCircle, X } from 'lucide-react';
import { Button, Input, Textarea, Spinner } from '@/components/ui';
import { submitProductReview } from '@/lib/services/reviews';
import { cn } from '@/lib/utils';

interface OrderItemReviewModalProps {
  productId: string;
  productName: string;
  defaultCustomerName?: string;
  className?: string;
}

export function OrderItemReviewModal({
  productId,
  productName,
  defaultCustomerName = '',
  className = '',
}: OrderItemReviewModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form Fields - Mandatory
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [name, setName] = useState(defaultCustomerName);
  const [city, setCity] = useState('');
  const [fit, setFit] = useState('True to oversized fit');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  const fitOptions = [
    'True to oversized fit',
    'Perfect boxy drape',
    'Runs slightly large',
    'Runs slightly small',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!rating) {
      setErrorMessage('Please select a star rating (1 to 5 stars)');
      return;
    }
    if (!name.trim()) {
      setErrorMessage('Please enter your name');
      return;
    }
    if (!comment.trim()) {
      setErrorMessage('Please write your review feedback');
      return;
    }

    setSubmitting(true);
    const res = await submitProductReview(productId, {
      productName,
      name: name.trim(),
      city: city.trim() || 'India',
      rating,
      fit,
      title: title.trim() || 'Great streetwear fit',
      comment: comment.trim(),
    });
    setSubmitting(false);

    if (res.success) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setIsOpen(false);
      }, 2200);
    } else {
      setErrorMessage(res.error || 'Failed to submit review. Please try again.');
    }
  };

  return (
    <>
      {/* Prominent, Highlighted Action Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-white hover:bg-neutral-800 text-[11px] font-black uppercase tracking-wider transition-all shadow-sm",
          className
        )}
      >
        <Star size={12} className="fill-white text-white" />
        <span>Rate &amp; Review Item</span>
      </button>

      {/* Review Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-left">
          <div className="bg-white border-2 border-black w-full max-w-lg p-6 relative max-h-[92vh] overflow-y-auto shadow-2xl">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-black hover:opacity-60 p-1 transition-opacity"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="mb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray block">
                Verified Purchase Review
              </span>
              <h3 className="text-lg font-black uppercase text-black">
                Review {productName}
              </h3>
            </div>

            {submitted ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle size={26} />
                </div>
                <h4 className="text-base font-black uppercase text-black">Review Submitted!</h4>
                <p className="text-xs text-gray">
                  Thank you for your review. It has been verified and recorded.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="p-2.5 bg-red-50 border border-red-300 text-red-700 text-xs font-bold uppercase tracking-wide">
                    {errorMessage}
                  </div>
                )}

                {/* Rating - Mandatory */}
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-black block mb-1">
                    Rating <span className="text-red-600">*</span> (Mandatory)
                  </label>
                  <div className="flex gap-1.5 items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                        aria-label={`${star} star`}
                      >
                        <Star
                          size={26}
                          className={cn(
                            (hoverRating || rating) >= star
                              ? 'fill-black text-black'
                              : 'text-neutral-300'
                          )}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-xs font-black text-black">
                      {rating} / 5 Stars
                    </span>
                  </div>
                </div>

                {/* Name & City - Mandatory */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-black block mb-1">
                      Your Name <span className="text-red-600">*</span>
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Shivaprakash G."
                      required
                      className="h-10 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-black block mb-1">
                      City / Location
                    </label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Salem, Tamil Nadu"
                      className="h-10 text-xs"
                    />
                  </div>
                </div>

                {/* Fit Opinion - Mandatory */}
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-black block mb-1">
                    Fit Opinion <span className="text-red-600">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {fitOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setFit(opt)}
                        className={cn(
                          'py-2 px-2 text-[11px] font-bold uppercase tracking-tight text-center border transition-all',
                          fit === opt
                            ? 'bg-black text-white border-black ring-1 ring-black'
                            : 'bg-white text-gray-700 border-border hover:border-black'
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Headline */}
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-black block mb-1">
                    Review Headline
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Thick fabric, sharp collar, perfect oversized drape"
                    className="h-10 text-xs"
                  />
                </div>

                {/* Review Text - Mandatory */}
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-black block mb-1">
                    Review Feedback <span className="text-red-600">*</span> (Mandatory)
                  </label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us about the fabric density, collar tightness, wash durability, or fit comfort..."
                    rows={3}
                    required
                    className="text-xs leading-relaxed"
                  />
                </div>

                {/* Submit Controls */}
                <div className="pt-2 flex gap-2">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 h-11 text-xs font-black uppercase tracking-wider"
                  >
                    {submitting ? <Spinner size="sm" className="mr-2" /> : null}
                    {submitting ? 'Submitting Review...' : 'Submit Review'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    className="h-11 text-xs font-bold uppercase tracking-wider"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
