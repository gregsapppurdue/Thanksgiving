import React from 'react';

export const RsvpSection: React.FC = () => {
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

      <div className="w-full max-w-2xl mx-auto">
        <iframe
          src="https://docs.google.com/forms/d/e/1FAIpQLSfCWOEg-TSgoKdMqSr47_3wtml452g4dUMzb2wiCG1iKEJoRw/viewform?embedded=true"
          width="100%"
          height="1466"
          frameBorder="0"
          marginHeight={0}
          marginWidth={0}
          loading="lazy"
          title="RSVP Form"
          className="w-full"
        >
          Loading…
        </iframe>
      </div>
    </div>
  );
};
