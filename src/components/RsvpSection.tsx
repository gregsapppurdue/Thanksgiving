import React, { useState, useEffect } from 'react';
import { fetchRsvps, submitRsvp } from '../services/rsvpService';

interface Rsvp {
  id: string;
  name: string;
  email: string;
  phone?: string;
  item: string;
  dietaryRestrictions?: string;
  submittedAt: string;
}

export const RsvpSection: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [item, setItem] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadRsvps();
  }, []);

  const loadRsvps = async () => {
    try {
      const data = await fetchRsvps();
      setRsvps(data);
    } catch (err) {
      console.error('Failed to load RSVPs:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Client-side validation
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!item.trim()) {
      setError('Please specify what you\'re bringing');
      return;
    }

    setIsSubmitting(true);

    try {
      await submitRsvp({ name, email, phone, item, dietaryRestrictions });
      setSuccess(true);
      setName('');
      setEmail('');
      setPhone('');
      setItem('');
      setDietaryRestrictions('');
      await loadRsvps(); // Refresh the list
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit RSVP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl shadow-md border border-amber-100 p-6 md:p-8">
      <h2 className="text-2xl md:text-3xl font-serif font-semibold text-pumpkin mb-6 flex items-center gap-2">
        <span>RSVP and Bring a Drink</span>
        <span className="text-2xl" aria-hidden="true">
          ✉️
        </span>
      </h2>
      <p className="text-sm md:text-base text-sage/90 mb-6">
        Let us know you&apos;re coming and what you&apos;d like to bring to share!
      </p>

      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-sage mb-1">
            Your Name <span className="text-pumpkin">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pumpkin focus:border-transparent text-sage"
            placeholder="John Doe"
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-sage mb-1">
            Email (optional)
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pumpkin focus:border-transparent text-sage"
            placeholder="john@example.com"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-sage mb-1">
            Phone Number (optional)
          </label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pumpkin focus:border-transparent text-sage"
            placeholder="+1 (555) 123-4567"
            disabled={isSubmitting}
          />
          <p className="text-xs text-sage/70 mt-1">
            For WhatsApp group messages and event updates
          </p>
        </div>

        <div>
          <label htmlFor="item" className="block text-sm font-semibold text-sage mb-1">
            What You&apos;re Bringing <span className="text-pumpkin">*</span>
          </label>
          <input
            type="text"
            id="item"
            value={item}
            onChange={(e) => setItem(e.target.value)}
            className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pumpkin focus:border-transparent text-sage"
            placeholder="e.g., Apple Pie, Wine, Salad"
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="dietaryRestrictions" className="block text-sm font-semibold text-sage mb-1">
            Special Dietary Restrictions (optional)
          </label>
          <textarea
            id="dietaryRestrictions"
            value={dietaryRestrictions}
            onChange={(e) => setDietaryRestrictions(e.target.value)}
            className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pumpkin focus:border-transparent text-sage resize-y min-h-[80px]"
            placeholder="e.g., Vegetarian, Gluten-free, Nut allergies, etc."
            disabled={isSubmitting}
            rows={3}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            Thank you! Your RSVP has been recorded. We&apos;re excited to see you!
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
            isSubmitting
              ? 'bg-amber-400 cursor-not-allowed'
              : 'bg-pumpkin hover:bg-maple shadow-md hover:shadow-lg transform hover:scale-105'
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit RSVP'}
        </button>
      </form>

      <div>
        <h3 className="text-xl font-serif font-semibold text-maple mb-4 border-b border-amber-200 pb-2">
          Who&apos;s Coming
        </h3>
        {rsvps.length === 0 ? (
          <p className="text-sage/70 text-sm italic">No RSVPs yet. Be the first to sign up!</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {rsvps.map((rsvp) => (
              <div
                key={rsvp.id}
                className="bg-amber-50 border border-amber-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <p className="font-semibold text-sage mb-1">{rsvp.name}</p>
                <p className="text-sm text-sage/80 mb-1">
                  Bringing: <span className="font-medium text-pumpkin">{rsvp.item}</span>
                </p>
                {rsvp.dietaryRestrictions && (
                  <p className="text-xs text-sage/70 italic mt-2 pt-2 border-t border-amber-200">
                    Dietary: {rsvp.dietaryRestrictions}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

