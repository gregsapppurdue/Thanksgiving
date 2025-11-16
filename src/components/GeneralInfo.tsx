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
      <div className="mb-6 rounded-lg overflow-hidden max-w-2xl mx-auto">
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
            Thursday, November 27 · Arrive 4:00 PM · Dinner 5:00 PM (Sharp!)
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-sage">Location</dt>
          <dd className="text-sage/90">
            Greg Sapp Apartment
            <br />
            400 N 9th St Rd Apt 404
            <br />
            Lafayette, IN 47904
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-sage">Dress Code</dt>
          <dd className="text-sage/90">
            Warm, comfortable clothing is encouraged—think cozy fall layers suitable for a relaxed Thanksgiving gathering. Bonus points for wearing fall colors like deep reds, oranges, golds, or browns!
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-sage">Extras</dt>
          <dd className="text-sage/90">
            Feel free to bring a favorite drink or a treat from your home country to share. It&apos;s optional—just a fun way to celebrate Thanksgiving while enjoying the diversity, flavors, and traditions of our MBT community.
          </dd>
        </div>
      </dl>
    </div>
  );
};


