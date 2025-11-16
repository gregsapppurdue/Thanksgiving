import React from 'react';

export const GeneralInfo: React.FC = () => {
  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl shadow-md border border-amber-100 p-6 md:p-8">
      <h2 className="text-2xl md:text-3xl font-serif font-semibold text-pumpkin mb-4 flex items-center gap-2">
        <span>Gather Around the Table</span>
        <span className="text-2xl" aria-hidden="true">
          🦃
        </span>
      </h2>
      <div className="mb-6 rounded-lg overflow-hidden">
        <img
          src="/Images/Thanksgiving Main.png"
          alt="Thanksgiving dinner table"
          className="w-full h-auto object-cover"
        />
      </div>
      <p className="text-sm md:text-base text-sage/90 mb-6 leading-relaxed">
        Join Greg Sapp for a warm and authentic American Thanksgiving feast, thoughtfully prepared to share the flavors, traditions, and cultural meaning of this uniquely American holiday. This gathering is especially designed to welcome Purdue MBT students and international friends who may be experiencing Thanksgiving for the first time.
      </p>
      <p className="text-sm md:text-base text-sage/90 mb-6 leading-relaxed">
        Together, we&apos;ll enjoy a curated selection of classic Thanksgiving dishes—each rooted in history and representing the spirit of gratitude, community, and harvest that defines the holiday. The evening will blend good food, great conversation, and genuine connection as we celebrate together across cultures.
      </p>

      <dl className="grid gap-4 md:grid-cols-2 text-sm md:text-base">
        <div>
          <dt className="font-semibold text-sage">Date &amp; Time</dt>
          <dd className="text-sage/90">
            Thursday, November 27 · Arrivals from 4:30 PM · Dinner at 5:30 PM
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-sage">Location</dt>
          <dd className="text-sage/90">
            123 Harvest Lane
            <br />
            Maple Grove, USA
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-sage">Dress Code</dt>
          <dd className="text-sage/90">Cozy casual &mdash; sweaters, flannels, and comfy shoes welcome.</dd>
        </div>
        <div>
          <dt className="font-semibold text-sage">Extras</dt>
          <dd className="text-sage/90">
            Kids are welcome. Board games, stories, and stretchy pants encouraged.
          </dd>
        </div>
      </dl>
    </div>
  );
};


