'use client';

import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, Plus, X, MessageSquare, ThumbsUp } from 'lucide-react';
import { Button, Input, Textarea, Badge, Spinner } from '@/components/ui';
import { ProductReview, getProductReviews, submitProductReview } from '@/lib/services/reviews';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface ProductReviewsSectionProps {
  productId: string;
  productName: string;
}

export function ProductReviewsSection({ productId, productName }: ProductReviewsSectionProps) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  // Form State
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [fit, setFit] = useState('True to oversized fit');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    async function loadReviews() {
      setLoading(true);
      const data = await getProductReviews(productId);
      setReviews(data);
      setLoading(false);
    }
    loadReviews();
  }, [productId]);

  // Autofill user profile if logged in
  useEffect(() => {
    async function autofillUser() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setName(user.user_metadata?.full_name || user.email?.split('@')[0] || '');
        }
      } catch {
        // silent
      }
    }
    autofillUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    const res = await submitProductReview(productId, {
      name: name.trim() || 'Verified Customer',
      city: city.trim() || 'India',
      rating,
      fit,
      title: title.trim() || 'Great fit and quality',
      comment: comment.trim(),
    });

    setSubmitting(false);

    if (res.success && res.review) {
      setReviews([res.review, ...reviews]);
      setSuccessMessage(true);
      setTimeout(() => {
        setSuccessMessage(false);
        setIsModalOpen(false);
        setTitle('');
        setComment('');
      }, 2000);
    }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  const fitOptions = [
    'True to oversized fit',
    'Perfect boxy drape',
    'Runs slightly large',
    'Runs slightly small'
  ];

  return (
    <section id="reviews" className="pt-8 border-t border-border mt-8">
      {/* Header and Rating Summary */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-border gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray block mb-1">
            Community Fit & Feedback
          </span>
          <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-black">
            Customer Reviews
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  size={15} 
                  className={star <= Math.round(Number(averageRating)) ? "fill-black text-black" : "text-border"} 
                />
              ))}
            </div>
            <span className="text-sm font-black text-black">{averageRating} out of 5</span>
            <span className="text-xs text-gray">({reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'})</span>
          </div>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="h-10 px-5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0"
        >
          <Plus size={14} /> Write a Review
        </Button>
      </div>

      {/* Reviews List */}
      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="py-12 text-center text-xs text-gray font-bold uppercase tracking-wider">
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-10 text-center border border-border bg-off-white/40 p-6">
            <MessageSquare size={24} className="mx-auto text-gray mb-2" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-black">No Reviews Yet</h4>
            <p className="text-xs text-gray mt-1 mb-4">Be the first to share fit feedback and styling advice for this piece.</p>
            <Button onClick={() => setIsModalOpen(true)} size="sm" variant="outline" className="text-xs font-bold uppercase">
              Be the first to review
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div 
                key={rev.id} 
                className="border border-border p-4.5 bg-white flex flex-col justify-between hover:border-black transition-colors"
              >
                <div>
                  {/* Rating & Date */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star 
                          key={s} 
                          size={12} 
                          className={s <= rev.rating ? "fill-black text-black" : "text-border"} 
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-gray uppercase tracking-wider">
                      {new Date(rev.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  {/* Title */}
                  {rev.title && (
                    <h5 className="text-xs font-bold uppercase tracking-wide text-black mb-1.5">
                      {rev.title}
                    </h5>
                  )}

                  {/* Comment */}
                  <p className="text-xs text-gray-700 leading-relaxed font-normal mb-3">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>

                {/* Footer details: Name, City, Verified badge */}
                <div className="pt-2.5 border-t border-border/70 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-1 font-bold text-black text-[11px] uppercase">
                      <span>{rev.name}</span>
                      {rev.verified && <CheckCircle size={12} className="text-black" />}
                    </div>
                    {rev.city && (
                      <span className="text-[10px] text-gray uppercase tracking-widest block">{rev.city}</span>
                    )}
                  </div>
                  {rev.fit && (
                    <span className="text-[10px] font-semibold bg-off-white px-2 py-0.5 border border-border text-black">
                      {rev.fit}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Submission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-border w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Close Button */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray hover:text-black p-1 transition-colors"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            <div className="mb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray block">Verified Feedback</span>
              <h4 className="text-lg font-black uppercase text-black">
                Review &ldquo;{productName}&rdquo;
              </h4>
            </div>

            {successMessage ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle size={24} />
                </div>
                <h5 className="text-base font-bold uppercase tracking-wider text-black">Review Submitted!</h5>
                <p className="text-xs text-gray">Thank you for helping the community with your feedback.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Star Rating Picker */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-black block mb-1.5">
                    Your Rating: {rating} / 5 Stars
                  </label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="p-1 text-black hover:scale-110 transition-transform"
                      >
                        <Star 
                          size={24} 
                          className={cn(
                            (hoverRating || rating) >= star ? "fill-black text-black" : "text-gray-300"
                          )} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name & City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700 block mb-1">
                      Your Name
                    </label>
                    <Input 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="e.g. Rahul M." 
                      required 
                      className="h-9 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700 block mb-1">
                      Your City
                    </label>
                    <Input 
                      value={city} 
                      onChange={(e) => setCity(e.target.value)} 
                      placeholder="e.g. Bangalore, Chennai" 
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                {/* Fit Opinion */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700 block mb-1.5">
                    How does it fit?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {fitOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setFit(opt)}
                        className={cn(
                          "py-2 px-2.5 text-[11px] font-bold uppercase tracking-tight text-center border transition-all",
                          fit === opt ? "bg-black text-white border-black" : "bg-white text-gray-700 border-border hover:border-black"
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review Headline */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700 block mb-1">
                    Headline
                  </label>
                  <Input 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="e.g. Outstanding fabric weight & collar structure" 
                    className="h-9 text-xs"
                  />
                </div>

                {/* Review Comment */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700 block mb-1">
                    Review Details
                  </label>
                  <Textarea 
                    value={comment} 
                    onChange={(e) => setComment(e.target.value)} 
                    placeholder="Share details about the fabric feel, drape, sizing, or styling..." 
                    rows={3} 
                    required 
                    className="text-xs leading-relaxed"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-2 flex gap-2">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 h-10 text-xs font-bold uppercase tracking-wider"
                  >
                    {submitting ? <Spinner size="sm" className="mr-2" /> : null}
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="h-10 text-xs font-bold uppercase tracking-wider"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
