import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { API_ENDPOINTS } from '../../api/endpoints';
import toast from 'react-hot-toast';

import img7 from '../../assets/7.png';
import img8 from '../../assets/8.png';
import img6 from '../../assets/6.png';

const staticTestimonials = [
  {
    img: img7,
    name: 'Grace M.',
    role: 'Maize Farmer, Nakuru',
    quote: 'I used to sell at the market at 6am. Now orders come to my phone while I\'m still in the field.',
    rating: 5,
  },
  {
    img: img8,
    name: 'Amina W.',
    role: 'Smallholder Farmer, Kisumu',
    quote: '024 Global Connect helped me find buyers who pay fair prices. My income doubled this season.',
    rating: 5,
  },
  {
    img: img6,
    name: 'David K.',
    role: 'Horticulture Vendor, Nairobi',
    quote: 'I list my mangoes, track stock, and get paid — all from one platform. It changed everything.',
    rating: 5,
  },
];

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="text-3xl transition-transform hover:scale-110"
        >
          <span className={(hovered || value) >= star ? 'text-yellow-400' : 'text-gray-300'}>★</span>
        </button>
      ))}
    </div>
  );
}

function TestimonialCard({ img, name, role, quote, rating }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow p-6 flex flex-col gap-4 border border-gray-100">
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < rating ? 'text-yellow-400 text-lg' : 'text-gray-200 text-lg'}>★</span>
        ))}
      </div>
      <p className="text-gray-700 italic text-sm leading-relaxed flex-1">"{quote}"</p>
      <div className="flex items-center gap-3">
        <img src={img} alt={name} className="w-12 h-12 rounded-full object-cover border-2 border-blue-100" />
        <div>
          <p className="font-bold text-gray-900 text-sm">{name}</p>
          <p className="text-blue-600 text-xs font-medium">{role}</p>
        </div>
      </div>
    </div>
  );
}

const Feedback = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to leave feedback');
      navigate('/login');
      return;
    }
    if (rating === 0) {
      toast.error('Please select a star rating');
      return;
    }
    if (!message.trim()) {
      toast.error('Please write a message');
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post(API_ENDPOINTS.VENDOR_FEEDBACK, { rating, feedback: message });
      setSubmitted(true);
      setRating(0);
      setMessage('');
      toast.success('Thank you for your feedback!');
    } catch {
      toast.error('Could not submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-4">

        {/* Section header */}
        <div className="text-center mb-12">
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Real People. Real Impact.</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">What Our Community Says</h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            Thousands of farmers, vendors, and buyers trust 024 Global Connect every day.
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-14">
          {staticTestimonials.map(t => <TestimonialCard key={t.name} {...t} />)}
        </div>

        {/* Feedback form */}
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-2xl font-extrabold text-gray-900 mb-1">Share Your Experience</h3>
          <p className="text-gray-500 text-sm mb-6">Your feedback helps us improve for everyone.</p>

          {submitted ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">🎉</div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Thank you for your feedback!</h4>
              <p className="text-gray-500 text-sm mb-6">Your response has been recorded. We appreciate your support.</p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition text-sm"
              >
                Leave Another Feedback
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Star rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                <StarRating value={rating} onChange={setRating} />
                {rating > 0 && (
                  <p className="text-blue-600 text-xs mt-1 font-medium">
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                  </p>
                )}
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Message</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Tell us about your experience with 024 Global Connect..."
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                />
              </div>

              {/* Auth notice */}
              {!user && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-blue-700 text-sm flex items-center gap-2">
                  <span>ℹ️</span>
                  <span>You need to <button type="button" onClick={() => navigate('/login')} className="font-bold underline">log in</button> to submit feedback.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-3 rounded-xl text-white font-bold text-sm transition ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          )}
        </div>

      </div>
    </section>
  );
};

export default Feedback;
